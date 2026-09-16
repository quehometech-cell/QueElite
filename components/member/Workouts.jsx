"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Workouts({
  user,
  program,
  exercises = [],
  onCompletionChange,
}) {
  const [completions, setCompletions] = useState([]);
  const [exerciseChecks, setExerciseChecks] = useState({});
  const [savingDay, setSavingDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const workoutDays = useMemo(() => {
    return [
      ...new Set(
        exercises
          .map((exercise) => exercise.workout_day)
          .filter(
            (day) => day !== null && day !== undefined
          )
      ),
    ].sort((a, b) => a - b);
  }, [exercises]);

  useEffect(() => {
    if (!user?.id || !program?.id) {
      setLoading(false);
      return;
    }

    loadCompletions();
  }, [user?.id, program?.id]);

  async function loadCompletions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("workout_completions")
      .select("id, workout_day, completed_at")
      .eq("user_id", user.id)
      .eq("program_id", program.id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Completion load error:", error);
      setMessage("We couldn't load your workout history.");
      setLoading(false);
      return;
    }

    setCompletions(data || []);
    setLoading(false);
  }

  function localDateString(value = new Date()) {
    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(
      2,
      "0"
    );
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function completedToday(workoutDay) {
    const today = localDateString();

    return completions.some(
      (completion) =>
        completion.workout_day === workoutDay &&
        localDateString(completion.completed_at) === today
    );
  }

  function exerciseKey(workoutDay, exerciseId) {
    return `${workoutDay}-${exerciseId}`;
  }

  function toggleExercise(workoutDay, exerciseId) {
    const key = exerciseKey(workoutDay, exerciseId);

    setExerciseChecks((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function dayExercisesCompleted(workoutDay) {
    const dayExercises = exercises.filter(
      (exercise) => exercise.workout_day === workoutDay
    );

    if (!dayExercises.length) return false;

    return dayExercises.every(
      (exercise) =>
        exerciseChecks[
          exerciseKey(workoutDay, exercise.id)
        ]
    );
  }

  async function finishWorkout(workoutDay) {
    if (!user?.id || !program?.id) return;

    if (completedToday(workoutDay)) return;

    setSavingDay(workoutDay);
    setMessage("");

    const { data, error } = await supabase
      .from("workout_completions")
      .insert({
        user_id: user.id,
        program_id: program.id,
        workout_day: workoutDay,
      })
      .select("id, workout_day, completed_at")
      .single();

    if (error) {
      console.error("Workout completion error:", error);

      if (error.code === "23505") {
        await loadCompletions();
        setMessage("This workout is already recorded today.");
      } else {
        setMessage(
          "We couldn't save this workout. Please try again."
        );
      }

      setSavingDay(null);
      return;
    }

    const updated = [data, ...completions];

    setCompletions(updated);
    setSavingDay(null);

    setMessage(
      `Day ${workoutDay} complete. Great work.`
    );

    if (onCompletionChange) {
      onCompletionChange(updated);
    }
  }

  function formatText(value) {
    if (!value) return "";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  if (!program) {
    return (
      <section>
        <p style={styles.goldLabel}>MY WORKOUTS</p>

        <h2 style={styles.title}>YOUR TRAINING PLAN</h2>

        <div style={styles.empty}>
          No workout program has been assigned yet.
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section>
        <p style={styles.goldLabel}>MY WORKOUTS</p>

        <h2 style={styles.title}>LOADING YOUR WORKOUT...</h2>
      </section>
    );
  }

  return (
    <section>
      <p style={styles.goldLabel}>MY WORKOUTS</p>

      <h2 style={styles.title}>{program.name}</h2>

      <p style={styles.description}>
        {program.description}
      </p>

      <div style={styles.programStats}>
        <Stat
          value={program.days_per_week}
          label="DAYS / WEEK"
        />

        <Stat
          value={program.session_minutes}
          label="MINUTES"
        />

        <Stat
          value={exercises.length}
          label="EXERCISES"
        />
      </div>

      {message && (
        <div style={styles.message}>{message}</div>
      )}

      {workoutDays.length === 0 && (
        <div style={styles.empty}>
          Your workout schedule is being prepared.
        </div>
      )}

      {workoutDays.map((workoutDay) => {
        const dayExercises = exercises.filter(
          (exercise) =>
            exercise.workout_day === workoutDay
        );

        const isComplete =
          completedToday(workoutDay);

        const allExercisesChecked =
          dayExercisesCompleted(workoutDay);

        return (
          <div
            key={workoutDay}
            style={styles.workoutDay}
          >
            <div style={styles.dayHeader}>
              <div>
                <p style={styles.goldLabel}>
                  TRAINING DAY
                </p>

                <h3 style={styles.dayTitle}>
                  DAY {workoutDay}
                </h3>
              </div>

              {isComplete && (
                <span style={styles.completedBadge}>
                  ✓ COMPLETED TODAY
                </span>
              )}
            </div>

            <div style={styles.exerciseList}>
              {dayExercises.map(
                (exercise, index) => {
                  const key = exerciseKey(
                    workoutDay,
                    exercise.id
                  );

                  const checked =
                    Boolean(exerciseChecks[key]) ||
                    isComplete;

                  return (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      number={index + 1}
                      checked={checked}
                      disabled={isComplete}
                      onToggle={() =>
                        toggleExercise(
                          workoutDay,
                          exercise.id
                        )
                      }
                      formatText={formatText}
                    />
                  );
                }
              )}
            </div>

            {!isComplete && (
              <p style={styles.finishHint}>
                {allExercisesChecked
                  ? "All exercises checked. You're ready to finish this workout."
                  : "Check off each exercise as you complete it."}
              </p>
            )}

            <button
              onClick={() =>
                finishWorkout(workoutDay)
              }
              disabled={
                isComplete ||
                savingDay === workoutDay ||
                !allExercisesChecked
              }
              style={
                isComplete
                  ? styles.completedButton
                  : allExercisesChecked
                  ? styles.finishButton
                  : styles.disabledButton
              }
            >
              {isComplete
                ? "✓ WORKOUT COMPLETED"
                : savingDay === workoutDay
                ? "SAVING WORKOUT..."
                : `FINISH DAY ${workoutDay} WORKOUT`}
            </button>
          </div>
        );
      })}
    </section>
  );
}

function ExerciseCard({
  exercise,
  number,
  checked,
  disabled,
  onToggle,
  formatText,
}) {
  return (
    <article
      style={{
        ...styles.exerciseCard,
        ...(checked ? styles.checkedExercise : {}),
      }}
    >
      <div style={styles.exerciseTop}>
        <div style={styles.exerciseNumber}>
          {number}
        </div>

        <div style={styles.exerciseHeading}>
          <h4 style={styles.exerciseName}>
            {exercise.name}
          </h4>

          <div style={styles.tags}>
            {exercise.muscle_group && (
              <span style={styles.tag}>
                {formatText(exercise.muscle_group)}
              </span>
            )}

            {exercise.equipment && (
              <span style={styles.tag}>
                {formatText(exercise.equipment)}
              </span>
            )}

            {exercise.difficulty && (
              <span style={styles.tag}>
                {formatText(exercise.difficulty)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={`Mark ${exercise.name} complete`}
          style={{
            ...styles.checkButton,
            ...(checked
              ? styles.checkButtonActive
              : {}),
          }}
        >
          {checked ? "✓" : ""}
        </button>
      </div>

      <div style={styles.prescription}>
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
            exercise.rest_seconds
              ? `${exercise.rest_seconds}s`
              : "-"
          }
          label="REST"
        />
      </div>

      {exercise.instructions && (
        <div style={styles.instructions}>
          <strong style={styles.smallHeading}>
            HOW TO
          </strong>

          <p style={styles.bodyText}>
            {exercise.instructions}
          </p>
        </div>
      )}

      {exercise.notes && (
        <div style={styles.coachNote}>
          <strong style={styles.coachHeading}>
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
          WATCH EXERCISE VIDEO
        </a>
      )}
    </article>
  );
}

function Prescription({ value, label }) {
  return (
    <div style={styles.prescriptionItem}>
      <strong style={styles.prescriptionValue}>
        {value}
      </strong>

      <span style={styles.prescriptionLabel}>
        {label}
      </span>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={styles.stat}>
      <strong style={styles.statValue}>
        {value || "-"}
      </strong>

      <span style={styles.statLabel}>
        {label}
      </span>
    </div>
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
    margin: "8px 0 10px",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "800px",
  },

  programStats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    margin: "25px 0 35px",
  },

  stat: {
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

  message: {
    background: "#111111",
    border: "1px solid #F4C20D",
    color: "#FFFFFF",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "25px",
  },

  empty: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    color: "#BDBDBD",
    padding: "25px",
    borderRadius: "14px",
  },

  workoutDay: {
    marginBottom: "55px",
  },

  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },

  dayTitle: {
    color: "#FFFFFF",
    fontSize: "32px",
    margin: "4px 0",
  },

  completedBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "30px",
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: "900",
  },

  exerciseList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  exerciseCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    transition: "0.2s ease",
  },

  checkedExercise: {
    border: "1px solid #F4C20D",
  },

  exerciseTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
  },

  exerciseNumber: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
  },

  exerciseHeading: {
    flex: 1,
  },

  exerciseName: {
    color: "#FFFFFF",
    fontSize: "21px",
    margin: "5px 0 10px",
  },

  checkButton: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "8px",
    border: "2px solid #F4C20D",
    background: "transparent",
    color: "#050505",
    fontSize: "20px",
    fontWeight: "900",
    cursor: "pointer",
  },

  checkButtonActive: {
    background: "#F4C20D",
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
      "repeat(3, minmax(80px, 1fr))",
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
  },

  coachNote: {
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "14px",
    marginTop: "15px",
  },

  coachHeading: {
    color: "#F4C20D",
    fontSize: "11px",
  },

  videoButton: {
    display: "inline-block",
    color: "#F4C20D",
    fontWeight: "900",
    marginTop: "15px",
    textDecoration: "none",
  },

  finishHint: {
    color: "#BDBDBD",
    fontSize: "12px",
    marginTop: "16px",
  },

  finishButton: {
    width: "100%",
    marginTop: "8px",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "10px",
    padding: "17px",
    fontWeight: "900",
    cursor: "pointer",
  },

  disabledButton: {
    width: "100%",
    marginTop: "8px",
    background: "#2A2A2A",
    color: "#777777",
    border: "1px solid #333333",
    borderRadius: "10px",
    padding: "17px",
    fontWeight: "900",
    cursor: "not-allowed",
  },

  completedButton: {
    width: "100%",
    marginTop: "8px",
    background: "#2A2A2A",
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    borderRadius: "10px",
    padding: "17px",
    fontWeight: "900",
  },
};
