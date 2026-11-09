export const metadata = {
  title: "Personal Trainer in Villa Rica, GA | Get Cha Right Fitness",
  description: "Build strength, improve mobility, and stay consistent with personalized online, hybrid, and in-person coaching from Coach Que in Villa Rica and west Atlanta.",
  alternates: { canonical: "/" },
  openGraph: { title: "Get Cha Right Fitness | Personal Training & Online Coaching", description: "Personalized strength, mobility, and fitness coaching in Villa Rica and west Atlanta.", url: "https://www.getcharightfitness.com", siteName: "Get Cha Right Fitness", type: "website" }
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Get Cha Right Fitness",
  url: "https://www.getcharightfitness.com",
  description: "Personal training, strength and conditioning, corrective exercise, nutrition coaching, and online and hybrid fitness coaching.",
  areaServed: [{ "@type": "Place", name: "Villa Rica, Georgia" }, { "@type": "Place", name: "West Atlanta, Georgia" }],
  founder: { "@type": "Person", name: "Que Kirby", jobTitle: "Certified Personal Trainer" },
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Personal Training and Fitness Coaching" }
};

const goals = [
  ["01", "Lose body fat", "Build a sustainable routine with strength training, conditioning, and practical nutrition guidance."],
  ["02", "Build muscle & strength", "Follow a progressive plan designed around your experience, equipment, and schedule."],
  ["03", "Move and feel better", "Add mobility, corrective exercise, and conditioning to a well-rounded training plan."],
  ["04", "Get consistent again", "Start with a realistic workload, clear direction, and accountability that fits real life."]
];

