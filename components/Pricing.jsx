"use client";

export default function Pricing() {
  return (
    <section style={{ padding: "80px 60px" }}>
      <h2
        style={{
          fontSize: "48px",
          marginBottom: "40px",
        }}
      >
        Coaching Plans
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#121212",
            padding: "40px",
            border: "1px solid #333",
          }}
        >
          <h3>Online Coaching</h3>

          <h2 style={{ color: "#facc15" }}>
            $129/mo
          </h2>

          <p style={{ color: "#999" }}>
            Personalized workouts, accountability,
            nutrition guidance, and weekly check-ins.
          </p>

          <button
            onClick={() =>
              window.open(
                "https://buy.stripe.com/eVqcN44MD96se43fSc2sM02",
                "_blank"
              )
            }
            style={{
              width: "100%",
              padding: "14px",
              background: "#facc15",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Subscribe Now
          </button>
        </div>

        <div
          style={{
            background: "#121212",
            padding: "40px",
            border: "1px solid #333",
          }}
        >
          <h3>Hybrid Coaching</h3>

          <h2 style={{ color: "#facc15" }}>
            $249/mo
          </h2>

          <p style={{ color: "#999" }}>
            Online + in-person support with strength,
            mobility, and corrective exercise coaching.
          </p>

          <button
            onClick={() =>
              window.open(
                "https://buy.stripe.com/00w8wOa6X4Qc8JJ49u2sM04",
                "_blank"
              )
            }
            style={{
              width: "100%",
              padding: "14px",
              background: "#facc15",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Subscribe Now
          </button>
        </div>

        <div
          style={{
            background: "#121212",
            padding: "40px",
            border: "1px solid #333",
          }}
        >
          <h3>Movement Assessment</h3>

          <h2 style={{ color: "#facc15" }}>
            $49
          </h2>

          <p style={{ color: "#999" }}>
            Posture analysis, mobility screening,
            and corrective recommendations.
          </p>

          <button
            onClick={() =>
              window.open(
                "https://buy.stripe.com/8x27sK5QH0zWf87gWg2sM03",
                "_blank"
              )
            }
            style={{
              width: "100%",
              padding: "14px",
              background: "#facc15",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Book Assessment
          </button>
        </div>
      </div>
    </section>
  );
}