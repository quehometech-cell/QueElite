import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured."
    );
  }

  return new Stripe(
    process.env.STRIPE_SECRET_KEY
  );
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

async function updateMembership(
  supabaseAdmin,
  userId,
  status
) {
  if (!userId) {
    throw new Error(
      "Missing Supabase user ID."
    );
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

async function findUserIdFromSubscription(
  supabaseAdmin,
  subscription
) {
  const metadataUserId =
    subscription?.metadata?.supabase_user_id;

  if (metadataUserId) {
    return metadataUserId;
  }

  if (subscription?.id) {
    const { data, error } =
      await supabaseAdmin
        .from("client_packages")
        .select("user_id")
        .eq(
          "stripe_subscription_id",
          subscription.id
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.user_id) {
      return data.user_id;
    }
  }

  return null;
}

async function getPackageFromPrice(
  supabaseAdmin,
  priceId
) {
  if (!priceId) {
    return null;
  }

  const { data, error } =
    await supabaseAdmin
      .from("coaching_packages")
      .select(
        "id, name, stripe_price_id, duration_weeks, is_active"
      )
      .eq("stripe_price_id", priceId)
      .eq("is_active", true)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function activateClientPackage({
  supabaseAdmin,
  userId,
  packageId,
  subscriptionId,
}) {
  if (!userId || !packageId) {
    throw new Error(
      "Missing user or package for package activation."
    );
  }

  const today = new Date();
  const startDate = today
    .toISOString()
    .slice(0, 10);

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
      .update({
        status: "active",
        start_date: startDate,
        end_date: null,
        stripe_subscription_id:
          subscriptionId || null,
        updated_at: new Date().toISOString(),
      })
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
      status: "active",
      start_date: startDate,
      end_date: null,
      stripe_subscription_id:
        subscriptionId || null,
    });

  if (error) {
    throw error;
  }
}

async function deactivateSubscriptionPackage({
  supabaseAdmin,
  userId,
  subscriptionId,
}) {
  if (!userId) {
    throw new Error(
      "Missing user for package deactivation."
    );
  }

  let query = supabaseAdmin
    .from("client_packages")
    .update({
      status: "inactive",
      end_date: new Date()
        .toISOString()
        .slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("status", "active");

  if (subscriptionId) {
    query = query.eq(
      "stripe_subscription_id",
      subscriptionId
    );
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

async function getSubscriptionPriceId(
  stripe,
  subscriptionId
) {
  if (!subscriptionId) {
    return null;
  }

  const subscription =
    await stripe.subscriptions.retrieve(
      subscriptionId
    );

  return (
    subscription.items?.data?.[0]?.price?.id ||
    null
  );
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
        const session =
          event.data.object;

        if (
          session.mode !== "subscription"
        ) {
          break;
        }

        const userId =
          session.metadata
            ?.supabase_user_id ||
          session.client_reference_id;

        if (!userId) {
          throw new Error(
            "Checkout session is missing the Supabase user ID."
          );
        }

        if (
          session.payment_status !== "paid"
        ) {
          break;
        }

        const subscriptionId =
          typeof session.subscription ===
          "string"
            ? session.subscription
            : session.subscription?.id;

        const priceId =
          await getSubscriptionPriceId(
            stripe,
            subscriptionId
          );

        const coachingPackage =
          await getPackageFromPrice(
            supabaseAdmin,
            priceId
          );

        if (!coachingPackage) {
          throw new Error(
            `No active coaching package is configured for Stripe price ${priceId}.`
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
          packageId:
            coachingPackage.id,
          subscriptionId,
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription =
          event.data.object;

        const userId =
          await findUserIdFromSubscription(
            supabaseAdmin,
            subscription
          );

        if (!userId) {
          console.warn(
            "Unable to identify Supabase user for subscription:",
            subscription.id
          );
          break;
        }

        const activeStatuses = [
          "active",
          "trialing",
        ];

        const isActive =
          activeStatuses.includes(
            subscription.status
          );

        await updateMembership(
          supabaseAdmin,
          userId,
          isActive
            ? "active"
            : "inactive"
        );

        if (isActive) {
          const priceId =
            subscription.items?.data?.[0]
              ?.price?.id;

          const coachingPackage =
            await getPackageFromPrice(
              supabaseAdmin,
              priceId
            );

          if (coachingPackage) {
            await activateClientPackage({
              supabaseAdmin,
              userId,
              packageId:
                coachingPackage.id,
              subscriptionId:
                subscription.id,
            });
          }
        } else {
          await deactivateSubscriptionPackage({
            supabaseAdmin,
            userId,
            subscriptionId:
              subscription.id,
          });
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription =
          event.data.object;

        const userId =
          await findUserIdFromSubscription(
            supabaseAdmin,
            subscription
          );

        if (!userId) {
          console.warn(
            "Unable to identify Supabase user for deleted subscription:",
            subscription.id
          );
          break;
        }

        await updateMembership(
          supabaseAdmin,
          userId,
          "inactive"
        );

        await deactivateSubscriptionPackage({
          supabaseAdmin,
          userId,
          subscriptionId:
            subscription.id,
        });

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
