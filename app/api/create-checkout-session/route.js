import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const PACKAGES = {
  4: {
    weeks: 4,
    packageId: 2,
    name: "4-Week Coaching Kickstart",
    priceId: "price_1UI5TYAqc3ss0YxT4VQiMh8K",
    paymentNumber: 1,
    totalPayments: 1,
    totalCents: 14900,
    splitPayment: false,
  },

  6: {
    weeks: 6,
    packageId: 3,
    name: "6-Week Coaching",
    priceId: "price_1UI5UBAqc3ss0YxTfGcNHEM",
    paymentNumber: 1,
    totalPayments: 1,
    totalCents: 19900,
    splitPayment: false,
  },

  8: {
    weeks: 8,
    packageId: 4,
    name: "8-Week Transformation Coaching",
    priceId: "price_1UI5V1Aqc3ss0YxTGynVQvry",
    paymentNumber: 1,
    totalPayments: 2,
    totalCents: 49800,
    splitPayment: true,
  },

  12: {
    weeks: 12,
    packageId: 1,
    name: "12-Week Transformation Coaching",
    priceId: "price_1UI5VIAqc3ss0YxTO7Wm4HvN",
    paymentNumber: 1,
    totalPayments: 2,
    totalCents: 69800,
    splitPayment: true,
  },
};

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured."
    );
  }

  return new Stripe(
    process.env.STRIPE_SECRET_KEY
  );
};

const getSupabaseAdmin = () => {
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
};

export async function POST(request) {
  try {
    const stripe = getStripe();
    const supabaseAdmin =
      getSupabaseAdmin();

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization?.startsWith("Bearer ")
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

    const accessToken =
      authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      return Response.json(
        {
          error:
            "Invalid or expired session",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request
      .json()
      .catch(() => ({}));

    const selectedWeeks = Number(
      body?.packageWeeks
    );

    const selectedPackage =
      PACKAGES[selectedWeeks];

    if (!selectedPackage) {
      return Response.json(
        {
          error:
            "Invalid coaching package selected.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * For 8/12-week split-payment plans we
     * create/reuse a Stripe Customer.
     *
     * This is necessary because payment #2
     * will be charged later using the saved
     * payment method from payment #1.
     */

    let stripeCustomerId = null;

    if (selectedPackage.splitPayment) {
      /*
       * First check whether this Supabase
       * user already has a Stripe customer
       * stored on a previous package.
       */

      const {
        data: existingPackage,
        error: existingPackageError,
      } = await supabaseAdmin
        .from("client_packages")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .not(
          "stripe_customer_id",
          "is",
          null
        )
        .limit(1)
        .maybeSingle();

      if (existingPackageError) {
        throw existingPackageError;
      }

      stripeCustomerId =
        existingPackage?.stripe_customer_id ||
        null;

      /*
       * If there is no existing Stripe
       * customer, create one.
       */

      if (!stripeCustomerId) {
        const customer =
          await stripe.customers.create({
            email: user.email,

            metadata: {
              supabase_user_id: user.id,
            },
          });

        stripeCustomerId = customer.id;
      }
    }

    const metadata = {
      supabase_user_id: user.id,

      package_id: String(
        selectedPackage.packageId
      ),

      package_weeks: String(
        selectedPackage.weeks
      ),

      package_name:
        selectedPackage.name,

      payment_number: String(
        selectedPackage.paymentNumber
      ),

      total_payments: String(
        selectedPackage.totalPayments
      ),

      total_commitment_cents: String(
        selectedPackage.totalCents
      ),

      payment_plan:
        selectedPackage.splitPayment
          ? "split"
          : "paid_in_full",
    };

    const checkoutConfig = {
      mode: "payment",

      line_items: [
        {
          price: selectedPackage.priceId,
          quantity: 1,
        },
      ],

      client_reference_id: user.id,

      metadata,

      payment_intent_data: {
        metadata,
      },

      success_url:
        `https://www.getcharightfitness.com/payment-success?session_id={CHECKOUT_SESSION_ID}&package=${selectedPackage.weeks}`,

      cancel_url:
        `https://www.getcharightfitness.com/checkout?package=${selectedPackage.weeks}`,

      allow_promotion_codes: true,
    };

    /*
     * SPLIT PAYMENT
     *
     * Attach checkout to the Stripe Customer
     * and tell Stripe to save the payment
     * method for future off-session use.
     */

    if (selectedPackage.splitPayment) {
      checkoutConfig.customer =
        stripeCustomerId;

      checkoutConfig.payment_intent_data = {
        ...checkoutConfig.payment_intent_data,

        setup_future_usage:
          "off_session",
      };
    } else {
      /*
       * 4/6-week packages are fully paid
       * during checkout, so no future
       * automatic charge is required.
       */

      checkoutConfig.customer_email =
        user.email;
    }

    const session =
      await stripe.checkout.sessions.create(
        checkoutConfig
      );

    return Response.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Stripe checkout error:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to create checkout session",
      },
      {
        status: 500,
      }
    );
  }
}
