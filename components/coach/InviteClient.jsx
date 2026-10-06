"use client";
import {useState} from "react";
import {supabase} from "../../lib/supabase";

export default function InviteClient({onCreated}){
 const [fullName,setFullName]=useState("");
 const [email,setEmail]=useState("");
 const [tempPassword,setTempPassword]=useState("");
 const [result,setResult]=useState(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);

 async function submit(e){
  e.preventDefault();
  setBusy(true);setError("");setResult(null);
  try{
   const {data:{session}}=await supabase.auth.getSession();
   const r=await fetch("/api/coach/add-client",{
    method:"POST",
    headers:{"Content-Type":"application/json",Authorization:"Bearer "+(session?.access_token||"")},
    body:JSON.stringify({fullName,email,tempPassword})
   });
   const x=await r.json();
   if(!r.ok){setError(x.error||"Unable to add client.");}
   else{
    setResult(x);
    setFullName("");setEmail("");setTempPassword("");
    onCreated?.();
   }
  }catch(err){setError(err?.message||"Unable to add client.");}
  setBusy(false);
 }

 return <div style={s.card}>
  <h3 style={s.h}>ADD CLIENT MANUALLY</h3>
  <p style={s.p}>For barter, comp, beta-test, family, or off-platform clients. This creates their member account and adds them directly to your coaching workspace without Stripe or a signup link.</p>
  <form onSubmit={submit} style={s.form}>
   <div style={s.row}>
    <input style={s.input} type="text" placeholder="Client full name" required value={fullName} onChange={e=>setFullName(e.target.value)}/>
    <input style={s.input} type="email" placeholder="client@email.com" required value={email} onChange={e=>setEmail(e.target.value)}/>
   </div>
   <div style={s.row}>
    <input style={s.input} type="text" placeholder="Temporary password (optional)" value={tempPassword} onChange={e=>setTempPassword(e.target.value)}/>
    <button style={s.btn} disabled={busy}>{busy?"ADDING CLIENT...":"ADD CLIENT"}</button>
   </div>
   <p style={s.note}>Leave the temporary password blank and the system will generate one for you. You can text or email the login credentials to the client yourself.</p>
  </form>
  {error&&<p style={s.err}>{error}</p>}
  {result&&<div style={s.success}>
   <b>{result.message}</b>
   <div><span style={s.label}>Login email</span><div style={s.credential}>{result.email}</div></div>
   {result.tempPassword&&<div><span style={s.label}>Temporary password</span><div style={s.credential}>{result.tempPassword}</div></div>}
   {result.tempPassword&&<button style={s.copy} onClick={()=>navigator.clipboard.writeText(`Get Cha Right Fitness login\nEmail: ${result.email}\nTemporary password: ${result.tempPassword}\nhttps://www.getcharightfitness.com/login`)}>COPY LOGIN DETAILS</button>}
   {!result.tempPassword&&<p style={s.note}>This email already had an account, so no new password was created.</p>}
  </div>}
 </div>
}

const s={
 card:{background:"#111",border:"1px solid #2b2b2b",borderRadius:"14px",padding:"20px",marginBottom:"20px"},
 h:{margin:"0 0 8px",color:"#f4c20d"},
 p:{color:"#aaa",lineHeight:1.5,marginBottom:"16px"},
 form:{display:"grid",gap:"10px"},
 row:{display:"flex",gap:"10px",flexWrap:"wrap"},
 input:{flex:"1 1 240px",background:"#050505",border:"1px solid #333",borderRadius:"8px",padding:"13px",color:"#fff"},
 btn:{background:"#f4c20d",border:0,borderRadius:"8px",padding:"13px 18px",fontWeight:900,cursor:"pointer",flex:"0 0 auto"},
 note:{color:"#777",fontSize:"13px",lineHeight:1.45,margin:"2px 0 0"},
 err:{color:"#ff8585",marginTop:"12px"},
 success:{marginTop:"16px",display:"grid",gap:"10px",color:"#fff",background:"#0b160d",border:"1px solid #245c2d",borderRadius:"10px",padding:"14px"},
 label:{display:"block",fontSize:"12px",color:"#8e9a90",marginBottom:"4px",textTransform:"uppercase",fontWeight:800},
 credential:{background:"#050505",border:"1px solid #333",borderRadius:"7px",padding:"10px",fontFamily:"monospace",wordBreak:"break-all"},
 copy:{justifySelf:"start",background:"transparent",color:"#f4c20d",border:"1px solid #f4c20d",borderRadius:"7px",padding:"9px 12px",fontWeight:800,cursor:"pointer"}
};
