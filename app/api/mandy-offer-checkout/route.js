import Stripe from "stripe";

const PLANS = {
  foundation: { price: "price_1UPrwoAqc3ss0YxTg6ItGGCF", name: "Foundation Training" },
  personalized: { price: "price_1UPrwpAqc3ss0YxTMQwPwRL6", name: "Personalized Coaching" },
  hybrid: { price: "price_1UPrwrAqc3ss0YxT87ifICkg", name: "Premium Hybrid Coaching" },
};

export async function GET(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response("Checkout is temporarily unavailable.", { status: 503 });
    }
    const { searchParams } = new URL(request.url);
    const planKey = searchParams.get("plan");
    const plan = PLANS[planKey];
    if (!plan) {
      return new Response("Please choose a valid coaching plan.", { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plan.price, quantity: 1 }],
      discounts: [{ coupon: "MANDY10" }],
      customer_creation: "always",
      metadata: {
        campaign: "MANDY10 shared offer",
        selected_plan: plan.name,
        discount_scope: "first_payment_only",
      },
      subscription_data: {
        metadata: {
          campaign: "MANDY10 shared offer",
          selected_plan: plan.name,
          discount_scope: "first_payment_only",
        },
      },
      success_url: "https://www.getcharightfitness.com/discount-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.getcharightfitness.com/mandy-offer",
    });

    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error("Mandy offer checkout error:", error);
    return new Response("Unable to open checkout right now. Please try again shortly.", { status: 500 });
  }
}
