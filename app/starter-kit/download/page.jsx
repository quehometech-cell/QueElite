export const metadata = {
  title: "Your 3-Day Reset | Get Cha Right Fitness",
  description: "Download your free Get Cha Right Fitness 3-Day Sedentary Reset.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DownloadStarterKit() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "700px",
          textAlign: "center",
          background: "#111",
          border: "1px solid #292929",
          borderRadius: "20px",
          padding: "50px 25px",
        }}
      >
        <p
          style={{
            color: "#f5c518",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}
        >
          GET CHA RIGHT FITNESS
        </p>

        <div style={{ fontSize: "55px", margin: "15px 0" }}>
          💪
        </div>

        <h1
          style={{
            fontSize: "clamp(38px, 7vw, 60px)",
            margin: "0 0 15px",
          }}
        >
          YOU'RE IN.
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#ccc",
            lineHeight: "1.6",
          }}
        >
          Your FREE 3-Day Sedentary Reset is ready.
        </p>

        <a
          href="/Get_Cha_Right_3_Day_Sedentary_Reset.pdf"
          download
          style={{
            display: "inline-block",
            background: "#f5c518",
            color: "#050505",
            padding: "18px 28px",
            borderRadius: "10px",
            fontWeight: "900",
            fontSize: "17px",
            textDecoration: "none",
            marginTop: "20px",
          }}
        >
          ↓ DOWNLOAD MY RESET
        </a>

        <div
          style={{
            borderTop: "1px solid #333",
            margin: "40px auto 30px",
            maxWidth: "500px",
          }}
        />

        <h2>Ready for personalized coaching?</h2>

        <p
          style={{
            color: "#aaa",
            lineHeight: "1.6",
            maxWidth: "500px",
            margin: "0 auto 25px",
          }}
        >
          Book your free 15-minute assessment and we'll talk about your goals,
          schedule, experience, and the best next step for you.
        </p>

        <a
          href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            border: "2px solid #f5c518",
            color: "#f5c518",
            padding: "15px 24px",
            borderRadius: "10px",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          BOOK MY FREE ASSESSMENT
        </a>

        <p
          style={{
            color: "#666",
            fontSize: "13px",
            marginTop: "35px",
            lineHeight: "1.5",
          }}
        >
          Save the PDF to your phone or computer so you can follow the program
          over the next three days.
        </p>
      </section>
    </main>
  );
}
