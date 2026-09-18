import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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
    throw new Error("Supabase server environment variables are not configured.");
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
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: "price_1UH338Aqc3ss0YxT1k8OG9JX",
          quantity: 1,
        },
      ],

      customer_email: user.email,

      client_reference_id: user.id,

      metadata: {
        supabase_user_id: user.id,
      },

      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },

      success_url:
        "https://www.getcharightfitness.com/payment-success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://www.getcharightfitness.com/checkout",

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
