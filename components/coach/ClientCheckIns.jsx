"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientCheckIns({
  client,
  checkIns = [],
  onCheckInUpdated,
}) {
  const [responses, setResponses] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const startingResponses = {};

    checkIns.forEach((checkIn) => {
      startingResponses[checkIn.id] = checkIn.coach_response || "";
    });

    setResponses(startingResponses);
  }, [checkIns]);

  async function saveResponse(checkInId) {
    if (!checkInId) return;

    setSavingId(checkInId);
    setMessage("");

    try {
      const response = responses[checkInId] || "";

      const { error } = await supabase.rpc(
        "coach_respond_to_checkin",
        {
          p_checkin_id: checkInId,
          p_response: response,
        }
      );

      if (error) {
        throw error;
      }

      setMessage("Coach response saved.");

      if (onCheckInUpdated) {
        await onCheckInUpdated();
      }
    } catch (error) {
      console.error("Check-in response error:", error);

      setMessage(
        error?.message || "Unable to save coach response."
      );
    } finally {
      setSavingId(null);
    }
  }

  function formatDate(date) {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
      marginTop: "6px",
      color: "#BDBDBD",
      lineHeight: "1.5",
    },

    checkIn: {
      background: "#111111",
      border: "1px solid #2A2A2A",
      borderRadius: "16px",
      padding: "22px",
    },

    checkInHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      marginBottom: "18px",
    },

    date: {
      color: "#F4C20D",
      fontSize: "18px",
      fontWeight: "800",
    },

    status: {
      background: "#050505",
      border: "1px solid #2A2A2A",
      borderRadius: "999px",
      padding: "7px 12px",
      color: "#BDBDBD",
      fontSize: "13px",
      fontWeight: "700",
    },

    scoreGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(130px, 1fr))",
      gap: "10px",
      marginBottom: "20px",
    },

    scoreCard: {
      background: "#050505",
      border: "1px solid #2A2A2A",
      borderRadius: "12px",
      padding: "14px",
    },

    scoreLabel: {
      color: "#BDBDBD",
      fontSize: "12px",
    },

    scoreValue: {
      color: "#FFFFFF",
      fontSize: "20px",
      fontWeight: "800",
      marginTop: "4px",
    },

    section: {
      marginTop: "16px",
    },

    label: {
      color: "#F4C20D",
      fontSize: "13px",
      fontWeight: "800",
      marginBottom: "6px",
    },

    text: {
      color: "#FFFFFF",
      lineHeight: "1.6",
      whiteSpace: "pre-wrap",
    },

    muted: {
      color: "#777777",
      lineHeight: "1.6",
    },

    textarea: {
      width: "100%",
      minHeight: "110px",
      resize: "vertical",
      padding: "13px",
      borderRadius: "10px",
      border: "1px solid #2A2A2A",
      background: "#050505",
      color: "#FFFFFF",
      fontSize: "14px",
      lineHeight: "1.5",
      outline: "none",
      boxSizing: "border-box",
    },

    button: {
      marginTop: "12px",
      padding: "12px 18px",
      border: "none",
      borderRadius: "10px",
      background: "#F4C20D",
      color: "#050505",
      fontWeight: "800",
      cursor: "pointer",
    },

    disabledButton: {
      marginTop: "12px",
      padding: "12px 18px",
      border: "none",
      borderRadius: "10px",
      background: "#2A2A2A",
      color: "#BDBDBD",
      fontWeight: "800",
      cursor: "not-allowed",
    },

    message: {
      background: "#111111",
      border: "1px solid #F4C20D",
      borderRadius: "12px",
      padding: "12px 16px",
      color: "#F4C20D",
      fontWeight: "700",
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

  if (!client) {
    return (
      <div style={styles.empty}>
        Select a client to view their check-ins.
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Client Check-Ins</h2>

        <div style={styles.subtitle}>
          Review weekly feedback from{" "}
          {client.full_name || client.email || "this client"} and
          send coaching responses.
        </div>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {checkIns.length === 0 ? (
        <div style={styles.empty}>
          This client has not submitted a weekly check-in yet.
        </div>
      ) : (
        checkIns.map((checkIn) => {
          const hasResponse = Boolean(checkIn.coach_response);

          return (
            <div key={checkIn.id} style={styles.checkIn}>
              <div style={styles.checkInHeader}>
                <div style={styles.date}>
                  {formatDate(checkIn.submitted_at)}
                </div>

                <div style={styles.status}>
                  {hasResponse
                    ? "Response Sent"
                    : "Needs Response"}
                </div>
              </div>

              <div style={styles.scoreGrid}>
                <ScoreCard
                  label="Energy"
                  value={checkIn.energy_level}
                  styles={styles}
                />

                <ScoreCard
                  label="Sleep"
                  value={checkIn.sleep_quality}
                  styles={styles}
                />

                <ScoreCard
                  label="Stress"
                  value={checkIn.stress_level}
                  styles={styles}
                />

                <ScoreCard
                  label="Nutrition"
                  value={checkIn.nutrition_adherence}
                  styles={styles}
                />

                <ScoreCard
                  label="Workouts"
                  value={checkIn.workouts_completed}
                  suffix=""
                  styles={styles}
                />

                <ScoreCard
                  label="Weight"
                  value={checkIn.current_weight}
                  suffix={
                    checkIn.current_weight ? " lb" : ""
                  }
                  styles={styles}
                />
              </div>

              <TextSection
                label="Wins"
                value={checkIn.wins}
                styles={styles}
              />

              <TextSection
                label="Challenges"
                value={checkIn.challenges}
                styles={styles}
              />

              <TextSection
                label="Questions"
                value={checkIn.questions}
                styles={styles}
              />

              <div style={styles.section}>
                <div style={styles.label}>COACH RESPONSE</div>

                <textarea
                  style={styles.textarea}
                  value={responses[checkIn.id] || ""}
                  placeholder="Write your response to this client..."
                  onChange={(event) =>
                    setResponses((current) => ({
                      ...current,
                      [checkIn.id]: event.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  onClick={() => saveResponse(checkIn.id)}
                  disabled={savingId === checkIn.id}
                  style={
                    savingId === checkIn.id
                      ? styles.disabledButton
                      : styles.button
                  }
                >
                  {savingId === checkIn.id
                    ? "Saving..."
                    : hasResponse
                    ? "Update Response"
                    : "Send Response"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  suffix = "/5",
  styles,
}) {
  return (
    <div style={styles.scoreCard}>
      <div style={styles.scoreLabel}>{label}</div>

      <div style={styles.scoreValue}>
        {value !== null && value !== undefined
          ? `${value}${suffix}`
          : "—"}
      </div>
    </div>
  );
}

function TextSection({ label, value, styles }) {
  return (
    <div style={styles.section}>
      <div style={styles.label}>{label.toUpperCase()}</div>

      <div style={value ? styles.text : styles.muted}>
        {value || "Nothing submitted."}
      </div>
    </div>
  );
}
