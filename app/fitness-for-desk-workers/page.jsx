export const metadata = {
  title: "Fitness for Desk Workers | Strength, Mobility & Fat Loss",
  description:
    "A practical fitness guide for desk workers and people who sit most of the day. Learn how to improve mobility, build strength, increase activity, and create a sustainable workout routine.",
  alternates: {
    canonical: "/fitness-for-desk-workers",
  },
  openGraph: {
    title: "Fitness for Desk Workers | Get Cha Right Fitness",
    description:
      "Learn how desk workers can build strength, improve mobility, increase daily movement, and create a realistic fitness routine.",
    url: "/fitness-for-desk-workers",
    type: "article",
  },
};

export default function FitnessForDeskWorkers() {
  const strategies = [
    {
      number: "01",
      title: "Increase Daily Movement",
      text: "Start by breaking up long periods of sitting. Short walks, movement breaks, and simply getting on your feet more often can make being active easier to maintain.",
    },
    {
      number: "02",
      title: "Build Full-Body Strength",
      text: "Use simple movements such as squats, rows, presses, hinges, and loaded carries to train the major muscle groups instead of relying only on cardio.",
    },
    {
      number: "03",
      title: "Train Your Mobility",
      text: "Include mobility work for areas that can feel stiff after long periods at a desk, including the hips, upper back, chest, shoulders, and ankles.",
    },
    {
      number: "04",
      title: "Use Shorter Workouts",
      text: "You do not need to spend hours in the gym. A structured workout that fits your schedule is more useful than an unrealistic routine you cannot maintain.",
    },
    {
      number: "05",
      title: "Make Nutrition Practical",
      text: "Build meals around sustainable portions, protein, fruits, vegetables, whole-food carbohydrate sources, and foods that fit your goals and lifestyle.",
    },
    {
      number: "06",
      title: "Track Your Consistency",
      text: "Track workouts, activity, nutrition habits, and progress over time. Consistency gives you useful information about what is and is not working.",
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
          padding: "90px 20px 70px",
          textAlign: "center",
        }}
      >
        <p style={eyebrowStyle}>GET CHA RIGHT FITNESS</p>

        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            lineHeight: "1.02",
            margin: "15px auto 24px",
            fontWeight: "900",
          }}
        >
          FITNESS FOR
          <br />
          <span style={{ color: "#F4C20D" }}>DESK WORKERS</span>
        </h1>

        <p
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            fontSize: "20px",
            lineHeight: "1.7",
            color: "#BDBDBD",
          }}
        >
          Sitting for most of your workday does not mean you have to stay
          inactive. Learn how to build strength, improve mobility, increase
          daily movement, and create a fitness routine that works around your
          job.
        </p>

        <a
          href="/starter-kit"
          style={{
            ...primaryButton,
            marginTop: "32px",
          }}
        >
          GET THE FREE 3-DAY RESET →
        </a>
      </section>

      {/* INTRO */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>THE DESK-WORK CHALLENGE</p>

        <h2 style={headingStyle}>
          HOW DO YOU GET FIT WHEN YOU SIT MOST OF THE DAY?
        </h2>

        <p style={paragraphStyle}>
          A desk job can make staying active challenging. Work may take up a
          large part of your day, and when you finally finish, spending another
          hour or two exercising may not feel realistic.
        </p>

        <p style={paragraphStyle}>
          The solution does not have to be an extreme workout schedule. A
          practical approach combines regular movement, strength training,
          mobility work, nutrition habits, and a routine you can repeat
          consistently.
        </p>
      </section>

      {/* STRATEGIES */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "70px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>
          BUILD YOUR FOUNDATION
        </p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>
          6 FITNESS STRATEGIES FOR DESK WORKERS
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
            marginTop: "40px",
          }}
        >
          {strategies.map((item) => (
            <div key={item.number} style={cardStyle}>
              <span
                style={{
                  color: "#F4C20D",
                  fontSize: "13px",
                  fontWeight: "900",
                  letterSpacing: "2px",
                }}
              >
                {item.number}
              </span>

              <h3
                style={{
                  fontSize: "22px",
                  margin: "14px 0 10px",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: "#BDBDBD",
                  lineHeight: "1.7",
                  margin: 0,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SIMPLE ROUTINE */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>KEEP IT SIMPLE</p>

        <h2 style={headingStyle}>
          A BASIC FITNESS ROUTINE FOR SOMEONE WITH A DESK JOB
        </h2>

        <p style={paragraphStyle}>
          Your exact program should depend on your goals and current fitness
          level, but a simple weekly structure can make getting started less
          overwhelming.
        </p>

        <div
          style={{
            background: "#111111",
            border: "1px solid #2A2A2A",
            borderRadius: "18px",
            padding: "30px",
            marginTop: "30px",
          }}
        >
          <RoutineRow
            title="Strength Training"
            text="Train your major muscle groups multiple times throughout the week using a program appropriate for your experience."
          />

          <RoutineRow
            title="Walking + Daily Activity"
            text="Use walking and movement breaks to increase activity outside of your structured workouts."
          />

          <RoutineRow
            title="Mobility"
            text="Add short mobility sessions throughout the week, especially when long periods of sitting leave you feeling stiff."
          />

          <RoutineRow
            title="Recovery"
            text="Give your body appropriate recovery time and build your training gradually instead of trying to change everything at once."
            last
          />
        </div>
      </section>

      {/* HOME OR GYM */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "70px 20px",
          textAlign: "center",
        }}
      >
        <p style={eyebrowStyle}>HOME OR GYM</p>

        <h2 style={headingStyle}>YOU DON&apos;T NEED A PERFECT SETUP</h2>

        <p
          style={{
            ...paragraphStyle,
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          You can start exercising at home with bodyweight movements and
          minimal equipment, or train in a gym with additional resistance.
          What matters most is having a structured plan you can follow
          consistently.
        </p>
      </section>

      {/* FREE RESET */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px 20px 70px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #171300 0%, #111111 60%, #111111 100%)",
            border: "1px solid #5A4900",
            borderRadius: "20px",
            padding: "48px 25px",
            textAlign: "center",
          }}
        >
          <p style={eyebrowStyle}>START HERE</p>

          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: "1.1",
              margin: "12px auto 18px",
            }}
          >
            TRY THE FREE
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
            Start with three beginner-friendly days of movement, mobility, and
            strength work designed for people who spend much of their day
            sitting.
          </p>

          <a href="/starter-kit" style={primaryButton}>
            GET THE FREE RESET →
          </a>
        </div>
      </section>

      {/* COACHING */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 20px 80px",
          textAlign: "center",
        }}
      >
        <p style={eyebrowStyle}>WANT A PERSONALIZED PLAN?</p>

        <h2 style={headingStyle}>TAKE THE NEXT STEP</h2>

        <p
          style={{
            ...paragraphStyle,
            maxWidth: "650px",
            margin: "0 auto 28px",
          }}
        >
          Get Cha Right Fitness offers online personal training built around
          your goals, schedule, experience, and available equipment.
        </p>

        <a href="/online-personal-training" style={secondaryButton}>
          EXPLORE ONLINE PERSONAL TRAINING →
        </a>
      </section>

      {/* SAFETY */}
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0 20px 50px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#777777",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          Exercise at a comfortable pace and stop if you experience sharp
          pain, dizziness, chest pain, or unusual shortness of breath. If you
          have medical concerns or physical limitations, consult an
          appropriate healthcare professional before beginning a new exercise
          program.
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "25px",
            color: "#F4C20D",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← BACK TO GET CHA RIGHT FITNESS
        </a>
      </section>
    </main>
  );
}

function RoutineRow({ title, text, last = false }) {
  return (
    <div
      style={{
        padding: "20px 0",
        borderBottom: last ? "none" : "1px solid #292929",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: "20px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#BDBDBD",
          lineHeight: "1.7",
        }}
      >
        {text}
      </p>
    </div>
  );
}

const sectionStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "70px 20px",
};

const eyebrowStyle = {
  color: "#F4C20D",
  fontWeight: "900",
  letterSpacing: "2px",
  fontSize: "13px",
};

const headingStyle = {
  fontSize: "clamp(30px, 5vw, 48px)",
  lineHeight: "1.1",
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
  padding: "28px",
};

const primaryButton = {
  display: "inline-block",
  background: "#F4C20D",
  color: "#050505",
  textDecoration: "none",
  fontWeight: "900",
  padding: "16px 22px",
  borderRadius: "8px",
};

const secondaryButton = {
  display: "inline-block",
  background: "#111111",
  color: "#FFFFFF",
  textDecoration: "none",
  fontWeight: "900",
  padding: "15px 22px",
  border: "1px solid #333333",
  borderRadius: "8px",
};
