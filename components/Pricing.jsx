"use client";

export default function Pricing() {
  const features = [
    "Personalized workouts",
    "Corrective mobility",
    "Nutrition guidance",
    "Progress tracking",
    "Weekly check-ins",
    "Private member portal",
  ];

  return (
    <section
      id="pricing"
      style={{
        padding: "80px 20px",
        background: "#050505",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#F4C20D",
            fontWeight: "900",
            letterSpacing: "2px",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          GET CHA RIGHT COACHING
        </p>

        <h2
          style={{
            fontSize: "clamp(34px, 5vw, 52px)",
            margin: "8px 0 14px",
            textAlign: "center",
          }}
        >
          Start Your Transformation
        </h2>

        <p
          style={{
            color: "#999999",
            maxWidth: "650px",
            margin: "0 auto 34px",
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >
          Personalized online coaching for people who want a structured plan,
          accountability, and one place to track the work.
        </p>

        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#111111",
            padding: "clamp(24px, 5vw, 38px)",
            border: "1px solid #3A3A3A",
            borderRadius: "18px",
          }}
        >
          <div
            style={{
              color: "#F4C20D",
              fontSize: "11px",
              fontWeight: "900",
              letterSpacing: "1.5px",
            }}
          >
            ONLINE TRANSFORMATION COACHING
          </div>

          <h3
            style={{
              fontSize: "28px",
              margin: "10px 0 6px",
            }}
          >
            Built Around You
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "7px",
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                color: "#F4C20D",
                fontSize: "38px",
                fontWeight: "900",
              }}
            >
              $125
            </span>

            <span
              style={{
                color: "#999999",
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              / month
            </span>
          </div>

          <p
            style={{
              color: "#A0A0A0",
              lineHeight: "1.65",
              marginBottom: "24px",
            }}
          >
            Training, corrective mobility, nutrition guidance, progress
            tracking, weekly check-ins, and coach support through your private
            member portal.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            {features.map((item) => (
              <div
                key={item}
                style={{
                  color: "#D8D8D8",
                  fontSize: "14px",
                }}
              >
                <span
                  style={{
                    color: "#F4C20D",
                    fontWeight: "900",
                    marginRight: "8px",
                  }}
                >
                  ✓
                </span>

                {item}
              </div>
            ))}
          </div>

          <a
            href="/join"
            style={{
              width: "100%",
              minHeight: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F4C20D",
              color: "#050505",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "900",
              fontSize: "15px",
              textAlign: "center",
            }}
          >
            START YOUR TRANSFORMATION →
          </a>

          <p
            style={{
              color: "#777777",
              fontSize: "12px",
              textAlign: "center",
              margin: "13px 0 0",
            }}
          >
            Create your account first. Secure payment follows during membership
            setup.
          </p>
        </div>
      </div>
    </section>
  );
}
