export const metadata = {
  title: "Free 3-Day Sedentary Reset | Get Cha Right Fitness",
  description:
    "A free 3-day beginner-friendly workout starter kit for sedentary professionals. Start moving, building strength, and improving mobility without a gym membership.",
};

const Exercise = ({ name, prescription, description }) => (
  <div
    style={{
      padding: "18px 0",
      borderBottom: "1px solid #2a2a2a",
    }}
  >
    <h3
      style={{
        margin: "0 0 6px",
        fontSize: "20px",
      }}
    >
      {name}
    </h3>

    <p
      style={{
        color: "#facc15",
        fontWeight: "bold",
        margin: "0 0 8px",
      }}
    >
      {prescription}
    </p>

    <p
      style={{
        color: "#bbb",
        lineHeight: "1.6",
        margin: 0,
      }}
    >
      {description}
    </p>
  </div>
);

const Day = ({ number, title, subtitle, children }) => (
  <section
    style={{
      background: "#111",
      border: "1px solid #262626",
      borderRadius: "14px",
      padding: "clamp(20px, 5vw, 30px)",
      marginBottom: "28px",
    }}
  >
    <p
      style={{
        color: "#facc15",
        fontWeight: "bold",
        letterSpacing: "2px",
        margin: 0,
      }}
    >
      DAY {number}
    </p>

    <h2
      style={{
        fontSize: "clamp(26px, 5vw, 32px)",
        margin: "10px 0",
      }}
    >
      {title}
    </h2>

    <p
      style={{
        color: "#aaa",
        lineHeight: "1.6",
        marginBottom: "20px",
      }}
    >
      {subtitle}
    </p>

    {children}
  </section>
);

