"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Progress({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    weight_lbs: "",
    waist_inches: "",
    chest_inches: "",
    hips_inches: "",
    arm_inches: "",
    thigh_inches: "",
    notes: "",
  });

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadProgress();
  }, [user?.id]);

  async function loadProgress() {
    setLoading(true);

    const { data, error } = await supabase
      .from("progress_entries")
      .select(
        "id, weight_lbs, waist_inches, chest_inches, hips_inches, arm_inches, thigh_inches, notes, recorded_at"
      )
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false });

    if (error) {
      console.error("Progress load error:", error);
      setMessage("We couldn't load your progress history.");
      setLoading(false);
      return;
    }

    setEntries(data || []);
    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function numberOrNull(value) {
    if (value === "") return null;

    const number = Number(value);

    return Number.isNaN(number) ? null : number;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) return;

    if (!form.weight_lbs) {
      setMessage("Enter your current weight before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("progress_entries")
      .insert({
        user_id: user.id,
        weight_lbs: numberOrNull(form.weight_lbs),
        waist_inches: numberOrNull(form.waist_inches),
        chest_inches: numberOrNull(form.chest_inches),
        hips_inches: numberOrNull(form.hips_inches),
        arm_inches: numberOrNull(form.arm_inches),
        thigh_inches: numberOrNull(form.thigh_inches),
        notes: form.notes.trim() || null,
      })
      .select(
        "id, weight_lbs, waist_inches, chest_inches, hips_inches, arm_inches, thigh_inches, notes, recorded_at"
      )
      .single();

    if (error) {
      console.error("Progress save error:", error);
      setMessage(
        "We couldn't save your progress. Please try again."
      );
      setSaving(false);
      return;
    }

    setEntries((current) => [data, ...current]);

    setForm({
      weight_lbs: "",
      waist_inches: "",
      chest_inches: "",
      hips_inches: "",
      arm_inches: "",
      thigh_inches: "",
      notes: "",
    });

    setMessage("Progress saved.");

    setSaving(false);
  }

  const latest = entries[0] || null;

  const oldest =
    entries.length > 1
      ? entries[entries.length - 1]
      : null;

  const weightChange =
    latest?.weight_lbs && oldest?.weight_lbs
      ? Number(latest.weight_lbs) -
        Number(oldest.weight_lbs)
      : null;

  return (
    <section>
      <p style={styles.goldLabel}>PROGRESS</p>

      <h2 style={styles.title}>
        TRACK YOUR RESULTS
      </h2>

      <p style={styles.description}>
        Log your weight and measurements over time so you and Que
        can see what's changing.
      </p>

      {/* SUMMARY */}

      <div style={styles.summaryGrid}>
        <SummaryCard
          label="LATEST WEIGHT"
          value={
            latest?.weight_lbs
              ? `${latest.weight_lbs} lb`
              : "-"
          }
        />

        <SummaryCard
          label="ENTRIES"
          value={entries.length}
        />

        <SummaryCard
          label="WEIGHT CHANGE"
          value={
            weightChange !== null
              ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(
                  1
                )} lb`
              : "-"
          }
        />
      </div>

      {/* ENTRY FORM */}

      <form
        onSubmit={handleSubmit}
        style={styles.formCard}
      >
        <p style={styles.goldLabel}>
          NEW PROGRESS ENTRY
        </p>

        <h3 style={styles.cardTitle}>
          Log Your Measurements
        </h3>

        <div style={styles.formGrid}>
          <MeasurementInput
            label="Weight"
            name="weight_lbs"
            value={form.weight_lbs}
            onChange={handleChange}
            unit="lb"
            required
          />

          <MeasurementInput
            label="Waist"
            name="waist_inches"
            value={form.waist_inches}
            onChange={handleChange}
            unit="in"
          />

          <MeasurementInput
            label="Chest"
            name="chest_inches"
            value={form.chest_inches}
            onChange={handleChange}
            unit="in"
          />

          <MeasurementInput
            label="Hips"
            name="hips_inches"
            value={form.hips_inches}
            onChange={handleChange}
            unit="in"
          />

          <MeasurementInput
            label="Arm"
            name="arm_inches"
            value={form.arm_inches}
            onChange={handleChange}
            unit="in"
          />

          <MeasurementInput
            label="Thigh"
            name="thigh_inches"
            value={form.thigh_inches}
            onChange={handleChange}
            unit="in"
          />
        </div>

        <label style={styles.label}>
          NOTES
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="How are you feeling? Anything you want Que to know?"
            style={styles.textarea}
            rows={4}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          style={
            saving
              ? styles.disabledButton
              : styles.goldButton
          }
        >
          {saving
            ? "SAVING..."
            : "SAVE PROGRESS"}
        </button>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}
      </form>

      {/* HISTORY */}

      <div style={styles.historySection}>
        <p style={styles.goldLabel}>
          PROGRESS HISTORY
        </p>

        <h3 style={styles.historyTitle}>
          Your Entries
        </h3>

        {loading ? (
          <div style={styles.emptyCard}>
            Loading progress...
          </div>
        ) : entries.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.bodyText}>
              You haven't logged any progress yet.
            </p>
          </div>
        ) : (
          <div style={styles.historyList}>
            {entries.map((entry) => (
              <ProgressEntry
                key={entry.id}
                entry={entry}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MeasurementInput({
  label,
  name,
  value,
  onChange,
  unit,
  required = false,
}) {
  return (
    <label style={styles.label}>
      {label.toUpperCase()}

      <div style={styles.inputWrap}>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          min="0"
          step="0.1"
          inputMode="decimal"
          style={styles.input}
        />

        <span style={styles.unit}>
          {unit}
        </span>
      </div>
    </label>
  );
}

function SummaryCard({ label, value }) {
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

function ProgressEntry({ entry }) {
  const measurements = [
    ["Weight", entry.weight_lbs, "lb"],
    ["Waist", entry.waist_inches, "in"],
    ["Chest", entry.chest_inches, "in"],
    ["Hips", entry.hips_inches, "in"],
    ["Arm", entry.arm_inches, "in"],
    ["Thigh", entry.thigh_inches, "in"],
  ].filter((item) => item[1] !== null);

  return (
    <article style={styles.entryCard}>
      <div style={styles.entryHeader}>
        <div>
          <p style={styles.goldLabel}>
            PROGRESS ENTRY
          </p>

          <h4 style={styles.entryDate}>
            {formatDate(entry.recorded_at)}
          </h4>
        </div>
      </div>

      <div style={styles.measurementGrid}>
        {measurements.map(
          ([label, value, unit]) => (
            <div
              key={label}
              style={styles.measurement}
            >
              <strong
                style={styles.measurementValue}
              >
                {value} {unit}
              </strong>

              <span
                style={styles.measurementLabel}
              >
                {label}
              </span>
            </div>
          )
        )}
      </div>

      {entry.notes && (
        <div style={styles.notesBox}>
          <strong style={styles.notesTitle}>
            NOTES
          </strong>

          <p style={styles.bodyText}>
            {entry.notes}
          </p>
        </div>
      )}
    </article>
  );
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
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
    fontSize: "clamp(32px, 6vw, 52px)",
    margin: "8px 0 10px",
  },

  description: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    maxWidth: "800px",
    marginBottom: "25px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    marginBottom: "25px",
  },

  summaryCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  summaryValue: {
    color: "#F4C20D",
    fontSize: "28px",
  },

  summaryLabel: {
    color: "#BDBDBD",
    fontSize: "10px",
    marginTop: "5px",
    fontWeight: "800",
  },

  formCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "25px",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "23px",
    margin: "7px 0 20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "15px",
  },

  label: {
    color: "#BDBDBD",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "15px",
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "#050505",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    overflow: "hidden",
  },

  input: {
    width: "100%",
    background: "transparent",
    color: "#FFFFFF",
    border: "none",
    outline: "none",
    padding: "14px",
    fontSize: "16px",
  },

  unit: {
    color: "#F4C20D",
    padding: "0 13px",
    fontWeight: "900",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "14px",
    resize: "vertical",
    fontFamily: "inherit",
  },

  goldButton: {
    width: "100%",
    background: "#F4C20D",
    color: "#050505",
    border: "none",
    borderRadius: "9px",
    padding: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  disabledButton: {
    width: "100%",
    background: "#2A2A2A",
    color: "#777777",
    border: "none",
    borderRadius: "9px",
    padding: "15px",
    fontWeight: "900",
  },

  message: {
    color: "#FFFFFF",
    border: "1px solid #F4C20D",
    borderRadius: "9px",
    padding: "12px",
    marginTop: "15px",
  },

  historySection: {
    marginTop: "40px",
  },

  historyTitle: {
    color: "#FFFFFF",
    fontSize: "27px",
    margin: "7px 0 20px",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  entryCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "22px",
  },

  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
  },

  entryDate: {
    color: "#FFFFFF",
    fontSize: "18px",
    margin: "5px 0 15px",
  },

  measurementGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(110px, 1fr))",
    gap: "8px",
  },

  measurement: {
    background: "#050505",
    borderRadius: "9px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
  },

  measurementValue: {
    color: "#F4C20D",
  },

  measurementLabel: {
    color: "#BDBDBD",
    fontSize: "9px",
    marginTop: "4px",
  },

  notesBox: {
    marginTop: "15px",
    borderLeft: "3px solid #F4C20D",
    paddingLeft: "13px",
  },

  notesTitle: {
    color: "#F4C20D",
    fontSize: "10px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
  },

  emptyCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    color: "#BDBDBD",
    borderRadius: "14px",
    padding: "25px",
  },
};
