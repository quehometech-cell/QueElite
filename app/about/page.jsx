export const metadata = {
  title: "About Que Kirby | Get Cha Right Fitness",
  description: "Meet Que Kirby, ISSA Certified Personal Trainer and founder of Get Cha Right Fitness.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <main style={{ background: "#050505", minHeight: "100vh", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <nav style={{ padding: "18px 20px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <a href="/" style={{ color: "#F4C20D", fontWeight: 900, textDecoration: "none", letterSpacing: 1 }}>GET CHA RIGHT</a>
        <div style={{ display: "flex", gap: 16, fontSize: 14, flexWrap: "wrap" }}>
          <a href="/services" style={{ color: "#bbb" }}>Services</a>
          <a href="/pricing" style={{ color: "#bbb" }}>Pricing</a>
          <a href="/about" style={{ color: "#fff" }}>About</a>
          <a href="/contact" style={{ color: "#bbb" }}>Contact</a>
        </div>
      </nav>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "70px 20px 120px" }}>
        <p style={{ color: "#F4C20D", fontWeight: 900, letterSpacing: 2, fontSize: 13 }}>MEET YOUR COACH</p>
        <h1 style={{ fontSize: "clamp(48px, 9vw, 84px)", lineHeight: 0.95, margin: "12px 0 24px" }}>QUE KIRBY</h1>
        <p style={{ fontSize: "clamp(20px, 3vw, 26px)", lineHeight: 1.6, color: "#ddd", maxWidth: 760 }}>I built Get Cha Right Fitness around one idea: your training should fit your real life.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, margin: "34px 0" }}>
          {[
            ["ISSA CERTIFIED", "Personal Trainer"],
            ["COACHING STYLE", "Strength + mobility + conditioning"],
            ["TRAINING", "Home, gym, online + hybrid"],
          ].map(([title, value]) => (
            <div key={title} style={{ background: "#111", border: "1px solid #2A2A2A", borderRadius: 16, padding: 22 }}>
              <div style={{ color: "#F4C20D", fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>{title}</div>
              <div style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.5 }}>{value}</div>
            </div>
          ))}
        </div>
        <p style={{ color: "#bbb", fontSize: 17, lineHeight: 1.8 }}>I work with beginners and experienced adults who want to get stronger, lose body fat, build muscle, improve conditioning, move better, or get back into a consistent routine.</p>
        <p style={{ color: "#bbb", fontSize: 17, lineHeight: 1.8 }}>You do not need to know exactly what to do when you walk into the gym. That is what coaching is for. I build the plan, teach the movements, adjust the work, and keep you accountable.</p>
        <div style={{ background: "#111", border: "1px solid #2d2d2d", borderRadius: 18, padding: 26, marginTop: 30 }}>
          <h2 style={{ marginTop: 0 }}>What you can expect</h2>
          <ul style={{ color: "#bbb", lineHeight: 2, paddingLeft: 22 }}>
            <li>Training built around your goal and current ability</li>
            <li>Strength, conditioning, mobility, and corrective exercise</li>
            <li>Nutrition guidance without extreme dieting</li>
            <li>Accountability and progress tracking</li>
            <li>Home, gym, online, or hybrid options</li>
          </ul>
        </div>
        <a href="/starter-kit" style={{ background: "#F4C20D", color: "#050505", padding: "14px 22px", borderRadius: 10, fontWeight: 900, textDecoration: "none", display: "inline-block", marginTop: 30 }}>TRY THE 3-DAY PREVIEW</a>
      </section>
    </main>
  );
}