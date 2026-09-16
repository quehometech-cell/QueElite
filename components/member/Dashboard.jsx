export default function Dashboard({
  program,
  exercises = [],
  weeklyCompleted = 0,
  latestWeight = null,
  nutritionPlan = null,
  latestCheckIn = null,
  hasCorrectiveRoutine = false,
  setActiveTab,
}) {
  const weeklyTarget = program?.days_per_week || 0;

  const progressPercent =
    weeklyTarget > 0
      ? Math.min((weeklyCompleted / weeklyTarget) * 100, 100)
      : 0;

  return (
    <div>
      {/* WELCOME */}
      <section style={styles.hero}>
        <p style={styles.goldLabel}>MEMBER DASHBOARD</p>

        <h1 style={styles.heroTitle}>
          YOUR PLAN. YOUR PROGRESS.
        </h1>

        <p style={styles.heroText}>
          Stay consistent, complete your workouts, and keep
          building.
        </p>
      </section>

      {/* WEEKLY PROGRESS */}
      <section style={styles.progressCard}>
        <div style={styles.progressTop}>
          <div>
            <p style={styles.goldLabel}>THIS WEEK</p>

            <h2 style={styles.progressNumber}>
              {weeklyCompleted} / {weeklyTarget}
            </h2>

            <p style={styles.muted}>workouts completed</p>
          </div>

          <div style={styles.percent}>
            {Math.round(progressPercent)}%
          </div>
        </div>

        <div style={styles.progressBackground}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </section>

      {/* DASHBOARD CARDS */}
      <section style={styles.grid}>
        {/* WORKOUT */}
        <Card label="MY WORKOUT PLAN">
          <h3 style={styles.cardTitle}>
            {program?.name || "Training Plan"}
          </h3>

          <p style={styles.cardText}>
            {program?.description ||
              "Your assigned training program will appear here."}
          </p>

          {program && (
            <div style={styles.stats}>
              <span>{program.days_per_week} Days / Week</span>

              <span>{program.session_minutes} Min</span>

              <span>{exercises.length} Exercises</span>
            </div>
          )}

          <ActionButton
            text="VIEW MY WORKOUT"
            onClick={() => setActiveTab("workouts")}
            primary
          />
        </Card>

        {/* CORRECTIVE */}
        <Card label="CORRECTIVE & MOBILITY">
          <h3 style={styles.cardTitle}>
            {hasCorrectiveRoutine
              ? "Your Corrective Routine"
              : "Movement & Mobility"}
          </h3>

          <p style={styles.cardText}>
            {hasCorrectiveRoutine
              ? "You have corrective or mobility work assigned by Que."
              : "Corrective and mobility work assigned by your coach will appear here."}
          </p>

          <ActionButton
            text={
              hasCorrectiveRoutine
                ? "VIEW MY ROUTINE"
                : "VIEW CORRECTIVE"
            }
            onClick={() => setActiveTab("corrective")}
          />
        </Card>

        {/* NUTRITION */}
        <Card label="NUTRITION">
          <h3 style={styles.cardTitle}>
            {nutritionPlan
              ? "Your Nutrition Targets"
              : "Nutrition Plan"}
          </h3>

          {nutritionPlan ? (
            <div style={styles.nutritionStats}>
              <MiniStat
                value={nutritionPlan.calorie_target || "-"}
                label="CALORIES"
              />

              <MiniStat
                value={
                  nutritionPlan.protein_grams
                    ? `${nutritionPlan.protein_grams}g`
                    : "-"
                }
                label="PROTEIN"
              />
            </div>
          ) : (
            <p style={styles.cardText}>
              Your nutrition targets and coaching guidance will
              appear here.
            </p>
          )}

          <ActionButton
            text="VIEW NUTRITION"
            onClick={() => setActiveTab("nutrition")}
          />
        </Card>

        {/* PROGRESS */}
        <Card label="PROGRESS">
          <h3 style={styles.cardTitle}>Track Your Results</h3>

          {latestWeight ? (
            <>
              <div style={styles.bigValue}>
                {latestWeight} lb
              </div>

              <p style={styles.cardText}>
                Latest recorded weight
              </p>
            </>
          ) : (
            <p style={styles.cardText}>
              Log your weight and measurements to track your
              progress over time.
            </p>
          )}

          <ActionButton
            text="VIEW PROGRESS"
            onClick={() => setActiveTab("progress")}
          />
        </Card>

        {/* CHECK IN */}
        <Card label="WEEKLY CHECK-IN">
          <h3 style={styles.cardTitle}>Check In With Que</h3>

          {latestCheckIn ? (
            <p style={styles.cardText}>
              Your latest check-in has been submitted. Check here
              for coaching feedback.
            </p>
          ) : (
            <p style={styles.cardText}>
              Tell Que how your training, recovery, nutrition,
              and week are going.
            </p>
          )}

          <ActionButton
            text="START CHECK-IN"
            onClick={() => setActiveTab("checkin")}
          />
        </Card>

        {/* EXERCISE LIBRARY */}
        <Card label="EXERCISE LIBRARY">
          <h3 style={styles.cardTitle}>Learn The Movements</h3>

          <p style={styles.cardText}>
            Review exercise instructions, equipment, coaching
            cues, and available videos.
          </p>

          <ActionButton
            text="OPEN LIBRARY"
            onClick={() => setActiveTab("library")}
          />
        </Card>

        {/* BOOK QUE */}
        <Card label="COACHING">
          <h3 style={styles.cardTitle}>Book With Que</h3>

          <p style={styles.cardText}>
            Need help with your program, technique, nutrition, or
            progress? Schedule time with Que.
          </p>

          <a
            href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.goldLink}
          >
            BOOK WITH QUE
          </a>
        </Card>
      </section>
    </div>
  );
}

