"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function PaymentSuccessPage() {
  const router = useRouter();

  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState(
    "Confirming your Get Cha Right Fitness membership..."
  );

  useEffect(() => {
    let cancelled = false;
    let intervalId;

    async function checkMembership() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (!cancelled) {
            setStatus("login");
            setMessage(
              "Your payment may be complete, but you need to sign in to continue."
            );
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("membership_status")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profile?.membership_status === "active") {
          if (!cancelled) {
            setStatus("active");
            setMessage("Your membership is active. Welcome to Get Cha Right.");

            clearInterval(intervalId);

            setTimeout(() => {
              router.replace("/onboarding");
              router.refresh();
            }, 1800);
          }

          return;
        }

        if (!cancelled) {
          setStatus("pending");
          setMessage(
            "Payment received. We're finishing your membership activation."
          );
        }
      } catch (error) {
        console.error("Membership verification error:", error);

        if (!cancelled) {
          setStatus("pending");
          setMessage(
            "We're still confirming your membership. Please give us a moment."
          );
        }
      }
    }

    checkMembership();

    intervalId = setInterval(() => {
      checkMembership();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [router]);

  return (
    <main className="page">
      <section className="card">
        <a href="/" className="brand">
          GET CHA RIGHT
        </a>

        <div
          className={`status-icon ${
            status === "active" ? "success" : ""
          }`}
        >
          {status === "active" ? "✓" : ""}
        </div>

        <div className="eyebrow">
          {status === "active"
            ? "MEMBERSHIP ACTIVE"
            : status === "login"
              ? "SIGN IN REQUIRED"
              : "PAYMENT CONFIRMATION"}
        </div>

        <h1>
          {status === "active"
            ? "You're In."
            : status === "login"
              ? "Almost There."
              : "We're Getting You Set Up."}
        </h1>

        <p className="message">{message}</p>

        {(status === "checking" || status === "pending") && (
          <>
            <div className="loader">
              <div className="loader-bar" />
            </div>

            <p className="small">
              Keep this page open. This normally only takes a moment.
            </p>
          </>
        )}

        {status === "active" && (
          <div className="success-box">
            <span>✓</span>

            <div>
              <strong>Payment verified</strong>
              <p>
                Taking you to your personalized onboarding assessment...
              </p>
            </div>
          </div>
        )}

        {status === "login" && (
          <button
            type="button"
            className="primary-button"
            onClick={() => router.push("/login")}
          >
            SIGN IN TO CONTINUE →
          </button>
        )}

        {status === "pending" && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => router.push("/membership-required")}
          >
            CHECK MEMBERSHIP STATUS
          </button>
        )}

        <div className="security">
          <span>🔒</span>

          <p>
            Membership access is only unlocked after your payment has been
            securely verified.
          </p>
        </div>

        <a href="/" className="home-link">
          Back to website
        </a>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          background:
            radial-gradient(
              circle at top,
              rgba(244, 194, 13, 0.1),
              transparent 32rem
            ),
            #050505;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
        }

        .card {
          width: 100%;
          max-width: 580px;
          background: #111111;
          border: 1px solid #2a2a2a;
          border-radius: 20px;
          padding: 38px;
          text-align: center;
          box-shadow: 0 20px 70px rgba(0, 0, 0, 0.45);
        }

        .brand {
          display: inline-block;
          color: #f4c20d;
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 32px;
        }

        .status-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 20px;
          border: 3px solid #f4c20d;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .status-icon.success {
          display: flex;
          justify-content: center;
          align-items: center;
          border-color: #f4c20d;
          color: #050505;
          background: #f4c20d;
          font-size: 30px;
          font-weight: 900;
          animation: none;
        }

        .eyebrow {
          color: #f4c20d;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.8px;
          margin-bottom: 10px;
        }

        h1 {
          margin: 0;
          font-size: clamp(34px, 8vw, 50px);
          line-height: 1;
          letter-spacing: -1.5px;
        }

        .message {
          color: #bdbdbd;
          font-size: 16px;
          line-height: 1.6;
          margin: 18px auto 0;
          max-width: 450px;
        }

        .loader {
          height: 5px;
          width: 100%;
          overflow: hidden;
          background: #252525;
          border-radius: 999px;
          margin-top: 28px;
        }

        .loader-bar {
          width: 38%;
          height: 100%;
          background: #f4c20d;
          border-radius: 999px;
          animation: loading 1.4s ease-in-out infinite;
        }

        .small {
          color: #777777;
          font-size: 12px;
          line-height: 1.5;
          margin: 12px 0 0;
        }

        .success-box {
          display: flex;
          gap: 13px;
          align-items: flex-start;
          text-align: left;
          background: rgba(244, 194, 13, 0.06);
          border: 1px solid rgba(244, 194, 13, 0.25);
          border-radius: 12px;
          padding: 17px;
          margin-top: 26px;
        }

        .success-box > span {
          color: #f4c20d;
          font-size: 20px;
          font-weight: 900;
        }

        .success-box strong {
          font-size: 14px;
        }

        .success-box p {
          color: #8f8f8f;
          font-size: 12px;
          line-height: 1.5;
          margin: 5px 0 0;
        }

        .primary-button,
        .secondary-button {
          width: 100%;
          min-height: 52px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          margin-top: 26px;
        }

        .primary-button {
          border: none;
          background: #f4c20d;
          color: #050505;
        }

        .secondary-button {
          border: 1px solid #3a3a3a;
          background: #181818;
          color: #ffffff;
        }

        .security {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 8px;
          padding-top: 24px;
          margin-top: 24px;
          border-top: 1px solid #252525;
        }

        .security p {
          color: #777777;
          font-size: 11px;
          line-height: 1.5;
          margin: 0;
          text-align: left;
        }

        .home-link {
          display: inline-block;
          color: #8f8f8f;
          text-decoration: none;
          font-size: 12px;
          margin-top: 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loading {
          0% {
            transform: translateX(-110%);
          }

          50% {
            transform: translateX(110%);
          }

          100% {
            transform: translateX(290%);
          }
        }

        @media (max-width: 600px) {
          .page {
            align-items: flex-start;
            padding: 20px 12px;
          }

          .card {
            padding: 30px 18px;
            border-radius: 16px;
          }
        }
      `}</style>
    </main>
  );
}
