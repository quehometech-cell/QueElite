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

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

async function updateMembership(
  supabaseAdmin,
  userId,
  status
) {
  if (!userId) {
    throw new Error("Missing Supabase user ID.");
  }

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

async function activateClientPackage({
  supabaseAdmin,
  userId,
  packageId,
  packageWeeks,
  session,
}) {
  if (!userId || !packageId || !packageWeeks) {
    throw new Error(
      "Missing user, package, or duration for package activation."
    );
  }

  const today = new Date();

  const startDate = toDateString(today);
  const endDate = toDateString(
    addDays(today, packageWeeks * 7)
  );

  const isSplitPayment =
    packageWeeks === 8 || packageWeeks === 12;

  let nextPaymentDate = null;
  let nextPaymentAmountCents = null;

  if (packageWeeks === 8) {
    // Beginning of Week 5 = 4 weeks after start.
    nextPaymentDate = toDateString(
      addDays(today, 28)
    );
    nextPaymentAmountCents = 24900;
  }

  if (packageWeeks === 12) {
    // Beginning of Week 7 = 6 weeks after start.
    nextPaymentDate = toDateString(
      addDays(today, 42)
    );
    nextPaymentAmountCents = 34900;
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;

  const packageData = {
    status: "active",
    start_date: startDate,
    end_date: endDate,

    stripe_customer_id: stripeCustomerId,
    stripe_checkout_session_id: session.id,

    payment_plan: isSplitPayment
      ? "split"
      : "paid_in_full",

    total_payments: isSplitPayment ? 2 : 1,
    payments_completed: 1,

    next_payment_date: nextPaymentDate,
    next_payment_amount_cents:
      nextPaymentAmountCents,

    payment_status: isSplitPayment
      ? "first_payment_paid"
      : "paid_in_full",

    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: existingError } =
    await supabaseAdmin
      .from("client_packages")
      .select("id")
      .eq("user_id", userId)
      .eq("package_id", packageId)
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    const { error } = await supabaseAdmin
      .from("client_packages")
      .update(packageData)
      .eq("id", existing.id);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabaseAdmin
    .from("client_packages")
    .insert({
      user_id: userId,
      package_id: packageId,
      ...packageData,
    });

  if (error) {
    throw error;
  }
}

async function handlePackageCheckout({
  supabaseAdmin,
  session,
}) {
  if (session.payment_status !== "paid") {
    return;
  }

  const userId =
    session.metadata?.supabase_user_id ||
    session.client_reference_id;

  const packageId = Number(
    session.metadata?.package_id
  );

  const packageWeeks = Number(
    session.metadata?.package_weeks
  );

  if (!userId) {
    throw new Error(
      "Checkout session is missing the Supabase user ID."
    );
  }

  if (!packageId || !packageWeeks) {
    throw new Error(
      "Checkout session is missing package metadata."
    );
  }

  const { data: coachingPackage, error } =
    await supabaseAdmin
      .from("coaching_packages")
      .select(
        "id, name, duration_weeks, is_active"
      )
      .eq("id", packageId)
      .eq("is_active", true)
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!coachingPackage) {
    throw new Error(
      `No active coaching package found for package ID ${packageId}.`
    );
  }

  if (
    Number(coachingPackage.duration_weeks) !==
    packageWeeks
  ) {
    throw new Error(
      "Stripe package duration does not match the database package."
    );
  }

  await updateMembership(
    supabaseAdmin,
    userId,
    "active"
  );

  await activateClientPackage({
    supabaseAdmin,
    userId,
    packageId,
    packageWeeks,
    session,
  });
}

export async function POST(request) {
  try {
    const stripe = getStripe();
    const supabaseAdmin =
      getSupabaseAdmin();

    const signature =
      request.headers.get(
        "stripe-signature"
      );

    if (!signature) {
      return new Response(
        "Missing Stripe signature",
        {
          status: 400,
        }
      );
    }

    if (
      !process.env.STRIPE_WEBHOOK_SECRET
    ) {
      throw new Error(
        "STRIPE_WEBHOOK_SECRET is not configured."
      );
    }

    const body = await request.text();

    let event;

    try {
      event =
        stripe.webhooks.constructEvent(
          body,
          signature,
          process.env
            .STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
      console.error(
        "Webhook signature verification failed:",
        error.message
      );

      return new Response(
        "Invalid webhook signature",
        {
          status: 400,
        }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.mode === "payment") {
          await handlePackageCheckout({
            supabaseAdmin,
            session,
          });
        }

        break;
      }

      default:
        break;
    }

    return Response.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook error:",
      error
    );

    return new Response(
      "Webhook processing failed",
      {
        status: 500,
      }
    );
  }
}
