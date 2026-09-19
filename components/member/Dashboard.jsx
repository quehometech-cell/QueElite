"use client";

export default function Dashboard({
  program,
  exercises = [],
  weeklyCompleted = 0,
  weeklyCorrectiveCompleted = 0,
  weeklyNutritionDays = 0,
  latestWeight,
  nutritionPlan,
  latestCheckIn,
  hasCorrectiveRoutine = false,
  correctiveTarget = 0,
  setActiveTab,
}) {
  const hasTraining = Boolean(program);
  const hasNutrition = Boolean(nutritionPlan);
  const hasCorrective = Boolean(hasCorrectiveRoutine);

  const workoutTarget =
    Number(program?.days_per_week) || getWorkoutDayCount(exercises);

  const correctiveTargetNumber = Number(correctiveTarget) || 0;
  const durationWeeks = Number(program?.duration_weeks) || null;
  const currentWeek = Math.max(1, Number(program?.current_week || program?.week_number || 1));

  const workoutPercent = getPercent(weeklyCompleted, workoutTarget);
  const correctivePercent = getPercent(weeklyCorrectiveCompleted, correctiveTargetNumber);
  const nutritionPercent = getPercent(weeklyNutritionDays, 7);
  const programPercent = durationWeeks
    ? Math.min(((currentWeek - 1) / durationWeeks) * 100, 100)
    : 0;

  const phase =
    program?.phase_name ||
    program?.week_name ||
    "Current Phase";

  const nextWorkout = getNextWorkout(exercises);

  const coachingCards = [];
  if (hasTraining) {
    coachingCards.push({
      title: "Training",
      text: `${weeklyCompleted} of ${workoutTarget || "-"} workouts completed this week.`,
      button: "OPEN WORKOUTS",
      tab: "workouts",
    });
  }
  if (hasCorrective) {
    coachingCards.push({
      title: "Corrective & Mobility",
      text: `${weeklyCorrectiveCompleted} of ${correctiveTargetNumber || "-"} sessions completed this week.`,
      button: "OPEN MOBILITY",
      tab: "corrective",
    });
  }
  if (hasNutrition) {
    coachingCards.push({
      title: "Nutrition",
      text: `${weeklyNutritionDays} of 7 days logged this week.`,
      button: "TRACK NUTRITION",
      tab: "nutrition",
    });
  }

  coachingCards.push({
    title: "Progress",
    text:
      latestWeight !== null && latestWeight !== undefined
        ? `Your latest recorded weight is ${latestWeight} lb.`
        : "Add your first progress entry to start tracking.",
    button: "VIEW PROGRESS",
    tab: "progress",
  });

  coachingCards.push({
    title: "Weekly Check-In",
    text: latestCheckIn
      ? `Last submitted ${formatDate(latestCheckIn.submitted_at)}.`
      : "Send Que your first weekly update.",
    button: "OPEN CHECK-IN",
    tab: "checkin",
  });

  return (
    <section>
      <p style={styles.goldLabel}>MEMBER DASHBOARD</p>
      <h2 style={styles.title}>YOUR COACHING PLAN</h2>
      <p style={styles.description}>
        Everything here is based on the coaching services and program assigned to you.
      </p>

      {hasTraining && (
        <div style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div>
              <p style={styles.goldLabel}>CURRENT PROGRAM</p>
              <h3 style={styles.heroTitle}>{program.name}</h3>
              <p style={styles.phaseText}>
                Week {currentWeek}{durationWeeks ? ` of ${durationWeeks}` : ""} • {phase}
              </p>
            </div>
            <div style={styles.weekBadge}>
              WEEK {currentWeek}
            </div>
          </div>

          {program.description && (
            <p style={styles.bodyText}>{program.description}</p>
          )}

          <div style={styles.programProgress}>
            <div style={styles.progressHeading}>
              <span>PROGRAM PROGRESS</span>
              <strong>
                {durationWeeks ? `${currentWeek}/${durationWeeks} WEEKS` : `WEEK ${currentWeek}`}
              </strong>
            </div>
            <div style={styles.progressBackground}>
              <div style={{ ...styles.progressFill, width: `${programPercent}%` }} />
            </div>
          </div>

          <div style={styles.programStats}>
            <MiniStat label="DURATION" value={durationWeeks ? `${durationWeeks} weeks` : "-"} />
            <MiniStat label="DAYS / WEEK" value={program.days_per_week || workoutTarget || "-"} />
            <MiniStat label="SESSION" value={program.session_minutes ? `${program.session_minutes} min` : "-"} />
            <MiniStat label="THIS WEEK" value={`${weeklyCompleted}/${workoutTarget || "-"}`} />
          </div>
        </div>
      )}

      <div style={styles.summaryGrid}>
        {hasTraining && (
          <SummaryCard
            label="WORKOUTS"
            value={`${weeklyCompleted}/${workoutTarget || "-"}`}
            text="completed this week"
            percent={workoutPercent}
            onClick={() => setActiveTab?.("workouts")}
          />
        )}

        {hasCorrective && (
          <SummaryCard
            label="CORRECTIVE"
            value={`${weeklyCorrectiveCompleted}/${correctiveTargetNumber || "-"}`}
            text="sessions this week"
            percent={correctivePercent}
            onClick={() => setActiveTab?.("corrective")}
          />
        )}

        {hasNutrition && (
          <SummaryCard
            label="NUTRITION"
            value={`${weeklyNutritionDays}/7`}
            text="days logged this week"
            percent={nutritionPercent}
            onClick={() => setActiveTab?.("nutrition")}
          />
        )}

        <SummaryCard
          label="LATEST WEIGHT"
          value={
            latestWeight !== null && latestWeight !== undefined
              ? `${latestWeight} lb`
              : "-"
          }
          text="latest progress entry"
          onClick={() => setActiveTab?.("progress")}
        />
      </div>

      <div style={styles.mainGrid}>
        {hasTraining && (
          <div style={styles.card}>
            <p style={styles.goldLabel}>NEXT WORKOUT</p>
            <h3 style={styles.cardTitle}>
              {nextWorkout?.name || "View Your Training Week"}
            </h3>
            <p style={styles.bodyText}>
              {nextWorkout
                ? `Day ${nextWorkout.day}${nextWorkout.type ? ` • ${formatLabel(nextWorkout.type)}` : ""}`
                : "Open your workout schedule to see your next available session."}
            </p>
            <button
              type="button"
              style={styles.goldButton}
              onClick={() => setActiveTab?.("workouts")}
            >
              OPEN MY WORKOUTS
            </button>
          </div>
        )}

        <div style={styles.card}>
          <p style={styles.goldLabel}>WEEKLY CHECK-IN</p>
          <h3 style={styles.cardTitle}>
            {latestCheckIn ? "Latest Check-In" : "Check In With Que"}
          </h3>

          {latestCheckIn ? (
            <>
              <div style={styles.checkInStatus}>
                <div>
                  <span style={styles.statusLabel}>LAST SUBMITTED</span>
                  <strong style={styles.statusValue}>
                    {formatDate(latestCheckIn.submitted_at)}
                  </strong>
                </div>
                <div
                  style={{
                    ...styles.responseBadge,
                    borderColor: latestCheckIn.coach_response ? "#F4C20D" : "#2A2A2A",
                    color: latestCheckIn.coach_response ? "#F4C20D" : "#BDBDBD",
                  }}
                >
                  {latestCheckIn.coach_response ? "QUE RESPONDED" : "AWAITING RESPONSE"}
                </div>
              </div>
              <p style={styles.bodyText}>
                Keep Que updated on your training, recovery, nutrition, and schedule.
              </p>
            </>
          ) : (
            <p style={styles.bodyText}>
              You have not submitted a weekly check-in yet.
            </p>
          )}

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => setActiveTab?.("checkin")}
          >
            {latestCheckIn ? "VIEW CHECK-INS" : "SUBMIT CHECK-IN"}
          </button>
        </div>
      </div>

      <div style={styles.sectionHeader}>
        <p style={styles.goldLabel}>YOUR COACHING SYSTEM</p>
        <h3 style={styles.sectionTitle}>Assigned To You</h3>
        <p style={styles.sectionText}>
          Training services only appear when they are part of your coaching setup.
        </p>
      </div>

      <div style={styles.actionGrid}>
        {coachingCards.map((card, index) => (
          <ActionCard
            key={card.tab}
            number={String(index + 1).padStart(2, "0")}
            title={card.title}
            text={card.text}
            button={card.button}
            onClick={() => setActiveTab?.(card.tab)}
          />
        ))}
      </div>

      <div style={styles.coachCard}>
        <div>
          <p style={styles.goldLabel}>GET CHA RIGHT FITNESS</p>
          <h3 style={styles.coachTitle}>Your plan works when you work the plan.</h3>
          <p style={styles.bodyText}>
            Focus on consistency. Log your work, complete your assigned sessions,
            and use your weekly check-in to keep Que informed.
          </p>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, text, percent, onClick }) {
  const showProgress = percent !== undefined && percent !== null;
  return (
    <button type="button" onClick={onClick} style={styles.summaryCard}>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
      <span style={styles.summaryText}>{text}</span>
      {showProgress && (
        <div style={styles.progressBackground}>
          <div style={{ ...styles.progressFill, width: `${percent}%` }} />
        </div>
      )}
    </button>
  );
}

