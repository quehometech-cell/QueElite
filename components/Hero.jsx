export default function Hero() {
  const buttonBase = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "54px",
    padding: "0 24px",
    borderRadius: "10px",
    fontWeight: "900",
    fontSize: "15px",
    textDecoration: "none",
    textAlign: "center",
  };

  return (
    <section
      style={{
        padding: "clamp(70px, 10vw, 120px) clamp(20px, 6vw, 70px)",
        background:
          "radial-gradient(circle at 75% 20%, rgba(244,194,13,.10), transparent 28rem), #0A0A0A",
        minHeight: "78vh",
        display: "flex",
        alignItems: "center",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#F4C20D",
            fontWeight: "900",
            letterSpacing: "2px",
            fontSize: "13px",
            margin: 0,
          }}
        >
          ONLINE FITNESS COACHING FOR SEDENTARY PROFESSIONALS
        </p>

        <h1
          style={{
            fontSize: "clamp(46px, 8vw, 82px)",
            lineHeight: ".95",
            letterSpacing: "-2px",
            margin: "22px 0",
            maxWidth: "900px",
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
            maxWidth: "720px",
            color: "#BDBDBD",
            fontSize: "clamp(17px, 2vw, 20px)",
            lineHeight: "1.65",
            margin: 0,
          }}
        >
          Get stronger, move better, and lose body fat with practical coaching
          built for people who spend most of their workday sitting.
        </p>

        <p
          style={{
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: "800",
            marginTop: "18px",
          }}
        >
          Beginner-friendly. Home or gym. Built around your schedule.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "30px",
          }}
        >
          <a
            href="/join"
            style={{
              ...buttonBase,
              background: "#F4C20D",
              color: "#050505",
              border: "1px solid #F4C20D",
            }}
          >
            START YOUR TRANSFORMATION →
          </a>

          <a
            href="/starter-kit"
            style={{
              ...buttonBase,
              background: "transparent",
              color: "#FFFFFF",
              border: "1px solid #3A3A3A",
            }}
          >
            GET THE FREE 3-DAY RESET
          </a>

          <a
            href="/members"
            style={{
              ...buttonBase,
              background: "transparent",
              color: "#F4C20D",
              border: "1px solid #F4C20D",
            }}
          >
            MEMBER PORTAL
          </a>
        </div>

        <p
          style={{
            color: "#777777",
            marginTop: "18px",
            fontSize: "13px",
          }}
        >
          Want to talk first?{" "}
          <a
            href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#FFFFFF",
              fontWeight: "800",
            }}
          >
            Book a free 15-minute assessment.
          </a>
        </p>
      </div>
    </section>
  );
}
