"use client";

import { useMemo } from "react";

export default function ClientProgress({
  client,
  progressEntries = [],
}) {
  const sortedEntries = useMemo(() => {
    return [...progressEntries].sort(
      (a, b) =>
        new Date(b.recorded_at) -
        new Date(a.recorded_at)
    );
  }, [progressEntries]);

  if (!client) {
    return (
      <div style={styles.emptyCard}>
        Select a client before viewing progress.
      </div>
    );
  }

  const latest = sortedEntries[0] || null;

  const oldest =
    sortedEntries.length > 0
      ? sortedEntries[
          sortedEntries.length - 1
        ]
      : null;

  const weightChange =
    latest?.weight_lbs != null &&
    oldest?.weight_lbs != null &&
    sortedEntries.length > 1
      ? Number(latest.weight_lbs) -
        Number(oldest.weight_lbs)
      : null;

  return (
    <section>
      <p style={styles.goldLabel}>
        CLIENT PROGRESS
      </p>

      <h2 style={styles.title}>
        {client.full_name || "Client"}'s Progress
      </h2>

      <p style={styles.description}>
        Review weight, body measurements, and
        progress entries recorded by your client.
      </p>

      <div style={styles.summaryGrid}>
        <SummaryCard
          label="LATEST WEIGHT"
          value={
            latest?.weight_lbs != null
              ? `${latest.weight_lbs} lb`
              : "-"
          }
        />

        <SummaryCard
          label="WEIGHT CHANGE"
          value={formatWeightChange(
            weightChange
          )}
        />

        <SummaryCard
          label="ENTRIES"
          value={sortedEntries.length}
        />

        <SummaryCard
          label="LAST UPDATE"
          value={
            latest?.recorded_at
              ? formatDate(
                  latest.recorded_at
                )
              : "None"
          }
        />
      </div>

      {latest && (
        <div style={styles.latestCard}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.goldLabel}>
                LATEST ENTRY
              </p>

              <h3 style={styles.cardTitle}>
                Current Measurements
              </h3>
            </div>

            <span style={styles.dateBadge}>
              {formatDate(
                latest.recorded_at
              )}
            </span>
          </div>

          <div style={styles.measurementGrid}>
            <Measurement
              label="WEIGHT"
              value={latest.weight_lbs}
              suffix="lb"
            />

            <Measurement
              label="WAIST"
              value={latest.waist_inches}
              suffix="in"
            />

            <Measurement
              label="CHEST"
              value={latest.chest_inches}
              suffix="in"
            />

            <Measurement
              label="HIPS"
              value={latest.hips_inches}
              suffix="in"
            />

            <Measurement
              label="ARM"
              value={latest.arm_inches}
              suffix="in"
            />

            <Measurement
              label="THIGH"
              value={latest.thigh_inches}
              suffix="in"
            />
          </div>

          {latest.notes && (
            <div style={styles.notesBox}>
              <strong style={styles.notesTitle}>
                CLIENT NOTE
              </strong>

              <p style={styles.bodyText}>
                {latest.notes}
              </p>
            </div>
          )}
        </div>
      )}

      <div style={styles.historyHeader}>
        <div>
          <p style={styles.goldLabel}>
            HISTORY
          </p>

          <h3 style={styles.cardTitle}>
            Progress Timeline
          </h3>
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>
            No Progress Entries Yet
          </h3>

          <p style={styles.bodyText}>
            Once this client records weight or
            measurements from their member portal,
            their progress will appear here.
          </p>
        </div>
      ) : (
        <div style={styles.historyList}>
          {sortedEntries.map(
            (entry, index) => (
              <ProgressEntry
                key={entry.id}
                entry={entry}
                latest={index === 0}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

function ProgressEntry({
  entry,
  latest,
}) {
  return (
    <div style={styles.historyCard}>
      <div style={styles.historyTop}>
        <div>
          <span style={styles.entryDate}>
            {formatDate(
              entry.recorded_at
            )}
          </span>

          {latest && (
            <span style={styles.latestBadge}>
              LATEST
            </span>
          )}
        </div>

        {entry.weight_lbs != null && (
          <strong style={styles.historyWeight}>
            {entry.weight_lbs} lb
          </strong>
        )}
      </div>

      <div style={styles.historyMeasurements}>
        <SmallMeasurement
          label="Waist"
          value={entry.waist_inches}
        />

        <SmallMeasurement
          label="Chest"
          value={entry.chest_inches}
        />

        <SmallMeasurement
          label="Hips"
          value={entry.hips_inches}
        />

        <SmallMeasurement
          label="Arm"
          value={entry.arm_inches}
        />

        <SmallMeasurement
          label="Thigh"
          value={entry.thigh_inches}
        />
      </div>

      {entry.notes && (
        <p style={styles.entryNotes}>
          {entry.notes}
        </p>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}) {
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

function Measurement({
  label,
  value,
  suffix,
}) {
  return (
    <div style={styles.measurementCard}>
      <span style={styles.measurementLabel}>
        {label}
      </span>

      <strong style={styles.measurementValue}>
        {value != null
          ? `${value} ${suffix}`
          : "-"}
      </strong>
    </div>
  );
}

function SmallMeasurement({
  label,
  value,
}) {
  if (value == null) {
    return null;
  }

  return (
    <span style={styles.smallMeasurement}>
      {label}: {value} in
    </span>
  );
}

function formatWeightChange(value) {
  if (value == null) {
    return "-";
  }

  const rounded =
    Math.round(value * 10) / 10;

  if (rounded === 0) {
    return "0 lb";
  }

  return `${
    rounded > 0 ? "+" : ""
  }${rounded} lb`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

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
    fontSize: "20px",
  },

  summaryLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
    marginTop: "5px",
  },

  latestCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "22px",
    marginBottom: "25px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: "22px",
    margin: "7px 0 18px",
  },

  dateBadge: {
    background: "#050505",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "20px",
    padding: "8px 11px",
    fontSize: "9px",
  },

  measurementGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "9px",
  },

  measurementCard: {
    background: "#050505",
    borderRadius: "9px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
  },

  measurementLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
  },

  measurementValue: {
    color: "#FFFFFF",
    fontSize: "16px",
    marginTop: "5px",
  },

  notesBox: {
    background: "#050505",
    borderLeft:
      "3px solid #F4C20D",
    padding: "15px",
    marginTop: "15px",
  },

  notesTitle: {
    color: "#F4C20D",
    fontSize: "9px",
  },

  bodyText: {
    color: "#BDBDBD",
    lineHeight: 1.6,
    fontSize: "12px",
  },

  historyHeader: {
    marginTop: "10px",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  historyCard: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "13px",
    padding: "17px",
  },

  historyTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
  },

  entryDate: {
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "800",
  },

  latestBadge: {
    marginLeft: "8px",
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "20px",
    padding: "4px 7px",
    fontSize: "7px",
    fontWeight: "900",
  },

  historyWeight: {
    color: "#F4C20D",
    fontSize: "16px",
  },

  historyMeasurements: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
    marginTop: "12px",
  },

  smallMeasurement: {
    background: "#050505",
    color: "#BDBDBD",
    borderRadius: "15px",
    padding: "6px 8px",
    fontSize: "9px",
  },

  entryNotes: {
    color: "#777777",
    fontSize: "11px",
    lineHeight: 1.5,
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
};