function ActionCard({ number, title, text, button, onClick }) {
  return (
    <div style={styles.actionCard}>
      <div style={styles.actionNumber}>{number}</div>
      <h4 style={styles.actionTitle}>{title}</h4>
      <p style={styles.actionText}>{text}</p>
      <button type="button" onClick={onClick} style={styles.actionButton}>
        {button}
      </button>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={styles.miniStat}>
      <span style={styles.miniStatLabel}>{label}</span>
      <strong style={styles.miniStatValue}>{value}</strong>
    </div>
  );
}

function getWorkoutDayCount(exercises) {
  if (!Array.isArray(exercises)) return 0;
  const days = new Set();
  exercises.forEach((exercise) => {
    if (
      exercise?.workout_day !== null &&
      exercise?.workout_day !== undefined &&
      !exercise?.is_rest_day
    ) {
      days.add(Number(exercise.workout_day));
    }
  });
  return days.size;
}

function getNextWorkout(exercises) {
  if (!Array.isArray(exercises) || !exercises.length) return null;

  const days = new Map();
  exercises.forEach((exercise) => {
    if (exercise?.is_rest_day) return;
    const day = Number(exercise?.workout_day || 0);
    if (!day || days.has(day)) return;
    days.set(day, {
      day,
      name: exercise?.workout_name || `Workout Day ${day}`,
      type: exercise?.workout_type || "",
    });
  });

  const ordered = [...days.values()].sort((a, b) => a.day - b.day);
  if (!ordered.length) return null;

  const jsDay = new Date().getDay();
  const currentProgramDay = jsDay === 0 ? 7 : jsDay;

  return (
    ordered.find((item) => item.day >= currentProgramDay) ||
    ordered[0]
  );
}

