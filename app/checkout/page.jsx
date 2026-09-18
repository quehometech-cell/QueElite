"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/join");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleCheckout() {
    try {
      setCheckoutLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      if (!data.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        "We couldn't open secure checkout. Please try again."
      );
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="page loading-page">
        <div className="loading">Loading...</div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #050505;
            color: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
          }

          .loading-page {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading {
            color: #bdbdbd;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="checkout">
        <a href="/" className="brand">
          GET CHA RIGHT
        </a>

        <div className="eyebrow">ONLINE COACHING</div>

        <h1>You're One Step Away.</h1>

        <p className="intro">
          Your account is ready. Complete your membership to unlock your
          personalized Get Cha Right Fitness coaching experience.
        </p>

        <div className="account">
          <span>ACCOUNT</span>
          <strong>{user?.email}</strong>
        </div>

        <div className="offer">
          <div className="offer-top">
            <div>
              <div className="popular">GET CHA RIGHT COACHING</div>
              <h2>Online Transformation Coaching</h2>
            </div>

            <div className="badge">COACHING</div>
          </div>

          <p className="description">
            Built for people who sit for work but still want to get stronger,
            move better, and lose body fat.
          </p>

          <div className="price">
            <strong>$129</strong>
            <span>/ month</span>
          </div>

          <div className="features">
            <div>
              <span>✓</span>
              Personalized training program
            </div>

            <div>
              <span>✓</span>
              Corrective mobility programming
            </div>

            <div>
              <span>✓</span>
              Nutrition targets and tracking
            </div>

            <div>
              <span>✓</span>
              Progress tracking
            </div>

            <div>
              <span>✓</span>
              Weekly check-ins
            </div>

            <div>
              <span>✓</span>
              Private member dashboard
            </div>

            <div>
              <span>✓</span>
              Coach program adjustments
            </div>
          </div>

          <div className="divider" />

          <div className="status">
            <div>
              <span className="status-label">PAYMENT</span>
              <strong>Secure checkout powered by Stripe</strong>
            </div>

            <span className="secure">SECURE</span>
          </div>

          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading
              ? "OPENING SECURE CHECKOUT..."
              : "COMPLETE MEMBERSHIP →"}
          </button>

          {error && <p className="error">{error}</p>}

          <p className="temporary">
            $129/month. Your membership renews monthly until canceled.
          </p>
        </div>

        <div className="security">
          <div>🔒</div>

          <div>
            <strong>Protected membership access</strong>
            <p>
              Creating an account does not activate paid coaching. Membership
              access is activated only after a successful payment is confirmed.
            </p>
          </div>
        </div>

        <div className="bottom-links">
          <a href="/login">Sign in</a>
          <span>•</span>
          <a href="/">Back to website</a>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(
              circle at top,
              rgba(244, 194, 13, 0.08),
              transparent 34rem
            ),
            #050505;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          padding: 40px 18px;
        }

        .checkout {
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
        }

        .brand {
          display: inline-block;
          color: #f4c20d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 40px;
        }

        .eyebrow {
          color: #f4c20d;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        h1 {
          margin: 0;
          font-size: clamp(38px, 8vw, 60px);
          line-height: 0.98;
          letter-spacing: -2px;
        }

        .intro {
          color: #bdbdbd;
          font-size: 17px;
          line-height: 1.65;
          max-width: 610px;
          margin: 18px 0 26px;
        }

        .account {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          background: #0c0c0c;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          padding: 13px 15px;
          margin-bottom: 16px;
          font-size: 13px;
        }

        .account span {
          color: #777777;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .account strong {
          overflow-wrap: anywhere;
          text-align: right;
        }

        .offer {
          background: #111111;
          border: 1px solid #363636;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .offer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .popular {
          color: #f4c20d;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        h2 {
          margin: 0;
          font-size: 27px;
          line-height: 1.15;
        }

        .badge {
          flex-shrink: 0;
          background: #f4c20d;
          color: #050505;
          padding: 7px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.7px;
        }

        .description {
          color: #9f9f9f;
          line-height: 1.6;
          margin: 16px 0 12px;
        }

        .price {
          display: flex;
          align-items: baseline;
          gap: 7px;
          margin-bottom: 24px;
        }

        .price strong {
          color: #ffffff;
          font-size: 34px;
          line-height: 1;
        }

        .price span {
          color: #8d8d8d;
          font-size: 14px;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px 20px;
          color: #dddddd;
          font-size: 14px;
        }

        .features div {
          display: flex;
          gap: 9px;
          align-items: flex-start;
        }

        .features span {
          color: #f4c20d;
          font-weight: 900;
        }

        .divider {
          height: 1px;
          background: #2a2a2a;
          margin: 26px 0;
        }

        .status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
        }

        .status > div {
          display: grid;
          gap: 4px;
        }

        .status-label {
          color: #777777;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .secure {
          color: #f4c20d;
          border: 1px solid rgba(244, 194, 13, 0.35);
          background: rgba(244, 194, 13, 0.07);
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.7px;
        }

        .checkout-button {
          width: 100%;
          min-height: 56px;
          border: 0;
          border-radius: 10px;
          background: #f4c20d;
          color: #050505;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            opacity 0.15s ease;
        }

        .checkout-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .checkout-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .temporary {
          color: #777777;
          text-align: center;
          font-size: 12px;
          line-height: 1.5;
          margin: 12px 0 0;
        }

        .error {
          color: #ff7777;
          text-align: center;
          font-size: 13px;
          line-height: 1.5;
          margin: 12px 0 0;
        }

        .security {
          display: flex;
          gap: 13px;
          background: #0c0c0c;
          border: 1px solid #252525;
          border-radius: 12px;
          padding: 17px;
          margin-top: 16px;
        }

        .security strong {
          font-size: 13px;
        }

        .security p {
          color: #777777;
          font-size: 12px;
          line-height: 1.5;
          margin: 5px 0 0;
        }

        .bottom-links {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 28px;
          color: #555555;
          font-size: 13px;
        }

        .bottom-links a {
          color: #8d8d8d;
          text-decoration: none;
        }

        @media (max-width: 600px) {
          .page {
            padding: 22px 12px 35px;
          }

          .brand {
            margin-bottom: 30px;
          }

          .offer {
            padding: 22px 17px;
          }

          .offer-top {
            display: grid;
          }

          .features {
            grid-template-columns: 1fr;
          }

          .account {
            display: grid;
          }

          .account strong {
            text-align: left;
          }

          .status {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
