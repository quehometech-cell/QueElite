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
  },
  6: {
    weeks: 6,
    packageId: 3,
    name: "6-Week Coaching",
    priceId: "price_1UI5UBAqc3ss0YxTfGcNHEM",
    paymentNumber: 1,
    totalPayments: 1,
    totalCents: 19900,
  },
  8: {
    weeks: 8,
    packageId: 4,
    name: "8-Week Transformation Coaching",
    priceId: "price_1UI5V1Aqc3ss0YxTGynVQvry",
    paymentNumber: 1,
    totalPayments: 2,
    totalCents: 49800,
  },
  12: {
    weeks: 12,
    packageId: 1,
    name: "12-Week Transformation Coaching",
    priceId: "price_1UI5VIAqc3ss0YxTO7Wm4HvN",
    paymentNumber: 1,
    totalPayments: 2,
    totalCents: 69800,
  },
};

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
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
    const supabaseAdmin = getSupabaseAdmin();

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return Response.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const selectedWeeks = Number(body?.packageWeeks);

    const selectedPackage = PACKAGES[selectedWeeks];

    if (!selectedPackage) {
      return Response.json(
        { error: "Invalid coaching package selected." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price: selectedPackage.priceId,
          quantity: 1,
        },
      ],

      customer_email: user.email,

      client_reference_id: user.id,

      metadata: {
        supabase_user_id: user.id,
        package_id: String(selectedPackage.packageId),
        package_weeks: String(selectedPackage.weeks),
        package_name: selectedPackage.name,
        payment_number: String(selectedPackage.paymentNumber),
        total_payments: String(selectedPackage.totalPayments),
        total_commitment_cents: String(selectedPackage.totalCents),
      },

      payment_intent_data: {
        metadata: {
          supabase_user_id: user.id,
          package_id: String(selectedPackage.packageId),
          package_weeks: String(selectedPackage.weeks),
          package_name: selectedPackage.name,
          payment_number: String(selectedPackage.paymentNumber),
          total_payments: String(selectedPackage.totalPayments),
          total_commitment_cents: String(selectedPackage.totalCents),
        },
      },

      success_url:
        `https://www.getcharightfitness.com/payment-success?session_id={CHECKOUT_SESSION_ID}&package=${selectedPackage.weeks}`,

      cancel_url:
        `https://www.getcharightfitness.com/checkout?package=${selectedPackage.weeks}`,

      allow_promotion_codes: true,
    });

    return Response.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return Response.json(
      {
        error: "Unable to create checkout session",
      },
      { status: 500 }
    );
  }
}
