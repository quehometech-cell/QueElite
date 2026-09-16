"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CoachNotes({
  client,
  coachUser,
  notes = [],
  onNotesUpdated,
}) {
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedNotes = [...notes].sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  );

  useEffect(() => {
    setNewNote("");
    setMessage("");
    setErrorMessage("");
  }, [client?.id]);

  if (!client) {
    return (
      <div style={styles.emptyCard}>
        Select a client before viewing coach notes.
      </div>
    );
  }

  async function addNote() {
    if (!newNote.trim()) {
      setErrorMessage(
        "Enter a note before saving."
      );
      return;
    }

    if (!coachUser?.id) {
      setErrorMessage(
        "Coach account could not be verified."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("coach_notes")
        .insert({
          client_id: client.id,
          coach_id: coachUser.id,
          note: newNote.trim(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setNewNote("");
      setMessage("Private coach note saved.");

      if (onNotesUpdated) {
        await onNotesUpdated({
          type: "added",
          note: data,
        });
      }
    } catch (error) {
      console.error(
        "Coach note save error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The coach note could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId) {
    const confirmed = window.confirm(
      "Delete this private coach note?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(noteId);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("coach_notes")
        .delete()
        .eq("id", noteId)
        .eq("coach_id", coachUser.id);

      if (error) {
        throw error;
      }

      setMessage("Coach note deleted.");

      if (onNotesUpdated) {
        await onNotesUpdated({
          type: "deleted",
          id: noteId,
        });
      }
    } catch (error) {
      console.error(
        "Coach note delete error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The coach note could not be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <p style={styles.goldLabel}>
        PRIVATE COACH NOTES
      </p>

      <h2 style={styles.title}>
        {client.full_name || "Client"}'s Notes
      </h2>

      <p style={styles.description}>
        Keep private coaching observations,
        reminders, follow-up items, and programming
        notes for this client.
      </p>

      <div style={styles.privateNotice}>
        <div style={styles.lockIcon}>
          🔒
        </div>

        <div>
          <strong style={styles.privateTitle}>
            COACH ONLY
          </strong>

          <p style={styles.privateText}>
            These notes are private coaching records
            and are not displayed inside the client's
            member portal.
          </p>
        </div>
      </div>

      <div style={styles.newNoteCard}>
        <p style={styles.cardLabel}>
          NEW NOTE
        </p>

        <h3 style={styles.cardTitle}>
          Add Coaching Note
        </h3>

        <textarea
          value={newNote}
          onChange={(event) => {
            setNewNote(event.target.value);
            setMessage("");
            setErrorMessage("");
          }}
          placeholder="Example: Client mentioned difficulty staying consistent on workdays. Follow up next week and consider shortening Day 2 sessions."
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
          onClick={addNote}
          disabled={
            saving || !newNote.trim()
          }
          style={{
            ...styles.goldButton,
            opacity:
              saving || !newNote.trim()
                ? 0.5
                : 1,
            cursor:
              saving || !newNote.trim()
                ? "not-allowed"
                : "pointer",
          }}
        >
          {saving
            ? "SAVING..."
            : "SAVE PRIVATE NOTE"}
        </button>
      </div>

      <div style={styles.historyHeader}>
        <div>
          <p style={styles.cardLabel}>
            NOTE HISTORY
          </p>

          <h3 style={styles.cardTitle}>
            Coaching Record
          </h3>
        </div>

        <span style={styles.countBadge}>
          {sortedNotes.length}{" "}
          {sortedNotes.length === 1
            ? "NOTE"
            : "NOTES"}
        </span>
      </div>

      {sortedNotes.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>
            No Private Notes Yet
          </h3>

          <p style={styles.bodyText}>
            Add your first coaching note above.
          </p>
        </div>
      ) : (
        <div style={styles.notesList}>
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              style={styles.noteCard}
            >
              <div style={styles.noteHeader}>
                <div>
                  <strong
                    style={styles.noteDate}
                  >
                    {formatDateTime(
                      note.created_at
                    )}
                  </strong>

                  {note.coach_id ===
                    coachUser?.id && (
                    <span
                      style={
                        styles.yourNoteBadge
                      }
                    >
                      YOUR NOTE
                    </span>
                  )}
                </div>

                {note.coach_id ===
                  coachUser?.id && (
                  <button
                    type="button"
                    onClick={() =>
                      deleteNote(note.id)
                    }
                    disabled={
                      deletingId === note.id
                    }
                    style={
                      styles.deleteButton
                    }
                  >
                    {deletingId === note.id
                      ? "DELETING..."
                      : "DELETE"}
                  </button>
                )}
              </div>

              <p style={styles.noteText}>
                {note.note}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
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
    maxWidth: "760px",
    marginBottom: "25px",
  },

  privateNotice: {
    background: "#111111",
    border: "1px solid #F4C20D",
    borderRadius: "13px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginBottom: "15px",
  },

  lockIcon: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "50%",
    background: "#050505",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  privateTitle: {
    color: "#F4C20D",
    fontSize: "10px",
  },

  privateText: {
    color: "#BDBDBD",
    fontSize: "11px",
    lineHeight: 1.5,
    margin: "4px 0 0",
  },

  newNoteCard: {
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
    margin: "7px 0 15px",
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
    lineHeight: 1.6,
    outline: "none",
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
    background: "#050505",
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

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginTop: "28px",
  },

  countBadge: {
    background: "#111111",
    color: "#F4C20D",
    border: "1px solid #2A2A2A",
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "8px",
    fontWeight: "900",
  },

  notesList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  noteCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "13px",
    padding: "17px",
  },

  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  noteDate: {
    color: "#FFFFFF",
    fontSize: "11px",
  },

  yourNoteBadge: {
    marginLeft: "8px",
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "20px",
    padding: "4px 7px",
    fontSize: "7px",
    fontWeight: "900",
  },

  deleteButton: {
    background: "transparent",
    color: "#777777",
    border: "1px solid #2A2A2A",
    borderRadius: "7px",
    padding: "6px 8px",
    cursor: "pointer",
    fontSize: "8px",
    fontWeight: "900",
  },

  noteText: {
    color: "#BDBDBD",
    fontSize: "12px",
    lineHeight: 1.7,
    whiteSpace: "pre-line",
    marginBottom: 0,
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

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    fontSize: "12px",
  },
};
