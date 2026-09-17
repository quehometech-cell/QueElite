"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    async function checkAccess() {
      try {
        // ---------------------------------------------
        // 1. User must be logged in
        // ---------------------------------------------
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          router.replace("/login");
          return;
        }

        setUser(currentUser);

        // ---------------------------------------------
        // 2. User must have an active membership
        // ---------------------------------------------
        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("membership_status")
            .eq("id", currentUser.id)
            .single();

        if (profileError || !profile) {
          setErrorMessage(
            "We could not verify your membership."
          );
          setLoading(false);
          return;
        }

        if (profile.membership_status !== "active") {
          router.replace("/membership-required");
          return;
        }

        // ---------------------------------------------
        // 3. Check whether onboarding is already done
        // ---------------------------------------------
        const { data: assessment, error: assessmentError } =
          await supabase
            .from("onboarding_assessments")
            .select("id, completed")
            .eq("user_id", currentUser.id)
            .eq("completed", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (assessmentError) {
          throw assessmentError;
        }

        if (assessment?.completed) {
          router.replace("/members");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Onboarding access error:", error);

        setErrorMessage(
          error?.message ||
            "Unable to load onboarding. Please try again."
        );

        setLoading(false);
      }
    }

    checkAccess();
  }, [router]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      // Re-check membership before saving.
      // This prevents an inactive user from submitting
      // after the page was already loaded.
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("membership_status")
          .eq("id", user.id)
          .single();

      if (profileError || !profile) {
        throw new Error(
          "Unable to verify your membership."
        );
      }

      if (profile.membership_status !== "active") {
        router.replace("/membership-required");
        return;
      }

      if (
        !form.goal ||
        !form.age ||
        !form.height_inches ||
        !form.weight_lbs ||
        !form.experience_level ||
        !form.equipment ||
        !form.days_per_week ||
        !form.session_minutes ||
        !form.workout_location ||
        !form.activity_level
      ) {
        throw new Error(
          "Please complete all required fields."
        );
      }

      const age = Number(form.age);
      const height = Number(form.height_inches);
      const weight = Number(form.weight_lbs);
      const days = Number(form.days_per_week);
      const minutes = Number(form.session_minutes);

      if (
        !Number.isFinite(age) ||
        age < 18 ||
        age > 100
      ) {
        throw new Error("Enter a valid age.");
      }

      if (
        !Number.isFinite(height) ||
        height < 48 ||
        height > 96
      ) {
        throw new Error(
          "Enter a valid height in inches."
        );
      }

      if (
        !Number.isFinite(weight) ||
        weight < 70 ||
        weight > 700
      ) {
        throw new Error(
          "Enter a valid weight in pounds."
        );
      }

      if (
        !Number.isFinite(days) ||
        days < 1 ||
        days > 7
      ) {
        throw new Error(
          "Select how many days you can train."
        );
      }

      if (
        !Number.isFinite(minutes) ||
        minutes < 10 ||
        minutes > 180
      ) {
        throw new Error(
          "Select a valid session length."
        );
      }

      const { error } = await supabase
        .from("onboarding_assessments")
        .insert({
          user_id: user.id,
          goal: form.goal,
          age,
          height_inches: height,
          weight_lbs: weight,
          experience_level: form.experience_level,
          equipment: form.equipment,
          days_per_week: days,
          session_minutes: minutes,
          workout_location: form.workout_location,
          activity_level: form.activity_level,
          limitations: form.limitations.trim() || null,
        });

      if (error) {
        throw error;
      }

      router.replace("/members");
      router.refresh();
    } catch (error) {
      console.error("Onboarding submission error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to save your assessment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.brand}>
            GET CHA RIGHT FITNESS
          </div>

          <div style={styles.loadingText}>
            Loading your assessment...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.brand}>
            GET CHA RIGHT FITNESS
          </div>

          <h1 style={styles.title}>
            Let&apos;s Build Your Plan
          </h1>

          <p style={styles.subtitle}>
            Answer a few questions so we can match your
            training to your goals, experience, equipment,
            and schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Primary Goal">
            <select
              name="goal"
              value={form.goal}
              onChange={updateField}
              style={styles.input}
              required
            >
              <option value="">Select your goal</option>
              <option value="fat_loss">Fat Loss</option>
              <option value="muscle_gain">
                Muscle & Strength
              </option>
              <option value="general_fitness">
                General Fitness
              </option>
            </select>
          </Field>

          <div style={styles.twoColumn}>
            <Field label="Age">
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={updateField}
                min="18"
                max="100"
                placeholder="Age"
                style={styles.input}
                required
              />
            </Field>

            <Field label="Height (inches)">
              <input
                type="number"
                name="height_inches"
                value={form.height_inches}
                onChange={updateField}
                min="48"
                max="96"
                placeholder="Example: 74"
                style={styles.input}
                required
              />
            </Field>
          </div>

          <Field label="Current Weight (lb)">
            <input
              type="number"
              name="weight_lbs"
              value={form.weight_lbs}
              onChange={updateField}
              min="70"
              max="700"
              step="0.1"
              placeholder="Current weight"
              style={styles.input}
              required
            />
          </Field>

          <Field label="Training Experience">
            <select
              name="experience_level"
              value={form.experience_level}
              onChange={updateField}
              style={styles.input}
              required
            >
              <option value="">
                Select your experience
              </option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">
                Intermediate
              </option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>

          <Field label="Equipment Available">
            <select
              name="equipment"
              value={form.equipment}
              onChange={updateField}
              style={styles.input}
              required
            >
              <option value="">
                Select available equipment
              </option>
              <option value="bodyweight">
                Bodyweight Only
              </option>
              <option value="home">
                Home Equipment
              </option>
              <option value="full_gym">
                Full Gym
              </option>
            </select>
          </Field>

          <div style={styles.twoColumn}>
            <Field label="Training Days / Week">
              <select
                name="days_per_week"
                value={form.days_per_week}
                onChange={updateField}
                style={styles.input}
                required
              >
                <option value="">Select days</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="4">4 Days</option>
                <option value="5">5 Days</option>
              </select>
            </Field>

            <Field label="Session Length">
              <select
                name="session_minutes"
                value={form.session_minutes}
                onChange={updateField}
                style={styles.input}
                required
              >
                <option value="">Select time</option>
                <option value="20">20 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </Field>
          </div>

          <Field label="Workout Location">
            <select
              name="workout_location"
              value={form.workout_location}
              onChange={updateField}
              style={styles.input}
              required
            >
              <option value="">
                Select workout location
              </option>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="both">
                Home & Gym
              </option>
            </select>
          </Field>

          <Field label="Current Activity Level">
            <select
              name="activity_level"
              value={form.activity_level}
              onChange={updateField}
              style={styles.input}
              required
            >
              <option value="">
                Select activity level
              </option>
              <option value="sedentary">
                Mostly Sedentary
              </option>
              <option value="light">
                Lightly Active
              </option>
              <option value="moderate">
                Moderately Active
              </option>
              <option value="active">
                Very Active
              </option>
            </select>
          </Field>

          <Field label="Limitations or Movement Concerns">
            <textarea
              name="limitations"
              value={form.limitations}
              onChange={updateField}
              placeholder="Tell your coach about any movement limitations, exercises you avoid, or anything important for your training."
              style={{
                ...styles.input,
                minHeight: "120px",
                resize: "vertical",
              }}
            />
          </Field>

          {errorMessage && (
            <div style={styles.error}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={
              submitting
                ? styles.disabledButton
                : styles.button
            }
          >
            {submitting
              ? "Building Your Plan..."
              : "Build My Plan"}
          </button>

          <div style={styles.disclaimer}>
            Your answers help guide your fitness program and
            do not replace medical evaluation or treatment.
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    color: "#FFFFFF",
    padding: "40px 20px",
  },

  container: {
    width: "100%",
    maxWidth: "760px",
    margin: "0 auto",
  },

  header: {
    textAlign: "center",
    marginBottom: "28px",
  },

  brand: {
    color: "#F4C20D",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "1.5px",
  },

  title: {
    margin: "10px 0 0",
    fontSize: "36px",
    fontWeight: "900",
  },

  subtitle: {
    color: "#BDBDBD",
    maxWidth: "600px",
    margin: "12px auto 0",
    lineHeight: "1.6",
  },

  form: {
    display: "grid",
    gap: "20px",
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "20px",
    padding: "28px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  label: {
    display: "block",
    color: "#F4C20D",
    fontWeight: "800",
    fontSize: "13px",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "15px",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#F4C20D",
    color: "#050505",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
  },

  disabledButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#2A2A2A",
    color: "#BDBDBD",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "not-allowed",
  },

  error: {
    background: "#2A1111",
    border: "1px solid #7A2929",
    color: "#FFB4B4",
    borderRadius: "10px",
    padding: "12px",
    lineHeight: "1.5",
  },

  disclaimer: {
    color: "#777777",
    fontSize: "12px",
    textAlign: "center",
    lineHeight: "1.5",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#050505",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  loadingCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "28px",
    textAlign: "center",
  },

  loadingText: {
    color: "#BDBDBD",
    marginTop: "10px",
  },
};
