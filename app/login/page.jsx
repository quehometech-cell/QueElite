"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const RESET_REDIRECT_URL =
  "https://www.getcharightfitness.com/reset-password";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("error");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      router.replace("/members");
      router.refresh();
      return;
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    const cleanEmail = email.trim();

    setMessage("");

    if (!cleanEmail) {
      setMessageType("error");
      setMessage(
        "Enter your email address above, then select Forgot Password."
      );
      return;
    }

    setResetLoading(true);
    setMessageType("error");

    const { error } = await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo: RESET_REDIRECT_URL,
      }
    );

    if (error) {
      setMessage(error.message);
      setResetLoading(false);
      return;
    }

    setMessageType("success");
    setMessage(
      "Password reset email sent. Check your inbox and follow the link to create a new password."
    );
    setResetLoading(false);
  }

  const busy = loading || resetLoading;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#FFFFFF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#111111",
          border: "1px solid #2A2A2A",
          borderRadius: "16px",
          padding: "36px",
        }}
      >
        <p
          style={{
            color: "#F4C20D",
            fontWeight: "800",
            letterSpacing: "2px",
            fontSize: "13px",
          }}
        >
          GET CHA RIGHT FITNESS
        </p>

        <h1
          style={{
            fontSize: "38px",
            margin: "8px 0",
          }}
        >
          MEMBER LOGIN
        </h1>

        <p
          style={{
            color: "#BDBDBD",
            marginBottom: "28px",
            lineHeight: "1.6",
          }}
        >
          Sign in to access your training, nutrition, progress, and coaching.
        </p>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontWeight: "600",
            }}
          >
            Email

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={busy}
              style={{
                background: "#050505",
                color: "#FFFFFF",
                border: "1px solid #2A2A2A",
                borderRadius: "8px",
                padding: "14px",
                fontSize: "16px",
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontWeight: "600",
            }}
          >
            Password

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={busy}
              style={{
                background: "#050505",
                color: "#FFFFFF",
                border: "1px solid #2A2A2A",
                borderRadius: "8px",
                padding: "14px",
                fontSize: "16px",
              }}
            />
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={busy}
            style={{
              alignSelf: "flex-end",
              background: "transparent",
              border: "none",
              color: "#F4C20D",
              padding: 0,
              fontWeight: "800",
              cursor: busy ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            {resetLoading ? "SENDING..." : "FORGOT PASSWORD?"}
          </button>

          {message && (
            <p
              style={{
                color:
                  messageType === "success"
                    ? "#F4C20D"
                    : "#ff6b6b",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              background: "#F4C20D",
              color: "#050505",
              border: "none",
              borderRadius: "8px",
              padding: "16px",
              fontWeight: "900",
              fontSize: "16px",
              cursor: busy ? "not-allowed" : "pointer",
              marginTop: "5px",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <a
          href="/"
          style={{
            display: "block",
            color: "#BDBDBD",
            textAlign: "center",
            marginTop: "22px",
            textDecoration: "none",
          }}
        >
          ← Back to Get Cha Right Fitness
        </a>
      </div>
    </main>
  );
}
