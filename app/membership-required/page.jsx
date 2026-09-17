"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function MembershipRequiredPage() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "620px",
          background: "#111111",
          border: "1px solid #2A2A2A",
          borderRadius: "20px",
          padding: "36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "#F4C20D",
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "1.5px",
            marginBottom: "12px",
          }}
        >
          GET CHA RIGHT FITNESS
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            fontWeight: "900",
          }}
        >
          Membership Required
        </h1>

        <p
          style={{
            color: "#BDBDBD",
            fontSize: "16px",
            lineHeight: "1.6",
            margin: "16px auto 0",
            maxWidth: "500px",
          }}
        >
          Your account is working, but you need an active Get Cha Right
          Fitness membership to access your coaching dashboard.
        </p>

        <div
          style={{
            background: "#050505",
            border: "1px solid #2A2A2A",
            borderRadius: "14px",
            padding: "20px",
            marginTop: "28px",
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontWeight: "800",
              fontSize: "18px",
            }}
          >
            Ready to start?
          </div>

          <div
            style={{
              color: "#BDBDBD",
              marginTop: "8px",
              lineHeight: "1.5",
            }}
          >
            Activate your coaching membership to unlock workouts,
            nutrition guidance, mobility routines, progress tracking,
            weekly check-ins, and coach support.
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/#pricing")}
          style={{
            width: "100%",
            marginTop: "24px",
            padding: "14px 20px",
            border: "none",
            borderRadius: "10px",
            background: "#F4C20D",
            color: "#050505",
            fontSize: "16px",
            fontWeight: "900",
            cursor: "pointer",
          }}
        >
          View Coaching Plans
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "13px 20px",
            border: "1px solid #2A2A2A",
            borderRadius: "10px",
            background: "transparent",
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Log Out
        </button>

        <div
          style={{
            color: "#777777",
            fontSize: "12px",
            marginTop: "20px",
          }}
        >
          Already paid? Your membership status may still be updating.
        </div>
      </div>
    </main>
  );
}
