import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function userClient(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

export async function POST(req) {
  try {
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const authed = userClient(token);
    const { data: { user }, error: authError } = await authed.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = adminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile || !["coach", "admin"].includes(profile.role)) {
      return Response.json({ error: "Coach access required." }, { status: 403 });
    }

    const { data: workspace, error: workspaceError } = await admin
      .from("coach_workspaces")
      .select("id, owner_id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (workspaceError) throw workspaceError;
    if (!workspace) return Response.json({ error: "Coach workspace not found." }, { status: 404 });

    const body = await req.json();
    const clientId = String(body.clientId || "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientId)) {
      return Response.json({ error: "A valid client must be selected." }, { status: 400 });
    }
    if (clientId === user.id) {
      return Response.json({ error: "Your owner account cannot be removed from its own workspace." }, { status: 400 });
    }

    const { data: membership, error: membershipError } = await admin
      .from("workspace_members")
      .select("id, status, workspace_role")
      .eq("workspace_id", workspace.id)
      .eq("user_id", clientId)
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (!membership || membership.workspace_role !== "client") {
      return Response.json({ error: "This account is not a client in your workspace." }, { status: 404 });
    }
    if (membership.status !== "active") {
      return Response.json({ error: "This client is already inactive in your workspace." }, { status: 409 });
    }

    // Revoke this workspace relationship only. Preserve the client's login,
    // profile, progress history, and records so nothing is permanently erased.
    const { error: updateError } = await admin
      .from("workspace_members")
      .update({ status: "inactive" })
      .eq("id", membership.id)
      .eq("workspace_id", workspace.id);

    if (updateError) throw updateError;

    return Response.json({ success: true, clientId, message: "Client access to this coaching workspace has been removed. Their account and training history were preserved." });
  } catch (error) {
    console.error("Remove client error:", error);
    return Response.json({ error: error?.message || "Unable to remove this client." }, { status: 500 });
  }
}
