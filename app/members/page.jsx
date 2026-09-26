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
import InstallApp from "../../components/InstallApp";

const CALENDLY_URL =
  "https://calendly.com/getcharighttransformations22/free-15-minute-assessment";

const VALID_TABS = [
  "dashboard",
  "workouts",
  "corrective",
  "nutrition",
  "progress",
  "checkin",
  "library",
];

const ACTIVE_TAB_STORAGE_KEY = "gcr-member-active-tab";

const COACH_SELF_SERVICES = [
  "workouts",
  "nutrition_targets",
  "custom_meal_plan",
  "corrective_mobility",
  "progress_tracking",
  "weekly_checkins",
  "exercise_library",
];

export default function MembersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [activePackage, setActivePackage] =
    useState(null);
  const [serviceEntitlements, setServiceEntitlements] =
    useState([]);

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

  const [
    weeklyCorrectiveCompleted,
    setWeeklyCorrectiveCompleted,
  ] = useState(0);

  const [
    weeklyNutritionDays,
    setWeeklyNutritionDays,
  ] = useState(0);

  const [latestWeight, setLatestWeight] =
    useState(null);

  const [latestCheckIn, setLatestCheckIn] =
    useState(null);

  useEffect(() => {
    const savedTab = window.localStorage.getItem(
      ACTIVE_TAB_STORAGE_KEY
    );

    if (savedTab && VALID_TABS.includes(savedTab)) {
      setActiveTab(savedTab);
    }

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

      const isCoachSelf = ["coach", "admin"].includes(
        profileData.role
      );

      if (
        !isCoachSelf &&
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

      if (!onboardingData && !isCoachSelf) {
        router.replace("/onboarding");
        return;
      }

      // =====================================================
      // 4. PACKAGE + SERVICE ENTITLEMENTS
      // =====================================================

      const entitlementResult = isCoachSelf
        ? {
            package: null,
            services: COACH_SELF_SERVICES,
          }
        : await loadServiceEntitlements(currentUser.id);

      if (isCoachSelf) {
        setActivePackage(null);
        setServiceEntitlements(COACH_SELF_SERVICES);
      }

      const effectiveServices =
        entitlementResult.services;

      // If a saved tab is no longer included in the client's
      // package, return them safely to the dashboard.
      const savedTab =
        window.localStorage.getItem(
          ACTIVE_TAB_STORAGE_KEY
        );

      if (
        savedTab &&
        savedTab !== "dashboard" &&
        !isTabAllowed(
          savedTab,
          effectiveServices
        )
      ) {
        setActiveTab("dashboard");
        window.localStorage.setItem(
          ACTIVE_TAB_STORAGE_KEY,
          "dashboard"
        );
      }

      // =====================================================
      // 5. LOAD MEMBER PORTAL DATA
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
        loadWeeklyCorrectiveCompletions(
          currentUser.id
        ),
        loadWeeklyNutritionDays(
          currentUser.id
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
  // PACKAGE + SERVICE ENTITLEMENTS
  // =========================================================

  async function loadServiceEntitlements(userId) {
    const {
      data: clientPackage,
      error: packageError,
    } = await supabase
      .from("client_packages")
      .select(
        "id, package_id, status, start_date, end_date"
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (packageError) {
      throw packageError;
    }

    if (!clientPackage?.package_id) {
      setActivePackage(null);
      setServiceEntitlements([]);
      return {
        package: null,
        services: [],
      };
    }

    const [
      packageResult,
      packageServicesResult,
      overrideResult,
    ] = await Promise.all([
      supabase
        .from("coaching_packages")
        .select(
          "id, name, slug, description, price_cents, billing_interval, duration_weeks, stripe_price_id"
        )
        .eq("id", clientPackage.package_id)
        .single(),

      supabase
        .from("package_services")
        .select("service_id")
        .eq(
          "package_id",
          clientPackage.package_id
        ),

      supabase
        .from(
          "client_service_entitlements"
        )
        .select(
          "service_id, enabled, source, notes"
        )
        .eq("user_id", userId),
    ]);

    if (packageResult.error) {
      throw packageResult.error;
    }

    if (packageServicesResult.error) {
      throw packageServicesResult.error;
    }

    if (overrideResult.error) {
      throw overrideResult.error;
    }

    const serviceIds = [
      ...new Set([
        ...(packageServicesResult.data || []).map(
          (row) => Number(row.service_id)
        ),
        ...(overrideResult.data || []).map(
          (row) => Number(row.service_id)
        ),
      ]),
    ].filter(
      (serviceId) =>
        Number.isFinite(serviceId) &&
        serviceId > 0
    );

    let serviceRows = [];

    if (serviceIds.length > 0) {
      const {
        data,
        error,
      } = await supabase
        .from("coaching_services")
        .select(
          "id, service_key, name, description, is_active"
        )
        .in("id", serviceIds);

      if (error) {
        throw error;
      }

      serviceRows = data || [];
    }

    const packageServiceIds = new Set(
      (packageServicesResult.data || []).map(
        (row) => Number(row.service_id)
      )
    );

    const overrideMap = new Map(
      (overrideResult.data || []).map(
        (row) => [
          Number(row.service_id),
          Boolean(row.enabled),
        ]
      )
    );

    const effectiveServices = serviceRows
      .filter((service) => {
        const serviceId = Number(service.id);

        if (overrideMap.has(serviceId)) {
          return (
            overrideMap.get(serviceId) === true &&
            service.is_active !== false
          );
        }

        return (
          packageServiceIds.has(serviceId) &&
          service.is_active !== false
        );
      })
      .map((service) => service.service_key);

    const packageWithAssignment = {
      ...packageResult.data,
      client_package_id: clientPackage.id,
      status: clientPackage.status,
      start_date: clientPackage.start_date,
      end_date: clientPackage.end_date,
    };

    setActivePackage(
      packageWithAssignment
    );
    setServiceEntitlements(
      effectiveServices
    );

    return {
      package: packageWithAssignment,
      services: effectiveServices,
    };
  }

  // =========================================================
  // MEMBER WORKOUT
  // =========================================================

  async function loadMemberWorkout(userId) {
    // Keep current_week synchronized with the assignment start date
    // before loading the active program and its current week.
    const { error: weekSyncError } = await supabase.rpc(
      "sync_member_program_week",
      {
        p_user_id: userId,
      }
    );

    if (weekSyncError) {
      throw weekSyncError;
    }

    // =====================================================
    // NEW WORKOUT ENGINE
    // Member -> Assignment -> Program -> Current Week
    // -> Workout Days -> Prescribed Exercises
    // =====================================================

    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from("member_programs")
      .select(
        "id, program_id, assigned_at, start_date, end_date, current_week, status, assignment_type, coach_id"
      )
      .eq("user_id", userId)
      .eq("status", "active")
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
        "id, name, goal, experience_level, equipment, days_per_week, session_minutes, location, description, duration_weeks, program_type"
      )
      .eq("id", assignment.program_id)
      .single();

    if (programError) {
      throw programError;
    }

    const currentWeek = Math.max(
      1,
      Number(assignment.current_week || 1)
    );

    const programWithAssignment = {
      ...programData,
      member_program_id: assignment.id,
      assignment_id: assignment.id,
      assigned_at: assignment.assigned_at,
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      current_week: currentWeek,
      assignment_status: assignment.status,
      assignment_type: assignment.assignment_type,
      coach_id: assignment.coach_id,
    };

    // Load the member's current week from the new
    // 12-week program structure.
    const {
      data: weekData,
      error: weekError,
    } = await supabase
      .from("program_weeks")
      .select(
        "id, week_number, name, phase_name, description, coach_notes"
      )
      .eq("program_id", assignment.program_id)
      .eq("week_number", currentWeek)
      .maybeSingle();

    if (weekError) {
      throw weekError;
    }

    const programWithWeek = {
      ...programWithAssignment,
      week_id: weekData?.id || null,
      week_number: weekData?.week_number || currentWeek,
      week_name: weekData?.name || null,
      phase_name: weekData?.phase_name || null,
      week_description: weekData?.description || null,
      week_coach_notes: weekData?.coach_notes || null,
    };

    setProgram(programWithWeek);

    if (!weekData?.id) {
      setWorkoutExercises([]);
      return assignment.program_id;
    }

    const {
      data: workoutRows,
      error: workoutError,
    } = await supabase
      .from("program_workouts")
      .select(
        "id, workout_day, name, workout_type, description, estimated_minutes, coach_notes, is_rest_day"
      )
      .eq("program_week_id", weekData.id)
      .order("workout_day", {
        ascending: true,
      });

    if (workoutError) {
      throw workoutError;
    }

    if (!workoutRows?.length) {
      setWorkoutExercises([]);
      return assignment.program_id;
    }

    const workoutIds = workoutRows.map(
      (workout) => workout.id
    );

    const {
      data: prescriptionRows,
      error: prescriptionError,
    } = await supabase
      .from("program_workout_exercises")
      .select(
        "id, program_workout_id, exercise_id, exercise_order, sets, reps, rir, rest_seconds, tempo, duration_seconds, distance_target, distance_unit, pace_target, notes"
      )
      .in("program_workout_id", workoutIds)
      .order("exercise_order", {
        ascending: true,
      });

    if (prescriptionError) {
      throw prescriptionError;
    }

    const exerciseIds = [
      ...new Set(
        (prescriptionRows || [])
          .map((row) => row.exercise_id)
          .filter(
            (exerciseId) =>
              exerciseId !== null &&
              exerciseId !== undefined
          )
      ),
    ];

    let exerciseRows = [];

    if (exerciseIds.length) {
      const {
        data,
        error: exerciseError,
      } = await supabase
        .from("exercises")
        .select(
          "id, name, category, equipment, difficulty, instructions, instructions_short, coaching_cues, common_mistakes, video_url, muscle_group, movement_pattern, secondary_muscles, exercise_type, unilateral, tracking_type"
        )
        .in("id", exerciseIds);

      if (exerciseError) {
        throw exerciseError;
      }

      exerciseRows = data || [];
    }

    const workoutMap = new Map(
      workoutRows.map((workout) => [
        String(workout.id),
        workout,
      ])
    );

    const exerciseMap = new Map(
      exerciseRows.map((exercise) => [
        String(exercise.id),
        exercise,
      ])
    );

    // Keep the existing flat exercises prop temporarily so
    // Dashboard and the current Workouts component continue
    // rendering while Step 27B replaces the workout UI.
    // Extra IDs/fields below are for the new logging engine.
    const mergedExercises = (prescriptionRows || [])
      .map((row) => {
        const workout = workoutMap.get(
          String(row.program_workout_id)
        );

        const exercise = exerciseMap.get(
          String(row.exercise_id)
        );

        if (!workout || !exercise) {
          return null;
        }

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
        const dayDifference =
          Number(a.workout_day || 0) -
          Number(b.workout_day || 0);

        if (dayDifference !== 0) {
          return dayDifference;
        }

        return (
          Number(a.exercise_order || 0) -
          Number(b.exercise_order || 0)
        );
      });

    setWorkoutExercises(mergedExercises);

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
      .eq("coach_approved", true)
      .order("updated_at", { ascending: false })
      .limit(1)
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
        String(exercise.id),
        exercise,
      ])
    );

    const mergedExercises =
      routineRows
        .map((row) => {
          const exercise = exerciseMap.get(
            String(row.exercise_id)
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
    if (!programId) {
      setWeeklyCompleted(0);
      return;
    }

    const start = getLocalWeekStartString();
    const today = getLocalDateString();

    const { data, error } = await supabase
      .from("workout_completions")
      .select(
        "id, workout_day, completion_date, program_id"
      )
      .eq("user_id", userId)
      .eq("program_id", programId)
      .gte("completion_date", start)
      .lte("completion_date", today);

    if (error) {
      throw error;
    }

    setWeeklyCompleted((data || []).length);
  }

  // =========================================================
  // WEEKLY CORRECTIVE COMPLETIONS
  // =========================================================

  async function loadWeeklyCorrectiveCompletions(
    userId
  ) {
    const start = getLocalWeekStartString();
    const today = getLocalDateString();

    const { data, error } = await supabase
      .from("corrective_routine_completions")
      .select("id, routine_id, completion_date")
      .eq("user_id", userId)
      .gte("completion_date", start)
      .lte("completion_date", today);

    if (error) {
      throw error;
    }

    setWeeklyCorrectiveCompleted(
      (data || []).length
    );
  }

  // =========================================================
  // WEEKLY NUTRITION LOGS
  // =========================================================

  async function loadWeeklyNutritionDays(userId) {
    const start = getLocalWeekStartString();
    const today = getLocalDateString();

    const { data, error } = await supabase
      .from("nutrition_logs")
      .select("id, log_date")
      .eq("user_id", userId)
      .gte("log_date", start)
      .lte("log_date", today);

    if (error) {
      throw error;
    }

    const uniqueDays = new Set(
      (data || []).map((row) => row.log_date)
    );

    setWeeklyNutritionDays(uniqueDays.size);
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

  async function handleCorrectiveCompletion() {
    if (!user?.id) {
      return;
    }

    await loadWeeklyCorrectiveCompletions(
      user.id
    );
  }

  async function handleNutritionChange() {
    if (!user?.id) {
      return;
    }

    await loadWeeklyNutritionDays(
      user.id
    );
  }

  function hasService(serviceKey) {
    return serviceEntitlements.includes(
      serviceKey
    );
  }

  function canOpenTab(tab) {
    return isTabAllowed(
      tab,
      serviceEntitlements
    );
  }

  function changeTab(tab) {
    if (
      !VALID_TABS.includes(tab) ||
      !canOpenTab(tab)
    ) {
      return;
    }

    setActiveTab(tab);
    window.localStorage.setItem(
      ACTIVE_TAB_STORAGE_KEY,
      tab
    );
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function handleLogout() {
    window.localStorage.removeItem(
      ACTIVE_TAB_STORAGE_KEY
    );

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
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          max-width: 100%;
          overflow-x: hidden;
        }

        .gcr-member-header {
          min-width: 0;
        }

        .gcr-member-portal {
          min-width: 0;
        }

        .gcr-member-sidebar {
          min-width: 245px;
        }

        .gcr-member-content {
          min-width: 0;
          width: 100%;
        }

        @media (max-width: 768px) {
          .gcr-member-header {
            position: relative !important;
            padding: 10px 12px !important;
            gap: 10px !important;
            align-items: flex-start !important;
          }

          .gcr-member-header-actions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .gcr-member-header-actions > * {
            width: 100% !important;
            min-width: 0 !important;
            text-align: center !important;
          }

          .gcr-member-portal {
            display: block !important;
            width: 100% !important;
            min-height: 0 !important;
          }

          .gcr-member-sidebar {
            width: 100% !important;
            min-width: 0 !important;
            border-right: none !important;
            border-bottom: 1px solid #2A2A2A !important;
            padding: 12px !important;
          }

          .gcr-member-profile-card {
            margin-bottom: 10px !important;
            padding: 6px 4px !important;
          }

          .gcr-member-nav {
            flex-direction: row !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            gap: 8px !important;
            padding: 2px 12px 8px !important;
            scroll-padding-inline: 12px !important;
            scrollbar-width: none !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
          }

          .gcr-member-nav::-webkit-scrollbar {
            display: none;
          }

          .gcr-member-nav button {
            width: auto !important;
            min-width: max-content !important;
            flex: 0 0 auto !important;
            padding: 11px 16px 11px 20px !important;
            white-space: nowrap !important;
            scroll-snap-align: start;
          }

          .gcr-member-nav button:first-child {
            margin-left: 0 !important;
          }

          .gcr-member-nav button:last-child {
            margin-right: 4px !important;
          }

          .gcr-member-sidebar-bottom {
            display: none !important;
          }

          .gcr-member-content {
            width: 100% !important;
            max-width: 100% !important;
            padding: 18px 12px 28px !important;
            overflow: visible !important;
          }

          .gcr-member-content > * {
            max-width: 100% !important;
            min-width: 0 !important;
          }
        }

        @media (max-width: 420px) {
          .gcr-member-header-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <header className="gcr-member-header" style={styles.header}>
        <button
          type="button"
          onClick={() =>
            changeTab("dashboard")
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

        <div className="gcr-member-header-actions" style={styles.headerActions}>
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

      <div className="gcr-member-portal" style={styles.portal}>
        <aside className="gcr-member-sidebar" style={styles.sidebar}>
          <div className="gcr-member-profile-card" style={styles.profileCard}>
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

          <nav className="gcr-member-nav" style={styles.nav}>
            <NavButton
              label="Dashboard"
              active={
                activeTab === "dashboard"
              }
              onClick={() =>
                changeTab("dashboard")
              }
            />

            {hasService("workouts") && program && (
              <NavButton
                label="My Workouts"
                active={
                  activeTab === "workouts"
                }
                onClick={() =>
                  changeTab("workouts")
                }
              />
            )}

            {hasService("corrective_mobility") && correctiveRoutine && (
              <NavButton
                label="Corrective & Mobility"
                active={
                  activeTab === "corrective"
                }
                onClick={() =>
                  changeTab("corrective")
                }
              />
            )}

            {(hasService("nutrition_targets") ||
              hasService("custom_meal_plan")) &&
              nutritionPlan && (
              <NavButton
                label="Nutrition"
                active={
                  activeTab === "nutrition"
                }
                onClick={() =>
                  changeTab("nutrition")
                }
              />
            )}

            {hasService("progress_tracking") && (
              <NavButton
                label="Progress"
                active={
                  activeTab === "progress"
                }
                onClick={() =>
                  changeTab("progress")
                }
              />
            )}

            {hasService("weekly_checkins") && (
              <NavButton
                label="Check-In"
                active={
                  activeTab === "checkin"
                }
                onClick={() =>
                  changeTab("checkin")
                }
              />
            )}

            {hasService("exercise_library") && (
              <NavButton
                label="Exercise Library"
                active={
                  activeTab === "library"
                }
                onClick={() =>
                  changeTab("library")
                }
              />
            )}
          </nav>

          <div className="gcr-member-sidebar-bottom" style={styles.sidebarBottom}>
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

        <section className="gcr-member-content" style={styles.content}>
          {activeTab === "dashboard" && (
            <Dashboard
              activePackage={activePackage}
              entitlements={serviceEntitlements}
              program={
                hasService("workouts")
                  ? program
                  : null
              }
              exercises={
                hasService("workouts")
                  ? workoutExercises
                  : []
              }
              weeklyCompleted={
                weeklyCompleted
              }
              weeklyCorrectiveCompleted={
                weeklyCorrectiveCompleted
              }
              weeklyNutritionDays={
                weeklyNutritionDays
              }
              latestWeight={
                latestWeight
              }
              nutritionPlan={
                hasService("nutrition_targets") ||
                hasService("custom_meal_plan")
                  ? nutritionPlan
                  : null
              }
              latestCheckIn={
                latestCheckIn
              }
              hasCorrectiveRoutine={
                hasService(
                  "corrective_mobility"
                ) &&
                Boolean(
                  correctiveRoutine
                )
              }
              correctiveTarget={
                correctiveRoutine?.days_per_week || 0
              }
              setActiveTab={
                changeTab
              }
            />
          )}

          {activeTab === "workouts" &&
            hasService("workouts") &&
            program && (
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

          {activeTab === "corrective" &&
            hasService("corrective_mobility") &&
            correctiveRoutine && (
            <CorrectiveMobility
              user={user}
              routine={
                correctiveRoutine
              }
              exercises={
                correctiveExercises
              }
              onCompletionChange={
                handleCorrectiveCompletion
              }
            />
          )}

          {activeTab === "nutrition" &&
            (hasService("nutrition_targets") ||
              hasService("custom_meal_plan")) &&
            nutritionPlan && (
            <Nutrition
              user={user}
              nutritionPlan={
                nutritionPlan
              }
              onNutritionChange={
                handleNutritionChange
              }
            />
          )}

          {activeTab === "progress" &&
            hasService("progress_tracking") && (
            <Progress user={user} />
          )}

          {activeTab === "checkin" &&
            hasService("weekly_checkins") && (
            <CheckIn user={user} />
          )}

          {activeTab === "library" &&
            hasService("exercise_library") && (
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
// PACKAGE / TAB ACCESS
// ===========================================================

function isTabAllowed(
  tab,
  entitlements = []
) {
  if (tab === "dashboard") {
    return true;
  }

  const services = new Set(
    entitlements || []
  );

  if (tab === "workouts") {
    return services.has("workouts");
  }

  if (tab === "corrective") {
    return services.has(
      "corrective_mobility"
    );
  }

  if (tab === "nutrition") {
    return (
      services.has("nutrition_targets") ||
      services.has("custom_meal_plan")
    );
  }

  if (tab === "progress") {
    return services.has(
      "progress_tracking"
    );
  }

  if (tab === "checkin") {
    return services.has(
      "weekly_checkins"
    );
  }

  if (tab === "library") {
    return services.has(
      "exercise_library"
    );
  }

  return false;
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
