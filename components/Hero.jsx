export default function Hero() {
  return (
    <section style={{ padding: "100px 60px", background: "#111" }}>
      <p style={{ color: "#facc15" }}>
        ONLINE & HYBRID COACHING
      </p>

      <h1 style={{ fontSize: "72px" }}>
        MOVE BETTER.
        <br />
        BUILD STRENGTH.
        <br />
        TRANSFORM YOUR LIFE.
      </h1>

      <p style={{ maxWidth: "650px", color: "#ccc" }}>
        Personalized coaching for strength, mobility,
        fat loss, and corrective exercise.
      </p>

      <div style={{ display: "flex", gap: "16px" }}>
        
        <a
          href="https://buy.stripe.com/00w8wOa6X4Qc8JJ49u2sM04"
          target="_blank"
        >
          <button
            style={{
              background: "#facc15",
              border: "none",
              padding: "16px 24px",
              cursor: "pointer"
            }}
          >
            Start Your Transformation
          </button>
        </a>

        <a
          href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
          target="_blank"
        >
          <button
            style={{
              background: "transparent",
              border: "1px solid white",
              color: "white",
              padding: "16px 24px",
              cursor: "pointer"
            }}
          >
            Book Free Assessment
          </button>
        </a>

      </div>
    </section>
  );
}