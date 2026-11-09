import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

function clean(v, n = 500) {
  return typeof v === "string" ? v.trim().slice(0, n) : null;
}

async function notifyOwner(admin, lead) {
  const eventKey = `free-preview-lead-${lead.id}`;
  const subject = `New 3-Day Coaching Preview: ${lead.first_name}`;
  const body = [
    `${lead.first_name} requested the free 3-Day Coaching Preview.`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "Not provided"}`,
    `Goal: ${lead.primary_goal || "Not specified"}`,
    `Training location: ${lead.training_location || "Not specified"}`,
    `Experience / time / days: ${lead.biggest_obstacle || "Not specified"}`,
    `Source: ${lead.source || "Website"}`,
    "",
    "Follow up promptly while the lead is interested."
  ].join("\n");

  const { data: queued, error: queueError } = await admin
    .from("owner_notifications")
    .upsert({
      event_key: eventKey,
      event_type: "new_preview_lead",
      recipient_email: "que@getcharightfitness.com",
      subject,
      body,
      metadata: { leadId: lead.id, email: lead.email, source: lead.source },
      status: "pending",
    }, { onConflict: "event_key", ignoreDuplicates: true })
    .select("id,event_key,status")
    .maybeSingle();

  if (queueError) {
    console.error("Unable to queue preview lead notification:", queueError);
    return;
  }
  if (!queued?.id || !process.env.BREVO_API_KEY) return;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Get Cha Right Fitness", email: "que@getcharightfitness.com" },
        to: [{ email: "que@getcharightfitness.com", name: "Que Kirby" }],
        subject,
        textContent: body,
        tags: ["gcr-owner-notification", "new-preview-lead"],
      }),
    });
    if (!response.ok) throw new Error(`Brevo ${response.status}: ${await response.text()}`);
    await admin.from("owner_notifications").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      attempts: 1,
      last_error: null,
    }).eq("id", queued.id);
  } catch (error) {
    console.error("Preview lead email failed; leaving notification queued:", error);
    await admin.from("owner_notifications").update({
      status: "pending",
      attempts: 1,
      last_error: String(error?.message || error).slice(0, 1000),
    }).eq("id", queued.id);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const first_name = clean(body.first_name, 100);
    const email = clean(body.email, 320)?.toLowerCase();

    if (!first_name) return Response.json({ error: "Enter your first name." }, { status: 400 });
    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return Response.json({ error: "Enter a valid email." }, { status: 400 });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ error: "Lead capture is temporarily unavailable." }, { status: 503 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const payload = {
      first_name,
      email,
      phone: clean(body.phone, 40),
      primary_goal: clean(body.primary_goal, 100),
      training_location: clean(body.training_location, 100),
      daily_sitting_hours: clean(body.daily_sitting_hours, 100),
      biggest_obstacle: clean(body.biggest_obstacle, 200),
      source: clean(body.source, 100) || "website_assistant",
      utm_source: clean(body.utm_source, 200),
      utm_medium: clean(body.utm_medium, 200),
      utm_campaign: clean(body.utm_campaign, 200),
      sms_consent: body.sms_consent === true,
      email_consent: body.email_consent === true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("leads")
      .upsert(payload, { onConflict: "email", ignoreDuplicates: false })
      .select("id,first_name,email,phone,primary_goal,training_location,biggest_obstacle,source")
      .single();

    if (error) throw error;
    await notifyOwner(admin, data);

    return Response.json({ ok: true, id: data.id, notificationQueued: true });
  } catch (error) {
    console.error("lead capture", error);
    return Response.json({ error: "We couldn't save that right now. Please try again." }, { status: 500 });
  }
}
