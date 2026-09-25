import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function errorResponse(message, status = 400) {
  return Response.json(
    {
      ok: false,
      error: message,
    },
    { status }
  );
}

function getBearerToken(request) {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
}

export async function POST(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Authenticate user
    const token = getBearerToken(request);

    if (!token) {
      return errorResponse("You must be logged in.", 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return errorResponse("Your login session is invalid or expired.", 401);
    }

    // Verify coach account
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse("Unable to verify coach account.", 403);
    }

    if (!["coach", "admin"].includes(profile.role)) {
      return errorResponse("Only a coach can approve meal plans.", 403);
    }

    // Read request
    let body = {};

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid request body.", 400);
    }

    const mealPlanId = Number(body?.meal_plan_id);

    if (!Number.isInteger(mealPlanId) || mealPlanId <= 0) {
      return errorResponse("A valid meal plan ID is required.", 400);
    }

    // Verify pending meal plan
    const { data: mealPlan, error: mealPlanError } = await supabaseAdmin
      .from("meal_plans")
      .select("id, user_id, status, is_active")
      .eq("id", mealPlanId)
      .maybeSingle();

    if (mealPlanError) {
      throw mealPlanError;
    }

    if (!mealPlan) {
      return errorResponse("Meal plan not found.", 404);
    }

    if (mealPlan.status !== "pending_review") {
      return errorResponse(
        `This meal plan cannot be approved because its current status is "${mealPlan.status}".`,
        409
      );
    }

    // Approve through secure database function
    const { data: approved, error: approvalError } = await supabaseAdmin.rpc(
      "approve_generated_meal_plan",
      {
        p_meal_plan_id: mealPlanId,
        p_coach_id: user.id,
      }
    );

    if (approvalError) {
      throw approvalError;
    }

    if (!approved) {
      return errorResponse("Meal plan approval failed.", 500);
    }

    // Reload approved plan
    const { data: approvedPlan, error: reloadError } = await supabaseAdmin
      .from("meal_plans")
      .select(`
        id,
        user_id,
        nutrition_plan_id,
        name,
        description,
        calorie_target,
        protein_grams,
        carb_grams,
        fat_grams,
        days_per_week,
        is_active,
        start_date,
        end_date,
        coach_notes,
        status,
        generated_from_assessment_id,
        generated_at,
        approved_by,
        approved_at,
        generation_notes,
        created_at,
        updated_at
      `)
      .eq("id", mealPlanId)
      .single();

    if (reloadError) {
      throw reloadError;
    }

    return Response.json({
      ok: true,
      meal_plan: approvedPlan,
      message: "Meal plan approved and published successfully.",
    });
  } catch (error) {
    console.error("Meal plan approval error:", error);

    return errorResponse(
      error?.message || "Unable to approve meal plan.",
      500
    );
  }
}
