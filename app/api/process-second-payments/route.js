import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getSupabaseAdmin() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Supabase server environment variables are not configured."
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function getTodayUTC() {
  return new Date().toISOString().slice(0, 10);
}

async function getSavedPaymentMethod(
  stripe,
  customerId
) {
  /*
   * The first 8/12-week Checkout Session uses
   * setup_future_usage = "off_session".
   *
   * Retrieve the customer's saved card so it can
   * be used for payment #2.
   */

  const customer =
    await stripe.customers.retrieve(
      customerId
    );

  if (customer.deleted) {
    throw new Error(
      `Stripe customer ${customerId} has been deleted.`
    );
  }

  const defaultPaymentMethod =
    customer.invoice_settings
      ?.default_payment_method;

  if (typeof defaultPaymentMethod === "string") {
    return defaultPaymentMethod;
  }

  if (defaultPaymentMethod?.id) {
    return defaultPaymentMethod.id;
  }

  /*
   * Checkout may have attached the payment
   * method to the customer without setting it as
   * the invoice default. If so, use the newest
   * attached card.
   */

  const paymentMethods =
    await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 1,
    });

  if (!paymentMethods.data.length) {
    throw new Error(
      `No saved payment method found for Stripe customer ${customerId}.`
    );
  }

  return paymentMethods.data[0].id;
}

