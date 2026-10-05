"use client";

import { useSearchParams } from "next/navigation";

const PLAN = {
  "Lose weight / body fat": [
    ["Day 1 · Full Body + Core",["Goblet squat or bodyweight squat · 3 x 10–12","Push-up or machine chest press · 3 x 8–12","One-arm row or cable row · 3 x 10/side","Romanian deadlift · 3 x 10","Dead bug · 3 x 8/side","10-minute brisk walk"]],
    ["Day 2 · Conditioning + Strength",["Reverse lunge · 3 x 8/side","Shoulder press · 3 x 10","Lat pulldown or band pulldown · 3 x 10–12","Glute bridge · 3 x 12–15","Farmer carry · 4 x 30 seconds","10–15 minutes easy/moderate cardio"]],
    ["Day 3 · Full Body + Core",["Step-up · 3 x 8/side","Incline push-up or dumbbell press · 3 x 10","Seated row or dumbbell row · 3 x 10","Hip hinge or kettlebell deadlift · 3 x 10","Plank · 3 x 20–40 seconds","10-minute easy walk"]]
  ],
  "Build muscle": [
    ["Day 1 · Upper Body",["Dumbbell or machine press · 3 x 8–12","Row variation · 3 x 8–12","Shoulder press · 3 x 8–12","Lat pulldown or assisted pull-up · 3 x 8–12","Biceps curl · 2 x 10–15","Triceps pressdown or extension · 2 x 10–15"]],
    ["Day 2 · Lower Body",["Squat or leg press · 3 x 8–12","Romanian deadlift · 3 x 8–12","Reverse lunge · 3 x 8/side","Leg curl or sliding leg curl · 3 x 10–15","Calf raise · 3 x 12–15","Dead bug · 2 x 8/side"]],
    ["Day 3 · Full Body",["Goblet squat · 3 x 10","Dumbbell press · 3 x 10","One-arm row · 3 x 10/side","Hip thrust or glute bridge · 3 x 10–15","Lateral raise · 2 x 12–15","Farmer carry · 3 x 30 seconds"]]
  ],
  "Gain healthy weight & size": [
    ["Day 1 · Full Body Strength",["Squat or leg press · 3 x 8–10","Press variation · 3 x 8–10","Row variation · 3 x 8–10","Romanian deadlift · 3 x 8–10","Curl · 2 x 10–12","Plank · 2 x 30 seconds"]],
    ["Day 2 · Upper Body",["Dumbbell press · 3 x 8–12","Lat pulldown · 3 x 8–12","Shoulder press · 3 x 8–12","Seated row · 3 x 8–12","Lateral raise · 2 x 12–15","Triceps extension · 2 x 10–15"]],
    ["Day 3 · Lower Body",["Squat or leg press · 3 x 8–12","Hip thrust · 3 x 8–12","Reverse lunge · 3 x 8/side","Leg curl · 3 x 10–15","Calf raise · 3 x 12–15","Dead bug · 2 x 8/side"]]
  ],
  "Get stronger": [
    ["Day 1 · Squat + Push",["Squat or leg press · 4 x 5–8","Bench press or push-up · 4 x 5–8","Row variation · 3 x 6–10","Romanian deadlift · 3 x 6–8","Plank · 3 x 30 seconds"]],
    ["Day 2 · Hinge + Pull",["Deadlift or kettlebell deadlift · 4 x 4–6","Overhead press · 4 x 5–8","Lat pulldown or assisted pull-up · 3 x 6–10","Split squat · 3 x 6/side","Farmer carry · 4 x 30 seconds"]],
    ["Day 3 · Full Body",["Goblet/front squat · 3 x 6–8","Incline press · 3 x 6–10","Cable/dumbbell row · 3 x 6–10","Hip thrust · 3 x 8–10","Carry or controlled core work · 3 rounds"]]
  ],
  "Improve endurance / conditioning": [
    ["Day 1 · Full Body Circuit",["Squat · 3 x 10","Push-up · 3 x 8–12","Row · 3 x 10","Reverse lunge · 3 x 8/side","March or step-up · 3 x 60 seconds","Finish with 10 minutes easy cardio"]],
    ["Day 2 · Cardio + Strength",["5-minute easy warm-up","Step-up · 3 x 10/side","Shoulder press · 3 x 10","Hip hinge · 3 x 10","Farmer carry · 4 x 30 seconds","15–20 minutes steady cardio"]],
    ["Day 3 · Full Body Intervals",["Squat · 3 x 10","Incline push-up · 3 x 10","Row · 3 x 10","Glute bridge · 3 x 15","March/step-up · 6 x 45 seconds","5–10-minute easy cooldown"]]
  ],
  "Move better / feel less stiff": [
    ["Day 1 · Strength + Mobility",["5-minute easy walk","Squat to comfortable depth · 3 x 8","Row · 3 x 10","Glute bridge · 3 x 12","Wall slide · 2 x 10","Dead bug · 2 x 8/side"]],
    ["Day 2 · Movement + Core",["5-minute easy walk","Reverse lunge or supported split squat · 3 x 8/side","Press variation · 3 x 10","Hip hinge · 3 x 10","Bird dog · 2 x 8/side","Easy walk · 10 minutes"]],
    ["Day 3 · Full Body Flow",["Sit-to-stand · 3 x 10","Row · 3 x 10","Step-up · 3 x 8/side","Glute bridge · 3 x 12","Controlled plank · 2 x 20–30 seconds","5–10-minute easy walk"]]
  ],
  "Get back into working out": [
    ["Day 1 · Restart",["5-minute easy walk","Sit-to-stand · 2 x 8","Wall or incline push-up · 2 x 8","Band/cable row · 2 x 10","Glute bridge · 2 x 10","Easy walk · 10 minutes"]],
    ["Day 2 · Build the Base",["5-minute easy warm-up","Goblet/bodyweight squat · 2 x 8–10","Dumbbell press or incline push-up · 2 x 8–10","Row · 2 x 10","Step-up · 2 x 6/side","Dead bug · 2 x 6/side"]],
    ["Day 3 · Full Body",["5-minute easy walk","Squat variation · 2 x 10","Press variation · 2 x 10","Row variation · 2 x 10","Hip hinge · 2 x 10","Easy walk · 10 minutes"]]
  ]
};

