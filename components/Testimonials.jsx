export default function Testimonials() {
  return (
    <section
      style={{
        padding: "80px 60px",
        background: "#0d0d0d",
      }}
    >
      <h2
        style={{
          fontSize: "48px",
          marginBottom: "40px",
        }}
      >
        Real Results
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#151515",
            padding: "30px",
            border: "1px solid #333",
          }}
        >
          <h3>Client Transformation</h3>

          <p style={{ color: "#ccc" }}>
            "Lost 18 pounds and improved mobility."
          </p>
        </div>

        <div
          style={{
            background: "#151515",
            padding: "30px",
            border: "1px solid #333",
          }}
        >
          <h3>Strength Client</h3>

          <p style={{ color: "#ccc" }}>
            "Built confidence and strength in 8 weeks."
          </p>
        </div>

        <div
          style={{
            background: "#151515",
            padding: "30px",
            border: "1px solid #333",
          }}
        >
          <h3>Mobility Client</h3>

          <p style={{ color: "#ccc" }}>
            "Improved posture and reduced discomfort."
          </p>
        </div>
      </div>
    </section>
  );
}