export default function StarterKit() {
  return (
    <main
      style={{
        background: "#050505",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* HERO */}
      <section
        style={{
          padding: "80px 20px 60px",
          textAlign: "center",
          background: "#111",
        }}
      >
        <div
          style={{
            maxWidth: "850px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              color: "#facc15",
              fontWeight: "bold",
              letterSpacing: "2px",
            }}
          >
            GET CHA RIGHT FITNESS
          </p>

          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              lineHeight: "1",
              margin: "20px 0",
            }}
          >
            THE FREE 3-DAY
            <br />
            SEDENTARY RESET
          </h1>

          <p
            style={{
              color: "#ccc",
              fontSize: "clamp(17px, 3vw, 20px)",
              lineHeight: "1.6",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Spend most of your workday sitting? This beginner-friendly
            starter program helps you start moving, rebuilding strength,
            and creating a fitness routine without needing a gym membership.
          </p>

          {/* BADGES */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: "#1b1b1b",
                padding: "10px 16px",
                borderRadius: "20px",
              }}
            >
              ✓ Beginner Friendly
            </span>

            <span
              style={{
                background: "#1b1b1b",
                padding: "10px 16px",
                borderRadius: "20px",
              }}
            >
              ✓ No Gym Required
            </span>

            <span
              style={{
                background: "#1b1b1b",
                padding: "10px 16px",
                borderRadius: "20px",
              }}
            >
              ✓ Minimal Equipment
            </span>
          </div>

          {/* DOWNLOAD BUTTON */}
          <div
            style={{
              marginTop: "32px",
              textAlign: "center",
            }}
          >
            <a
              href="/Get_Cha_Right_3_Day_Sedentary_Reset.pdf"
              download
              style={{
                textDecoration: "none",
              }}
            >
              <button
                style={{
                  background: "#facc15",
                  color: "#050505",
                  border: "none",
                  padding: "18px 28px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                ↓ Download My Free Starter Kit
              </button>
            </a>

            <p
              style={{
                color: "#888",
                fontSize: "13px",
                marginTop: "12px",
              }}
            >
              Save it to your phone or print it and follow along.
            </p>
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          padding: "60px 20px",
        }}
      >
        {/* INTRO */}
        <div
          style={{
            marginBottom: "45px",
          }}
        >
          <p
            style={{
              color: "#facc15",
              fontWeight: "bold",
              letterSpacing: "2px",
            }}
          >
            START HERE
          </p>

          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 36px)",
              marginBottom: "10px",
            }}
          >
            Before You Start
          </h2>

          <p
            style={{
              color: "#bbb",
              lineHeight: "1.7",
            }}
          >
            Move at a comfortable pace and focus on good form. Rest
            approximately 45–90 seconds between sets when needed.
            Stop if an exercise causes sharp pain, dizziness, chest pain,
            or unusual shortness of breath.
          </p>

          <p
            style={{
              color: "#bbb",
              lineHeight: "1.7",
            }}
          >
            If you have medical concerns or have been advised to limit
            exercise, speak with a qualified healthcare professional before
            starting.
          </p>
        </div>

        {/* DAY 1 */}
        <Day
          number="1"
          title="MOVE AGAIN"
          subtitle="Today is about getting your body moving and practicing basic movement patterns."
        >
          <Exercise
            name="Easy Walk"
            prescription="5 minutes"
            description="Walk at a comfortable pace. You should still be able to hold a conversation."
          />

          <Exercise
            name="Chair Squat"
            prescription="3 sets × 10 reps"
            description="Sit back toward a stable chair, lightly touch the seat, then stand tall. Use the chair for confidence and control."
          />

          <Exercise
            name="Wall or Incline Push-Up"
            prescription="3 sets × 8–12 reps"
            description="Use a wall or sturdy elevated surface. Keep your body controlled as you lower yourself and press away."
          />

          <Exercise
            name="Standing Knee Raises"
            prescription="3 sets × 10 each side"
            description="Stand tall and raise one knee at a time. Hold a stable surface for balance if needed."
          />

          <Exercise
            name="Glute Bridge"
            prescription="3 sets × 12 reps"
            description="Lie on your back with your knees bent. Drive through your feet and squeeze your glutes as you raise your hips."
          />

          <Exercise
            name="Hip Flexor Stretch"
            prescription="30 seconds each side"
            description="Use a comfortable split stance and gently shift forward until you feel a stretch through the front of the hip."
          />

          <Exercise
            name="Easy Walk"
            prescription="5 minutes"
            description="Finish your first day with another relaxed walk."
          />
        </Day>

        {/* DAY 2 */}
        <Day
          number="2"
          title="MOBILITY + CORE"
          subtitle="Today focuses on movement, trunk control, and breaking up the sitting routine."
        >
          <Exercise
            name="Walk"
            prescription="10–20 minutes"
            description="Keep the pace comfortable. The goal today is consistent movement, not exhaustion."
          />

          <Exercise
            name="Cat-Cow"
            prescription="2 sets × 8 reps"
            description="Move slowly between a rounded and gently extended spine while breathing naturally."
          />

          <Exercise
            name="Bird Dog"
            prescription="3 sets × 8 each side"
            description="From your hands and knees, extend the opposite arm and leg while keeping your torso controlled."
          />

          <Exercise
            name="Dead Bug"
            prescription="3 sets × 8 each side"
            description="Keep your lower back controlled against the floor while slowly moving the opposite arm and leg."
          />

          <Exercise
            name="Calf Raises"
            prescription="3 sets × 15 reps"
            description="Raise your heels slowly, pause briefly at the top, then lower under control. Use a wall or chair for balance."
          />

          <Exercise
            name="Hip Flexor Stretch"
            prescription="30 seconds each side"
            description="Keep the stretch gentle. You should feel tension, not pain."
          />

          <Exercise
            name="Chest & Shoulder Stretch"
            prescription="30 seconds each side"
            description="Use a doorway or wall and gently open your chest and shoulder."
          />
        </Day>

        {/* DAY 3 */}
        <Day
          number="3"
          title="BUILD YOUR FOUNDATION"
          subtitle="You've started moving. Now we're combining basic strength and light conditioning."
        >
          <Exercise
            name="Easy Walk"
            prescription="5 minutes"
            description="Use this as your warm-up before the strength work begins."
          />

          <Exercise
            name="Chair or Bodyweight Squat"
            prescription="3 sets × 12 reps"
            description="Use the chair if needed. If you are comfortable without it, perform controlled bodyweight squats."
          />

          <Exercise
            name="Incline Push-Up"
            prescription="3 sets × 10 reps"
            description="Choose a sturdy surface that lets you complete your reps with controlled form."
          />

          <Exercise
            name="Backpack Romanian Deadlift"
            prescription="3 sets × 12 reps"
            description="Place light household items in a backpack. Keep it close to your body, push your hips backward, then stand tall."
          />

          <Exercise
            name="Backpack Row"
            prescription="3 sets × 10 each side"
            description="Support yourself with your free hand if needed. Pull the backpack toward your side while keeping your torso controlled."
          />

          <Exercise
            name="Glute Bridge"
            prescription="3 sets × 15 reps"
            description="Drive through your feet and squeeze your glutes at the top before lowering slowly."
          />

          <Exercise
            name="March in Place"
            prescription="3 rounds × 60 seconds"
            description="Finish with controlled marching. Rest as needed between rounds."
          />
        </Day>

        {/* COMPLETION CTA */}
        <section
          style={{
            padding: "clamp(30px, 6vw, 50px) 24px",
            background: "#facc15",
            color: "#050505",
            borderRadius: "14px",
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              letterSpacing: "2px",
              margin: 0,
            }}
          >
            YOU FINISHED THE RESET
          </p>

          <h2
            style={{
              fontSize: "clamp(30px, 6vw, 42px)",
              margin: "12px 0",
            }}
          >
            Ready to Get Cha Right?
          </h2>

          <p
            style={{
              maxWidth: "620px",
              margin: "0 auto 28px",
              lineHeight: "1.6",
            }}
          >
            The starter kit gets you moving. Personalized coaching gives you
            the structure, progression, accountability, and support to keep
            building from here.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  background: "#050505",
                  color: "#fff",
                  border: "2px solid #050505",
                  padding: "17px 28px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Book My Free Assessment
              </button>
            </a>

            <a
              href="https://buy.stripe.com/00w8wOa6X4Qc8JJ49u2sM04"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  background: "transparent",
                  color: "#050505",
                  border: "2px solid #050505",
                  padding: "17px 28px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Start Coaching
              </button>
            </a>
          </div>
        </section>

        {/* SECOND DOWNLOAD */}
        <section
          style={{
            textAlign: "center",
            marginTop: "50px",
            padding: "30px 20px",
            border: "1px solid #262626",
            borderRadius: "14px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Want to Keep the Program?
          </h2>

          <p
            style={{
              color: "#aaa",
              lineHeight: "1.6",
            }}
          >
            Download the complete 3-Day Sedentary Reset and keep it on your
            phone for easy access.
          </p>

          <a
            href="/Get_Cha_Right_3_Day_Sedentary_Reset.pdf"
            download
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                background: "#facc15",
                color: "#050505",
                border: "none",
                padding: "17px 28px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                borderRadius: "6px",
              }}
            >
              ↓ Download Starter Kit
            </button>
          </a>
        </section>

        {/* DISCLAIMER */}
        <p
          style={{
            color: "#777",
            fontSize: "12px",
            lineHeight: "1.6",
            marginTop: "35px",
            textAlign: "center",
          }}
        >
          This starter program provides general fitness information and is
          not medical advice. Exercise carries inherent risk. Choose movements
          appropriate for your current ability and consult an appropriate
          healthcare professional when necessary.
        </p>

        {/* HOME LINK */}
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <a
            href="/"
            style={{
              color: "#facc15",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ← Back to Get Cha Right Fitness
          </a>
        </div>
      </section>
    </main>
  );
}
