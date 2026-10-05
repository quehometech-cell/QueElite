export default function Hero() {
  const buttonBase={display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:"54px",padding:"0 24px",borderRadius:"10px",fontWeight:"900",fontSize:"15px",textDecoration:"none",textAlign:"center"};
  return <section style={{padding:"clamp(70px, 10vw, 120px) clamp(20px, 6vw, 70px)",background:"radial-gradient(circle at 75% 20%, rgba(244,194,13,.10), transparent 28rem), #0A0A0A",minHeight:"78vh",display:"flex",alignItems:"center",color:"#fff"}}>
    <div style={{width:"100%",maxWidth:1050,margin:"0 auto"}}>
      <p style={{color:"#F4C20D",fontWeight:900,letterSpacing:2,fontSize:13,margin:0}}>PERSONALIZED ONLINE + HYBRID FITNESS COACHING</p>
      <h1 style={{fontSize:"clamp(46px, 8vw, 82px)",lineHeight:.95,letterSpacing:-2,margin:"22px 0",maxWidth:900}}>COACHING BUILT<br/>AROUND YOUR GOAL.</h1>
      <p style={{maxWidth:760,color:"#BDBDBD",fontSize:"clamp(17px, 2vw, 20px)",lineHeight:1.65,margin:0}}>Lose weight or body fat, build muscle, gain healthy weight and size, get stronger, improve conditioning, move better, or get back into working out. You do not have to be sedentary to train with Get Cha Right Fitness.</p>
      <p style={{color:"#fff",fontSize:16,fontWeight:800,marginTop:18}}>Beginner to experienced. Home or gym. Most workouts 30–60 minutes. Your training days are built around your schedule.</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:30}}>
        <a href="/join" style={{...buttonBase,background:"#F4C20D",color:"#050505",border:"1px solid #F4C20D"}}>START COACHING →</a>
        <a href="/starter-kit" style={{...buttonBase,background:"transparent",color:"#fff",border:"1px solid #3A3A3A"}}>TRY MY COACHING FREE FOR 3 DAYS</a>
      </div>
      <p style={{color:"#777",marginTop:18,fontSize:13}}>Want to talk first? <a href="https://calendly.com/quehometech/30min" target="_blank" rel="noopener noreferrer" style={{color:"#fff",fontWeight:800}}>Book a free 15-minute assessment.</a></p>
    </div>
  </section>;
}