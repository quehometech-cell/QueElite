"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../../lib/supabase";

export default function CorrectiveMobility({
  user,
  routine,
  exercises = [],
  onCompletionChange,
}) {
  const [exerciseCompletions, setExerciseCompletions] =
    useState([]);
  const [routineCompletions, setRoutineCompletions] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [savingExerciseId, setSavingExerciseId] =
    useState(null);
  const [finishing, setFinishing] = useState(false);
  const [message, setMessage] = useState("");

  const weekStart = useMemo(
    () => getStartOfWeekISO(),
    []
  );

  const routineId = routine?.id || null;

  const getExerciseId = useCallback((exercise) => {
    const rawId =
      exercise?.exercise_id ??
      exercise?.id;

    if (
      rawId === null ||
      rawId === undefined ||
      rawId === ""
    ) {
      return null;
    }

    const id = Number(rawId);

    return Number.isFinite(id) && id > 0
      ? id
      : null;
  }, []);

  const loadCompletions = useCallback(async () => {
    if (!user?.id || !routineId) {
      setExerciseCompletions([]);
      setRoutineCompletions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const [exerciseResult, routineResult] =
        await Promise.all([
          supabase
            .from(
              "corrective_exercise_completions"
            )
            .select(
              "id, exercise_id, completed_at"
            )
            .eq("user_id", user.id)
            .eq("routine_id", routineId)
            .gte("completed_at", weekStart),

          supabase
            .from(
              "corrective_routine_completions"
            )
            .select("id, completed_at")
            .eq("user_id", user.id)
            .eq("routine_id", routineId)
            .gte("completed_at", weekStart),
        ]);

      if (exerciseResult.error) {
        throw exerciseResult.error;
      }

      if (routineResult.error) {
        throw routineResult.error;
      }

      setExerciseCompletions(
        exerciseResult.data || []
      );

      setRoutineCompletions(
        routineResult.data || []
      );
    } catch (error) {
      console.error(
        "Corrective completion load error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to load your corrective progress."
      );
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    routineId,
    weekStart,
  ]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  function isExerciseComplete(exercise) {
    const exerciseId =
      getExerciseId(exercise);

    if (!exerciseId) {
      return false;
    }

    return exerciseCompletions.some(
      (completion) =>
        Number(completion.exercise_id) ===
        exerciseId
    );
  }

  const allExercisesComplete =
    exercises.length > 0 &&
    exercises.every((exercise) =>
      isExerciseComplete(exercise)
    );

  async function toggleExercise(exercise) {
    if (!user?.id || !routineId) {
      return;
    }

    const exerciseId =
      getExerciseId(exercise);

    if (!exerciseId) {
      setMessage(
        "Unable to identify this movement."
      );
      return;
    }

    setSavingExerciseId(exerciseId);
    setMessage("");

    try {
      const existing =
        exerciseCompletions.find(
          (completion) =>
            Number(
              completion.exercise_id
            ) === exerciseId
        );

      if (existing) {
        const { error } = await supabase
          .from(
            "corrective_exercise_completions"
          )
          .delete()
          .eq("id", existing.id)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        setExerciseCompletions(
          (current) =>
            current.filter(
              (completion) =>
                completion.id !==
                existing.id
            )
        );

        return;
      }

      const { data, error } =
        await supabase
          .from(
            "corrective_exercise_completions"
          )
          .insert({
            user_id: user.id,
            routine_id: routineId,
            exercise_id: exerciseId,
          })
          .select(
            "id, exercise_id, completed_at"
          )
          .single();

      if (error) {
        if (error.code === "23505") {
          await loadCompletions();
          return;
        }

        throw error;
      }

      setExerciseCompletions(
        (current) => [
          ...current,
          data,
        ]
      );
    } catch (error) {
      console.error(
        "Corrective exercise completion error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to update this movement."
      );
    } finally {
      setSavingExerciseId(null);
    }
  }

  async function finishRoutine() {
    if (!user?.id || !routineId) {
      return;
    }

    if (!allExercisesComplete) {
      setMessage(
        "Complete every movement before finishing this routine."
      );
      return;
    }

    setFinishing(true);
    setMessage("");

    try {
      const { data, error } =
        await supabase
          .from(
            "corrective_routine_completions"
          )
          .insert({
            user_id: user.id,
            routine_id: routineId,
          })
          .select(
            "id, completed_at"
          )
          .single();

      if (error) {
        if (error.code === "23505") {
          await loadCompletions();

          setMessage(
            "You already completed this routine today."
          );

          return;
        }

        throw error;
      }

      setRoutineCompletions(
        (current) => [
          ...current,
          data,
        ]
      );

      setMessage(
        "Corrective routine completed. Great work."
      );

      if (onCompletionChange) {
        await onCompletionChange();
      }
    } catch (error) {
      console.error(
        "Corrective routine completion error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to finish this routine."
      );
    } finally {
      setFinishing(false);
    }
  }

  if (!routine) {
    return (
      <section>
        <p style={styles.goldLabel}>
          CORRECTIVE & MOBILITY
        </p>

        <h2 style={styles.title}>
          MOVE BETTER
        </h2>

        <div style={styles.emptyCard}>
          <h3 style={styles.cardTitle}>
            No Corrective Routine Assigned
          </h3>

          <p style={styles.bodyText}>
            You do not currently have
            corrective or mobility work
            assigned by Que.
          </p>

          <p style={styles.bodyText}>
            If your coach assigns mobility,
            posture, stability, or movement
            work, it will appear here.
          </p>
        </div>

        <Disclaimer />
      </section>
    );
  }

  if (loading) {
    return (
      <section>
        <p style={styles.goldLabel}>
          CORRECTIVE & MOBILITY
        </p>

        <h2 style={styles.title}>
          {routine.name}
        </h2>

        <div style={styles.emptyCard}>
          <p style={styles.bodyText}>
            Loading your corrective
            progress...
          </p>
        </div>
      </section>
    );
  }

  const weeklyTarget =
    Number(routine.days_per_week) || 0;

  const weeklyCompleted =
    routineCompletions.length;

  const progressPercent =
    weeklyTarget > 0
      ? Math.min(
          (weeklyCompleted /
            weeklyTarget) *
            100,
          100
        )
      : 0;

  return (
    <section>
      <p style={styles.goldLabel}>
        CORRECTIVE & MOBILITY
      </p>

      <h2 style={styles.title}>
        {routine.name}
      </h2>

      <p style={styles.description}>
        {routine.description ||
          "Complete this routine as assigned by your coach."}
      </p>

      <div style={styles.stats}>
        <Stat
          value={
            routine.days_per_week || "-"
          }
          label="DAYS / WEEK"
        />

        <Stat
          value={
            routine.session_minutes || "-"
          }
          label="MINUTES"
        />

        <Stat
          value={exercises.length}
          label="MOVEMENTS"
        />

        <Stat
          value={`${weeklyCompleted}/${weeklyTarget || "-"}`}
          label="THIS WEEK"
        />
      </div>

      {weeklyTarget > 0 && (
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <div>
              <p style={styles.goldLabel}>
                WEEKLY PROGRESS
              </p>

              <strong
                style={
                  styles.progressText
                }
              >
                {weeklyCompleted} of{" "}
                {weeklyTarget} sessions
                completed
              </strong>
            </div>

            <strong
              style={
                styles.progressPercent
              }
            >
              {Math.round(
                progressPercent
              )}
              %
            </strong>
          </div>

          <div
            style={
              styles.progressBackground
            }
          >
            <div
              style={{
                ...styles.progressFill,
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>
      )}

      {routine.focus_area && (
        <div style={styles.focusCard}>
          <p style={styles.goldLabel}>
            FOCUS AREA
          </p>

          <h3 style={styles.focusTitle}>
            {formatText(
              routine.focus_area
            )}
          </h3>
        </div>
      )}

      {routine.coach_notes && (
        <div style={styles.coachNote}>
          <p style={styles.goldLabel}>
            QUE&apos;S INSTRUCTIONS
          </p>

          <p style={styles.bodyText}>
            {routine.coach_notes}
          </p>
        </div>
      )}

      {message && (
        <div style={styles.message}>
          {message}
        </div>
      )}

      {exercises.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.bodyText}>
            Your corrective movements are
            being prepared.
          </p>
        </div>
      ) : (
        <div style={styles.routineCard}>
          <div style={styles.routineHeader}>
            <div>
              <p style={styles.goldLabel}>
                TODAY&apos;S ROUTINE
              </p>

              <h3
                style={
                  styles.routineTitle
                }
              >
                Complete Every Movement
              </h3>
            </div>

            <div
              style={
                styles.movementCount
              }
            >
              {
                exerciseCompletions.length
              }
              /{exercises.length}
            </div>
          </div>

          <div>
            {exercises.map(
              (exercise, index) => {
                const exerciseId =
                  getExerciseId(
                    exercise
                  );

                const complete =
                  isExerciseComplete(
                    exercise
                  );

                const saving =
                  savingExerciseId ===
                  exerciseId;

                return (
                  <CorrectiveExercise
                    key={
                      exercise.corrective_exercise_id ||
                      `${exerciseId}-${index}`
                    }
                    exercise={
                      exercise
                    }
                    number={
                      index + 1
                    }
                    complete={
                      complete
                    }
                    saving={
                      saving
                    }
                    disabled={
                      !exerciseId
                    }
                    onToggle={() =>
                      toggleExercise(
                        exercise
                      )
                    }
                  />
                );
              }
            )}
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              disabled={
                !allExercisesComplete ||
                finishing
              }
              onClick={finishRoutine}
              style={
                !allExercisesComplete ||
                finishing
                  ? styles.disabledButton
                  : styles.finishButton
              }
            >
              {finishing
                ? "SAVING..."
                : allExercisesComplete
                ? "FINISH ROUTINE"
                : "COMPLETE ALL MOVEMENTS"}
            </button>
          </div>
        </div>
      )}

      <Disclaimer />
    </section>
  );
}

function CorrectiveExercise({
  exercise,
  number,
  complete,
  saving,
  disabled,
  onToggle,
}) {
  return (
    <article
      style={{
        ...styles.exerciseCard,
        borderColor: complete
          ? "#F4C20D"
          : "#2A2A2A",
      }}
    >
      <div
        style={styles.exerciseHeader}
      >
        <button
          type="button"
          onClick={onToggle}
          disabled={
            saving || disabled
          }
          aria-label={
            complete
              ? `Mark ${exercise.name} incomplete`
              : `Mark ${exercise.name} complete`
          }
          style={{
            ...styles.checkbox,
            background: complete
              ? "#F4C20D"
              : "#050505",
            color: complete
              ? "#050505"
              : "#FFFFFF",
            opacity:
              saving || disabled
                ? 0.6
                : 1,
            cursor:
              saving || disabled
                ? "not-allowed"
                : "pointer",
          }}
        >
          {complete ? "✓" : ""}
        </button>

        <div style={styles.number}>
          {number}
        </div>

        <div
          style={
            styles.exerciseHeading
          }
        >
          <h3
            style={
              styles.exerciseName
            }
          >
            {exercise.name}
          </h3>

          <div style={styles.tags}>
            {exercise.muscle_group && (
              <span style={styles.tag}>
                {formatText(
                  exercise.muscle_group
                )}
              </span>
            )}

            {exercise.equipment && (
              <span style={styles.tag}>
                {formatText(
                  exercise.equipment
                )}
              </span>
            )}

            {exercise.difficulty && (
              <span style={styles.tag}>
                {formatText(
                  exercise.difficulty
                )}
              </span>
            )}
          </div>
        </div>

        {complete && (
          <div
            style={
              styles.completeBadge
            }
          >
            ✓ COMPLETE
          </div>
        )}
      </div>

      <div
        style={styles.prescription}
      >
        <Prescription
          value={exercise.sets || "-"}
          label="SETS"
        />

        <Prescription
          value={exercise.reps || "-"}
          label="REPS"
        />

        <Prescription
          value={
            exercise.duration_seconds
              ? `${exercise.duration_seconds}s`
              : "-"
          }
          label="TIME"
        />

        <Prescription
          value={
            exercise.rest_seconds
              ? `${exercise.rest_seconds}s`
              : "-"
          }
          label="REST"
        />
      </div>

      {exercise.instructions && (
        <div style={styles.instructions}>
          <strong
            style={
              styles.smallHeading
            }
          >
            HOW TO
          </strong>

          <p style={styles.bodyText}>
            {exercise.instructions}
          </p>
        </div>
      )}

      {exercise.notes && (
        <div
          style={
            styles.exerciseCoachNote
          }
        >
          <strong
            style={styles.noteTitle}
          >
            QUE&apos;S COACHING NOTE
          </strong>

          <p style={styles.bodyText}>
            {exercise.notes}
          </p>
        </div>
      )}

      {exercise.video_url && (
        <a
          href={exercise.video_url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.videoButton}
        >
          WATCH MOVEMENT VIDEO
        </a>
      )}
    </article>
  );
}

function Prescription({
  value,
  label,
}) {
  return (
    <div
      style={
        styles.prescriptionItem
      }
    >
      <strong
        style={
          styles.prescriptionValue
        }
      >
        {value}
      </strong>

      <span
        style={
          styles.prescriptionLabel
        }
      >
        {label}
      </span>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={styles.statCard}>
      <strong
        style={styles.statValue}
      >
        {value}
      </strong>

      <span
        style={styles.statLabel}
      >
        {label}
      </span>
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={styles.disclaimer}>
      <strong
        style={
          styles.disclaimerTitle
        }
      >
        TRAINING NOTE
      </strong>

      <p
        style={
          styles.disclaimerText
        }
      >
        Corrective and mobility
        exercises are provided for
        fitness, movement, and general
        wellness purposes. They are not
        medical diagnosis or treatment.
        Stop an exercise if it causes
        sharp or worsening pain and seek
        appropriate medical care when
        needed.
      </p>
    </div>
  );
}

function formatText(value) {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function getStartOfWeekISO() {
  const now = new Date();
  const day = now.getDay();

  const difference =
    now.getDate() -
    day +
    (day === 0 ? -6 : 1);

  const monday = new Date(now);

  monday.setDate(difference);
  monday.setHours(0, 0, 0, 0);

  return monday.toISOString();
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
    fontSize:
      "clamp(32px, 6vw, 52px)",
    margin: "8px 0 10px",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "800px",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    margin: "25px 0",
  },

  statCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
  },

  statValue: {
    color: "#F4C20D",
    fontSize: "30px",
  },

  statLabel: {
    color: "#BDBDBD",
    fontSize: "10px",
    marginTop: "4px",
  },

  progressCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
  },

  progressHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
  },

  progressText: {
    display: "block",
    color: "#FFFFFF",
    marginTop: "6px",
  },

  progressPercent: {
    color: "#F4C20D",
    fontSize: "24px",
  },

  progressBackground: {
    height: "9px",
    background: "#2A2A2A",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "15px",
  },

  progressFill: {
    height: "100%",
    background: "#F4C20D",
    borderRadius: "20px",
    transition:
      "width 0.3s ease",
  },

  focusCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "20px",
  },

  focusTitle: {
    color: "#FFFFFF",
    marginBottom: 0,
  },

  coachNote: {
    background: "#111111",
    borderLeft:
      "4px solid #F4C20D",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "25px",
  },

  message: {
    background: "#111111",
    border: "1px solid #F4C20D",
    borderRadius: "12px",
    padding: "13px 16px",
    color: "#F4C20D",
    fontWeight: "700",
    marginBottom: "15px",
  },

  routineCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    overflow: "hidden",
  },

  routineHeader: {
    background: "#050505",
    padding: "18px 20px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    borderBottom:
      "1px solid #2A2A2A",
  },

  routineTitle: {
    color: "#FFFFFF",
    margin: "5px 0 0",
  },

  movementCount: {
    color: "#F4C20D",
    fontWeight: "900",
    fontSize: "22px",
  },

  exerciseCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    padding: "22px",
    borderLeft: "none",
    borderRight: "none",
    borderTop: "none",
  },

  exerciseHeader: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  checkbox: {
    width: "30px",
    height: "30px",
    minWidth: "30px",
    borderRadius: "7px",
    border:
      "1px solid #F4C20D",
    fontWeight: "900",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  number: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    background: "#2A2A2A",
    color: "#FFFFFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
  },

  exerciseHeading: {
    flex: 1,
    minWidth: "180px",
  },

  exerciseName: {
    color: "#FFFFFF",
    fontSize: "21px",
    margin: "4px 0 10px",
  },

  completeBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: "900",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },

  tag: {
    background: "#2A2A2A",
    color: "#FFFFFF",
    borderRadius: "20px",
    padding: "5px 9px",
    fontSize: "10px",
  },

  prescription: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(90px, 1fr))",
    gap: "10px",
    margin: "20px 0",
  },

  prescriptionItem: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
  },

  prescriptionValue: {
    color: "#F4C20D",
    fontSize: "18px",
  },

  prescriptionLabel: {
    color: "#BDBDBD",
    fontSize: "9px",
    marginTop: "3px",
  },

  instructions: {
    marginTop: "15px",
  },

  smallHeading: {
    color: "#FFFFFF",
    fontSize: "11px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },

  exerciseCoachNote: {
    background: "#050505",
    borderLeft:
      "3px solid #F4C20D",
    padding: "14px",
    marginTop: "15px",
  },

  noteTitle: {
    color: "#F4C20D",
    fontSize: "11px",
  },

  videoButton: {
    display: "inline-block",
    color: "#F4C20D",
    textDecoration: "none",
    fontWeight: "900",
    marginTop: "15px",
  },

  footer: {
    padding: "18px 20px",
    borderTop:
      "1px solid #2A2A2A",
  },

  finishButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#F4C20D",
    color: "#050505",
    fontWeight: "900",
    cursor: "pointer",
  },

  disabledButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#2A2A2A",
    color: "#777777",
    fontWeight: "900",
    cursor: "not-allowed",
  },

  emptyCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "25px",
    marginTop: "20px",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "22px",
  },

  disclaimer: {
    background: "#0B0B0B",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "18px",
    marginTop: "30px",
  },

  disclaimerTitle: {
    color: "#F4C20D",
    fontSize: "10px",
    letterSpacing: "1px",
  },

  disclaimerText: {
    color: "#888888",
    lineHeight: 1.5,
    fontSize: "12px",
    marginBottom: 0,
  },
};
