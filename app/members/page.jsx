export default function MembersPage() {
  const cards = [
    {
      icon: "🏋️",
      title: "MY WORKOUTS",
      description: "View your training plan, exercises, sets, reps, and schedule.",
    },
    {
      icon: "🥗",
      title: "NUTRITION",
      description: "View your nutrition targets, meal ideas, and grocery guidance.",
    },
    {
      icon: "📈",
      title: "MY PROGRESS",
      description: "Track your weight, measurements, workouts, and progress.",
    },
    {
      icon: "✅",
      title: "WEEKLY CHECK-IN",
      description: "Submit your weekly progress and let Que know how you're doing.",
    },
    {
      icon: "🎥",
      title: "EXERCISE LIBRARY",
      description: "Watch exercise demonstrations and review proper technique.",
    },
    {
      icon: "📅",
      title: "BOOK WITH QUE",
      description: "Schedule your coaching check-in or assessment.",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#FFFFFF",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "50px",
          }}
        >
          <p
            style={{
              color: "#F4C20D",
              fontWeight: "800",
              letterSpacing: "2px",
            }}
          >
            GET CHA RIGHT FITNESS
          </p>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              margin: "10px 0",
            }}
          >
            MEMBER DASHBOARD
          </h1>

          <p
            style={{
              color: "#BDBDBD",
              fontSize: "18px",
            }}
          >
            Your training. Your nutrition. Your progress. All in one place.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              style={{
                background: "#111111",
                border: "1px solid #2A2A2A",
                borderRadius: "14px",
                padding: "30px",
              }}
            >
              <div
                style={{
                  fontSize: "34px",
                  marginBottom: "15px",
                }}
              >
                {card.icon}
              </div>

              <h2
                style={{
                  color: "#F4C20D",
                  fontSize: "20px",
                  marginBottom: "10px",
                }}
              >
                {card.title}
              </h2>

              <p
                style={{
                  color: "#D6D6D6",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "50px",
            padding: "30px",
            background: "#111111",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>
            NEED HELP WITH YOUR PLAN?
          </h2>

          <p
            style={{
              color: "#BDBDBD",
              marginBottom: "20px",
            }}
          >
            Schedule a check-in with Que and let's keep you moving forward.
          </p>

          <a
            href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#F4C20D",
              color: "#050505",
              padding: "15px 25px",
              borderRadius: "8px",
              fontWeight: "800",
              textDecoration: "none",
            }}
          >
            BOOK WITH QUE
          </a>
        </div>
      </div>
    </main>
  );
}
