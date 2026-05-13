export default function Pricing() {
  return (
    <section
      style={{
        padding: "80px 60px",
      }}
    >
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
            $99/mo
          </h2>

          <button
            style={{
              width: "100%",
              padding: "14px",
              background: "#facc15",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
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
            $199/mo
          </h2>

          <button
            style={{
              width: "100%",
              padding: "14px",
              background: "#facc15",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Subscribe Now
          </button>
        </div>
      </div>

      <p
        style={{
          color: "#999",
          marginTop: "20px",
        }}
      >
        Connect Stripe or PayPal for payments.
      </p>
    </section>
  );
}