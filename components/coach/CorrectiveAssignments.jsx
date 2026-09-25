"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CorrectiveAssignments({
  client,
  currentAssignment,
  currentRoutine,
  routines = [],
  onAssignmentUpdated,
}) {
  const [selectedRoutineId, setSelectedRoutineId] =
    useState(currentRoutine?.id || "");

  const [coachNotes, setCoachNotes] = useState(
    currentAssignment?.coach_notes || ""
  );

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedRoutineId(currentRoutine?.id || "");
    setCoachNotes(currentAssignment?.coach_notes || "");
    setMessage("");
    setErrorMessage("");
  }, [
    client?.id,
    currentRoutine?.id,
    currentAssignment?.id,
    currentAssignment?.coach_notes,
  ]);

  if (!client) {
    return (
      <div style={styles.emptyCard}>
        Select a client before managing corrective
        training.
      </div>
    );
  }

  const selectedRoutine =
    routines.find(
      (routine) => routine.id === selectedRoutineId
    ) || null;

  async function assignRoutine() {
    if (!selectedRoutineId) {
      setErrorMessage(
        "Select a corrective routine first."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      /*
       * We keep one active corrective assignment
       * for the client.
       *
       * First deactivate existing assignments.
       */
      const { error: deactivateError } = await supabase
        .from("member_corrective_routines")
        .update({
          is_active: false,
        })
        .eq("user_id", client.id)
        .eq("is_active", true);

      if (deactivateError) {
        throw deactivateError;
      }

      /*
       * Create the new active assignment.
       */
      const { data, error: insertError } = await supabase
        .from("member_corrective_routines")
        .insert({
          user_id: client.id,
          routine_id: selectedRoutineId,
          coach_notes: coachNotes.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Corrective work is an optional service. Assigning a routine should
      // grant access even when the client's base package does not include it.
      const { data: correctiveService, error: serviceError } = await supabase
        .from("coaching_services")
        .select("id")
        .eq("service_key", "corrective_mobility")
        .eq("is_active", true)
        .maybeSingle();

      if (serviceError) {
        throw serviceError;
      }

      if (correctiveService?.id) {
        const { error: entitlementError } = await supabase
          .from("client_service_entitlements")
          .upsert(
            {
              user_id: client.id,
              service_id: correctiveService.id,
              enabled: true,
              source: "coach",
              notes: "Enabled with active corrective routine.",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,service_id" }
          );

        if (entitlementError) {
          throw entitlementError;
        }
      }

      setMessage(
        "Corrective routine assigned successfully."
      );

      if (onAssignmentUpdated) {
        await onAssignmentUpdated(data);
      }
    } catch (error) {
      console.error(
        "Corrective assignment error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The corrective routine could not be assigned."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateNotes() {
    if (!currentAssignment?.id) {
      setErrorMessage(
        "Assign a routine before updating coach notes."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("member_corrective_routines")
        .update({
          coach_notes: coachNotes.trim() || null,
        })
        .eq("id", currentAssignment.id)
        .eq("user_id", client.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMessage(
        "Corrective coaching notes updated."
      );

      if (onAssignmentUpdated) {
        await onAssignmentUpdated(data);
      }
    } catch (error) {
      console.error(
        "Corrective notes update error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The coaching notes could not be updated."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeRoutine() {
    if (!currentAssignment?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Remove this corrective routine from the client?"
    );

    if (!confirmed) {
      return;
    }

    setRemoving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("member_corrective_routines")
        .update({
          is_active: false,
        })
        .eq("id", currentAssignment.id)
        .eq("user_id", client.id);

      if (error) {
        throw error;
      }

      const { data: correctiveService, error: serviceError } = await supabase
        .from("coaching_services")
        .select("id")
        .eq("service_key", "corrective_mobility")
        .maybeSingle();

      if (serviceError) {
        throw serviceError;
      }

      if (correctiveService?.id) {
        const { error: entitlementError } = await supabase
          .from("client_service_entitlements")
          .upsert(
            {
              user_id: client.id,
              service_id: correctiveService.id,
              enabled: false,
              source: "coach",
              notes: "Disabled because no corrective routine is active.",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,service_id" }
          );

        if (entitlementError) {
          throw entitlementError;
        }
      }

      setSelectedRoutineId("");
      setCoachNotes("");

      setMessage(
        "Corrective routine removed from client."
      );

      if (onAssignmentUpdated) {
        await onAssignmentUpdated(null);
      }
    } catch (error) {
      console.error(
        "Corrective removal error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The corrective routine could not be removed."
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section>
      <p style={styles.goldLabel}>
        CORRECTIVE & MOBILITY
      </p>

      <h2 style={styles.title}>
        {client.full_name || "Client"}'s Corrective Plan
      </h2>

      <p style={styles.description}>
        Assign mobility and corrective exercise work
        based on the client's movement needs and
        coaching plan.
      </p>

      <div style={styles.topGrid}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>
            CURRENT ASSIGNMENT
          </p>

          {currentRoutine ? (
            <>
              <div style={styles.currentHeader}>
                <div>
                  <h3 style={styles.currentTitle}>
                    {currentRoutine.name}
                  </h3>

                  <p style={styles.focusText}>
                    {formatText(
                      currentRoutine.focus_area
                    )}
                  </p>
                </div>

                <span style={styles.activeBadge}>
                  ACTIVE
                </span>
              </div>

              <p style={styles.bodyText}>
                {currentRoutine.description ||
                  "Corrective and mobility routine assigned by Que."}
              </p>

              <div style={styles.stats}>
                <Stat
                  label="DAYS / WEEK"
                  value={
                    currentRoutine.days_per_week ??
                    "-"
                  }
                />

                <Stat
                  label="SESSION"
                  value={
                    currentRoutine.session_minutes
                      ? `${currentRoutine.session_minutes} min`
                      : "-"
                  }
                />
              </div>

              {currentAssignment?.coach_notes && (
                <div style={styles.currentNotes}>
                  <strong style={styles.notesTitle}>
                    CLIENT INSTRUCTIONS
                  </strong>

                  <p style={styles.bodyText}>
                    {currentAssignment.coach_notes}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 style={styles.currentTitle}>
                No Routine Assigned
              </h3>

              <p style={styles.bodyText}>
                This client currently has no corrective
                or mobility routine attached to their
                member portal.
              </p>
            </>
          )}
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>
            ASSIGNMENT
          </p>

          <h3 style={styles.cardTitle}>
            Choose Routine
          </h3>

          {routines.length === 0 ? (
            <div style={styles.noRoutineBox}>
              <strong style={styles.noRoutineTitle}>
                No Corrective Routines Yet
              </strong>

              <p style={styles.bodyText}>
                Once corrective routines are added to
                your database, they will appear here
                for assignment.
              </p>
            </div>
          ) : (
            <>
              <select
                value={selectedRoutineId}
                onChange={(event) => {
                  setSelectedRoutineId(
                    event.target.value
                  );
                  setMessage("");
                  setErrorMessage("");
                }}
                style={styles.select}
              >
                <option value="">
                  Select a routine
                </option>

                {routines.map((routine) => (
                  <option
                    key={routine.id}
                    value={routine.id}
                  >
                    {routine.name}
                  </option>
                ))}
              </select>

              {selectedRoutine && (
                <div style={styles.preview}>
                  <strong style={styles.previewTitle}>
                    {selectedRoutine.name}
                  </strong>

                  <span style={styles.previewFocus}>
                    {formatText(
                      selectedRoutine.focus_area
                    )}
                  </span>

                  {selectedRoutine.description && (
                    <p style={styles.bodyText}>
                      {selectedRoutine.description}
                    </p>
                  )}

                  <div style={styles.previewTags}>
                    {selectedRoutine.days_per_week && (
                      <span style={styles.tag}>
                        {
                          selectedRoutine.days_per_week
                        }{" "}
                        days/week
                      </span>
                    )}

                    {selectedRoutine.session_minutes && (
                      <span style={styles.tag}>
                        {
                          selectedRoutine.session_minutes
                        }{" "}
                        min
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={styles.notesCard}>
        <p style={styles.cardLabel}>
          CLIENT INSTRUCTIONS
        </p>

        <h3 style={styles.cardTitle}>
          Notes From Que
        </h3>

        <p style={styles.bodyText}>
          Add instructions the client should see with
          their corrective routine.
        </p>

        <textarea
          value={coachNotes}
          onChange={(event) => {
            setCoachNotes(event.target.value);
            setMessage("");
            setErrorMessage("");
          }}
          placeholder="Example: Complete this routine after long workdays or before your strength workout. Move slowly and stay within a comfortable range."
          style={styles.textarea}
        />

        {currentAssignment?.id && (
          <button
            type="button"
            onClick={updateNotes}
            disabled={saving}
            style={styles.secondaryButton}
          >
            UPDATE NOTES
          </button>
        )}
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

      <div style={styles.actions}>
        <button
          type="button"
          onClick={assignRoutine}
          disabled={
            saving ||
            removing ||
            !selectedRoutineId ||
            routines.length === 0
          }
          style={{
            ...styles.goldButton,
            opacity:
              saving ||
              removing ||
              !selectedRoutineId ||
              routines.length === 0
                ? 0.5
                : 1,
          }}
        >
          {saving
            ? "SAVING..."
            : currentRoutine
              ? "ASSIGN SELECTED ROUTINE"
              : "ASSIGN ROUTINE"}
        </button>

        {currentAssignment?.id && (
          <button
            type="button"
            onClick={removeRoutine}
            disabled={saving || removing}
            style={styles.removeButton}
          >
            {removing
              ? "REMOVING..."
              : "REMOVE CURRENT ROUTINE"}
          </button>
        )}
      </div>

      <div style={styles.notice}>
        <strong style={styles.noticeTitle}>
          CORRECTIVE TRAINING SCOPE
        </strong>

        <p style={styles.noticeText}>
          Use corrective programming for fitness-based
          mobility, movement quality, posture, stability,
          flexibility, and exercise preparation. Refer
          clients to an appropriate healthcare
          professional when symptoms or needs fall
          outside your training scope.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <strong style={styles.statValue}>
        {value}
      </strong>

      <span style={styles.statLabel}>
        {label}
      </span>
    </div>
  );
}

function formatText(value) {
  if (!value) return "-";

  return String(value)
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
    margin: "8px 0",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "760px",
    marginBottom: "25px",
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
  },

  card: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
  },

  cardLabel: {
    color: "#F4C20D",
    fontWeight: "900",
    fontSize: "9px",
    letterSpacing: "1px",
    margin: 0,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "22px",
    margin: "7px 0 12px",
  },

  currentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginTop: "8px",
  },

  currentTitle: {
    color: "#FFFFFF",
    fontSize: "24px",
    margin: 0,
  },

  focusText: {
    color: "#F4C20D",
    fontSize: "11px",
    fontWeight: "800",
    marginTop: "5px",
  },

  activeBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "20px",
    padding: "6px 9px",
    fontSize: "8px",
    fontWeight: "900",
  },

  bodyText: {
    color: "#BDBDBD",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "8px",
    marginTop: "16px",
  },

  stat: {
    background: "#050505",
    borderRadius: "9px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: "15px",
  },

  statLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
    marginTop: "4px",
  },

  currentNotes: {
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "13px",
    marginTop: "15px",
  },

  notesTitle: {
    color: "#F4C20D",
    fontSize: "9px",
  },

  select: {
    width: "100%",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "13px",
  },

  preview: {
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "15px",
    marginTop: "12px",
  },

  previewTitle: {
    color: "#FFFFFF",
    display: "block",
  },

  previewFocus: {
    color: "#F4C20D",
    display: "block",
    fontSize: "10px",
    marginTop: "4px",
  },

  previewTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "10px",
  },

  tag: {
    background: "#111111",
    color: "#BDBDBD",
    borderRadius: "15px",
    padding: "5px 8px",
    fontSize: "9px",
  },

  noRoutineBox: {
    background: "#050505",
    borderRadius: "9px",
    padding: "15px",
  },

  noRoutineTitle: {
    color: "#FFFFFF",
  },

  notesCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    marginTop: "15px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "130px",
    resize: "vertical",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "13px",
    lineHeight: 1.6,
    outline: "none",
  },

  secondaryButton: {
    marginTop: "10px",
    background: "#050505",
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    borderRadius: "8px",
    padding: "11px 14px",
    fontWeight: "900",
    cursor: "pointer",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "15px",
  },

  goldButton: {
    flex: 1,
    minWidth: "220px",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "9px",
    padding: "14px",
    fontWeight: "900",
    cursor: "pointer",
  },

  removeButton: {
    background: "#111111",
    color: "#FFFFFF",
    border: "1px solid #444444",
    borderRadius: "9px",
    padding: "14px",
    fontWeight: "900",
    cursor: "pointer",
  },

  successBox: {
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    background: "#111111",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "12px",
    fontSize: "11px",
  },

  errorBox: {
    background: "#2A1111",
    color: "#FFFFFF",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "12px",
    fontSize: "11px",
  },

  notice: {
    background: "#0B0B0B",
    borderLeft: "3px solid #F4C20D",
    padding: "16px",
    marginTop: "20px",
  },

  noticeTitle: {
    color: "#F4C20D",
    fontSize: "9px",
  },

  noticeText: {
    color: "#777777",
    fontSize: "11px",
    lineHeight: 1.6,
    marginBottom: 0,
  },

  emptyCard: {
    background: "#111111",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "25px",
  },
};
