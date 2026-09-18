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
}

async function updateMembership(userId, status) {
  if (!userId) {
    throw new Error("Missing Supabase user ID.");
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      membership_status: status,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function POST(request) {
  try {
    const stripe = getStripe();

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing Stripe signature", {
        status: 400,
      });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    }

    const body = await request.text();

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error.message);

      return new Response("Invalid webhook signature", {
        status: 400,
      });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.mode !== "subscription") {
          break;
        }

        const userId =
          session.metadata?.supabase_user_id ||
          session.client_reference_id;

        if (session.payment_status === "paid") {
          await updateMembership(userId, "active");
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        const activeStatuses = ["active", "trialing"];

        await updateMembership(
          userId,
          activeStatuses.includes(subscription.status)
            ? "active"
            : "inactive"
        );

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        await updateMembership(userId, "inactive");

        break;
      }

      default:
        break;
    }

    return Response.json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return new Response("Webhook processing failed", {
      status: 500,
    });
  }
}
