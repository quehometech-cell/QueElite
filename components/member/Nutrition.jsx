"use client";

export default function Nutrition({ nutritionPlan }) {
  if (!nutritionPlan) {
    return (
      <section>
        <p style={styles.goldLabel}>NUTRITION</p>
        <h2 style={styles.title}>YOUR NUTRITION PLAN</h2>

        <div style={styles.emptyCard}>
          <h3 style={styles.cardTitle}>
            Nutrition Plan Not Assigned Yet
          </h3>

          <p style={styles.bodyText}>
            Your nutrition targets and coaching guidance will
            appear here after Que creates your plan.
          </p>
        </div>

        <NutritionNote />
      </section>
    );
  }

  return (
    <section>
      <p style={styles.goldLabel}>NUTRITION</p>

      <h2 style={styles.title}>YOUR NUTRITION PLAN</h2>

      <p style={styles.description}>
        Use these targets as your daily nutrition guide. Focus on
        consistency instead of trying to make every day perfect.
      </p>

      {nutritionPlan.nutrition_goal && (
        <div style={styles.goalCard}>
          <p style={styles.goldLabel}>CURRENT GOAL</p>

          <h3 style={styles.goalTitle}>
            {formatText(nutritionPlan.nutrition_goal)}
          </h3>
        </div>
      )}

      <div style={styles.targetGrid}>
        <Target
          value={nutritionPlan.calorie_target}
          unit=""
          label="CALORIES"
        />

        <Target
          value={nutritionPlan.protein_grams}
          unit="g"
          label="PROTEIN"
        />

        <Target
          value={nutritionPlan.carb_grams}
          unit="g"
          label="CARBS"
        />

        <Target
          value={nutritionPlan.fat_grams}
          unit="g"
          label="FATS"
        />

        <Target
          value={nutritionPlan.water_ounces}
          unit=" oz"
          label="WATER"
        />
      </div>

      {nutritionPlan.meal_guidance && (
        <div style={styles.sectionCard}>
          <p style={styles.goldLabel}>MEAL GUIDANCE</p>

          <h3 style={styles.cardTitle}>
            Build Your Day
          </h3>

          <p style={styles.bodyText}>
            {nutritionPlan.meal_guidance}
          </p>
        </div>
      )}

      {nutritionPlan.coach_notes && (
        <div style={styles.coachCard}>
          <p style={styles.goldLabel}>
            QUE&apos;S COACHING NOTES
          </p>

          <p style={styles.bodyText}>
            {nutritionPlan.coach_notes}
          </p>
        </div>
      )}

      <div style={styles.sectionCard}>
        <p style={styles.goldLabel}>DAILY FOUNDATION</p>

        <h3 style={styles.cardTitle}>
          Keep It Simple
        </h3>

        <div style={styles.foundationGrid}>
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

function Target({ value, unit, label }) {
  return (
    <div style={styles.targetCard}>
      <strong style={styles.targetValue}>
        {value !== null && value !== undefined
          ? `${value}${unit}`
          : "-"}
      </strong>

      <span style={styles.targetLabel}>
        {label}
      </span>
    </div>
  );
}

function Foundation({ number, title, text }) {
  return (
    <div style={styles.foundationCard}>
      <div style={styles.foundationNumber}>
        {number}
      </div>

      <div>
        <h4 style={styles.foundationTitle}>
          {title}
        </h4>

        <p style={styles.foundationText}>
          {text}
        </p>
      </div>
    </div>
  );
}

function NutritionNote() {
  return (
    <div style={styles.disclaimer}>
      <strong style={styles.disclaimerTitle}>
        NUTRITION COACHING NOTE
      </strong>

      <p style={styles.disclaimerText}>
        Nutrition information in your coaching portal is intended
        for general fitness and wellness education. It is not
        medical nutrition therapy or a substitute for care from a
        physician or registered dietitian when medical nutrition
        treatment is needed.
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
    marginBottom: "25px",
  },

  goalCard: {
    background: "#111111",
    border: "1px solid #F4C20D",
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
    border: "1px solid #2A2A2A",
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

  sectionCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "20px",
  },

  coachCard: {
    background: "#111111",
    borderLeft: "4px solid #F4C20D",
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
    border: "1px solid #2A2A2A",
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
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "25px",
    marginTop: "20px",
  },

  disclaimer: {
    background: "#0B0B0B",
    border: "1px solid #2A2A2A",
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
