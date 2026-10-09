"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { suggestWorkout } from "../../lib/workout-assistant.mjs";

const input = { width: "100%", boxSizing: "border-box", padding: 10, color: "white", background: "#080808", border: "1px solid #555", borderRadius: 7 };
export default function WorkoutAssistant({ clientId, rows, form, onApply }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    let active = true;
    setProfile(null); setDraft(null); setError("");
    if (!clientId) return;
    supabase.from("onboarding_assessments").select("goal,experience_level,equipment,specific_equipment,days_per_week,session_minutes,preferred_training_days,limitations,injuries_or_pain,medical_considerations,restricted_movements,mobility_concerns,pain_areas,pain_during_exercise,needs_exercise_modifications,disliked_exercises,training_notes")
      .eq("user_id", clientId).order("created_at", {ascending: false}).limit(1).maybeSingle()
      .then(({data,error}) => { if (active) { if (error) setError(error.message); else setProfile(data || {}); } });
    return () => { active = false; };
  }, [clientId]);
  useEffect(() => { setDraft(null); }, [rows, form]);
  return <section style={{border: "1px solid #665515", padding: 20, borderRadius: 12, marginTop: 18}}>
    <h2>Client needs assistant</h2>
    <p>Rules-based suggestions from the client assessment. Review exercises, equipment, limitations and recovery before saving. Suggestions remain drafts until you save the workout.</p>
    {!clientId ? <p>Create a client-specific copy from Coach → Client → Workouts to use their assessment here.</p> : error ? <p role="alert">Assessment unavailable: {error}</p> : !profile ? <p>Loading assessment…</p> : <>
      <p>Assessment restrictions: {[profile.limitations, profile.injuries_or_pain, profile.medical_considerations, profile.restricted_movements].flat().filter(Boolean).join('; ') || 'None recorded — confirm with the client.'}</p>
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12}}>{[["goal","Goal"],["experience_level","Experience"],["equipment","Equipment"],["days_per_week","Days per week"],["session_minutes","Session minutes"]].map(([key,label]) => <label key={key}>{label}<input style={input} value={profile[key] || ""} onChange={e => {setProfile(p => ({...p,[key]:e.target.value}));setDraft(null);}}/></label>)}</div>
      <p><small>These inputs adjust this suggestion only; the original assessment stays unchanged.</small></p>
      <button type="button" onClick={() => setDraft(suggestWorkout(profile,rows,form))}>Suggest adjustments</button>
      {draft && <div><ul>{draft.notes.map(note => <li key={note} style={{margin: "10px 0"}}>{note}</li>)}</ul>{!draft.blocked && <button type="button" onClick={() => {onApply(draft);setDraft(null);}}>Apply suggested volume to editor</button>}</div>}
    </>}
  </section>;
}
