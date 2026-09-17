"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Workouts({
  user,
  program,
  exercises = [],
  onCompletionChange,
}) {
  const [exerciseCompletions, setExerciseCompletions] = useState([]);
  const [workoutCompletions, setWorkoutCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingExerciseId, setSavingExerciseId] = useState(null);
  const [finishingDay, setFinishingDay] = useState(null);
  const [message, setMessage] = useState("");

  const weekStart = useMemo(() => getLocalWeekStartString(), []);
  const today = useMemo(() => getLocalDateString(), []);

  const groupedWorkouts = useMemo(() => {
    const grouped = {};

    exercises.forEach((item) => {
      const day = Number(item.workout_day || 1);

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push(item);
    });

    Object.keys(grouped).forEach((day) => {
      grouped[day].sort(
        (a, b) =>
          Number(a.exercise_order || 0) -
          Number(b.exercise_order || 0)
      );
    });

    return grouped;
  }, [exercises]);

  function getExerciseId(item) {
    const rawId =
      item?.exercise_id ??
      item?.exercise?.id ??
      item?.exercises?.id;

    if (
      rawId === null ||
      rawId === undefined ||
      rawId === ""
    ) {
      return null;
    }

    const id = Number(rawId);

    return Number.isFinite(id) && id > 0 ? id : null;
  }

  function getExerciseData(item) {
    return item?.exercise || item?.exercises || {};
  }

  const loadCompletions = useCallback(async () => {
    if (!user?.id || !program?.id) {
      setExerciseCompletions([]);
      setWorkoutCompletions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const [exerciseResult, workoutResult] = await Promise.all([
        supabase
          .from("exercise_completions")
          .select("id, exercise_id, workout_day, completion_date, completed_at")
          .eq("user_id", user.id)
          .eq("program_id", program.id)
          .gte("completion_date", weekStart)
          .lte("completion_date", today),

        supabase
          .from("workout_completions")
          .select("id, workout_day, completion_date, completed_at")
          .eq("user_id", user.id)
          .eq("program_id", program.id)
          .gte("completion_date", weekStart)
          .lte("completion_date", today),
      ]);

      if (exerciseResult.error) {
        throw exerciseResult.error;
      }

      if (workoutResult.error) {
        throw workoutResult.error;
      }

      setExerciseCompletions(exerciseResult.data || []);
      setWorkoutCompletions(workoutResult.data || []);
    } catch (error) {
      console.error("Workout completion load error:", error);

      setMessage(
        error?.message || "Unable to load workout progress."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, program?.id, weekStart, today]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  function isExerciseComplete(item) {
    const exerciseId = getExerciseId(item);

    if (!exerciseId) {
      return false;
    }

    return exerciseCompletions.some(
      (completion) =>
        Number(completion.exercise_id) === exerciseId &&
        Number(completion.workout_day) ===
          Number(item.workout_day || 1)
    );
  }

  function isWorkoutComplete(day) {
    return workoutCompletions.some(
      (completion) =>
        Number(completion.workout_day) === Number(day)
    );
  }

  function isDayReady(day) {
    const dayExercises = groupedWorkouts[day] || [];

    return (
      dayExercises.length > 0 &&
      dayExercises.every((item) => isExerciseComplete(item))
    );
  }

  async function toggleExercise(item) {
    if (!user?.id || !program?.id) {
      return;
    }

    const exerciseId = getExerciseId(item);

    if (!exerciseId) {
      console.error("Missing exercise ID:", item);

      setMessage(
        "Unable to identify this exercise. Please refresh and try again."
      );

      return;
    }

    const workoutDay = Number(item.workout_day || 1);

    const savingKey = `${workoutDay}-${exerciseId}`;

    setSavingExerciseId(savingKey);
    setMessage("");

    try {
      const existing = exerciseCompletions.find(
        (completion) =>
          Number(completion.exercise_id) === exerciseId &&
          Number(completion.workout_day) === workoutDay
      );

      if (existing) {
        const { error } = await supabase
          .from("exercise_completions")
          .delete()
          .eq("id", existing.id)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        setExerciseCompletions((current) =>
          current.filter(
            (completion) => completion.id !== existing.id
          )
        );

        return;
      }

      const { data, error } = await supabase
        .from("exercise_completions")
        .insert({
          user_id: user.id,
          program_id: program.id,
          exercise_id: exerciseId,
          workout_day: workoutDay,
          completion_date: today,
        })
        .select("id, exercise_id, workout_day, completion_date, completed_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          await loadCompletions();
          return;
        }

        throw error;
      }

      setExerciseCompletions((current) => [
        ...current,
        data,
      ]);
    } catch (error) {
      console.error("Exercise completion error:", error);

      setMessage(
        error?.message || "Unable to update exercise."
      );
    } finally {
      setSavingExerciseId(null);
    }
  }

  async function finishWorkout(day) {
    if (!user?.id || !program?.id) {
      return;
    }

    const workoutDay = Number(day);

    if (isWorkoutComplete(workoutDay)) {
      setMessage(
        `Workout Day ${workoutDay} is already complete for this week.`
      );

      return;
    }

    if (!isDayReady(workoutDay)) {
      setMessage(
        "Complete every exercise before finishing this workout."
      );

      return;
    }

    setFinishingDay(workoutDay);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("workout_completions")
        .insert({
          user_id: user.id,
          program_id: program.id,
          workout_day: workoutDay,
          completion_date: today,
        })
        .select("id, workout_day, completion_date, completed_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          await loadCompletions();

          setMessage(
            `Workout Day ${workoutDay} is already complete for this week.`
          );

          return;
        }

        throw error;
      }

      setWorkoutCompletions((current) => [
        ...current,
        data,
      ]);

      setMessage(
        `Workout Day ${workoutDay} completed. Great work.`
      );

      if (onCompletionChange) {
        await onCompletionChange();
      }
    } catch (error) {
      console.error("Workout completion error:", error);

      setMessage(
        error?.message || "Unable to complete workout."
      );
    } finally {
      setFinishingDay(null);
    }
  }

  if (!program) {
    return (
      <div style={styles.empty}>
        <h2 style={styles.emptyTitle}>
          No Program Assigned
        </h2>

        <p style={styles.emptyText}>
          Your coach has not assigned a training program yet.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyText}>
          Loading your workouts...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.eyebrow}>
          MY TRAINING PROGRAM
        </div>

        <h2 style={styles.title}>
          {program.name}
        </h2>

        {program.description && (
          <p style={styles.subtitle}>
            {program.description}
          </p>
        )}

        <div style={styles.stats}>
          <Stat
            label="Days / Week"
            value={program.days_per_week || "—"}
          />

          <Stat
            label="Session"
            value={
              program.session_minutes
                ? `${program.session_minutes} min`
                : "—"
            }
          />

          <Stat
            label="Completed"
            value={`${workoutCompletions.length}/${
              program.days_per_week ||
              Object.keys(groupedWorkouts).length
            }`}
          />
        </div>
      </div>

      {message && (
        <div style={styles.message}>
          {message}
        </div>
      )}

      {Object.keys(groupedWorkouts).length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>
            Your program does not have any workouts assigned yet.
          </p>
        </div>
      ) : (
        Object.keys(groupedWorkouts)
          .sort((a, b) => Number(a) - Number(b))
          .map((day) => {
            const workoutDay = Number(day);
            const dayComplete =
              isWorkoutComplete(workoutDay);
            const ready = isDayReady(workoutDay);

            return (
              <div
                key={day}
                style={{
                  ...styles.workoutCard,
                  border: dayComplete
                    ? "1px solid #F4C20D"
                    : "1px solid #2A2A2A",
                }}
              >
                <div style={styles.dayHeader}>
                  <div>
                    <div style={styles.dayLabel}>
                      WORKOUT DAY {day}
                    </div>

                    <div style={styles.dayStatus}>
                      {dayComplete
                        ? "Completed this week"
                        : ready
                        ? "Ready to finish"
                        : "In progress"}
                    </div>
                  </div>

                  {dayComplete && (
                    <div style={styles.completeBadge}>
                      ✓ COMPLETE
                    </div>
                  )}
                </div>

                <div>
                  {groupedWorkouts[day].map(
                    (item, index) => {
                      const exercise =
                        getExerciseData(item);

                      const exerciseId =
                        getExerciseId(item);

                      const complete =
                        isExerciseComplete(item);

                      const savingKey =
                        `${workoutDay}-${exerciseId}`;

                      const saving =
                        savingExerciseId === savingKey;

                      return (
                        <div
                          key={
                            item.id ||
                            `${day}-${exerciseId}-${index}`
                          }
                          style={{
                            ...styles.exerciseRow,
                            borderBottom:
                              index ===
                              groupedWorkouts[day]
                                .length -
                                1
                                ? "none"
                                : "1px solid #2A2A2A",
                          }}
                        >
                          <button
                            type="button"
                            disabled={
                              saving ||
                              dayComplete ||
                              !exerciseId
                            }
                            onClick={() =>
                              toggleExercise(item)
                            }
                            aria-label={
                              complete
                                ? `Mark ${
                                    exercise.name ||
                                    "exercise"
                                  } incomplete`
                                : `Mark ${
                                    exercise.name ||
                                    "exercise"
                                  } complete`
                            }
                            style={{
                              ...styles.checkbox,
                              background: complete
                                ? "#F4C20D"
                                : "#050505",
                              color: complete
                                ? "#050505"
                                : "#FFFFFF",
                              cursor:
                                saving ||
                                dayComplete ||
                                !exerciseId
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                saving || !exerciseId
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {complete ? "✓" : ""}
                          </button>

                          <div style={styles.exerciseContent}>
                            <div style={styles.exerciseName}>
                              {exercise.name ||
                                item.name ||
                                "Exercise"}
                            </div>

                            <div style={styles.prescription}>
                              {item.sets
                                ? `${item.sets} sets`
                                : ""}

                              {item.sets && item.reps
                                ? " × "
                                : ""}

                              {item.reps || ""}

                              {item.rest_seconds
                                ? ` • ${item.rest_seconds}s rest`
                                : ""}
                            </div>

                            {item.notes && (
                              <div style={styles.exerciseNotes}>
                                {item.notes}
                              </div>
                            )}

                            {!exerciseId && (
                              <div style={styles.errorText}>
                                Exercise ID missing
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div style={styles.footer}>
                  <button
                    type="button"
                    disabled={
                      dayComplete ||
                      !ready ||
                      finishingDay === workoutDay
                    }
                    onClick={() =>
                      finishWorkout(workoutDay)
                    }
                    style={
                      dayComplete ||
                      !ready ||
                      finishingDay === workoutDay
                        ? styles.disabledButton
                        : styles.finishButton
                    }
                  >
                    {dayComplete
                      ? "Workout Complete"
                      : finishingDay === workoutDay
                      ? "Saving..."
                      : ready
                      ? "Finish Workout"
                      : "Complete All Exercises"}
                  </button>
                </div>
              </div>
            );
          })
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>
        {label}
      </div>

      <div style={styles.statValue}>
        {value}
      </div>
    </div>
  );
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${padNumber(
    date.getMonth() + 1
  )}-${padNumber(date.getDate())}`;
}

function getLocalDateString() {
  return formatLocalDate(new Date());
}

function getLocalWeekStartString() {
  const now = new Date();
  const day = now.getDay();
  const difference = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);

  monday.setDate(now.getDate() + difference);
  monday.setHours(0, 0, 0, 0);

  return formatLocalDate(monday);
}

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },

  header: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "22px",
  },

  eyebrow: {
    color: "#F4C20D",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  title: {
    color: "#FFFFFF",
    margin: "7px 0 0",
    fontSize: "26px",
    fontWeight: "900",
  },

  subtitle: {
    color: "#BDBDBD",
    lineHeight: "1.6",
    marginTop: "8px",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "10px",
    marginTop: "18px",
  },

  stat: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "14px",
  },

  statLabel: {
    color: "#BDBDBD",
    fontSize: "12px",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: "20px",
    fontWeight: "900",
    marginTop: "4px",
  },

  message: {
    background: "#111111",
    border: "1px solid #F4C20D",
    borderRadius: "12px",
    padding: "13px 16px",
    color: "#F4C20D",
    fontWeight: "700",
  },

  workoutCard: {
    background: "#111111",
    borderRadius: "16px",
    overflow: "hidden",
  },

  dayHeader: {
    background: "#050505",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    borderBottom: "1px solid #2A2A2A",
  },

  dayLabel: {
    color: "#F4C20D",
    fontSize: "17px",
    fontWeight: "900",
  },

  dayStatus: {
    color: "#BDBDBD",
    fontSize: "12px",
    marginTop: "4px",
  },

  completeBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "11px",
    fontWeight: "900",
  },

  exerciseRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "18px 20px",
  },

  checkbox: {
    width: "28px",
    height: "28px",
    minWidth: "28px",
    borderRadius: "7px",
    border: "1px solid #F4C20D",
    fontWeight: "900",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  exerciseContent: {
    flex: 1,
  },

  exerciseName: {
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "800",
  },

  prescription: {
    color: "#F4C20D",
    fontSize: "13px",
    fontWeight: "700",
    marginTop: "5px",
  },

  exerciseNotes: {
    color: "#BDBDBD",
    fontSize: "13px",
    lineHeight: "1.5",
    marginTop: "7px",
  },

  errorText: {
    color: "#FF6B6B",
    fontSize: "12px",
    marginTop: "6px",
    fontWeight: "700",
  },

  footer: {
    padding: "18px 20px",
    borderTop: "1px solid #2A2A2A",
  },

  finishButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background: "#F4C20D",
    color: "#050505",
    fontWeight: "900",
    cursor: "pointer",
  },

  disabledButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background: "#2A2A2A",
    color: "#BDBDBD",
    fontWeight: "900",
    cursor: "not-allowed",
  },

  empty: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "30px",
    textAlign: "center",
  },

  emptyTitle: {
    color: "#FFFFFF",
    margin: 0,
  },

  emptyText: {
    color: "#BDBDBD",
    lineHeight: "1.6",
  },
};
