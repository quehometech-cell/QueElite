"use client";

export default function ClientOverview({
  client,
  program,
  onboarding,
  weeklyWorkouts = 0,
  latestWeight = null,
  latestCheckIn = null,
  nutritionPlan = null,
  correctiveRoutine = null,
  onChangeSection,
}) {
  if (!client) {
    return (
      <section>
        <div style={styles.emptyCard}>
          Select a client from your roster to view their coaching
          overview.
        </div>
      </section>
    );
  }

  return (
    <section>
      <div style={styles.topRow}>
        <div>
          <p style={styles.goldLabel}>CLIENT OVERVIEW</p>

          <h2 style={styles.title}>
            {client.full_name || "Get Cha Right Client"}
          </h2>

          <p style={styles.email}>{client.email}</p>
        </div>

        <div style={styles.badges}>
          <span style={styles.activeBadge}>
            {String(
              client.membership_status || "unknown"
            ).toUpperCase()}
          </span>

          {client.role && (
            <span style={styles.roleBadge}>
              {client.role.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <SummaryCard
          value={program?.name || "Not Assigned"}
          label="PROGRAM"
        />

        <SummaryCard
          value={weeklyWorkouts}
          label="WORKOUTS THIS WEEK"
        />

        <SummaryCard
          value={
            latestWeight ? `${latestWeight} lb` : "-"
          }
          label="LATEST WEIGHT"
        />

        <SummaryCard
          value={
            latestCheckIn
              ? formatDate(latestCheckIn.submitted_at)
              : "None"
          }
          label="LAST CHECK-IN"
        />
      </div>

      <div style={styles.sectionGrid}>
        <ActionCard
          title="Training Program"
          status={program?.name || "No program assigned"}
          description={
            program
              ? `${program.days_per_week || "-"} days/week • ${
                  program.session_minutes || "-"
                } min sessions`
              : "Assign a training program to this client."
          }
          button="MANAGE WORKOUTS"
          onClick={() => onChangeSection?.("workouts")}
        />

        <ActionCard
          title="Nutrition"
          status={
            nutritionPlan
              ? "Nutrition plan active"
              : "No nutrition plan"
          }
          description={
            nutritionPlan
              ? `${nutritionPlan.calorie_target || "-"} calories • ${
                  nutritionPlan.protein_grams || "-"
                }g protein`
              : "Set calorie, macro, hydration, and coaching guidance."
          }
          button="MANAGE NUTRITION"
          onClick={() => onChangeSection?.("nutrition")}
        />

        <ActionCard
          title="Corrective & Mobility"
          status={
            correctiveRoutine?.name ||
            "No routine assigned"
          }
          description={
            correctiveRoutine
              ? correctiveRoutine.focus_area
                ? `Focus: ${formatText(
                    correctiveRoutine.focus_area
                  )}`
                : "Corrective routine is active."
              : "Assign mobility or corrective training when appropriate."
          }
          button="MANAGE CORRECTIVE"
          onClick={() => onChangeSection?.("corrective")}
        />

        <ActionCard
          title="Progress"
          status={
            latestWeight
              ? `${latestWeight} lb latest weight`
              : "No progress entries"
          }
          description="Review the client's weight, measurements, and progress history."
          button="VIEW PROGRESS"
          onClick={() => onChangeSection?.("progress")}
        />

        <ActionCard
          title="Weekly Check-Ins"
          status={
            latestCheckIn
              ? `Submitted ${formatDate(
                  latestCheckIn.submitted_at
                )}`
              : "No check-ins"
          }
          description={
            latestCheckIn?.questions
              ? "Client has submitted a question or coaching update."
              : "Review energy, sleep, stress, nutrition, wins, and challenges."
          }
          button="VIEW CHECK-INS"
          onClick={() => onChangeSection?.("checkins")}
        />

        <ActionCard
          title="Private Coach Notes"
          status="Coach only"
          description="Keep private coaching observations and reminders that clients cannot see."
          button="OPEN NOTES"
          onClick={() => onChangeSection?.("notes")}
        />
      </div>

      <div style={styles.detailsGrid}>
        <div style={styles.detailsCard}>
          <p style={styles.goldLabel}>ONBOARDING</p>

          <h3 style={styles.cardTitle}>
            Client Starting Point
          </h3>

          {onboarding ? (
            <div style={styles.detailList}>
              <Detail
                label="Goal"
                value={formatText(onboarding.goal)}
              />

              <Detail
                label="Experience"
                value={formatText(
                  onboarding.experience_level
                )}
              />

              <Detail
                label="Equipment"
                value={formatText(onboarding.equipment)}
              />

              <Detail
                label="Workout Location"
                value={formatText(
                  onboarding.workout_location
                )}
              />

              <Detail
                label="Days Per Week"
                value={
                  onboarding.days_per_week ?? "-"
                }
              />

              <Detail
                label="Session Length"
                value={
                  onboarding.session_minutes
                    ? `${onboarding.session_minutes} min`
                    : "-"
                }
              />

              <Detail
                label="Activity Level"
                value={formatText(
                  onboarding.activity_level
                )}
              />
            </div>
          ) : (
            <p style={styles.bodyText}>
              No onboarding assessment found.
            </p>
          )}
        </div>

        <div style={styles.detailsCard}>
          <p style={styles.goldLabel}>
            LIMITATIONS & NOTES
          </p>

          <h3 style={styles.cardTitle}>
            What Que Should Know
          </h3>

          {onboarding?.limitations ? (
            <p style={styles.bodyText}>
              {onboarding.limitations}
            </p>
          ) : (
            <p style={styles.mutedText}>
              No limitations were entered during onboarding.
            </p>
          )}
        </div>
      </div>

      {latestCheckIn && (
        <div style={styles.checkInCard}>
          <div style={styles.checkInHeader}>
            <div>
              <p style={styles.goldLabel}>
                LATEST CHECK-IN
              </p>

              <h3 style={styles.cardTitle}>
                Client Feedback
              </h3>
            </div>

            <span style={styles.dateBadge}>
              {formatDate(latestCheckIn.submitted_at)}
            </span>
          </div>

          <div style={styles.checkInScores}>
            <Score
              label="Energy"
              value={latestCheckIn.energy_level}
            />

            <Score
              label="Sleep"
              value={latestCheckIn.sleep_quality}
            />

            <Score
              label="Stress"
              value={latestCheckIn.stress_level}
            />

            <Score
              label="Nutrition"
              value={
                latestCheckIn.nutrition_adherence
              }
            />
          </div>

          {latestCheckIn.wins && (
            <TextSection
              title="WINS"
              text={latestCheckIn.wins}
            />
          )}

          {latestCheckIn.challenges && (
            <TextSection
              title="CHALLENGES"
              text={latestCheckIn.challenges}
            />
          )}

          {latestCheckIn.questions && (
            <TextSection
              title="QUESTIONS FOR QUE"
              text={latestCheckIn.questions}
              highlight
            />
          )}

          {latestCheckIn.coach_response ? (
            <div style={styles.responseBox}>
              <strong style={styles.responseTitle}>
                YOUR RESPONSE
              </strong>

              <p style={styles.bodyText}>
                {latestCheckIn.coach_response}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                onChangeSection?.("checkins")
              }
              style={styles.goldButton}
            >
              REVIEW & RESPOND
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function SummaryCard({ value, label }) {
  return (
    <div style={styles.summaryCard}>
      <strong style={styles.summaryValue}>
        {value}
      </strong>

      <span style={styles.summaryLabel}>
        {label}
      </span>
    </div>
  );
}

function ActionCard({
  title,
  status,
  description,
  button,
  onClick,
}) {
  return (
    <div style={styles.actionCard}>
      <h3 style={styles.actionTitle}>
        {title}
      </h3>

      <strong style={styles.actionStatus}>
        {status}
      </strong>

      <p style={styles.bodyText}>
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        style={styles.actionButton}
      >
        {button}
      </button>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>
        {label}
      </span>

      <strong style={styles.detailValue}>
        {value || "-"}
      </strong>
    </div>
  );
}

function Score({ label, value }) {
  return (
    <div style={styles.scoreCard}>
      <strong style={styles.scoreValue}>
        {value ?? "-"}/5
      </strong>

      <span style={styles.scoreLabel}>
        {label}
      </span>
    </div>
  );
}

function TextSection({
  title,
  text,
  highlight = false,
}) {
  return (
    <div
      style={
        highlight
          ? styles.highlightSection
          : styles.textSection
      }
    >
      <strong
        style={
          highlight
            ? styles.goldText
            : styles.sectionTitle
        }
      >
        {title}
      </strong>

      <p style={styles.bodyText}>
        {text}
      </p>
    </div>
  );
}

function formatText(value) {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
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

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },

  title: {
    color: "#FFFFFF",
    fontSize: "clamp(32px, 6vw, 52px)",
    margin: "8px 0 3px",
  },

  email: {
    color: "#777777",
    margin: 0,
  },

  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  activeBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "20px",
    padding: "8px 11px",
    fontSize: "9px",
    fontWeight: "900",
  },

  roleBadge: {
    background: "#111111",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "20px",
    padding: "8px 11px",
    fontSize: "9px",
    fontWeight: "900",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    margin: "30px 0",
  },

  summaryCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "13px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
  },

  summaryValue: {
    color: "#F4C20D",
    fontSize: "18px",
  },

  summaryLabel: {
    color: "#777777",
    fontSize: "9px",
    marginTop: "6px",
    fontWeight: "900",
  },

  sectionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "14px",
  },

  actionCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  actionTitle: {
    color: "#FFFFFF",
    margin: "0 0 8px",
  },

  actionStatus: {
    color: "#F4C20D",
    fontSize: "12px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },

  actionButton: {
    marginTop: "auto",
    background: "#050505",
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    borderRadius: "8px",
    padding: "11px",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "10px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
    marginTop: "25px",
  },

  detailsCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
  },

  cardTitle: {
    color: "#FFFFFF",
    margin: "7px 0 18px",
    fontSize: "22px",
  },

  detailList: {
    display: "flex",
    flexDirection: "column",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "11px 0",
    borderBottom: "1px solid #2A2A2A",
  },

  detailLabel: {
    color: "#777777",
    fontSize: "11px",
  },

  detailValue: {
    color: "#FFFFFF",
    fontSize: "11px",
    textAlign: "right",
  },

  mutedText: {
    color: "#777777",
    lineHeight: 1.6,
  },

  checkInCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    marginTop: "25px",
  },

  checkInHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
  },

  dateBadge: {
    background: "#050505",
    color: "#BDBDBD",
    borderRadius: "20px",
    padding: "8px 11px",
    fontSize: "10px",
  },

  checkInScores: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "8px",
    marginBottom: "20px",
  },

  scoreCard: {
    background: "#050505",
    borderRadius: "9px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
  },

  scoreValue: {
    color: "#F4C20D",
    fontSize: "18px",
  },

  scoreLabel: {
    color: "#777777",
    fontSize: "9px",
    marginTop: "4px",
  },

  textSection: {
    borderTop: "1px solid #2A2A2A",
    paddingTop: "15px",
    marginTop: "15px",
  },

  highlightSection: {
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "15px",
    marginTop: "15px",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: "10px",
  },

  goldText: {
    color: "#F4C20D",
    fontSize: "10px",
  },

  responseBox: {
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "15px",
    marginTop: "20px",
  },

  responseTitle: {
    color: "#F4C20D",
    fontSize: "10px",
  },

  goldButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "8px",
    padding: "13px",
    fontWeight: "900",
    cursor: "pointer",
    marginTop: "20px",
  },

  emptyCard: {
    background: "#111111",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "25px",
  },
};
