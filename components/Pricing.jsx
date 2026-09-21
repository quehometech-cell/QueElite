"use client";

export default function Pricing() {
  const features = [
    "Personalized workouts",
    "Nutrition targets",
    "Progress tracking",
    "Weekly check-ins",
    "Exercise library",
    "Private member portal",
  ];

  const packages = [
    {
      weeks: 4,
      name: "Coaching Kickstart",
      price: 149,
      description:
        "A focused start for building structure, consistency, and momentum.",
    },
    {
      weeks: 6,
      name: "6-Week Coaching",
      price: 199,
      description:
        "More time to build consistency and progress with personalized coaching.",
    },
    {
      weeks: 8,
      name: "Transformation Coaching",
      price: 249,
      badge: "MOST POPULAR",
      description:
        "A longer coaching phase designed for measurable progress and stronger habits.",
    },
    {
      weeks: 12,
      name: "Transformation Coaching",
      price: 349,
      badge: "BEST VALUE",
      description:
        "Our longest coaching option for clients who want sustained structure, accountability, and progression.",
    },
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
          maxWidth: "1200px",
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
          Choose Your Coaching Commitment
        </h2>

        <p
          style={{
            color: "#999999",
            maxWidth: "700px",
            margin: "0 auto 42px",
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >
          Personalized online coaching built around your goals, experience,
          schedule, and available equipment. Choose how long you want to commit
          and we&apos;ll build the plan around you.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
            alignItems: "stretch",
          }}
        >
          {packages.map((pkg) => (
            <div
              key={pkg.weeks}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                background: "#111111",
                padding: "30px 24px",
                border:
                  pkg.weeks === 8
                    ? "2px solid #F4C20D"
                    : "1px solid #3A3A3A",
                borderRadius: "18px",
              }}
            >
              {pkg.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-13px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#F4C20D",
                    color: "#050505",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: "900",
                    letterSpacing: "1px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {pkg.badge}
                </div>
              )}

              <div
                style={{
                  color: "#F4C20D",
                  fontSize: "12px",
                  fontWeight: "900",
                  letterSpacing: "1.5px",
                  marginTop: pkg.badge ? "6px" : "0",
                }}
              >
                {pkg.weeks} WEEKS
              </div>

              <h3
                style={{
                  fontSize: "23px",
                  margin: "10px 0 8px",
                }}
              >
                {pkg.name}
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
                  ${pkg.price}
                </span>

                <span
                  style={{
                    color: "#999999",
                    fontSize: "13px",
                    fontWeight: "700",
                  }}
                >
                  total
                </span>
              </div>

              <p
                style={{
                  color: "#A0A0A0",
                  lineHeight: "1.6",
                  fontSize: "14px",
                  minHeight: "68px",
                  margin: "0 0 22px",
                }}
              >
                {pkg.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "9px",
                  marginBottom: "26px",
                }}
              >
                {features.map((item) => (
                  <div
                    key={item}
                    style={{
                      color: "#D8D8D8",
                      fontSize: "13px",
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
                href={`/join?package=${pkg.weeks}`}
                style={{
                  width: "100%",
                  minHeight: "52px",
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#F4C20D",
                  color: "#050505",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "900",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                CHOOSE {pkg.weeks} WEEKS →
              </a>
            </div>
          ))}
        </div>

        <p
          style={{
            color: "#777777",
            fontSize: "12px",
            textAlign: "center",
            margin: "22px 0 0",
          }}
        >
          Create your account first. Secure payment follows during membership
          setup.
        </p>
      </div>
    </section>
  );
}