function getPercent(completed, target) {
  const completedNumber = Number(completed) || 0;
  const targetNumber = Number(target) || 0;
  if (targetNumber <= 0) return 0;
  return Math.min((completedNumber / targetNumber) * 100, 100);
}

function formatDate(value) {
  if (!value) return "Not submitted";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = {
  goldLabel: { color: "#F4C20D", fontWeight: "900", letterSpacing: "1.5px", fontSize: "11px", margin: 0 },
  title: { color: "#FFFFFF", fontSize: "clamp(32px, 6vw, 52px)", margin: "8px 0 10px" },
  description: { color: "#BDBDBD", lineHeight: 1.6, maxWidth: "800px", marginBottom: "25px" },
  heroCard: { background: "#111111", border: "1px solid #2A2A2A", borderLeft: "4px solid #F4C20D", borderRadius: "15px", padding: "22px", marginBottom: "18px" },
  heroTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px", flexWrap: "wrap" },
  heroTitle: { color: "#FFFFFF", fontSize: "clamp(22px, 4vw, 32px)", margin: "7px 0 4px" },
  phaseText: { color: "#BDBDBD", margin: 0, fontSize: "13px" },
  weekBadge: { background: "#F4C20D", color: "#050505", borderRadius: "999px", padding: "8px 12px", fontSize: "10px", fontWeight: "900" },
  programProgress: { marginTop: "20px" },
  progressHeading: { display: "flex", justifyContent: "space-between", gap: "12px", color: "#888888", fontSize: "9px", fontWeight: "900", marginBottom: "8px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "22px" },
  summaryCard: { appearance: "none", textAlign: "left", background: "#111111", border: "1px solid #2A2A2A", borderRadius: "14px", padding: "18px", cursor: "pointer", fontFamily: "inherit" },
  summaryLabel: { display: "block", color: "#F4C20D", fontSize: "10px", fontWeight: "900", letterSpacing: "1px" },
  summaryValue: { display: "block", color: "#FFFFFF", fontSize: "28px", marginTop: "8px" },
  summaryText: { display: "block", color: "#888888", fontSize: "11px", marginTop: "4px" },
  progressBackground: { height: "6px", background: "#2A2A2A", borderRadius: "999px", overflow: "hidden", marginTop: "8px" },
  progressFill: { height: "100%", background: "#F4C20D", borderRadius: "999px", transition: "width 0.25s ease" },
  mainGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" },
  card: { background: "#111111", border: "1px solid #2A2A2A", borderRadius: "15px", padding: "22px" },
  cardTitle: { color: "#FFFFFF", fontSize: "23px", margin: "7px 0 12px" },
  bodyText: { color: "#BDBDBD", lineHeight: 1.6 },
  programStats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px", margin: "20px 0 0" },
  miniStat: { background: "#050505", border: "1px solid #2A2A2A", borderRadius: "10px", padding: "12px" },
  miniStatLabel: { display: "block", color: "#888888", fontSize: "9px", fontWeight: "800" },
  miniStatValue: { display: "block", color: "#FFFFFF", fontSize: "17px", marginTop: "5px" },
  goldButton: { width: "100%", background: "#F4C20D", color: "#050505", border: "none", borderRadius: "9px", padding: "14px", fontWeight: "900", cursor: "pointer", marginTop: "12px" },
  secondaryButton: { width: "100%", background: "#050505", color: "#F4C20D", border: "1px solid #F4C20D", borderRadius: "9px", padding: "14px", fontWeight: "900", cursor: "pointer", marginTop: "10px" },
  checkInStatus: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", background: "#050505", border: "1px solid #2A2A2A", borderRadius: "10px", padding: "14px", marginBottom: "15px" },
  statusLabel: { display: "block", color: "#888888", fontSize: "9px", fontWeight: "900" },
  statusValue: { display: "block", color: "#FFFFFF", marginTop: "4px", fontSize: "14px" },
  responseBadge: { border: "1px solid", borderRadius: "999px", padding: "7px 10px", fontSize: "9px", fontWeight: "900" },
  sectionHeader: { marginTop: "35px", marginBottom: "15px" },
  sectionTitle: { color: "#FFFFFF", fontSize: "26px", margin: "6px 0 0" },
  sectionText: { color: "#888888", fontSize: "12px", margin: "7px 0 0" },
  actionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" },
  actionCard: { background: "#111111", border: "1px solid #2A2A2A", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column" },
  actionNumber: { color: "#F4C20D", fontSize: "11px", fontWeight: "900" },
  actionTitle: { color: "#FFFFFF", fontSize: "18px", margin: "8px 0" },
  actionText: { color: "#BDBDBD", fontSize: "13px", lineHeight: 1.5, flex: 1 },
  actionButton: { width: "100%", background: "#050505", color: "#FFFFFF", border: "1px solid #2A2A2A", borderRadius: "8px", padding: "11px", fontWeight: "900", fontSize: "10px", cursor: "pointer", marginTop: "10px" },
  coachCard: { background: "#111111", borderLeft: "4px solid #F4C20D", borderRadius: "10px", padding: "22px", marginTop: "25px" },
  coachTitle: { color: "#FFFFFF", fontSize: "22px", margin: "7px 0 5px" },
};
