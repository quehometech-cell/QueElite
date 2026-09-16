"use client";

import { useState } from "react";

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const tabs = [
    "Dashboard",
    "My Workouts",
    "Nutrition",
    "Progress",
    "Check-In",
    "Exercise Library",
  ];

  const cardStyle = {
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "28px",
  };

  const renderContent = () => {
    if (activeTab === "My Workouts") {
      return (
        <section>
          <h1 style={{ color: "#F4C20D" }}>MY WORKOUTS 🏋️</h1>
          <p style={{ color: "#BDBDBD" }}>
            Your personalized training plan will appear here.
          </p>

          <div style={cardStyle}>
            <h2>Today's Workout</h2>
            <p style={{ color: "#BDBDBD" }}>
              No workout has been assigned yet.
            </p>
          </div>
        </section>
      );
    }

    if (activeTab === "Nutrition") {
      return (
        <section>
          <h1 style={{ color: "#F4C20D" }}>NUTRITION 🥗</h1>
          <p style={{ color: "#BDBDBD" }}>
            Your nutrition targets, meal ideas, and grocery guidance.
          </p>

          <div style={cardStyle}>
            <h2>Your Nutrition Plan</h2>
            <p style={{ color: "#BDBDBD" }}>
              No nutrition plan has been assigned yet.
            </p>
          </div>
        </section>
      );
    }

    if (activeTab === "Progress") {
      return (
        <section>
          <h1 style={{ color: "#F4C20D" }}>MY PROGRESS 📈</h1>
          <p style={{ color: "#BDBDBD" }}>
            Track your fitness journey over time.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            <div style={cardStyle}>
              <h3>Weight</h3>
              <p style={{ color: "#F4C20D", fontSize: "28px" }}>--</p>
            </div>

            <div style={cardStyle}>
              <h3>Workouts</h3>
              <p style={{ color: "#F4C20D", fontSize: "28px" }}>0</p>
            </div>

            <div style={cardStyle}>
              <h3>Check-Ins</h3>
              <p style={{ color: "#F4C20D", fontSize: "28px" }}>0</p>
            </div>
          </div>
        </section>
      );
    }

    if (activeTab === "Check-In") {
      return (
        <section>
          <h1 style={{ color: "#F4C20D" }}>WEEKLY CHECK-IN ✅</h1>
          <p style={{ color: "#BDBDBD" }}>
            Tell Que how your week went so your coaching can be adjusted.
          </p>

          <div style={cardStyle}>
            <h2>Weekly Check-In</h2>
            <p style={{ color: "#BDBDBD" }}>
              Your check-in form will go here.
            </p>
          </div>
        </section>
      );
    }

    if (activeTab === "Exercise Library") {
      return (
        <section>
          <h1 style={{ color: "#F4C20D" }}>EXERCISE LIBRARY 🎥</h1>
          <p style={{ color: "#BDBDBD" }}>
            Exercise demonstrations and technique guidance.
          </p>

          <div style={cardStyle}>
            <h2>Exercise Videos</h2>
            <p style={{ color: "#BDBDBD" }}>
              Your exercise library is coming next.
            </p>
          </div>
        </section>
      );
    }

    return (
      <section>
        <p
          style={{
            color: "#F4C20D",
            fontWeight: "800",
            letterSpacing: "2px",
          }}
        >
          GET CHA RIGHT FITNESS
        </p>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 60px)",
            margin: "5px 0 10px",
          }}
        >
          MEMBER DASHBOARD
        </h1>

        <p style={{ color: "#BDBDBD", fontSize: "18px" }}>
          Your training. Your nutrition. Your progress. All in one place.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "18px",
            marginTop: "35px",
          }}
        >
          {[
            ["🏋️", "My Workouts"],
            ["🥗", "Nutrition"],
            ["📈", "Progress"],
            ["✅", "Check-In"],
            ["🎥", "Exercise Library"],
          ].map(([icon, title]) => (
            <button
              key={title}
              onClick={() => setActiveTab(title)}
              style={{
                ...cardStyle,
                color: "#FFFFFF",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "32px" }}>{icon}</div>

              <h2
                style={{
                  color: "#F4C20D",
                  fontSize: "19px",
                }}
              >
                {title.toUpperCase()}
              </h2>

              <span style={{ color: "#BDBDBD" }}>
                Open section →
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#FFFFFF",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          borderBottom: "1px solid #2A2A2A",
          background: "#111111",
          padding: "15px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1150px",
            margin: "0 auto",
            display: "flex",
            gap: "10px",
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background:
                  activeTab === tab ? "#F4C20D" : "transparent",
                color:
                  activeTab === tab ? "#050505" : "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "11px 16px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab}
            </button>
          ))}

          <a
            href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "transparent",
              color: "#F4C20D",
              border: "1px solid #F4C20D",
              borderRadius: "8px",
              padding: "10px 16px",
              fontWeight: "700",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Book With Que
          </a>
        </div>
      </nav>

      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
          padding: "50px 20px",
        }}
      >
        {renderContent()}
      </div>
    </main>
  );
}
