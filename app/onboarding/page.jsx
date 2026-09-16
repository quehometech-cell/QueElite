"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    goal: "",
    age: "",
    height_inches: "",
    weight_lbs: "",
    experience_level: "",
    equipment: "",
    days_per_week: "",
    session_minutes: "",
    workout_location: "",
    activity_level: "",
    limitations: "",
  });

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    }

    checkUser();
  }, [router]);

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) return;

    setSubmitting(true);
    setMessage("");

    const { error } = await supabase
      .from("onboarding_assessments")
      .insert({
        user_id: user.id,
        goal: form.goal,
        age: Number(form.age),
        height_inches: Number(form.height_inches),
        weight_lbs: Number(form.weight_lbs),
        experience_level: form.experience_level,
        equipment: form.equipment,
        days_per_week: Number(form.days_per_week),
        session_minutes: Number(form.session_minutes),
        workout_location: form.workout_location,
        activity_level: form.activity_level,
        limitations: form.limitations || null,
      });

    if (error) {
      console.error(error);
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    router.push("/members");
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <p style={{ color: "#F4C20D" }}>Loading...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <p style={styles.brand}>GET CHA RIGHT FITNESS</p>

        <h1 style={styles.title}>BUILD YOUR STARTING PLAN</h1>

        <p style={styles.subtitle}>
          Tell us about your goals, schedule, and training setup. We'll use
          your answers to select your starting program.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Primary Goal
            <select
              name="goal"
              value={form.goal}
              onChange={updateField}
              required
              style={styles.input}
            >
              <option value="">Choose your goal</option>
              <option value="fat_loss">Lose Body Fat</option>
              <option value="muscle_gain">Build Muscle & Strength</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </label>

          <div style={styles.row}>
            <label style={styles.label}>
              Age
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={updateField}
                required
                min="18"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Height (inches)
              <input
                type="number"
                name="height_inches"
                value={form.height_inches}
                onChange={updateField}
                required
                min="48"
                max="96"
                style={styles.input}
              />
            </label>
          </div>

          <label style={styles.label}>
            Weight (lbs)
            <input
              type="number"
              name="weight_lbs"
              value={form.weight_lbs}
              onChange={updateField}
              required
              min="70"
              step="0.1"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Experience Level
            <select
              name="experience_level"
              value={form.experience_level}
              onChange={updateField}
              required
              style={styles.input}
            >
              <option value="">Choose your experience</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label style={styles.label}>
            Where Will You Train?
            <select
              name="workout_location"
              value={form.workout_location}
              onChange={updateField}
              required
              style={styles.input}
            >
              <option value="">Choose location</option>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="both">Home & Gym</option>
            </select>
          </label>

          <label style={styles.label}>
            Equipment Available
            <select
              name="equipment"
              value={form.equipment}
              onChange={updateField}
              required
              style={styles.input}
            >
              <option value="">Choose equipment</option>
              <option value="bodyweight">Bodyweight Only</option>
              <option value="dumbbells">Dumbbells</option>
              <option value="bands">Resistance Bands</option>
              <option value="home">Home Equipment</option>
              <option value="full_gym">Full Gym</option>
            </select>
          </label>

          <div style={styles.row}>
            <label style={styles.label}>
              Days Per Week
              <select
                name="days_per_week"
                value={form.days_per_week}
                onChange={updateField}
                required
                style={styles.input}
              >
                <option value="">Choose</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="4">4 Days</option>
                <option value="5">5+ Days</option>
              </select>
            </label>

            <label style={styles.label}>
              Session Length
              <select
                name="session_minutes"
                value={form.session_minutes}
                onChange={updateField}
                required
                style={styles.input}
              >
                <option value="">Choose</option>
                <option value="20">20 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </label>
          </div>

          <label style={styles.label}>
            Current Activity Level
            <select
              name="activity_level"
              value={form.activity_level}
              onChange={updateField}
              required
              style={styles.input}
            >
              <option value="">Choose activity level</option>
              <option value="sedentary">Mostly Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="active">Very Active</option>
            </select>
          </label>

          <label style={styles.label}>
            Injuries, Limitations, or Exercises You Need to Avoid
            <textarea
              name="limitations"
              value={form.limitations}
              onChange={updateField}
              placeholder="Leave blank if none."
              rows="4"
              style={styles.input}
            />
          </label>

          {message && <p style={styles.error}>{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={styles.button}
          >
            {submitting ? "BUILDING YOUR PLAN..." : "BUILD MY STARTING PLAN"}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  card: {
    width: "100%",
    maxWidth: "720px",
    background: "#111111",
    border: "1px solid #2A2A2A",
    padding: "32px",
    borderRadius: "16px",
  },
  brand: {
    color: "#F4C20D",
    fontWeight: "800",
    letterSpacing: "2px",
    fontSize: "13px",
  },
  title: {
    color: "#FFFFFF",
    fontSize: "36px",
    margin: "10px 0",
  },
  subtitle: {
    color: "#BDBDBD",
    lineHeight: "1.6",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  label: {
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontWeight: "600",
  },
  input: {
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "16px",
  },
  button: {
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "8px",
    padding: "16px",
    fontWeight: "900",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "#ff6b6b",
  },
};
