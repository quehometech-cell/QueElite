export default function Hero() {
  return (
    <section
      style={{
        padding: "100px 60px",
        background: "#111",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div style={{ maxWidth: "950px" }}>
        
        <p
          style={{
            color: "#facc15",
            fontWeight: "bold",
            letterSpacing: "2px"
          }}
        >
          PERSONAL TRAINING FOR SEDENTARY PROFESSIONALS
        </p>

        <h1
          style={{
            fontSize: "clamp(42px, 7vw, 76px)",
            lineHeight: "1",
            margin: "20px 0"
          }}
        >
          YOU SIT FOR WORK.
          <br />
          YOUR BODY
          <br />
          DOESN&apos;T HAVE TO.
        </h1>

        <p
          style={{
            maxWidth: "700px",
            color: "#ccc",
            fontSize: "20px",
            lineHeight: "1.6"
          }}
        >
          Get stronger, move better, and take control of your fitness
          with simple training designed for people who spend most of
          their workday sitting.
        </p>

        <p
          style={{
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold"
          }}
        >
          No gym membership required.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginTop: "30px"
          }}
        >

          <a
            href="/starter-kit"
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                background: "#facc15",
                border: "none",
                padding: "17px 26px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px"
              }}
            >
              Get My Free 3-Day Starter Kit
            </button>
          </a>

          <a
            href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                background: "transparent",
                border: "1px solid white",
                color: "white",
                padding: "16px 24px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px"
              }}
            >
              Book Free Assessment
            </button>
          </a>

        </div>

        <p
          style={{
            color: "#888",
            marginTop: "20px",
            fontSize: "14px"
          }}
        >
          Beginner-friendly • Home workouts • Minimal equipment
        </p>

      </div>
    </section>
  );
}
