"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientJoin() {
  const [invite, setInvite] = useState("");
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ name: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const id = new URLSearchParams(window.location.search).get("invite") || "";
    setInvite(id);

    async function load() {
      const [inviteResponse, sessionResponse] = await Promise.all([
        fetch("/api/client-invite?invite=" + encodeURIComponent(id)).then(async (r) => ({
          ok: r.ok,
          data: await r.json().catch(() => ({})),
        })),
        supabase.auth.getSession(),
      ]);

      if (!mounted) return;
      if (inviteResponse.ok) {
        setInfo(inviteResponse.data);
      } else {
        setError(inviteResponse.data.error || "This invitation is invalid or expired.");
      }

      const active = sessionResponse?.data?.session || null;
      setSession(active);
      const name = active?.user?.user_metadata?.full_name || "";
      if (name) setForm((current) => ({ ...current, name }));
      setLoading(false);
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession || null);
      const name = nextSession?.user?.user_metadata?.full_name || "";
      if (name) setForm((current) => ({ ...current, name }));
      if (nextSession) setNotice("Your email is verified. Create your password to finish setting up your account.");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function sendSecureSetupLink() {
    if (!info?.email || !invite) return;
    setBusy(true);
    setError("");
    setNotice("");

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: info.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin + "/client-join?invite=" + encodeURIComponent(invite),
      },
    });

    if (otpError) {
      setError(otpError.message || "Unable to send the secure account setup link.");
    } else {
      setNotice("A secure sign-in link was sent to " + info.email + ". Open it on this device, then return here to create your password.");
    }
    setBusy(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!session?.user) {
      setError("First use the secure link sent to your email. That verifies your identity so we can safely create your password.");
      return;
    }
    if (info?.email && session.user.email?.toLowerCase() !== info.email.toLowerCase()) {
      setError("This invitation belongs to a different email address. Sign out, then open the invitation using " + info.email + ".");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: form.password,
      data: { full_name: form.name.trim() },
    });

    if (updateError) {
      setError(updateError.message || "Unable to save your password.");
      setBusy(false);
      return;
    }

    const refreshed = await supabase.auth.getSession();
    const activeSession = refreshed?.data?.session || session;
    const response = await fetch("/api/client-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + activeSession.access_token,
      },
      body: JSON.stringify({ invite }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(result.error || "Your password was saved, but we could not connect your account to the coach. Please contact the coach.");
      setBusy(false);
      return;
    }

    window.location.href = "/members";
  }

  return (
    <main style={s.page}>
      <section style={s.card}>
        <a href="/" style={s.brand}>GET CHA RIGHT</a>
        <p style={s.eye}>COACH CLIENT INVITE</p>
        <h1 style={s.h1}>{info ? "Join " + info.business : "Client Setup"}</h1>
        {loading ? <p style={s.copy}>Verifying your invitation...</p> : null}
        {error ? <p style={s.err}>{error}</p> : null}
        {notice ? <p style={s.notice}>{notice}</p> : null}
        {info && !loading && (
          <>
            <p style={s.copy}>
              You&apos;ve been invited to <b>{info.business}</b> using <b>{info.email}</b>.
              {session?.user
                ? " Create a password below to finish setting up your account."
                : " Verify your email with a secure sign-in link, then create your password. You do not need to purchase a package to accept this invitation."}
            </p>
            {!session?.user ? (
              <button type="button" onClick={sendSecureSetupLink} disabled={busy} style={s.btn}>
                {busy ? "SENDING SECURE LINK..." : "EMAIL ME A SECURE SETUP LINK →"}
              </button>
            ) : (
              <form onSubmit={submit} style={s.form}>
                <label>Full name
                  <input style={s.input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label>Create password
                  <input style={s.input} type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </label>
                <label>Confirm password
                  <input style={s.input} type="password" required minLength={8} autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                </label>
                <button style={s.btn} disabled={busy}>{busy ? "SETTING UP ACCOUNT..." : "CREATE MY ACCOUNT →"}</button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f5f7fa", color: "#17212f", display: "grid", placeItems: "center", padding: "22px", fontFamily: "Arial, sans-serif" },
  card: { width: "100%", maxWidth: "540px", background: "#fff", border: "1px solid #e4e7ec", borderRadius: "16px", padding: "clamp(24px, 5vw, 36px)", boxShadow: "0 12px 36px rgba(16,24,40,.08)" },
  brand: { color: "#9b7112", fontWeight: 900, textDecoration: "none", letterSpacing: "1px" },
  eye: { color: "#9b7112", fontSize: "12px", fontWeight: 900, letterSpacing: "2px", marginTop: "28px" },
  h1: { fontSize: "clamp(30px, 7vw, 38px)", margin: "8px 0 18px" },
  copy: { color: "#667085", lineHeight: 1.65 },
  form: { display: "grid", gap: "16px" },
  input: { display: "block", width: "100%", boxSizing: "border-box", marginTop: "7px", background: "#fff", color: "#17212f", border: "1px solid #d0d5dd", borderRadius: "9px", padding: "14px", fontSize: "16px" },
  btn: { width: "100%", background: "#b88718", color: "#fff", border: 0, borderRadius: "9px", padding: "16px", fontWeight: 900, cursor: "pointer", marginTop: "8px" },
  err: { color: "#b42318", background: "#fef3f2", padding: "12px", borderRadius: "8px", lineHeight: 1.5 },
  notice: { color: "#175c36", background: "#ecfdf3", padding: "12px", borderRadius: "8px", lineHeight: 1.5 },
};