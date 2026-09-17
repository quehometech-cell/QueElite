"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

import Dashboard from "../../components/member/Dashboard";
import Workouts from "../../components/member/Workouts";
import CorrectiveMobility from "../../components/member/CorrectiveMobility";
import Nutrition from "../../components/member/Nutrition";
import Progress from "../../components/member/Progress";
import CheckIn from "../../components/member/CheckIn";
import ExerciseLibrary from "../../components/member/ExerciseLibrary";

const CALENDLY_URL =
  "https://calendly.com/getcharighttransformations22/free-15-minute-assessment";

export default function MembersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [program, setProgram] = useState(null);
  const [workoutExercises, setWorkoutExercises] =
    useState([]);
  const [libraryExercises, setLibraryExercises] =
    useState([]);

  const [nutritionPlan, setNutritionPlan] =
    useState(null);

  const [correctiveRoutine, setCorrectiveRoutine] =
    useState(null);

  const [
    correctiveExercises,
    setCorrectiveExercises,
  ] = useState([]);

  const [weeklyCompleted, setWeeklyCompleted] =
    useState(0);

  const [latestWeight, setLatestWeight] =
    useState(null);

  const [latestCheckIn, setLatestCheckIn] =
    useState(null);

  useEffect(() => {
    initializePortal();
  }, []);

  async function initializePortal() {
    setLoading(true);
    setLoadError("");

    try {
      // =====================================================
      // 1. AUTHENTICATION
      // =====================================================

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const currentUser = session.user;

      setUser(currentUser);

      // =====================================================
      // 2. PROFILE + MEMBERSHIP
      // =====================================================

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, membership_status, role"
        )
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      if (
        profileData.membership_status !== "active"
      ) {
        router.replace("/membership-required");
        return;
      }

      // =====================================================
      // 3. ONBOARDING
      // =====================================================

      const {
        data: onboardingData,
        error: onboardingError,
      } = await supabase
        .from("onboarding_assessments")
        .select("id, completed")
        .eq("user_id", currentUser.id)
        .eq("completed", true)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (onboardingError) {
        throw onboardingError;
      }

      if (!onboardingData) {
        router.replace("/onboarding");
        return;
      }

      // =====================================================
      // 4. LOAD MEMBER PORTAL DATA
      // =====================================================

      // Load the current program first.
      // Weekly completion tracking needs the exact
      // currently assigned program ID.
      const currentProgramId =
        await loadMemberWorkout(currentUser.id);

      await Promise.all([
        loadExerciseLibrary(),
        loadNutrition(currentUser.id),
        loadCorrectiveRoutine(currentUser.id),
        loadWeeklyCompletions(
          currentUser.id,
          currentProgramId
        ),
        loadLatestProgress(currentUser.id),
        loadLatestCheckIn(currentUser.id),
      ]);
    } catch (error) {
      console.error(
        "Member portal initialization error:",
        error
      );

      setLoadError(
        "We couldn't load your member portal. Please refresh and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // MEMBER WORKOUT
  // =========================================================

  async function loadMemberWorkout(userId) {
    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from("member_programs")
      .select("program_id, assigned_at")
      .eq("user_id", userId)
      .order("assigned_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (assignmentError) {
      throw assignmentError;
    }

    if (!assignment?.program_id) {
      setProgram(null);
      setWorkoutExercises([]);
      return null;
    }

    const {
      data: programData,
      error: programError,
    } = await supabase
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

    // Load the rows connecting exercises to this program.

    const {
      data: programExerciseRows,
      error: programExerciseError,
    } = await supabase
      .from("program_exercises")
      .select(
        "id, exercise_id, exercise_order, workout_day, sets, reps, rest_seconds, notes"
      )
      .eq("program_id", assignment.program_id)
      .order("workout_day", {
        ascending: true,
      })
      .order("exercise_order", {
        ascending: true,
      });

    if (programExerciseError) {
      throw programExerciseError;
    }

    if (!programExerciseRows?.length) {
      setWorkoutExercises([]);
      return assignment.program_id;
    }

    // Get all unique exercise IDs.

    const exerciseIds = [
      ...new Set(
        programExerciseRows
          .map((row) => row.exercise_id)
          .filter(
            (exerciseId) =>
              exerciseId !== null &&
              exerciseId !== undefined
          )
      ),
    ];

    if (!exerciseIds.length) {
      console.error(
        "Program exercise rows are missing exercise IDs:",
        programExerciseRows
      );

      setWorkoutExercises([]);
      return assignment.program_id;
    }

    // Load actual exercise information.

    const {
      data: exerciseRows,
      error: exerciseError,
    } = await supabase
      .from("exercises")
      .select(
        "id, name, category, equipment, difficulty, instructions, video_url, muscle_group"
      )
      .in("id", exerciseIds);

    if (exerciseError) {
      throw exerciseError;
    }

    const exerciseMap = new Map(
      (exerciseRows || []).map((exercise) => [
        Number(exercise.id),
        exercise,
      ])
    );

    // =====================================================
    // Preserve BOTH IDs.
    //
    // exercise_id = actual exercise
    // program_exercise_id = program assignment row
    // =====================================================

    const mergedExercises =
      programExerciseRows
        .map((row) => {
          const exercise = exerciseMap.get(
            Number(row.exercise_id)
          );

          if (!exercise) {
            console.error(
              "Exercise not found for program row:",
              row
            );

            return null;
          }

          return {
            ...exercise,

            exercise_id: row.exercise_id,

            program_exercise_id: row.id,

            exercise_order:
              row.exercise_order,

            workout_day:
              row.workout_day,

            sets:
              row.sets,

            reps:
              row.reps,

            rest_seconds:
              row.rest_seconds,

            notes:
              row.notes,
          };
        })
        .filter(Boolean);

    setWorkoutExercises(mergedExercises);

    // IMPORTANT:
    // Return the current program ID so Dashboard
    // completion tracking only counts this program.
    return assignment.program_id;
  }

  // =========================================================
  // EXERCISE LIBRARY
  // =========================================================

  async function loadExerciseLibrary() {
    const { data, error } = await supabase
      .from("exercises")
      .select(
        "id, name, category, equipment, difficulty, instructions, video_url, muscle_group"
      )
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    setLibraryExercises(data || []);
  }

  // =========================================================
  // NUTRITION
  // =========================================================

  async function loadNutrition(userId) {
    const { data, error } = await supabase
      .from("nutrition_plans")
      .select(
        "id, calorie_target, protein_grams, carb_grams, fat_grams, water_ounces, nutrition_goal, meal_guidance, coach_notes, updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    setNutritionPlan(data || null);
  }

  // =========================================================
  // CORRECTIVE / MOBILITY
  // =========================================================

  async function loadCorrectiveRoutine(userId) {
    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from("member_corrective_routines")
      .select(
        "id, routine_id, coach_notes, assigned_at"
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("assigned_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (assignmentError) {
      throw assignmentError;
    }

    if (!assignment?.routine_id) {
      setCorrectiveRoutine(null);
      setCorrectiveExercises([]);
      return;
    }

    const {
      data: routineData,
      error: routineError,
    } = await supabase
      .from("corrective_routines")
      .select(
        "id, name, focus_area, description, days_per_week, session_minutes"
      )
      .eq("id", assignment.routine_id)
      .single();

    if (routineError) {
      throw routineError;
    }

    setCorrectiveRoutine({
      ...routineData,
      coach_notes:
        assignment.coach_notes,
    });

    const {
      data: routineRows,
      error: routineRowsError,
    } = await supabase
      .from("corrective_routine_exercises")
      .select(
        "id, exercise_id, exercise_order, sets, reps, duration_seconds, rest_seconds, notes"
      )
      .eq(
        "routine_id",
        assignment.routine_id
      )
      .order("exercise_order", {
        ascending: true,
      });

    if (routineRowsError) {
      throw routineRowsError;
    }

    if (!routineRows?.length) {
      setCorrectiveExercises([]);
      return;
    }

    const exerciseIds = [
      ...new Set(
        routineRows
          .map((row) => row.exercise_id)
          .filter(
            (exerciseId) =>
              exerciseId !== null &&
              exerciseId !== undefined
          )
      ),
    ];

    const {
      data: exerciseRows,
      error: exerciseError,
    } = await supabase
      .from("exercises")
      .select(
        "id, name, category, equipment, difficulty, instructions, video_url, muscle_group"
      )
      .in("id", exerciseIds);

    if (exerciseError) {
      throw exerciseError;
    }

    const exerciseMap = new Map(
      (exerciseRows || []).map((exercise) => [
        Number(exercise.id),
        exercise,
      ])
    );

    const mergedExercises =
      routineRows
        .map((row) => {
          const exercise = exerciseMap.get(
            Number(row.exercise_id)
          );

          if (!exercise) {
            return null;
          }

          return {
            ...exercise,

            exercise_id:
              row.exercise_id,

            corrective_exercise_id:
              row.id,

            exercise_order:
              row.exercise_order,

            sets:
              row.sets,

            reps:
              row.reps,

            duration_seconds:
              row.duration_seconds,

            rest_seconds:
              row.rest_seconds,

            notes:
              row.notes,
          };
        })
        .filter(Boolean);

    setCorrectiveExercises(
      mergedExercises
    );
  }

  // =========================================================
  // WEEKLY WORKOUT COMPLETIONS
  // =========================================================

  async function loadWeeklyCompletions(
    userId,
    programId
  ) {
    // No assigned program means there should be
    // no Dashboard workout count.
    if (!programId) {
      setWeeklyCompleted(0);
      return;
    }

    const start = getStartOfWeek();

    const { data, error } = await supabase
      .from("workout_completions")
      .select(
        "id, workout_day, completed_at, program_id"
      )
      .eq("user_id", userId)

      // IMPORTANT:
      // Only count workouts belonging to the
      // currently assigned program.
      .eq("program_id", programId)

      .gte(
        "completed_at",
        start.toISOString()
      );

    if (error) {
      throw error;
    }

    setWeeklyCompleted(
      (data || []).length
    );
  }

  // =========================================================
  // PROGRESS
  // =========================================================

  async function loadLatestProgress(userId) {
    const { data, error } = await supabase
      .from("progress_entries")
      .select(
        "id, weight_lbs, recorded_at"
      )
      .eq("user_id", userId)
      .order("recorded_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    setLatestWeight(
      data?.weight_lbs ?? null
    );
  }

  // =========================================================
  // CHECK-IN
  // =========================================================

  async function loadLatestCheckIn(userId) {
    const { data, error } = await supabase
      .from("weekly_checkins")
      .select(
        "id, energy_level, sleep_quality, stress_level, workouts_completed, nutrition_adherence, current_weight, wins, challenges, questions, coach_response, submitted_at"
      )
      .eq("user_id", userId)
      .order("submitted_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    setLatestCheckIn(
      data || null
    );
  }

  // =========================================================
  // WORKOUT CALLBACK
  // =========================================================

  async function handleWorkoutCompletion() {
    if (!user?.id) {
      return;
    }

    await loadWeeklyCompletions(
      user.id,
      program?.id
    );
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingLogo}>
          GCR
        </div>

        <h1 style={styles.loadingTitle}>
          GET CHA RIGHT
        </h1>

        <p style={styles.loadingText}>
          Loading your coaching portal...
        </p>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (loadError) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingLogo}>
          GCR
        </div>

        <h1 style={styles.loadingTitle}>
          SOMETHING WENT WRONG
        </h1>

        <p style={styles.loadingText}>
          {loadError}
        </p>

        <button
          type="button"
          onClick={initializePortal}
          style={styles.retryButton}
        >
          TRY AGAIN
        </button>
      </main>
    );
  }

  // =========================================================
  // MEMBER PORTAL
  // =========================================================

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={() =>
            setActiveTab("dashboard")
          }
          style={styles.brandButton}
        >
          <div style={styles.logo}>
            GCR
          </div>

          <div>
            <strong style={styles.brand}>
              GET CHA RIGHT
            </strong>

            <span style={styles.brandSub}>
              MEMBER PORTAL
            </span>
          </div>
        </button>

        <div style={styles.headerActions}>
          {profile?.role &&
            ["coach", "admin"].includes(
              profile.role
            ) && (
              <button
                type="button"
                onClick={() =>
                  router.push("/coach")
                }
                style={styles.coachButton}
              >
                COACH DASHBOARD
              </button>
            )}

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.bookButton}
          >
            BOOK WITH QUE
          </a>

          <button
            type="button"
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <div style={styles.portal}>
        <aside style={styles.sidebar}>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {getInitials(
                profile?.full_name ||
                  profile?.email ||
                  "Member"
              )}
            </div>

            <div>
              <strong style={styles.memberName}>
                {profile?.full_name ||
                  "Get Cha Right Member"}
              </strong>

              <span style={styles.memberStatus}>
                ACTIVE MEMBER
              </span>
            </div>
          </div>

          <nav style={styles.nav}>
            <NavButton
              label="Dashboard"
              active={
                activeTab === "dashboard"
              }
              onClick={() =>
                setActiveTab("dashboard")
              }
            />

            <NavButton
              label="My Workouts"
              active={
                activeTab === "workouts"
              }
              onClick={() =>
                setActiveTab("workouts")
              }
            />

            <NavButton
              label="Corrective & Mobility"
              active={
                activeTab === "corrective"
              }
              onClick={() =>
                setActiveTab("corrective")
              }
            />

            <NavButton
              label="Nutrition"
              active={
                activeTab === "nutrition"
              }
              onClick={() =>
                setActiveTab("nutrition")
              }
            />

            <NavButton
              label="Progress"
              active={
                activeTab === "progress"
              }
              onClick={() =>
                setActiveTab("progress")
              }
            />

            <NavButton
              label="Check-In"
              active={
                activeTab === "checkin"
              }
              onClick={() =>
                setActiveTab("checkin")
              }
            />

            <NavButton
              label="Exercise Library"
              active={
                activeTab === "library"
              }
              onClick={() =>
                setActiveTab("library")
              }
            />
          </nav>

          <div style={styles.sidebarBottom}>
            <p style={styles.sidebarText}>
              Need help with your plan?
            </p>

            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.sidebarBookButton}
            >
              BOOK WITH QUE
            </a>
          </div>
        </aside>

        <section style={styles.content}>
          {activeTab === "dashboard" && (
            <Dashboard
              program={program}
              exercises={workoutExercises}
              weeklyCompleted={
                weeklyCompleted
              }
              latestWeight={
                latestWeight
              }
              nutritionPlan={
                nutritionPlan
              }
              latestCheckIn={
                latestCheckIn
              }
              hasCorrectiveRoutine={
                Boolean(
                  correctiveRoutine
                )
              }
              setActiveTab={
                setActiveTab
              }
            />
          )}

          {activeTab === "workouts" && (
            <Workouts
              user={user}
              program={program}
              exercises={
                workoutExercises
              }
              onCompletionChange={
                handleWorkoutCompletion
              }
            />
          )}

          {activeTab === "corrective" && (
            <CorrectiveMobility
              routine={
                correctiveRoutine
              }
              exercises={
                correctiveExercises
              }
            />
          )}

          {activeTab === "nutrition" && (
            <Nutrition
              nutritionPlan={
                nutritionPlan
              }
            />
          )}

          {activeTab === "progress" && (
            <Progress user={user} />
          )}

          {activeTab === "checkin" && (
            <CheckIn user={user} />
          )}

          {activeTab === "library" && (
            <ExerciseLibrary
              exercises={
                libraryExercises
              }
            />
          )}
        </section>
      </div>
    </main>
  );
}

