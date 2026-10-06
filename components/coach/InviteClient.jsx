"use client";
import {useState} from "react";
import {supabase} from "../../lib/supabase";

export default function InviteClient({onCreated}){
 const [fullName,setFullName]=useState("");
 const [email,setEmail]=useState("");
 const [result,setResult]=useState(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);

 async function submit(e){
  e.preventDefault();
  setBusy(true);setError("");setResult(null);
  try{
   const {data:{session}}=await supabase.auth.getSession();
   const r=await fetch("/api/coach/invite-client",{
    method:"POST",
    headers:{"Content-Type":"application/json",Authorization:"Bearer "+(session?.access_token||"")},
    body:JSON.stringify({fullName,email})
   });
   const x=await r.json();
   if(!r.ok){setError(x.error||"Unable to send invite email.");}
   else{
    setResult(x);
    setFullName("");setEmail("");
    onCreated?.();
   }
  }catch(err){setError(err?.message||"Unable to send invite email.");}
  setBusy(false);
 }

 return <div style={s.card}>
  <h3 style={s.h}>INVITE A CLIENT</h3>
  <p style={s.p}>Enter the client&apos;s email and they&apos;ll receive an invitation to create their own Get Cha Right Fitness account. This works for paid, barter, comp, beta-test, or other clients without requiring you to create their password.</p>
  <form onSubmit={submit} style={s.form}>
   <div style={s.row}>
    <input style={s.input} type="text" placeholder="Client full name (optional)" value={fullName} onChange={e=>setFullName(e.target.value)}/>
    <input style={s.input} type="email" placeholder="client@email.com" required value={email} onChange={e=>setEmail(e.target.value)}/>
    <button style={s.btn} disabled={busy}>{busy?"SENDING...":"SEND INVITE EMAIL"}</button>
   </div>
   <p style={s.note}>They choose their own password and complete their account setup from the email. No Stripe checkout is required for clients you invite directly.</p>
  </form>
  {error&&<p style={s.err}>{error}</p>}
  {result&&<div style={s.success}>
   <b>{result.message}</b>
   {!result.emailSent&&result.inviteUrl&&<><p style={s.note}>This email already has an account. You can still copy the workspace setup link below.</p><div style={s.credential}>{result.inviteUrl}</div><button style={s.copy} onClick={()=>navigator.clipboard.writeText(result.inviteUrl)}>COPY SETUP LINK</button></>}
  </div>}
 </div>
}

const s={
 card:{background:"#111",border:"1px solid #2b2b2b",borderRadius:"14px",padding:"20px",marginBottom:"20px"},
 h:{margin:"0 0 8px",color:"#f4c20d"},
 p:{color:"#aaa",lineHeight:1.5,marginBottom:"16px"},
 form:{display:"grid",gap:"10px"},
 row:{display:"flex",gap:"10px",flexWrap:"wrap"},
 input:{flex:"1 1 220px",background:"#050505",border:"1px solid #333",borderRadius:"8px",padding:"13px",color:"#fff"},
 btn:{background:"#f4c20d",border:0,borderRadius:"8px",padding:"13px 18px",fontWeight:900,cursor:"pointer",flex:"0 0 auto"},
 note:{color:"#777",fontSize:"13px",lineHeight:1.45,margin:"2px 0 0"},
 err:{color:"#ff8585",marginTop:"12px"},
 success:{marginTop:"16px",display:"grid",gap:"10px",color:"#fff",background:"#0b160d",border:"1px solid #245c2d",borderRadius:"10px",padding:"14px"},
 credential:{background:"#050505",border:"1px solid #333",borderRadius:"7px",padding:"10px",fontFamily:"monospace",wordBreak:"break-all"},
 copy:{justifySelf:"start",background:"transparent",color:"#f4c20d",border:"1px solid #f4c20d",borderRadius:"7px",padding:"9px 12px",fontWeight:800,cursor:"pointer"}
};