function adjustPlan(plan, location, experience, length) {
  const homeOnly = location === "Home";
  const short = length === "20–30 minutes";
  return plan.map(([title, exercises]) => [
    title,
    exercises.map((x) => {
      let v = x;
      if (homeOnly) v = v.replaceAll("machine chest press","floor press or push-up").replaceAll("leg press","backpack squat").replaceAll("cable row","band row").replaceAll("lat pulldown","band pulldown").replaceAll("cable/dumbbell row","dumbbell or band row");
      if (experience === "Beginner") v = v.replaceAll("4 x","2 x").replaceAll("3 x","2 x");
      return v;
    }).slice(0, short ? 5 : exercises.length)
  ]);
}

export default function PreviewPage(){
  const params=useSearchParams();
  const goal=params.get("goal") || "Get back into working out";
  const location=params.get("location") || "Home";
  const experience=params.get("experience") || "Beginner";
  const length=params.get("length") || "30–45 minutes";
  const days=params.get("days") || "3 days";
  const plan=adjustPlan(PLAN[goal] || PLAN["Get back into working out"],location,experience,length);

  return <main style={{minHeight:"100vh",background:"#050505",color:"#fff",fontFamily:"Arial,sans-serif",paddingBottom:90}}>
    <nav style={{padding:"16px 20px",borderBottom:"1px solid #222",display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <a href="/" style={{color:"#F4C20D",fontWeight:900,textDecoration:"none"}}>GET CHA RIGHT</a>
      <a href="/contact" style={{color:"#ccc",textDecoration:"none"}}>Talk directly with Que</a>
    </nav>
    <section style={{maxWidth:1000,margin:"0 auto",padding:"55px 20px"}}>
      <div style={{textAlign:"center"}}>
        <p style={{color:"#F4C20D",fontWeight:900,letterSpacing:2,fontSize:12}}>YOUR PERSONALIZED SAMPLE</p>
        <h1 style={{fontSize:"clamp(38px,7vw,68px)",lineHeight:1,margin:"8px 0 18px"}}>YOUR 3-DAY<br/><span style={{color:"#F4C20D"}}>COACHING PREVIEW</span></h1>
        <p style={{color:"#bbb",fontSize:18,lineHeight:1.6,maxWidth:720,margin:"0 auto"}}>This sample was built around <strong style={{color:"#fff"}}>{goal.toLowerCase()}</strong>, {location.toLowerCase()} training, {experience.toLowerCase()} experience, {length.toLowerCase()} sessions, and about {days.toLowerCase()}.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginTop:38}}>
        {plan.map(([title,items])=><article key={title} style={{background:"#111",border:"1px solid #2d2d2d",borderRadius:18,padding:24}}>
          <h2 style={{margin:"0 0 18px",fontSize:22}}>{title}</h2>
          <div style={{display:"grid",gap:10}}>{items.map((x,i)=><div key={i} style={{background:"#080808",border:"1px solid #242424",borderRadius:10,padding:12,color:"#ddd",lineHeight:1.45}}>{x}</div>)}</div>
        </article>)}
      </div>
      <section style={{background:"#F4C20D",color:"#050505",borderRadius:18,padding:"30px 24px",marginTop:28,textAlign:"center"}}>
        <h2 style={{margin:"0 0 10px"}}>Like the structure?</h2>
        <p style={{maxWidth:650,margin:"0 auto 20px",lineHeight:1.6}}>Full coaching goes beyond a sample. I build your plan around your goals, equipment, schedule, progress, and coaching needs.</p>
        <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
          <a href="https://calendly.com/getcharighttransformations22/free-15-minute-assessment" target="_blank" rel="noopener noreferrer" style={{background:"#050505",color:"#fff",padding:"14px 20px",borderRadius:10,textDecoration:"none",fontWeight:900}}>BOOK FREE ASSESSMENT</a>
          <a href="/#pricing" style={{background:"#fff",color:"#050505",padding:"14px 20px",borderRadius:10,textDecoration:"none",fontWeight:900}}>SEE COACHING PLANS</a>
        </div>
      </section>
      <p style={{color:"#666",fontSize:12,lineHeight:1.5,textAlign:"center",marginTop:25}}>This is a general coaching sample, not a medical or individualized exercise assessment. Use appropriate form, choose manageable resistance, and stop if an exercise causes pain.</p>
    </section>
  </main>;
}
