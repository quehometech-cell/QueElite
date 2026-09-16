"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CheckIn({ user }) {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    energy_level: "3",
    sleep_quality: "3",
    stress_level: "3",
    workouts_completed: "",
    nutrition_adherence: "3",
    current_weight: "",
    wins: "",
    challenges: "",
    questions: "",
  });

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadCheckIns();
  }, [user?.id]);

  async function loadCheckIns() {
    setLoading(true);

    const { data, error } = await supabase
      .from("weekly_checkins")
      .select(
        "id, energy_level, sleep_quality, stress_level, workouts_completed, nutrition_adherence, current_weight, wins, challenges, questions, coach_response, submitted_at"
      )
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Check-in load error:", error);
      setMessage("We couldn't load your check-in history.");
      setLoading(false);
      return;
    }

    setCheckIns(data || []);
    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function numberOrNull(value) {
    if (value === "") return null;

    const number = Number(value);

    return Number.isNaN(number) ? null : number;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) return;

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("weekly_checkins")
      .insert({
        user_id: user.id,
        energy_level: Number(form.energy_level),
        sleep_quality: Number(form.sleep_quality),
        stress_level: Number(form.stress_level),
        workouts_completed: numberOrNull(
          form.workouts_completed
        ),
        nutrition_adherence: Number(
          form.nutrition_adherence
        ),
        current_weight: numberOrNull(
          form.current_weight
        ),
        wins: form.wins.trim() || null,
        challenges: form.challenges.trim() || null,
        questions: form.questions.trim() || null,
      })
      .select(
        "id, energy_level, sleep_quality, stress_level, workouts_completed, nutrition_adherence, current_weight, wins, challenges, questions, coach_response, submitted_at"
      )
      .single();

    if (error) {
      console.error("Check-in save error:", error);
      setMessage(
        "We couldn't submit your check-in. Please try again."
      );
      setSaving(false);
      return;
    }

    setCheckIns((current) => [data, ...current]);

    setForm({
      energy_level: "3",
      sleep_quality: "3",
      stress_level: "3",
      workouts_completed: "",
      nutrition_adherence: "3",
      current_weight: "",
      wins: "",
      challenges: "",
      questions: "",
    });

    setMessage(
      "Check-in submitted. Que will be able to review it."
    );

    setSaving(false);
  }

  return (
    <section>
      <p style={styles.goldLabel}>
        WEEKLY CHECK-IN
      </p>

      <h2 style={styles.title}>
        HOW&apos;S YOUR WEEK GOING?
      </h2>

      <p style={styles.description}>
        Your check-in helps Que understand how training,
        recovery, nutrition, and your schedule are going so your
        coaching can stay on track.
      </p>

      <form
        onSubmit={handleSubmit}
        style={styles.formCard}
      >
        <p style={styles.goldLabel}>
          THIS WEEK
        </p>

        <h3 style={styles.cardTitle}>
          Rate Your Week
        </h3>

        <div style={styles.ratingGrid}>
          <RatingSelect
            label="Energy"
            name="energy_level"
            value={form.energy_level}
            onChange={handleChange}
            low="Very Low"
            high="Great"
          />

          <RatingSelect
            label="Sleep"
            name="sleep_quality"
            value={form.sleep_quality}
            onChange={handleChange}
            low="Poor"
            high="Great"
          />

          <RatingSelect
            label="Stress"
            name="stress_level"
            value={form.stress_level}
            onChange={handleChange}
            low="Low"
            high="Very High"
          />

          <RatingSelect
            label="Nutrition"
            name="nutrition_adherence"
            value={form.nutrition_adherence}
            onChange={handleChange}
            low="Off Track"
            high="On Track"
          />
        </div>

        <div style={styles.twoColumn}>
          <label style={styles.label}>
            WORKOUTS COMPLETED

            <input
              type="number"
              name="workouts_completed"
              value={form.workouts_completed}
              onChange={handleChange}
              min="0"
              max="14"
              placeholder="Example: 3"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            CURRENT WEIGHT

            <div style={styles.inputWrap}>
              <input
                type="number"
                name="current_weight"
                value={form.current_weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                inputMode="decimal"
                placeholder="Optional"
                style={styles.innerInput}
              />

              <span style={styles.unit}>
                lb
              </span>
            </div>
          </label>
        </div>

        <TextArea
          label="WHAT WENT WELL?"
          name="wins"
          value={form.wins}
          onChange={handleChange}
          placeholder="Tell Que about your wins this week."
        />

        <TextArea
          label="WHAT WAS CHALLENGING?"
          name="challenges"
          value={form.challenges}
          onChange={handleChange}
          placeholder="Training, schedule, food, recovery, motivation..."
        />

        <TextArea
          label="QUESTIONS FOR QUE"
          name="questions"
          value={form.questions}
          onChange={handleChange}
          placeholder="Anything you want your coach to review?"
        />

        <button
          type="submit"
          disabled={saving}
          style={
            saving
              ? styles.disabledButton
              : styles.goldButton
          }
        >
          {saving
            ? "SUBMITTING..."
            : "SUBMIT WEEKLY CHECK-IN"}
        </button>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}
      </form>

      <div style={styles.historySection}>
        <p style={styles.goldLabel}>
          CHECK-IN HISTORY
        </p>

        <h3 style={styles.historyTitle}>
          Previous Check-Ins
        </h3>

        {loading ? (
          <div style={styles.emptyCard}>
            Loading check-ins...
          </div>
        ) : checkIns.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.bodyText}>
              You haven&apos;t submitted a check-in yet.
            </p>
          </div>
        ) : (
          <div style={styles.historyList}>
            {checkIns.map((checkIn) => (
              <CheckInCard
                key={checkIn.id}
                checkIn={checkIn}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RatingSelect({
  label,
  name,
  value,
  onChange,
  low,
  high,
}) {
  return (
    <label style={styles.label}>
      {label.toUpperCase()}

      <select
        name={name}
        value={value}
        onChange={onChange}
        style={styles.select}
      >
        <option value="1">
          1 - {low}
        </option>

        <option value="2">2</option>

        <option value="3">
          3 - Average
        </option>

        <option value="4">4</option>

        <option value="5">
          5 - {high}
        </option>
      </select>
    </label>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label style={styles.label}>
      {label}

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        style={styles.textarea}
      />
    </label>
  );
}

function CheckInCard({ checkIn }) {
  return (
    <article style={styles.checkInCard}>
      <div style={styles.checkInHeader}>
        <div>
          <p style={styles.goldLabel}>
            WEEKLY CHECK-IN
          </p>

          <h4 style={styles.checkInDate}>
            {formatDate(checkIn.submitted_at)}
          </h4>
        </div>

        {checkIn.current_weight && (
          <div style={styles.weightBadge}>
            {checkIn.current_weight} lb
          </div>
        )}
      </div>

      <div style={styles.scoreGrid}>
        <Score
          label="Energy"
          value={checkIn.energy_level}
        />

        <Score
          label="Sleep"
          value={checkIn.sleep_quality}
        />

        <Score
          label="Stress"
          value={checkIn.stress_level}
        />

        <Score
          label="Nutrition"
          value={checkIn.nutrition_adherence}
        />

        <Score
          label="Workouts"
          value={
            checkIn.workouts_completed ?? "-"
          }
          noScale
        />
      </div>

      {checkIn.wins && (
        <ResponseSection
          title="WINS"
          text={checkIn.wins}
        />
      )}

      {checkIn.challenges && (
        <ResponseSection
          title="CHALLENGES"
          text={checkIn.challenges}
        />
      )}

      {checkIn.questions && (
        <ResponseSection
          title="QUESTIONS FOR QUE"
          text={checkIn.questions}
        />
      )}

      {checkIn.coach_response ? (
        <div style={styles.coachResponse}>
          <p style={styles.goldLabel}>
            QUE&apos;S RESPONSE
          </p>

          <p style={styles.bodyText}>
            {checkIn.coach_response}
          </p>
        </div>
      ) : (
        <div style={styles.awaiting}>
          Coach response pending
        </div>
      )}
    </article>
  );
}

function Score({
  label,
  value,
  noScale = false,
}) {
  return (
    <div style={styles.scoreCard}>
      <strong style={styles.scoreValue}>
        {value}
        {!noScale && "/5"}
      </strong>

      <span style={styles.scoreLabel}>
        {label}
      </span>
    </div>
  );
}

function ResponseSection({ title, text }) {
  return (
    <div style={styles.responseSection}>
      <strong style={styles.responseTitle}>
        {title}
      </strong>

      <p style={styles.bodyText}>
        {text}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  title: {
    color: "#FFFFFF",
    fontSize: "clamp(32px, 6vw, 52px)",
    margin: "8px 0 10px",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "800px",
    marginBottom: "25px",
  },

  formCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "25px",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "23px",
    margin: "7px 0 20px",
  },

  ratingGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "15px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  },

  label: {
    color: "#BDBDBD",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "17px",
  },

  select: {
    width: "100%",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "14px",
    outline: "none",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "14px",
    outline: "none",
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    overflow: "hidden",
  },

  innerInput: {
    width: "100%",
    background: "transparent",
    color: "#FFFFFF",
    border: "none",
    outline: "none",
    padding: "14px",
  },

  unit: {
    color: "#F4C20D",
    padding: "0 14px",
    fontWeight: "900",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },

  goldButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "9px",
    padding: "16px",
    fontWeight: "900",
    cursor: "pointer",
  },

  disabledButton: {
    width: "100%",
    background: "#2A2A2A",
    color: "#777777",
    border: "none",
    borderRadius: "9px",
    padding: "16px",
    fontWeight: "900",
  },

  message: {
    color: "#FFFFFF",
    border: "1px solid #F4C20D",
    borderRadius: "9px",
    padding: "12px",
    marginTop: "15px",
  },

  historySection: {
    marginTop: "40px",
  },

  historyTitle: {
    color: "#FFFFFF",
    fontSize: "27px",
    margin: "7px 0 20px",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  checkInCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
  },

  checkInHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
  },

  checkInDate: {
    color: "#FFFFFF",
    fontSize: "18px",
    margin: "5px 0 15px",
  },

  weightBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "20px",
    padding: "8px 12px",
    fontWeight: "900",
    fontSize: "12px",
  },

  scoreGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "8px",
    marginBottom: "18px",
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
    color: "#BDBDBD",
    fontSize: "9px",
    marginTop: "4px",
  },

  responseSection: {
    borderTop: "1px solid #2A2A2A",
    paddingTop: "15px",
    marginTop: "15px",
  },

  responseTitle: {
    color: "#FFFFFF",
    fontSize: "10px",
  },

  coachResponse: {
    background: "#050505",
    borderLeft: "4px solid #F4C20D",
    borderRadius: "8px",
    padding: "17px",
    marginTop: "20px",
  },

  awaiting: {
    color: "#888888",
    background: "#050505",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "20px",
    fontSize: "11px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },

  emptyCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    color: "#BDBDBD",
    borderRadius: "14px",
    padding: "25px",
  },
};
