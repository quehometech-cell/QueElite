export default function CoachPlatform() {
  const plans = [
    ["Starter", "$19", "Up to 5 clients"],
    ["Coach", "$39", "Up to 20 clients"],
    ["Pro", "$69", "Up to 50 clients"],
    ["Studio", "$119", "Up to 100 clients"],
  ];
  const features = [
    ["Client Management", "Keep each client organized inside your own private coaching workspace."],
    ["Workout Programming", "Assign training programs and manage client workouts from one dashboard."],
    ["Progress Tracking", "Track workouts, measurements, check-ins, and private progress photos."],
    ["Habit Coaching", "Give clients simple daily habits and monitor consistency."],
    ["Nutrition & Mobility", "Support nutrition targets, meal plans, corrective work, and mobility when included in your service."],
    ["Branded Client Experience", "Your clients use the same polished Get Cha Right platform while staying assigned to your coaching business."],
  ];
  return <main style={s.page}>
    <section style={s.hero}>
      <a href="/" style={s.brand}>GET CHA RIGHT</a>
      <p style={s.eye}>FOR COACHES & PERSONAL TRAINERS</p>
      <h1 style={s.h1}>COACH YOUR CLIENTS.<br/><span style={s.gold}>RUN IT ALL IN ONE PLACE.</span></h1>
      <p style={s.lead}>Get Cha Right gives independent coaches a dedicated workspace to manage their own clients, programs, progress, habits, check-ins, and more.</p>
      <div style={s.actions}><a href="/coach-join" style={s.primary}>START COACH ACCOUNT →</a><a href="/login" style={s.secondary}>COACH LOGIN</a></div>
      <p style={s.note}>Coach accounts are separate from personal coaching with Que. Platform subscription plans are being finalized.</p>
    </section>
    <section style={s.section}><p style={s.eye}>COACH PLATFORM</p><h2 style={s.h2}>Built for your coaching business.</h2>
      <div style={s.grid}>{features.map(([a,b])=><article key={a} style={s.card}><div style={s.icon}>✓</div><h3 style={s.h3}>{a}</h3><p style={s.copy}>{b}</p></article>)}</div>
    </section>
    <section style={s.section}><p style={s.eye}>SIMPLE MONTHLY PRICING</p><h2 style={s.h2}>Grow your plan as your roster grows.</h2><p style={s.copy}>Every plan starts with a 14-day free trial. Your plan is based primarily on the number of active clients you manage.</p><div style={s.grid}>{plans.map(([name,price,limit])=><article key={name} style={s.card}><p style={s.eye}>{name.toUpperCase()}</p><div style={{fontSize:"42px",fontWeight:900}}>{price}<span style={{fontSize:"14px",color:"#888"}}>/mo</span></div><p style={s.copy}>{limit}</p><a href={"/coach-join?plan="+name.toLowerCase()} style={s.primary}>START 14-DAY TRIAL →</a></article>)}</div></section>
    <section style={s.cta}><h2 style={s.h2}>Ready to build your coach workspace?</h2><p style={s.copy}>Create a coach account. Your clients stay separate from Get Cha Right Fitness coaching clients.</p><a href="/coach-join" style={s.primary}>SIGN UP AS A COACH →</a></section>
  </main>;
}
const s={page:{minHeight:"100vh",background:"#050505",color:"#fff",fontFamily:"Arial,Helvetica,sans-serif"},hero:{maxWidth:"1100px",margin:"0 auto",padding:"54px 22px 72px"},brand:{color:"#f4c20d",fontWeight:900,letterSpacing:"2px",textDecoration:"none",fontSize:"14px"},eye:{color:"#f4c20d",fontWeight:900,letterSpacing:"2px",fontSize:"12px",marginTop:"54px"},h1:{fontSize:"clamp(42px,8vw,82px)",lineHeight:.94,letterSpacing:"-3px",margin:"14px 0 22px"},gold:{color:"#f4c20d"},lead:{maxWidth:"760px",color:"#bdbdbd",fontSize:"clamp(17px,2vw,21px)",lineHeight:1.65},actions:{display:"flex",gap:"12px",flexWrap:"wrap",marginTop:"30px"},primary:{display:"inline-block",background:"#f4c20d",color:"#050505",padding:"16px 20px",borderRadius:"9px",fontWeight:900,textDecoration:"none"},secondary:{display:"inline-block",border:"1px solid #444",color:"#fff",padding:"16px 20px",borderRadius:"9px",fontWeight:900,textDecoration:"none"},note:{color:"#777",fontSize:"13px",marginTop:"18px"},section:{maxWidth:"1100px",margin:"0 auto",padding:"20px 22px 80px"},h2:{fontSize:"clamp(32px,5vw,50px)",margin:"10px 0 28px"},grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"14px"},card:{background:"#101010",border:"1px solid #292929",borderRadius:"14px",padding:"24px"},icon:{color:"#f4c20d",fontWeight:900,fontSize:"20px"},h3:{fontSize:"20px",margin:"14px 0 8px"},copy:{color:"#aaa",lineHeight:1.6},cta:{maxWidth:"1056px",margin:"0 auto 70px",padding:"36px 22px",border:"1px solid rgba(244,194,13,.35)",borderRadius:"18px",background:"#0c0c0c"}};
