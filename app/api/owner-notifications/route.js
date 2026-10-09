import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

export async function GET(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user || user.id !== "31f26f66-f9be-47a4-aed9-bb3013755f51") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }
  const { data, error } = await admin.from("owner_notifications")
    .select("id,event_type,subject,body,status,attempts,last_error,created_at,sent_at")
    .order("created_at", { ascending: false }).limit(30);
  if (error) return Response.json({ error: "Unable to load notifications." }, { status: 500 });
  return Response.json({ notifications: data || [], emailConfigured: Boolean(process.env.BREVO_API_KEY) });
}
