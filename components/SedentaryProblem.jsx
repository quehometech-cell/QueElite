export default function SedentaryProblem() {
  return (
    <section
      style={{
        background: "#111111",
        color: "#FFFFFF",
        padding: "70px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        <p
          style={{
            color: "#F4C20D",
            fontWeight: "700",
            letterSpacing: "2px",
            marginBottom: "10px",
          }}
        >
          BUILT FOR PEOPLE WHO SIT FOR WORK
        </p>

        <h2
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            marginBottom: "25px",
          }}
        >
          DOES THIS SOUND LIKE YOU?
        </h2>

        <p
          style={{
            fontSize: "18px",
            lineHeight: "1.7",
            color: "#E5E5E5",
            marginBottom: "30px",
          }}
        >
          You work at a desk, drive all day, work from home, or spend most
          of your shift sitting. By the end of the day, your body feels like
          it needs more movement.
        </p>

        <div
          style={{
            textAlign: "left",
            maxWidth: "600px",
            margin: "0 auto 35px",
            fontSize: "18px",
            lineHeight: "2",
          }}
        >
          <div>✓ You feel stiff after sitting for hours</div>
          <div>✓ You want to lose body fat and get stronger</div>
          <div>✓ You struggle to stay consistent with workouts</div>
          <div>✓ You don't have hours to spend in a gym</div>
          <div>✓ You want something simple that fits your schedule</div>
        </div>

        <p
          style={{
            fontSize: "21px",
            fontWeight: "700",
            marginBottom: "30px",
          }}
        >
          You don't need to become a gym person.
          <br />
          <span style={{ color: "#F4C20D" }}>
            You need a plan that fits your life.
          </span>
        </p>

        <a
          href="/starter-kit"
          style={{
            display: "inline-block",
            background: "#F4C20D",
            color: "#050505",
            padding: "16px 28px",
            borderRadius: "8px",
            fontWeight: "800",
            textDecoration: "none",
          }}
        >
          START MY FREE 3-DAY RESET
        </a>
      </div>
    </section>
  );
}
