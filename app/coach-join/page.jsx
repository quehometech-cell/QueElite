"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CoachJoinPage() {
  const router = useRouter();
  const plan = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("plan") || "starter" : "starter";
  const [form, setForm] = useState({ fullName: "", businessName: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function change(e) { setForm((v) => ({ ...v, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault(); setError("");
    const email = form.email.trim().toLowerCase();
    if (!form.fullName.trim() || !form.businessName.trim() || !email || !form.password) return setError("Complete all fields.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email, password: form.password,
      options: { data: { full_name: form.fullName.trim(), account_type: "coach", business_name: form.businessName.trim() } }
    });
    if (authError || !data?.user) { setError(authError?.message || "Unable to create coach account."); setLoading(false); return; }
    if (!data.session) {
      router.replace("/login?message=" + encodeURIComponent("Coach account created. Confirm your email, then sign in."));
      return;
    }
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id, email, full_name: form.fullName.trim(), role: "coach", membership_status: "inactive"
    }, { onConflict: "id" });
    if (profileError) { setError("Account created, but coach setup needs attention. Sign in and try again."); setLoading(false); return; }
    const slug = form.businessName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + data.user.id.slice(0, 6);
    const { data: workspace, error: workspaceError } = await supabase.from("coach_workspaces").insert({
      owner_id: data.user.id, name: form.businessName.trim(), brand_name: form.businessName.trim(), contact_email: email,
      slug, subscription_status: "inactive", subscription_tier: plan
    }).select("id").single();
    if (workspaceError) { setError("Account created, but workspace setup needs attention."); setLoading(false); return; }
    await supabase.from("workspace_members").insert({ workspace_id: workspace.id, user_id: data.user.id, workspace_role: "owner", status: "active" });
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch("/api/create-coach-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` },
      body: JSON.stringify({ plan }),
    });
    const result = await response.json();
    if (!response.ok || !result.url) { setError(result.error || "Unable to start your trial."); setLoading(false); return; }
    window.location.href = result.url;
  }

  return <main style={s.page}><section style={s.card}>
    <a href="/" style={s.brand}>GET CHA RIGHT</a><p style={s.eye}>COACH PLATFORM</p>
    <h1 style={s.h1}>Run Your Coaching Business</h1>
    <p style={s.plan}>Selected plan: <b>{plan.toUpperCase()}</b> · 14-day free trial</p>
    <p style={s.copy}>This signup is for independent coaches using Get Cha Right to manage their own clients. Looking for personal coaching? <a href="/#pricing" style={s.link}>View Que&apos;s coaching plans.</a></p>
    <div style={s.notice}><b>Coach account</b><br/>Your workspace and clients stay separate from Que&apos;s personal coaching clients. Coach platform billing is separate from client coaching packages.</div>
    <form onSubmit={submit} style={s.form}>
      <Field label="Your Name" name="fullName" value={form.fullName} onChange={change}/>
      <Field label="Coaching Business Name" name="businessName" value={form.businessName} onChange={change}/>
      <Field label="Email" name="email" type="email" value={form.email} onChange={change}/>
      <Field label="Password" name="password" type="password" value={form.password} onChange={change}/>
      <Field label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={change}/>
      {error && <p style={s.error}>{error}</p>}
      <button disabled={loading} style={s.button}>{loading ? "CREATING COACH WORKSPACE..." : "CREATE COACH ACCOUNT"}</button>
    </form>
    <p style={s.small}>Already have an account? <a href="/login" style={s.link}>Sign in</a></p>
  </section></main>;
}
function Field({label,name,type="text",value,onChange}) { return <label style={s.label}>{label}<input style={s.input} required name={name} type={type} value={value} onChange={onChange}/></label>; }
const s={page:{minHeight:"100vh",background:"#050505",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"Arial"},card:{width:"100%",maxWidth:"560px",background:"#111",border:"1px solid #2a2a2a",borderRadius:"18px",padding:"32px"},brand:{color:"#f4c20d",fontWeight:900,textDecoration:"none",letterSpacing:"2px"},eye:{color:"#f4c20d",fontSize:"12px",fontWeight:900,letterSpacing:"2px",marginTop:"28px"},h1:{fontSize:"clamp(34px,7vw,48px)",lineHeight:1,margin:"8px 0 16px"},copy:{color:"#bdbdbd",lineHeight:1.6},notice:{background:"#090909",border:"1px solid rgba(244,194,13,.35)",borderRadius:"12px",padding:"16px",color:"#ccc",lineHeight:1.55,margin:"20px 0"},form:{display:"grid",gap:"16px"},label:{display:"grid",gap:"7px",fontSize:"13px",fontWeight:800},input:{background:"#050505",border:"1px solid #333",borderRadius:"9px",padding:"14px",color:"#fff",fontSize:"16px"},button:{background:"#f4c20d",border:0,borderRadius:"9px",padding:"16px",fontWeight:900,fontSize:"14px",cursor:"pointer"},error:{color:"#ff8585",margin:0},link:{color:"#f4c20d",fontWeight:800},plan:{color:"#f4c20d",fontSize:"14px",fontWeight:800},small:{color:"#888",textAlign:"center",fontSize:"14px"}};
