"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const PACKAGES = {
  4: {
    weeks: 4,
    name: "Coaching Kickstart",
    fullName: "4-Week Coaching Kickstart",
    todayPrice: 149,
    totalPrice: 149,
    paymentText: "Paid in full",
    priceLabel: "paid in full",
    badge: "KICKSTART",
  },
  6: {
    weeks: 6,
    name: "6-Week Coaching",
    fullName: "6-Week Coaching",
    todayPrice: 199,
    totalPrice: 199,
    paymentText: "Paid in full",
    priceLabel: "paid in full",
    badge: "COACHING",
  },
  8: {
    weeks: 8,
    name: "Transformation Coaching",
    fullName: "8-Week Transformation Coaching",
    todayPrice: 249,
    totalPrice: 498,
    paymentText: "$249 today + $249 second payment",
    priceLabel: "due today",
    badge: "MOST POPULAR",
  },
  12: {
    weeks: 12,
    name: "Transformation Coaching",
    fullName: "12-Week Transformation Coaching",
    todayPrice: 349,
    totalPrice: 698,
    paymentText: "$349 today + $349 second payment",
    priceLabel: "due today",
    badge: "BEST VALUE",
  },
};

export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCheckout() {
      const params = new URLSearchParams(window.location.search);
      const packageWeeks = params.get("package");
      const pkg = PACKAGES[packageWeeks];

      if (!pkg) {
        setError(
          "No valid coaching package was selected. Please return to the pricing page and choose a package."
        );
        setLoading(false);
        return;
      }

      setSelectedPackage(pkg);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/join?package=${pkg.weeks}`);
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadCheckout();
  }, [router]);

  async function handleCheckout() {
    if (!selectedPackage) {
      setError(
        "No valid coaching package was selected. Please choose a package first."
      );
      return;
    }

    try {
      setCheckoutLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        router.replace(`/login?package=${selectedPackage.weeks}`);
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageWeeks: selectedPackage.weeks,
        }),
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

  if (!selectedPackage) {
    return (
      <main className="page invalid-page">
        <section className="invalid-card">
          <a href="/" className="brand">
            GET CHA RIGHT
          </a>

          <div className="eyebrow">COACHING PACKAGE</div>

          <h1>Select Your Coaching Plan.</h1>

          <p className="intro">
            We couldn't determine which coaching package you selected.
            Return to the website and choose your 4, 6, 8, or 12-week
            coaching plan.
          </p>

          {error && <p className="error">{error}</p>}

          <button
            type="button"
            className="checkout-button"
            onClick={() => router.push("/#pricing")}
          >
            VIEW COACHING PACKAGES →
          </button>
        </section>

        <style jsx>{`
          * {
            box-sizing: border-box;
          }

          .page {
            min-height: 100vh;
            width: 100%;
            background: #050505;
            color: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            padding: 40px 18px;
          }

          .invalid-page {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .invalid-card {
            width: 100%;
            max-width: 620px;
            background: #111111;
            border: 1px solid #363636;
            border-radius: 18px;
            padding: 30px;
          }

          .brand {
            display: inline-block;
            color: #f4c20d;
            text-decoration: none;
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 2px;
            margin-bottom: 30px;
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
            font-size: clamp(36px, 8vw, 54px);
            line-height: 1;
            letter-spacing: -2px;
          }

          .intro {
            color: #bdbdbd;
            font-size: 16px;
            line-height: 1.65;
            margin: 18px 0 22px;
          }

          .error {
            color: #ff7777;
            font-size: 13px;
            line-height: 1.5;
            margin: 0 0 18px;
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
          Your account is ready. Review your selected coaching package and
          continue to secure Stripe checkout.
        </p>

        <div className="account">
          <span>ACCOUNT</span>
          <strong>{user?.email}</strong>
        </div>

        <div className="offer">
          <div className="offer-top">
            <div>
              <div className="popular">GET CHA RIGHT COACHING</div>
              <h2>{selectedPackage.fullName}</h2>
            </div>

            <div className="badge">{selectedPackage.badge}</div>
          </div>

          <p className="description">
            Built for people who sit for work but still want to get stronger,
            move better, improve consistency, and follow a structured plan
            built around real life.
          </p>

          <div className="price">
            <strong>${selectedPackage.todayPrice}</strong>
            <span>{selectedPackage.priceLabel}</span>
          </div>

          <div className="payment-summary">
            <div>
              <span>PAYMENT STRUCTURE</span>
              <strong>{selectedPackage.paymentText}</strong>
            </div>

            <div>
              <span>TOTAL COACHING COMMITMENT</span>
              <strong>${selectedPackage.totalPrice}</strong>
            </div>
          </div>

          <div className="features">
            <div>
              <span>✓</span>
              Personalized workouts
            </div>

            <div>
              <span>✓</span>
              Nutrition targets
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
              Exercise library
            </div>

            <div>
              <span>✓</span>
              Private member portal
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
              : `CONTINUE TO STRIPE — $${selectedPackage.todayPrice} →`}
          </button>

          {error && <p className="error">{error}</p>}

          <p className="temporary">
            {selectedPackage.weeks <= 6
              ? `$${selectedPackage.totalPrice} paid in full for your ${selectedPackage.weeks}-week coaching program.`
              : `${selectedPackage.paymentText}. Total coaching commitment: $${selectedPackage.totalPrice}.`}
          </p>
        </div>

        <div className="security">
          <div>🔒</div>

          <div>
            <strong>Protected coaching access</strong>
            <p>
              Creating an account does not activate paid coaching. Coaching
              access is activated only after a successful payment is
              confirmed.
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
          margin-bottom: 18px;
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

        .payment-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 24px;
        }

        .payment-summary > div {
          background: #0a0a0a;
          border: 1px solid #292929;
          border-radius: 9px;
          padding: 13px;
          display: grid;
          gap: 6px;
        }

        .payment-summary span {
          color: #777777;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .payment-summary strong {
          color: #ffffff;
          font-size: 13px;
          line-height: 1.4;
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

          .payment-summary {
            grid-template-columns: 1fr;
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
