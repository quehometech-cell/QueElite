"use client";

import { useMemo, useState } from "react";

export default function ExerciseLibrary({
  exercises = [],
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const values = exercises
      .map((exercise) => exercise.category)
      .filter(Boolean);

    return [
      "all",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return exercises.filter((exercise) => {
      const matchesCategory =
        category === "all" ||
        exercise.category === category;

      const searchableText = [
        exercise.name,
        exercise.category,
        exercise.equipment,
        exercise.difficulty,
        exercise.muscle_group,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }, [exercises, search, category]);

  return (
    <section>
      <p style={styles.goldLabel}>
        EXERCISE LIBRARY
      </p>

      <h2 style={styles.title}>
        LEARN THE MOVEMENTS
      </h2>

      <p style={styles.description}>
        Search your exercise library for movement
        instructions, equipment information, muscle groups,
        and demonstration videos when available.
      </p>

      <div style={styles.searchCard}>
        <label style={styles.label}>
          SEARCH EXERCISES

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search squat, dumbbell, core..."
            style={styles.searchInput}
          />
        </label>

        <div style={styles.categoryArea}>
          <span style={styles.filterLabel}>
            FILTER BY CATEGORY
          </span>

          <div style={styles.categoryButtons}>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                style={
                  category === item
                    ? styles.activeCategory
                    : styles.categoryButton
                }
              >
                {item === "all"
                  ? "ALL"
                  : formatText(item).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.resultHeader}>
        <h3 style={styles.resultTitle}>
          {category === "all"
            ? "All Exercises"
            : formatText(category)}
        </h3>

        <span style={styles.resultCount}>
          {filteredExercises.length}{" "}
          {filteredExercises.length === 1
            ? "EXERCISE"
            : "EXERCISES"}
        </span>
      </div>

      {filteredExercises.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>
            No Exercises Found
          </h3>

          <p style={styles.bodyText}>
            Try a different search or category.
          </p>
        </div>
      ) : (
        <div style={styles.exerciseGrid}>
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ExerciseCard({ exercise }) {
  return (
    <article style={styles.exerciseCard}>
      <div style={styles.cardTop}>
        <div style={styles.exerciseIcon}>
          GCR
        </div>

        <div style={styles.exerciseHeading}>
          <h3 style={styles.exerciseName}>
            {exercise.name}
          </h3>

          <div style={styles.tags}>
            {exercise.category && (
              <Tag value={exercise.category} />
            )}

            {exercise.muscle_group && (
              <Tag value={exercise.muscle_group} />
            )}

            {exercise.equipment && (
              <Tag value={exercise.equipment} />
            )}

            {exercise.difficulty && (
              <Tag value={exercise.difficulty} />
            )}
          </div>
        </div>
      </div>

      {exercise.instructions ? (
        <div style={styles.instructions}>
          <strong style={styles.smallHeading}>
            HOW TO
          </strong>

          <p style={styles.bodyText}>
            {exercise.instructions}
          </p>
        </div>
      ) : (
        <div style={styles.instructions}>
          <strong style={styles.smallHeading}>
            INSTRUCTIONS
          </strong>

          <p style={styles.mutedText}>
            Exercise instructions will be added here.
          </p>
        </div>
      )}

      {exercise.video_url ? (
        <a
          href={exercise.video_url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.videoButton}
        >
          WATCH DEMONSTRATION
        </a>
      ) : (
        <div style={styles.videoUnavailable}>
          VIDEO COMING SOON
        </div>
      )}
    </article>
  );
}

function Tag({ value }) {
  return (
    <span style={styles.tag}>
      {formatText(value)}
    </span>
  );
}

function formatText(value) {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
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

  searchCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "30px",
  },

  label: {
    color: "#BDBDBD",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "15px",
    outline: "none",
    fontSize: "15px",
  },

  categoryArea: {
    marginTop: "18px",
  },

  filterLabel: {
    color: "#BDBDBD",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
  },

  categoryButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },

  categoryButton: {
    background: "#050505",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "30px",
    padding: "9px 13px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "900",
  },

  activeCategory: {
    background: "#F4C20D",
    color: "#050505",
    border: "1px solid #F4C20D",
    borderRadius: "30px",
    padding: "9px 13px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "900",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },

  resultTitle: {
    color: "#FFFFFF",
    fontSize: "25px",
    margin: 0,
  },

  resultCount: {
    color: "#F4C20D",
    fontSize: "10px",
    fontWeight: "900",
  },

  exerciseGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "15px",
  },

  exerciseCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  cardTop: {
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
  },

  exerciseIcon: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "9px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: "900",
  },

  exerciseHeading: {
    flex: 1,
  },

  exerciseName: {
    color: "#FFFFFF",
    margin: "2px 0 9px",
    fontSize: "19px",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },

  tag: {
    background: "#2A2A2A",
    color: "#FFFFFF",
    borderRadius: "20px",
    padding: "5px 8px",
    fontSize: "9px",
  },

  instructions: {
    marginTop: "20px",
    flex: 1,
  },

  smallHeading: {
    color: "#F4C20D",
    fontSize: "10px",
    letterSpacing: "1px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    fontSize: "13px",
  },

  mutedText: {
    color: "#777777",
    lineHeight: 1.6,
    fontSize: "13px",
  },

  videoButton: {
    display: "block",
    textAlign: "center",
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "8px",
    padding: "12px",
    textDecoration: "none",
    fontWeight: "900",
    fontSize: "10px",
    marginTop: "15px",
  },

  videoUnavailable: {
    background: "#050505",
    color: "#777777",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    padding: "12px",
    textAlign: "center",
    fontWeight: "900",
    fontSize: "10px",
    marginTop: "15px",
  },

  emptyCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "25px",
  },

  emptyTitle: {
    color: "#FFFFFF",
    marginTop: 0,
  },
};
