"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

const steps=[
 {key:"primary_goal",label:"What are you trying to accomplish?",options:["Lose weight / body fat","Build muscle","Gain healthy weight & size","Get stronger","Improve endurance / conditioning","Move better / feel less stiff","Get back into working out"]},
 {key:"training_location",label:"Where will you train?",options:["Home","Gym","Both"]},
 {key:"experience",label:"What's your experience level?",options:["Beginner","Some experience","Experienced"]},
 {key:"session_length",label:"How much time can you realistically train?",options:["20–30 minutes","30–45 minutes","45–60 minutes","60+ minutes"]},
 {key:"training_days",label:"How many days can you normally train each week?",options:["2 days","3 days","4 days","5 days","6 days"]}
];

export default function LeadAssistant(){
 const pathname=usePathname();
 const hiddenRoutes=["/members","/coach","/coach-client","/login","/checkout","/payment-success","/onboarding","/reset-password","/membership-required"];
 const hidden=hiddenRoutes.some(r=>pathname===r||pathname?.startsWith(r+"/"));
 const [open,setOpen]=useState(false),[step,setStep]=useState(0),[form,setForm]=useState({first_name:"",email:"",phone:"",email_consent:false,sms_consent:false}),[busy,setBusy]=useState(false),[error,setError]=useState("");
 if(hidden)return null;
 const gold="#F4C20D",muted="#B8B8B8";
 function choose(v){setForm(f=>({...f,[steps[step].key]:v}));setStep(s=>s+1)}
 async function submit(e){
  e.preventDefault();setBusy(true);setError("");
  try{
   const p=new URLSearchParams(window.location.search);
   const payload={...form,biggest_obstacle:[form.experience,form.session_length,form.training_days].filter(Boolean).join(" | "),source:"3_day_coaching_preview",utm_source:p.get("utm_source"),utm_medium:p.get("utm_medium"),utm_campaign:p.get("utm_campaign")};
   const r=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const x=await r.json();
   if(!r.ok) throw new Error(x.error||"Unable to save your information.");
   const qs=new URLSearchParams({goal:form.primary_goal||"",location:form.training_location||"",experience:form.experience||"",length:form.session_length||"",days:form.training_days||""});
   window.location.href="/starter-kit/preview?"+qs.toString();
  }catch(e){setError(e.message);setBusy(false)}
 }
 return <>
  <button aria-label="Open 3-day coaching preview" onClick={()=>setOpen(!open)} style={{position:"fixed",right:20,bottom:20,zIndex:9999,border:0,borderRadius:999,padding:"14px 18px",fontWeight:900,background:gold,color:"#050505",boxShadow:"0 8px 28px #0008",cursor:"pointer"}}>{open?"CLOSE":"3-DAY PREVIEW"}</button>
  {open&&<section style={{position:"fixed",right:20,bottom:78,zIndex:9998,width:"min(390px,calc(100vw - 40px))",maxHeight:"72vh",overflowY:"auto",background:"#111",border:"1px solid #2b2b2b",borderRadius:18,padding:20,boxShadow:"0 18px 60px #000b"}}>
   <div style={{fontSize:12,fontWeight:900,color:gold,letterSpacing:1}}>FREE 3-DAY COACHING PREVIEW</div>
   <h3 style={{margin:"8px 0",fontSize:22}}>See what my coaching is like.</h3>
   <p style={{color:muted,lineHeight:1.5,marginTop:0}}>Choose your goal and answer a few quick questions. You'll get an actual 3-day workout preview based on your answers.</p>
   {step<steps.length?<div>
    <div style={{fontWeight:800,marginBottom:12}}>{steps[step].label}</div>
    {steps[step].options.map(o=><button key={o} onClick={()=>choose(o)} style={{display:"block",width:"100%",textAlign:"left",margin:"8px 0",padding:12,borderRadius:10,border:"1px solid #333",background:"#181818",color:"#fff",cursor:"pointer"}}>{o}</button>)}
    {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:"transparent",color:"#aaa",border:0,padding:"8px 0",cursor:"pointer"}}>← Back</button>}
   </div>:<form onSubmit={submit}>
    <p style={{color:muted,lineHeight:1.5,fontSize:14}}>Enter your info and your personalized sample will open immediately.</p>
    <input required placeholder="First name" value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} style={input}/>
    <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={input}/>
    <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={input}/>
    <label style={label}><input type="checkbox" checked={form.email_consent} onChange={e=>setForm({...form,email_consent:e.target.checked})}/> Email me my coaching information and follow-ups.</label>
    <label style={label}><input type="checkbox" checked={form.sms_consent} onChange={e=>setForm({...form,sms_consent:e.target.checked})}/> I agree to receive text follow-ups. Message/data rates may apply. Reply STOP to opt out.</label>
    {error&&<p style={{color:"#ff7676",fontSize:13}}>{error}</p>}
    <button disabled={busy} style={{width:"100%",padding:13,border:0,borderRadius:10,background:gold,color:"#050505",fontWeight:900,cursor:"pointer"}}>{busy?"BUILDING MY PREVIEW...":"SHOW MY 3-DAY PREVIEW"}</button>
   </form>}
  </section>}
 </>;
}
const input={boxSizing:"border-box",width:"100%",margin:"6px 0",padding:12,borderRadius:10,border:"1px solid #333",background:"#080808",color:"#fff",fontSize:16};
const label={display:"flex",gap:8,fontSize:13,color:"#B8B8B8",margin:"10px 0"};
