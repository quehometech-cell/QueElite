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

async function getSavedPaymentMethod(stripe, customerId) {
  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) {
    throw new Error(
      `Stripe customer ${customerId} has been deleted.`
    );
  }

  const defaultPaymentMethod =
    customer.invoice_settings?.default_payment_method;

  if (typeof defaultPaymentMethod === "string") {
    return defaultPaymentMethod;
  }

  if (defaultPaymentMethod?.id) {
    return defaultPaymentMethod.id;
  }

  const paymentMethods = await stripe.paymentMethods.list({
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
   * PAYMENT #2 ALREADY COMPLETED
   */
  if (Number(clientPackage.payments_completed) >= 2) {
    return {
      id: clientPackage.id,
      status: "already_paid",
    };
  }

  /*
   * If a second-payment PaymentIntent already
   * exists, never create another one.
   */
  if (clientPackage.second_payment_intent_id) {
    const existingPaymentIntent =
      await stripe.paymentIntents.retrieve(
        clientPackage.second_payment_intent_id
      );

    /*
     * Stripe says it succeeded but our database
     * has not caught up yet.
     */
    if (existingPaymentIntent.status === "succeeded") {
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

    /*
     * Do not create a duplicate charge.
     */
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

  if (!clientPackage.next_payment_amount_cents) {
    throw new Error(
      `Client package ${clientPackage.id} does not have a second-payment amount.`
    );
  }

  const paymentMethodId = await getSavedPaymentMethod(
    stripe,
    clientPackage.stripe_customer_id
  );

  const amount = Number(
    clientPackage.next_payment_amount_cents
  );

  let paymentIntent;

  try {
    /*
     * Charge payment #2 using the card/payment
     * method saved during payment #1.
     */
    paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "usd",

        customer: clientPackage.stripe_customer_id,

        payment_method: paymentMethodId,

        confirm: true,
        off_session: true,

        description:
          `Get Cha Right Fitness payment 2 of 2 - ${clientPackage.package_name}`,

        metadata: {
          supabase_user_id: clientPackage.user_id,

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
        /*
         * Stripe-level duplicate-charge
         * protection.
         */
        idempotencyKey:
          `client-package-${clientPackage.id}-payment-2`,
      }
    );
  } catch (error) {
    /*
     * Stripe may provide the failed PaymentIntent
     * when a card/payment attempt fails.
     */
    const failedPaymentIntent =
      error?.payment_intent;

    if (failedPaymentIntent?.id) {
      const { error: updateError } =
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

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: updateError } =
        await supabaseAdmin
          .from("client_packages")
          .update({
            payment_status:
              "second_payment_failed",

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", clientPackage.id);

      if (updateError) {
        throw updateError;
      }
    }

    throw error;
  }

  /*
   * Store the PaymentIntent immediately.
   * The Stripe webhook also independently
   * processes success/failure.
   */
  const updateData = {
    second_payment_intent_id:
      paymentIntent.id,

    updated_at: new Date().toISOString(),
  };

  if (paymentIntent.status === "succeeded") {
    updateData.payments_completed = 2;
    updateData.payment_status = "paid_in_full";
    updateData.next_payment_date = null;
    updateData.next_payment_amount_cents = null;
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

async function processSecondPayments(request) {
  try {
    /*
     * VERCEL CRON AUTHENTICATION
     *
     * Vercel sends:
     *
     * Authorization: Bearer <CRON_SECRET>
     */
    const authorization =
      request.headers.get("authorization");

    if (!process.env.CRON_SECRET) {
      throw new Error(
        "CRON_SECRET is not configured."
      );
    }

    if (
      authorization !==
      `Bearer ${process.env.CRON_SECRET}`
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
    const supabaseAdmin = getSupabaseAdmin();

    const today = getTodayUTC();

    /*
     * Only retrieve:
     *
     * - active packages
     * - split-payment packages
     * - plans with payment #2 incomplete
     * - plans due today OR overdue
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

    /*
     * A daily run with nothing due is normal.
     */
    if (!duePackages?.length) {
      return Response.json({
        success: true,
        processed: 0,
        message:
          "No second payments are currently due.",
      });
    }

    const results = [];

    /*
     * Process clients independently.
     *
     * One failed card should not prevent another
     * client's payment from being processed.
     */
    for (const row of duePackages) {
      const coachingPackage =
        Array.isArray(row.coaching_packages)
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
                  ?.duration_weeks || "",
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

/*
 * Vercel Cron calls the endpoint using GET.
 */
export async function GET(request) {
  return processSecondPayments(request);
}

/*
 * Keep POST available as well.
 *
 * It uses the exact same CRON_SECRET protection,
 * so the processor is not publicly accessible.
 */
export async function POST(request) {
  return processSecondPayments(request);
}
