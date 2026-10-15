export const metadata = {
  title: "Talk to Coach Que",
  description: "Talk directly with Que about personalized online or hybrid fitness coaching. Start by text, email, or a free consultation.",
  alternates: { canonical: "/contact" },
};
const plans = {
  personalized: "Personalized Coaching ($249/month)",
  hybrid: "Premium Hybrid Coaching ($499/month)",
  foundation: "Foundation Training ($99/month)",
};
const button = { display: "block", padding: "17px 20px", borderRadius: 12, fontWeight: 900, textDecoration: "none", textAlign: "center", lineHeight: 1.5 };
export default function Contact({ searchParams }) {
  const selected = plans[searchParams?.plan] || "fitness coaching";
  const message = `Hi Que, I’m interested in ${selected}. My main goal is ___. I would like to train at home / in a gym / with you. Can you help me get started?`;
  return <main style={{ background: "#050505", minHeight: "100vh", color: "#fff" }}>
    <nav style={{ padding: "18px 20px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <a href="/" style={{ color: "#F4C20D", fontWeight: 900, textDecoration: "none", letterSpacing: 1 }}>GET CHA RIGHT</a>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 14 }}><a href="/services" style={{ color: "#bbb" }}>Services</a><a href="/pricing" style={{ color: "#bbb" }}>Pricing</a><a href="/about" style={{ color: "#bbb" }}>About</a></div>
    </nav>
    <section style={{ maxWidth: 850, margin: "0 auto", padding: "55px 20px 120px" }}>
      <p style={{ color: "#F4C20D", fontWeight: 900, letterSpacing: 2, fontSize: 13 }}>TALK DIRECTLY WITH QUE</p>
      <h1 style={{ fontSize: "clamp(38px,7vw,68px)", lineHeight: 1.05, margin: "12px 0 18px" }}>LET’S BUILD A ROUTINE THAT FITS YOU.</h1>
      <p style={{ color: "#ccc", fontSize: 18, lineHeight: 1.7 }}>Tell me your goal, what has been getting in the way, and where you want to train. We’ll talk through the right level of support. You can start by text or email; a phone call is optional.</p>
      {plans[searchParams?.plan] && <p style={{ color: "#F4C20D", fontWeight: 800, lineHeight: 1.6 }}>You’re asking about {selected}.</p>}
      <div style={{ display: "grid", gap: 14, marginTop: 30 }}>
        <a href="sms:+14704854575" style={{ ...button, background: "#F4C20D", color: "#050505" }}>TEXT QUE “START”</a>
        <a href={`mailto:que@getcharightfitness.com?subject=${encodeURIComponent(`Getting started with ${selected}`)}&body=${encodeURIComponent(message)}`} style={{ ...button, background: "#111", border: "1px solid #444", color: "#fff" }}>EMAIL QUE ABOUT COACHING</a>
        <a href="https://calendly.com/quehometech/30min" target="_blank" rel="noopener noreferrer" style={{ ...button, background: "#111", border: "1px solid #444", color: "#fff" }}>BOOK A FREE CONSULTATION</a>
      </div>
      <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.8 }}>Text <a href="sms:+14704854575" style={{ color: "#fff" }}>470-485-4575</a> or email <a href="mailto:que@getcharightfitness.com" style={{ color: "#fff", overflowWrap: "anywhere" }}>que@getcharightfitness.com</a>. If texting from another device, include the coaching option you’re interested in.</p>
      <section style={{ background: "#111", border: "1px solid #333", borderRadius: 16, padding: 24, marginTop: 32 }}>
        <h2 style={{ marginTop: 0 }}>What happens next</h2>
        <ol style={{ color: "#ccc", lineHeight: 1.8, paddingLeft: 22 }}>
          <li>We discuss your goals, training experience, schedule, and available equipment.</li>
          <li>I recommend a coaching option and explain what support you’ll receive.</li>
          <li>We confirm your price, payment and cancellation terms, and start date before you enroll.</li>
        </ol>
        <p style={{ color: "#bbb", lineHeight: 1.7 }}>For hybrid coaching, we also confirm the location, session length, gym access requirements, and any travel costs before you commit.</p>
      </section>
      <p style={{ color: "#bbb", lineHeight: 1.7, marginTop: 30 }}>Want to explore first? <a href="/starter-kit" style={{ color: "#F4C20D", fontWeight: 800 }}>Try the free 3-Day Coaching Preview.</a></p>
      <p style={{ color: "#999", fontSize: 14, lineHeight: 1.7 }}>Serving Villa Rica and the west Atlanta area, plus online coaching.</p>
    </section>
  </main>;
}
