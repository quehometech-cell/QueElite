"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientNutrition({
  client,
  nutritionPlan,
  onNutritionUpdated,
}) {
  const [form, setForm] = useState({
    calorie_target: "",
    protein_grams: "",
    carb_grams: "",
    fat_grams: "",
    water_ounces: "",
    nutrition_goal: "",
    meal_guidance: "",
    coach_notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setForm({
      calorie_target:
        nutritionPlan?.calorie_target ?? "",
      protein_grams:
        nutritionPlan?.protein_grams ?? "",
      carb_grams:
        nutritionPlan?.carb_grams ?? "",
      fat_grams:
        nutritionPlan?.fat_grams ?? "",
      water_ounces:
        nutritionPlan?.water_ounces ?? "",
      nutrition_goal:
        nutritionPlan?.nutrition_goal ?? "",
      meal_guidance:
        nutritionPlan?.meal_guidance ?? "",
      coach_notes:
        nutritionPlan?.coach_notes ?? "",
    });

    setMessage("");
    setErrorMessage("");
  }, [nutritionPlan, client?.id]);

  if (!client) {
    return (
      <div style={styles.emptyCard}>
        Select a client before managing nutrition.
      </div>
    );
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
    setErrorMessage("");
  }

  function numberOrNull(value) {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? Math.round(parsed)
      : null;
  }

  async function saveNutrition() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const payload = {
        user_id: client.id,

        calorie_target: numberOrNull(
          form.calorie_target
        ),

        protein_grams: numberOrNull(
          form.protein_grams
        ),

        carb_grams: numberOrNull(
          form.carb_grams
        ),

        fat_grams: numberOrNull(
          form.fat_grams
        ),

        water_ounces: numberOrNull(
          form.water_ounces
        ),

        nutrition_goal:
          form.nutrition_goal.trim() || null,

        meal_guidance:
          form.meal_guidance.trim() || null,

        coach_notes:
          form.coach_notes.trim() || null,

        updated_at: new Date().toISOString(),
      };

      let savedPlan;

      if (nutritionPlan?.id) {
        const { data, error } = await supabase
          .from("nutrition_plans")
          .update(payload)
          .eq("id", nutritionPlan.id)
          .eq("user_id", client.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        savedPlan = data;
      } else {
        const { data, error } = await supabase
          .from("nutrition_plans")
          .insert(payload)
          .select()
          .single();

        if (error) {
          throw error;
        }

        savedPlan = data;
      }

      setMessage(
        "Nutrition plan saved successfully."
      );

      if (onNutritionUpdated) {
        await onNutritionUpdated(savedPlan);
      }
    } catch (error) {
      console.error(
        "Nutrition save error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The nutrition plan could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <p style={styles.goldLabel}>
        CLIENT NUTRITION
      </p>

      <h2 style={styles.title}>
        {client.full_name || "Client"}'s Nutrition
      </h2>

      <p style={styles.description}>
        Set practical nutrition targets and guidance
        that will appear inside the client's member
        portal.
      </p>

      <div style={styles.statusCard}>
        <div>
          <span style={styles.smallLabel}>
            CURRENT STATUS
          </span>

          <h3 style={styles.statusTitle}>
            {nutritionPlan
              ? "Nutrition Plan Active"
              : "No Nutrition Plan Assigned"}
          </h3>
        </div>

        <span
          style={
            nutritionPlan
              ? styles.activeBadge
              : styles.inactiveBadge
          }
        >
          {nutritionPlan ? "ACTIVE" : "NOT SET"}
        </span>
      </div>

      <div style={styles.sectionCard}>
        <p style={styles.goldLabel}>
          DAILY TARGETS
        </p>

        <h3 style={styles.cardTitle}>
          Calories & Macros
        </h3>

        <div style={styles.inputGrid}>
          <NumberField
            label="CALORIE TARGET"
            value={form.calorie_target}
            placeholder="2000"
            suffix="cal"
            onChange={(value) =>
              updateField(
                "calorie_target",
                value
              )
            }
          />

          <NumberField
            label="PROTEIN"
            value={form.protein_grams}
            placeholder="160"
            suffix="g"
            onChange={(value) =>
              updateField(
                "protein_grams",
                value
              )
            }
          />

          <NumberField
            label="CARBOHYDRATES"
            value={form.carb_grams}
            placeholder="200"
            suffix="g"
            onChange={(value) =>
              updateField(
                "carb_grams",
                value
              )
            }
          />

          <NumberField
            label="FAT"
            value={form.fat_grams}
            placeholder="65"
            suffix="g"
            onChange={(value) =>
              updateField(
                "fat_grams",
                value
              )
            }
          />

          <NumberField
            label="WATER"
            value={form.water_ounces}
            placeholder="100"
            suffix="oz"
            onChange={(value) =>
              updateField(
                "water_ounces",
                value
              )
            }
          />
        </div>
      </div>

      <div style={styles.sectionCard}>
        <p style={styles.goldLabel}>
          COACHING GUIDANCE
        </p>

        <h3 style={styles.cardTitle}>
          Nutrition Goal
        </h3>

        <input
          type="text"
          value={form.nutrition_goal}
          onChange={(event) =>
            updateField(
              "nutrition_goal",
              event.target.value
            )
          }
          placeholder="Example: Support fat loss while maintaining strength"
          style={styles.textInput}
        />

        <label style={styles.fieldLabel}>
          MEAL GUIDANCE
        </label>

        <textarea
          value={form.meal_guidance}
          onChange={(event) =>
            updateField(
              "meal_guidance",
              event.target.value
            )
          }
          placeholder={
            "Example:\n\nBuild meals around lean protein, vegetables, whole-food carbohydrates, and healthy fats.\n\nAim for protein at each meal and plan meals ahead on workdays."
          }
          style={styles.textarea}
        />

        <label style={styles.fieldLabel}>
          COACH NOTES FOR CLIENT
        </label>

        <textarea
          value={form.coach_notes}
          onChange={(event) =>
            updateField(
              "coach_notes",
              event.target.value
            )
          }
          placeholder="Example: Focus on consistency this week. Don't worry about being perfect."
          style={styles.textareaSmall}
        />
      </div>

      <div style={styles.notice}>
        <strong style={styles.noticeTitle}>
          GET CHA RIGHT NUTRITION COACHING
        </strong>

        <p style={styles.noticeText}>
          Use this area for general nutrition education,
          calorie and macro targets, hydration guidance,
          food choices, and healthy eating habits. It is
          not intended to diagnose or treat medical
          conditions or replace individualized medical
          nutrition therapy.
        </p>
      </div>

      {message && (
        <div style={styles.successBox}>
          {message}
        </div>
      )}

      {errorMessage && (
        <div style={styles.errorBox}>
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={saveNutrition}
        disabled={saving}
        style={{
          ...styles.saveButton,
          opacity: saving ? 0.6 : 1,
          cursor: saving
            ? "not-allowed"
            : "pointer",
        }}
      >
        {saving
          ? "SAVING..."
          : nutritionPlan
            ? "UPDATE NUTRITION PLAN"
            : "CREATE NUTRITION PLAN"}
      </button>
    </section>
  );
}

function NumberField({
  label,
  value,
  placeholder,
  suffix,
  onChange,
}) {
  return (
    <label style={styles.numberCard}>
      <span style={styles.fieldLabel}>
        {label}
      </span>

      <div style={styles.numberInputRow}>
        <input
          type="number"
          min="0"
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          style={styles.numberInput}
        />

        <span style={styles.suffix}>
          {suffix}
        </span>
      </div>
    </label>
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
    margin: "8px 0",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "750px",
    marginBottom: "25px",
  },

  statusCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },

  smallLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
  },

  statusTitle: {
    color: "#FFFFFF",
    margin: "5px 0 0",
    fontSize: "18px",
  },

  activeBadge: {
    color: "#050505",
    background: "#F4C20D",
    padding: "7px 10px",
    borderRadius: "20px",
    fontSize: "8px",
    fontWeight: "900",
  },

  inactiveBadge: {
    color: "#BDBDBD",
    background: "#050505",
    border: "1px solid #2A2A2A",
    padding: "7px 10px",
    borderRadius: "20px",
    fontSize: "8px",
    fontWeight: "900",
  },

  sectionCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    marginBottom: "15px",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "22px",
    margin: "7px 0 18px",
  },

  inputGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
  },

  numberCard: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "12px",
  },

  fieldLabel: {
    display: "block",
    color: "#777777",
    fontSize: "9px",
    fontWeight: "900",
    marginBottom: "7px",
  },

  numberInputRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  numberInput: {
    width: "100%",
    minWidth: 0,
    background: "transparent",
    color: "#FFFFFF",
    border: "none",
    outline: "none",
    fontSize: "20px",
    fontWeight: "800",
  },

  suffix: {
    color: "#777777",
    fontSize: "11px",
  },

  textInput: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "13px",
    outline: "none",
    marginBottom: "20px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "170px",
    resize: "vertical",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "13px",
    outline: "none",
    lineHeight: 1.6,
    marginBottom: "20px",
  },

  textareaSmall: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "110px",
    resize: "vertical",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "13px",
    outline: "none",
    lineHeight: 1.6,
  },

  notice: {
    background: "#0B0B0B",
    borderLeft: "3px solid #F4C20D",
    padding: "16px",
    margin: "18px 0",
  },

  noticeTitle: {
    color: "#F4C20D",
    fontSize: "9px",
  },

  noticeText: {
    color: "#777777",
    lineHeight: 1.6,
    fontSize: "11px",
    marginBottom: 0,
  },

  successBox: {
    background: "#111111",
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    borderRadius: "9px",
    padding: "13px",
    marginBottom: "12px",
    fontSize: "12px",
  },

  errorBox: {
    background: "#2A1111",
    color: "#FFFFFF",
    borderRadius: "9px",
    padding: "13px",
    marginBottom: "12px",
    fontSize: "12px",
  },

  saveButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "9px",
    padding: "15px",
    fontWeight: "900",
  },

  emptyCard: {
    background: "#111111",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "25px",
  },
};
