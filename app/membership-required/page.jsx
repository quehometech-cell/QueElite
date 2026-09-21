"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const PACKAGES = {
  4: {
    weeks: 4,
    name: "Coaching Kickstart",
    todayPrice: 149,
    totalPrice: 149,
    paymentText: "Paid in full",
  },
  6: {
    weeks: 6,
    name: "6-Week Coaching",
    todayPrice: 199,
    totalPrice: 199,
    paymentText: "Paid in full",
  },
  8: {
    weeks: 8,
    name: "Transformation Coaching",
    todayPrice: 249,
    totalPrice: 498,
    paymentText: "$249 today + $249 second payment",
  },
  12: {
    weeks: 12,
    name: "Transformation Coaching",
    todayPrice: 349,
    totalPrice: 698,
    paymentText: "$349 today + $349 second payment",
  },
};

export default function MembershipRequiredPage() {
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageLoaded, setPackageLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const packageWeeks = params.get("package");
    const pkg = PACKAGES[packageWeeks];

    if (pkg) {
      setSelectedPackage(pkg);
    }

    setPackageLoaded(true);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleCheckout() {
    if (!selectedPackage) {
      router.push("/#pricing");
      return;
    }

    router.push(`/checkout?package=${selectedPackage.weeks}`);
  }

  if (!packageLoaded) {
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
            color: "#BDBDBD",
            fontSize: "15px",
          }}
        >
          Loading membership...
        </div>
      </main>
    );
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
          Fitness coaching package to access your coaching dashboard.
        </p>

        {selectedPackage ? (
          <div
            style={{
              background: "#050505",
              border: "1px solid #2A2A2A",
              borderRadius: "14px",
              padding: "22px",
              marginTop: "28px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                color: "#F4C20D",
                fontSize: "11px",
                fontWeight: "900",
                letterSpacing: "1.4px",
                marginBottom: "8px",
              }}
            >
              YOUR COACHING PLAN
            </div>

            <div
              style={{
                color: "#FFFFFF",
                fontWeight: "900",
                fontSize: "21px",
              }}
            >
              {selectedPackage.weeks}-Week {selectedPackage.name}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "7px",
                marginTop: "14px",
              }}
            >
              <span
                style={{
                  color: "#F4C20D",
                  fontSize: "32px",
                  fontWeight: "900",
                }}
              >
                ${selectedPackage.todayPrice}
              </span>

              <span
                style={{
                  color: "#999999",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                {selectedPackage.weeks <= 6 ? "total" : "due today"}
              </span>
            </div>

            <div
              style={{
                color: "#D0D0D0",
                fontSize: "13px",
                fontWeight: "700",
                marginTop: "10px",
              }}
            >
              {selectedPackage.paymentText}
            </div>

            <div
              style={{
                color: "#777777",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              Total coaching commitment: ${selectedPackage.totalPrice}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#050505",
              border: "1px solid #5A4510",
              borderRadius: "14px",
              padding: "20px",
              marginTop: "28px",
            }}
          >
            <div
              style={{
                color: "#F4C20D",
                fontWeight: "800",
                fontSize: "16px",
              }}
            >
              No coaching package selected
            </div>

            <div
              style={{
                color: "#BDBDBD",
                marginTop: "8px",
                lineHeight: "1.5",
                fontSize: "14px",
              }}
            >
              Choose a 4, 6, 8, or 12-week coaching package before continuing
              to secure checkout.
            </div>
          </div>
        )}

        {selectedPackage && (
          <div
            style={{
              background: "#050505",
              border: "1px solid #2A2A2A",
              borderRadius: "14px",
              padding: "20px",
              marginTop: "16px",
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
              Complete your coaching payment to unlock your personalized
              workouts, nutrition targets, progress tracking, weekly
              check-ins, exercise library, and private member portal.
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleCheckout}
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
          {selectedPackage
            ? `CONTINUE TO SECURE CHECKOUT — $${selectedPackage.todayPrice}`
            : "CHOOSE A COACHING PACKAGE"}
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
            lineHeight: "1.5",
          }}
        >
          Already paid? Your membership status may still be updating.
        </div>
      </div>
    </main>
  );
}
