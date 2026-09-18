export default function Testimonials() {
  const steps = [
    [
      "Create Your Account",
      "Start your Get Cha Right account and choose your coaching path.",
    ],
    [
      "Complete Your Assessment",
      "Tell us your goals, experience, equipment, and schedule.",
    ],
    [
      "Get Your Program",
      "Your training plan is assigned based on your onboarding and coaching needs.",
    ],
    [
      "Train & Track",
      "Log workouts, nutrition, mobility work, and progress from your member portal.",
    ],
    [
      "Check In",
      "Use weekly check-ins so your coach can review progress and make adjustments.",
    ],
  ];

  return (
    <section
      style={{
        padding: "80px 20px",
        background: "#0D0D0D",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
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
          SIMPLE FROM DAY ONE
        </p>

        <h2
          style={{
            fontSize: "clamp(34px, 5vw, 52px)",
            margin: "8px 0 38px",
            textAlign: "center",
          }}
        >
          How It Works
        </h2>

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {steps.map(([title, description], index) => (
            <div
              key={title}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr",
                gap: "16px",
                alignItems: "start",
                background: "#151515",
                padding: "20px",
                border: "1px solid #2A2A2A",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#F4C20D",
                  color: "#050505",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "900",
                }}
              >
                {index + 1}
              </div>

              <div>
                <h3
                  style={{
                    margin: "2px 0 7px",
                    fontSize: "18px",
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#999999",
                    lineHeight: "1.55",
                    fontSize: "14px",
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
