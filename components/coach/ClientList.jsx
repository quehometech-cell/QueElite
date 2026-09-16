"use client";

import { useMemo, useState } from "react";

export default function ClientList({
  clients = [],
  selectedClientId,
  onSelectClient,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredClients = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return clients.filter((client) => {
      const searchableText = [
        client.full_name,
        client.email,
        client.program_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      const matchesFilter =
        filter === "all" ||
        (filter === "attention" &&
          client.needs_attention) ||
        (filter === "active" &&
          client.membership_status === "active");

      return matchesSearch && matchesFilter;
    });
  }, [clients, search, filter]);

  const attentionCount = clients.filter(
    (client) => client.needs_attention
  ).length;

  return (
    <section>
      <p style={styles.goldLabel}>CLIENTS</p>

      <h2 style={styles.title}>
        COACHING ROSTER
      </h2>

      <p style={styles.description}>
        Select a client to review their training,
        nutrition, progress, check-ins, corrective work,
        and coaching notes.
      </p>

      <div style={styles.summaryGrid}>
        <Summary
          value={clients.length}
          label="TOTAL CLIENTS"
        />

        <Summary
          value={
            clients.filter(
              (client) =>
                client.membership_status === "active"
            ).length
          }
          label="ACTIVE"
        />

        <Summary
          value={attentionCount}
          label="NEEDS REVIEW"
        />
      </div>

      <div style={styles.controls}>
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search clients..."
          style={styles.searchInput}
        />

        <div style={styles.filters}>
          <FilterButton
            label="ALL"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />

          <FilterButton
            label="ACTIVE"
            active={filter === "active"}
            onClick={() => setFilter("active")}
          />

          <FilterButton
            label={`NEEDS REVIEW (${attentionCount})`}
            active={filter === "attention"}
            onClick={() =>
              setFilter("attention")
            }
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>
            No Clients Found
          </h3>

          <p style={styles.bodyText}>
            No clients match the current search or
            filter.
          </p>
        </div>
      ) : (
        <div style={styles.clientList}>
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              selected={
                selectedClientId === client.id
              }
              onClick={() =>
                onSelectClient(client.id)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ClientCard({
  client,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.clientCard,
        ...(selected
          ? styles.clientCardSelected
          : {}),
      }}
    >
      <div style={styles.clientTop}>
        <div style={styles.avatar}>
          {getInitials(
            client.full_name ||
              client.email ||
              "Client"
          )}
        </div>

        <div style={styles.clientIdentity}>
          <strong style={styles.clientName}>
            {client.full_name ||
              "Get Cha Right Client"}
          </strong>

          <span style={styles.email}>
            {client.email}
          </span>
        </div>

        <div style={styles.badges}>
          {client.membership_status ===
            "active" && (
            <span style={styles.activeBadge}>
              ACTIVE
            </span>
          )}

          {client.needs_attention && (
            <span style={styles.reviewBadge}>
              REVIEW
            </span>
          )}
        </div>
      </div>

      <div style={styles.clientStats}>
        <ClientStat
          label="PROGRAM"
          value={
            client.program_name ||
            "Not Assigned"
          }
        />

        <ClientStat
          label="THIS WEEK"
          value={`${client.weekly_workouts || 0} workouts`}
        />

        <ClientStat
          label="LATEST WEIGHT"
          value={
            client.latest_weight
              ? `${client.latest_weight} lb`
              : "No entry"
          }
        />

        <ClientStat
          label="LAST CHECK-IN"
          value={
            client.last_checkin
              ? formatDate(
                  client.last_checkin
                )
              : "None"
          }
        />
      </div>

      {client.attention_reasons?.length >
        0 && (
        <div style={styles.attentionBox}>
          <strong style={styles.attentionTitle}>
            COACH REVIEW
          </strong>

          <span style={styles.attentionText}>
            {client.attention_reasons.join(
              " • "
            )}
          </span>
        </div>
      )}

      <div style={styles.openClient}>
        OPEN CLIENT →
      </div>
    </button>
  );
}

function ClientStat({ label, value }) {
  return (
    <div style={styles.clientStat}>
      <span style={styles.statLabel}>
        {label}
      </span>

      <strong style={styles.statText}>
        {value}
      </strong>
    </div>
  );
}

function Summary({ value, label }) {
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

function FilterButton({
  label,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        active
          ? styles.filterActive
          : styles.filterButton
      }
    >
      {label}
    </button>
  );
}

function getInitials(value) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function formatDate(value) {
  if (!value) return "";

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
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "22px",
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
    fontSize: "28px",
  },

  summaryLabel: {
    color: "#BDBDBD",
    fontSize: "9px",
    marginTop: "4px",
    fontWeight: "900",
  },

  controls: {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "15px",
    marginBottom: "20px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    background: "#050505",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "9px",
    padding: "14px",
    outline: "none",
    fontSize: "14px",
  },

  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "12px",
  },

  filterButton: {
    background: "#050505",
    color: "#BDBDBD",
    border: "1px solid #2A2A2A",
    borderRadius: "20px",
    padding: "8px 11px",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "900",
  },

  filterActive: {
    background: "#F4C20D",
    color: "#050505",
    border: "1px solid #F4C20D",
    borderRadius: "20px",
    padding: "8px 11px",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "900",
  },

  clientList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  clientCard: {
    width: "100%",
    background: "#111111",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
    borderRadius: "15px",
    padding: "20px",
    textAlign: "left",
    cursor: "pointer",
  },

  clientCardSelected: {
    border: "1px solid #F4C20D",
  },

  clientTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "50%",
    background: "#F4C20D",
    color: "#050505",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
  },

  clientIdentity: {
    flex: 1,
    minWidth: 0,
  },

  clientName: {
    display: "block",
    color: "#FFFFFF",
    fontSize: "15px",
  },

  email: {
    display: "block",
    color: "#777777",
    fontSize: "11px",
    marginTop: "3px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  badges: {
    display: "flex",
    gap: "5px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  activeBadge: {
    background: "#202020",
    color: "#F4C20D",
    border: "1px solid #F4C20D",
    borderRadius: "20px",
    padding: "5px 8px",
    fontSize: "8px",
    fontWeight: "900",
  },

  reviewBadge: {
    background: "#F4C20D",
    color: "#050505",
    borderRadius: "20px",
    padding: "5px 8px",
    fontSize: "8px",
    fontWeight: "900",
  },

  clientStats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "8px",
    marginTop: "16px",
  },

  clientStat: {
    background: "#050505",
    borderRadius: "8px",
    padding: "11px",
    display: "flex",
    flexDirection: "column",
  },

  statLabel: {
    color: "#777777",
    fontSize: "8px",
    fontWeight: "900",
  },

  statText: {
    color: "#FFFFFF",
    fontSize: "11px",
    marginTop: "4px",
  },

  attentionBox: {
    background: "#050505",
    borderLeft: "3px solid #F4C20D",
    padding: "12px",
    marginTop: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  attentionTitle: {
    color: "#F4C20D",
    fontSize: "9px",
  },

  attentionText: {
    color: "#BDBDBD",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  openClient: {
    color: "#F4C20D",
    fontWeight: "900",
    fontSize: "10px",
    marginTop: "15px",
  },

  emptyCard: {
    background: "#111111",
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
  },
};
