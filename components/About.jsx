export default function About() {
  return (
    <section
      style={{
        padding: "80px 20px",
        background: "#111111",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              color: "#F4C20D",
              fontWeight: "900",
              letterSpacing: "2px",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            YOUR COACH
          </p>

          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 52px)",
              margin: 0,
            }}
          >
            Meet Que Kirby
          </h2>
        </div>

        <div>
          <p
            style={{
              color: "#D0D0D0",
              lineHeight: "1.8",
              fontSize: "16px",
              marginTop: 0,
            }}
          >
            I&apos;m Que Kirby, founder of Get Cha Right Fitness and an ISSA
            Certified Personal Trainer. I coach people who want to build
            strength, improve movement, lose body fat, and create habits they
            can actually maintain.
          </p>

          <p
            style={{
              color: "#999999",
              lineHeight: "1.8",
              fontSize: "15px",
            }}
          >
            My background also includes corrective exercise, nutrition, and
            strength coaching, so the goal is bigger than simply giving you a
            list of exercises. We build a structure that fits your life.
          </p>

          <a
            href="/join"
            style={{
              display: "inline-flex",
              minHeight: "50px",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "8px",
              padding: "0 22px",
              borderRadius: "10px",
              background: "#F4C20D",
              color: "#050505",
              textDecoration: "none",
              fontWeight: "900",
            }}
          >
            WORK WITH QUE →
          </a>
        </div>
      </div>
    </section>
  );
}
