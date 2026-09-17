"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setCanReset(Boolean(session));
      setCheckingSession(false);

      if (!session) {
        setMessageType("error");
        setMessage(
          "This password reset link is invalid or has expired. Request a new reset email from the login page."
        );
      }
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || session) {
        setCanReset(true);
        setCheckingSession(false);
        setMessage("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("error");

    if (password.length < 8) {
      setMessage("Your new password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    if (!canReset) {
      setMessage(
        "This password reset session is no longer available. Request a new reset email."
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessageType("success");
    setMessage("Password updated. Taking you back to sign in...");

    await supabase.auth.signOut();

    setTimeout(() => {
      router.replace("/login");
      router.refresh();
    }, 1200);
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
            fontSize: "36px",
            margin: "8px 0",
          }}
        >
          RESET PASSWORD
        </h1>

        <p
          style={{
            color: "#BDBDBD",
            marginBottom: "28px",
            lineHeight: "1.6",
          }}
        >
          Create a new password for your Get Cha Right member account.
        </p>

        {checkingSession ? (
          <p style={{ color: "#BDBDBD" }}>
            Verifying your reset link...
          </p>
        ) : (
          <form
            onSubmit={handleResetPassword}
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
              New Password

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading || !canReset}
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
              Confirm New Password

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading || !canReset}
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
              disabled={loading || !canReset}
              style={{
                background:
                  canReset ? "#F4C20D" : "#2A2A2A",
                color:
                  canReset ? "#050505" : "#BDBDBD",
                border: "none",
                borderRadius: "8px",
                padding: "16px",
                fontWeight: "900",
                fontSize: "16px",
                cursor:
                  loading || !canReset
                    ? "not-allowed"
                    : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>
          </form>
        )}

        {!checkingSession && !canReset && (
          <a
            href="/login"
            style={{
              display: "block",
              color: "#F4C20D",
              textAlign: "center",
              marginTop: "22px",
              textDecoration: "none",
              fontWeight: "800",
            }}
          >
            REQUEST A NEW RESET LINK
          </a>
        )}

        <a
          href="/login"
          style={{
            display: "block",
            color: "#BDBDBD",
            textAlign: "center",
            marginTop: "22px",
            textDecoration: "none",
          }}
        >
          ← Back to Member Login
        </a>
      </div>
    </main>
  );
}
