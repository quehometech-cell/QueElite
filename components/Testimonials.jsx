export default function Testimonials() {
  const transformations = [
    {
      name: "Coach Que",
      label: "12-Week Transformation",
      note: "Coach transformation",
      beforeImage: "/transformations/coach-que-before.jpg",
      afterImage: "/transformations/coach-que-after.jpg",
    },
    {
      name: "K. Cropper",
      label: "12-Week Transformation",
      note: "Client transformation",
      beforeImage: "/transformations/k-cropper-before.jpg",
      afterImage: "/transformations/k-cropper-after.jpg",
      review: "Amazing knowledge and expertise! atmosphere was wonderful as well. Highly recommend",
      reviewer: "Kevonta Cropper",
    },
  ];

  const reviews = [
    {
      name: "Kevonta Cropper",
      text: "Amazing knowledge and expertise! atmosphere was wonderful as well. Highly recommend",
    },
    {
      name: "Nolyt Ylrae",
      text: "Laquince gone get you right . Great motivation and dedication",
    },
  ];

  const steps = [
    ["Create Your Account", "Start your Get Cha Right account and choose your coaching path."],
    ["Complete Your Assessment", "Tell us your goals, experience, equipment, and schedule."],
    ["Get Your Program", "Your training plan is assigned based on your onboarding and coaching needs."],
    ["Train & Track", "Log workouts, nutrition, mobility work, and progress from your member portal."],
    ["Check In", "Use weekly check-ins so your coach can review progress and make adjustments."],
  ];

  return (
    <>
      <section style={{ padding: "80px 20px", background: "#050505", color: "#FFFFFF" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ color: "#F4C20D", fontWeight: "900", letterSpacing: "2px", fontSize: "12px", textAlign: "center" }}>
            REAL PEOPLE. REAL PROGRESS.
          </p>
          <h2 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "8px 0 12px", textAlign: "center" }}>
            12-Week Transformations
          </h2>
          <p style={{ color: "#999", maxWidth: "680px", margin: "0 auto 34px", textAlign: "center", lineHeight: 1.6 }}>
            Real progress built through structured training, consistency, nutrition, and accountability.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
            {transformations.map((item) => (
              <article key={item.name} style={{ background: "#111", border: "1px solid #2A2A2A", borderRadius: "18px", padding: "26px" }}>
                <div style={{ color: "#F4C20D", fontWeight: 900, fontSize: "12px", letterSpacing: "1.5px" }}>{item.label.toUpperCase()}</div>
                <h3 style={{ fontSize: "26px", margin: "8px 0 5px" }}>{item.name}</h3>
                <p style={{ color: "#999", margin: "0 0 18px" }}>{item.note}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: item.review ? "20px" : 0 }}>
                  <figure style={{ margin: 0 }}>
                    <img src={item.beforeImage} alt={`${item.name} before 12-week transformation`} loading="lazy" style={{ width: "100%", height: "320px", objectFit: "cover", objectPosition: "center top", borderRadius: "12px", border: "1px solid #333", display: "block" }} />
                    <figcaption style={{ textAlign: "center", fontWeight: 900, marginTop: "8px", fontSize: "12px" }}>BEFORE</figcaption>
                  </figure>
                  <figure style={{ margin: 0 }}>
                    <img src={item.afterImage} alt={`${item.name} after 12-week transformation`} loading="lazy" style={{ width: "100%", height: "320px", objectFit: "cover", objectPosition: "center top", borderRadius: "12px", border: "1px solid #F4C20D", display: "block" }} />
                    <figcaption style={{ textAlign: "center", fontWeight: 900, marginTop: "8px", fontSize: "12px", color: "#F4C20D" }}>12 WEEKS LATER</figcaption>
                  </figure>
                </div>
                {item.review && (
                  <div style={{ borderTop: "1px solid #2A2A2A", paddingTop: "18px" }}>
                    <div aria-label="5 out of 5 stars" style={{ color: "#F4C20D", letterSpacing: "2px", marginBottom: "9px" }}>★★★★★</div>
                    <p style={{ color: "#DDD", lineHeight: 1.6, margin: "0 0 8px" }}>&ldquo;{item.review}&rdquo;</p>
                    <small style={{ color: "#888" }}>{item.reviewer} · Google Review</small>
                  </div>
                )}
              </article>
            ))}
          </div>

          <p style={{ color: "#777", fontSize: "11px", lineHeight: 1.6, textAlign: "center", maxWidth: "760px", margin: "22px auto 0" }}>
            Individual results vary. Results depend on starting point, consistency, nutrition, training, lifestyle, and other individual factors.
          </p>

          <div style={{ marginTop: "54px" }}>
            <p style={{ color: "#F4C20D", fontWeight: "900", letterSpacing: "2px", fontSize: "12px", textAlign: "center" }}>WHAT CLIENTS SAY</p>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", margin: "8px 0 28px", textAlign: "center" }}>5-Star Google Reviews</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
              {reviews.map((review) => (
                <blockquote key={review.name} style={{ margin: 0, background: "#111", border: "1px solid #2A2A2A", borderRadius: "16px", padding: "24px" }}>
                  <div aria-label="5 out of 5 stars" style={{ color: "#F4C20D", letterSpacing: "2px", marginBottom: "12px" }}>★★★★★</div>
                  <p style={{ color: "#DDD", lineHeight: 1.65, margin: "0 0 14px" }}>&ldquo;{review.text}&rdquo;</p>
                  <footer style={{ color: "#999", fontSize: "13px", fontWeight: 700 }}>{review.name} · Google Review</footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "34px" }}>
            <a href="/join?package=12" style={{ display: "inline-flex", minHeight: "52px", alignItems: "center", justifyContent: "center", background: "#F4C20D", color: "#050505", padding: "0 24px", borderRadius: "10px", textDecoration: "none", fontWeight: 900 }}>
              START YOUR 12-WEEK TRANSFORMATION →
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 20px", background: "#0D0D0D", color: "#FFFFFF" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ color: "#F4C20D", fontWeight: "900", letterSpacing: "2px", fontSize: "12px", textAlign: "center" }}>SIMPLE FROM DAY ONE</p>
          <h2 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "8px 0 38px", textAlign: "center" }}>How It Works</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {steps.map(([title, description], index) => (
              <div key={title} style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: "16px", alignItems: "start", background: "#151515", padding: "20px", border: "1px solid #2A2A2A", borderRadius: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#F4C20D", color: "#050505", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900" }}>{index + 1}</div>
                <div>
                  <h3 style={{ margin: "2px 0 7px", fontSize: "18px" }}>{title}</h3>
                  <p style={{ margin: 0, color: "#999999", lineHeight: "1.55", fontSize: "14px" }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
