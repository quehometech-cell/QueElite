"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function MembersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [program, setProgram] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [workoutLoading, setWorkoutLoading] = useState(true);
  const [workoutError, setWorkoutError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initializeMember() {
      setLoading(true);

      // CHECK LOGIN
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace("/login");
        return;
      }

      const currentUser = session.user;

      // CHECK MEMBERSHIP
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("membership_status")
        .eq("id", currentUser.id)
        .single();

      if (
        profileError ||
        !profile ||
        profile.membership_status !== "active"
      ) {
        router.replace("/membership-required");
        return;
      }

      // CHECK ONBOARDING
      const { data: assessment, error: assessmentError } = await supabase
        .from("onboarding_assessments")
        .select("id, completed")
        .eq("user_id", currentUser.id)
        .eq("completed", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (assessmentError) {
        console.error("Assessment check error:", assessmentError);
      }

      if (!assessment) {
        router.replace("/onboarding");
        return;
      }

      // LOAD MEMBER WORKOUT
      await loadMemberWorkout(currentUser.id);

      if (mounted) {
        setLoading(false);
      }
    }

    initializeMember();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function loadMemberWorkout(userId) {
    setWorkoutLoading(true);
    setWorkoutError("");

    try {
      // GET MEMBER PROGRAM ASSIGNMENT
      const { data: assignment, error: assignmentError } = await supabase
        .from("member_programs")
        .select("program_id, assigned_at")
        .eq("user_id", userId)
        .order("assigned_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (assignmentError) {
        throw assignmentError;
      }

      if (!assignment) {
        setWorkoutError("No workout program has been assigned yet.");
        return;
      }

      // GET PROGRAM
      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select(
          "id, name, goal, experience_level, equipment, days_per_week, session_minutes, location, description"
        )
        .eq("id", assignment.program_id)
        .single();

      if (programError) {
        throw programError;
      }

      setProgram(programData);

      // GET PROGRAM EXERCISES + WORKOUT PRESCRIPTION
      const { data: programExercises, error: programExercisesError } =
        await supabase
          .from("program_exercises")
          .select(
            "exercise_id, exercise_order, workout_day, sets, reps, rest_seconds, notes"
          )
          .eq("program_id", assignment.program_id)
          .order("workout_day", { ascending: true })
          .order("exercise_order", { ascending: true });

      if (programExercisesError) {
        throw programExercisesError;
      }

      if (!programExercises || programExercises.length === 0) {
        setExercises([]);
        return;
      }

      const exerciseIds = programExercises.map(
        (item) => item.exercise_id
      );

      // GET EXERCISE INFORMATION
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .select(
          "id, name, category, equipment, difficulty, instructions, video_url, muscle_group"
        )
        .in("id", exerciseIds)
        .eq("is_active", true);

      if (exerciseError) {
        throw exerciseError;
      }

      // MERGE EXERCISE + PRESCRIPTION DATA
      const orderedExercises = programExercises
        .map((programExercise) => {
          const exercise = exerciseData?.find(
            (item) => item.id === programExercise.exercise_id
          );

          if (!exercise) return null;

          return {
            ...exercise,
            exercise_order: programExercise.exercise_order,
            workout_day: programExercise.workout_day,
            sets: programExercise.sets,
            reps: programExercise.reps,
            rest_seconds: programExercise.rest_seconds,
            notes: programExercise.notes,
          };
        })
        .filter(Boolean);

      setExercises(orderedExercises);
    } catch (error) {
      console.error("Workout loading error:", error);

      setWorkoutError(
        "We couldn't load your workout right now. Please try again."
      );
    } finally {
      setWorkoutLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function formatText(value) {
    if (!value) return "";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingBox}>
          <div style={styles.goldLabel}>GET CHA RIGHT FITNESS</div>

          <h1 style={styles.loadingTitle}>
            CHECKING MEMBERSHIP...
          </h1>

          <p style={styles.muted}>
            Loading your coaching portal.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.goldLabel}>
            GET CHA RIGHT FITNESS
          </div>

          <h1 style={styles.logo}>MEMBER PORTAL</h1>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          LOG OUT
        </button>
      </header>

      <nav style={styles.nav}>
        <NavButton
          label="Dashboard"
          tab="dashboard"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <NavButton
          label="My Workouts"
          tab="workouts"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <NavButton
          label="Nutrition"
          tab="nutrition"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <NavButton
          label="Progress"
          tab="progress"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <NavButton
          label="Check-In"
          tab="checkin"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <NavButton
          label="Exercise Library"
          tab="library"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </nav>

      <section style={styles.content}>
        {activeTab === "dashboard" && (
          <Dashboard
            program={program}
            exercises={exercises}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "workouts" && (
          <Workouts
            program={program}
            exercises={exercises}
            loading={workoutLoading}
            error={workoutError}
            formatText={formatText}
          />
        )}

        {activeTab === "nutrition" && <Nutrition />}

        {activeTab === "progress" && <Progress />}

        {activeTab === "checkin" && <CheckIn />}

        {activeTab === "library" && (
          <ExerciseLibrary
            exercises={exercises}
            formatText={formatText}
          />
        )}
      </section>
    </main>
  );
}

function NavButton({
  label,
  tab,
  activeTab,
  setActiveTab,
}) {
  return (
    <button
      onClick={() => setActiveTab(tab)}
      style={
        activeTab === tab
          ? styles.activeNavButton
          : styles.navButton
      }
    >
      {label}
    </button>
  );
}

function Dashboard({
  program,
  exercises,
  setActiveTab,
}) {
  return (
    <>
      <div style={styles.heroCard}>
        <div style={styles.goldLabel}>
          WELCOME BACK
        </div>

        <h2 style={styles.heroTitle}>
          YOUR PLAN. YOUR PROGRESS.
        </h2>

        <p style={styles.heroText}>
          Stay consistent, complete your workouts, and keep
          building.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>
            MY WORKOUT PLAN
          </div>

          <h3 style={styles.cardTitle}>
            {program
              ? program.name
              : "Your Training Plan"}
          </h3>

          <p style={styles.cardText}>
            {program?.description ||
              "Your personalized training program will appear here."}
          </p>

          {program && (
            <div style={styles.miniStats}>
              <span>
                {program.days_per_week} Days / Week
              </span>

              <span>
                {program.session_minutes} Min
              </span>

              <span>
                {exercises.length} Exercises
              </span>
            </div>
          )}

          <button
            onClick={() => setActiveTab("workouts")}
            style={styles.goldButton}
          >
            VIEW MY WORKOUT
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>
            NUTRITION
          </div>

          <h3 style={styles.cardTitle}>
            Nutrition Plan
          </h3>

          <p style={styles.cardText}>
            View your nutrition targets, meal ideas, and
            practical guidance.
          </p>

          <button
            onClick={() => setActiveTab("nutrition")}
            style={styles.outlineButton}
          >
            VIEW NUTRITION
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>
            PROGRESS
          </div>

          <h3 style={styles.cardTitle}>
            Track Your Results
          </h3>

          <p style={styles.cardText}>
            Keep track of your body weight, measurements,
            workouts, and progress.
          </p>

          <button
            onClick={() => setActiveTab("progress")}
            style={styles.outlineButton}
          >
            VIEW PROGRESS
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>
            WEEKLY CHECK-IN
          </div>

          <h3 style={styles.cardTitle}>
            Check In With Que
          </h3>

          <p style={styles.cardText}>
            Let Que know how training is going so your coaching
            can stay on track.
          </p>

          <button
            onClick={() => setActiveTab("checkin")}
            style={styles.outlineButton}
          >
            START CHECK-IN
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>
            COACHING
          </div>

          <h3 style={styles.cardTitle}>
            Book With Que
          </h3>

          <p style={styles.cardText}>
            Need help with your plan? Schedule your coaching
            session.
          </p>

          <a
            href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.linkButton}
          >
            BOOK WITH QUE
          </a>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>
            EXERCISE LIBRARY
          </div>

          <h3 style={styles.cardTitle}>
            Learn The Movements
          </h3>

          <p style={styles.cardText}>
            Review exercise instructions and movement details.
          </p>

          <button
            onClick={() => setActiveTab("library")}
            style={styles.outlineButton}
          >
            OPEN LIBRARY
          </button>
        </div>
      </div>
    </>
  );
}

