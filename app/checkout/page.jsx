"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const PACKAGES = {
  4: {
    weeks: 4,
    name: "4-Week Coaching Kickstart",
    todayPrice: 149,
    totalPrice: 149,
  },
  6: {
    weeks: 6,
    name: "6-Week Coaching",
    todayPrice: 199,
    totalPrice: 199,
  },
  8: {
    weeks: 8,
    name: "8-Week Transformation Coaching",
    todayPrice: 249,
    totalPrice: 498,
  },
  12: {
    weeks: 12,
    name: "12-Week Transformation Coaching",
    todayPrice: 349,
    totalPrice: 698,
  },
};

export default function CheckoutPage() {
  const router = useRouter();

  const checkoutStarted = useRef(false);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Preparing your secure checkout..."
  );

  useEffect(() => {
    let cancelled = false;

    async function startCheckout() {
      /*
        Prevent React development behavior or rerenders from
        accidentally creating multiple Stripe Checkout Sessions.
      */
      if (checkoutStarted.current) {
        return;
      }

      checkoutStarted.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const packageWeeks = params.get("package");
        const pkg = PACKAGES[packageWeeks];

        if (!pkg) {
          if (!cancelled) {
            setStatus("error");
            setMessage(
              "No valid coaching package was selected."
            );
          }

          return;
        }

        if (!cancelled) {
          setSelectedPackage(pkg);
          setStatus("auth");
          setMessage("Verifying your account...");
        }

        /*
          Use the persisted Supabase browser session as the
          authentication source for checkout.
        */
        let {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Checkout session error:",
            sessionError
          );
        }

        /*
          A newly created or newly signed-in session can occasionally
          need a moment to become available to the next page.

          Retry once before deciding the customer needs to sign in.
        */
        if (!session?.access_token) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );

          const retryResult =
            await supabase.auth.getSession();

          session = retryResult.data?.session || null;

          if (retryResult.error) {
            console.error(
              "Checkout session retry error:",
              retryResult.error
            );
          }
        }

        if (!session?.access_token) {
          router.replace(
            `/login?package=${pkg.weeks}`
          );
          return;
        }

        if (!cancelled) {
          setStatus("stripe");
          setMessage(
            "Opening secure Stripe checkout..."
          );
        }

        /*
          The existing API route handles:

          - validating the Supabase user
          - validating the selected package
          - choosing the correct Stripe price
          - configuring paid-in-full vs split payment
          - creating/reusing the Stripe customer when needed
          - preserving package/payment metadata
        */
        const response = await fetch(
          "/api/create-checkout-session",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              packageWeeks: pkg.weeks,
            }),
          }
        );

        let data = null;

        try {
          data = await response.json();
        } catch (jsonError) {
          console.error(
            "Checkout response parsing error:",
            jsonError
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to start secure checkout."
          );
        }

        if (!data?.url) {
          throw new Error(
            "Stripe checkout URL was not returned."
          );
        }

        /*
          Full browser navigation is intentional here because
          Stripe Checkout is an external hosted payment page.
        */
        window.location.assign(data.url);
      } catch (error) {
        console.error("Checkout error:", error);

        if (!cancelled) {
          setStatus("error");
          setMessage(
            error?.message ||
              "We couldn't open secure checkout. Please try again."
          );
        }
      }
    }

    startCheckout();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function retryCheckout() {
    window.location.reload();
  }

  function returnToPricing() {
    router.push("/#pricing");
  }

  const isError = status === "error";

  return (
    <main className="page">
      <section className="card">
        <a href="/" className="brand">
          GET CHA RIGHT
        </a>

        {!isError && (
          <div className="spinner" />
        )}

        {isError && (
          <div className="error-icon">!</div>
        )}

        <div className="eyebrow">
          {isError
            ? "CHECKOUT ERROR"
            : "SECURE CHECKOUT"}
        </div>

        <h1>
          {isError
            ? "We Hit a Problem."
            : "Taking You to Checkout."}
        </h1>

        {selectedPackage && !isError && (
          <div className="package">
            <span>YOUR COACHING PLAN</span>

            <strong>
              {selectedPackage.name}
            </strong>

            <p>
              ${selectedPackage.todayPrice} due today
            </p>

            {selectedPackage.totalPrice !==
              selectedPackage.todayPrice && (
              <small>
                Total coaching commitment: $
                {selectedPackage.totalPrice}
              </small>
            )}
          </div>
        )}

        <p className="message">
          {message}
        </p>

        {!isError && (
          <>
            <div className="loader">
              <div className="loader-bar" />
            </div>

            <p className="small">
              Please wait. You will be redirected
              automatically.
            </p>
          </>
        )}

        {isError && (
          <div className="actions">
            {selectedPackage && (
              <button
                type="button"
                className="primary-button"
                onClick={retryCheckout}
              >
                TRY CHECKOUT AGAIN →
              </button>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={returnToPricing}
            >
              RETURN TO COACHING PLANS
            </button>
          </div>
        )}

        <div className="security">
          <span>🔒</span>

          <p>
            Payment is processed securely through Stripe.
            Coaching access is not activated until your
            payment is successfully confirmed.
          </p>
        </div>
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
          max-width: 560px;
          background: #111111;
          border: 1px solid #2a2a2a;
          border-radius: 20px;
          padding: 38px;
          text-align: center;
          box-shadow:
            0 20px 70px rgba(0, 0, 0, 0.45);
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

        .spinner {
          width: 58px;
          height: 58px;
          margin: 0 auto 20px;
          border: 3px solid #333333;
          border-top-color: #f4c20d;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        .error-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background: rgba(255, 90, 90, 0.1);
          border: 2px solid #ff6b6b;
          color: #ff6b6b;
          font-size: 28px;
          font-weight: 900;
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
          font-size: clamp(32px, 7vw, 48px);
          line-height: 1;
          letter-spacing: -1.5px;
        }

        .package {
          display: grid;
          gap: 5px;
          margin-top: 24px;
          padding: 16px;
          background: rgba(244, 194, 13, 0.06);
          border: 1px solid rgba(244, 194, 13, 0.25);
          border-radius: 12px;
        }

        .package span {
          color: #f4c20d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .package strong {
          color: #ffffff;
          font-size: 15px;
        }

        .package p {
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          margin: 2px 0 0;
        }

        .package small {
          color: #8f8f8f;
          font-size: 11px;
        }

        .message {
          color: #bdbdbd;
          font-size: 15px;
          line-height: 1.6;
          margin: 22px auto 0;
          max-width: 420px;
        }

        .loader {
          width: 100%;
          height: 5px;
          overflow: hidden;
          background: #252525;
          border-radius: 999px;
          margin-top: 26px;
        }

        .loader-bar {
          width: 38%;
          height: 100%;
          background: #f4c20d;
          border-radius: 999px;
          animation:
            loading 1.4s ease-in-out infinite;
        }

        .small {
          color: #777777;
          font-size: 11px;
          line-height: 1.5;
          margin: 12px 0 0;
        }

        .actions {
          display: grid;
          gap: 10px;
          margin-top: 26px;
        }

        .primary-button,
        .secondary-button {
          width: 100%;
          min-height: 52px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
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
          margin-top: 26px;
          border-top: 1px solid #252525;
        }

        .security p {
          color: #777777;
          font-size: 11px;
          line-height: 1.5;
          margin: 0;
          text-align: left;
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