function Card({ label, children }) {
  return (
    <div style={styles.card}>
      <p style={styles.goldLabel}>{label}</p>
      {children}
    </div>
  );
}

function ActionButton({ text, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      style={primary ? styles.goldButton : styles.outlineButton}
    >
      {text}
    </button>
  );
}

function MiniStat({ value, label }) {
  return (
    <div style={styles.miniStat}>
      <strong style={styles.miniValue}>{value}</strong>
      <span style={styles.miniLabel}>{label}</span>
    </div>
  );
}

const styles = {
  hero: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "18px",
    padding: "clamp(25px, 5vw, 45px)",
    marginBottom: "20px",
  },

  goldLabel: {
    color: "#F4C20D",
    fontWeight: "900",
    letterSpacing: "1.5px",
    fontSize: "11px",
    marginTop: 0,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: "clamp(32px, 6vw, 58px)",
    margin: "10px 0",
    lineHeight: 1,
  },

  heroText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
  },

  progressCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "25px",
    marginBottom: "20px",
  },

  progressTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  progressNumber: {
    color: "#F4C20D",
    fontSize: "42px",
    margin: "4px 0",
  },

  percent: {
    color: "#F4C20D",
    fontSize: "28px",
    fontWeight: "900",
  },

  progressBackground: {
    width: "100%",
    height: "10px",
    background: "#2A2A2A",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "15px",
  },

  progressFill: {
    height: "100%",
    background: "#F4C20D",
    borderRadius: "20px",
    transition: "width 0.3s ease",
  },

  muted: {
    color: "#BDBDBD",
    margin: 0,
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
    borderRadius: "16px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "23px",
    margin: "5px 0 10px",
  },

  cardText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    flex: 1,
  },

  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "18px",
  },

  nutritionStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    margin: "12px 0 20px",
  },

  miniStat: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
  },

  miniValue: {
    color: "#F4C20D",
    fontSize: "20px",
  },

  miniLabel: {
    color: "#BDBDBD",
    fontSize: "9px",
    marginTop: "4px",
  },

  bigValue: {
    color: "#F4C20D",
    fontSize: "35px",
    fontWeight: "900",
    margin: "10px 0 0",
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
    marginTop: "auto",
  },

  outlineButton: {
    width: "100%",
    background: "transparent",
    color: "#FFFFFF",
    border: "1px solid #F4C20D",
    borderRadius: "8px",
    padding: "14px",
    fontWeight: "900",
    cursor: "pointer",
    marginTop: "auto",
  },

  goldLink: {
    display: "block",
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "8px",
    padding: "14px",
    textAlign: "center",
    fontWeight: "900",
    textDecoration: "none",
    marginTop: "auto",
  },
};
