import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = admin();
  const { data: rows, error } = await db
    .from("owner_notifications")
    .select("id,event_key,event_type,recipient_email,subject,body,metadata,attempts")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const row of rows || []) {
    try {
      const html = `<div style="font-family:Arial,sans-serif;background:#0b0b0b;color:#fff;padding:28px"><div style="max-width:620px;margin:auto;background:#151515;border:1px solid #333;border-radius:14px;padding:26px"><div style="color:#F4C20D;font-weight:900;letter-spacing:1px">GET CHA RIGHT FITNESS</div><h2 style="margin:12px 0 18px">${row.subject}</h2><p style="white-space:pre-line;line-height:1.6;color:#ddd">${row.body}</p><p style="font-size:12px;color:#888;margin-top:24px">Automated platform notification</p></div></div>`;
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": process.env.BREVO_API_KEY || "",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Get Cha Right Fitness", email: "getcharighttransformations22@gmail.com" },
          to: [{ email: row.recipient_email, name: "Coach Que" }],
          subject: row.subject,
          htmlContent: html,
          tags: ["gcr-owner-notification", row.event_type],
        }),
      });
      if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
      await db.from("owner_notifications").update({
        status: "sent", sent_at: new Date().toISOString(), attempts: Number(row.attempts || 0) + 1, last_error: null,
      }).eq("id", row.id);
      results.push({ id: row.id, status: "sent" });
    } catch (e) {
      const attempts = Number(row.attempts || 0) + 1;
      await db.from("owner_notifications").update({
        status: attempts >= 5 ? "failed" : "pending", attempts, last_error: String(e?.message || e).slice(0, 1000),
      }).eq("id", row.id);
      results.push({ id: row.id, status: "failed" });
    }
  }
  return Response.json({ ok: true, processed: results.length, results });
}
