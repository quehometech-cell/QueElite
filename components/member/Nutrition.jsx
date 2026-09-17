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
