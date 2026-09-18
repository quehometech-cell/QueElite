export const metadata = {
  title: "Online Personal Trainer for Beginners",
  description:
    "Online personal training for beginners who want a clear workout plan, accountability, strength training, mobility, and practical fitness coaching built around their schedule.",
  alternates: {
    canonical: "/online-personal-trainer-for-beginners",
  },
  openGraph: {
    title: "Online Personal Trainer for Beginners | Get Cha Right Fitness",
    description:
      "Beginner-friendly online personal training with personalized workouts, accountability, mobility, and practical coaching.",
    url: "/online-personal-trainer-for-beginners",
    type: "website",
  },
};

export default function OnlinePersonalTrainerForBeginners() {
  const benefits = [
    {
      title: "A PLAN BUILT FOR YOU",
      text: "Your training is based on your goals, experience, available equipment, schedule, and current fitness level instead of giving you a random workout.",
    },
    {
      title: "BEGINNER-FRIENDLY WORKOUTS",
      text: "Start with exercises and training volume appropriate for your experience, then progress as you become stronger and more confident.",
    },
    {
      title: "HOME OR GYM TRAINING",
      text: "Your program can be structured around the equipment you actually have, whether you train at home or in a gym.",
    },
    {
      title: "ACCOUNTABILITY",
      text: "A structured plan, progress tracking, and coaching check-ins help you stay focused instead of constantly restarting.",
    },
    {
      title: "MOBILITY + MOVEMENT",
      text: "Mobility and movement work can be incorporated alongside strength training, especially for people who spend much of their workday sitting.",
    },
    {
      title: "PRACTICAL NUTRITION",
      text: "Build sustainable nutrition habits around your goals without depending on extreme diets or complicated meal plans.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "CREATE YOUR ACCOUNT",
      text: "Start your Get Cha Right Fitness account so your coaching journey and member access can be connected.",
    },
    {
      number: "02",
      title: "COMPLETE YOUR ASSESSMENT",
      text: "Share your goals, training experience, schedule, available equipment, and other information needed to structure your training.",
    },
    {
      number: "03",
      title: "GET YOUR TRAINING PLAN",
      text: "Your workouts are organized around your current level instead of expecting you to train like someone who has been exercising for years.",
    },
    {
      number: "04",
      title: "TRAIN + TRACK",
      text: "Follow your program, record your progress, and build consistency as your training develops.",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HERO */}
      <section
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          padding: "90px 20px 70px",
          textAlign: "center",
        }}
      >
        <p style={eyebrowStyle}>BEGINNER-FRIENDLY ONLINE COACHING</p>

        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 70px)",
            lineHeight: "1.03",
            margin: "14px auto 24px",
            fontWeight: "900",
            maxWidth: "950px",
          }}
        >
          ONLINE PERSONAL TRAINING
          <br />
          <span style={{ color: "#F4C20D" }}>FOR BEGINNERS</span>
        </h1>

        <p
          style={{
            maxWidth: "750px",
            margin: "0 auto",
            color: "#BDBDBD",
            fontSize: "20px",
            lineHeight: "1.75",
          }}
        >
          You do not need years of gym experience to start getting stronger.
          Get a structured fitness plan built around your goals, schedule,
          experience, and available equipment.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "14px",
            marginTop: "32px",
          }}
        >
          <a href="/join" style={primaryButton}>
            START YOUR TRANSFORMATION →
          </a>

          <a href="/starter-kit" style={secondaryButton}>
            TRY THE FREE 3-DAY RESET
          </a>
        </div>
      </section>

      {/* BEGINNER PROBLEM */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>STARTING FITNESS CAN FEEL CONFUSING</p>

        <h2 style={headingStyle}>
          YOU SHOULDN&apos;T NEED TO FIGURE EVERYTHING OUT ALONE
        </h2>

        <p style={paragraphStyle}>
          Beginners are surrounded by workout videos, fitness apps, social
          media advice, diets, supplements, and training programs. Having more
          information does not always make getting started easier.
        </p>

        <p style={paragraphStyle}>
          A good beginner fitness plan should answer the basic questions:
          what should you do, how often should you train, how much should you
          do, and how should your training progress?
        </p>

        <p style={paragraphStyle}>
          Online personal training gives you structure while still allowing
          you to train around your own schedule.
        </p>
      </section>

      {/* BENEFITS */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "65px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>
          WHAT BEGINNER ONLINE COACHING INCLUDES
        </p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>
          BUILD THE FOUNDATION FIRST
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
            marginTop: "40px",
          }}
        >
          {benefits.map((benefit) => (
            <article key={benefit.title} style={cardStyle}>
              <div
                style={{
                  width: "42px",
                  height: "4px",
                  background: "#F4C20D",
                  marginBottom: "20px",
                }}
              />

              <h3
                style={{
                  fontSize: "21px",
                  margin: "0 0 12px",
                }}
              >
                {benefit.title}
              </h3>

              <p
                style={{
                  color: "#BDBDBD",
                  lineHeight: "1.75",
                  margin: 0,
                }}
              >
                {benefit.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>IS THIS FOR YOU?</p>

        <h2 style={headingStyle}>
          ONLINE PERSONAL TRAINING CAN WORK WELL IF...
        </h2>

        <div
          style={{
            background: "#111111",
            border: "1px solid #2A2A2A",
            borderRadius: "18px",
            padding: "28px",
            marginTop: "30px",
          }}
        >
          {[
            "You are new to structured strength training.",
            "You have started working out before but struggled to stay consistent.",
            "You are unsure which exercises or workout routine to follow.",
            "You have a busy work or family schedule.",
            "You want to train at home or at your own gym.",
            "You spend much of your workday sitting.",
            "You want guidance without needing a trainer standing beside you for every workout.",
          ].map((item) => (
            <p
              key={item}
              style={{
                color: "#DDDDDD",
                lineHeight: "1.7",
                margin: "13px 0",
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
            </p>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          padding: "65px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>
          HOW ONLINE PERSONAL TRAINING WORKS
        </p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>
          FROM BEGINNER TO CONSISTENT
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginTop: "40px",
          }}
        >
          {steps.map((step) => (
            <article key={step.number} style={cardStyle}>
              <p
                style={{
                  color: "#F4C20D",
                  fontWeight: "900",
                  letterSpacing: "2px",
                  marginTop: 0,
                }}
              >
                {step.number}
              </p>

              <h3 style={{ fontSize: "20px" }}>{step.title}</h3>

              <p
                style={{
                  color: "#BDBDBD",
                  lineHeight: "1.7",
                }}
              >
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* HOME TRAINING */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>NO GYM? THAT&apos;S OKAY.</p>

        <h2 style={headingStyle}>
          CAN A BEGINNER DO ONLINE PERSONAL TRAINING AT HOME?
        </h2>

        <p style={paragraphStyle}>
          Yes. A beginner program can use bodyweight movements, resistance
          bands, dumbbells, or other equipment you already have available.
        </p>

        <p style={paragraphStyle}>
          As you progress, additional resistance can make continued strength
          development easier, but you do not need a fully equipped gym just to
          begin exercising.
        </p>
      </section>

      {/* DESK WORKER CONTENT */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>WORK AT A DESK?</p>

        <h2 style={headingStyle}>
          YOUR WORK SCHEDULE SHOULD BE PART OF YOUR FITNESS PLAN
        </h2>

        <p style={paragraphStyle}>
          If you spend much of the day sitting, your program should account for
          your actual lifestyle. Strength training, walking, mobility, and
          regular movement can all become part of a realistic weekly routine.
        </p>

        <a href="/fitness-for-desk-workers" style={textLinkStyle}>
          READ THE FITNESS FOR DESK WORKERS GUIDE →
        </a>

        <br />

        <a
          href="/blog/how-to-get-fit-sitting-all-day"
          style={textLinkStyle}
        >
          HOW TO GET FIT WHEN YOU SIT ALL DAY →
        </a>
      </section>

      {/* FREE RESET */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "60px 20px 80px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #171300 0%, #111111 65%)",
            border: "1px solid #5A4900",
            borderRadius: "20px",
            padding: "48px 25px",
            textAlign: "center",
          }}
        >
          <p style={eyebrowStyle}>NOT READY FOR COACHING YET?</p>

          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: "1.1",
              margin: "12px auto 18px",
            }}
          >
            START WITH THE FREE
            <br />
            <span style={{ color: "#F4C20D" }}>3-DAY RESET</span>
          </h2>

          <p
            style={{
              maxWidth: "620px",
              margin: "0 auto 28px",
              color: "#BDBDBD",
              lineHeight: "1.7",
            }}
          >
            Try three beginner-friendly days of movement, mobility, and
            strength work before deciding whether personalized coaching is
            right for you.
          </p>

          <a href="/starter-kit" style={primaryButton}>
            GET MY FREE RESET →
          </a>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          borderTop: "1px solid #222222",
          textAlign: "center",
          padding: "75px 20px",
        }}
      >
        <p style={eyebrowStyle}>GET CHA RIGHT FITNESS</p>

        <h2
          style={{
            fontSize: "clamp(34px, 6vw, 56px)",
            lineHeight: "1.05",
            maxWidth: "800px",
            margin: "12px auto 20px",
          }}
        >
          YOU DON&apos;T HAVE TO WAIT UNTIL
          <br />
          <span style={{ color: "#F4C20D" }}>
            YOU&apos;RE ALREADY IN SHAPE.
          </span>
        </h2>

        <p
          style={{
            maxWidth: "620px",
            margin: "0 auto 30px",
            color: "#BDBDBD",
            lineHeight: "1.7",
          }}
        >
          Start with a plan designed around where you are now and build from
          there.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <a href="/join" style={primaryButton}>
            START YOUR TRANSFORMATION →
          </a>

          <a
            href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
            target="_blank"
            rel="noopener noreferrer"
            style={secondaryButton}
          >
            BOOK FREE ASSESSMENT
          </a>
        </div>
      </section>
    </main>
  );
}

const sectionStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "60px 20px",
};

const eyebrowStyle = {
  color: "#F4C20D",
  fontWeight: "900",
  letterSpacing: "2px",
  fontSize: "13px",
};

const headingStyle = {
  fontSize: "clamp(30px, 5vw, 46px)",
  lineHeight: "1.12",
  margin: "12px 0 22px",
};

const paragraphStyle = {
  color: "#BDBDBD",
  fontSize: "18px",
  lineHeight: "1.8",
};

const cardStyle = {
  background: "#111111",
  border: "1px solid #2A2A2A",
  borderRadius: "16px",
  padding: "26px",
};

const primaryButton = {
  display: "inline-flex",
  minHeight: "52px",
  alignItems: "center",
  justifyContent: "center",
  background: "#F4C20D",
  color: "#050505",
  padding: "0 24px",
  borderRadius: "9px",
  fontWeight: "900",
  textDecoration: "none",
  marginTop: "24px",
};

const secondaryButton = {
  display: "inline-flex",
  minHeight: "52px",
  alignItems: "center",
  justifyContent: "center",
  background: "#111111",
  color: "#FFFFFF",
  padding: "0 24px",
  border: "1px solid #333333",
  borderRadius: "9px",
  fontWeight: "900",
  textDecoration: "none",
  marginTop: "24px",
};

const textLinkStyle = {
  display: "inline-block",
  color: "#F4C20D",
  textDecoration: "none",
  fontWeight: "900",
  marginTop: "12px",
};
