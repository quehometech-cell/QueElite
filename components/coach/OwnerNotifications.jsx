"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function OwnerNotifications() {
  const [items, setItems] = useState([]);
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.access_token) throw new Error("Sign in again to view notifications.");
      const response = await fetch("/api/owner-notifications", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load notifications.");
      setItems(result.notifications || []); setEmailConfigured(result.emailConfigured);
    } catch (e) { setError(e.message || "Unable to load notifications."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const pending = items.filter(item => item.status === "pending").length;
  return <section aria-label="Owner notifications" style={{background:"#111",border:"1px solid #373737",borderRadius:12,padding:18,margin:"18px 0",color:"#eee"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <div><h2 style={{margin:"0 0 5px",fontSize:20}}>Notifications {pending>0&&<span style={{color:"#F4C20D"}}>({pending} pending)</span>}</h2><p style={{margin:0,color:"#bbb",fontSize:14}}>Owner account alerts, including new client signups.</p></div>
      <button type="button" onClick={load} disabled={loading} style={{background:"#242424",color:"#fff",border:"1px solid #555",borderRadius:7,padding:"10px 14px",cursor:"pointer"}}>{loading?"Refreshing…":"Refresh"}</button>
    </div>
    {!emailConfigured&&<p role="status" style={{padding:12,background:"#241d08",borderRadius:8,color:"#f5d56a",lineHeight:1.5}}>Email delivery is not configured in production. Alerts stay visible here; add the Brevo API key to Vercel to send them by email.</p>}
    {error&&<p role="alert">{error}</p>}
    {!loading&&!error&&!items.length&&<p style={{color:"#aaa"}}>No notifications yet.</p>}
    <div style={{display:"grid",gap:10,marginTop:12}}>{items.map(item=><article key={item.id} style={{padding:12,border:"1px solid #333",borderRadius:8}}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><strong>{item.subject}</strong><small style={{color:item.status==="sent"?"#7c8":"#F4C20D"}}>{item.status}{item.status==="failed"&&item.last_error?` · ${item.last_error}`:""}</small></div><p style={{whiteSpace:"pre-line",lineHeight:1.5,color:"#ccc",margin:"8px 0"}}>{item.body}</p><small style={{color:"#888"}}>{new Date(item.created_at).toLocaleString()}</small></article>)}</div>
  </section>;
}