// ===========================================================
// NAV BUTTON
// ===========================================================

function NavButton({
  label,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.navButton,
        ...(active
          ? styles.navButtonActive
          : {}),
      }}
    >
      <span
        style={{
          ...styles.navIndicator,
          ...(active
            ? styles.navIndicatorActive
            : {}),
        }}
      />

      {label}
    </button>
  );
}

// ===========================================================
// INITIALS
// ===========================================================

function getInitials(value) {
  if (!value) {
    return "GCR";
  }

  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

// ===========================================================
// START OF WEEK
// ===========================================================

function getStartOfWeek() {
  const now = new Date();

  const day = now.getDay();

  const difference =
    day === 0 ? -6 : 1 - day;

  const monday = new Date(now);

  monday.setDate(
    now.getDate() + difference
  );

  monday.setHours(
    0,
    0,
    0,
    0
  );

  return monday;
}

// ===========================================================
// STYLES
// ===========================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    color: "#FFFFFF",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#050505",
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "25px",
    textAlign: "center",
  },

  loadingLogo: {
    width: "70px",
    height: "70px",
    borderRadius: "16px",
    background: "#F4C20D",
    color: "#050505",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
    fontSize: "20px",
    marginBottom: "18px",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "30px",
  },

  loadingText: {
    color: "#BDBDBD",
  },

  retryButton: {
    marginTop: "15px",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "9px",
    padding: "14px 20px",
    fontWeight: "900",
    cursor: "pointer",
  },

  header: {
    minHeight: "72px",
    borderBottom:
      "1px solid #2A2A2A",
    background: "#0B0B0B",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "15px",
    padding: "12px 24px",
    position: "sticky",
    top: 0,
    zIndex: 20,
    flexWrap: "wrap",
  },

  brandButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: "11px",
    cursor: "pointer",
    textAlign: "left",
  },

  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#F4C20D",
    color: "#050505",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "900",
  },

  brand: {
    color: "#FFFFFF",
    display: "block",
    fontSize: "14px",
    letterSpacing: "1px",
  },

  brandSub: {
    color: "#777777",
    display: "block",
    fontSize: "9px",
    marginTop: "2px",
    letterSpacing: "1px",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  bookButton: {
    background: "#F4C20D",
    color: "#050505",
    textDecoration: "none",
    borderRadius: "8px",
    padding: "10px 13px",
    fontSize: "10px",
    fontWeight: "900",
  },

  coachButton: {
    background: "#FFFFFF",
    color: "#050505",
    border: "none",
    borderRadius: "8px",
    padding: "10px 13px",
    fontSize: "10px",
    fontWeight: "900",
    cursor: "pointer",
  },

  logoutButton: {
    background: "transparent",
    color: "#BDBDBD",
    border:
      "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "10px 13px",
    fontSize: "10px",
    fontWeight: "900",
    cursor: "pointer",
  },

  portal: {
    display: "flex",
    width: "100%",
    minHeight:
      "calc(100vh - 72px)",
  },

  sidebar: {
    width: "245px",
    minWidth: "245px",
    borderRight:
      "1px solid #2A2A2A",
    background: "#0B0B0B",
    padding: "22px 14px",
    display: "flex",
    flexDirection: "column",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "10px",
    marginBottom: "18px",
  },

  avatar: {
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
    fontSize: "12px",
  },

  memberName: {
    color: "#FFFFFF",
    display: "block",
    fontSize: "13px",
  },

  memberStatus: {
    color: "#F4C20D",
    display: "block",
    fontSize: "8px",
    fontWeight: "900",
    marginTop: "3px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navButton: {
    position: "relative",
    width: "100%",
    background: "transparent",
    color: "#999999",
    border: "none",
    borderRadius: "8px",
    padding:
      "13px 13px 13px 18px",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "12px",
  },

  navButtonActive: {
    background: "#151515",
    color: "#FFFFFF",
  },

  navIndicator: {
    position: "absolute",
    left: "6px",
    top: "50%",
    transform:
      "translateY(-50%)",
    width: "3px",
    height: "18px",
    borderRadius: "5px",
    background: "transparent",
  },

  navIndicatorActive: {
    background: "#F4C20D",
  },

  sidebarBottom: {
    marginTop: "auto",
    borderTop:
      "1px solid #2A2A2A",
    padding:
      "18px 8px 0",
  },

  sidebarText: {
    color: "#777777",
    fontSize: "11px",
  },

  sidebarBookButton: {
    display: "block",
    textAlign: "center",
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "8px",
    padding: "11px",
    textDecoration: "none",
    fontWeight: "900",
    fontSize: "10px",
  },

  content: {
    flex: 1,
    minWidth: 0,
    padding:
      "clamp(22px, 4vw, 48px)",
    overflow: "hidden",
  },
};
