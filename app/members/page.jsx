"u"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function MembersPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const tabs = [
    "Dashboard",
    "My Workouts",
    "Nutrition",
    "Progress",
    "Check-In",
    "Exercise Library",
  ];

  useEffect(() => {
    let mounted = true;

    async function protectMemberPortal() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      if (!mounted) return;

      const currentUser = session.user;
      setUser(currentUser);

      // Check membership status.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("membership_status")
        .eq("id", currentUser.id)
        .single();

      if (profileError || profile?.membership_status !== "active") {
        router.replace("/membership-required");
        return;
      }

      // Check whether onboarding has been completed.
      const { data: assessment, error: assessmentError } = await supabase
        .from("onboarding_assessments")
        .select("id, completed")
        .eq("user_id", currentUser.id)
        .eq("completed", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (assessmentError) {
        console.error("Assessment check failed:", assessmentError);
      }

      if (!assessment?.completed) {
        router.replace("/onboarding");
        return;
      }

      if (mounted) {
        setLoading(false);
      }
    }

    protectMemberPortal();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

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
              Your assigned workouts will load here.
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
              Your nutrition guidance will appear here.
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
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
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
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
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

              <h2 style={{ color: "#F4C20D", fontSize: "19px" }}>
                {title.toUpperCase()}
              </h2>

              <span style={{ color: "#BDBDBD" }}>Open section →</span>
            </button>
          ))}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#F4C20D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "800",
        }}
      >
        CHECKING MEMBERSHIP...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#FFFFFF",
      }}
    >
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

          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              color: "#FFFFFF",
              border: "1px solid #2A2A2A",
              borderRadius: "8px",
              padding: "10px 16px",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Log Out
          </button>
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
