"use client";

import { useState } from "react";

const steps = [
  { key: "primary_goal", label: "What is your main goal?", options: ["Lose body fat", "Build muscle & strength", "Move better / improve mobility", "Build consistency"] },
  { key: "training_location", label: "Where do you prefer to train?", options: ["Home", "Gym", "Both"] },
  { key: "daily_sitting_hours", label: "How much of your day do you spend sitting?", options: ["Under 4 hours", "4–6 hours", "7–9 hours", "10+ hours"] },
  { key: "biggest_obstacle", label: "What usually gets in the way?", options: ["Time", "Consistency", "Not knowing what to do", "Pain / stiffness", "Nutrition"] },
];

export default function LeadAssistant() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ first_name:"", email:"", phone:"", email_consent:true, sms_consent:false });
  const [busy,setBusy]=useState(false); const [done,setDone]=useState(false); const [error,setError]=useState("");

  function choose(value){ setForm(v=>({...v,[steps[step].key]:value})); setStep(s=>s+1); }
  async function submit(e){
    e.preventDefault(); setBusy(true); setError("");
    try {
      const p=new URLSearchParams(window.location.search);
      const r=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,source:"website_assistant",utm_source:p.get("utm_source"),utm_medium:p.get("utm_medium"),utm_campaign:p.get("utm_campaign")})});
      const x=await r.json(); if(!r.ok) throw new Error(x.error||"Unable to save your information.");
      setDone(true);
    } catch(e){setError(e.message)} finally {setBusy(false)}
  }

  const s={green:"#7CFF00",black:"#050505",panel:"#111",muted:"#B8B8B8"};
  return <>
    <button aria-label="Open fitness assistant" onClick={()=>setOpen(!open)} style={{position:"fixed",right:20,bottom:20,zIndex:9999,border:0,borderRadius:999,padding:"14px 18px",fontWeight:900,background:s.green,color:"#050505",boxShadow:"0 8px 28px #0008",cursor:"pointer"}}>{open?"CLOSE":"GET CHA RIGHT"}</button>
    {open&&<section style={{position:"fixed",right:20,bottom:78,zIndex:9998,width:"min(380px,calc(100vw - 40px))",maxHeight:"70vh",overflowY:"auto",background:s.panel,border:"1px solid #2b2b2b",borderRadius:18,padding:20,boxShadow:"0 18px 60px #000b"}}>
      <div style={{fontSize:12,fontWeight:900,color:s.green,letterSpacing:1}}>GET CHA RIGHT FITNESS</div>
      {!done && <h3 style={{margin:"8px 0 8px",fontSize:22}}>Let’s find the right starting point.</h3>}
      {!done && <p style={{color:s.muted,lineHeight:1.5,marginTop:0}}>Answer a few quick questions. No pressure and no generic plan.</p>}
      {done ? <div><h3>You’re in.</h3><p style={{color:s.muted,lineHeight:1.5}}>I saved your goals. Check your email for the next step, or view the coaching options now.</p><a href="/#pricing" style={{display:"inline-block",background:s.green,color:s.black,padding:"12px 16px",borderRadius:10,fontWeight:900,textDecoration:"none"}}>VIEW COACHING</a></div>
      : step<steps.length ? <div><div style={{fontWeight:800,marginBottom:12}}>{steps[step].label}</div>{steps[step].options.map(o=><button key={o} onClick={()=>choose(o)} style={{display:"block",width:"100%",textAlign:"left",margin:"8px 0",padding:"12px",borderRadius:10,border:"1px solid #333",background:"#181818",color:"#fff",cursor:"pointer"}}>{o}</button>)}</div>
      : <form onSubmit={submit}>
          <input required placeholder="First name" value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} style={input}/>
          <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={input}/>
          <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={input}/>
          <label style={{display:"flex",gap:8,fontSize:13,color:s.muted,margin:"10px 0"}}><input type="checkbox" checked={form.email_consent} onChange={e=>setForm({...form,email_consent:e.target.checked})}/> Email me coaching information and follow-ups.</label>
          <label style={{display:"flex",gap:8,fontSize:13,color:s.muted,margin:"10px 0"}}><input type="checkbox" checked={form.sms_consent} onChange={e=>setForm({...form,sms_consent:e.target.checked})}/> I agree to receive text follow-ups. Message/data rates may apply. Reply STOP to opt out.</label>
          {error&&<p style={{color:"#ff7676",fontSize:13}}>{error}</p>}
          <button disabled={busy} style={{width:"100%",padding:13,border:0,borderRadius:10,background:s.green,color:s.black,fontWeight:900,cursor:"pointer"}}>{busy?"SAVING...":"GET MY NEXT STEP"}</button>
        </form>}
    </section>}
  </>;
}
const input={boxSizing:"border-box",width:"100%",margin:"6px 0",padding:"12px",borderRadius:10,border:"1px solid #333",background:"#080808",color:"#fff",fontSize:16};
