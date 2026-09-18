export default function Services() {
  const services = [
    [
      "Personalized Training",
      "A program built around your goal, experience, equipment, and schedule.",
    ],
    [
      "Corrective Mobility",
      "Mobility and corrective work to help you move better alongside your training.",
    ],
    [
      "Nutrition Guidance",
      "Simple targets and tracking that support your training and body-composition goals.",
    ],
    [
      "Progress Tracking",
      "Track workouts, nutrition, progress entries, and consistency inside your member portal.",
    ],
    [
      "Weekly Check-Ins",
      "Regular check-ins give your coach the information needed to adjust your plan.",
    ],
    [
      "Coach Support",
      "Your coaching plan, assignments, and progress stay organized in one private portal.",
    ],
  ];

  return (
    <section
      style={{
        padding: "80px 20px",
        background: "#050505",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#F4C20D",
            fontWeight: "900",
            letterSpacing: "2px",
            fontSize: "12px",
            marginBottom: "8px",
          }}
        >
          MORE THAN A WORKOUT PDF
        </p>

        <h2
          style={{
            fontSize: "clamp(34px, 5vw, 52px)",
            margin: "0 0 14px",
          }}
        >
          What You Get
        </h2>

        <p
          style={{
            color: "#9A9A9A",
            lineHeight: "1.6",
            maxWidth: "680px",
            margin: "0 0 34px",
          }}
        >
          Get Cha Right combines training, movement, nutrition,
          accountability, and progress tracking in one coaching system.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "14px",
          }}
        >
          {services.map(([title, description], index) => (
            <div
              key={title}
              style={{
                background: "#111111",
                padding: "26px",
                border: "1px solid #2A2A2A",
                borderRadius: "14px",
              }}
            >
              <div
                style={{
                  color: "#F4C20D",
                  fontSize: "12px",
                  fontWeight: "900",
                  marginBottom: "16px",
                }}
              >
                0{index + 1}
              </div>

              <h3
                style={{
                  margin: "0 0 10px",
                  fontSize: "19px",
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#999999",
                  lineHeight: "1.6",
                  fontSize: "14px",
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "34px",
          }}
        >
          <a
            href="/online-personal-training"
            style={{
              display: "inline-block",
              color: "#F4C20D",
              textDecoration: "none",
              fontWeight: "900",
              fontSize: "15px",
            }}
          >
            LEARN ABOUT ONLINE PERSONAL TRAINING →
          </a>
        </div>
      </div>
    </section>
  );
}
