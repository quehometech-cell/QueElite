"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function InviteClient({ onCreated }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Your session expired. Please sign out and sign back in, then try again.");
        return;
      }
      const response = await fetch("/api/coach/invite-client", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.emailSent) {
        setError(data.error || "The invitation email was not sent. Please try again.");
        return;
      }
      setResult(data); setFullName(""); setEmail(""); onCreated?.();
    } catch (err) {
      setError(err?.message || "We could not connect to send the invitation. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section style={s.card} aria-busy={busy}>
    <h3 style={s.h}>INVITE A CLIENT</h3>
    <p style={s.p}>Send a secure invitation so your client can create their own Get Cha Right Fitness login. A name is optional; the email address is required.</p>
    <form onSubmit={submit} style={s.form}>
      <div style={s.row}>
        <input style={s.input} type="text" autoComplete="name" placeholder="Client full name (optional)" value={fullName} onChange={e => setFullName(e.target.value)} />
        <input style={s.input} type="email" autoComplete="email" placeholder="client@email.com" aria-label="Client email address" required value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit" style={{ ...s.btn, opacity: busy ? .65 : 1 }} disabled={busy || !email.trim()}>
          {busy ? "SENDING INVITATION…" : "SEND INVITE EMAIL"}
        </button>
      </div>
      <p style={s.note}>They set their own password from the invitation email. No payment is required for a direct client invite.</p>
    </form>
    {error && <div role="alert" style={s.errorBox}><strong>Invitation not sent</strong><span>{error}</span></div>}
    {result && <div role="status" style={s.successBox}>
      <strong>Invitation email sent</strong>
      <span>{result.message || "The invitation was sent to " + (result.email || "the client") + "."}</span>
      <span style={s.note}>If they do not see it shortly, have them check Spam/Junk and Promotions.</span>
    </div>}
  </section>;
}

const s = {
  card: { background: "#ffffff", border: "1px solid #e4e7ec", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0 4px 16px rgba(16,24,40,.05)" },
  h: { margin: "0 0 8px", color: "#17212f", fontSize: 17, fontWeight: 800 },
  p: { color: "#667085", lineHeight: 1.55, margin: "0 0 16px" },
  form: { display: "grid", gap: 10 },
  row: { display: "flex", gap: 10, flexWrap: "wrap" },
  input: { boxSizing: "border-box", flex: "1 1 220px", minWidth: 0, background: "#fff", border: "1px solid #d0d5dd", borderRadius: 10, padding: "13px 14px", color: "#17212f", fontSize: 15 },
  btn: { background: "#f4c20d", color: "#17212f", border: "1px solid #d6a900", borderRadius: 10, padding: "13px 18px", fontWeight: 800, cursor: "pointer", flex: "0 0 auto" },
  note: { color: "#667085", fontSize: 13, lineHeight: 1.45, margin: "2px 0 0" },
  errorBox: { marginTop: 14, display: "grid", gap: 5, color: "#8f2424", background: "#fff1f1", border: "1px solid #f2caca", borderRadius: 10, padding: 13 },
  successBox: { marginTop: 14, display: "grid", gap: 5, color: "#17633a", background: "#effaf3", border: "1px solid #b9e5c8", borderRadius: 10, padding: 13 },
};
