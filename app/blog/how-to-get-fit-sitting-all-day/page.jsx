export const metadata = {
  title: "How to Get Fit When You Sit at a Desk All Day",
  description:
    "Sit at a desk all day? Learn how to build strength, increase daily movement, improve mobility, and create a realistic fitness routine around a sedentary job.",
  alternates: {
    canonical: "/blog/how-to-get-fit-sitting-all-day",
  },
  openGraph: {
    title: "How to Get Fit When You Sit at a Desk All Day",
    description:
      "A practical fitness guide for desk workers who want to get stronger, move more, and build a consistent workout routine.",
    url: "/blog/how-to-get-fit-sitting-all-day",
    type: "article",
  },
};

export default function GetFitSittingAllDay() {
  const steps = [
    {
      number: "01",
      title: "START WITH DAILY MOVEMENT",
      text: "You do not need to replace your job or spend your entire day standing. Start by breaking up long periods of sitting. Take short walks, use stairs when practical, and add movement throughout your normal day.",
    },
    {
      number: "02",
      title: "STRENGTH TRAIN 2–4 DAYS PER WEEK",
      text: "Strength training gives your body a reason to adapt. Focus on basic movement patterns such as squatting, hinging, pushing, pulling, carrying, and core work instead of trying to do dozens of exercises.",
    },
    {
      number: "03",
      title: "TRAIN YOUR WHOLE BODY",
      text: "If your schedule is limited, full-body workouts can help you train major muscle groups without needing to be in the gym every day. Two or three well-structured sessions can be a practical starting point.",
    },
    {
      number: "04",
      title: "ADD MOBILITY WORK",
      text: "If you spend hours sitting, include mobility work for areas that feel restricted from your normal routine. Keep it simple and use mobility alongside strength training rather than treating it as an entirely separate fitness program.",
    },
    {
      number: "05",
      title: "USE WALKING AS A TOOL",
      text: "Walking is one of the easiest ways to increase activity without making recovery difficult. A short walk before work, during lunch, or after dinner can help you accumulate more movement across the week.",
    },
    {
      number: "06",
      title: "MAKE NUTRITION REALISTIC",
      text: "You do not need an extreme diet. Build most meals around a quality protein source, fruits or vegetables, and portions that support your goals. A plan you can consistently follow is more useful than a perfect plan you abandon.",
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
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "90px 20px 65px",
        }}
      >
        <p style={eyebrowStyle}>GET CHA RIGHT FITNESS GUIDE</p>

        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 68px)",
            lineHeight: "1.04",
            margin: "14px 0 24px",
            maxWidth: "900px",
          }}
        >
          HOW TO GET FIT WHEN YOU
          <br />
          <span style={{ color: "#F4C20D" }}>SIT AT A DESK ALL DAY</span>
        </h1>

        <p
          style={{
            maxWidth: "760px",
            color: "#BDBDBD",
            fontSize: "20px",
            lineHeight: "1.75",
          }}
        >
          A desk job does not automatically prevent you from getting stronger,
          becoming more active, or improving your body composition. You need a
          fitness strategy that works around your schedule instead of fighting
          against it.
        </p>

        <a href="/starter-kit" style={primaryButton}>
          GET THE FREE 3-DAY RESET →
        </a>
      </section>

      {/* INTRO */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          CAN YOU GET FIT IF YOU SIT MOST OF THE DAY?
        </h2>

        <p style={paragraphStyle}>
          Yes. Your job may require you to spend many hours sitting, but your
          workday is only one part of your overall activity.
        </p>

        <p style={paragraphStyle}>
          The goal is not to compensate for sitting with exhausting workouts.
          Instead, build a routine around strength training, regular movement,
          mobility, nutrition, and consistency.
        </p>

        <p style={paragraphStyle}>
          If you are starting from a mostly sedentary routine, you also do not
          need to change everything at once. Start with a manageable amount of
          activity and gradually build from there.
        </p>
      </section>

      {/* STEPS */}
      <section
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          padding: "60px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>
          THE DESK-WORKER STRATEGY
        </p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>
          6 WAYS TO BUILD A BETTER ROUTINE
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
            marginTop: "40px",
          }}
        >
          {steps.map((step) => (
            <article key={step.number} style={cardStyle}>
              <div
                style={{
                  color: "#F4C20D",
                  fontSize: "14px",
                  fontWeight: "900",
                  letterSpacing: "2px",
                  marginBottom: "14px",
                }}
              >
                {step.number}
              </div>

              <h3
                style={{
                  fontSize: "21px",
                  margin: "0 0 14px",
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  color: "#BDBDBD",
                  lineHeight: "1.75",
                  margin: 0,
                }}
              >
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SAMPLE ROUTINE */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>KEEP IT SIMPLE</p>

        <h2 style={headingStyle}>
          A SIMPLE WEEKLY FITNESS ROUTINE FOR DESK WORKERS
        </h2>

        <p style={paragraphStyle}>
          Your routine does not need to consume your week. A beginner could
          start with something as simple as:
        </p>

        <div
          style={{
            background: "#111111",
            border: "1px solid #2A2A2A",
            borderRadius: "18px",
            padding: "28px",
            margin: "30px 0",
          }}
        >
          {[
            "Monday — Full-body strength training",
            "Tuesday — Walking + short mobility session",
            "Wednesday — Full-body strength training",
            "Thursday — Walking + mobility",
            "Friday — Full-body strength training",
            "Saturday — Recreational activity or walking",
            "Sunday — Rest and recovery",
          ].map((day) => (
            <p
              key={day}
              style={{
                color: "#DDDDDD",
                lineHeight: "1.7",
                margin: "12px 0",
              }}
            >
              <span
                style={{
                  color: "#F4C20D",
                  marginRight: "10px",
                  fontWeight: "900",
                }}
              >
                ✓
              </span>
              {day}
            </p>
          ))}
        </div>

        <p style={paragraphStyle}>
          The exact schedule should depend on your experience, recovery,
          equipment, and goals. The important part is creating something you
          can repeat consistently.
        </p>
      </section>

      {/* HOME VS GYM */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>DO YOU NEED A GYM?</h2>

        <p style={paragraphStyle}>
          No. You can begin at home with bodyweight exercises, resistance
          bands, dumbbells, or other basic equipment.
        </p>

        <p style={paragraphStyle}>
          A gym gives you more equipment and makes progressive strength
          training easier as you become stronger, but lack of a gym membership
          should not prevent you from starting.
        </p>

        <a href="/fitness-for-desk-workers" style={textLinkStyle}>
          READ THE COMPLETE FITNESS FOR DESK WORKERS GUIDE →
        </a>
      </section>

      {/* COMMON MISTAKES */}
      <section
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          padding: "60px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>
          AVOID THESE MISTAKES
        </p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>
          WHY DESK WORKERS STRUGGLE TO STAY CONSISTENT
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "18px",
            marginTop: "35px",
          }}
        >
          {[
            "Trying to train every day immediately",
            "Using workouts that are too long for your schedule",
            "Changing programs constantly",
            "Ignoring daily movement outside the gym",
            "Using extreme diets that are difficult to maintain",
            "Expecting immediate results instead of building consistency",
          ].map((mistake) => (
            <div key={mistake} style={cardStyle}>
              <span
                style={{
                  color: "#F4C20D",
                  fontWeight: "900",
                  marginRight: "8px",
                }}
              >
                ×
              </span>
              {mistake}
            </div>
          ))}
        </div>
      </section>

      {/* LEAD MAGNET */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "70px 20px",
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
          <p style={eyebrowStyle}>NOT SURE WHERE TO START?</p>

          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: "1.1",
              margin: "12px auto 18px",
            }}
          >
            START WITH THE FREE
            <br />
            <span style={{ color: "#F4C20D" }}>3-DAY SEDENTARY RESET</span>
          </h2>

          <p
            style={{
              maxWidth: "620px",
              margin: "0 auto 28px",
              color: "#BDBDBD",
              lineHeight: "1.7",
            }}
          >
            Get three beginner-friendly days of movement, mobility, and
            strength training designed to help you start building a routine.
          </p>

          <a href="/starter-kit" style={primaryButton}>
            GET MY FREE RESET →
          </a>
        </div>
      </section>

      {/* COACHING CTA */}
      <section
        style={{
          borderTop: "1px solid #222222",
          padding: "75px 20px",
          textAlign: "center",
        }}
      >
        <p style={eyebrowStyle}>WANT A PLAN BUILT FOR YOU?</p>

        <h2
          style={{
            fontSize: "clamp(34px, 6vw, 54px)",
            maxWidth: "800px",
            margin: "12px auto 20px",
          }}
        >
          TURN YOUR WORK SCHEDULE INTO A
          <span style={{ color: "#F4C20D" }}> WORKABLE FITNESS PLAN.</span>
        </h2>

        <p
          style={{
            maxWidth: "650px",
            margin: "0 auto 30px",
            color: "#BDBDBD",
            lineHeight: "1.7",
          }}
        >
          Get Cha Right Fitness provides personalized online coaching for busy
          professionals, with in-person personal training also available in
          Georgia by appointment.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <a href="/online-personal-training" style={primaryButton}>
            ONLINE PERSONAL TRAINING →
          </a>

          <a href="/personal-trainer-georgia" style={secondaryButton}>
            GEORGIA PERSONAL TRAINING
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
  alignItems: "center",
  justifyContent: "center",
  minHeight: "52px",
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
  alignItems: "center",
  justifyContent: "center",
  minHeight: "52px",
  background: "#111111",
  color: "#FFFFFF",
  padding: "0 24px",
  borderRadius: "9px",
  border: "1px solid #333333",
  fontWeight: "900",
  textDecoration: "none",
  marginTop: "24px",
};

const textLinkStyle = {
  display: "inline-block",
  color: "#F4C20D",
  textDecoration: "none",
  fontWeight: "900",
  marginTop: "15px",
};
