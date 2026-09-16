"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientWorkouts({
  client,
  program,
  exercises = [],
  programs = [],
  weeklyCompletions = [],
  onProgramChanged,
}) {
  const [selectedProgramId, setSelectedProgramId] = useState(
    program?.id || ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const groupedWorkouts = useMemo(() => {
    const grouped = {};

    exercises.forEach((exercise) => {
      const day = exercise.workout_day || 1;

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push(exercise);
    });

    Object.keys(grouped).forEach((day) => {
      grouped[day].sort(
        (a, b) => (a.exercise_order || 0) - (b.exercise_order || 0)
      );
    });

    return grouped;
  }, [exercises]);

  async function changeProgram() {
    if (!client?.id) {
      setMessage("Client information is missing.");
      return;
    }

    if (!selectedProgramId) {
      setMessage("Select a program first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc("coach_assign_program", {
        p_client_id: client.id,
        p_program_id: selectedProgramId,
      });

      if (error) {
        throw error;
      }

      setMessage("Program assigned successfully.");

      if (onProgramChanged) {
        await onProgramChanged();
      }
    } catch (error) {
      console.error("Program assignment error:", error);
      setMessage(error.message || "Unable to assign program.");
    } finally {
      setSaving(false);
    }
  }

  const styles = {
    page: {
      display: "grid",
      gap: "20px",
    },

    card: {
      background: "#111111",
      border: "1px solid #2A2A2A",
      borderRadius: "16px",
      padding: "22px",
    },

    title: {
      margin: 0,
      color: "#FFFFFF",
      fontSize: "24px",
      fontWeight: "800",
    },

    subtitle: {
      color: "#BDBDBD",
      marginTop: "6px",
      lineHeight: "1.5",
    },

    label: {
      display: "block",
      color: "#F4C20D",
      fontWeight: "700",
      marginBottom: "8px",
    },

    select: {
      width: "100%",
      padding: "13px",
      borderRadius: "10px",
      border: "1px solid #2A2A2A",
      background: "#050505",
      color: "#FFFFFF",
      fontSize: "15px",
      outline: "none",
    },

    button: {
      marginTop: "12px",
      padding: "12px 18px",
      borderRadius: "10px",
      border: "none",
      background: "#F4C20D",
      color: "#050505",
      fontWeight: "800",
      cursor: "pointer",
    },

    disabledButton: {
      marginTop: "12px",
      padding: "12px 18px",
      borderRadius: "10px",
      border: "none",
      background: "#2A2A2A",
      color: "#BDBDBD",
      fontWeight: "800",
      cursor: "not-allowed",
    },

    programName: {
      color: "#F4C20D",
      fontSize: "20px",
      fontWeight: "800",
      marginTop: "10px",
    },

    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "12px",
      marginTop: "18px",
    },

    stat: {
      background: "#050505",
      border: "1px solid #2A2A2A",
      borderRadius: "12px",
      padding: "15px",
    },

    statLabel: {
      color: "#BDBDBD",
      fontSize: "13px",
    },

    statValue: {
      color: "#FFFFFF",
      fontSize: "20px",
      fontWeight: "800",
      marginTop: "4px",
    },

    workoutDay: {
      background: "#111111",
      border: "1px solid #2A2A2A",
      borderRadius: "16px",
      overflow: "hidden",
    },

    dayHeader: {
      padding: "18px 20px",
      background: "#050505",
      borderBottom: "1px solid #2A2A2A",
      color: "#F4C20D",
      fontSize: "18px",
      fontWeight: "800",
    },

    exercise: {
      padding: "18px 20px",
      borderBottom: "1px solid #2A2A2A",
    },

    exerciseName: {
      color: "#FFFFFF",
      fontSize: "16px",
      fontWeight: "700",
    },

    exerciseDetails: {
      color: "#BDBDBD",
      marginTop: "6px",
      fontSize: "14px",
      lineHeight: "1.5",
    },

    note: {
      color: "#BDBDBD",
      marginTop: "8px",
      fontSize: "13px",
      lineHeight: "1.5",
    },

    message: {
      marginTop: "12px",
      color: "#F4C20D",
      fontWeight: "700",
    },

    empty: {
      background: "#111111",
      border: "1px solid #2A2A2A",
      borderRadius: "16px",
      padding: "28px",
      color: "#BDBDBD",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Client Workouts</h2>

        <div style={styles.subtitle}>
          Manage {client?.full_name || client?.email || "this client's"} training
          program and review their current workout prescription.
        </div>

        <div style={{ marginTop: "22px" }}>
          <label style={styles.label}>Assign Training Program</label>

          <select
            style={styles.select}
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setMessage("");
            }}
          >
            <option value="">Select a program</option>

            {programs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={changeProgram}
            disabled={saving || !selectedProgramId}
            style={
              saving || !selectedProgramId
                ? styles.disabledButton
                : styles.button
            }
          >
            {saving ? "Assigning..." : "Assign Program"}
          </button>

          {message && <div style={styles.message}>{message}</div>}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.label}>CURRENT PROGRAM</div>

        {program ? (
          <>
            <div style={styles.programName}>{program.name}</div>

            {program.description && (
              <div style={styles.subtitle}>{program.description}</div>
            )}

            <div style={styles.statGrid}>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Days / Week</div>
                <div style={styles.statValue}>
                  {program.days_per_week || "—"}
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statLabel}>Session Length</div>
                <div style={styles.statValue}>
                  {program.session_minutes
                    ? `${program.session_minutes} min`
                    : "—"}
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statLabel}>Location</div>
                <div style={styles.statValue}>
                  {program.location || "—"}
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statLabel}>This Week</div>
                <div style={styles.statValue}>
                  {weeklyCompletions.length}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={styles.subtitle}>
            No training program is currently assigned.
          </div>
        )}
      </div>

      {program && Object.keys(groupedWorkouts).length > 0 ? (
        Object.keys(groupedWorkouts)
          .sort((a, b) => Number(a) - Number(b))
          .map((day) => (
            <div key={day} style={styles.workoutDay}>
              <div style={styles.dayHeader}>Workout Day {day}</div>

              {groupedWorkouts[day].map((item, index) => {
                const exercise = item.exercise || {};

                return (
                  <div
                    key={item.id || `${day}-${index}`}
                    style={{
                      ...styles.exercise,
                      borderBottom:
                        index === groupedWorkouts[day].length - 1
                          ? "none"
                          : styles.exercise.borderBottom,
                    }}
                  >
                    <div style={styles.exerciseName}>
                      {exercise.name || item.name || "Exercise"}
                    </div>

                    <div style={styles.exerciseDetails}>
                      {item.sets ? `${item.sets} sets` : ""}
                      {item.sets && item.reps ? " × " : ""}
                      {item.reps || ""}
                      {item.rest_seconds
                        ? ` • ${item.rest_seconds}s rest`
                        : ""}
                    </div>

                    {item.notes && (
                      <div style={styles.note}>{item.notes}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
      ) : program ? (
        <div style={styles.empty}>
          This program does not have a workout prescription yet.
        </div>
      ) : null}
    </div>
  );
}
