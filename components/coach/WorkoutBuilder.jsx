"use client";

import { useEffect, useState } from "react";
import WorkoutAssistant from "./WorkoutAssistant";
import { supabase } from "../../lib/supabase";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const input = { width: "100%", boxSizing: "border-box", padding: 12, background: "#080808", color: "#fff", border: "1px solid #444", borderRadius: 8, fontSize: 16 };
const button = { padding: "12px 18px", border: 0, borderRadius: 8, background: "#F4C20D", color: "#050505", fontWeight: 800, cursor: "pointer" };
const card = { background: "#111", border: "1px solid #333", borderRadius: 12, padding: 20, marginTop: 18 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 };
const blankExercise = () => ({ exercise_id: "", name: "", instructions: "", sets: "3", reps: "8-12", rest_seconds: "60", duration_seconds: "", rir: "", tempo: "", distance_target: "", distance_unit: "", pace_target: "", notes: "" });
function Field({ label, children }) { return <label style={{ display: "grid", gap: 7, color: "#ddd" }}>{label}{children}</label>; }

export default function WorkoutBuilder() {
  const [programs, setPrograms] = useState([]);
  const [library, setLibrary] = useState([]);
  const [programId, setProgramId] = useState("");
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(1);
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: "", type: "strength", minutes: "", notes: "" });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const selectedProgram = programs.find(p => p.id === programId);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setLoadError("");
      try {
        const [p, e] = await Promise.all([
          supabase.from("programs").select("*").eq("is_active", true).order("name"),
          supabase.from("exercises").select("id,name").eq("is_active", true).order("name"),
        ]);
        if (p.error || e.error) throw p.error || e.error;
        if (!active) return;
        setPrograms(p.data || []); setLibrary(e.data || []);
        const requested = new URLSearchParams(window.location.search).get("program");
        setProgramId(p.data?.find(x => x.id === requested)?.id || p.data?.[0]?.id || "");
        if (!p.data?.length) setLoading(false);
      } catch (error) { if (active) { setLoadError(error.message); setLoading(false); } }
    }
    load(); return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!programId) return;
    let active = true;
    async function loadDay() {
      setLoading(true); setLoadError("");
      try {
        const w = await supabase.from("program_weeks").select("id").eq("program_id", programId).eq("week_number", week).maybeSingle();
        if (w.error) throw w.error;
        const d = w.data ? await supabase.from("program_workouts").select("id,workout_day,name,workout_type,estimated_minutes,coach_notes").eq("program_week_id", w.data.id).order("workout_day") : { data: [] };
        if (d.error) throw d.error;
        const workout = d.data.find(x => x.workout_day === Number(day));
        const e = workout ? await supabase.from("program_workout_exercises").select("id,exercise_id,sets,reps,rest_seconds,duration_seconds,rir,tempo,distance_target,distance_unit,pace_target,notes,exercise_order").eq("program_workout_id", workout.id).eq("is_active", true).order("exercise_order") : { data: [] };
        if (e.error) throw e.error;
        if (!active) return;
        setWorkouts(d.data);
        setForm({ name: workout?.name || "", type: workout?.workout_type || "strength", minutes: workout?.estimated_minutes ?? "", notes: workout?.coach_notes || "" });
        setRows(e.data.map(x => ({ ...x, exercise_id: String(x.exercise_id), sets: x.sets ?? "", reps: x.reps ?? "", rest_seconds: x.rest_seconds ?? "", duration_seconds: x.duration_seconds ?? "", notes: x.notes || "" })));
        setDirty(false);
      } catch (error) { if (active) setLoadError(error.message); }
      finally { if (active) setLoading(false); }
    }
    loadDay(); return () => { active = false; };
  }, [programId, week, day, refresh]);

  useEffect(() => {
    if (!dirty) return;
    const warn = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function navigate(setter, value) {
    if (dirty && !window.confirm("Discard your unsaved workout changes?")) return;
    setMessage(""); setDirty(false); setter(value);
  }
  function updateForm(key, value) { setForm(f => ({ ...f, [key]: value })); setDirty(true); setMessage(""); }
  function updateRow(index, key, value) { setRows(rs => rs.map((r, i) => i === index ? { ...r, [key]: value } : r)); setDirty(true); setMessage(""); }
  async function save(event) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      if (form.type !== "rest" && rows.length === 0) throw new Error("Add at least one exercise, or choose Rest for a rest day.");
      const { error } = await supabase.rpc("owner_save_workout_v2", {
        p_program_id: programId, p_week: Number(week), p_day: Number(day), p_name: form.name,
        p_type: form.type, p_minutes: form.minutes === "" ? null : Number(form.minutes), p_notes: form.notes,
        p_exercises: rows.map(r => ({ ...r, exercise_id: r.exercise_id === "new" ? null : r.exercise_id })),
      });
      if (error) throw error;
      setDirty(false); setMessage(`Saved ${selectedProgram?.name} · Week ${week} · ${DAYS[day - 1]}.`);
      const updatedLibrary = await supabase.from("exercises").select("id,name").eq("is_active", true).order("name");
      if (!updatedLibrary.error) setLibrary(updatedLibrary.data || []);
      setRefresh(n => n + 1);
    } catch (error) { setMessage(`Not saved: ${error.message}`); }
    finally { setSaving(false); }
  }

  return <>
    <p style={{ color: "#bbb", lineHeight: 1.6 }}>Choose a program, week, and day. Add exercises from your library or create your own. Shared template changes apply to everyone assigned that template. Client copies only affect their assigned client. Each save updates the selected week and day.</p>
    <fieldset disabled={saving || loading} style={{ ...grid, border: 0, padding: 0 }}>
      <Field label="Program"><select style={input} value={programId} onChange={e => navigate(value => { setProgramId(value); setWeek(1); }, e.target.value)}>{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
      <Field label="Week"><select style={input} value={week} onChange={e => navigate(setWeek, Number(e.target.value))}>{Array.from({ length: selectedProgram?.duration_weeks || 12 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}</select></Field>
      <Field label="Day"><select style={input} value={day} onChange={e => navigate(setDay, Number(e.target.value))}>{DAYS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select></Field>
    </fieldset>
    {message && <p role="status" style={{ color: "#F4C20D" }}>{message}</p>}
    {loadError ? <p role="alert">Unable to load workouts: {loadError}. Refresh to try again.</p> : loading ? <p>Loading workouts…</p> : !programId ? <p>No programs available.</p> : <>
      <div style={card}><h2>Week {week} schedule</h2><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{DAYS.map((name, i) => <button type="button" key={name} disabled={saving} onClick={() => navigate(setDay, i + 1)} style={{ ...button, background: day === i + 1 ? "#F4C20D" : "#292929", color: day === i + 1 ? "#050505" : "#fff" }}>{name}<br /><small>{workouts.find(w => w.workout_day === i + 1)?.name || "Not added"}</small></button>)}</div></div>
      <ProgramDetails key={programId} program={selectedProgram} onSaved={updated => setPrograms(ps => ps.map(p => p.id === updated.id ? updated : p))} />
      <WorkoutAssistant key={`${programId}-${week}-${day}`} clientId={selectedProgram?.client_id} rows={rows} form={form} onApply={(draft) => { setRows(draft.rows); setForm(draft.form); setDirty(true); setMessage("Draft applied to the editor. Review every exercise, then Save workout to publish."); }} />
      <form onSubmit={save}>
        <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0 }}>
          <div style={card}><h2>{workouts.some(w => w.workout_day === day) ? "Edit workout" : "Add workout"} · {DAYS[day - 1]}</h2><div style={grid}>
            <Field label="Workout name"><input style={input} required maxLength={150} value={form.name} onChange={e => updateForm("name", e.target.value)} /></Field>
            <Field label="Workout type"><select style={input} value={form.type} onChange={e => updateForm("type", e.target.value)}>{["strength", "hypertrophy", "cardio", "mobility", "conditioning", "recovery", "mixed", "rest"].map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
            <Field label="Session minutes"><input style={input} type="number" min="0" max="1440" value={form.minutes} onChange={e => updateForm("minutes", e.target.value)} /></Field>
          </div><div style={{ marginTop: 14 }}><Field label="Workout notes"><textarea style={input} value={form.notes} onChange={e => updateForm("notes", e.target.value)} /></Field></div></div>
          {rows.map((row, index) => <div key={row.id || `new-${index}`} style={card}>
            <h3>Exercise {index + 1}</h3>
            <Field label={`Exercise ${index + 1} selection`}><select style={input} required value={row.exercise_id} onChange={e => updateRow(index, "exercise_id", e.target.value)}><option value="">Choose an exercise</option><option value="new">+ Create a new exercise</option>{library.map(e => <option value={String(e.id)} key={e.id}>{e.name}</option>)}{row.exercise_id && row.exercise_id !== "new" && !library.some(e => String(e.id) === row.exercise_id) && <option value={row.exercise_id}>Existing exercise #{row.exercise_id}</option>}</select></Field>
            {row.exercise_id === "new" && <div style={{ ...grid, marginTop: 14 }}><Field label="New exercise name"><input style={input} required maxLength={150} value={row.name || ""} onChange={e => updateRow(index, "name", e.target.value)} /></Field><Field label="Exercise instructions"><textarea style={input} value={row.instructions || ""} onChange={e => updateRow(index, "instructions", e.target.value)} /></Field></div>}
            <div style={{ ...grid, marginTop: 14 }}>{[["sets", "Sets", "number", 1, 100], ["reps", "Reps / target", "text"], ["rest_seconds", "Rest (seconds)", "number", 0, 86400], ["duration_seconds", "Duration (seconds)", "number", 0, 86400], ["rir", "Reps in reserve", "number", 0, 10], ["tempo", "Tempo", "text"], ["distance_target", "Distance", "number", 0, 100000], ["distance_unit", "Distance unit", "text"], ["pace_target", "Pace target", "text"]].map(([key, label, type, min, max]) => <Field key={key} label={label}><input style={input} type={type} step={["rir", "distance_target"].includes(key) ? "any" : undefined} min={min} max={max} value={row[key] ?? ""} onChange={e => updateRow(index, key, e.target.value)} /></Field>)}</div>
            <div style={{ marginTop: 14 }}><Field label="Exercise notes"><textarea style={input} value={row.notes} onChange={e => updateRow(index, "notes", e.target.value)} /></Field></div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>{[-1, 1].map(direction => <button type="button" key={direction} disabled={index + direction < 0 || index + direction >= rows.length} style={button} onClick={() => { setRows(rs => { const next = [...rs]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; }); setDirty(true); }}>{direction < 0 ? "Move up" : "Move down"}</button>)}<button type="button" style={{ ...button, background: "#333", color: "#fff", marginTop: 12 }} onClick={() => { setRows(rs => rs.filter((_, i) => i !== index)); setDirty(true); }}>Remove exercise</button></div>
          </div>)}
          {rows.length === 0 && <p>{form.type === "rest" ? "Rest day — no exercises required." : "No exercises yet. Add your first exercise below."}</p>}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}><button type="button" disabled={form.type === "rest" || rows.length >= 100} style={button} onClick={() => { setRows(rs => [...rs, blankExercise()]); setDirty(true); }}>+ Add exercise</button><button type="submit" style={button} disabled={!dirty}>{saving ? "Saving…" : "Save workout"}</button></div>
        </fieldset>
      </form>
    </>}
  </>;
}

function ProgramDetails({ program, onSaved }) {
  const [draft, setDraft] = useState(program);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function save() {
    setBusy(true); setNotice("");
    try {
      if (!draft.name.trim()) throw new Error("Program name is required.");
      const payload = Object.fromEntries(["name", "goal", "equipment", "experience_level", "location", "description"].map(k => [k, draft[k] || ""]));
      const { data, error } = await supabase.from("programs").update(payload).eq("id", program.id).select().single();
      if (error) throw error;
      onSaved(data); setNotice("Program details saved.");
    } catch(e) { setNotice(e.message); } finally { setBusy(false); }
  }
  return <details style={card}><summary>Edit program details {program.client_id ? "· Client copy" : "· Shared template"}</summary><fieldset disabled={busy} style={{border: 0, padding: 0}}><div style={{...grid, marginTop: 15}}>{[["name", "Program name"], ["goal", "Goal"], ["equipment", "Equipment"], ["experience_level", "Experience"], ["location", "Location"]].map(([key,label]) => <Field key={key} label={label}><input style={input} maxLength={key === "name" ? 150 : 500} value={draft[key] || ""} onChange={e => setDraft(d => ({...d, [key]: e.target.value}))}/></Field>)}</div><Field label="Description"><textarea style={input} value={draft.description || ""} onChange={e => setDraft(d => ({...d, description: e.target.value}))}/></Field><button type="button" style={button} onClick={save}>{busy ? "Saving…" : "Save program details"}</button><p role="status">{notice}</p></fieldset></details>;
}
