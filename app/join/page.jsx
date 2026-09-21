"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const packages = {
  "4": {
    weeks: 4,
    name: "Coaching Kickstart",
    todayPrice: 149,
    totalPrice: 149,
    paymentText: "Paid in full",
    priceLabel: "total",
  },

  "6": {
    weeks: 6,
    name: "6-Week Coaching",
    todayPrice: 199,
    totalPrice: 199,
    paymentText: "Paid in full",
    priceLabel: "total",
  },

  "8": {
    weeks: 8,
    name: "Transformation Coaching",
    todayPrice: 249,
    totalPrice: 498,
    paymentText: "$249 today + $249 second payment",
    priceLabel: "to start",
  },

  "12": {
    weeks: 12,
    name: "Transformation Coaching",
    todayPrice: 349,
    totalPrice: 698,
    paymentText: "$349 today + $349 second payment",
    priceLabel: "to start",
  },
};

export default function JoinPage() {
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageLoaded, setPackageLoaded] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const packageParam = params.get("package");

    setSelectedPackage(packages[packageParam] || null);
    setPackageLoaded(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!selectedPackage) {
      setError(
        "Please select a coaching package before creating your account."
      );
      return;
    }

    if (
      !cleanName ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              selected_package_weeks:
                selectedPackage.weeks,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (!data?.user) {
        throw new Error(
          "We couldn't create your account. Please try again."
        );
      }

      /*
        Membership is NOT activated here.

        Stripe payment confirmation will handle activation.
        The selected package is carried forward through the flow.
      */

      if (data.session) {
        router.replace(
          `/membership-required?package=${selectedPackage.weeks}`
        );
        router.refresh();
        return;
      }

      router.replace(
        `/login?message=${encodeURIComponent(
          "Account created. Check your email to confirm your account, then sign in."
        )}&package=${selectedPackage.weeks}`
      );
    } catch (err) {
      console.error("Join error:", err);
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="join-page">
      <section className="join-card">
        <a href="/" className="brand">
          GET CHA RIGHT
        </a>

        <div className="eyebrow">
          ONLINE COACHING
        </div>

        <h1>Start Your Transformation</h1>

        <p className="intro">
          Create your account to begin your Get Cha
          Right Fitness journey.
        </p>

        {packageLoaded && selectedPackage && (
          <div className="selected-package">
            <div className="package-info">
              <span className="package-label">
                YOUR COACHING PLAN
              </span>

              <strong>
                {selectedPackage.weeks}-Week{" "}
                {selectedPackage.name}
              </strong>

              <div className="payment-details">
                <span className="payment-text">
                  {selectedPackage.paymentText}
                </span>

                <span className="total-commitment">
                  Total coaching commitment: $
                  {selectedPackage.totalPrice}
                </span>
              </div>
            </div>

            <div className="package-price">
              ${selectedPackage.todayPrice}
              <span>
                {" "}
                {selectedPackage.priceLabel}
              </span>
            </div>
          </div>
        )}

        {packageLoaded && !selectedPackage && (
          <div className="package-warning">
            No coaching package selected.{" "}
            <a href="/#pricing">
              Choose a package
            </a>{" "}
            before creating your account.
          </div>
        )}

        <div className="benefits">
          <div>
            <span>✓</span>
            Personalized onboarding
          </div>

          <div>
            <span>✓</span>
            Training built around your goals
          </div>

          <div>
            <span>✓</span>
            Nutrition and progress tracking
          </div>

          <div>
            <span>✓</span>
            Your private member portal
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              placeholder="Your full name"
              autoComplete="name"
              disabled={loading}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Enter password again"
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            className="submit-button"
            type="submit"
            disabled={
              loading ||
              !packageLoaded ||
              !selectedPackage
            }
          >
            {loading
              ? "CREATING ACCOUNT..."
              : "CREATE ACCOUNT & CONTINUE →"}
          </button>
        </form>

        <p className="payment-note">
          You will not be charged on this page.
        </p>

        <p className="login">
          Already have an account?{" "}
          <a
            href={
              selectedPackage
                ? `/login?package=${selectedPackage.weeks}`
                : "/login"
            }
          >
            Sign in
          </a>
        </p>
      </section>

      <style jsx>{`
        .join-page {
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(
              circle at top,
              rgba(244, 194, 13, 0.08),
              transparent 32rem
            ),
            #050505;
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 18px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .join-card {
          width: 100%;
          max-width: 540px;
          background: #111111;
          border: 1px solid #2a2a2a;
          border-radius: 18px;
          padding: 38px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .brand {
          display: inline-block;
          color: #f4c20d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #f4c20d;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        h1 {
          margin: 0;
          font-size: clamp(32px, 7vw, 48px);
          line-height: 1;
          letter-spacing: -1.5px;
        }

        .intro {
          color: #bdbdbd;
          font-size: 16px;
          line-height: 1.6;
          margin: 16px 0 24px;
        }

        .selected-package {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          padding: 17px 18px;
          margin-bottom: 20px;
          background: rgba(244, 194, 13, 0.07);
          border: 1px solid rgba(244, 194, 13, 0.4);
          border-radius: 12px;
        }

        .package-info {
          display: grid;
          gap: 5px;
        }

        .package-label {
          color: #f4c20d;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .selected-package strong {
          color: #ffffff;
          font-size: 15px;
        }

        .payment-details {
          display: grid;
          gap: 3px;
          margin-top: 5px;
        }

        .payment-text {
          color: #d7d7d7;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.4;
        }

        .total-commitment {
          color: #8f8f8f;
          font-size: 11px;
          line-height: 1.4;
        }

        .package-price {
          color: #f4c20d;
          font-size: 24px;
          font-weight: 900;
          white-space: nowrap;
        }

        .package-price span {
          color: #888888;
          font-size: 11px;
          font-weight: 700;
        }

        .package-warning {
          padding: 14px 16px;
          margin-bottom: 20px;
          background: rgba(255, 180, 0, 0.08);
          border: 1px solid rgba(255, 180, 0, 0.3);
          border-radius: 10px;
          color: #d6d6d6;
          font-size: 13px;
          line-height: 1.5;
        }

        .package-warning a {
          color: #f4c20d;
          font-weight: 800;
        }

        .benefits {
          display: grid;
          gap: 10px;
          margin-bottom: 28px;
          padding: 18px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          color: #d7d7d7;
          font-size: 14px;
        }

        .benefits div {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .benefits span {
          color: #f4c20d;
          font-weight: 900;
        }

        form {
          display: grid;
          gap: 18px;
        }

        label {
          display: grid;
          gap: 8px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
        }

        input {
          width: 100%;
          min-height: 50px;
          border: 1px solid #333333;
          border-radius: 10px;
          background: #080808;
          color: #ffffff;
          padding: 0 14px;
          font-size: 16px;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        input:focus {
          border-color: #f4c20d;
          box-shadow: 0 0 0 3px rgba(244, 194, 13, 0.1);
        }

        input::placeholder {
          color: #686868;
        }

        input:disabled {
          opacity: 0.6;
        }

        .error {
          background: rgba(255, 75, 75, 0.1);
          border: 1px solid rgba(255, 75, 75, 0.35);
          color: #ff8a8a;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.5;
        }

        .submit-button {
          width: 100%;
          min-height: 54px;
          margin-top: 4px;
          border: none;
          border-radius: 10px;
          background: #f4c20d;
          color: #050505;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.4px;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            opacity 0.15s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .payment-note {
          color: #777777;
          font-size: 12px;
          text-align: center;
          margin: 14px 0 0;
        }

        .login {
          color: #8f8f8f;
          text-align: center;
          font-size: 14px;
          margin: 24px 0 0;
        }

        .login a {
          color: #f4c20d;
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 600px) {
          .join-page {
            align-items: flex-start;
            padding: 20px 12px;
          }

          .join-card {
            padding: 26px 18px;
            border-radius: 14px;
          }

          .brand {
            margin-bottom: 22px;
          }

          .selected-package {
            flex-direction: column;
            gap: 10px;
          }

          .benefits {
            padding: 15px;
          }
        }
      `}</style>
    </main>
  );
}
