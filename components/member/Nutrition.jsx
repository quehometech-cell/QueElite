"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../../lib/supabase";

export default function Nutrition({
  user,
  nutritionPlan,
  onNutritionChange,
}) {
  const [form, setForm] = useState({
    calories: "",
    protein_grams: "",
    carb_grams: "",
    fat_grams: "",
    water_ounces: "",
    notes: "",
  });

  const [todayLog, setTodayLog] =
    useState(null);

  const [weeklyLogs, setWeeklyLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [approvedMealPlan, setApprovedMealPlan] =
    useState(null);
  const [mealPlanMeals, setMealPlanMeals] =
    useState([]);
  const [mealPlanLoading, setMealPlanLoading] =
    useState(true);
  const [selectedMealDay, setSelectedMealDay] =
    useState(1);

  const today = useMemo(
    () => getLocalDateString(),
    []
  );

  const weekStart = useMemo(
    () => getLocalWeekStartString(),
    []
  );

  const loadNutritionLogs =
    useCallback(async () => {
      if (!user?.id) {
        setTodayLog(null);
        setWeeklyLogs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const { data, error } =
          await supabase
            .from("nutrition_logs")
            .select(
              "id, log_date, calories, protein_grams, carb_grams, fat_grams, water_ounces, notes, created_at, updated_at"
            )
            .eq("user_id", user.id)
            .gte("log_date", weekStart)
            .lte("log_date", today)
            .order("log_date", {
              ascending: false,
            });

        if (error) {
          throw error;
        }

        const logs = data || [];

        setWeeklyLogs(logs);

        const existingToday =
          logs.find(
            (log) =>
              log.log_date === today
          ) || null;

        setTodayLog(existingToday);

        if (existingToday) {
          setForm({
            calories:
              valueToInput(
                existingToday.calories
              ),
            protein_grams:
              valueToInput(
                existingToday.protein_grams
              ),
            carb_grams:
              valueToInput(
                existingToday.carb_grams
              ),
            fat_grams:
              valueToInput(
                existingToday.fat_grams
              ),
            water_ounces:
              valueToInput(
                existingToday.water_ounces
              ),
            notes:
              existingToday.notes || "",
          });
        } else {
          setForm({
            calories: "",
            protein_grams: "",
            carb_grams: "",
            fat_grams: "",
            water_ounces: "",
            notes: "",
          });
        }
      } catch (error) {
        console.error(
          "Nutrition log load error:",
          error
        );

        setMessage(
          error?.message ||
            "Unable to load your nutrition tracking."
        );
      } finally {
        setLoading(false);
      }
    }, [
      user?.id,
      today,
      weekStart,
    ]);

  useEffect(() => {
    loadNutritionLogs();
  }, [loadNutritionLogs]);

  const loadApprovedMealPlan =
    useCallback(async () => {
      if (!user?.id) {
        setApprovedMealPlan(null);
        setMealPlanMeals([]);
        setMealPlanLoading(false);
        return;
      }

      setMealPlanLoading(true);

      try {
        const { data: plan, error: planError } =
          await supabase
            .from("meal_plans")
            .select(
              "id, user_id, nutrition_plan_id, name, description, calorie_target, protein_grams, carb_grams, fat_grams, days_per_week, is_active, start_date, end_date, coach_notes, status, approved_at"
            )
            .eq("user_id", user.id)
            .eq("status", "approved")
            .eq("is_active", true)
            .order("approved_at", {
              ascending: false,
            })
            .limit(1)
            .maybeSingle();

        if (planError) {
          throw planError;
        }

        setApprovedMealPlan(plan || null);
        setSelectedMealDay(1);

        if (!plan?.id) {
          setMealPlanMeals([]);
          return;
        }

        const { data: meals, error: mealsError } =
          await supabase
            .from("meal_plan_meals")
            .select(
              "id, meal_plan_id, day_number, meal_order, meal_name, meal_type, instructions, notes, target_calories, target_protein_grams, target_carb_grams, target_fat_grams"
            )
            .eq("meal_plan_id", plan.id)
            .order("day_number", {
              ascending: true,
            })
            .order("meal_order", {
              ascending: true,
            });

        if (mealsError) {
          throw mealsError;
        }

        const mealRows = meals || [];

        if (!mealRows.length) {
          setMealPlanMeals([]);
          return;
        }

        const mealIds = mealRows.map(
          (meal) => meal.id
        );

        const { data: foods, error: foodsError } =
          await supabase
            .from("meal_plan_foods")
            .select(
              "id, meal_plan_meal_id, food_order, food_name, serving_amount, serving_unit, calories, protein_grams, carb_grams, fat_grams, preparation, notes, is_optional"
            )
            .in("meal_plan_meal_id", mealIds)
            .order("food_order", {
              ascending: true,
            });

        if (foodsError) {
          throw foodsError;
        }

        const foodsByMeal = new Map();

        for (const food of foods || []) {
          const key = String(
            food.meal_plan_meal_id
          );

          if (!foodsByMeal.has(key)) {
            foodsByMeal.set(key, []);
          }

          foodsByMeal.get(key).push(food);
        }

        setMealPlanMeals(
          mealRows.map((meal) => ({
            ...meal,
            foods:
              foodsByMeal.get(
                String(meal.id)
              ) || [],
          }))
        );
      } catch (error) {
        console.error(
          "Approved meal plan load error:",
          error
        );

        setApprovedMealPlan(null);
        setMealPlanMeals([]);
      } finally {
        setMealPlanLoading(false);
      }
    }, [user?.id]);

  useEffect(() => {
    loadApprovedMealPlan();
  }, [loadApprovedMealPlan]);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function numberOrNull(value) {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const number = Number(value);

    if (
      !Number.isFinite(number) ||
      number < 0
    ) {
      return null;
    }

    return Math.round(number);
  }

  async function saveToday(event) {
    event.preventDefault();

    if (!user?.id) {
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      user_id: user.id,
      log_date: today,
      calories:
        numberOrNull(
          form.calories
        ),
      protein_grams:
        numberOrNull(
          form.protein_grams
        ),
      carb_grams:
        numberOrNull(
          form.carb_grams
        ),
      fat_grams:
        numberOrNull(
          form.fat_grams
        ),
      water_ounces:
        numberOrNull(
          form.water_ounces
        ),
      notes:
        form.notes.trim() || null,
    };

    try {
      let result;

      if (todayLog?.id) {
        result = await supabase
          .from("nutrition_logs")
          .update({
            calories:
              payload.calories,
            protein_grams:
              payload.protein_grams,
            carb_grams:
              payload.carb_grams,
            fat_grams:
              payload.fat_grams,
            water_ounces:
              payload.water_ounces,
            notes:
              payload.notes,
          })
          .eq("id", todayLog.id)
          .eq("user_id", user.id)
          .select(
            "id, log_date, calories, protein_grams, carb_grams, fat_grams, water_ounces, notes, created_at, updated_at"
          )
          .single();
      } else {
        result = await supabase
          .from("nutrition_logs")
          .insert(payload)
          .select(
            "id, log_date, calories, protein_grams, carb_grams, fat_grams, water_ounces, notes, created_at, updated_at"
          )
          .single();
      }

      if (result.error) {
        if (
          result.error.code ===
          "23505"
        ) {
          await loadNutritionLogs();

          setMessage(
            "Today's nutrition log already exists. It has been reloaded."
          );

          return;
        }

        throw result.error;
      }

      setTodayLog(result.data);

      setWeeklyLogs(
        (current) => {
          const withoutToday =
            current.filter(
              (log) =>
                log.log_date !== today
            );

          return [
            result.data,
            ...withoutToday,
          ].sort((a, b) =>
            b.log_date.localeCompare(
              a.log_date
            )
          );
        }
      );

      setMessage(
        todayLog
          ? "Today's nutrition log updated."
          : "Today's nutrition log saved."
      );

      if (onNutritionChange) {
        await onNutritionChange();
      }
    } catch (error) {
      console.error(
        "Nutrition save error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to save today's nutrition."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!nutritionPlan) {
    return (
      <section>
        <p style={styles.goldLabel}>
          NUTRITION
        </p>

        <h2 style={styles.title}>
          YOUR NUTRITION PLAN
        </h2>

        <div style={styles.emptyCard}>
          <h3 style={styles.cardTitle}>
            Nutrition Plan Not
            Assigned Yet
          </h3>

          <p style={styles.bodyText}>
            Your nutrition targets and
            coaching guidance will appear
            here after Que creates your
            plan.
          </p>
        </div>

        <NutritionNote />
      </section>
    );
  }

  const targets = {
    calories:
      nutritionPlan.calorie_target,
    protein_grams:
      nutritionPlan.protein_grams,
    carb_grams:
      nutritionPlan.carb_grams,
    fat_grams:
      nutritionPlan.fat_grams,
    water_ounces:
      nutritionPlan.water_ounces,
  };

  const loggedDays =
    new Set(
      weeklyLogs.map(
        (log) => log.log_date
      )
    ).size;

  const selectedMealPlanMeals =
    mealPlanMeals.filter(
      (meal) =>
        Number(meal.day_number) ===
        Number(selectedMealDay)
    );

  return (
    <section>
      <p style={styles.goldLabel}>
        NUTRITION
      </p>

      <h2 style={styles.title}>
        YOUR NUTRITION PLAN
      </h2>

      <p style={styles.description}>
        Use these targets as your
        daily nutrition guide. Track
        what you actually consume so
        you and Que can see your
        consistency over time.
      </p>

      {nutritionPlan.nutrition_goal && (
        <div style={styles.goalCard}>
          <p style={styles.goldLabel}>
            CURRENT GOAL
          </p>

          <h3 style={styles.goalTitle}>
            {formatText(
              nutritionPlan.nutrition_goal
            )}
          </h3>
        </div>
      )}

      <div style={styles.targetGrid}>
        <Target
          value={
            nutritionPlan.calorie_target
          }
          unit=""
          label="CALORIES"
        />

        <Target
          value={
            nutritionPlan.protein_grams
          }
          unit="g"
          label="PROTEIN"
        />

        <Target
          value={
            nutritionPlan.carb_grams
          }
          unit="g"
          label="CARBS"
        />

        <Target
          value={
            nutritionPlan.fat_grams
          }
          unit="g"
          label="FATS"
        />

        <Target
          value={
            nutritionPlan.water_ounces
          }
          unit=" oz"
          label="WATER"
        />
      </div>

      <div style={styles.mealPlanCard}>
        <div style={styles.mealPlanHeader}>
          <div>
            <p style={styles.goldLabel}>
              YOUR CUSTOM MEAL PLAN
            </p>

            <h3 style={styles.cardTitle}>
              {approvedMealPlan?.name ||
                "7-Day Meal Plan"}
            </h3>

            <p style={styles.bodyText}>
              {approvedMealPlan?.description ||
                "Your coach-approved meals, portions, and daily nutrition structure."}
            </p>
          </div>

          {approvedMealPlan && (
            <span style={styles.approvedMealBadge}>
              ✓ COACH APPROVED
            </span>
          )}
        </div>

        {mealPlanLoading ? (
          <div style={styles.loadingBox}>
            Loading your meal plan...
          </div>
        ) : !approvedMealPlan ? (
          <div style={styles.mealPlanEmpty}>
            Your custom meal plan has not been
            published yet. Once Que approves it,
            it will appear here automatically.
          </div>
        ) : (
          <>
            <div style={styles.mealPlanTargets}>
              <MealPlanTarget
                label="CALORIES"
                value={
                  approvedMealPlan.calorie_target
                }
                unit=""
              />

              <MealPlanTarget
                label="PROTEIN"
                value={
                  approvedMealPlan.protein_grams
                }
                unit="g"
              />

              <MealPlanTarget
                label="CARBS"
                value={
                  approvedMealPlan.carb_grams
                }
                unit="g"
              />

              <MealPlanTarget
                label="FATS"
                value={
                  approvedMealPlan.fat_grams
                }
                unit="g"
              />
            </div>

            <div style={styles.mealDayTabs}>
              {Array.from(
                {
                  length: Number(
                    approvedMealPlan.days_per_week ||
                      7
                  ),
                },
                (_, index) => index + 1
              ).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setSelectedMealDay(day)
                  }
                  style={{
                    ...styles.mealDayButton,
                    ...(selectedMealDay === day
                      ? styles.mealDayButtonActive
                      : {}),
                  }}
                >
                  DAY {day}
                </button>
              ))}
            </div>

            <div style={styles.selectedDayHeader}>
              <div>
                <span style={styles.smallText}>
                  DAILY MEALS
                </span>

                <h4 style={styles.selectedDayTitle}>
                  Day {selectedMealDay}
                </h4>
              </div>

              <span style={styles.mealCountBadge}>
                {selectedMealPlanMeals.length}{" "}
                {selectedMealPlanMeals.length === 1
                  ? "MEAL"
                  : "MEALS"}
              </span>
            </div>

            {selectedMealPlanMeals.length ===
            0 ? (
              <div style={styles.mealPlanEmpty}>
                No meals are assigned for this
                day.
              </div>
            ) : (
              <div style={styles.mealPlanList}>
                {selectedMealPlanMeals.map(
                  (meal) => (
                    <ClientMealCard
                      key={meal.id}
                      meal={meal}
                    />
                  )
                )}
              </div>
            )}

            {approvedMealPlan.coach_notes && (
              <div style={styles.mealCoachNote}>
                <strong
                  style={
                    styles.mealCoachNoteTitle
                  }
                >
                  COACH NOTE
                </strong>

                <p
                  style={
                    styles.mealCoachNoteText
                  }
                >
                  {
                    approvedMealPlan.coach_notes
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.trackerCard}>
        <div style={styles.trackerHeader}>
          <div>
            <p style={styles.goldLabel}>
              DAILY TRACKER
            </p>

            <h3 style={styles.cardTitle}>
              Today&apos;s Nutrition
            </h3>

            <p style={styles.smallText}>
              {formatDisplayDate(
                today
              )}
            </p>
          </div>

          <div style={styles.loggedBadge}>
            {todayLog
              ? "✓ SAVED TODAY"
              : `${loggedDays}/7 DAYS LOGGED`}
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>
            Loading today&apos;s
            nutrition...
          </div>
        ) : (
          <form onSubmit={saveToday}>
            <div
              style={
                styles.trackerGrid
              }
            >
              <NutritionInput
                label="CALORIES"
                name="calories"
                value={form.calories}
                target={
                  targets.calories
                }
                unit=""
                onChange={
                  handleChange
                }
              />

              <NutritionInput
                label="PROTEIN"
                name="protein_grams"
                value={
                  form.protein_grams
                }
                target={
                  targets.protein_grams
                }
                unit="g"
                onChange={
                  handleChange
                }
              />

              <NutritionInput
                label="CARBS"
                name="carb_grams"
                value={
                  form.carb_grams
                }
                target={
                  targets.carb_grams
                }
                unit="g"
                onChange={
                  handleChange
                }
              />

              <NutritionInput
                label="FATS"
                name="fat_grams"
                value={
                  form.fat_grams
                }
                target={
                  targets.fat_grams
                }
                unit="g"
                onChange={
                  handleChange
                }
              />

              <NutritionInput
                label="WATER"
                name="water_ounces"
                value={
                  form.water_ounces
                }
                target={
                  targets.water_ounces
                }
                unit="oz"
                onChange={
                  handleChange
                }
              />
            </div>

            <label style={styles.label}>
              DAILY NOTES

              <textarea
                name="notes"
                value={form.notes}
                onChange={
                  handleChange
                }
                rows={3}
                placeholder="Optional: meals, hunger, energy, eating out, anything Que should know..."
                style={styles.textarea}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              style={
                saving
                  ? styles.disabledButton
                  : styles.saveButton
              }
            >
              {saving
                ? "SAVING..."
                : todayLog
                ? "UPDATE TODAY'S NUTRITION"
                : "SAVE TODAY'S NUTRITION"}
            </button>

            {message && (
              <div
                style={styles.message}
              >
                {message}
              </div>
            )}
          </form>
        )}
      </div>

      <div style={styles.weekCard}>
        <div style={styles.weekHeader}>
          <div>
            <p style={styles.goldLabel}>
              THIS WEEK
            </p>

            <h3 style={styles.cardTitle}>
              Nutrition Consistency
            </h3>
          </div>

          <strong
            style={styles.weekScore}
          >
            {loggedDays}/7
          </strong>
        </div>

        <div style={styles.dayGrid}>
          {getWeekDates().map(
            (date) => {
              const log =
                weeklyLogs.find(
                  (item) =>
                    item.log_date ===
                    date
                );

              return (
                <DayStatus
                  key={date}
                  date={date}
                  complete={
                    Boolean(log)
                  }
                  today={
                    date === today
                  }
                />
              );
            }
          )}
        </div>
      </div>

      {todayLog && (
        <div style={styles.progressCard}>
          <p style={styles.goldLabel}>
            TODAY VS TARGET
          </p>

          <h3 style={styles.cardTitle}>
            Daily Progress
          </h3>

          <ProgressRow
            label="Calories"
            actual={
              todayLog.calories
            }
            target={
              targets.calories
            }
            unit=""
          />

          <ProgressRow
            label="Protein"
            actual={
              todayLog.protein_grams
            }
            target={
              targets.protein_grams
            }
            unit="g"
          />

          <ProgressRow
            label="Carbs"
            actual={
              todayLog.carb_grams
            }
            target={
              targets.carb_grams
            }
            unit="g"
          />

          <ProgressRow
            label="Fats"
            actual={
              todayLog.fat_grams
            }
            target={
              targets.fat_grams
            }
            unit="g"
          />

          <ProgressRow
            label="Water"
            actual={
              todayLog.water_ounces
            }
            target={
              targets.water_ounces
            }
            unit=" oz"
          />
        </div>
      )}

      {nutritionPlan.meal_guidance && (
        <div style={styles.sectionCard}>
          <p style={styles.goldLabel}>
            MEAL GUIDANCE
          </p>

          <h3 style={styles.cardTitle}>
            Build Your Day
          </h3>

          <p style={styles.bodyText}>
            {
              nutritionPlan.meal_guidance
            }
          </p>
        </div>
      )}

      {nutritionPlan.coach_notes && (
        <div style={styles.coachCard}>
          <p style={styles.goldLabel}>
            QUE&apos;S COACHING NOTES
          </p>

          <p style={styles.bodyText}>
            {
              nutritionPlan.coach_notes
            }
          </p>
        </div>
      )}

      <div style={styles.sectionCard}>
        <p style={styles.goldLabel}>
          DAILY FOUNDATION
        </p>

        <h3 style={styles.cardTitle}>
          Keep It Simple
        </h3>

        <div
          style={
            styles.foundationGrid
          }
        >
          <Foundation
            number="01"
            title="Protein"
            text="Build meals around a quality protein source."
          />

          <Foundation
            number="02"
            title="Produce"
            text="Include fruits or vegetables throughout your day."
          />

          <Foundation
            number="03"
            title="Carbohydrates"
            text="Use carbohydrates to support training, activity, and recovery."
          />

          <Foundation
            number="04"
            title="Healthy Fats"
            text="Include reasonable portions of nutrient-dense fat sources."
          />

          <Foundation
            number="05"
            title="Hydration"
            text="Work toward your daily water target consistently."
          />

          <Foundation
            number="06"
            title="Consistency"
            text="Focus on habits you can repeat instead of chasing perfection."
          />
        </div>
      </div>

      <NutritionNote />
    </section>
  );
}

function ClientMealCard({ meal }) {
  return (
    <div style={styles.clientMealCard}>
      <div style={styles.clientMealHeader}>
        <div>
          <span style={styles.clientMealType}>
            {formatText(
              meal.meal_type || "meal"
            ).toUpperCase()}
          </span>

          <h4 style={styles.clientMealName}>
            {meal.meal_name}
          </h4>
        </div>

        <div style={styles.clientMealMacros}>
          <span>
            {meal.target_calories ?? "-"} cal
          </span>
          <span>
            P {meal.target_protein_grams ?? "-"}g
          </span>
          <span>
            C {meal.target_carb_grams ?? "-"}g
          </span>
          <span>
            F {meal.target_fat_grams ?? "-"}g
          </span>
        </div>
      </div>

      <div style={styles.clientFoodList}>
        {(meal.foods || []).map((food) => (
          <div
            key={food.id}
            style={styles.clientFoodRow}
          >
            <div style={styles.clientFoodMain}>
              <strong
                style={styles.clientFoodName}
              >
                {food.food_name}
                {food.is_optional
                  ? " (Optional)"
                  : ""}
              </strong>

              <span
                style={styles.clientFoodServing}
              >
                {formatServingAmount(
                  food.serving_amount
                )}{" "}
                {food.serving_unit ||
                  "serving"}
              </span>

              {food.preparation && (
                <span
                  style={
                    styles.clientFoodDetail
                  }
                >
                  {food.preparation}
                </span>
              )}

              {food.notes && (
                <span
                  style={
                    styles.clientFoodDetail
                  }
                >
                  {food.notes}
                </span>
              )}
            </div>

            <div
              style={styles.clientFoodMacros}
            >
              <span>
                {food.calories ?? 0} cal
              </span>
              <span>
                P{" "}
                {formatMealMacro(
                  food.protein_grams
                )}
                g
              </span>
              <span>
                C{" "}
                {formatMealMacro(
                  food.carb_grams
                )}
                g
              </span>
              <span>
                F{" "}
                {formatMealMacro(
                  food.fat_grams
                )}
                g
              </span>
            </div>
          </div>
        ))}
      </div>

      {meal.instructions && (
        <div style={styles.mealInstructions}>
          <strong
            style={styles.mealInstructionsTitle}
          >
            PREPARATION
          </strong>

          <p
            style={styles.mealInstructionsText}
          >
            {meal.instructions}
          </p>
        </div>
      )}

      {meal.notes && (
        <p style={styles.clientMealNotes}>
          {meal.notes}
        </p>
      )}
    </div>
  );
}

function MealPlanTarget({
  label,
  value,
  unit,
}) {
  return (
    <div style={styles.mealPlanTargetCard}>
      <span style={styles.smallText}>
        {label}
      </span>

      <strong
        style={styles.mealPlanTargetValue}
      >
        {value !== null &&
        value !== undefined
          ? `${value}${unit}`
          : "-"}
      </strong>
    </div>
  );
}

function formatServingAmount(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value ?? "1";
  }

  if (Number.isInteger(number)) {
    return String(number);
  }

  return number
    .toFixed(2)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

function formatMealMacro(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(1);
}

function NutritionInput({
  label,
  name,
  value,
  target,
  unit,
  onChange,
}) {
  const numericValue =
    value === ""
      ? null
      : Number(value);

  const numericTarget =
    target === null ||
    target === undefined
      ? null
      : Number(target);

  const percent =
    numericValue !== null &&
    Number.isFinite(
      numericValue
    ) &&
    numericTarget &&
    numericTarget > 0
      ? Math.min(
          (numericValue /
            numericTarget) *
            100,
          100
        )
      : 0;

  return (
    <label style={styles.inputCard}>
      <div style={styles.inputTop}>
        <span style={styles.inputLabel}>
          {label}
        </span>

        <span
          style={styles.inputTarget}
        >
          Target:{" "}
          {target !== null &&
          target !== undefined
            ? `${target}${unit}`
            : "-"}
        </span>
      </div>

      <div style={styles.inputWrap}>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min="0"
          step="1"
          inputMode="numeric"
          placeholder="0"
          style={styles.input}
        />

        {unit && (
          <span style={styles.unit}>
            {unit}
          </span>
        )}
      </div>

      <div
        style={
          styles.progressBackground
        }
      >
        <div
          style={{
            ...styles.progressFill,
            width: `${percent}%`,
          }}
        />
      </div>
    </label>
  );
}

function ProgressRow({
  label,
  actual,
  target,
  unit,
}) {
  const actualNumber =
    Number(actual || 0);

  const targetNumber =
    Number(target || 0);

  const percent =
    targetNumber > 0
      ? Math.min(
          (actualNumber /
            targetNumber) *
            100,
          100
        )
      : 0;

  return (
    <div style={styles.progressRow}>
      <div
        style={
          styles.progressRowHeader
        }
      >
        <strong
          style={
            styles.progressRowLabel
          }
        >
          {label}
        </strong>

        <span
          style={
            styles.progressRowValue
          }
        >
          {actual !== null &&
          actual !== undefined
            ? actual
            : "-"}
          {actual !== null &&
          actual !== undefined
            ? unit
            : ""}

          {" / "}

          {target !== null &&
          target !== undefined
            ? `${target}${unit}`
            : "-"}
        </span>
      </div>

      <div
        style={
          styles.progressBackground
        }
      >
        <div
          style={{
            ...styles.progressFill,
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}

function DayStatus({
  date,
  complete,
  today,
}) {
  const parsed =
    parseLocalDate(date);

  const label =
    parsed.toLocaleDateString(
      undefined,
      {
        weekday: "short",
      }
    );

  return (
    <div
      style={{
        ...styles.dayCard,
        border: today
          ? "1px solid #F4C20D"
          : "1px solid #2A2A2A",
      }}
    >
      <span style={styles.dayName}>
        {label}
      </span>

      <strong
        style={{
          ...styles.dayMark,
          color: complete
            ? "#F4C20D"
            : "#666666",
        }}
      >
        {complete ? "✓" : "—"}
      </strong>
    </div>
  );
}

function Target({
  value,
  unit,
  label,
}) {
  return (
    <div style={styles.targetCard}>
      <strong
        style={styles.targetValue}
      >
        {value !== null &&
        value !== undefined
          ? `${value}${unit}`
          : "-"}
      </strong>

      <span
        style={styles.targetLabel}
      >
        {label}
      </span>
    </div>
  );
}

function Foundation({
  number,
  title,
  text,
}) {
  return (
    <div
      style={
        styles.foundationCard
      }
    >
      <div
        style={
          styles.foundationNumber
        }
      >
        {number}
      </div>

      <div>
        <h4
          style={
            styles.foundationTitle
          }
        >
          {title}
        </h4>

        <p
          style={
            styles.foundationText
          }
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function NutritionNote() {
  return (
    <div style={styles.disclaimer}>
      <strong
        style={
          styles.disclaimerTitle
        }
      >
        NUTRITION COACHING NOTE
      </strong>

      <p
        style={
          styles.disclaimerText
        }
      >
        Nutrition information in your
        coaching portal is intended for
        general fitness and wellness
        education. It is not medical
        nutrition therapy or a
        substitute for care from a
        physician or registered
        dietitian when medical
        nutrition treatment is needed.
      </p>
    </div>
  );
}

function formatText(value) {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function valueToInput(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}

function padNumber(value) {
  return String(value).padStart(
    2,
    "0"
  );
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${padNumber(
    date.getMonth() + 1
  )}-${padNumber(date.getDate())}`;
}

function getLocalDateString() {
  return formatLocalDate(
    new Date()
  );
}

function getLocalWeekStartString() {
  const now = new Date();

  const day = now.getDay();

  const difference =
    now.getDate() -
    day +
    (day === 0 ? -6 : 1);

  const monday = new Date(now);

  monday.setDate(difference);
  monday.setHours(0, 0, 0, 0);

  return formatLocalDate(monday);
}

function getWeekDates() {
  const start =
    parseLocalDate(
      getLocalWeekStartString()
    );

  return Array.from(
    { length: 7 },
    (_, index) => {
      const date =
        new Date(start);

      date.setDate(
        start.getDate() + index
      );

      return formatLocalDate(
        date
      );
    }
  );
}

function parseLocalDate(value) {
  const [year, month, day] =
    value
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

function formatDisplayDate(value) {
  return parseLocalDate(
    value
  ).toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
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
    fontSize:
      "clamp(32px, 6vw, 52px)",
    margin: "8px 0 10px",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "800px",
    marginBottom: "25px",
  },

  goalCard: {
    background: "#111111",
    border:
      "1px solid #F4C20D",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "20px",
  },

  goalTitle: {
    color: "#FFFFFF",
    fontSize: "25px",
    margin: "7px 0 0",
  },

  targetGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "25px",
  },

  targetCard: {
    background: "#111111",
    border:
      "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  targetValue: {
    color: "#F4C20D",
    fontSize: "30px",
  },

  targetLabel: {
    color: "#BDBDBD",
    fontSize: "10px",
    marginTop: "5px",
    fontWeight: "800",
  },

  mealPlanCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
  },

  mealPlanHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  approvedMealBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "9px",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },

  mealPlanTargets: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "10px",
    marginBottom: "18px",
  },

  mealPlanTargetCard: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "14px",
  },

  mealPlanTargetValue: {
    display: "block",
    color: "#F4C20D",
    fontSize: "21px",
    marginTop: "5px",
  },

  mealDayTabs: {
    display: "flex",
    gap: "7px",
    overflowX: "auto",
    paddingBottom: "8px",
    marginBottom: "15px",
  },

  mealDayButton: {
    flex: "0 0 auto",
    background: "#050505",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "10px 13px",
    fontSize: "9px",
    fontWeight: "900",
    cursor: "pointer",
  },

  mealDayButtonActive: {
    background: "#F4C20D",
    color: "#050505",
    borderColor: "#F4C20D",
  },

  selectedDayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  selectedDayTitle: {
    color: "#FFFFFF",
    fontSize: "22px",
    margin: "4px 0 0",
  },

  mealCountBadge: {
    color: "#BDBDBD",
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "9px",
    fontWeight: "900",
  },

  mealPlanList: {
    display: "grid",
    gap: "12px",
  },

  clientMealCard: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "17px",
  },

  clientMealHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
    paddingBottom: "12px",
    borderBottom: "1px solid #222222",
  },

  clientMealType: {
    color: "#F4C20D",
    fontSize: "8px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  clientMealName: {
    color: "#FFFFFF",
    fontSize: "18px",
    margin: "4px 0 0",
  },

  clientMealMacros: {
    display: "flex",
    gap: "9px",
    flexWrap: "wrap",
    color: "#BDBDBD",
    fontSize: "9px",
    fontWeight: "800",
  },

  clientFoodList: {
    display: "grid",
  },

  clientFoodRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    padding: "13px 0",
    borderBottom: "1px solid #1E1E1E",
    flexWrap: "wrap",
  },

  clientFoodMain: {
    display: "grid",
    gap: "3px",
    minWidth: "180px",
    flex: "1 1 260px",
  },

  clientFoodName: {
    color: "#FFFFFF",
    fontSize: "12px",
  },

  clientFoodServing: {
    color: "#F4C20D",
    fontSize: "10px",
    fontWeight: "800",
  },

  clientFoodDetail: {
    color: "#888888",
    fontSize: "10px",
  },

  clientFoodMacros: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    color: "#888888",
    fontSize: "9px",
  },

  mealInstructions: {
    marginTop: "13px",
  },

  mealInstructionsTitle: {
    color: "#F4C20D",
    fontSize: "8px",
    letterSpacing: "0.8px",
  },

  mealInstructionsText: {
    color: "#BDBDBD",
    fontSize: "11px",
    lineHeight: 1.6,
    margin: "5px 0 0",
  },

  clientMealNotes: {
    color: "#888888",
    fontSize: "10px",
    lineHeight: 1.5,
    margin: "12px 0 0",
  },

  mealPlanEmpty: {
    background: "#050505",
    color: "#888888",
    border: "1px dashed #2A2A2A",
    borderRadius: "10px",
    padding: "18px",
    lineHeight: 1.6,
    fontSize: "12px",
  },

  mealCoachNote: {
    marginTop: "16px",
    borderLeft: "3px solid #F4C20D",
    background: "#0B0B0B",
    padding: "14px",
  },

  mealCoachNoteTitle: {
    color: "#F4C20D",
    fontSize: "9px",
    letterSpacing: "0.8px",
  },

  mealCoachNoteText: {
    color: "#BDBDBD",
    fontSize: "11px",
    lineHeight: 1.6,
    margin: "6px 0 0",
    whiteSpace: "pre-line",
  },

  trackerCard: {
    background: "#111111",
    border:
      "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
  },

  trackerHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  loggedBadge: {
    background: "#050505",
    border:
      "1px solid #F4C20D",
    borderRadius: "999px",
    padding: "8px 12px",
    color: "#F4C20D",
    fontSize: "10px",
    fontWeight: "900",
  },

  smallText: {
    color: "#888888",
    fontSize: "12px",
    margin: "-5px 0 0",
  },

  trackerGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
  },

  inputCard: {
    background: "#050505",
    border:
      "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "15px",
    display: "block",
  },

  inputTop: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "8px",
    marginBottom: "10px",
  },

  inputLabel: {
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "900",
  },

  inputTarget: {
    color: "#888888",
    fontSize: "10px",
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    border:
      "1px solid #2A2A2A",
    borderRadius: "8px",
    overflow: "hidden",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#111111",
    color: "#FFFFFF",
    border: "none",
    outline: "none",
    padding: "13px",
    fontSize: "16px",
  },

  unit: {
    color: "#F4C20D",
    padding: "0 12px",
    fontWeight: "900",
    fontSize: "12px",
  },

  progressBackground: {
    height: "7px",
    background: "#2A2A2A",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "12px",
  },

  progressFill: {
    height: "100%",
    background: "#F4C20D",
    borderRadius: "20px",
    transition:
      "width 0.25s ease",
  },

  label: {
    color: "#BDBDBD",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginTop: "18px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border:
      "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },

  saveButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "10px",
    padding: "15px",
    fontWeight: "900",
    cursor: "pointer",
    marginTop: "18px",
  },

  disabledButton: {
    width: "100%",
    background: "#2A2A2A",
    color: "#777777",
    border: "none",
    borderRadius: "10px",
    padding: "15px",
    fontWeight: "900",
    marginTop: "18px",
  },

  message: {
    color: "#F4C20D",
    border:
      "1px solid #F4C20D",
    borderRadius: "9px",
    padding: "12px",
    marginTop: "15px",
    fontWeight: "700",
  },

  loadingBox: {
    background: "#050505",
    color: "#BDBDBD",
    borderRadius: "10px",
    padding: "20px",
  },

  weekCard: {
    background: "#111111",
    border:
      "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    marginBottom: "20px",
  },

  weekHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
  },

  weekScore: {
    color: "#F4C20D",
    fontSize: "28px",
  },

  dayGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(7, minmax(55px, 1fr))",
    gap: "7px",
    marginTop: "15px",
    overflowX: "auto",
  },

  dayCard: {
    background: "#050505",
    border:
      "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "10px 5px",
    textAlign: "center",
    minWidth: "48px",
  },

  dayName: {
    display: "block",
    color: "#BDBDBD",
    fontSize: "9px",
    fontWeight: "800",
  },

  dayMark: {
    display: "block",
    marginTop: "5px",
    fontSize: "17px",
  },

  progressCard: {
    background: "#111111",
    border:
      "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    marginBottom: "20px",
  },

  progressRow: {
    marginTop: "17px",
  },

  progressRowHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "15px",
  },

  progressRowLabel: {
    color: "#FFFFFF",
    fontSize: "13px",
  },

  progressRowValue: {
    color: "#BDBDBD",
    fontSize: "12px",
  },

  sectionCard: {
    background: "#111111",
    border:
      "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "20px",
  },

  coachCard: {
    background: "#111111",
    borderLeft:
      "4px solid #F4C20D",
    borderRadius: "8px",
    padding: "22px",
    marginBottom: "20px",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "23px",
    margin: "7px 0 12px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.7,
    whiteSpace: "pre-line",
  },

  foundationGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },

  foundationCard: {
    background: "#050505",
    border:
      "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    gap: "13px",
  },

  foundationNumber: {
    color: "#F4C20D",
    fontWeight: "900",
    fontSize: "12px",
  },

  foundationTitle: {
    color: "#FFFFFF",
    margin: "0 0 5px",
    fontSize: "16px",
  },

  foundationText: {
    color: "#BDBDBD",
    margin: 0,
    lineHeight: 1.5,
    fontSize: "13px",
  },

  emptyCard: {
    background: "#111111",
    border:
      "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "25px",
    marginTop: "20px",
  },

  disclaimer: {
    background: "#0B0B0B",
    border:
      "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "18px",
    marginTop: "25px",
  },

  disclaimerTitle: {
    color: "#F4C20D",
    fontSize: "10px",
    letterSpacing: "1px",
  },

  disclaimerText: {
    color: "#888888",
    fontSize: "12px",
    lineHeight: 1.5,
    marginBottom: 0,
  },
};
