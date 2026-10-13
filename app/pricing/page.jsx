export const metadata = {
 title: "Personal Training Packages",
 description: "Explore Get Cha Right Fitness monthly coaching packages: Foundation, Personalized Online, and Premium Hybrid training.",
 alternates: { canonical: "/pricing" }
};
const plans=[
 {name:"Foundation Training",price:"$99",detail:"per month",text:"Structured training for a strong starting point.",features:["Home or gym program","Progress tracking","Monthly program review"],featured:false},
 {name:"Personalized Coaching",price:"$249",detail:"per month",text:"Individual coaching for strength, fat loss, conditioning, or better movement.",features:["Customized training program","Nutrition guidance","Weekly check-ins and adjustments","Private coach messaging"],featured:true},
 {name:"Premium Hybrid Coaching",price:"$499",detail:"per month",text:"Online support plus scheduled in-person coaching in the west Atlanta area, subject to availability.",features:["Everything in Personalized Coaching","Four in-person sessions each month","Form and technique coaching","Priority scheduling"],featured:false}
];
export default function Pricing() {
 return <main style={{background:"#050505",minHeight:"100vh",color:"#fff"}}>
 <nav style={{padding:"18px 20px",borderBottom:"1px solid #222",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}><a href="/" style={{color:"#F4C20D",fontWeight:900,textDecoration:"none"}}>GET CHA RIGHT</a><div style={{display:"flex",gap:16,flexWrap:"wrap"}}><a href="/services" style={{color:"#bbb"}}>Services</a><a href="/about" style={{color:"#bbb"}}>About</a><a href="/contact" style={{color:"#bbb"}}>Contact</a></div></nav>
 <section style={{maxWidth:1100,margin:"0 auto",padding:"64px 20px 120px"}}>
 <p style={{color:"#F4C20D",fontWeight:900,letterSpacing:2}}>ONLINE & HYBRID COACHING</p>
 <h1 style={{fontSize:"clamp(38px,6vw,64px)",margin:"12px 0"}}>PERSONAL TRAINING THAT FITS YOUR GOALS.</h1>
 <p style={{color:"#bbb",lineHeight:1.7,maxWidth:760,fontSize:18}}>All coaching levels can support strength training, fat loss, mobility, conditioning, and corrective exercise. Choose how much personal support you need. Plans renew monthly until canceled under your agreement.</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18,marginTop:38}}>
 {plans.map(p=><article key={p.name} style={{border:p.featured?"2px solid #F4C20D":"1px solid #333",background:"#111",borderRadius:18,padding:26,display:"flex",flexDirection:"column"}}>
 {p.featured&&<div style={{fontWeight:900,color:"#F4C20D",fontSize:13}}>MOST PERSONALIZED ONLINE OPTION</div>}
 <h2 style={{fontSize:25}}>{p.name}</h2><div><strong style={{fontSize:42,color:"#F4C20D"}}>{p.price}</strong><span style={{color:"#bbb"}}> / month</span></div>
 <p style={{color:"#bbb",lineHeight:1.6}}>{p.text}</p><ul style={{paddingLeft:20,lineHeight:2,color:"#ddd",flex:1}}>{p.features.map(x=><li key={x}>{x}</li>)}</ul>
 <a href="/contact" style={{display:"block",textAlign:"center",background:"#F4C20D",color:"#050505",padding:15,borderRadius:10,fontWeight:900,textDecoration:"none"}}>ASK ABOUT THIS PLAN</a>
 </article>)}
 </div><p style={{color:"#999",marginTop:30}}>To avoid billing errors while the new checkout integration is verified, enrollments begin with a consultation. Existing agreements remain unchanged.</p>
 </section></main>;
}