async function processClientPackage({
  stripe,
  supabaseAdmin,
  clientPackage,
}) {
  /*
   * Protection #1:
   * If payment #2 is already complete, do nothing.
   */

  if (
    Number(clientPackage.payments_completed) >= 2
  ) {
    return {
      id: clientPackage.id,
      status: "already_paid",
    };
  }

  /*
   * Protection #2:
   * If we've already created a PaymentIntent for
   * this second payment, don't create another one.
   */

  if (
    clientPackage.second_payment_intent_id
  ) {
    const existingPaymentIntent =
      await stripe.paymentIntents.retrieve(
        clientPackage.second_payment_intent_id
      );

    if (
      existingPaymentIntent.status ===
      "succeeded"
    ) {
      /*
       * Normally the webhook handles this.
       * This fallback repairs the database if the
       * webhook was delayed or temporarily failed.
       */

      const { error } = await supabaseAdmin
        .from("client_packages")
        .update({
          payments_completed: 2,
          payment_status: "paid_in_full",
          next_payment_date: null,
          next_payment_amount_cents: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientPackage.id);

      if (error) {
        throw error;
      }

      return {
        id: clientPackage.id,
        status: "paid",
      };
    }

    return {
      id: clientPackage.id,
      status: existingPaymentIntent.status,
    };
  }

  if (!clientPackage.stripe_customer_id) {
    throw new Error(
      `Client package ${clientPackage.id} does not have a Stripe customer ID.`
    );
  }

  if (
    !clientPackage.next_payment_amount_cents
  ) {
    throw new Error(
      `Client package ${clientPackage.id} does not have a second-payment amount.`
    );
  }

  const paymentMethodId =
    await getSavedPaymentMethod(
      stripe,
      clientPackage.stripe_customer_id
    );

  const amount = Number(
    clientPackage.next_payment_amount_cents
  );

  /*
   * Create payment #2.
   *
   * confirm + off_session tells Stripe to attempt
   * the saved card immediately without requiring
   * the client to return to Checkout.
   *
   * The idempotency key prevents Stripe from
   * creating duplicate second payments if this
   * request is accidentally repeated.
   */

  let paymentIntent;

  try {
    paymentIntent =
      await stripe.paymentIntents.create(
        {
          amount,
          currency: "usd",

          customer:
            clientPackage.stripe_customer_id,

          payment_method:
            paymentMethodId,

          confirm: true,
          off_session: true,

          description:
            `Get Cha Right Fitness payment 2 of 2 - ${clientPackage.package_name}`,

          metadata: {
            supabase_user_id:
              clientPackage.user_id,

            client_package_id: String(
              clientPackage.id
            ),

            package_id: String(
              clientPackage.package_id
            ),

            package_weeks: String(
              clientPackage.duration_weeks
            ),

            payment_number: "2",
            total_payments: "2",
          },
        },
        {
          idempotencyKey:
            `client-package-${clientPackage.id}-payment-2`,
        }
      );
  } catch (error) {
    /*
     * Stripe can return a PaymentIntent inside
     * certain card/payment errors. Save its ID
     * when available so we never accidentally
     * create a duplicate charge.
     */

    const failedPaymentIntent =
      error?.payment_intent;

    if (failedPaymentIntent?.id) {
      await supabaseAdmin
        .from("client_packages")
        .update({
          second_payment_intent_id:
            failedPaymentIntent.id,

          payment_status:
            "second_payment_failed",

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", clientPackage.id);
    } else {
      await supabaseAdmin
        .from("client_packages")
        .update({
          payment_status:
            "second_payment_failed",

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", clientPackage.id);
    }

    throw error;
  }

  /*
   * Save the PaymentIntent immediately.
   * The webhook will separately confirm the
   * final success/failure state.
   */

  const updateData = {
    second_payment_intent_id:
      paymentIntent.id,

    updated_at: new Date().toISOString(),
  };

  if (paymentIntent.status === "succeeded") {
    updateData.payments_completed = 2;
    updateData.payment_status =
      "paid_in_full";
    updateData.next_payment_date = null;
    updateData.next_payment_amount_cents =
      null;
  } else {
    updateData.payment_status =
      "second_payment_processing";
  }

  const { error: updateError } =
    await supabaseAdmin
      .from("client_packages")
      .update(updateData)
      .eq("id", clientPackage.id);

  if (updateError) {
    throw updateError;
  }

  return {
    id: clientPackage.id,
    status: paymentIntent.status,
    paymentIntentId: paymentIntent.id,
  };
}

export async function POST(request) {
  try {
    /*
     * IMPORTANT:
     * This route cannot be publicly callable.
     *
     * Later, the automated scheduler will send
     * this secret when invoking the route.
     */

    const authorization =
      request.headers.get("authorization");

    if (
      !process.env.SECOND_PAYMENT_SECRET
    ) {
      throw new Error(
        "SECOND_PAYMENT_SECRET is not configured."
      );
    }

    if (
      authorization !==
      `Bearer ${process.env.SECOND_PAYMENT_SECRET}`
    ) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const stripe = getStripe();
    const supabaseAdmin =
      getSupabaseAdmin();

    const today = getTodayUTC();

    /*
     * Only retrieve active split-payment plans
     * whose second payment is due.
     */

    const {
      data: duePackages,
      error: duePackagesError,
    } = await supabaseAdmin
      .from("client_packages")
      .select(`
        id,
        user_id,
        package_id,
        status,
        stripe_customer_id,
        payment_plan,
        total_payments,
        payments_completed,
        next_payment_date,
        next_payment_amount_cents,
        payment_status,
        second_payment_intent_id,
        coaching_packages (
          name,
          duration_weeks
        )
      `)
      .eq("status", "active")
      .eq("payment_plan", "split")
      .eq("total_payments", 2)
      .lt("payments_completed", 2)
      .lte("next_payment_date", today);

    if (duePackagesError) {
      throw duePackagesError;
    }

    if (!duePackages?.length) {
      return Response.json({
        success: true,
        processed: 0,
        message:
          "No second payments are currently due.",
      });
    }

    const results = [];

    for (const row of duePackages) {
      const coachingPackage =
        Array.isArray(
          row.coaching_packages
        )
          ? row.coaching_packages[0]
          : row.coaching_packages;

      try {
        const result =
          await processClientPackage({
            stripe,
            supabaseAdmin,

            clientPackage: {
              ...row,

              package_name:
                coachingPackage?.name ||
                "Coaching",

              duration_weeks:
                coachingPackage
                  ?.duration_weeks ||
                "",
            },
          });

        results.push(result);
      } catch (error) {
        console.error(
          `Second payment failed for client package ${row.id}:`,
          error
        );

        results.push({
          id: row.id,
          status: "failed",
          error:
            error?.message ||
            "Payment failed",
        });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Second-payment processing error:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to process second payments",
      },
      {
        status: 500,
      }
    );
  }
}
