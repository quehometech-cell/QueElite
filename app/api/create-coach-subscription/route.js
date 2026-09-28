import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const PLANS = {
  starter: { price: "price_1UKKCtAqc3ss0YxTuXve5YVF", limit: 5 },
  coach: { price: "price_1UKKCvAqc3ss0YxTs9RQp4jy", limit: 20 },
  pro: { price: "price_1UKKCyAqc3ss0YxTZ9RLxKxL", limit: 50 },
  studio: { price: "price_1UKKD1Aqc3ss0YxTkEIhmu9y", limit: 100 },
};

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await request.json();
    const selected = PLANS[plan];
    if (!selected) return Response.json({ error: "Invalid coach plan" }, { status: 400 });

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data: workspace, error: workspaceError } = await admin.from("coach_workspaces").select("id,owner_id,stripe_customer_id,stripe_subscription_id,subscription_status").eq("owner_id", user.id).single();
    if (workspaceError || !workspace) return Response.json({ error: "Coach workspace not found" }, { status: 404 });
    if (workspace.stripe_subscription_id && ["active", "trialing"].includes(workspace.subscription_status)) {
      return Response.json({ error: "This coach workspace already has an active subscription.", alreadySubscribed: true }, { status: 409 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: workspace.stripe_customer_id || undefined,
      customer_email: workspace.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: selected.price, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { workspace_id: workspace.id, supabase_user_id: user.id, coach_plan: plan, client_limit: String(selected.limit) },
      },
      metadata: { checkout_type: "coach_subscription", workspace_id: workspace.id, supabase_user_id: user.id, coach_plan: plan, client_limit: String(selected.limit) },
      success_url: "https://www.getcharightfitness.com/coach?subscription=success",
      cancel_url: "https://www.getcharightfitness.com/for-coaches?checkout=canceled",
      allow_promotion_codes: true,
    });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Coach subscription checkout error:", error);
    return Response.json({ error: "Unable to start coach subscription checkout." }, { status: 500 });
  }
}
