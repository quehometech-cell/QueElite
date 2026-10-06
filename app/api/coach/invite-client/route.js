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

export async function POST(req) {
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
      .select("id, owner_id, name, brand_name, subscription_status")
      .eq("owner_id", user.id)
      .single();

    if (!workspace || workspace.owner_id !== user.id) {
      return Response.json({ error: "Only the workspace owner can invite clients." }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.fullName || "").trim();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Enter a valid client email." }, { status: 400 });
    }

    const { data: inviteId, error: inviteError } = await authed.rpc("create_client_invite", {
      p_email: email,
    });

    if (inviteError) {
      return Response.json({ error: inviteError.message }, { status: 403 });
    }

    const setupUrl = `https://www.getcharightfitness.com/client-join?invite=${inviteId}`;

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile?.id) {
      return Response.json({
        success: true,
        emailSent: false,
        inviteUrl: setupUrl,
        message: "Invite created. This email already has an account, so send them the setup link or have them sign in first.",
      });
    }

    const { error: emailError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: setupUrl,
      data: {
        full_name: fullName || undefined,
        invited_to_workspace: workspace.id,
        business_name: workspace.brand_name || workspace.name || "Get Cha Right Fitness",
      },
    });

    if (emailError) {
      return Response.json({
        error: emailError.message || "Invite was created, but the email could not be sent.",
        inviteUrl: setupUrl,
      }, { status: 400 });
    }

    return Response.json({
      success: true,
      emailSent: true,
      email,
      inviteUrl: setupUrl,
      message: `Invite email sent to ${email}.`,
    });
  } catch (error) {
    console.error("Client invite email error:", error);
    return Response.json({ error: error?.message || "Unable to send invite email." }, { status: 500 });
  }
}
