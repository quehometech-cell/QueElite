export default function SedentaryProblem() {
  const items = [
    "You feel stiff after sitting for hours",
    "You want to lose body fat and get stronger",
    "You struggle to stay consistent with workouts",
    "You don't have hours to spend in a gym",
    "You want something simple that fits your schedule",
  ];

  return (
    <section
      style={{
        background: "#111111",
        color: "#FFFFFF",
        padding: "80px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#F4C20D",
            fontWeight: "900",
            letterSpacing: "2px",
            fontSize: "12px",
          }}
        >
          BUILT FOR REAL LIFE
        </p>

        <h2
          style={{
            fontSize: "clamp(34px, 5vw, 52px)",
            margin: "10px 0 20px",
          }}
        >
          DOES THIS SOUND LIKE YOU?
        </h2>

        <p
          style={{
            fontSize: "18px",
            lineHeight: "1.7",
            color: "#BDBDBD",
            maxWidth: "760px",
            margin: "0 auto 32px",
          }}
        >
          Whether you work at a desk, stay active all day, or are simply trying to
          get back into a routine, your training should fit your real life.
        </p>

        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto 34px",
            display: "grid",
            gap: "10px",
            textAlign: "left",
          }}
        >
          {items.map((item) => (
            <div
              key={item}
              style={{
                background: "#0A0A0A",
                border: "1px solid #2A2A2A",
                borderRadius: "10px",
                padding: "14px 16px",
                fontSize: "16px",
              }}
            >
              <span
                style={{
                  color: "#F4C20D",
                  fontWeight: "900",
                  marginRight: "10px",
                }}
              >
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: "21px",
            fontWeight: "800",
            lineHeight: "1.5",
            marginBottom: "28px",
          }}
        >
          You don't need a perfect schedule.
          <br />
          <span style={{ color: "#F4C20D" }}>
            You need a plan you can actually follow.
          </span>
        </p>

        <a
          href="/starter-kit"
          style={{
            display: "inline-flex",
            minHeight: "52px",
            alignItems: "center",
            justifyContent: "center",
            background: "#F4C20D",
            color: "#050505",
            padding: "0 26px",
            borderRadius: "10px",
            fontWeight: "900",
            textDecoration: "none",
          }}
        >
          TRY MY COACHING FREE FOR 3 DAYS
        </a>

        <p style={{color:"#777",fontSize:"13px",lineHeight:1.6,marginTop:"28px"}}>Desk workers and people who sit for long hours can benefit from this approach too, but you do not have to fit that description to work with me.</p>
      </div>
    </section>
  );
}
