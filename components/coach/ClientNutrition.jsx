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
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);

  const [mealPlan, setMealPlan] = useState(null);
  const [mealPlanMeals, setMealPlanMeals] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setForm({
      calorie_target: nutritionPlan?.calorie_target ?? "",
      protein_grams: nutritionPlan?.protein_grams ?? "",
      carb_grams: nutritionPlan?.carb_grams ?? "",
      fat_grams: nutritionPlan?.fat_grams ?? "",
      water_ounces: nutritionPlan?.water_ounces ?? "",
      nutrition_goal: nutritionPlan?.nutrition_goal ?? "",
      meal_guidance: nutritionPlan?.meal_guidance ?? "",
      coach_notes: nutritionPlan?.coach_notes ?? "",
    });

    setMessage("");
    setErrorMessage("");
  }, [nutritionPlan, client?.id]);

  useEffect(() => {
    if (!client?.id) {
      setMealPlan(null);
      setMealPlanMeals([]);
      return;
    }

    loadMealPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id]);

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

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (!session?.access_token) {
      throw new Error(
        "Your login session expired. Please log in again."
      );
    }

    return session.access_token;
  }

  async function loadMealPlan() {
    if (!client?.id) {
      return;
    }

    setLoadingMealPlan(true);
    setErrorMessage("");

    try {
      const { data: plans, error: planError } = await supabase
        .from("meal_plans")
        .select(`
          id,
          user_id,
          nutrition_plan_id,
          name,
          description,
          calorie_target,
          protein_grams,
          carb_grams,
          fat_grams,
          days_per_week,
          is_active,
          start_date,
          end_date,
          coach_notes,
          status,
          generated_from_assessment_id,
          generated_at,
          approved_by,
          approved_at,
          generation_notes,
          created_at,
          updated_at
        `)
        .eq("user_id", client.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1);

      if (planError) {
        throw planError;
      }

      const latestPlan = plans?.[0] || null;

      setMealPlan(latestPlan);
      setSelectedDay(1);

      if (!latestPlan?.id) {
        setMealPlanMeals([]);
        return;
      }

      const { data: meals, error: mealError } = await supabase
        .from("meal_plan_meals")
        .select(`
          id,
          meal_plan_id,
          day_number,
          meal_order,
          meal_name,
          meal_type,
          instructions,
          notes,
          target_calories,
          target_protein_grams,
          target_carb_grams,
          target_fat_grams,
          created_at,
          updated_at
        `)
        .eq("meal_plan_id", latestPlan.id)
        .order("day_number", {
          ascending: true,
        })
        .order("meal_order", {
          ascending: true,
        });

      if (mealError) {
        throw mealError;
      }

      const mealRows = meals || [];

      if (!mealRows.length) {
        setMealPlanMeals([]);
        return;
      }

      const mealIds = mealRows.map((meal) => meal.id);

      const { data: foods, error: foodError } = await supabase
        .from("meal_plan_foods")
        .select(`
          id,
          meal_plan_meal_id,
          food_order,
          food_name,
          serving_amount,
          serving_unit,
          calories,
          protein_grams,
          carb_grams,
          fat_grams,
          preparation,
          notes,
          is_optional,
          created_at,
          updated_at
        `)
        .in("meal_plan_meal_id", mealIds)
        .order("food_order", {
          ascending: true,
        });

      if (foodError) {
        throw foodError;
      }

      const foodsByMeal = new Map();

      for (const food of foods || []) {
        const key = String(food.meal_plan_meal_id);

        if (!foodsByMeal.has(key)) {
          foodsByMeal.set(key, []);
        }

        foodsByMeal.get(key).push(food);
      }

      const combined = mealRows.map((meal) => ({
        ...meal,
        foods:
          foodsByMeal.get(String(meal.id)) || [],
      }));

      setMealPlanMeals(combined);
    } catch (error) {
      console.error(
        "Meal plan load error:",
        error
      );

      setMealPlan(null);
      setMealPlanMeals([]);

      setErrorMessage(
        error?.message ||
          "The generated meal plan could not be loaded."
      );
    } finally {
      setLoadingMealPlan(false);
    }
  }

  async function generateMealPlan() {
    if (!client?.id) {
      return;
    }

    setGenerating(true);
    setMessage("");
    setErrorMessage("");

    try {
      const token = await getAccessToken();

      const response = await fetch(
        "/api/generate-meal-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            client_id: client.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Meal plan generation failed."
        );
      }

      setMessage(
        "Personalized 7-day meal plan generated. Review it below before publishing."
      );

      await loadMealPlan();

      if (onNutritionUpdated) {
        await onNutritionUpdated();
      }
    } catch (error) {
      console.error(
        "Meal plan generation error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The meal plan could not be generated."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function approveMealPlan() {
    if (!mealPlan?.id) {
      return;
    }

    setApproving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const token = await getAccessToken();

      const response = await fetch(
        "/api/approve-meal-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            meal_plan_id: mealPlan.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Meal plan approval failed."
        );
      }

      setMessage(
        "Meal plan approved and published to the client."
      );

      await loadMealPlan();

      if (onNutritionUpdated) {
        await onNutritionUpdated();
      }
    } catch (error) {
      console.error(
        "Meal plan approval error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The meal plan could not be approved."
      );
    } finally {
      setApproving(false);
    }
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

        target_source: "coach",
        coach_approved: true,
        coach_approved_at: new Date().toISOString(),
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

  if (!client) {
    return (
      <div style={styles.emptyCard}>
        Select a client before managing nutrition.
      </div>
    );
  }

  const statusLabel =
    mealPlan?.status === "pending_review"
      ? "PENDING REVIEW"
      : mealPlan?.status === "approved"
        ? "APPROVED"
        : mealPlan?.status === "draft"
          ? "DRAFT"
          : "NOT GENERATED";

  const statusStyle =
    mealPlan?.status === "approved"
      ? styles.approvedBadge
      : mealPlan?.status === "pending_review"
        ? styles.pendingBadge
        : styles.inactiveBadge;

  const selectedMeals = mealPlanMeals.filter(
    (meal) =>
      Number(meal.day_number) === Number(selectedDay)
  );

  return (
    <section>
      <p style={styles.goldLabel}>
        CLIENT NUTRITION
      </p>

      <h2 style={styles.title}>
        {client.full_name || "Client"}'s Nutrition
      </h2>

      <p style={styles.description}>
        Manage nutrition targets and generate a
        personalized meal plan from this client's
        onboarding information.
      </p>

      <div style={styles.statusCard}>
        <div>
          <span style={styles.smallLabel}>
            NUTRITION TARGETS
          </span>

          <h3 style={styles.statusTitle}>
            {nutritionPlan
              ? "Nutrition Plan Active"
              : "No Nutrition Targets Assigned"}
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

      <div style={styles.generatorCard}>
        <div style={styles.generatorHeader}>
          <div>
            <p style={styles.goldLabel}>
              PERSONALIZED MEAL PLAN
            </p>

            <h3 style={styles.cardTitle}>
              Generate From Onboarding
            </h3>

            <p style={styles.generatorText}>
              Build a 7-day draft using this client's
              package entitlement, body information,
              nutrition goal, meal frequency, dietary
              preferences, allergies, foods to avoid,
              preferred foods, and cooking preference.
            </p>
          </div>

          <span style={statusStyle}>
            {statusLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={generateMealPlan}
          disabled={
            generating ||
            approving ||
            mealPlan?.status === "approved"
          }
          style={{
            ...styles.generateButton,
            opacity:
              generating ||
              approving ||
              mealPlan?.status === "approved"
                ? 0.55
                : 1,
            cursor:
              generating ||
              approving ||
              mealPlan?.status === "approved"
                ? "not-allowed"
                : "pointer",
          }}
        >
          {generating
            ? "GENERATING..."
            : mealPlan?.status === "pending_review"
              ? "REGENERATE DRAFT"
              : mealPlan?.status === "approved"
                ? "PLAN PUBLISHED"
                : "GENERATE MEAL PLAN"}
        </button>

        {mealPlan?.status === "approved" && (
          <p style={styles.approvedHelp}>
            This plan is published to the client. The
            generator will not overwrite an active approved
            plan.
          </p>
        )}
      </div>

      {loadingMealPlan && (
        <div style={styles.loadingBox}>
          Loading meal plan...
        </div>
      )}

      {!loadingMealPlan && mealPlan && (
        <div style={styles.reviewCard}>
          <div style={styles.reviewTop}>
            <div>
              <p style={styles.goldLabel}>
                {mealPlan.status === "approved"
                  ? "PUBLISHED PLAN"
                  : "COACH REVIEW"}
              </p>

              <h3 style={styles.reviewTitle}>
                {mealPlan.name ||
                  "Personalized 7-Day Nutrition Plan"}
              </h3>

              {mealPlan.description && (
                <p style={styles.reviewDescription}>
                  {mealPlan.description}
                </p>
              )}
            </div>

            <span style={statusStyle}>
              {statusLabel}
            </span>
          </div>

          <div style={styles.macroGrid}>
            <MacroCard
              label="CALORIES"
              value={mealPlan.calorie_target}
              suffix="cal"
            />

            <MacroCard
              label="PROTEIN"
              value={mealPlan.protein_grams}
              suffix="g"
            />

            <MacroCard
              label="CARBS"
              value={mealPlan.carb_grams}
              suffix="g"
            />

            <MacroCard
              label="FAT"
              value={mealPlan.fat_grams}
              suffix="g"
            />
          </div>

          {mealPlan.generation_notes && (
            <div style={styles.reviewNotice}>
              <strong style={styles.reviewNoticeTitle}>
                GENERATION / REVIEW NOTES
              </strong>

              <p style={styles.reviewNoticeText}>
                {mealPlan.generation_notes}
              </p>
            </div>
          )}

          <div style={styles.dayTabs}>
            {Array.from(
              {
                length: Number(
                  mealPlan.days_per_week || 7
                ),
              },
              (_, index) => index + 1
            ).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                style={{
                  ...styles.dayButton,
                  ...(selectedDay === day
                    ? styles.dayButtonActive
                    : {}),
                }}
              >
                DAY {day}
              </button>
            ))}
          </div>

          <div style={styles.dayHeader}>
            <div>
              <span style={styles.smallLabel}>
                MEAL PLAN
              </span>

              <h4 style={styles.dayTitle}>
                Day {selectedDay}
              </h4>
            </div>

            <span style={styles.mealCount}>
              {selectedMeals.length} meals
            </span>
          </div>

          {selectedMeals.length === 0 ? (
            <div style={styles.emptyMealState}>
              No meals were found for this day.
            </div>
          ) : (
            <div style={styles.mealList}>
              {selectedMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                />
              ))}
            </div>
          )}

          {mealPlan.status === "pending_review" && (
            <div style={styles.approvalArea}>
              <div>
                <strong style={styles.approvalTitle}>
                  READY TO PUBLISH?
                </strong>

                <p style={styles.approvalText}>
                  Review all seven days, portions,
                  allergies, restrictions, food choices,
                  and nutrition targets before approving.
                  Approval publishes this plan to the
                  client.
                </p>
              </div>

              <button
                type="button"
                onClick={approveMealPlan}
                disabled={approving || generating}
                style={{
                  ...styles.approveButton,
                  opacity:
                    approving || generating ? 0.55 : 1,
                  cursor:
                    approving || generating
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {approving
                  ? "PUBLISHING..."
                  : "APPROVE & PUBLISH"}
              </button>
            </div>
          )}

          {mealPlan.status === "approved" && (
            <div style={styles.publishedBox}>
              <strong style={styles.publishedTitle}>
                ✓ PUBLISHED TO CLIENT
              </strong>

              <p style={styles.publishedText}>
                This is the client's active approved meal
                plan.
                {mealPlan.approved_at
                  ? ` Approved ${formatDate(
                      mealPlan.approved_at
                    )}.`
                  : ""}
              </p>
            </div>
          )}
        </div>
      )}

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
              updateField("calorie_target", value)
            }
          />

          <NumberField
            label="PROTEIN"
            value={form.protein_grams}
            placeholder="160"
            suffix="g"
            onChange={(value) =>
              updateField("protein_grams", value)
            }
          />

          <NumberField
            label="CARBOHYDRATES"
            value={form.carb_grams}
            placeholder="200"
            suffix="g"
            onChange={(value) =>
              updateField("carb_grams", value)
            }
          />

          <NumberField
            label="FAT"
            value={form.fat_grams}
            placeholder="65"
            suffix="g"
            onChange={(value) =>
              updateField("fat_grams", value)
            }
          />

          <NumberField
            label="WATER"
            value={form.water_ounces}
            placeholder="100"
            suffix="oz"
            onChange={(value) =>
              updateField("water_ounces", value)
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
          cursor: saving ? "not-allowed" : "pointer",
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

function MealCard({ meal }) {
  return (
    <div style={styles.mealCard}>
      <div style={styles.mealHeader}>
        <div>
          <span style={styles.mealType}>
            {String(
              meal.meal_type || "meal"
            ).toUpperCase()}
          </span>

          <h4 style={styles.mealName}>
            {meal.meal_name}
          </h4>
        </div>

        <div style={styles.mealMacros}>
          <span>
            {meal.target_calories ?? "—"} cal
          </span>

          <span>
            P {meal.target_protein_grams ?? "—"}g
          </span>

          <span>
            C {meal.target_carb_grams ?? "—"}g
          </span>

          <span>
            F {meal.target_fat_grams ?? "—"}g
          </span>
        </div>
      </div>

      {meal.foods?.length > 0 && (
        <div style={styles.foodList}>
          {meal.foods.map((food) => (
            <div
              key={food.id}
              style={styles.foodRow}
            >
              <div style={styles.foodMain}>
                <strong style={styles.foodName}>
                  {food.food_name}
                  {food.is_optional ? " (Optional)" : ""}
                </strong>

                <span style={styles.foodServing}>
                  {formatServing(food.serving_amount)}{" "}
                  {food.serving_unit || "serving"}
                </span>

                {food.preparation && (
                  <span style={styles.foodPreparation}>
                    {food.preparation}
                  </span>
                )}

                {food.notes && (
                  <span style={styles.foodNote}>
                    {food.notes}
                  </span>
                )}
              </div>

              <div style={styles.foodMacros}>
                <span>
                  {food.calories ?? 0} cal
                </span>

                <span>
                  P {formatMacro(food.protein_grams)}g
                </span>

                <span>
                  C {formatMacro(food.carb_grams)}g
                </span>

                <span>
                  F {formatMacro(food.fat_grams)}g
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {meal.instructions && (
        <div style={styles.instructions}>
          <strong style={styles.instructionsTitle}>
            PREPARATION
          </strong>

          <p style={styles.instructionsText}>
            {meal.instructions}
          </p>
        </div>
      )}

      {meal.notes && (
        <p style={styles.mealNotes}>
          {meal.notes}
        </p>
      )}
    </div>
  );
}

function MacroCard({
  label,
  value,
  suffix,
}) {
  return (
    <div style={styles.macroCard}>
      <span style={styles.smallLabel}>
        {label}
      </span>

      <strong style={styles.macroValue}>
        {value ?? "—"}
        <small style={styles.macroSuffix}>
          {" "}
          {suffix}
        </small>
      </strong>
    </div>
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

function formatServing(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value ?? "1";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatMacro(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(1);
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
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
    flexWrap: "wrap",
  },

  smallLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
    letterSpacing: "0.8px",
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

  approvedBadge: {
    color: "#050505",
    background: "#F4C20D",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },

  pendingBadge: {
    color: "#F4C20D",
    background: "#181400",
    border: "1px solid #F4C20D",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },

  inactiveBadge: {
    color: "#BDBDBD",
    background: "#050505",
    border: "1px solid #2A2A2A",
    padding: "7px 10px",
    borderRadius: "20px",
    fontSize: "8px",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },

  generatorCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    marginBottom: "15px",
  },

  generatorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },

  generatorText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    fontSize: "12px",
    maxWidth: "760px",
    margin: "0 0 18px",
  },

  generateButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "9px",
    padding: "15px",
    fontWeight: "900",
  },

  approvedHelp: {
    color: "#777777",
    fontSize: "11px",
    lineHeight: 1.5,
    margin: "12px 0 0",
  },

  loadingBox: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    color: "#BDBDBD",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "15px",
  },

  reviewCard: {
    background: "#0B0B0B",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    marginBottom: "15px",
  },

  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  reviewTitle: {
    color: "#FFFFFF",
    fontSize: "24px",
    margin: "7px 0",
  },

  reviewDescription: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    fontSize: "12px",
    maxWidth: "760px",
    margin: 0,
  },

  macroGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "10px",
    marginBottom: "18px",
  },

  macroCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "14px",
  },

  macroValue: {
    display: "block",
    color: "#FFFFFF",
    fontSize: "22px",
    marginTop: "5px",
  },

  macroSuffix: {
    color: "#777777",
    fontSize: "10px",
  },

  reviewNotice: {
    background: "#181400",
    border: "1px solid #5A4900",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "18px",
  },

  reviewNoticeTitle: {
    color: "#F4C20D",
    fontSize: "9px",
    letterSpacing: "0.8px",
  },

  reviewNoticeText: {
    color: "#D6D6D6",
    fontSize: "11px",
    lineHeight: 1.6,
    margin: "7px 0 0",
  },

  dayTabs: {
    display: "flex",
    gap: "7px",
    overflowX: "auto",
    paddingBottom: "8px",
    marginBottom: "15px",
  },

  dayButton: {
    flex: "0 0 auto",
    background: "#111111",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "10px 13px",
    fontSize: "9px",
    fontWeight: "900",
    cursor: "pointer",
  },

  dayButtonActive: {
    background: "#F4C20D",
    color: "#050505",
    borderColor: "#F4C20D",
  },

  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "12px",
  },

  dayTitle: {
    color: "#FFFFFF",
    fontSize: "22px",
    margin: "4px 0 0",
  },

  mealCount: {
    color: "#777777",
    fontSize: "10px",
    fontWeight: "800",
  },

  mealList: {
    display: "grid",
    gap: "12px",
  },

  mealCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "17px",
  },

  mealHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
    paddingBottom: "12px",
    borderBottom: "1px solid #222222",
  },

  mealType: {
    color: "#F4C20D",
    fontSize: "8px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  mealName: {
    color: "#FFFFFF",
    fontSize: "18px",
    margin: "4px 0 0",
  },

  mealMacros: {
    display: "flex",
    gap: "9px",
    flexWrap: "wrap",
    color: "#BDBDBD",
    fontSize: "9px",
    fontWeight: "800",
  },

  foodList: {
    display: "grid",
    gap: "0",
  },

  foodRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    padding: "13px 0",
    borderBottom: "1px solid #1E1E1E",
    flexWrap: "wrap",
  },

  foodMain: {
    display: "grid",
    gap: "3px",
    minWidth: "180px",
    flex: "1 1 260px",
  },

  foodName: {
    color: "#FFFFFF",
    fontSize: "12px",
  },

  foodServing: {
    color: "#F4C20D",
    fontSize: "10px",
    fontWeight: "800",
  },

  foodPreparation: {
    color: "#BDBDBD",
    fontSize: "10px",
  },

  foodNote: {
    color: "#777777",
    fontSize: "9px",
    fontStyle: "italic",
  },

  foodMacros: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    color: "#777777",
    fontSize: "9px",
  },

  instructions: {
    marginTop: "13px",
  },

  instructionsTitle: {
    color: "#F4C20D",
    fontSize: "8px",
    letterSpacing: "0.8px",
  },

  instructionsText: {
    color: "#BDBDBD",
    fontSize: "11px",
    lineHeight: 1.6,
    margin: "5px 0 0",
  },

  mealNotes: {
    color: "#777777",
    fontSize: "9px",
    lineHeight: 1.5,
    margin: "12px 0 0",
  },

  emptyMealState: {
    color: "#777777",
    border: "1px dashed #2A2A2A",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
  },

  approvalArea: {
    marginTop: "20px",
    background: "#111111",
    border: "1px solid #F4C20D",
    borderRadius: "12px",
    padding: "18px",
  },

  approvalTitle: {
    color: "#F4C20D",
    fontSize: "10px",
    letterSpacing: "0.8px",
  },

  approvalText: {
    color: "#BDBDBD",
    fontSize: "11px",
    lineHeight: 1.6,
    margin: "7px 0 15px",
  },

  approveButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "9px",
    padding: "15px",
    fontWeight: "900",
  },

  publishedBox: {
    marginTop: "20px",
    background: "#111111",
    border: "1px solid #F4C20D",
    borderRadius: "12px",
    padding: "16px",
  },

  publishedTitle: {
    color: "#F4C20D",
    fontSize: "10px",
  },

  publishedText: {
    color: "#BDBDBD",
    fontSize: "11px",
    margin: "6px 0 0",
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
    border: "1px solid #6A2A2A",
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
