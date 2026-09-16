"use client";

export default function CorrectiveMobility({
  routine,
  exercises = [],
}) {
  if (!routine) {
    return (
      <section>
        <p style={styles.goldLabel}>CORRECTIVE & MOBILITY</p>

        <h2 style={styles.title}>MOVE BETTER</h2>

        <div style={styles.emptyCard}>
          <h3 style={styles.cardTitle}>
            No Corrective Routine Assigned
          </h3>

          <p style={styles.bodyText}>
            You do not currently have corrective or mobility work
            assigned by Que.
          </p>

          <p style={styles.bodyText}>
            If your coach assigns mobility, posture, stability, or
            movement work, it will appear here.
          </p>
        </div>

        <Disclaimer />
      </section>
    );
  }

  return (
    <section>
      <p style={styles.goldLabel}>CORRECTIVE & MOBILITY</p>

      <h2 style={styles.title}>{routine.name}</h2>

      <p style={styles.description}>
        {routine.description ||
          "Complete this routine as assigned by your coach."}
      </p>

      <div style={styles.stats}>
        <Stat
          value={routine.days_per_week || "-"}
          label="DAYS / WEEK"
        />

        <Stat
          value={routine.session_minutes || "-"}
          label="MINUTES"
        />

        <Stat
          value={exercises.length}
          label="MOVEMENTS"
        />
      </div>

      {routine.focus_area && (
        <div style={styles.focusCard}>
          <p style={styles.goldLabel}>FOCUS AREA</p>

          <h3 style={styles.focusTitle}>
            {formatText(routine.focus_area)}
          </h3>
        </div>
      )}

      {routine.coach_notes && (
        <div style={styles.coachNote}>
          <p style={styles.goldLabel}>
            QUE&apos;S INSTRUCTIONS
          </p>

          <p style={styles.bodyText}>
            {routine.coach_notes}
          </p>
        </div>
      )}

      {exercises.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.bodyText}>
            Your corrective movements are being prepared.
          </p>
        </div>
      ) : (
        <div style={styles.exerciseList}>
          {exercises.map((exercise, index) => (
            <CorrectiveExercise
              key={`${exercise.id}-${index}`}
              exercise={exercise}
              number={index + 1}
            />
          ))}
        </div>
      )}

      <Disclaimer />
    </section>
  );
}

function CorrectiveExercise({ exercise, number }) {
  return (
    <article style={styles.exerciseCard}>
      <div style={styles.exerciseHeader}>
        <div style={styles.number}>{number}</div>

        <div style={styles.exerciseHeading}>
          <h3 style={styles.exerciseName}>
            {exercise.name}
          </h3>

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
            exercise.duration_seconds
              ? `${exercise.duration_seconds}s`
              : "-"
          }
          label="TIME"
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
        <div style={styles.exerciseCoachNote}>
          <strong style={styles.noteTitle}>
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
          WATCH MOVEMENT VIDEO
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
    <div style={styles.statCard}>
      <strong style={styles.statValue}>
        {value}
      </strong>

      <span style={styles.statLabel}>
        {label}
      </span>
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={styles.disclaimer}>
      <strong style={styles.disclaimerTitle}>
        TRAINING NOTE
      </strong>

      <p style={styles.disclaimerText}>
        Corrective and mobility exercises are provided for
        fitness, movement, and general wellness purposes. They are
        not medical diagnosis or treatment. Stop an exercise if it
        causes sharp or worsening pain and seek appropriate medical
        care when needed.
      </p>
    </div>
  );
}

function formatText(value) {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    margin: "25px 0",
  },

  statCard: {
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

  focusCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "20px",
  },

  focusTitle: {
    color: "#FFFFFF",
    marginBottom: 0,
  },

  coachNote: {
    background: "#111111",
    borderLeft: "4px solid #F4C20D",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "25px",
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
  },

  exerciseHeader: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  number: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    borderRadius: "50%",
    background: "#F4C20D",
    color: "#050505",
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
    margin: "4px 0 10px",
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
      "repeat(auto-fit, minmax(90px, 1fr))",
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

  exerciseCoachNote: {
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "14px",
    marginTop: "15px",
  },

  noteTitle: {
    color: "#F4C20D",
    fontSize: "11px",
  },

  videoButton: {
    display: "inline-block",
    color: "#F4C20D",
    textDecoration: "none",
    fontWeight: "900",
    marginTop: "15px",
  },

  emptyCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "25px",
    marginTop: "20px",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "22px",
  },

  disclaimer: {
    background: "#0B0B0B",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "18px",
    marginTop: "30px",
  },

  disclaimerTitle: {
    color: "#F4C20D",
    fontSize: "10px",
    letterSpacing: "1px",
  },

  disclaimerText: {
    color: "#888888",
    lineHeight: 1.5,
    fontSize: "12px",
    marginBottom: 0,
  },
};
