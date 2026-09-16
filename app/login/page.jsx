"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
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
    }
  }

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

          {message && (
            <p
              style={{
                color: "#ff6b6b",
                margin: 0,
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#F4C20D",
              color: "#050505",
              border: "none",
              borderRadius: "8px",
              padding: "16px",
              fontWeight: "900",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "5px",
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
