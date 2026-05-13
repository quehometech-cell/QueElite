export default function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "60px",
      background: "#111"
    }}>
      <p style={{ color: "#facc15", letterSpacing: "2px" }}>
        ONLINE & HYBRID COACHING
      </p>

      <h1 style={{
        fontSize: "72px",
        lineHeight: 1,
        marginBottom: "20px"
      }}>
        MOVE BETTER.<br />
        BUILD STRENGTH.<br />
        TRANSFORM YOUR LIFE.
      </h1>

      <p style={{
        maxWidth: "600px",
        color: "#ccc",
        lineHeight: 1.7,
        marginBottom: "30px"
      }}>
        Personalized coaching designed to help you lose fat,
        build muscle, improve mobility, and move pain-free.
      </p>

      <div style={{ display: "flex", gap: "16px" }}>
        <button style={{
          background: "#facc15",
          border: "none",
          padding: "14px 24px",
          fontWeight: "bold",
          cursor: "pointer"
        }}>
          Apply Now
        </button>

        <button style={{
          background: "transparent",
          border: "1px solid #fff",
          color: "#fff",
          padding: "14px 24px",
          cursor: "pointer"
        }}>
          Free Consultation
        </button>
      </div>
    </section>
  );
}