function Workouts({
  program,
  exercises,
  loading,
  error,
  formatText,
}) {
  if (loading) {
    return (
      <div style={styles.section}>
        <div style={styles.goldLabel}>
          MY WORKOUTS
        </div>

        <h2 style={styles.sectionTitle}>
          LOADING YOUR PLAN...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.section}>
        <div style={styles.goldLabel}>
          MY WORKOUTS
        </div>

        <h2 style={styles.sectionTitle}>
          YOUR TRAINING PLAN
        </h2>

        <div style={styles.errorBox}>
          {error}
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div style={styles.section}>
        <div style={styles.goldLabel}>
          MY WORKOUTS
        </div>

        <h2 style={styles.sectionTitle}>
          NO PROGRAM ASSIGNED
        </h2>

        <p style={styles.muted}>
          Complete your onboarding assessment to receive your
          starting program.
        </p>
      </div>
    );
  }

  const workoutDays = [
    ...new Set(
      exercises
        .map((exercise) => exercise.workout_day)
        .filter((day) => day !== null && day !== undefined)
    ),
  ].sort((a, b) => a - b);

  return (
    <div style={styles.section}>
      <div style={styles.goldLabel}>
        MY WORKOUTS
      </div>

      <h2 style={styles.sectionTitle}>
        {program.name}
      </h2>

      <p style={styles.sectionDescription}>
        {program.description}
      </p>

      <div style={styles.programStats}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {program.days_per_week || "-"}
          </span>

          <span style={styles.statLabel}>
            DAYS / WEEK
          </span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {program.session_minutes || "-"}
          </span>

          <span style={styles.statLabel}>
            MINUTES
          </span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {exercises.length}
          </span>

          <span style={styles.statLabel}>
            EXERCISES
          </span>
        </div>
      </div>

      <div style={styles.programDetails}>
        <span>
          <strong>Goal:</strong>{" "}
          {formatText(program.goal)}
        </span>

        <span>
          <strong>Level:</strong>{" "}
          {formatText(program.experience_level)}
        </span>

        <span>
          <strong>Equipment:</strong>{" "}
          {formatText(program.equipment)}
        </span>

        <span>
          <strong>Location:</strong>{" "}
          {formatText(program.location)}
        </span>
      </div>

      {workoutDays.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.cardText}>
            Your workout schedule has not been configured yet.
          </p>
        </div>
      ) : (
        workoutDays.map((day) => {
          const dayExercises = exercises.filter(
            (exercise) =>
              exercise.workout_day === day
          );

          return (
            <div
              key={day}
              style={styles.workoutDay}
            >
              <div style={styles.dayHeader}>
                <div>
                  <div style={styles.goldLabel}>
                    TRAINING DAY
                  </div>

                  <h3 style={styles.dayTitle}>
                    DAY {day}
                  </h3>
                </div>

                <div style={styles.dayExerciseCount}>
                  {dayExercises.length} EXERCISES
                </div>
              </div>

              <div style={styles.exerciseList}>
                {dayExercises.map(
                  (exercise, index) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      number={index + 1}
                      formatText={formatText}
                    />
                  )
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  number,
  formatText,
}) {
  return (
    <div style={styles.exerciseCard}>
      <div style={styles.exerciseNumber}>
        {number}
      </div>

      <div style={styles.exerciseContent}>
        <h3 style={styles.exerciseTitle}>
          {exercise.name}
        </h3>

        <div style={styles.prescription}>
          <div style={styles.prescriptionItem}>
            <span style={styles.prescriptionValue}>
              {exercise.sets || "-"}
            </span>

            <span style={styles.prescriptionLabel}>
              SETS
            </span>
          </div>

          <div style={styles.prescriptionItem}>
            <span style={styles.prescriptionValue}>
              {exercise.reps || "-"}
            </span>

            <span style={styles.prescriptionLabel}>
              REPS
            </span>
          </div>

          <div style={styles.prescriptionItem}>
            <span style={styles.prescriptionValue}>
              {exercise.rest_seconds
                ? `${exercise.rest_seconds}s`
                : "-"}
            </span>

            <span style={styles.prescriptionLabel}>
              REST
            </span>
          </div>
        </div>

        <div style={styles.exerciseTags}>
          {exercise.muscle_group && (
            <span style={styles.tag}>
              {formatText(
                exercise.muscle_group
              )}
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

        {exercise.instructions && (
          <div style={styles.instructionBox}>
            <strong style={styles.instructionTitle}>
              HOW TO
            </strong>

            <p style={styles.exerciseInstructions}>
              {exercise.instructions}
            </p>
          </div>
        )}

        {exercise.notes && (
          <div style={styles.coachNote}>
            <strong style={styles.coachNoteTitle}>
              QUE'S COACHING NOTE
            </strong>

            <p style={styles.coachNoteText}>
              {exercise.notes}
            </p>
          </div>
        )}

        {exercise.video_url && (
          <a
            href={exercise.video_url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.videoLink}
          >
            WATCH EXERCISE VIDEO
          </a>
        )}
      </div>
    </div>
  );
}

function Nutrition() {
  return (
    <div style={styles.section}>
      <div style={styles.goldLabel}>
        NUTRITION
      </div>

      <h2 style={styles.sectionTitle}>
        YOUR NUTRITION PLAN
      </h2>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          Coming Next
        </h3>

        <p style={styles.cardText}>
          Your nutrition targets, meal ideas, grocery guidance,
          and coaching recommendations will appear here.
        </p>
      </div>
    </div>
  );
}

function Progress() {
  return (
    <div style={styles.section}>
      <div style={styles.goldLabel}>
        PROGRESS
      </div>

      <h2 style={styles.sectionTitle}>
        TRACK YOUR RESULTS
      </h2>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          Progress Tracking
        </h3>

        <p style={styles.cardText}>
          Weight, measurements, workout progress, and other
          check-in data will appear here.
        </p>
      </div>
    </div>
  );
}

function CheckIn() {
  return (
    <div style={styles.section}>
      <div style={styles.goldLabel}>
        WEEKLY CHECK-IN
      </div>

      <h2 style={styles.sectionTitle}>
        CHECK IN WITH QUE
      </h2>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          Weekly Coaching Check-In
        </h3>

        <p style={styles.cardText}>
          Your weekly check-in form will be added here so Que can
          review your progress and adjust your coaching.
        </p>
      </div>
    </div>
  );
}

function ExerciseLibrary({
  exercises,
  formatText,
}) {
  return (
    <div style={styles.section}>
      <div style={styles.goldLabel}>
        EXERCISE LIBRARY
      </div>

      <h2 style={styles.sectionTitle}>
        YOUR EXERCISES
      </h2>

      <p style={styles.sectionDescription}>
        Exercises currently included in your assigned training
        plan.
      </p>

      {exercises.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.cardText}>
            Your exercise library will populate when a workout
            program is assigned.
          </p>
        </div>
      ) : (
        <div style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              style={styles.exerciseCard}
            >
              <div style={styles.exerciseContent}>
                <h3 style={styles.exerciseTitle}>
                  {exercise.name}
                </h3>

                <div style={styles.exerciseTags}>
                  {exercise.category && (
                    <span style={styles.tag}>
                      {formatText(
                        exercise.category
                      )}
                    </span>
                  )}

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
                </div>

                {exercise.instructions && (
                  <p style={styles.exerciseInstructions}>
                    {exercise.instructions}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    color: "#FFFFFF",
    fontFamily: "Arial, sans-serif",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#050505",
    color: "#FFFFFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  loadingBox: {
    textAlign: "center",
  },

  loadingTitle: {
    fontSize: "30px",
    marginTop: "10px",
  },

  header: {
    padding: "24px clamp(20px, 5vw, 70px)",
    borderBottom: "1px solid #2A2A2A",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  goldLabel: {
    color: "#F4C20D",
    fontWeight: "900",
    letterSpacing: "2px",
    fontSize: "12px",
  },

  logo: {
    margin: "5px 0 0",
    fontSize: "24px",
  },

  logoutButton: {
    background: "transparent",
    color: "#FFFFFF",
    border: "1px solid #F4C20D",
    borderRadius: "8px",
    padding: "11px 18px",
    fontWeight: "800",
    cursor: "pointer",
  },

  nav: {
    padding: "15px clamp(20px, 5vw, 70px)",
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    borderBottom: "1px solid #2A2A2A",
  },

  navButton: {
    background: "#111111",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    padding: "11px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontWeight: "700",
  },

  activeNavButton: {
    background: "#F4C20D",
    color: "#050505",
    border: "1px solid #F4C20D",
    padding: "11px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontWeight: "900",
  },

  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px 80px",
  },

  heroCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "18px",
    padding: "40px",
    marginBottom: "25px",
  },

  heroTitle: {
    fontSize: "clamp(32px, 6vw, 58px)",
    lineHeight: "1",
    margin: "10px 0 15px",
  },

  heroText: {
    color: "#BDBDBD",
    fontSize: "18px",
    maxWidth: "700px",
    lineHeight: "1.6",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "25px",
  },

  cardLabel: {
    color: "#F4C20D",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  cardTitle: {
    fontSize: "23px",
    margin: "0 0 12px",
  },

  cardText: {
    color: "#BDBDBD",
    lineHeight: "1.6",
    marginBottom: "20px",
  },

  miniStats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
    color: "#FFFFFF",
    fontSize: "13px",
  },

  goldButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontWeight: "900",
    cursor: "pointer",
  },

  outlineButton: {
    width: "100%",
    background: "transparent",
    color: "#FFFFFF",
    border: "1px solid #F4C20D",
    borderRadius: "8px",
    padding: "14px",
    fontWeight: "800",
    cursor: "pointer",
  },

  linkButton: {
    display: "block",
    textAlign: "center",
    background: "transparent",
    color: "#FFFFFF",
    border: "1px solid #F4C20D",
    borderRadius: "8px",
    padding: "14px",
    fontWeight: "800",
    textDecoration: "none",
  },

  section: {
    width: "100%",
  },

  sectionTitle: {
    fontSize: "clamp(32px, 6vw, 52px)",
    margin: "8px 0 12px",
  },

  sectionDescription: {
    color: "#BDBDBD",
    lineHeight: "1.6",
    maxWidth: "750px",
    marginBottom: "25px",
  },

  programStats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    margin: "25px 0",
  },

  statCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  statNumber: {
    color: "#F4C20D",
    fontSize: "32px",
    fontWeight: "900",
  },

  statLabel: {
    color: "#BDBDBD",
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: "800",
    marginTop: "4px",
  },

  programDetails: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "35px",
    color: "#BDBDBD",
  },

  workoutDay: {
    marginBottom: "45px",
  },

  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "15px",
    borderBottom: "1px solid #2A2A2A",
    paddingBottom: "12px",
  },

  dayTitle: {
    fontSize: "32px",
    margin: "4px 0 0",
  },

  dayExerciseCount: {
    background: "#F4C20D",
    color: "#050505",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "900",
  },

  exerciseList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  exerciseCard: {
    display: "flex",
    gap: "18px",
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "22px",
  },

  exerciseNumber: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "50%",
    background: "#F4C20D",
    color: "#050505",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
  },

  exerciseContent: {
    flex: 1,
  },

  exerciseTitle: {
    margin: "3px 0 14px",
    fontSize: "23px",
  },

  prescription: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },

  prescriptionItem: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "10px 16px",
    minWidth: "80px",
    display: "flex",
    flexDirection: "column",
  },

  prescriptionValue: {
    color: "#F4C20D",
    fontWeight: "900",
    fontSize: "18px",
  },

  prescriptionLabel: {
    color: "#BDBDBD",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginTop: "3px",
  },

  exerciseTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginBottom: "12px",
  },

  tag: {
    background: "#2A2A2A",
    color: "#FFFFFF",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  instructionBox: {
    marginTop: "15px",
  },

  instructionTitle: {
    color: "#FFFFFF",
    fontSize: "11px",
    letterSpacing: "1px",
  },

  exerciseInstructions: {
    color: "#BDBDBD",
    lineHeight: "1.6",
    margin: "7px 0",
  },

  coachNote: {
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "14px",
    marginTop: "15px",
  },

  coachNoteTitle: {
    color: "#F4C20D",
    fontSize: "11px",
    letterSpacing: "1px",
  },

  coachNoteText: {
    color: "#BDBDBD",
    lineHeight: "1.5",
    margin: "6px 0 0",
  },

  videoLink: {
    display: "inline-block",
    marginTop: "15px",
    color: "#F4C20D",
    fontWeight: "900",
    textDecoration: "none",
  },

  errorBox: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    padding: "20px",
    borderRadius: "12px",
    color: "#FFFFFF",
    marginTop: "20px",
  },

  muted: {
    color: "#BDBDBD",
    lineHeight: "1.6",
  },
};
