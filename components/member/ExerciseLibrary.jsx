"use client";

import { useMemo, useState } from "react";

export default function ExerciseLibrary({ exercises = [] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        exercises
          .map((exercise) => exercise.category)
          .filter(Boolean)
      ),
    ];

    return unique.sort();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesCategory =
        category === "all" || exercise.category === category;

      const searchableText = [
        exercise.name,
        exercise.category,
        exercise.equipment,
        exercise.muscle_group,
        exercise.difficulty,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm || searchableText.includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [exercises, search, category]);

  function formatText(value) {
    if (!value) return "";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function isValidVideoUrl(url) {
    if (!url) return false;

    try {
      const parsed = new URL(url);

      return (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      );
    } catch {
      return false;
    }
  }

  const styles = {
    page: {
      display: "grid",
      gap: "20px",
    },

    header: {
      background: "#111111",
      border: "1px solid #2A2A2A",
      borderRadius: "16px",
      padding: "22px",
    },

    title: {
      margin: 0,
      color: "#FFFFFF",
      fontSize: "24px",
      fontWeight: "800",
    },

    subtitle: {
      color: "#BDBDBD",
      marginTop: "6px",
      lineHeight: "1.5",
    },

    filters: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px",
      marginTop: "20px",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "13px",
      borderRadius: "10px",
      border: "1px solid #2A2A2A",
      background: "#050505",
      color: "#FFFFFF",
      outline: "none",
      fontSize: "14px",
    },

    select: {
      width: "100%",
      padding: "13px",
      borderRadius: "10px",
      border: "1px solid #2A2A2A",
      background: "#050505",
      color: "#FFFFFF",
      outline: "none",
      fontSize: "14px",
    },

    count: {
      color: "#F4C20D",
      fontSize: "13px",
      fontWeight: "800",
      marginTop: "16px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "16px",
    },

    card: {
      background: "#111111",
      border: "1px solid #2A2A2A",
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      minHeight: "260px",
    },

    top: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
    },

    name: {
      color: "#FFFFFF",
      fontSize: "19px",
      fontWeight: "800",
      lineHeight: "1.3",
    },

    difficulty: {
      color: "#F4C20D",
      background: "#050505",
      border: "1px solid #2A2A2A",
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "11px",
      fontWeight: "800",
      whiteSpace: "nowrap",
    },

    details: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "14px",
    },

    detail: {
      background: "#050505",
      border: "1px solid #2A2A2A",
      borderRadius: "8px",
      padding: "6px 9px",
      color: "#BDBDBD",
      fontSize: "12px",
    },

    instructions: {
      color: "#BDBDBD",
      fontSize: "14px",
      lineHeight: "1.6",
      marginTop: "16px",
      flex: 1,
    },

    videoButton: {
      display: "block",
      width: "100%",
      boxSizing: "border-box",
      marginTop: "18px",
      padding: "12px 16px",
      borderRadius: "10px",
      background: "#F4C20D",
      color: "#050505",
      fontWeight: "900",
      textAlign: "center",
      textDecoration: "none",
    },

    noVideo: {
      marginTop: "18px",
      padding: "11px",
      borderRadius: "10px",
      background: "#050505",
      border: "1px solid #2A2A2A",
      color: "#777777",
      fontSize: "12px",
      textAlign: "center",
    },

    empty: {
      background: "#111111",
      border: "1px solid #2A2A2A",
      borderRadius: "16px",
      padding: "30px",
      color: "#BDBDBD",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Exercise Library</h2>

        <div style={styles.subtitle}>
          Search exercises, review coaching instructions, and
          watch exercise demonstrations when available.
        </div>

        <div style={styles.filters}>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exercises..."
            style={styles.input}
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            style={styles.select}
          >
            <option value="all">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {formatText(item)}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.count}>
          {filteredExercises.length} exercise
          {filteredExercises.length === 1 ? "" : "s"}
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <div style={styles.empty}>
          No exercises match your search.
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredExercises.map((exercise) => {
            const hasVideo = isValidVideoUrl(
              exercise.video_url
            );

            return (
              <div key={exercise.id} style={styles.card}>
                <div style={styles.top}>
                  <div style={styles.name}>
                    {exercise.name}
                  </div>

                  {exercise.difficulty && (
                    <div style={styles.difficulty}>
                      {formatText(exercise.difficulty)}
                    </div>
                  )}
                </div>

                <div style={styles.details}>
                  {exercise.category && (
                    <div style={styles.detail}>
                      {formatText(exercise.category)}
                    </div>
                  )}

                  {exercise.muscle_group && (
                    <div style={styles.detail}>
                      {formatText(exercise.muscle_group)}
                    </div>
                  )}

                  {exercise.equipment && (
                    <div style={styles.detail}>
                      {formatText(exercise.equipment)}
                    </div>
                  )}
                </div>

                <div style={styles.instructions}>
                  {exercise.instructions ||
                    "Exercise instructions will be added soon."}
                </div>

                {hasVideo ? (
                  <a
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.videoButton}
                  >
                    Watch Demo
                  </a>
                ) : (
                  <div style={styles.noVideo}>
                    Video demonstration coming soon
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