const steps = [
  ["01", "Start with a conversation", "Tell Que what you want to change, your training experience, and what your week looks like."],
  ["02", "Get a plan that fits", "Choose online, hybrid, or in-person coaching, then build a plan around your goals and setup."],
  ["03", "Train, check in, adjust", "Track progress, get feedback, and make practical adjustments as you build consistency."]
];

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />
    <main className="gcr-home">
      <header className="gcr-header">
        <a className="gcr-brand" href="/" aria-label="Get Cha Right Fitness home"><span className="brand-mark">G</span><span>GET CHA RIGHT <small>FITNESS</small></span></a>
        <nav className="gcr-nav" aria-label="Main navigation">
          <a href="/services">Coaching</a><a href="/pricing">Pricing</a><a href="/about">Meet Que</a><a href="/for-coaches">For Coaches</a>
        </nav>
        <div className="gcr-head-actions"><a className="member-link" href="/login">Member login</a><a className="button button-gold button-small" href="/contact">Free consultation <span>↗</span></a></div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line"></span> PERSONAL TRAINING · ONLINE COACHING · WEST ATLANTA</div>
            <h1>Build strength.<br/><em>Move with purpose.</em><br/>Make it last.</h1>
            <p className="hero-lead">Training should work with your life—not take it over. Get a clear plan, practical coaching, and accountability built around your goals.</p>
            <div className="hero-actions"><a className="button button-gold" href="/contact">Talk with Coach Que <span>↗</span></a><a className="button button-outline" href="/starter-kit">Try the free 3-day preview</a></div>
            <div className="hero-proof"><span className="proof-stars">★★★★★</span><span>Personal coaching for real-life goals</span><span className="proof-dot">·</span><span>Villa Rica + online</span></div>
          </div>
          <div className="hero-art" aria-label="Get Cha Right Fitness brand graphic">
            <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
            <div className="art-label label-top">DISCIPLINE / CONSISTENCY</div>
            <div className="art-monogram">G<span>+</span>R</div>
            <div className="art-caption"><span>YOUR NEXT REP</span><strong>STARTS HERE.</strong></div>
            <div className="art-index">GCR / 001</div>
          </div>
        </div>
        <div className="hero-bottom"><span>COACHING THAT MEETS YOU WHERE YOU ARE</span><span>01 — 04</span></div>
      </section>

      <section className="trust-strip"><div><strong>ISSA CERTIFIED</strong><span>Personal Training · Corrective Exercise · Strength & Conditioning · Nutrition</span></div><div><strong>FLEXIBLE FORMATS</strong><span>In-person · Hybrid · Online</span></div><div><strong>LOCAL ROOTS</strong><span>Villa Rica · Douglasville · West Atlanta</span></div></section>

      <section className="section goals-section">
        <div className="section-heading"><div><div className="eyebrow dark-eyebrow">START WITH YOUR GOAL</div><h2>What are you<br/><em>working toward?</em></h2></div><p>There is no one-size-fits-all starting point. We build your training around what matters to you, what you can do today, and the time you have available.</p></div>
        <div className="goal-grid">{goals.map(([n,t,d])=><article className="goal-card" key={n}><span className="goal-number">{n}</span><div><h3>{t}</h3><p>{d}</p></div><span className="goal-arrow">↗</span></article>)}</div>
      </section>

      <section className="dark-band">
        <div className="section split-section"><div><div className="eyebrow"><span className="eyebrow-line"></span> A COACHING PLAN, NOT A GUESSING GAME</div><h2>Structure when you need it.<br/><em>Support when it counts.</em></h2><p>Get Cha Right combines purposeful strength training, movement work, and accountability. Your plan can evolve as your schedule, confidence, and goals change.</p><a className="text-link" href="/services">Explore coaching options <span>→</span></a></div>
          <div className="feature-list"><div><span>01</span><div><strong>Personalized training</strong><p>Programming shaped around your goals, experience, and available equipment.</p></div></div><div><span>02</span><div><strong>Practical nutrition guidance</strong><p>Build habits and targets you can use in everyday life.</p></div></div><div><span>03</span><div><strong>Progress and accountability</strong><p>Check-ins and adjustments help you stay focused and see where you are going.</p></div></div><div><span>04</span><div><strong>Mobility and movement</strong><p>Make room for better movement, conditioning, and recovery.</p></div></div></div>
        </div>
      </section>

      <section className="section process-section">
        <div className="eyebrow dark-eyebrow">HOW IT WORKS</div><div className="section-heading"><h2>Simple steps.<br/><em>Real direction.</em></h2><p>You do not need to have everything figured out before you start. We will work through the details together.</p></div>
        <div className="steps-grid">{steps.map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="coach-band"><div className="coach-inner"><div className="coach-monogram">QK</div><div className="coach-copy"><div className="eyebrow"><span className="eyebrow-line"></span> MEET YOUR COACH</div><h2>Coaching built on<br/><em>experience and intention.</em></h2><p>Que Kirby is a U.S. Army veteran and ISSA-certified coach in personal training, corrective exercise, strength and conditioning, and nutrition. His approach is straightforward: understand your starting point, build a plan, and help you follow through.</p><a className="text-link" href="/about">Get to know Que <span>→</span></a></div></div></section>

      <section className="section reviews-section"><div className="section-heading"><div><div className="eyebrow dark-eyebrow">KIND WORDS</div><h2>Good coaching<br/><em>makes a difference.</em></h2></div><a className="text-link dark-link" href="/contact">Start a conversation <span>→</span></a></div><div className="review-grid"><blockquote><div className="review-stars">★★★★★</div><p>“Amazing knowledge and expertise! atmosphere was wonderful as well. Highly recommend”</p><footer>Kevonta Cropper <span>Google Review</span></footer></blockquote><blockquote><div className="review-stars">★★★★★</div><p>“Laquince gone get you right. Great motivation and dedication”</p><footer>Nolyt Ylrae <span>Google Review</span></footer></blockquote></div></section>

      <section className="final-cta"><div className="eyebrow">YOUR NEXT STEP</div><h2>Ready to get<br/><em>cha right?</em></h2><p>Tell us what you are working toward. We will talk through your options and find a sensible place to start.</p><div className="hero-actions"><a className="button button-dark" href="/contact">Book a free consultation <span>↗</span></a><a className="button button-light-outline" href="/pricing">View coaching prices</a></div><small>No pressure. Just a conversation about your goals.</small></section>

      <footer className="gcr-footer"><a className="gcr-brand" href="/"><span className="brand-mark">G</span><span>GET CHA RIGHT <small>FITNESS</small></span></a><p>Personal training and online coaching for stronger, more capable living.</p><div><a href="/services">Coaching</a><a href="/pricing">Pricing</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/login">Member login</a></div><small>© {new Date().getFullYear()} Get Cha Right Fitness · Villa Rica, Georgia</small></footer>
    </main>
    <style>{`
      .gcr-home{--gold:#e6b91e;--ink:#11110f;--muted:#6f706c;--paper:#f4f2ec;background:#f4f2ec;color:#171714;font-family:Arial,Helvetica,sans-serif;overflow:hidden}
      .gcr-home *{box-sizing:border-box}.gcr-header{height:82px;padding:0 clamp(20px,5vw,76px);display:flex;align-items:center;justify-content:space-between;gap:26px;background:#11110f;color:#fff;border-bottom:1px solid #292925}
      .gcr-brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:1.5px;white-space:nowrap}.gcr-brand small{display:block;color:var(--gold);font-size:9px;letter-spacing:3px;margin-top:4px}.brand-mark{display:grid;place-items:center;width:37px;height:37px;background:var(--gold);color:#111;border-radius:50%;font-size:21px;font-weight:900}
      .gcr-nav,.gcr-head-actions{display:flex;align-items:center;gap:clamp(12px,2.2vw,30px)}.gcr-nav a,.member-link{color:#d1d0ca;text-decoration:none;font-size:13px;font-weight:700}.gcr-nav a:hover,.member-link:hover{color:var(--gold)}
      .button{display:inline-flex;align-items:center;justify-content:center;gap:16px;min-height:54px;padding:0 22px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:900;letter-spacing:.2px;transition:transform .2s,background .2s}.button:hover{transform:translateY(-2px)}.button-gold{background:var(--gold);color:#141410}.button-small{min-height:42px;padding:0 16px;font-size:12px}.button-outline{border:1px solid #77766d;color:#fff;background:transparent}.button-dark{background:#171714;color:#fff}.button-light-outline{border:1px solid rgba(255,255,255,.65);color:#fff}
      .hero{background:#11110f;color:#fff;padding:clamp(65px,8vw,116px) clamp(20px,7vw,100px) 28px;position:relative}.hero-inner{max-width:1260px;margin:auto;display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center;min-height:470px}.hero-copy{max-width:680px;position:relative;z-index:2}.eyebrow{font-size:10px;font-weight:900;letter-spacing:2.3px;color:var(--gold);display:flex;align-items:center;gap:10px}.eyebrow-line{width:30px;height:1px;background:var(--gold)}.hero h1{font-size:clamp(48px,7.3vw,91px);line-height:.98;letter-spacing:-4px;margin:25px 0 22px;font-weight:900}.hero h1 em,.section h2 em,.coach-copy h2 em,.final-cta h2 em{font-style:normal;color:var(--gold)}.hero-lead{max-width:600px;color:#c5c4bd;font-size:clamp(16px,1.7vw,19px);line-height:1.75}.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.hero-proof{display:flex;align-items:center;gap:12px;flex-wrap:wrap;color:#9d9c95;font-size:11px;margin-top:30px}.proof-stars,.review-stars{color:var(--gold);letter-spacing:2px}.proof-dot{color:var(--gold)}
      .hero-art{height:420px;max-width:500px;width:100%;justify-self:end;position:relative;display:grid;place-items:center;background:radial-gradient(ellipse at center,rgba(230,185,30,.17),transparent 60%),linear-gradient(145deg,#1b1b17,#10100e);border:1px solid #35352c;overflow:hidden}.hero-art:before,.hero-art:after{content:"";position:absolute;width:360px;height:360px;border:1px solid rgba(230,185,30,.22);border-radius:50%}.hero-art:after{width:470px;height:470px;border-color:rgba(255,255,255,.08)}.art-orbit{position:absolute;border:1px solid rgba(230,185,30,.18);border-radius:50%;transform:rotate(-25deg)}.orbit-one{width:410px;height:180px}.orbit-two{width:480px;height:250px;transform:rotate(28deg)}.art-monogram{font-size:clamp(80px,13vw,150px);font-weight:900;letter-spacing:-15px;color:#f4f1e6;position:relative;z-index:1}.art-monogram span{color:var(--gold);font-size:.55em;vertical-align:top}.art-label,.art-index,.art-caption{position:absolute;z-index:2;font-size:9px;letter-spacing:2px;color:#b5b3a8}.label-top{top:25px;left:25px}.art-index{bottom:25px;right:25px}.art-caption{bottom:24px;left:25px;display:grid;gap:6px}.art-caption strong{font-size:19px;letter-spacing:1px;color:#fff}.hero-bottom{max-width:1260px;margin:55px auto 0;padding-top:17px;border-top:1px solid #35352c;display:flex;justify-content:space-between;color:#77766d;font-size:9px;letter-spacing:2px}
      .trust-strip{display:grid;grid-template-columns:repeat(3,1fr);background:var(--gold);padding:23px clamp(20px,7vw,100px);gap:20px}.trust-strip div{display:grid;gap:6px}.trust-strip strong{font-size:10px;letter-spacing:1.6px}.trust-strip span{font-size:12px;color:#3d351b;line-height:1.5}
      .section{max-width:1260px;margin:0 auto;padding:clamp(65px,8vw,110px) clamp(20px,5vw,55px)}.section-heading{display:flex;justify-content:space-between;align-items:end;gap:40px;margin-bottom:38px}.section h2,.coach-copy h2{font-size:clamp(38px,5vw,62px);line-height:1.02;letter-spacing:-2px;margin:17px 0 0}.section-heading>p{max-width:420px;color:var(--muted);line-height:1.8;font-size:15px;margin:0 0 5px}.dark-eyebrow{color:#8c6c08}.goal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.goal-card{min-height:245px;background:#fff;border:1px solid #e2dfd6;padding:23px;display:flex;flex-direction:column;justify-content:space-between;position:relative;transition:transform .2s,border .2s}.goal-card:hover{transform:translateY(-4px);border-color:var(--gold)}.goal-number{color:#a28a44;font-size:11px;font-weight:900;letter-spacing:1px}.goal-card h3{font-size:20px;letter-spacing:-.5px;margin:0 0 10px}.goal-card p{color:var(--muted);font-size:13px;line-height:1.7;margin:0}.goal-arrow{position:absolute;right:22px;top:18px;color:#b18d20;font-size:20px}
      .dark-band{background:#171714;color:#fff}.split-section{display:grid;grid-template-columns:1fr 1fr;gap:clamp(35px,8vw,110px);align-items:center}.split-section>div:first-child>p{color:#b5b4ac;line-height:1.8;max-width:510px;margin:24px 0}.text-link{display:inline-flex;gap:14px;align-items:center;color:var(--gold);font-size:13px;font-weight:900;text-decoration:none;border-bottom:1px solid rgba(230,185,30,.5);padding-bottom:8px}.text-link span{font-size:19px}.feature-list{border-top:1px solid #3c3b34}.feature-list>div{display:grid;grid-template-columns:40px 1fr;gap:15px;padding:20px 0;border-bottom:1px solid #3c3b34}.feature-list>div>span{color:var(--gold);font-size:11px;font-weight:900}.feature-list strong{font-size:15px}.feature-list p{margin:7px 0 0;color:#a8a79f;font-size:12px;line-height:1.6}
      .process-section .section-heading{margin-top:15px}.steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}.steps-grid article{border-top:1px solid #c9c5b9;padding-top:20px}.steps-grid article>span{color:#9c7c17;font-size:11px;font-weight:900}.steps-grid h3{font-size:21px;margin:22px 0 10px}.steps-grid p{font-size:13px;line-height:1.75;color:var(--muted);max-width:320px}
      .coach-band{background:#22221d;color:#fff}.coach-inner{max-width:1150px;margin:auto;padding:clamp(55px,8vw,95px) clamp(20px,5vw,55px);display:grid;grid-template-columns:.75fr 1.25fr;gap:clamp(30px,8vw,100px);align-items:center}.coach-monogram{height:290px;display:grid;place-items:center;background:linear-gradient(145deg,#3b3828,#171714);border:1px solid #51472b;color:var(--gold);font-size:clamp(90px,15vw,170px);font-weight:900;letter-spacing:-12px}.coach-copy h2{margin-bottom:20px}.coach-copy>p{color:#c1c0b8;line-height:1.8;font-size:15px;max-width:650px;margin-bottom:24px}
      .reviews-section .section-heading{align-items:end}.dark-link{color:#80610a;border-color:#bba35b}.review-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.review-grid blockquote{margin:0;background:#fff;border:1px solid #e2dfd6;padding:28px}.review-grid blockquote p{font-size:17px;line-height:1.7;color:#333;margin:18px 0 25px}.review-grid footer{font-size:12px;font-weight:900}.review-grid footer span{display:block;font-size:10px;font-weight:400;color:#8b8981;margin-top:5px}
      .final-cta{background:var(--gold);color:#171714;text-align:center;padding:clamp(65px,8vw,100px) 20px}.final-cta .eyebrow{justify-content:center;color:#4a3c12}.final-cta h2{font-size:clamp(48px,7vw,78px);line-height:.98;letter-spacing:-3px;margin:20px 0}.final-cta h2 em{color:#fff}.final-cta>p{max-width:570px;margin:0 auto;color:#3c341d;line-height:1.75}.final-cta .hero-actions{justify-content:center}.final-cta small{display:block;margin-top:18px;color:#5b4b1b;font-size:11px}.gcr-footer{background:#11110f;color:#fff;padding:45px clamp(20px,5vw,76px) 28px;display:grid;grid-template-columns:1fr 1.2fr 2fr;gap:25px;align-items:center}.gcr-footer>p{font-size:12px;color:#9d9c95;line-height:1.6;max-width:260px}.gcr-footer>div{display:flex;justify-content:flex-end;gap:20px;flex-wrap:wrap}.gcr-footer>div a{font-size:11px;color:#c5c4bd;text-decoration:none}.gcr-footer>small{grid-column:1/-1;color:#77766d;font-size:10px;border-top:1px solid #30302b;padding-top:18px;margin-top:10px}
      @media(max-width:900px){.gcr-header{height:auto;min-height:75px;flex-wrap:wrap;padding-top:15px;padding-bottom:15px}.gcr-nav{order:3;width:100%;justify-content:center;padding-top:8px;border-top:1px solid #2c2c26}.hero-inner{grid-template-columns:1fr .8fr}.hero-art{height:340px}.goal-grid{grid-template-columns:repeat(2,1fr)}.gcr-footer{grid-template-columns:1fr 1fr}.gcr-footer>div{grid-column:1/-1;justify-content:flex-start}}
      @media(max-width:640px){.gcr-header{gap:12px}.gcr-head-actions{gap:10px}.member-link{display:none}.gcr-nav{justify-content:space-between;gap:8px}.gcr-nav a{font-size:11px}.hero{padding-top:58px}.hero-inner{grid-template-columns:1fr;gap:38px}.hero h1{letter-spacing:-2.5px}.hero-art{height:280px;justify-self:stretch;max-width:none}.hero-bottom{margin-top:35px}.trust-strip{grid-template-columns:1fr;gap:15px}.trust-strip div{grid-template-columns:115px 1fr;align-items:start}.section-heading{display:block}.section-heading>p{margin-top:18px}.goal-grid{grid-template-columns:1fr 1fr;gap:8px}.goal-card{padding:16px;min-height:230px}.goal-card h3{font-size:17px}.goal-card p{font-size:12px}.split-section,.coach-inner{grid-template-columns:1fr}.steps-grid{grid-template-columns:1fr;gap:15px}.steps-grid article{padding:16px 0}.steps-grid h3{margin:12px 0 6px}.review-grid{grid-template-columns:1fr}.coach-monogram{height:190px}.gcr-footer{grid-template-columns:1fr}.gcr-footer>div{gap:15px}.gcr-footer>small{grid-column:1}.button{min-height:50px;padding:0 16px;font-size:12px}}
      @media(prefers-reduced-motion:reduce){.button,.goal-card{transition:none}.button:hover,.goal-card:hover{transform:none}}
    `}</style>
  </>;
}
