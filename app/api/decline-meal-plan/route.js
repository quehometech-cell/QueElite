import { coachOwnsClient } from "../../../lib/coach-access";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server environment variables are not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request) {
  try {
    const supabaseAdmin = getAdminClient();
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
    if (!token) return errorResponse("You must be logged in.", 401);

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return errorResponse("Your login session is invalid or expired.", 401);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles").select("id, role").eq("id", user.id).single();
    if (profileError || !profile || !["coach", "admin"].includes(profile.role)) {
      return errorResponse("Only an authorized coach can decline meal plans.", 403);
    }

    let body;
    try { body = await request.json(); } catch { return errorResponse("Invalid request body.", 400); }
    const mealPlanId = Number(body?.meal_plan_id);
    if (!Number.isInteger(mealPlanId) || mealPlanId <= 0) return errorResponse("A valid meal plan ID is required.", 400);

    const { data: mealPlan, error: planError } = await supabaseAdmin
      .from("meal_plans").select("id, user_id, status").eq("id", mealPlanId).maybeSingle();
    if (planError) throw planError;
    if (!mealPlan) return errorResponse("Meal plan not found.", 404);
    if (!(await coachOwnsClient(supabaseAdmin, user.id, mealPlan.user_id))) {
      return errorResponse("This client is not in your workspace.", 403);
    }
    if (mealPlan.status !== "pending_review") {
      return errorResponse("This meal plan is no longer awaiting review.", 409);
    }

    const { data: archived, error: updateError } = await supabaseAdmin
      .from("meal_plans")
      .update({ status: "archived", is_active: false, updated_at: new Date().toISOString() })
      .eq("id", mealPlanId)
      .eq("user_id", mealPlan.user_id)
      .eq("status", "pending_review")
      .select("id, status, is_active")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!archived) return errorResponse("The plan changed before it could be declined. Refresh and try again.", 409);

    return Response.json({ ok: true, meal_plan: archived, message: "Meal plan declined and removed from the review queue." });
  } catch (error) {
    console.error("Meal plan decline error:", error);
    return errorResponse(error?.message || "Unable to decline meal plan.", 500);
  }
}
