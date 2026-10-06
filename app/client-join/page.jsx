"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../lib/supabase";

export default function ClientJoin(){
 const [invite,setInvite]=useState("");
 const [info,setInfo]=useState(null);
 const [form,setForm]=useState({name:"",password:"",confirm:""});
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [session,setSession]=useState(null);

 useEffect(()=>{
  const id=new URLSearchParams(window.location.search).get("invite")||"";
  setInvite(id);
  Promise.all([
   fetch("/api/client-invite?invite="+encodeURIComponent(id)).then(r=>r.json().then(x=>({ok:r.ok,x}))),
   supabase.auth.getSession()
  ]).then(([inviteResult,sessionResult])=>{
   if(inviteResult.ok){
    setInfo(inviteResult.x);
    const metaName=sessionResult?.data?.session?.user?.user_metadata?.full_name||"";
    if(metaName)setForm(f=>({...f,name:metaName}));
   }else setError(inviteResult.x.error||"Invalid invite.");
   setSession(sessionResult?.data?.session||null);
  });
 },[]);

 async function submit(e){
  e.preventDefault();setError("");
  if(form.password.length<8)return setError("Password must be at least 8 characters.");
  if(form.password!==form.confirm)return setError("Passwords do not match.");
  setBusy(true);

  let activeSession=session;

  if(activeSession?.user){
   if(info?.email&&activeSession.user.email?.toLowerCase()!==info.email.toLowerCase()){
    setError("This invite belongs to a different email address. Sign out and reopen the invite from the correct email.");
    setBusy(false);return;
   }
   const {error:updateError}=await supabase.auth.updateUser({password:form.password,data:{full_name:form.name}});
   if(updateError){setError(updateError.message||"Unable to finish account setup.");setBusy(false);return;}
   const refreshed=await supabase.auth.getSession();
   activeSession=refreshed?.data?.session||activeSession;
  }else{
   let {data,error:aerr}=await supabase.auth.signUp({email:info.email,password:form.password,options:{data:{full_name:form.name}}});
   if(aerr){
    const login=await supabase.auth.signInWithPassword({email:info.email,password:form.password});
    data=login.data;aerr=login.error;
   }
   if(aerr||!data?.user){setError(aerr?.message||"Unable to create account.");setBusy(false);return;}
   if(!data.session){setError("Confirm your email, then return to this invite link and sign in.");setBusy(false);return;}
   activeSession=data.session;
  }

  const res=await fetch("/api/client-invite",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+activeSession.access_token},body:JSON.stringify({invite})});
  const x=await res.json();
  if(!res.ok){setError(x.error||"Unable to connect your account.");setBusy(false);return;}
  window.location.href="/members";
 }

 return <main style={s.page}><section style={s.card}><a href="/" style={s.brand}>GET CHA RIGHT</a><p style={s.eye}>COACH CLIENT INVITE</p><h1 style={s.h1}>{info ? "Join "+info.business : "Client Setup"}</h1>{error&&<p style={s.err}>{error}</p>}{info&&<><p style={s.copy}>You&apos;ve been invited to <b>{info.business}</b> using <b>{info.email}</b>. Choose your password below to finish setting up your coaching account. You do not need to purchase a package to accept this coach invitation.</p><form onSubmit={submit} style={s.form}><label>Full name<input style={s.input} required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Create password<input style={s.input} type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><label>Confirm password<input style={s.input} type="password" required value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}/></label><button style={s.btn} disabled={busy}>{busy?"SETTING UP ACCOUNT...":"CREATE MY COACHING ACCOUNT →"}</button></form></>}</section></main>
}

const s={page:{minHeight:"100vh",background:"#050505",color:"#fff",display:"grid",placeItems:"center",padding:"22px",fontFamily:"Arial"},card:{width:"100%",maxWidth:"540px",background:"#111",border:"1px solid #292929",borderRadius:"16px",padding:"30px"},brand:{color:"#f4c20d",fontWeight:900,textDecoration:"none"},eye:{color:"#f4c20d",fontSize:"12px",fontWeight:900,letterSpacing:"2px",marginTop:"28px"},h1:{fontSize:"38px",margin:"8px 0 18px"},copy:{color:"#bbb",lineHeight:1.6},form:{display:"grid",gap:"16px"},input:{display:"block",width:"100%",boxSizing:"border-box",marginTop:"7px",background:"#050505",border:"1px solid #333",borderRadius:"9px",padding:"14px",color:"#fff",fontSize:"16px"},btn:{background:"#f4c20d",border:0,borderRadius:"9px",padding:"16px",fontWeight:900},err:{color:"#ff8585"}};
