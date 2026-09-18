export const metadata = {
  title: "Free 3-Day Fitness Reset for Desk Workers",
  description:
    "Download a free 3-day beginner fitness reset for desk workers and busy professionals. Improve mobility, build strength, and get active at home with no gym required.",
  alternates: {
    canonical: "/starter-kit",
  },
  openGraph: {
    title: "Free 3-Day Fitness Reset for Desk Workers",
    description:
      "A free beginner-friendly 3-day fitness reset for busy professionals who spend most of their day sitting.",
    url: "/starter-kit",
    type: "website",
  },
};

export default function StarterKit() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "70px 20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#f5c518",
            fontWeight: "bold",
            letterSpacing: "2px",
            marginBottom: "12px",
          }}
        >
          GET CHA RIGHT FITNESS
        </p>

        <h1
          style={{
            fontSize: "clamp(38px, 7vw, 72px)",
            lineHeight: "1",
            margin: "0 0 22px",
            fontWeight: "900",
          }}
        >
          FREE 3-DAY
          <br />
          <span style={{ color: "#f5c518" }}>SEDENTARY RESET</span>
        </h1>

        <p
          style={{
            maxWidth: "650px",
            margin: "0 auto 18px",
            fontSize: "20px",
            lineHeight: "1.6",
            color: "#ddd",
          }}
        >
          A beginner-friendly fitness reset for desk workers and busy
          professionals who spend most of their workday sitting. Start moving
          better, building strength, and getting active with simple workouts
          you can do at home.
        </p>

        <p
          style={{
            fontWeight: "bold",
            marginBottom: "35px",
          }}
        >
          No gym membership required.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "35px",
          }}
        >
          {["Beginner Friendly", "Home Workouts", "Minimal Equipment"].map(
            (item) => (
              <span
                key={item}
                style={{
                  border: "1px solid #333",
                  padding: "10px 16px",
                  borderRadius: "30px",
                  color: "#ddd",
                  background: "#111",
                }}
              >
                ✓ {item}
              </span>
            )
          )}
        </div>

        <div
          style={{
            maxWidth: "620px",
            margin: "0 auto",
            padding: "30px 15px",
            background: "#111",
            border: "1px solid #292929",
            borderRadius: "18px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              marginTop: "0",
              marginBottom: "8px",
            }}
          >
            Get the Reset FREE
          </h2>

          <p
            style={{
              color: "#aaa",
              marginTop: "0",
              marginBottom: "20px",
            }}
          >
            Enter your first name and email below to get instant access.
          </p>

          <iframe
            width="540"
            height="305"
            src="https://03d649f7.sibforms.com/v2/serve/MUIFAO4vBfg2-jANRSsguAJzE2IazQp8KaIC2X6WEDiZ0Xc77DePVhFWXJlE_cqEOGjivFcBT8iG6f_e6hooQQwN_5lAaeinACy8gJ_2Nk2VoxhbgTgqbSAG--bRply3sIvkSt6097jVyE3kmXSR2l_irVTEUgtOpEf2Ei3oXLlloaIaavtjuLq7p09Y8xCxrcrBVKpvesSNnVm0Jg=="
            frameBorder="0"
            scrolling="auto"
            allowFullScreen
            title="Get Cha Right Fitness 3-Day Sedentary Reset Signup"
            style={{
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              maxWidth: "100%",
              border: "none",
            }}
          />
        </div>

        <div
          style={{
            maxWidth: "700px",
            margin: "55px auto 0",
            textAlign: "left",
          }}
        >
          <h2 style={{ textAlign: "center", fontSize: "30px" }}>
            WHAT YOU&apos;LL DO
          </h2>

          <div style={cardStyle}>
            <span style={dayStyle}>DAY 1</span>
            <h3>Move Again</h3>
            <p>
              Wake your body up with walking, squats, beginner pushing
              movements, glute work, and mobility.
            </p>
          </div>

          <div style={cardStyle}>
            <span style={dayStyle}>DAY 2</span>
            <h3>Mobility + Core</h3>
            <p>
              Work on the areas that often get neglected after hours of
              sitting, including your hips, core, calves, chest, and shoulders.
            </p>
          </div>

          <div style={cardStyle}>
            <span style={dayStyle}>DAY 3</span>
            <h3>Build Your Foundation</h3>
            <p>
              Put everything together with a simple full-body workout using
              bodyweight and everyday equipment.
            </p>
          </div>
        </div>

        <section
          style={{
            maxWidth: "700px",
            margin: "55px auto 0",
            textAlign: "left",
            background: "#111",
            border: "1px solid #292929",
            borderRadius: "14px",
            padding: "28px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "28px",
              marginTop: "0",
            }}
          >
            FITNESS FOR PEOPLE WHO SIT ALL DAY
          </h2>

          <p
            style={{
              color: "#ccc",
              lineHeight: "1.7",
              marginBottom: "0",
            }}
          >
            Long workdays at a desk can make staying active difficult. This
            free reset gives beginners and busy professionals a simple place to
            start with strength, mobility, walking, and full-body movement. You
            can complete the workouts at home with minimal equipment and build
            a foundation for a more consistent fitness routine.
          </p>
        </section>

        <p
          style={{
            color: "#777",
            fontSize: "13px",
            maxWidth: "700px",
            margin: "45px auto 0",
            lineHeight: "1.5",
          }}
        >
          Exercise at a comfortable pace and stop if you experience sharp pain,
          dizziness, chest pain, or unusual shortness of breath. If you have
          medical concerns or physical limitations, consult an appropriate
          healthcare professional before beginning a new exercise program.
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "35px",
            color: "#f5c518",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Back to Get Cha Right Fitness
        </a>
      </section>
    </main>
  );
}

const cardStyle = {
  background: "#111",
  border: "1px solid #292929",
  borderRadius: "14px",
  padding: "25px",
  marginTop: "18px",
};

const dayStyle = {
  color: "#f5c518",
  fontWeight: "bold",
  fontSize: "13px",
  letterSpacing: "2px",
};
