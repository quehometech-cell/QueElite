"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const DAY_NAMES = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

function formatSeconds(seconds) {
  const value = Number(seconds || 0);
  if (!value) return null;
  if (value >= 60 && value % 60 === 0) return `${value / 60} min`;
  if (value >= 60) return `${Math.round(value / 60)} min`;
  return `${value} sec`;
}

function prescriptionText(item) {
  const parts = [];
  if (item.sets) parts.push(`${item.sets} sets`);
  if (item.reps) parts.push(`${item.reps} reps`);
  if (item.rir !== null && item.rir !== undefined && item.rir !== "") {
    parts.push(`${item.rir} RIR`);
  }
  if (item.duration_seconds) parts.push(formatSeconds(item.duration_seconds));
  if (item.distance_target) {
    parts.push(`${item.distance_target} ${item.distance_unit || ""}`.trim());
  }
  if (item.pace_target) parts.push(`Pace: ${item.pace_target}`);
  return parts.length ? parts.join(" • ") : "Complete as prescribed";
}


function isSetBasedExercise(item) {
  const tracking = String(item?.tracking_type || "").toLowerCase();
  const type = String(item?.exercise_type || "").toLowerCase();
  return !(
    tracking.includes("duration") ||
    tracking.includes("distance") ||
    tracking.includes("pace") ||
    tracking.includes("completion") ||
    type.includes("cardio") ||
    type.includes("mobility") ||
    type.includes("recovery")
  );
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default function Workouts({
  user,
  program,
  exercises = [],
  onCompletionChange,
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [message, setMessage] = useState("");
  const [liveExercises, setLiveExercises] = useState([]);
  const [loadingWorkoutPlan, setLoadingWorkoutPlan] = useState(true);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [setLogs, setSetLogs] = useState([]);
  const [savingKey, setSavingKey] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");

  const currentWeek = Number(program?.current_week || 1);
  const durationWeeks = Number(program?.duration_weeks || 12);

  const displayExercises = liveExercises.length ? liveExercises : exercises;

  const grouped = useMemo(() => {
    const result = {};
    for (let day = 1; day <= 7; day += 1) result[day] = [];

    displayExercises.forEach((item) => {
      const day = Number(item.workout_day || 1);
      if (!result[day]) result[day] = [];
      result[day].push(item);
    });

    Object.values(result).forEach((items) => {
      items.sort(
        (a, b) => Number(a.exercise_order || 0) - Number(b.exercise_order || 0)
      );
    });

    return result;
  }, [displayExercises]);

  const workoutMeta = useMemo(() => {
    const result = {};
    displayExercises.forEach((item) => {
      const day = Number(item.workout_day || 1);
      if (!result[day]) {
        result[day] = {
          id: item.program_workout_id,
          name: item.workout_name,
          type: item.workout_type,
          description: item.workout_description,
          minutes: item.estimated_minutes,
          coachNotes: item.workout_coach_notes,
          phaseName: item.phase_name,
          weekName: item.week_name,
        };
      }
    });
    return result;
  }, [displayExercises]);

  useEffect(() => {
    loadCurrentWeekPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program?.id, currentWeek]);

  async function loadCurrentWeekPlan() {
    if (!program?.id) {
      setLiveExercises([]);
      setLoadingWorkoutPlan(false);
      return;
    }

    setLoadingWorkoutPlan(true);

    try {
      const { data: weekData, error: weekError } = await supabase
        .from("program_weeks")
        .select("id, week_number, name, phase_name, description, coach_notes")
        .eq("program_id", program.id)
        .eq("week_number", currentWeek)
        .single();

      if (weekError) throw weekError;

      const { data: workoutRows, error: workoutError } = await supabase
        .from("program_workouts")
        .select("id, workout_day, name, workout_type, description, estimated_minutes, coach_notes, is_rest_day")
        .eq("program_week_id", weekData.id)
        .order("workout_day", { ascending: true });

      if (workoutError) throw workoutError;

      const workoutIds = (workoutRows || []).map((row) => row.id);

      if (!workoutIds.length) {
        setLiveExercises([]);
        return;
      }

      const { data: prescriptionRows, error: prescriptionError } = await supabase
        .from("program_workout_exercises")
        .select("id, program_workout_id, exercise_id, exercise_order, sets, reps, rir, rest_seconds, tempo, duration_seconds, distance_target, distance_unit, pace_target, notes")
        .in("program_workout_id", workoutIds)
        .order("program_workout_id", { ascending: true })
        .order("exercise_order", { ascending: true });

      if (prescriptionError) throw prescriptionError;

      const exerciseIds = [
        ...new Set(
          (prescriptionRows || [])
            .map((row) => row.exercise_id)
            .filter((id) => id !== null && id !== undefined)
        ),
      ];

      const { data: exerciseRows, error: exerciseError } = exerciseIds.length
        ? await supabase
            .from("exercises")
            .select("id, name, category, equipment, difficulty, instructions, instructions_short, coaching_cues, common_mistakes, video_url, muscle_group, movement_pattern, secondary_muscles, exercise_type, unilateral, tracking_type")
            .in("id", exerciseIds)
        : { data: [], error: null };

      if (exerciseError) throw exerciseError;

      const workoutMap = new Map(
        (workoutRows || []).map((row) => [String(row.id), row])
      );
      const exerciseMap = new Map(
        (exerciseRows || []).map((row) => [String(row.id), row])
      );

      const merged = (prescriptionRows || [])
        .map((row) => {
          const workout = workoutMap.get(String(row.program_workout_id));
          const exercise = exerciseMap.get(String(row.exercise_id));

          if (!workout || !exercise) return null;

          return {
            ...exercise,
            exercise_id: row.exercise_id,
            program_exercise_id: row.id,
            program_workout_exercise_id: row.id,
            program_workout_id: row.program_workout_id,
            program_week_id: weekData.id,
            week_number: weekData.week_number,
            week_name: weekData.name,
            phase_name: weekData.phase_name,
            week_description: weekData.description,
            week_coach_notes: weekData.coach_notes,
            workout_day: workout.workout_day,
            workout_name: workout.name,
            workout_type: workout.workout_type,
            workout_description: workout.description,
            estimated_minutes: workout.estimated_minutes,
            workout_coach_notes: workout.coach_notes,
            is_rest_day: workout.is_rest_day,
            exercise_order: row.exercise_order,
            sets: row.sets,
            reps: row.reps,
            rir: row.rir,
            rest_seconds: row.rest_seconds,
            tempo: row.tempo,
            duration_seconds: row.duration_seconds,
            distance_target: row.distance_target,
            distance_unit: row.distance_unit,
            pace_target: row.pace_target,
            notes: row.notes,
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          const dayDiff = Number(a.workout_day || 0) - Number(b.workout_day || 0);
          if (dayDiff !== 0) return dayDiff;
          return Number(a.exercise_order || 0) - Number(b.exercise_order || 0);
        });

      setLiveExercises(merged);
    } catch (error) {
      console.error("Direct workout plan load error:", error);
      setMessage(error.message || "Unable to load the complete workout plan.");
      setLiveExercises([]);
    } finally {
      setLoadingWorkoutPlan(false);
    }
  }

  useEffect(() => {
    const firstTrainingDay = [1, 2, 3, 4, 5, 6, 7].find(
      (day) => grouped[day]?.length > 0
    );
    if (firstTrainingDay) setSelectedDay(firstTrainingDay);
  }, [grouped]);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, program?.member_program_id, currentWeek]);

  async function loadSessions() {
    if (!user?.id || !program?.member_program_id) {
      setSessions([]);
      setLoadingSessions(false);
      return;
    }

    setLoadingSessions(true);
    setMessage("");

    const { data, error } = await supabase
      .from("workout_sessions")
      .select(
        "id, program_workout_id, week_number, workout_day, workout_name, status, started_at, completed_at, duration_minutes, workout_notes"
      )
      .eq("user_id", user.id)
      .eq("member_program_id", program.member_program_id)
      .eq("week_number", currentWeek)
      .order("workout_day", { ascending: true });

    if (error) {
      console.error("Workout session load error:", error);
      setMessage(error.message || "Unable to load workout progress.");
      setSessions([]);
    } else {
      const nextSessions = data || [];
      setSessions(nextSessions);
      await loadWorkoutLogs(nextSessions);
    }

    setLoadingSessions(false);
  }

  async function loadWorkoutLogs(sessionRows = sessions) {
    const sessionIds = (sessionRows || []).map((row) => row.id);
    if (!sessionIds.length) {
      setExerciseLogs([]);
      setSetLogs([]);
      return;
    }

    const { data: exerciseRows, error: exerciseError } = await supabase
      .from("workout_exercise_logs")
      .select("*")
      .in("workout_session_id", sessionIds)
      .order("exercise_order", { ascending: true });

    if (exerciseError) {
      console.error("Workout exercise log load error:", exerciseError);
      setMessage(exerciseError.message || "Unable to load exercise logs.");
      return;
    }

    setExerciseLogs(exerciseRows || []);
    const exerciseLogIds = (exerciseRows || []).map((row) => row.id);

    if (!exerciseLogIds.length) {
      setSetLogs([]);
      return;
    }

    const { data: setRows, error: setError } = await supabase
      .from("workout_set_logs")
      .select("*")
      .in("workout_exercise_log_id", exerciseLogIds)
      .order("set_number", { ascending: true });

    if (setError) {
      console.error("Workout set log load error:", setError);
      setMessage(setError.message || "Unable to load set logs.");
      return;
    }

    setSetLogs(setRows || []);
  }

  async function startWorkout() {
    if (!user?.id || !program?.member_program_id || !selectedMeta?.id) return;

    setSavingKey("start");
    setMessage("");

    try {
      let session = selectedSession;

      if (!session) {
        const { data, error } = await supabase
          .from("workout_sessions")
          .insert({
            user_id: user.id,
            member_program_id: program.member_program_id,
            program_workout_id: selectedMeta.id,
            week_number: currentWeek,
            workout_day: selectedDay,
            workout_name: selectedMeta.name || DAY_NAMES[selectedDay],
            status: "in_progress",
          })
          .select("*")
          .single();

        if (error) throw error;
        session = data;
      }

      const existingForSession = exerciseLogs.filter(
        (row) => Number(row.workout_session_id) === Number(session.id)
      );
      const existingPrescriptionIds = new Set(
        existingForSession.map((row) => String(row.program_workout_exercise_id))
      );

      const missing = selectedExercises.filter(
        (item) => !existingPrescriptionIds.has(String(item.program_workout_exercise_id))
      );

      let createdExerciseLogs = [];
      if (missing.length) {
        const { data, error } = await supabase
          .from("workout_exercise_logs")
          .insert(
            missing.map((item) => ({
              workout_session_id: session.id,
              program_workout_exercise_id: item.program_workout_exercise_id,
              exercise_id: item.exercise_id || item.id,
              exercise_order: Number(item.exercise_order || 1),
              exercise_name: item.name,
              prescribed_sets: item.sets ? Number(item.sets) : null,
              prescribed_reps: item.reps || null,
              prescribed_rir: toNullableNumber(item.rir),
              prescribed_rest_seconds: item.rest_seconds ? Number(item.rest_seconds) : null,
              prescribed_tempo: item.tempo || null,
              duration_seconds: item.duration_seconds ? Number(item.duration_seconds) : null,
              distance: toNullableNumber(item.distance_target),
              distance_unit: item.distance_unit || null,
              pace: item.pace_target || null,
              completed: false,
            }))
          )
          .select("*");

        if (error) throw error;
        createdExerciseLogs = data || [];
      }

      const allExerciseLogs = [...existingForSession, ...createdExerciseLogs];
      const setRowsToCreate = [];

      allExerciseLogs.forEach((log) => {
        const item = selectedExercises.find(
          (exercise) =>
            String(exercise.program_workout_exercise_id) ===
            String(log.program_workout_exercise_id)
        );
        if (!item || !isSetBasedExercise(item)) return;

        const setCount = Math.max(1, Number(item.sets || 1));
        const existingSetNumbers = new Set(
          setLogs
            .filter((row) => Number(row.workout_exercise_log_id) === Number(log.id))
            .map((row) => Number(row.set_number))
        );

        for (let setNumber = 1; setNumber <= setCount; setNumber += 1) {
          if (!existingSetNumbers.has(setNumber)) {
            setRowsToCreate.push({
              workout_exercise_log_id: log.id,
              set_number: setNumber,
              weight: null,
              weight_unit: "lb",
              reps: null,
              rir: null,
              completed: false,
            });
          }
        }
      });

      if (setRowsToCreate.length) {
        const { error } = await supabase.from("workout_set_logs").insert(setRowsToCreate);
        if (error) throw error;
      }

      setWorkoutNotes(session.workout_notes || "");
      await loadSessions();
      setMessage("Workout started. Your log is ready.");
    } catch (error) {
      console.error("Start workout error:", error);
      setMessage(error.message || "Unable to start workout.");
    } finally {
      setSavingKey("");
    }
  }

  function getExerciseLog(item) {
    if (!selectedSession) return null;
    return exerciseLogs.find(
      (row) =>
        Number(row.workout_session_id) === Number(selectedSession.id) &&
        String(row.program_workout_exercise_id) === String(item.program_workout_exercise_id)
    );
  }

  function getSetsForExercise(exerciseLogId) {
    return setLogs
      .filter((row) => Number(row.workout_exercise_log_id) === Number(exerciseLogId))
      .sort((a, b) => Number(a.set_number) - Number(b.set_number));
  }

  function updateLocalSet(setId, field, value) {
    setSetLogs((current) =>
      current.map((row) => (row.id === setId ? { ...row, [field]: value } : row))
    );
  }

  async function saveSet(row) {
    const key = `set-${row.id}`;
    setSavingKey(key);
    setMessage("");

    const { error } = await supabase
      .from("workout_set_logs")
      .update({
        weight: toNullableNumber(row.weight),
        reps: toNullableNumber(row.reps),
        rir: toNullableNumber(row.rir),
        completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (error) {
      console.error("Set save error:", error);
      setMessage(error.message || "Unable to save set.");
    } else {
      setSetLogs((current) =>
        current.map((item) => (item.id === row.id ? { ...item, completed: true } : item))
      );
      setMessage(`Set ${row.set_number} saved.`);
    }
    setSavingKey("");
  }

  function updateLocalExerciseLog(logId, field, value) {
    setExerciseLogs((current) =>
      current.map((row) => (row.id === logId ? { ...row, [field]: value } : row))
    );
  }

  async function saveTrackedExercise(log) {
    const key = `exercise-${log.id}`;
    setSavingKey(key);
    setMessage("");

    const { error } = await supabase
      .from("workout_exercise_logs")
      .update({
        duration_seconds: toNullableNumber(log.duration_seconds),
        distance: toNullableNumber(log.distance),
        distance_unit: log.distance_unit || null,
        pace: log.pace || null,
        notes: log.notes || null,
        completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", log.id);

    if (error) {
      console.error("Exercise save error:", error);
      setMessage(error.message || "Unable to save exercise.");
    } else {
      setExerciseLogs((current) =>
        current.map((row) => (row.id === log.id ? { ...row, completed: true } : row))
      );
      setMessage(`${log.exercise_name} saved.`);
    }
    setSavingKey("");
  }

  async function saveWorkoutNotes() {
    if (!selectedSession || selectedSession.status === "completed") return;
    setSavingKey("notes");
    setMessage("");

    const { error } = await supabase
      .from("workout_sessions")
      .update({
        workout_notes: workoutNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedSession.id);

    if (error) {
      console.error("Workout notes save error:", error);
      setMessage(error.message || "Unable to save workout notes.");
    } else {
      setSessions((current) =>
        current.map((row) =>
          row.id === selectedSession.id ? { ...row, workout_notes: workoutNotes } : row
        )
      );
      setMessage("Workout notes saved.");
    }
    setSavingKey("");
  }

  function getSession(day) {
    return sessions.find((session) => Number(session.workout_day) === Number(day));
  }

  function getStatus(day) {
    const session = getSession(day);
    if (!session) return "Not started";
    if (session.status === "completed") return "Completed";
    if (session.status === "in_progress") return "In progress";
    if (session.status === "skipped") return "Skipped";
    return "Scheduled";
  }

  useEffect(() => {
    const session = sessions.find(
      (row) => Number(row.workout_day) === Number(selectedDay)
    );
    setWorkoutNotes(session?.workout_notes || "");
  }, [selectedDay, sessions]);

  const selectedExercises = grouped[selectedDay] || [];
  const selectedMeta = workoutMeta[selectedDay] || {};
  const selectedSession = getSession(selectedDay);
  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const trainingDays = Object.values(grouped).filter((items) => items.length > 0).length;
  const weekProgress = trainingDays
    ? Math.min(100, Math.round((completedCount / trainingDays) * 100))
    : 0;

  if (!program) {
    return (
      <section style={styles.panel}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏋️</div>
          <h2 style={styles.emptyTitle}>No active program yet</h2>
          <p style={styles.muted}>
            Your coach has not assigned an active training program to this account.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>YOUR TRAINING PROGRAM</div>
          <h1 style={styles.title}>{program.name}</h1>
          <p style={styles.subtitle}>
            Week {currentWeek} of {durationWeeks}
            {selectedMeta.phaseName ? ` • ${selectedMeta.phaseName}` : ""}
          </p>
        </div>

        <div style={styles.progressCard}>
          <div style={styles.progressTop}>
            <span>Week progress</span>
            <strong>{weekProgress}%</strong>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${weekProgress}%` }} />
          </div>
          <div style={styles.progressSmall}>
            {completedCount} of {trainingDays || 0} training days completed
          </div>
        </div>
      </section>

      {message ? <div style={styles.message}>{message}</div> : null}

      <section style={styles.dayStrip}>
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const meta = workoutMeta[day];
          const hasExercises = grouped[day]?.length > 0;
          const active = selectedDay === day;
          const status = getStatus(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              style={{
                ...styles.dayButton,
                ...(active ? styles.dayButtonActive : {}),
              }}
            >
              <span style={styles.dayNumber}>DAY {day}</span>
              <strong style={styles.dayName}>{DAY_NAMES[day]}</strong>
              <span style={styles.dayWorkoutName}>
                {meta?.name || (hasExercises ? "Training" : "Rest / Active Recovery")}
              </span>
              <span
                style={{
                  ...styles.statusPill,
                  ...(status === "Completed" ? styles.statusComplete : {}),
                  ...(status === "In progress" ? styles.statusProgress : {}),
                }}
              >
                {status}
              </span>
            </button>
          );
        })}
      </section>

      <section style={styles.workoutHeader}>
        <div>
          <div style={styles.eyebrow}>{DAY_NAMES[selectedDay]} • DAY {selectedDay}</div>
          <h2 style={styles.workoutTitle}>
            {selectedMeta.name || "Rest / Active Recovery"}
          </h2>
          {selectedMeta.description ? (
            <p style={styles.muted}>{selectedMeta.description}</p>
          ) : null}
        </div>

        <div style={styles.metaRow}>
          {selectedMeta.type ? <span style={styles.metaPill}>{selectedMeta.type}</span> : null}
          {selectedMeta.minutes ? (
            <span style={styles.metaPill}>~{selectedMeta.minutes} min</span>
          ) : null}
          {selectedSession?.status ? (
            <span style={styles.metaPill}>{getStatus(selectedDay)}</span>
          ) : null}
        </div>
      </section>

      {selectedMeta.coachNotes ? (
        <section style={styles.coachNote}>
          <strong>Coach note</strong>
          <p style={styles.coachNoteText}>{selectedMeta.coachNotes}</p>
        </section>
      ) : null}

      {selectedExercises.length === 0 ? (
        <section style={styles.restCard}>
          <div style={styles.restIcon}>✓</div>
          <h3 style={styles.exerciseName}>Recovery day</h3>
          <p style={styles.muted}>
            No prescribed exercises today. Use this day for rest, light movement, walking,
            mobility, hydration, and recovery as needed.
          </p>
        </section>
      ) : (
        <>
          {!selectedSession ? (
            <section style={styles.startCard}>
              <div>
                <div style={styles.eyebrow}>READY TO TRAIN?</div>
                <h3 style={styles.nextTitle}>Start {selectedMeta.name}</h3>
                <p style={styles.muted}>
                  Starting creates your private workout log for Week {currentWeek}. Your
                  prescription stays unchanged.
                </p>
              </div>
              <button
                type="button"
                onClick={startWorkout}
                disabled={savingKey === "start"}
                style={styles.primaryButton}
              >
                {savingKey === "start" ? "Starting…" : "Start Workout"}
              </button>
            </section>
          ) : null}

          <section style={styles.exerciseList}>
            {selectedExercises.map((item, index) => {
              const log = getExerciseLog(item);
              const setBased = isSetBasedExercise(item);
              const loggedSets = log ? getSetsForExercise(log.id) : [];
              const locked = selectedSession?.status === "completed";

              return (
                <article
                  key={item.program_workout_exercise_id || `${selectedDay}-${index}`}
                  style={styles.exerciseCard}
                >
                  <div style={styles.exerciseTop}>
                    <div style={styles.orderBadge}>{index + 1}</div>
                    <div style={styles.exerciseMain}>
                      <h3 style={styles.exerciseName}>{item.name}</h3>
                      <div style={styles.prescription}>{prescriptionText(item)}</div>
                      <div style={styles.exerciseTags}>
                        {item.equipment ? <span style={styles.smallTag}>{item.equipment}</span> : null}
                        {item.muscle_group ? <span style={styles.smallTag}>{item.muscle_group}</span> : null}
                        {item.tracking_type ? (
                          <span style={styles.smallTag}>{item.tracking_type.replaceAll("_", " ")}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {(item.rest_seconds || item.tempo) ? (
                    <div style={styles.detailGrid}>
                      {item.rest_seconds ? (
                        <div style={styles.detailBox}>
                          <span style={styles.detailLabel}>REST</span>
                          <strong>{item.rest_seconds}s</strong>
                        </div>
                      ) : null}
                      {item.tempo ? (
                        <div style={styles.detailBox}>
                          <span style={styles.detailLabel}>TEMPO</span>
                          <strong>{item.tempo}</strong>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {item.instructions_short || item.instructions ? (
                    <p style={styles.instructions}>
                      {item.instructions_short || item.instructions}
                    </p>
                  ) : null}

                  {item.notes ? <p style={styles.exerciseNote}>{item.notes}</p> : null}

                  {selectedSession && log && setBased ? (
                    <div style={styles.logArea}>
                      <div style={styles.logHeading}>LOG YOUR SETS</div>
                      <div style={styles.setHeader}>
                        <span>SET</span>
                        <span>WEIGHT (LB)</span>
                        <span>REPS</span>
                        <span>RIR</span>
                        <span></span>
                      </div>

                      {loggedSets.map((row) => (
                        <div key={row.id} style={styles.setRow}>
                          <strong style={styles.setNumber}>{row.set_number}</strong>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={row.weight ?? ""}
                            disabled={locked}
                            onChange={(event) =>
                              updateLocalSet(row.id, "weight", event.target.value)
                            }
                            placeholder="0"
                            style={styles.input}
                          />
                          <input
                            type="number"
                            inputMode="numeric"
                            value={row.reps ?? ""}
                            disabled={locked}
                            onChange={(event) =>
                              updateLocalSet(row.id, "reps", event.target.value)
                            }
                            placeholder={item.reps || "0"}
                            style={styles.input}
                          />
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            value={row.rir ?? ""}
                            disabled={locked}
                            onChange={(event) =>
                              updateLocalSet(row.id, "rir", event.target.value)
                            }
                            placeholder={item.rir ?? "—"}
                            style={styles.input}
                          />
                          <button
                            type="button"
                            disabled={locked || savingKey === `set-${row.id}`}
                            onClick={() => saveSet(row)}
                            style={{
                              ...styles.saveButton,
                              ...(row.completed ? styles.savedButton : {}),
                            }}
                          >
                            {savingKey === `set-${row.id}`
                              ? "Saving…"
                              : row.completed
                                ? "Saved ✓"
                                : "Save"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {selectedSession && log && !setBased ? (
                    <div style={styles.logArea}>
                      <div style={styles.logHeading}>LOG THIS EXERCISE</div>
                      <div style={styles.trackingGrid}>
                        <label style={styles.fieldLabel}>
                          TIME (MIN)
                          <input
                            type="number"
                            inputMode="decimal"
                            disabled={locked}
                            value={
                              log.duration_seconds === null || log.duration_seconds === undefined
                                ? ""
                                : Number(log.duration_seconds) / 60
                            }
                            onChange={(event) =>
                              updateLocalExerciseLog(
                                log.id,
                                "duration_seconds",
                                event.target.value === ""
                                  ? ""
                                  : Number(event.target.value) * 60
                              )
                            }
                            style={styles.input}
                          />
                        </label>

                        <label style={styles.fieldLabel}>
                          DISTANCE
                          <input
                            type="number"
                            inputMode="decimal"
                            disabled={locked}
                            value={log.distance ?? ""}
                            onChange={(event) =>
                              updateLocalExerciseLog(log.id, "distance", event.target.value)
                            }
                            style={styles.input}
                          />
                        </label>

                        <label style={styles.fieldLabel}>
                          UNIT
                          <input
                            type="text"
                            disabled={locked}
                            value={log.distance_unit ?? ""}
                            onChange={(event) =>
                              updateLocalExerciseLog(log.id, "distance_unit", event.target.value)
                            }
                            placeholder={item.distance_unit || "mi"}
                            style={styles.input}
                          />
                        </label>

                        <label style={styles.fieldLabel}>
                          PACE
                          <input
                            type="text"
                            disabled={locked}
                            value={log.pace ?? ""}
                            onChange={(event) =>
                              updateLocalExerciseLog(log.id, "pace", event.target.value)
                            }
                            placeholder={item.pace_target || "Optional"}
                            style={styles.input}
                          />
                        </label>
                      </div>

                      <label style={styles.fieldLabel}>
                        NOTES
                        <textarea
                          disabled={locked}
                          value={log.notes ?? ""}
                          onChange={(event) =>
                            updateLocalExerciseLog(log.id, "notes", event.target.value)
                          }
                          placeholder="How did this feel?"
                          style={styles.textarea}
                        />
                      </label>

                      <button
                        type="button"
                        disabled={locked || savingKey === `exercise-${log.id}`}
                        onClick={() => saveTrackedExercise(log)}
                        style={{
                          ...styles.saveButton,
                          ...(log.completed ? styles.savedButton : {}),
                        }}
                      >
                        {savingKey === `exercise-${log.id}`
                          ? "Saving…"
                          : log.completed
                            ? "Saved ✓"
                            : "Save Exercise"}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>

          {selectedSession ? (
            <section style={styles.notesCard}>
              <div style={styles.eyebrow}>WORKOUT NOTES</div>
              <textarea
                value={workoutNotes}
                disabled={selectedSession.status === "completed"}
                onChange={(event) => setWorkoutNotes(event.target.value)}
                placeholder="Energy, pain, form notes, wins, or anything your coach should know…"
                style={styles.workoutTextarea}
              />
              <button
                type="button"
                disabled={
                  selectedSession.status === "completed" || savingKey === "notes"
                }
                onClick={saveWorkoutNotes}
                style={styles.saveButton}
              >
                {savingKey === "notes" ? "Saving…" : "Save Workout Notes"}
              </button>
            </section>
          ) : null}
        </>
      )}

      <section style={styles.nextStepCard}>
        <div>
          <div style={styles.eyebrow}>WORKOUT LOGGING</div>
          <h3 style={styles.nextTitle}>
            {loadingWorkoutPlan || loadingSessions ? "Loading workout plan…" : "Prescription view connected"}
          </h3>
          <p style={styles.muted}>
            Set-by-set weight, reps, RIR, cardio, mobility, and workout notes are now connected.
            Workout completion and history are the next step.
          </p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: 20,
  },
  panel: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 18,
    padding: 24,
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(260px, .6fr)",
    gap: 18,
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  eyebrow: {
    color: "#F4C20D",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.2,
  },
  title: {
    color: "#FFFFFF",
    margin: "7px 0 5px",
    fontSize: "clamp(26px, 4vw, 40px)",
    lineHeight: 1.05,
  },
  subtitle: {
    color: "#BDBDBD",
    margin: 0,
    fontSize: 15,
  },
  progressCard: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: 16,
    padding: 16,
  },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 10,
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    background: "#2A2A2A",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "#F4C20D",
    transition: "width .25s ease",
  },
  progressSmall: {
    color: "#BDBDBD",
    fontSize: 12,
    marginTop: 9,
  },
  message: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #F4C20D",
    background: "rgba(244,194,13,.08)",
    color: "#FFFFFF",
  },
  dayStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(130px, 1fr))",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 4,
  },
  dayButton: {
    minWidth: 130,
    minHeight: 135,
    textAlign: "left",
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 16,
    padding: 14,
    color: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  dayButtonActive: {
    border: "1px solid #F4C20D",
    boxShadow: "0 0 0 1px rgba(244,194,13,.18)",
  },
  dayNumber: {
    color: "#F4C20D",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1,
  },
  dayName: {
    fontSize: 15,
  },
  dayWorkoutName: {
    color: "#BDBDBD",
    fontSize: 11,
    lineHeight: 1.35,
    flex: 1,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    padding: "4px 7px",
    fontSize: 10,
    background: "#2A2A2A",
    color: "#BDBDBD",
  },
  statusComplete: {
    background: "rgba(244,194,13,.15)",
    color: "#F4C20D",
  },
  statusProgress: {
    background: "rgba(255,255,255,.1)",
    color: "#FFFFFF",
  },
  workoutHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "flex-end",
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 18,
    padding: 20,
    flexWrap: "wrap",
  },
  workoutTitle: {
    color: "#FFFFFF",
    margin: "5px 0 5px",
    fontSize: 27,
  },
  muted: {
    color: "#BDBDBD",
    lineHeight: 1.55,
    margin: "5px 0 0",
  },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  metaPill: {
    border: "1px solid #2A2A2A",
    borderRadius: 999,
    padding: "7px 10px",
    color: "#FFFFFF",
    background: "#050505",
    fontSize: 12,
    textTransform: "capitalize",
  },
  coachNote: {
    background: "rgba(244,194,13,.07)",
    border: "1px solid rgba(244,194,13,.35)",
    borderRadius: 16,
    padding: 16,
    color: "#F4C20D",
  },
  coachNoteText: {
    color: "#FFFFFF",
    margin: "6px 0 0",
    lineHeight: 1.55,
  },
  exerciseList: {
    display: "grid",
    gap: 12,
  },
  exerciseCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 18,
    padding: 18,
  },
  exerciseTop: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  orderBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "#F4C20D",
    color: "#050505",
    fontWeight: 950,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  exerciseMain: {
    minWidth: 0,
    flex: 1,
  },
  exerciseName: {
    color: "#FFFFFF",
    margin: 0,
    fontSize: 19,
  },
  prescription: {
    color: "#F4C20D",
    fontWeight: 850,
    marginTop: 5,
    fontSize: 14,
  },
  exerciseTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  smallTag: {
    color: "#BDBDBD",
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: 999,
    padding: "4px 7px",
    fontSize: 10,
    textTransform: "capitalize",
  },
  detailGrid: {
    display: "flex",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
  },
  detailBox: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: 10,
    padding: "8px 11px",
    color: "#FFFFFF",
    display: "grid",
    gap: 2,
    minWidth: 78,
  },
  detailLabel: {
    color: "#BDBDBD",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: .8,
  },
  instructions: {
    color: "#BDBDBD",
    lineHeight: 1.55,
    margin: "14px 0 0",
    fontSize: 13,
  },
  exerciseNote: {
    color: "#FFFFFF",
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "10px 12px",
    margin: "12px 0 0",
    borderRadius: "0 8px 8px 0",
    fontSize: 13,
    lineHeight: 1.5,
  },
  startCard: {
    background: "#111111",
    border: "1px solid #F4C20D",
    borderRadius: 18,
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "#F4C20D",
    color: "#050505",
    border: 0,
    borderRadius: 10,
    padding: "12px 18px",
    fontWeight: 950,
    cursor: "pointer",
  },
  logArea: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #2A2A2A",
    display: "grid",
    gap: 10,
  },
  logHeading: {
    color: "#F4C20D",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1,
  },
  setHeader: {
    display: "grid",
    gridTemplateColumns: "45px minmax(85px, 1fr) minmax(70px, .8fr) minmax(65px, .7fr) 88px",
    gap: 8,
    color: "#BDBDBD",
    fontSize: 9,
    fontWeight: 900,
    alignItems: "center",
  },
  setRow: {
    display: "grid",
    gridTemplateColumns: "45px minmax(85px, 1fr) minmax(70px, .8fr) minmax(65px, .7fr) 88px",
    gap: 8,
    alignItems: "center",
  },
  setNumber: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: 9,
    padding: "10px 9px",
    outline: "none",
  },
  saveButton: {
    background: "#F4C20D",
    color: "#050505",
    border: 0,
    borderRadius: 9,
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  savedButton: {
    background: "#2A2A2A",
    color: "#F4C20D",
  },
  trackingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 10,
  },
  fieldLabel: {
    color: "#BDBDBD",
    fontSize: 10,
    fontWeight: 900,
    display: "grid",
    gap: 6,
  },
  textarea: {
    width: "100%",
    minHeight: 72,
    resize: "vertical",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: 9,
    padding: 10,
    outline: "none",
    fontFamily: "inherit",
  },
  notesCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 18,
    padding: 18,
    display: "grid",
    gap: 12,
  },
  workoutTextarea: {
    width: "100%",
    minHeight: 100,
    resize: "vertical",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: 10,
    padding: 12,
    outline: "none",
    fontFamily: "inherit",
  },
  restCard: {
    textAlign: "center",
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 18,
    padding: "38px 20px",
  },
  restIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#F4C20D",
    color: "#050505",
    fontWeight: 950,
    margin: "0 auto 12px",
  },
  nextStepCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: 18,
    padding: 20,
  },
  nextTitle: {
    color: "#FFFFFF",
    margin: "5px 0",
    fontSize: 20,
  },
  emptyState: {
    textAlign: "center",
    padding: 30,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#FFFFFF",
    margin: 0,
  },
};
