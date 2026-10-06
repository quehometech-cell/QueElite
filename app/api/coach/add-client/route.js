import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function userClient(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function makeTempPassword() {
  const id = crypto.randomUUID().replace(/-/g, "");
  return `GCR!${id.slice(0, 5)}aA9${id.slice(5, 10)}`;
}

export async function POST(req) {
  let createdUserId = null;

  try {
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const authed = userClient(token);
    const { data: { user }, error: authError } = await authed.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = adminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || !["coach", "admin"].includes(profile.role)) {
      return Response.json({ error: "Coach access required." }, { status: 403 });
    }

    const { data: workspace } = await admin
      .from("coach_workspaces")
      .select("id, owner_id, subscription_status, client_limit")
      .eq("owner_id", user.id)
      .single();

    if (!workspace || workspace.owner_id !== user.id) {
      return Response.json({ error: "Only the workspace owner can manually add clients." }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.fullName || "").trim();
    const requestedPassword = String(body.tempPassword || "").trim();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Enter a valid client email." }, { status: 400 });
    }
    if (!fullName) {
      return Response.json({ error: "Enter the client's name." }, { status: 400 });
    }
    if (requestedPassword && requestedPassword.length < 8) {
      return Response.json({ error: "Temporary password must be at least 8 characters." }, { status: 400 });
    }

    const { count: activeCount } = await admin
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .eq("workspace_role", "client")
      .eq("status", "active");

    if (workspace.client_limit != null && Number(activeCount || 0) >= Number(workspace.client_limit)) {
      return Response.json({ error: "Client limit reached." }, { status: 403 });
    }

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .maybeSingle();

    let clientId = existingProfile?.id || null;
    let tempPassword = null;
    let accountCreated = false;

    if (!clientId) {
      tempPassword = requestedPassword || makeTempPassword();
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (createError || !created?.user) {
        return Response.json({ error: createError?.message || "Unable to create client account." }, { status: 400 });
      }

      clientId = created.user.id;
      createdUserId = clientId;
      accountCreated = true;

      const { error: profileError } = await admin
        .from("profiles")
        .upsert({
          id: clientId,
          full_name: fullName,
          email,
          membership_status: "active",
          role: "member",
        }, { onConflict: "id" });

      if (profileError) throw profileError;
    } else {
      if (["coach", "admin"].includes(existingProfile.role)) {
        return Response.json({ error: "That email belongs to a coach/admin account and cannot be added as a client." }, { status: 400 });
      }

      await admin
        .from("profiles")
        .update({ full_name: fullName, membership_status: "active" })
        .eq("id", clientId);
    }

    const { data: existingMember } = await admin
      .from("workspace_members")
      .select("id, status")
      .eq("workspace_id", workspace.id)
      .eq("user_id", clientId)
      .maybeSingle();

    if (existingMember?.id) {
      await admin
        .from("workspace_members")
        .update({ workspace_role: "client", status: "active" })
        .eq("id", existingMember.id);
    } else {
      const { error: memberError } = await admin
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: clientId,
          workspace_role: "client",
          status: "active",
        });
      if (memberError) throw memberError;
    }

    await admin
      .from("workspace_invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("workspace_id", workspace.id)
      .eq("email", email)
      .eq("status", "pending");

    return Response.json({
      success: true,
      clientId,
      email,
      fullName,
      accountCreated,
      tempPassword,
      message: accountCreated
        ? "Client account created and added to your workspace."
        : "Existing client account added to your workspace.",
    });
  } catch (error) {
    console.error("Manual client add error:", error);
    return Response.json({ error: error?.message || "Unable to add client." }, { status: 500 });
  }
}
