export default function Services() {
 const cards=[
 ["How long are workouts?","Most workouts are about 30–60 minutes. Your exact session length depends on your goal, experience and schedule."],
 ["How many days a week?","Most clients train 3–6 days per week. We build the schedule around the days you can realistically commit to."],
 ["What days do I train?","There is no required Monday–Friday schedule. Your training days are selected around your availability and recovery."],
 ["Online Coaching","Train from home or a gym using your private member portal. Your workouts, progress tracking and coaching stay in one place."],
 ["Hybrid Coaching","Combine your online program with scheduled in-person sessions with Que. Local in-person availability is confirmed during consultation."],
 ["Do I need a gym?","No. Your program can be built for home, gym, or a combination of both based on the equipment you have."]
 ];
 return <section style={{padding:"80px 20px",background:"#050505",color:"#fff"}}><div style={{maxWidth:1150,margin:"0 auto"}}>
  <p style={{color:"#F4C20D",fontWeight:900,letterSpacing:2,fontSize:12,marginBottom:8}}>KNOW WHAT YOU'RE SIGNING UP FOR</p>
  <h2 style={{fontSize:"clamp(34px, 5vw, 52px)",margin:"0 0 14px"}}>What Coaching Actually Looks Like</h2>
  <p style={{color:"#9A9A9A",lineHeight:1.6,maxWidth:760,margin:"0 0 34px"}}>Your plan is not one-size-fits-all. We use your goal, experience, schedule, equipment and preferred training location to decide how your coaching should look.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",gap:14}}>{cards.map(([t,d],i)=><div key={t} style={{background:"#111",padding:26,border:"1px solid #2A2A2A",borderRadius:14}}><div style={{color:"#F4C20D",fontSize:12,fontWeight:900,marginBottom:16}}>0{i+1}</div><h3 style={{margin:"0 0 10px",fontSize:19}}>{t}</h3><p style={{margin:0,color:"#aaa",lineHeight:1.6,fontSize:14}}>{d}</p></div>)}</div>
  <div style={{marginTop:30,padding:22,border:"1px solid #F4C20D",borderRadius:14,background:"#0d0d0d"}}><strong style={{color:"#F4C20D"}}>Not sedentary? You're still in the right place.</strong><p style={{color:"#ccc",lineHeight:1.6,marginBottom:0}}>We coach people who want to lose fat or weight, build muscle, gain healthy weight and size, get stronger, improve conditioning, improve mobility, or simply get back into a consistent routine.</p></div>
 </div></section>;
}