export const metadata = {
  title: "Online Personal Training for Busy Professionals",
  description:
    "Online personal training for busy professionals and desk workers. Get personalized workouts, mobility training, nutrition guidance, progress tracking, and coaching from anywhere.",
  alternates: {
    canonical: "/online-personal-training",
  },
  openGraph: {
    title: "Online Personal Training for Busy Professionals",
    description:
      "Personalized online fitness coaching designed for busy professionals who want to build strength, lose body fat, improve mobility, and stay consistent.",
    url: "/online-personal-training",
    type: "website",
  },
};

export default function OnlinePersonalTraining() {
  const benefits = [
    {
      title: "Personalized Training",
      text: "Get workouts structured around your goals, experience level, available equipment, and weekly schedule.",
    },
    {
      title: "Strength + Fat Loss",
      text: "Build strength and improve body composition with a training plan designed for consistent progress.",
    },
    {
      title: "Mobility Work",
      text: "Include mobility and corrective-focused movement for areas that can become stiff after spending hours sitting.",
    },
    {
      title: "Nutrition Guidance",
      text: "Build practical nutrition habits that support your fitness goals without relying on extreme diets.",
    },
    {
      title: "Progress Tracking",
      text: "Track your workouts and progress so your training has direction instead of relying on guesswork.",
    },
    {
      title: "Coach Support",
      text: "Get accountability and coaching support to help you stay consistent when work and life get busy.",
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
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "90px 20px 70px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#F4C20D",
            fontWeight: "bold",
            letterSpacing: "2px",
            fontSize: "13px",
          }}
        >
          GET CHA RIGHT FITNESS
        </p>

        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 76px)",
            lineHeight: "1.02",
            margin: "15px auto 25px",
            maxWidth: "950px",
            fontWeight: "900",
          }}
        >
          ONLINE PERSONAL TRAINING
          <br />
          <span style={{ color: "#F4C20D" }}>
            BUILT FOR BUSY PROFESSIONALS
          </span>
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
          Spend most of your workday sitting? Get a structured fitness plan
          designed to help you build strength, lose body fat, improve mobility,
          and stay consistent without living in the gym.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginTop: "35px",
          }}
        >
          <a href="/join" style={primaryButton}>
            START YOUR TRANSFORMATION →
          </a>

          <a href="/starter-kit" style={secondaryButton}>
            TRY THE FREE 3-DAY RESET
          </a>
        </div>

        <p
          style={{
            color: "#777",
            marginTop: "22px",
            fontSize: "14px",
          }}
        >
          Beginner-friendly • Home or gym • Train around your schedule
        </p>
      </section>

      <section style={sectionStyle}>
        <p style={eyebrowStyle}>FITNESS THAT FITS REAL LIFE</p>

        <h2 style={headingStyle}>
          SITTING ALL DAY CAN MAKE FITNESS FEEL HARDER THAN IT NEEDS TO
        </h2>

        <p style={paragraphStyle}>
          Long workdays, commuting, family responsibilities, and hours spent at
          a desk can make it difficult to stay active. You may feel stiff,
          struggle to stay consistent, or simply not know what to do when you
          finally have time to exercise.
        </p>

        <p style={paragraphStyle}>
          Get Cha Right Fitness gives you structure. Instead of randomly
          choosing workouts, you follow a plan built around your goals,
          experience, equipment, and schedule.
        </p>
      </section>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "70px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>
          ONLINE FITNESS COACHING
        </p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>WHAT YOU GET</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
            marginTop: "40px",
          }}
        >
          {benefits.map((benefit) => (
            <div key={benefit.title} style={cardStyle}>
              <div
                style={{
                  width: "42px",
                  height: "4px",
                  background: "#F4C20D",
                  marginBottom: "20px",
                }}
              />

              <h3 style={{ fontSize: "21px", margin: "0 0 12px" }}>
                {benefit.title}
              </h3>

              <p
                style={{
                  color: "#BDBDBD",
                  lineHeight: "1.7",
                  margin: 0,
                }}
              >
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <p style={eyebrowStyle}>SIMPLE PROCESS</p>

        <h2 style={headingStyle}>HOW ONLINE PERSONAL TRAINING WORKS</h2>

        <div style={{ marginTop: "35px" }}>
          <Step
            number="01"
            title="Create Your Account"
            text="Start your Get Cha Right Fitness account and begin your coaching setup."
          />

          <Step
            number="02"
            title="Complete Your Assessment"
            text="Tell me about your goals, experience, schedule, equipment, and current fitness level."
          />

          <Step
            number="03"
            title="Get Your Training Plan"
            text="Your training is organized around the information you provide so you know exactly what to work on."
          />

          <Step
            number="04"
            title="Train + Track"
            text="Complete your workouts and track your progress through your member portal."
          />

          <Step
            number="05"
            title="Check In"
            text="Use your check-ins and coaching support to stay accountable and keep moving forward."
          />
        </div>
      </section>

      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "70px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>WHO THIS IS FOR</p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>
          YOU DON&apos;T NEED TO BE A GYM EXPERT TO START
        </h2>

        <div
          style={{
            background: "#111111",
            border: "1px solid #2A2A2A",
            borderRadius: "18px",
            padding: "30px",
            marginTop: "35px",
          }}
        >
          {[
            "You work at a desk or spend much of your day sitting.",
            "You want to lose body fat and become stronger.",
            "You feel stiff and want to improve your mobility.",
            "You have struggled to stay consistent with fitness.",
            "You want a plan instead of guessing what workouts to do.",
            "You need training that can work at home, in a gym, or around a busy schedule.",
          ].map((item) => (
            <p
              key={item}
              style={{
                color: "#DDDDDD",
                lineHeight: "1.6",
                margin: "14px 0",
              }}
            >
              <span
                style={{
                  color: "#F4C20D",
                  fontWeight: "bold",
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

      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px 20px 80px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #171300 0%, #111111 55%, #111111 100%)",
            border: "1px solid #5a4900",
            borderRadius: "20px",
            padding: "45px 25px",
            textAlign: "center",
          }}
        >
          <p style={eyebrowStyle}>NOT READY FOR COACHING YET?</p>

          <h2
            style={{
              fontSize: "clamp(30px, 5vw, 46px)",
              margin: "10px 0 15px",
            }}
          >
            START WITH THE FREE
            <br />
            <span style={{ color: "#F4C20D" }}>3-DAY SEDENTARY RESET</span>
          </h2>

          <p
            style={{
              color: "#BDBDBD",
              maxWidth: "600px",
              margin: "0 auto 28px",
              lineHeight: "1.7",
            }}
          >
            Try three beginner-friendly days of movement, mobility, and
            strength work designed for people who spend much of their day
            sitting.
          </p>

          <a href="/starter-kit" style={primaryButton}>
            GET THE FREE RESET →
          </a>
        </div>
      </section>

      <section
        style={{
          borderTop: "1px solid #222",
          textAlign: "center",
          padding: "75px 20px",
        }}
      >
        <p style={eyebrowStyle}>GET CHA RIGHT FITNESS</p>

        <h2
          style={{
            fontSize: "clamp(34px, 6vw, 58px)",
            maxWidth: "800px",
            margin: "12px auto 20px",
            lineHeight: "1.05",
          }}
        >
          YOUR JOB MAY KEEP YOU SITTING.
          <br />
          <span style={{ color: "#F4C20D" }}>
            YOUR FITNESS DOESN&apos;T HAVE TO.
          </span>
        </h2>

        <p
          style={{
            color: "#BDBDBD",
            maxWidth: "620px",
            margin: "0 auto 30px",
            lineHeight: "1.7",
          }}
        >
          Start building a stronger, more active body with online coaching
          designed around your real life.
        </p>

        <a href="/join" style={primaryButton}>
          START YOUR TRANSFORMATION →
        </a>

        <div style={{ marginTop: "35px" }}>
          <a
            href="/"
            style={{
              color: "#F4C20D",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            ← BACK TO GET CHA RIGHT FITNESS
          </a>
        </div>
      </section>
    </main>
  );
}

function Step({ number, title, text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "22px",
        borderBottom: "1px solid #292929",
        padding: "24px 0",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          color: "#F4C20D",
          fontWeight: "900",
          fontSize: "22px",
          minWidth: "42px",
        }}
      >
        {number}
      </span>

      <div>
        <h3 style={{ margin: "0 0 8px", fontSize: "21px" }}>{title}</h3>

        <p
          style={{
            color: "#BDBDBD",
            lineHeight: "1.7",
            margin: 0,
          }}
        >
          {text}
        </p>
      </div>
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
  fontWeight: "bold",
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
  fontWeight: "bold",
  padding: "15px 22px",
  border: "1px solid #333333",
  borderRadius: "8px",
};
