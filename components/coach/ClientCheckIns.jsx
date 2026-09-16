"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientCheckIns({
  client,
  checkIns = [],
  onCheckInUpdated,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedCheckIns = [...checkIns].sort(
    (a, b) =>
      new Date(b.submitted_at) -
      new Date(a.submitted_at)
  );

  const selectedCheckIn =
    sortedCheckIns.find(
      (item) => item.id === selectedId
    ) ||
    sortedCheckIns[0] ||
    null;

  useEffect(() => {
    if (sortedCheckIns.length > 0) {
      const current =
        sortedCheckIns.find(
          (item) => item.id === selectedId
        ) || sortedCheckIns[0];

      setSelectedId(current.id);
      setResponse(current.coach_response || "");
    } else {
      setSelectedId(null);
      setResponse("");
    }

    setMessage("");
    setErrorMessage("");
  }, [client?.id, checkIns]);

  function selectCheckIn(checkIn) {
    setSelectedId(checkIn.id);
    setResponse(checkIn.coach_response || "");
    setMessage("");
    setErrorMessage("");
  }

  async function saveResponse() {
    if (!selectedCheckIn) return;

    if (!response.trim()) {
      setErrorMessage(
        "Enter a response before saving."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("weekly_checkins")
        .update({
          coach_response: response.trim(),
        })
        .eq("id", selectedCheckIn.id)
        .eq("user_id", client.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMessage(
        "Response saved. The client can now see it in their portal."
      );

      if (onCheckInUpdated) {
        await onCheckInUpdated(data);
      }
    } catch (error) {
      console.error(
        "Check-in response error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The response could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!client) {
    return (
      <div style={styles.emptyCard}>
        Select a client before reviewing check-ins.
      </div>
    );
  }

  return (
    <section>
      <p style={styles.goldLabel}>
        WEEKLY CHECK-INS
      </p>

      <h2 style={styles.title}>
        {client.full_name || "Client"}'s Check-Ins
      </h2>

      <p style={styles.description}>
        Review client feedback, identify areas that
        need your attention, and respond directly
        from the coaching portal.
      </p>

      <div style={styles.summaryGrid}>
        <SummaryCard
          value={sortedCheckIns.length}
          label="TOTAL CHECK-INS"
        />

        <SummaryCard
          value={
            sortedCheckIns.filter(
              (item) =>
                !item.coach_response &&
                (item.questions ||
                  item.challenges)
            ).length
          }
          label="NEEDS RESPONSE"
        />

        <SummaryCard
          value={
            sortedCheckIns[0]
              ? formatDate(
                  sortedCheckIns[0]
                    .submitted_at
                )
              : "None"
          }
          label="LATEST"
        />
      </div>

      {sortedCheckIns.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>
            No Check-Ins Yet
          </h3>

          <p style={styles.bodyText}>
            When this client submits their first
            weekly check-in, it will appear here.
          </p>
        </div>
      ) : (
        <div style={styles.layout}>
          <aside style={styles.checkInList}>
            <p style={styles.listLabel}>
              CHECK-IN HISTORY
            </p>

            {sortedCheckIns.map((checkIn) => {
              const selected =
                checkIn.id ===
                selectedCheckIn?.id;

              return (
                <button
                  key={checkIn.id}
                  type="button"
                  onClick={() =>
                    selectCheckIn(checkIn)
                  }
                  style={{
                    ...styles.checkInButton,
                    ...(selected
                      ? styles.checkInButtonActive
                      : {}),
                  }}
                >
                  <div
                    style={
                      styles.checkInButtonTop
                    }
                  >
                    <strong
                      style={
                        styles.checkInDate
                      }
                    >
                      {formatDate(
                        checkIn.submitted_at
                      )}
                    </strong>

                    {!checkIn.coach_response &&
                      (checkIn.questions ||
                        checkIn.challenges) && (
                        <span
                          style={
                            styles.reviewBadge
                          }
                        >
                          REVIEW
                        </span>
                      )}
                  </div>

                  <span
                    style={
                      styles.checkInPreview
                    }
                  >
                    {checkIn.questions ||
                      checkIn.challenges ||
                      checkIn.wins ||
                      "Weekly check-in"}
                  </span>
                </button>
              );
            })}
          </aside>

          <div style={styles.main}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <p style={styles.goldLabel}>
                    CLIENT FEEDBACK
                  </p>

                  <h3 style={styles.cardTitle}>
                    {formatDate(
                      selectedCheckIn
                        .submitted_at
                    )}
                  </h3>
                </div>

                {selectedCheckIn.coach_response ? (
                  <span
                    style={
                      styles.respondedBadge
                    }
                  >
                    RESPONDED
                  </span>
                ) : (
                  <span
                    style={
                      styles.reviewBadgeLarge
                    }
                  >
                    NEEDS REVIEW
                  </span>
                )}
              </div>

              <div style={styles.scoreGrid}>
                <Score
                  label="ENERGY"
                  value={
                    selectedCheckIn.energy_level
                  }
                />

                <Score
                  label="SLEEP"
                  value={
                    selectedCheckIn.sleep_quality
                  }
                />

                <Score
                  label="STRESS"
                  value={
                    selectedCheckIn.stress_level
                  }
                />

                <Score
                  label="NUTRITION"
                  value={
                    selectedCheckIn
                      .nutrition_adherence
                  }
                />
              </div>

              <div style={styles.extraGrid}>
                <InfoBox
                  label="WORKOUTS COMPLETED"
                  value={
                    selectedCheckIn
                      .workouts_completed ??
                    "-"
                  }
                />

                <InfoBox
                  label="CURRENT WEIGHT"
                  value={
                    selectedCheckIn
                      .current_weight
                      ? `${selectedCheckIn.current_weight} lb`
                      : "-"
                  }
                />
              </div>

              <FeedbackSection
                label="WINS"
                text={selectedCheckIn.wins}
              />

              <FeedbackSection
                label="CHALLENGES"
                text={
                  selectedCheckIn.challenges
                }
              />

              <FeedbackSection
                label="QUESTIONS FOR QUE"
                text={
                  selectedCheckIn.questions
                }
                highlight
              />
            </div>

            <div style={styles.responseCard}>
              <p style={styles.goldLabel}>
                COACH RESPONSE
              </p>

              <h3 style={styles.cardTitle}>
                Respond to Client
              </h3>

              <p style={styles.bodyText}>
                This message will appear in the
                client's Check-In section.
              </p>

              <textarea
                value={response}
                onChange={(event) => {
                  setResponse(
                    event.target.value
                  );
                  setMessage("");
                  setErrorMessage("");
                }}
                placeholder="Example: Great work this week. Your consistency is improving. Let's keep the same workout target next week and focus on getting protein into each meal."
                style={styles.textarea}
              />

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
                onClick={saveResponse}
                disabled={saving}
                style={{
                  ...styles.goldButton,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {saving
                  ? "SAVING..."
                  : selectedCheckIn
                        .coach_response
                    ? "UPDATE RESPONSE"
                    : "SEND RESPONSE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SummaryCard({ value, label }) {
  return (
    <div style={styles.summaryCard}>
      <strong style={styles.summaryValue}>
        {value}
      </strong>

      <span style={styles.summaryLabel}>
        {label}
      </span>
    </div>
  );
}

function Score({ label, value }) {
  return (
    <div style={styles.scoreCard}>
      <strong style={styles.scoreValue}>
        {value ?? "-"}/5
      </strong>

      <span style={styles.scoreLabel}>
        {label}
      </span>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={styles.infoBox}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {value}
      </strong>
    </div>
  );
}

function FeedbackSection({
  label,
  text,
  highlight = false,
}) {
  if (!text) return null;

  return (
    <div
      style={
        highlight
          ? styles.highlightBox
          : styles.feedbackBox
      }
    >
      <strong
        style={
          highlight
            ? styles.highlightLabel
            : styles.feedbackLabel
        }
      >
        {label}
      </strong>

      <p style={styles.bodyText}>
        {text}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
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
    fontSize: "clamp(32px, 6vw, 52px)",
    margin: "8px 0",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "750px",
    marginBottom: "25px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  summaryCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "13px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
  },

  summaryValue: {
    color: "#F4C20D",
    fontSize: "22px",
  },

  summaryLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
    marginTop: "5px",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(210px, 280px) minmax(0, 1fr)",
    gap: "15px",
    alignItems: "start",
  },

  checkInList: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "10px",
  },

  listLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
    padding: "5px 7px 10px",
  },

  checkInButton: {
    width: "100%",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid transparent",
    borderRadius: "9px",
    padding: "12px",
    textAlign: "left",
    cursor: "pointer",
    marginBottom: "7px",
  },

  checkInButtonActive: {
    border: "1px solid #F4C20D",
  },

  checkInButtonTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  },

  checkInDate: {
    fontSize: "11px",
  },

  checkInPreview: {
    display: "block",
    color: "#777777",
    fontSize: "9px",
    marginTop: "6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  reviewBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "15px",
    padding: "3px 6px",
    fontSize: "6px",
    fontWeight: "900",
  },

  main: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  card: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "22px",
    margin: "7px 0 18px",
  },

  respondedBadge: {
    background: "#050505",
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    borderRadius: "20px",
    padding: "7px 9px",
    fontSize: "8px",
    fontWeight: "900",
  },

  reviewBadgeLarge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "20px",
    padding: "7px 9px",
    fontSize: "8px",
    fontWeight: "900",
  },

  scoreGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "8px",
  },

  scoreCard: {
    background: "#050505",
    borderRadius: "9px",
    padding: "13px",
    display: "flex",
    flexDirection: "column",
  },

  scoreValue: {
    color: "#F4C20D",
    fontSize: "19px",
  },

  scoreLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
    marginTop: "4px",
  },

  extraGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "8px",
    marginTop: "8px",
  },

  infoBox: {
    background: "#050505",
    borderRadius: "9px",
    padding: "13px",
    display: "flex",
    flexDirection: "column",
  },

  infoLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
  },

  infoValue: {
    color: "#FFFFFF",
    marginTop: "4px",
  },

  feedbackBox: {
    borderTop: "1px solid #2A2A2A",
    paddingTop: "15px",
    marginTop: "15px",
  },

  feedbackLabel: {
    color: "#FFFFFF",
    fontSize: "9px",
  },

  highlightBox: {
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "15px",
    marginTop: "15px",
  },

  highlightLabel: {
    color: "#F4C20D",
    fontSize: "9px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    fontSize: "12px",
  },

  responseCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "150px",
    resize: "vertical",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "13px",
    outline: "none",
    lineHeight: 1.6,
  },

  goldButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "9px",
    padding: "14px",
    marginTop: "12px",
    fontWeight: "900",
  },

  successBox: {
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    borderRadius: "8px",
    padding: "11px",
    marginTop: "10px",
    fontSize: "11px",
  },

  errorBox: {
    background: "#2A1111",
    color: "#FFFFFF",
    borderRadius: "8px",
    padding: "11px",
    marginTop: "10px",
    fontSize: "11px",
  },

  emptyCard: {
    background: "#111111",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "25px",
  },

  emptyTitle: {
    color: "#FFFFFF",
    marginTop: 0,
  },
};
