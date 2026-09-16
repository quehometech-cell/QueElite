"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientWorkouts({
  client,
  program,
  exercises = [],
  programs = [],
  weeklyCompletions = [],
  onProgramChanged,
}) {
  const [selectedProgramId, setSelectedProgramId] =
    useState(program?.id || "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  if (!client) {
    return (
      <div style={styles.emptyCard}>
        Select a client before managing workouts.
      </div>
    );
  }

  async function changeProgram() {
    if (!selectedProgramId) {
      setErrorMessage("Select a program first.");
      return;
    }

    if (selectedProgramId === program?.id) {
      setMessage(
        "This program is already assigned to the client."
      );
      setErrorMessage("");
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      // Remove the client's current assignment.
      const { error: deleteError } = await supabase
        .from("member_programs")
        .delete()
        .eq("user_id", client.id);

      if (deleteError) {
        throw deleteError;
      }

      // Create the new assignment.
      const { error: insertError } = await supabase
        .from("member_programs")
        .insert({
          user_id: client.id,
          program_id: selectedProgramId,
        });

      if (insertError) {
        throw insertError;
      }

      setMessage("Program updated successfully.");

      if (onProgramChanged) {
        await onProgramChanged(selectedProgramId);
      }
    } catch (error) {
      console.error("Program assignment error:", error);

      setErrorMessage(
        error?.message ||
          "The program could not be updated."
      );
    } finally {
      setSaving(false);
    }
  }

  const groupedDays = exercises.reduce(
    (groups, exercise) => {
      const day =
        exercise.workout_day || 1;

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(exercise);

      return groups;
    },
    {}
  );

  const workoutDays = Object.keys(groupedDays)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <section>
      <p style={styles.goldLabel}>
        CLIENT TRAINING
      </p>

      <h2 style={styles.title}>
        {client.full_name || "Client"}'s Workouts
      </h2>

      <p style={styles.description}>
        Review the client's current training plan,
        workout structure, and weekly completion.
      </p>

      <div style={styles.topGrid}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>
            CURRENT PROGRAM
          </p>

          <h3 style={styles.programName}>
            {program?.name || "No Program Assigned"}
          </h3>

          {program ? (
            <>
              <p style={styles.bodyText}>
                {program.description ||
                  "Training program assigned by Que."}
              </p>

              <div style={styles.programStats}>
                <Stat
                  label="DAYS"
                  value={
                    program.days_per_week || "-"
                  }
                />

                <Stat
                  label="SESSION"
                  value={
                    program.session_minutes
                      ? `${program.session_minutes} min`
                      : "-"
                  }
                />

                <Stat
                  label="LEVEL"
                  value={formatText(
                    program.experience_level
                  )}
                />

                <Stat
                  label="LOCATION"
                  value={formatText(
                    program.location
                  )}
                />
              </div>
            </>
          ) : (
            <p style={styles.bodyText}>
              This client does not currently have a
              training program.
            </p>
          )}
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>
            ASSIGN PROGRAM
          </p>

          <h3 style={styles.cardTitle}>
            Change Training Plan
          </h3>

          <p style={styles.bodyText}>
            Choose the program you want this client
            to see in their member portal.
          </p>

          <select
            value={selectedProgramId}
            onChange={(event) => {
              setSelectedProgramId(
                event.target.value
              );

              setMessage("");
              setErrorMessage("");
            }}
            style={styles.select}
          >
            <option value="">
              Select a program
            </option>

            {programs.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={changeProgram}
            disabled={
              saving || !selectedProgramId
            }
            style={{
              ...styles.goldButton,
              opacity:
                saving || !selectedProgramId
                  ? 0.5
                  : 1,
              cursor:
                saving || !selectedProgramId
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {saving
              ? "UPDATING..."
              : "ASSIGN PROGRAM"}
          </button>

          {message && (
            <p style={styles.successText}>
              {message}
            </p>
          )}

          {errorMessage && (
            <p style={styles.errorText}>
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      <div style={styles.weekCard}>
        <div>
          <p style={styles.cardLabel}>
            THIS WEEK
          </p>

          <h3 style={styles.cardTitle}>
            Workout Completion
          </h3>
        </div>

        <div style={styles.weekCount}>
          <strong style={styles.weekNumber}>
            {weeklyCompletions.length}
          </strong>

          <span style={styles.weekLabel}>
            COMPLETED
          </span>
        </div>
      </div>

      {weeklyCompletions.length > 0 && (
        <div style={styles.completionList}>
          {weeklyCompletions.map(
            (completion) => (
              <div
                key={completion.id}
                style={styles.completionRow}
              >
                <div>
                  <strong
                    style={
                      styles.completionTitle
                    }
                  >
                    Workout Day{" "}
                    {completion.workout_day}
                  </strong>

                  <span
                    style={
                      styles.completionDate
                    }
                  >
                    {formatDateTime(
                      completion.completed_at
                    )}
                  </span>
                </div>

                <span
                  style={
                    styles.completedBadge
                  }
                >
                  COMPLETED
                </span>
              </div>
            )
          )}
        </div>
      )}

      <div style={styles.workoutHeader}>
        <div>
          <p style={styles.cardLabel}>
            PROGRAM DETAILS
          </p>

          <h3 style={styles.cardTitle}>
            Current Workout Plan
          </h3>
        </div>

        <span style={styles.exerciseCount}>
          {exercises.length} EXERCISES
        </span>
      </div>

      {!program ? (
        <div style={styles.emptyCard}>
          Assign a program to begin building this
          client's training plan.
        </div>
      ) : workoutDays.length === 0 ? (
        <div style={styles.emptyCard}>
          This program does not have workout
          prescriptions yet.
        </div>
      ) : (
        <div style={styles.days}>
          {workoutDays.map((day) => (
            <div
              key={day}
              style={styles.dayCard}
            >
              <div style={styles.dayHeader}>
                <div>
                  <span style={styles.dayLabel}>
                    WORKOUT
                  </span>

                  <h3 style={styles.dayTitle}>
                    Day {day}
                  </h3>
                </div>

                <span style={styles.dayCount}>
                  {groupedDays[day].length}{" "}
                  exercises
                </span>
              </div>

              <div style={styles.exerciseList}>
                {groupedDays[day].map(
                  (exercise, index) => (
                    <ExerciseRow
                      key={
                        exercise.program_exercise_id ||
                        `${exercise.id}-${index}`
                      }
                      exercise={exercise}
                      number={index + 1}
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ExerciseRow({
  exercise,
  number,
}) {
  return (
    <div style={styles.exerciseRow}>
      <div style={styles.exerciseNumber}>
        {number}
      </div>

      <div style={styles.exerciseMain}>
        <strong style={styles.exerciseName}>
          {exercise.name}
        </strong>

        <div style={styles.exerciseMeta}>
          {exercise.sets && (
            <span style={styles.metaTag}>
              {exercise.sets} sets
            </span>
          )}

          {exercise.reps && (
            <span style={styles.metaTag}>
              {exercise.reps} reps
            </span>
          )}

          {exercise.rest_seconds && (
            <span style={styles.metaTag}>
              {exercise.rest_seconds}s rest
            </span>
          )}

          {exercise.equipment && (
            <span style={styles.metaTag}>
              {formatText(
                exercise.equipment
              )}
            </span>
          )}
        </div>

        {exercise.notes && (
          <p style={styles.exerciseNotes}>
            Que's note: {exercise.notes}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <strong style={styles.statValue}>
        {value}
      </strong>

      <span style={styles.statLabel}>
        {label}
      </span>
    </div>
  );
}

function formatText(value) {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

const styles = {
  goldLabel: {
    color: "#F4C20D",
    fontWeight: "900",
    letterSpacing: "1.5px",
    fontSize: "11px",
    margin: 0,
  },

  title: {
    color: "#FFFFFF",
    fontSize: "clamp(32px, 6vw, 52px)",
    margin: "8px 0 8px",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "750px",
    marginBottom: "25px",
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
  },

  card: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
  },

  cardLabel: {
    color: "#F4C20D",
    fontWeight: "900",
    fontSize: "9px",
    letterSpacing: "1px",
    margin: 0,
  },

  programName: {
    color: "#FFFFFF",
    fontSize: "25px",
    margin: "8px 0",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "20px",
    margin: "7px 0 10px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    fontSize: "13px",
  },

  programStats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(90px, 1fr))",
    gap: "8px",
    marginTop: "18px",
  },

  stat: {
    background: "#050505",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: "12px",
  },

  statLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
    marginTop: "4px",
  },

  select: {
    width: "100%",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "13px",
    marginTop: "10px",
  },

  goldButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "8px",
    padding: "13px",
    marginTop: "12px",
    fontWeight: "900",
  },

  successText: {
    color: "#F4C20D",
    fontSize: "11px",
    marginBottom: 0,
  },

  errorText: {
    color: "#FFFFFF",
    background: "#2A1111",
    padding: "10px",
    borderRadius: "7px",
    fontSize: "11px",
  },

  weekCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "20px",
    marginTop: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  weekCount: {
    textAlign: "right",
  },

  weekNumber: {
    display: "block",
    color: "#F4C20D",
    fontSize: "30px",
  },

  weekLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
  },

  completionList: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    overflow: "hidden",
    marginTop: "10px",
  },

  completionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "14px 18px",
    borderBottom: "1px solid #2A2A2A",
  },

  completionTitle: {
    display: "block",
    color: "#FFFFFF",
    fontSize: "12px",
  },

  completionDate: {
    display: "block",
    color: "#777777",
    fontSize: "10px",
    marginTop: "3px",
  },

  completedBadge: {
    color: "#F4C20D",
    fontSize: "8px",
    fontWeight: "900",
  },

  workoutHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginTop: "30px",
    marginBottom: "12px",
  },

  exerciseCount: {
    color: "#777777",
    fontSize: "9px",
    fontWeight: "900",
  },

  days: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  dayCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    overflow: "hidden",
  },

  dayHeader: {
    padding: "18px",
    borderBottom: "1px solid #2A2A2A",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dayLabel: {
    color: "#F4C20D",
    fontSize: "8px",
    fontWeight: "900",
  },

  dayTitle: {
    color: "#FFFFFF",
    margin: "3px 0 0",
  },

  dayCount: {
    color: "#777777",
    fontSize: "10px",
  },

  exerciseList: {
    display: "flex",
    flexDirection: "column",
  },

  exerciseRow: {
    display: "flex",
    gap: "13px",
    padding: "16px 18px",
    borderBottom: "1px solid #202020",
  },

  exerciseNumber: {
    width: "30px",
    height: "30px",
    minWidth: "30px",
    borderRadius: "50%",
    background: "#F4C20D",
    color: "#050505",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
    fontSize: "11px",
  },

  exerciseMain: {
    flex: 1,
  },

  exerciseName: {
    color: "#FFFFFF",
    fontSize: "14px",
  },

  exerciseMeta: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "8px",
  },

  metaTag: {
    background: "#050505",
    color: "#BDBDBD",
    borderRadius: "15px",
    padding: "5px 8px",
    fontSize: "9px",
  },

  exerciseNotes: {
    color: "#777777",
    fontSize: "11px",
    lineHeight: 1.5,
    marginBottom: 0,
  },

  emptyCard: {
    background: "#111111",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "25px",
  },
};
