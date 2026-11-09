"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const field = { width: "100%", boxSizing: "border-box", padding: 11, border: "1px solid #cfd5dd", borderRadius: 9, background: "#fff", color: "#17212f", fontSize: 15 };
const button = { border: 0, borderRadius: 9, padding: "12px 16px", background: "#b88718", color: "#fff", fontWeight: 800, cursor: "pointer", minHeight: 44 };
const blank = () => ({ exercise_id: "", sets: "3", reps: "8-12", rest: "60", notes: "" });

export default function OneOnOneSessionBuilder({ client }) {
  const [library, setLibrary] = useState([]);
  const [name, setName] = useState("One-on-One Training Session");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState([blank()]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.from("exercises")
      .select("id,name,category,tracking_type")
      .eq("is_active", true)
      .order("name")
      .then(({ data, error: loadError }) => {
        if (!active) return;
        if (loadError) setError(loadError.message);
        setLibrary(data || []);
      });
    return () => { active = false; };
  }, []);

  function update(index, key, value) {
    setRows(current => current.map((row, i) => i === index ? { ...row, [key]: value } : row));
  }

  async function save(event) {
    event.preventDefault();
    if (!client?.id || saving) return;
    setSaving(true); setNotice(""); setError("");
    let sessionId = null;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Your session expired. Sign in again.");
      const chosen = rows.filter(row => row.exercise_id);
      if (!name.trim()) throw new Error("Enter a session name.");
      if (!chosen.length) throw new Error("Add at least one exercise.");
      const payload = chosen.map((row, index) => {
        const exercise = library.find(item => String(item.id) === String(row.exercise_id));
        if (!exercise) throw new Error("One selected exercise is no longer available.");
        return {
          exercise_id: Number(exercise.id),
          exercise_order: index + 1,
          exercise_name: exercise.name,
          prescribed_sets: row.sets === "" ? null : Number(row.sets),
          prescribed_reps: row.reps.trim() || null,
          prescribed_rest_seconds: row.rest === "" ? null : Number(row.rest),
          notes: row.notes.trim() || null,
        };
      });
      if (payload.some(row => row.prescribed_sets !== null && (!Number.isInteger(row.prescribed_sets) || row.prescribed_sets < 1))) {
        throw new Error("Sets must be a positive whole number.");
      }
      if (payload.some(row => row.prescribed_rest_seconds !== null && (!Number.isInteger(row.prescribed_rest_seconds) || row.prescribed_rest_seconds < 0))) {
        throw new Error("Rest time must be zero or a positive whole number.");
      }

      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: client.id,
          member_program_id: null,
          program_workout_id: null,
          week_number: 1,
          workout_day: 1,
          workout_name: name.trim(),
          workout_notes: notes.trim() || null,
          status: "scheduled",
        })
        .select("id")
        .single();
      if (sessionError) throw sessionError;
      sessionId = session.id;

      const { error: logError } = await supabase.from("workout_exercise_logs").insert(
        payload.map(row => ({ ...row, workout_session_id: session.id, completed: false }))
      );
      if (logError) throw logError;

      setNotice("One-on-one session assigned. The client will see only this session in their workout area; no multi-week program was created.");
      setName("One-on-One Training Session");
      setNotes("");
      setRows([blank()]);
    } catch (e) {
      if (sessionId) await supabase.from("workout_sessions").delete().eq("id", sessionId).eq("user_id", client.id);
      setError(e?.message || "Unable to assign this session.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 16, padding: 20, boxShadow: "0 4px 18px rgba(16,24,40,.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, color: "#9a7418", fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>COACH-ONLY WORKFLOW</p>
          <h3 style={{ margin: "5px 0", color: "#17212f", fontSize: 20 }}>Create one-on-one session</h3>
          <p style={{ margin: 0, color: "#667085", fontSize: 13, lineHeight: 1.5 }}>For a single paid or private appointment. This does not assign a monthly or multi-week coaching program.</p>
        </div>
      </div>
      <form onSubmit={save} style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6, color: "#344054", fontWeight: 700 }}>Session name
          <input style={field} maxLength={120} value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label style={{ display: "grid", gap: 6, color: "#344054", fontWeight: 700 }}>Coach notes
          <textarea style={{ ...field, minHeight: 72 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Session focus, warm-up, equipment, or special instructions…" />
        </label>
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row, index) => (
            <div key={index} style={{ border: "1px solid #e4e7ec", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
              <strong style={{ color: "#17212f" }}>Exercise {index + 1}</strong>
              <label style={{ display: "grid", gap: 5, color: "#344054", fontWeight: 700 }}>Exercise
                <select style={field} value={row.exercise_id} onChange={e => update(index, "exercise_id", e.target.value)} required>
                  <option value="">Choose an exercise</option>
                  {library.map(item => <option key={item.id} value={item.id}>{item.name}{item.category ? ` · ${item.category}` : ""}</option>)}
                </select>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                <label style={{ display: "grid", gap: 4, color: "#667085", fontSize: 12 }}>Sets<input style={field} type="number" min="1" max="100" value={row.sets} onChange={e => update(index, "sets", e.target.value)} /></label>
                <label style={{ display: "grid", gap: 4, color: "#667085", fontSize: 12 }}>Reps / time<input style={field} value={row.reps} onChange={e => update(index, "reps", e.target.value)} placeholder="8-12" /></label>
                <label style={{ display: "grid", gap: 4, color: "#667085", fontSize: 12 }}>Rest (sec)<input style={field} type="number" min="0" value={row.rest} onChange={e => update(index, "rest", e.target.value)} /></label>
              </div>
              <label style={{ display: "grid", gap: 5, color: "#667085", fontSize: 12 }}>Exercise notes<input style={field} value={row.notes} onChange={e => update(index, "notes", e.target.value)} /></label>
              <button type="button" onClick={() => setRows(current => current.filter((_, i) => i !== index))} style={{ ...button, background: "#fff", color: "#9f2d24", border: "1px solid #e4b9b5", justifySelf: "start" }}>Remove exercise</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setRows(current => [...current, blank()])} style={{ ...button, background: "#fff", color: "#344054", border: "1px solid #d0d5dd" }}>+ Add exercise</button>
          <button type="submit" disabled={saving || !library.length} style={{ ...button, opacity: saving || !library.length ? .6 : 1 }}>{saving ? "Assigning session…" : "Assign one-on-one session"}</button>
        </div>
      </form>
      {notice && <p role="status" style={{ color: "#087443", background: "#ecfdf3", borderRadius: 9, padding: 12 }}>{notice}</p>}
      {error && <p role="alert" style={{ color: "#b42318", background: "#fef3f2", borderRadius: 9, padding: 12 }}>{error}</p>}
    </section>
  );
}
