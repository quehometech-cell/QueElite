export default function Services() {
  const services = [
    "Online Coaching",
    "Hybrid Coaching",
    "Corrective Exercise",
    "Nutrition Guidance"
  ];

  return (
    <section style={{ padding: "80px 60px" }}>
      <h2 style={{ fontSize: "48px", marginBottom: "40px" }}>
        Services
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: "20px"
      }}>
        {services.map((service) => (
          <div key={service} style={{
            background: "#1a1a1a",
            padding: "30px",
            border: "1px solid #333"
          }}>
            <h3>{service}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}