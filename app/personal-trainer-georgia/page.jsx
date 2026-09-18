export const metadata = {
  title: "Personal Trainer in Georgia | Online & In-Person Training",
  description:
    "Personal training in Georgia for busy adults and professionals. Get personalized strength training, mobility work, fat-loss support, nutrition guidance, and online or in-person coaching.",
  alternates: {
    canonical: "/personal-trainer-georgia",
  },
  openGraph: {
    title: "Personal Trainer in Georgia | Get Cha Right Fitness",
    description:
      "Personalized online and in-person fitness coaching for busy adults and professionals in Georgia.",
    url: "/personal-trainer-georgia",
    type: "website",
  },
};

export default function PersonalTrainerGeorgia() {
  const services = [
    {
      title: "Personalized Training",
      text: "Training is structured around your goals, experience, current fitness level, equipment, and schedule.",
    },
    {
      title: "Strength Training",
      text: "Build strength and improve overall fitness with progressive workouts appropriate for your experience.",
    },
    {
      title: "Mobility + Movement",
      text: "Add mobility and corrective-focused movement alongside your training, especially if long workdays leave you feeling stiff.",
    },
    {
      title: "Fat-Loss Support",
      text: "Combine structured training, daily activity, sustainable nutrition habits, and accountability to support body-composition goals.",
    },
    {
      title: "Nutrition Guidance",
      text: "Use practical nutrition strategies that fit your lifestyle instead of relying on extreme or unsustainable diets.",
    },
    {
      title: "Accountability",
      text: "Track your progress and use regular coaching check-ins to help you stay consistent.",
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
        <p style={eyebrowStyle}>GET CHA RIGHT FITNESS</p>

        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            lineHeight: "1.02",
            margin: "15px auto 25px",
            fontWeight: "900",
          }}
        >
          PERSONAL TRAINING
          <br />
          <span style={{ color: "#F4C20D" }}>IN GEORGIA</span>
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
          Personalized fitness coaching for busy adults and professionals who
          want to build strength, lose body fat, improve mobility, and become
          more consistent with training.
        </p>

        <p
          style={{
            color: "#FFFFFF",
            fontWeight: "bold",
            marginTop: "18px",
          }}
        >
          Online coaching available anywhere. In-person training available in
          Georgia by appointment.
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

      {/* LOCAL INTRO */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>GEORGIA FITNESS COACHING</p>

        <h2 style={headingStyle}>
          PERSONAL TRAINING BUILT AROUND YOUR REAL LIFE
        </h2>

        <p style={paragraphStyle}>
          Finding time to exercise can be difficult when work, commuting,
          family, and other responsibilities compete for your schedule. Get Cha
          Right Fitness focuses on creating a realistic training structure
          instead of expecting fitness to take over your life.
        </p>

        <p style={paragraphStyle}>
          Clients can receive online coaching, while in-person personal
          training is available in Georgia by appointment. Your training is
          based on your goals, experience, available equipment, and schedule.
        </p>
      </section>

      {/* SERVICES */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "70px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>
          PERSONAL TRAINING SERVICES
        </p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>
          MORE THAN RANDOM WORKOUTS
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: "18px",
            marginTop: "40px",
          }}
        >
          {services.map((service) => (
            <div key={service.title} style={cardStyle}>
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
                {service.title}
              </h3>

              <p
                style={{
                  color: "#BDBDBD",
                  lineHeight: "1.7",
                  margin: 0,
                }}
              >
                {service.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IT IS FOR */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>WHO I WORK WITH</p>

        <h2 style={headingStyle}>
          YOU DON&apos;T HAVE TO ALREADY BE FIT TO START
        </h2>

        <div
          style={{
            background: "#111111",
            border: "1px solid #2A2A2A",
            borderRadius: "18px",
            padding: "30px",
            marginTop: "30px",
          }}
        >
          {[
            "Busy professionals who struggle to fit exercise into their schedule.",
            "Adults who spend much of their workday sitting.",
            "Beginners who want structure and guidance.",
            "People who want to build strength and improve body composition.",
            "People who want to improve mobility alongside their strength training.",
            "Clients who prefer online coaching or need flexible in-person training.",
          ].map((item) => (
            <p
              key={item}
              style={{
                color: "#DDDDDD",
                lineHeight: "1.7",
                margin: "14px 0",
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

      {/* ONLINE + IN PERSON */}
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "70px 20px",
        }}
      >
        <p style={{ ...eyebrowStyle, textAlign: "center" }}>
          CHOOSE HOW YOU TRAIN
        </p>

        <h2 style={{ ...headingStyle, textAlign: "center" }}>
          ONLINE OR IN-PERSON PERSONAL TRAINING
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
            marginTop: "35px",
          }}
        >
          <div style={cardStyle}>
            <h3
              style={{
                color: "#F4C20D",
                fontSize: "24px",
                marginTop: 0,
              }}
            >
              ONLINE COACHING
            </h3>

            <p style={cardTextStyle}>
              Train from home or your preferred gym while using a structured
              program built around your goals, schedule, equipment, and
              experience.
            </p>

            <a
              href="/online-personal-training"
              style={textLinkStyle}
            >
              EXPLORE ONLINE PERSONAL TRAINING →
            </a>
          </div>

          <div style={cardStyle}>
            <h3
              style={{
                color: "#F4C20D",
                fontSize: "24px",
                marginTop: 0,
              }}
            >
              IN-PERSON TRAINING
            </h3>

            <p style={cardTextStyle}>
              In-person personal training is available in Georgia by
              appointment. Availability and training location are coordinated
              based on scheduling and service area.
            </p>

            <a
              href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
              target="_blank"
              rel="noopener noreferrer"
              style={textLinkStyle}
            >
              BOOK A FREE ASSESSMENT →
            </a>
          </div>
        </div>
      </section>

      {/* DESK WORKER LINK */}
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>SPEND MOST OF THE DAY SITTING?</p>

        <h2 style={headingStyle}>FITNESS FOR DESK WORKERS</h2>

        <p style={paragraphStyle}>
          If your job keeps you at a desk for hours at a time, your fitness
          routine needs to work around that reality. Learn how strength
          training, mobility, walking, and a realistic weekly structure can
          help you become more active.
        </p>

        <a href="/fitness-for-desk-workers" style={secondaryButton}>
          READ THE DESK-WORKER FITNESS GUIDE →
        </a>
      </section>

      {/* FREE RESET */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "30px 20px 80px",
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
          <p style={eyebrowStyle}>START FOR FREE</p>

          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: "1.1",
              margin: "12px auto 18px",
            }}
          >
            TRY THE
            <br />
            <span style={{ color: "#F4C20D" }}>
              3-DAY SEDENTARY RESET
            </span>
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
          READY TO
          <br />
          <span style={{ color: "#F4C20D" }}>GET CHA RIGHT?</span>
        </h2>

        <p
          style={{
            maxWidth: "620px",
            margin: "0 auto 30px",
            color: "#BDBDBD",
            lineHeight: "1.7",
          }}
        >
          Start with personalized coaching or book a free assessment to discuss
          your goals and training options.
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

        <div style={{ marginTop: "35px" }}>
          <a href="/" style={textLinkStyle}>
            ← BACK TO GET CHA RIGHT FITNESS
          </a>
        </div>
      </section>
    </main>
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

const cardTextStyle = {
  color: "#BDBDBD",
  lineHeight: "1.7",
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

const textLinkStyle = {
  color: "#F4C20D",
  textDecoration: "none",
  fontWeight: "900",
  fontSize: "14px",
};
