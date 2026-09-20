"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

import ClientList from "../../components/coach/ClientList";
import ClientOverview from "../../components/coach/ClientOverview";
import ClientWorkouts from "../../components/coach/ClientWorkouts";
import ClientNutrition from "../../components/coach/ClientNutrition";
import ClientProgress from "../../components/coach/ClientProgress";
import ClientCheckIns from "../../components/coach/ClientCheckIns";
import CorrectiveAssignments from "../../components/coach/CorrectiveAssignments";
import CoachNotes from "../../components/coach/CoachNotes";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "workouts", label: "Workouts" },
  { id: "nutrition", label: "Nutrition" },
  { id: "corrective", label: "Corrective" },
  { id: "progress", label: "Progress" },
  { id: "checkins", label: "Check-Ins" },
  { id: "notes", label: "Private Notes" },
];

export default function CoachPage() {
  const router = useRouter();

  const [coachUser, setCoachUser] = useState(null);
  const [coachProfile, setCoachProfile] = useState(null);

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const [activeSection, setActiveSection] = useState("overview");

  const [programs, setPrograms] = useState([]);
  const [program, setProgram] = useState(null);
  const [programExercises, setProgramExercises] = useState([]);

  const [onboarding, setOnboarding] = useState(null);

  const [nutritionPlan, setNutritionPlan] = useState(null);

  const [progressEntries, setProgressEntries] = useState([]);

  const [checkIns, setCheckIns] = useState([]);

  const [weeklyCompletions, setWeeklyCompletions] = useState([]);

  const [routines, setRoutines] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [currentRoutine, setCurrentRoutine] = useState(null);

  const [coachNotes, setCoachNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [clientLoading, setClientLoading] = useState(false);
  const [fatalError, setFatalError] = useState("");

  const selectedClient = useMemo(
    () =>
      clients.find(
        (client) => client.id === selectedClientId
      ) || null,
    [clients, selectedClientId]
  );

  const latestProgress = progressEntries[0] || null;
  const latestCheckIn = checkIns[0] || null;

  const loadProgramExercises = useCallback(
    async (memberProgram) => {
      if (!memberProgram?.program_id) {
        setProgramExercises([]);
        return;
      }

      const currentWeek = Math.max(
        1,
        Number(memberProgram.current_week || 1)
      );

      /*
       * The current workout system is:
       * program -> program_weeks -> program_workouts
       * -> program_workout_exercises -> exercises.
       *
       * Only the client's current assigned week is loaded here.
       */
      const { data: weekRows, error: weekError } =
        await supabase
          .from("program_weeks")
          .select(
            "id, program_id, week_number, name, phase_name, description, coach_notes"
          )
          .eq("program_id", memberProgram.program_id)
          .eq("week_number", currentWeek)
          .limit(1);

      if (weekError) {
        throw weekError;
      }

      const programWeek = weekRows?.[0] || null;

      if (!programWeek?.id) {
        setProgramExercises([]);
        return;
      }

      const { data: workoutRows, error: workoutError } =
        await supabase
          .from("program_workouts")
          .select(
            "id, program_week_id, workout_day, name, workout_type, description, estimated_minutes, coach_notes, is_rest_day"
          )
          .eq("program_week_id", programWeek.id)
          .order("workout_day", { ascending: true });

      if (workoutError) {
        throw workoutError;
      }

      if (!workoutRows?.length) {
        setProgramExercises([]);
        return;
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
        .order("exercise_order", { ascending: true });

      if (prescriptionError) {
        throw prescriptionError;
      }

      const exerciseIds = [
        ...new Set(
          (prescriptionRows || [])
            .map((item) => item.exercise_id)
            .filter(Boolean)
        ),
      ];

      let exerciseRows = [];

      if (exerciseIds.length > 0) {
        const { data, error: exerciseError } =
          await supabase
            .from("exercises")
            .select(
              "id, name, category, equipment, difficulty, instructions, video_url, muscle_group, is_active"
            )
            .in("id", exerciseIds);

        if (exerciseError) {
          throw exerciseError;
        }

        exerciseRows = data || [];
      }

      const exerciseMap = new Map(
        exerciseRows.map((exercise) => [
          String(exercise.id),
          exercise,
        ])
      );

      const workoutMap = new Map(
        workoutRows.map((workout) => [
          String(workout.id),
          workout,
        ])
      );

      const merged = (prescriptionRows || []).map(
        (prescription) => {
          const workout =
            workoutMap.get(
              String(prescription.program_workout_id)
            ) || {};

          const exercise =
            exerciseMap.get(
              String(prescription.exercise_id)
            ) || {};

          return {
            ...exercise,
            program_workout_exercise_id:
              prescription.id,
            exercise_id: prescription.exercise_id,
            exercise_order:
              prescription.exercise_order,
            workout_day: workout.workout_day,
            workout_name: workout.name,
            workout_type: workout.workout_type,
            workout_description: workout.description,
            workout_estimated_minutes:
              workout.estimated_minutes,
            workout_coach_notes:
              workout.coach_notes,
            is_rest_day: workout.is_rest_day,
            week_number: programWeek.week_number,
            week_name: programWeek.name,
            phase: programWeek.phase_name,
            phase_name: programWeek.phase_name,
            sets: prescription.sets,
            reps: prescription.reps,
            rir: prescription.rir,
            rest_seconds:
              prescription.rest_seconds,
            tempo: prescription.tempo,
            duration_seconds:
              prescription.duration_seconds,
            duration_minutes:
              prescription.duration_seconds
                ? Math.round(Number(prescription.duration_seconds) / 60)
                : null,
            distance_target:
              prescription.distance_target,
            distance_unit:
              prescription.distance_unit,
            pace_target:
              prescription.pace_target,
            distance: prescription.distance_target,
            pace: prescription.pace_target,
            notes: prescription.notes,
          };
        }
      );

      setProgramExercises(merged);
    },
    []
  );

  const loadClientData = useCallback(
    async (clientId) => {
      if (!clientId) return;

      setClientLoading(true);

      try {
        /*
         * PROGRAM ASSIGNMENT
         */
        const {
          data: memberProgramRows,
          error: memberProgramError,
        } = await supabase
          .from("member_programs")
          .select(
            "id, user_id, program_id, assigned_at, start_date, end_date, current_week, status, assignment_type, coach_id"
          )
          .eq("user_id", clientId)
          .eq("status", "active")
          .order("assigned_at", { ascending: false })
          .limit(1);

        if (memberProgramError) {
          throw memberProgramError;
        }

        const memberProgram =
          memberProgramRows?.[0] || null;

        const assignedProgram =
          programs.find(
            (item) =>
              item.id === memberProgram?.program_id
          ) || null;

        setProgram(
          assignedProgram
            ? {
                ...assignedProgram,
                member_program_id: memberProgram?.id || null,
                assigned_at: memberProgram?.assigned_at || null,
                start_date: memberProgram?.start_date || null,
                end_date: memberProgram?.end_date || null,
                current_week: Math.max(
                  1,
                  Number(memberProgram?.current_week || 1)
                ),
                assignment_status: memberProgram?.status || null,
                assignment_type: memberProgram?.assignment_type || null,
                coach_id: memberProgram?.coach_id || null,
              }
            : null
        );

        if (assignedProgram?.id) {
          await loadProgramExercises(memberProgram);
        } else {
          setProgramExercises([]);
        }

        /*
         * ONBOARDING
         */
        const {
          data: onboardingRows,
          error: onboardingError,
        } = await supabase
          .from("onboarding_assessments")
          .select("*")
          .eq("user_id", clientId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (onboardingError) {
          throw onboardingError;
        }

        setOnboarding(
          onboardingRows?.[0] || null
        );

        /*
         * NUTRITION
         */
        const {
          data: nutritionRows,
          error: nutritionError,
        } = await supabase
          .from("nutrition_plans")
          .select("*")
          .eq("user_id", clientId)
          .limit(1);

        if (nutritionError) {
          throw nutritionError;
        }

        setNutritionPlan(
          nutritionRows?.[0] || null
        );

        /*
         * PROGRESS
         */
        const {
          data: progressRows,
          error: progressError,
        } = await supabase
          .from("progress_entries")
          .select("*")
          .eq("user_id", clientId)
          .order("recorded_at", {
            ascending: false,
          });

        if (progressError) {
          throw progressError;
        }

        setProgressEntries(
          progressRows || []
        );

        /*
         * CHECK-INS
         */
        const {
          data: checkInRows,
          error: checkInError,
        } = await supabase
          .from("weekly_checkins")
          .select("*")
          .eq("user_id", clientId)
          .order("submitted_at", {
            ascending: false,
          });

        if (checkInError) {
          throw checkInError;
        }

        setCheckIns(checkInRows || []);

        /*
         * WORKOUT COMPLETIONS FOR CURRENT WEEK
         */
        const startOfWeek =
          getStartOfWeekISO();

        let completionQuery = supabase
          .from("workout_completions")
          .select("*")
          .eq("user_id", clientId)
          .gte("completed_at", startOfWeek)
          .order("completed_at", {
            ascending: false,
          });

        if (assignedProgram?.id) {
          completionQuery =
            completionQuery.eq(
              "program_id",
              assignedProgram.id
            );
        }

        const {
          data: completionRows,
          error: completionError,
        } = await completionQuery;

        if (completionError) {
          throw completionError;
        }

        setWeeklyCompletions(
          completionRows || []
        );

        /*
         * CORRECTIVE ASSIGNMENT
         */
        const {
          data: correctiveRows,
          error: correctiveError,
        } = await supabase
          .from("member_corrective_routines")
          .select("*")
          .eq("user_id", clientId)
          .eq("is_active", true)
          .order("assigned_at", {
            ascending: false,
          })
          .limit(1);

        if (correctiveError) {
          throw correctiveError;
        }

        const assignment =
          correctiveRows?.[0] || null;

        setCurrentAssignment(assignment);

        const assignedRoutine =
          routines.find(
            (routine) =>
              routine.id ===
              assignment?.routine_id
          ) || null;

        setCurrentRoutine(
          assignedRoutine
        );

        /*
         * PRIVATE COACH NOTES
         */
        const {
          data: noteRows,
          error: notesError,
        } = await supabase
          .from("coach_notes")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", {
            ascending: false,
          });

        if (notesError) {
          throw notesError;
        }

        setCoachNotes(noteRows || []);
      } catch (error) {
        console.error(
          "Client dashboard load error:",
          error
        );
      } finally {
        setClientLoading(false);
      }
    },
    [programs, routines, loadProgramExercises]
  );

  const loadCoachPortal = useCallback(
    async () => {
      setLoading(true);
      setFatalError("");

      try {
        /*
         * AUTHENTICATION
         */
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        /*
         * VERIFY COACH ROLE
         */
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name, email, membership_status, role"
          )
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (
          !["coach", "admin"].includes(
            profile.role
          )
        ) {
          router.replace("/members");
          return;
        }

        setCoachUser(user);
        setCoachProfile(profile);

        /*
         * LOAD PROGRAM LIBRARY
         */
        const {
          data: programRows,
          error: programError,
        } = await supabase
          .from("programs")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (programError) {
          throw programError;
        }

        setPrograms(programRows || []);

        /*
         * LOAD CORRECTIVE ROUTINE LIBRARY
         */
        const {
          data: routineRows,
          error: routineError,
        } = await supabase
          .from("corrective_routines")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (routineError) {
          throw routineError;
        }

        setRoutines(routineRows || []);

        /*
         * LOAD CLIENT PROFILES
         *
         * Exclude the currently logged-in coach.
         * Member accounts become the client roster.
         */
        const {
          data: profileRows,
          error: clientsError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name, email, membership_status, role, created_at"
          )
          .neq("id", user.id)
          .order("full_name");

        if (clientsError) {
          throw clientsError;
        }

        const memberProfiles = (
          profileRows || []
        ).filter(
          (item) =>
            !item.role ||
            item.role === "member"
        );

        /*
         * Build the client-list summary.
         */
        const enrichedClients =
          await Promise.all(
            memberProfiles.map(
              async (client) => {
                const [
                  programResult,
                  completionResult,
                  progressResult,
                  checkInResult,
                ] = await Promise.all([
                  supabase
                    .from("member_programs")
                    .select("program_id")
                    .eq("user_id", client.id)
                    .order("assigned_at", {
                      ascending: false,
                    })
                    .limit(1),

                  supabase
                    .from("workout_completions")
                    .select(
                      "id, completed_at"
                    )
                    .eq("user_id", client.id)
                    .gte(
                      "completed_at",
                      getStartOfWeekISO()
                    ),

                  supabase
                    .from("progress_entries")
                    .select(
                      "weight_lbs, recorded_at"
                    )
                    .eq("user_id", client.id)
                    .order("recorded_at", {
                      ascending: false,
                    })
                    .limit(1),

                  supabase
                    .from("weekly_checkins")
                    .select(
                      "id, submitted_at, energy_level, sleep_quality, stress_level, questions, challenges, coach_response"
                    )
                    .eq("user_id", client.id)
                    .order("submitted_at", {
                      ascending: false,
                    })
                    .limit(1),
                ]);

                const programId =
                  programResult.data?.[0]
                    ?.program_id;

                const clientProgram =
                  (programRows || []).find(
                    (item) =>
                      item.id === programId
                  );

                const latestCheck =
                  checkInResult.data?.[0] ||
                  null;

                const attentionReasons = [];

                if (
                  client.membership_status ===
                  "active" &&
                  !programId
                ) {
                  attentionReasons.push(
                    "No training program assigned"
                  );
                }

                if (
                  latestCheck &&
                  !latestCheck.coach_response &&
                  (latestCheck.questions ||
                    latestCheck.challenges)
                ) {
                  attentionReasons.push(
                    "Check-in needs response"
                  );
                }

                if (
                  client.membership_status ===
                    "active" &&
                  (completionResult.data || [])
                    .length === 0
                ) {
                  attentionReasons.push(
                    "No workouts completed this week"
                  );
                }

                return {
                  ...client,

                  program_name:
                    clientProgram?.name ||
                    "No program",

                  weekly_workouts:
                    completionResult.data
                      ?.length || 0,

                  latest_weight:
                    progressResult.data?.[0]
                      ?.weight_lbs || null,

                  last_checkin:
                    latestCheck
                      ?.submitted_at || null,

                  needs_attention:
                    attentionReasons.length >
                    0,

                  attention_reasons:
                    attentionReasons,
                };
              }
            )
          );

        setClients(enrichedClients);

        if (enrichedClients.length > 0) {
          setSelectedClientId(
            (current) =>
              current ||
              enrichedClients[0].id
          );
        }
      } catch (error) {
        console.error(
          "Coach portal load error:",
          error
        );

        setFatalError(
          error?.message ||
            "The coach portal could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadCoachPortal();
  }, [loadCoachPortal]);

  useEffect(() => {
    if (
      selectedClientId &&
      programs.length >= 0 &&
      routines.length >= 0
    ) {
      loadClientData(
        selectedClientId
      );
    }
  }, [
    selectedClientId,
    programs,
    routines,
    loadClientData,
  ]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function handleProgramChanged() {
    if (!selectedClientId) return;

    /*
     * ClientWorkouts performs the assignment through the
     * coach_assign_program RPC. Reload the assignment from
     * Supabase afterward so the coach UI always reflects the
     * database source of truth.
     */
    await loadClientData(selectedClientId);
    await refreshClientList();
  }

  async function handleNutritionUpdated(
    plan
  ) {
    setNutritionPlan(plan);
  }

  async function handleCheckInUpdated(
    updatedCheckIn
  ) {
    setCheckIns((current) =>
      current.map((item) =>
        item.id === updatedCheckIn.id
          ? updatedCheckIn
          : item
      )
    );

    await refreshClientList();
  }

  async function handleCorrectiveUpdated(
    assignment
  ) {
    setCurrentAssignment(assignment);

    if (!assignment) {
      setCurrentRoutine(null);
      return;
    }

    const routine =
      routines.find(
        (item) =>
          item.id === assignment.routine_id
      ) || null;

    setCurrentRoutine(routine);
  }

  async function handleNotesUpdated(
    change
  ) {
    if (change.type === "added") {
      setCoachNotes((current) => [
        change.note,
        ...current,
      ]);
    }

    if (change.type === "deleted") {
      setCoachNotes((current) =>
        current.filter(
          (item) =>
            item.id !== change.id
        )
      );
    }
  }

  async function refreshClientList() {
    /*
     * Rebuild the full coach portal summary.
     * Client selection is preserved by state.
     */
    await loadCoachPortal();
  }

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loader} />

        <p style={styles.loadingText}>
          Loading Coach Dashboard...
        </p>
      </main>
    );
  }

  if (fatalError) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.errorCard}>
          <p style={styles.goldLabel}>
            COACH DASHBOARD
          </p>

          <h1 style={styles.errorTitle}>
            Dashboard Error
          </h1>

          <p style={styles.bodyText}>
            {fatalError}
          </p>

          <button
            type="button"
            onClick={loadCoachPortal}
            style={styles.goldButton}
          >
            TRY AGAIN
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.brand}>
            GET CHA RIGHT FITNESS
          </p>

          <h1 style={styles.headerTitle}>
            Coach Dashboard
          </h1>

          <p style={styles.coachName}>
            {coachProfile?.full_name ||
              coachProfile?.email ||
              "Coach"}
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() =>
              router.push("/members")
            }
            style={styles.outlineButton}
          >
            MEMBER PORTAL
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <ClientList
            clients={clients}
            selectedClientId={
              selectedClientId
            }
            onSelectClient={(clientId) => {
              setSelectedClientId(
                clientId
              );
              setActiveSection(
                "overview"
              );
            }}
          />
        </aside>

        <section style={styles.content}>
          {!selectedClient ? (
            <div style={styles.emptyCard}>
              <p style={styles.goldLabel}>
                CLIENT MANAGEMENT
              </p>

              <h2 style={styles.emptyTitle}>
                No Clients Yet
              </h2>

              <p style={styles.bodyText}>
                Member accounts will appear
                here once clients join your
                portal.
              </p>
            </div>
          ) : (
            <>
              <div style={styles.clientHeader}>
                <div>
                  <p style={styles.goldLabel}>
                    CURRENT CLIENT
                  </p>

                  <h2 style={styles.clientName}>
                    {selectedClient.full_name ||
                      "Client"}
                  </h2>

                  <p style={styles.clientEmail}>
                    {selectedClient.email}
                  </p>
                </div>

                <span
                  style={
                    selectedClient.membership_status ===
                    "active"
                      ? styles.activeBadge
                      : styles.inactiveBadge
                  }
                >
                  {String(
                    selectedClient.membership_status ||
                      "inactive"
                  ).toUpperCase()}
                </span>
              </div>

              <nav style={styles.nav}>
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        section.id
                      )
                    }
                    style={{
                      ...styles.navButton,
                      ...(activeSection ===
                      section.id
                        ? styles.navButtonActive
                        : {}),
                    }}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>

              {clientLoading ? (
                <div style={styles.clientLoading}>
                  <div style={styles.loader} />

                  <span>
                    Loading client...
                  </span>
                </div>
              ) : (
                <div style={styles.panel}>
                  {activeSection ===
                    "overview" && (
                    <ClientOverview
                      client={
                        selectedClient
                      }
                      program={program}
                      onboarding={
                        onboarding
                      }
                      weeklyWorkouts={
                        weeklyCompletions.length
                      }
                      latestWeight={
                        latestProgress
                          ?.weight_lbs ||
                        null
                      }
                      latestCheckIn={
                        latestCheckIn
                      }
                      nutritionPlan={
                        nutritionPlan
                      }
                      correctiveRoutine={
                        currentRoutine
                      }
                      onChangeSection={
                        setActiveSection
                      }
                    />
                  )}

                  {activeSection ===
                    "workouts" && (
                    <ClientWorkouts
                      client={
                        selectedClient
                      }
                      program={program}
                      exercises={
                        programExercises
                      }
                      programs={
                        programs
                      }
                      weeklyCompletions={
                        weeklyCompletions
                      }
                      onProgramChanged={
                        handleProgramChanged
                      }
                    />
                  )}

                  {activeSection ===
                    "nutrition" && (
                    <ClientNutrition
                      client={
                        selectedClient
                      }
                      nutritionPlan={
                        nutritionPlan
                      }
                      onNutritionUpdated={
                        handleNutritionUpdated
                      }
                    />
                  )}

                  {activeSection ===
                    "corrective" && (
                    <CorrectiveAssignments
                      client={
                        selectedClient
                      }
                      currentAssignment={
                        currentAssignment
                      }
                      currentRoutine={
                        currentRoutine
                      }
                      routines={routines}
                      onAssignmentUpdated={
                        handleCorrectiveUpdated
                      }
                    />
                  )}

                  {activeSection ===
                    "progress" && (
                    <ClientProgress
                      client={
                        selectedClient
                      }
                      progressEntries={
                        progressEntries
                      }
                    />
                  )}

                  {activeSection ===
                    "checkins" && (
                    <ClientCheckIns
                      client={
                        selectedClient
                      }
                      checkIns={
                        checkIns
                      }
                      onCheckInUpdated={
                        handleCheckInUpdated
                      }
                    />
                  )}

                  {activeSection ===
                    "notes" && (
                    <CoachNotes
                      client={
                        selectedClient
                      }
                      coachUser={
                        coachUser
                      }
                      notes={
                        coachNotes
                      }
                      onNotesUpdated={
                        handleNotesUpdated
                      }
                    />
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function getStartOfWeekISO() {
  const now = new Date();

  const day = now.getDay();

  const difference =
    day === 0 ? -6 : 1 - day;

  const start = new Date(now);

  start.setDate(
    now.getDate() + difference
  );

  start.setHours(0, 0, 0, 0);

  return start.toISOString();
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    color: "#FFFFFF",
  },

  header: {
    borderBottom: "1px solid #2A2A2A",
    padding: "20px clamp(16px, 4vw, 45px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    background: "#080808",
  },

  brand: {
    color: "#F4C20D",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.5px",
    margin: 0,
  },

  headerTitle: {
    fontSize: "28px",
    margin: "5px 0 2px",
  },

  coachName: {
    color: "#777777",
    fontSize: "11px",
    margin: 0,
  },

  headerActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  outlineButton: {
    background: "transparent",
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    borderRadius: "8px",
    padding: "10px 13px",
    fontWeight: "900",
    cursor: "pointer",
    fontSize: "9px",
  },

  logoutButton: {
    background: "#111111",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "10px 13px",
    fontWeight: "900",
    cursor: "pointer",
    fontSize: "9px",
  },

  shell: {
    display: "grid",
    gridTemplateColumns:
      "minmax(250px, 320px) minmax(0, 1fr)",
    minHeight: "calc(100vh - 100px)",
  },

  sidebar: {
    borderRight: "1px solid #2A2A2A",
    background: "#080808",
    padding: "18px",
    overflowY: "auto",
  },

  content: {
    minWidth: 0,
    padding: "clamp(18px, 4vw, 40px)",
  },

  clientHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  goldLabel: {
    color: "#F4C20D",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "1.2px",
    margin: 0,
  },

  clientName: {
    color: "#FFFFFF",
    fontSize: "28px",
    margin: "5px 0 2px",
  },

  clientEmail: {
    color: "#777777",
    fontSize: "11px",
    margin: 0,
  },

  activeBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "8px",
    fontWeight: "900",
  },

  inactiveBadge: {
    background: "#111111",
    color: "#777777",
    border: "1px solid #2A2A2A",
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "8px",
    fontWeight: "900",
  },

  nav: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
    marginBottom: "20px",
    borderBottom: "1px solid #2A2A2A",
    paddingBottom: "12px",
  },

  navButton: {
    background: "#111111",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "9px",
    fontWeight: "900",
    cursor: "pointer",
  },

  navButtonActive: {
    background: "#F4C20D",
    color: "#050505",
    border: "1px solid #F4C20D",
  },

  panel: {
    width: "100%",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#050505",
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
  },

  clientLoading: {
    minHeight: "300px",
    color: "#BDBDBD",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
  },

  loader: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    border: "3px solid #2A2A2A",
    borderTopColor: "#F4C20D",
  },

  loadingText: {
    color: "#BDBDBD",
    fontSize: "12px",
  },

  errorCard: {
    width: "min(500px, 100%)",
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "25px",
  },

  errorTitle: {
    margin: "8px 0",
  },

  goldButton: {
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "8px",
    padding: "12px 15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  emptyCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "25px",
  },

  emptyTitle: {
    color: "#FFFFFF",
    margin: "7px 0",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    fontSize: "12px",
  },
};
