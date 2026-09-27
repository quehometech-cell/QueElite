"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Habits({ user }) {
  const [habits,setHabits]=useState([]); const [logs,setLogs]=useState([]); const [name,setName]=useState(""); const [msg,setMsg]=useState("");
  const today=new Date().toISOString().slice(0,10);
  async function load(){
    const {data:h}=await supabase.from("habits").select("*").eq("user_id",user.id).eq("is_active",true).order("created_at");
    setHabits(h||[]);
    const {data:l}=await supabase.from("habit_logs").select("id,habit_id,completed_on").eq("user_id",user.id).eq("completed_on",today);
    setLogs(l||[]);
  }
  useEffect(()=>{if(user?.id) load();},[user?.id]);
  async function add(e){e.preventDefault();const clean=name.trim();if(!clean)return;const {error}=await supabase.from("habits").insert({user_id:user.id,name:clean,target_per_week:7});if(error)setMsg("Could not add habit.");else{setName("");setMsg("Habit added.");await load();}}
  async function toggle(h){const hit=logs.find(x=>x.habit_id===h.id);if(hit)await supabase.from("habit_logs").delete().eq("id",hit.id);else await supabase.from("habit_logs").insert({habit_id:h.id,user_id:user.id,completed_on:today});await load();}
  return <section><p style={s.eye}>HABITS</p><h2 style={s.title}>BUILD CONSISTENCY</h2><p style={s.copy}>Track the daily actions that support your training, recovery, nutrition, and lifestyle goals.</p>
    <form onSubmit={add} style={s.form}><input value={name} onChange={e=>setName(e.target.value)} placeholder="Add a habit, e.g. 8,000 steps" style={s.input}/><button style={s.button}>ADD HABIT</button></form>{msg&&<p style={s.msg}>{msg}</p>}
    <div style={s.grid}>{habits.length?habits.map(h=>{const done=logs.some(x=>x.habit_id===h.id);return <button key={h.id} onClick={()=>toggle(h)} style={{...s.card,borderColor:done?"#f4c20d":"#2a2a2a"}}><span style={s.check}>{done?"✓":"○"}</span><span><b>{h.name}</b><small style={s.small}>{done?"Completed today":"Tap to complete today"}</small></span></button>}):<div style={s.empty}>No habits yet. Add the first habit you want to stay consistent with.</div>}</div>
  </section>;
}
const s={eye:{color:"#f4c20d",fontWeight:900,letterSpacing:"2px",fontSize:"12px"},title:{fontSize:"clamp(28px,5vw,40px)",margin:"6px 0"},copy:{color:"#aaa",lineHeight:1.6,maxWidth:"700px"},form:{display:"flex",gap:"10px",flexWrap:"wrap",margin:"24px 0 10px"},input:{flex:"1 1 260px",background:"#080808",color:"#fff",border:"1px solid #333",borderRadius:"9px",padding:"14px",fontSize:"16px"},button:{background:"#f4c20d",color:"#050505",border:0,borderRadius:"9px",padding:"14px 20px",fontWeight:900},msg:{color:"#f4c20d"},grid:{display:"grid",gap:"12px",marginTop:"22px"},card:{width:"100%",display:"flex",alignItems:"center",gap:"14px",textAlign:"left",background:"#111",color:"#fff",border:"1px solid",borderRadius:"12px",padding:"16px",cursor:"pointer"},check:{fontSize:"28px",color:"#f4c20d"},small:{display:"block",color:"#888",marginTop:"5px"},empty:{background:"#111",border:"1px solid #2a2a2a",borderRadius:"12px",padding:"20px",color:"#999"}};
