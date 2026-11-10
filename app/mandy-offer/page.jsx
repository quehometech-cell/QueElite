"use client";

import { useState } from "react";

const plans = [
  { key: "foundation", name: "Foundation Training", regular: 99, discounted: "89.10", description: "A consistent home or gym training routine with progress tracking." },
  { key: "personalized", name: "Personalized Coaching", regular: 249, discounted: "224.10", description: "Customized training, nutrition guidance, weekly check-ins, and coach messaging." },
  { key: "hybrid", name: "Premium Hybrid Coaching", regular: 499, discounted: "449.10", description: "Online coaching plus scheduled in-person training and technique support." },
];

export default function MandyOfferPage() {
  const [loading, setLoading] = useState("");
  return (
    <main style={{minHeight:"100vh",background:"#f5f7fa",color:"#17212f",fontFamily:"Arial, sans-serif",padding:"32px 18px 60px"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <a href="/" style={{color:"#17212f",fontWeight:900,letterSpacing:1.2,textDecoration:"none"}}>GET CHA RIGHT FITNESS</a>
        <section style={{textAlign:"center",padding:"54px 10px 36px"}}>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:2,color:"#9a7418"}}>A SPECIAL INTRODUCTORY OFFER</div>
          <h1 style={{fontSize:"clamp(36px,7vw,62px)",lineHeight:1.04,letterSpacing:-2,margin:"16px 0"}}>Start strong.<br/><span style={{color:"#9a7418"}}>Save 10% today.</span></h1>
          <p style={{maxWidth:620,margin:"0 auto",fontSize:16,lineHeight:1.7,color:"#596579"}}>Choose the coaching plan that fits your goals. Your 10% discount is automatically applied to your first payment at checkout.</p>
          <div style={{display:"inline-block",marginTop:20,padding:"9px 15px",borderRadius:30,background:"#fff6df",border:"1px solid #e8d49d",fontWeight:900,fontSize:12,color:"#684b0b"}}>PROMO CODE MANDY10 · FIRST PAYMENT ONLY</div>
        </section>
        <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
          {plans.map(plan=><article key={plan.key} style={{background:"#fff",border:"1px solid #e4e7ec",borderRadius:18,padding:24,boxShadow:"0 8px 24px rgba(16,24,40,.05)",display:"flex",flexDirection:"column"}}>
            <h2 style={{fontSize:19,margin:"0 0 12px"}}>{plan.name}</h2>
            <div style={{display:"flex",alignItems:"baseline",gap:9,flexWrap:"wrap"}}>
              <strong style={{fontSize:36,color:"#17212f"}}>${plan.discounted}</strong>
              <span style={{fontSize:14,color:"#98a2b3",textDecoration:"line-through"}}>${plan.regular}.00</span>
              <span style={{fontSize:12,color:"#667085"}}>/ month</span>
            </div>
            <p style={{fontSize:13,lineHeight:1.7,color:"#667085",minHeight:66}}>{plan.description}</p>
            <p style={{fontSize:12,color:"#684b0b",fontWeight:800}}>10% off first payment. Regular monthly price applies afterward.</p>
            <button disabled={!!loading} onClick={()=>{setLoading(plan.key);window.location.href=`/api/mandy-offer-checkout?plan=${plan.key}`;}} style={{marginTop:"auto",minHeight:48,border:0,borderRadius:9,background:"#e6b91e",color:"#17212f",fontWeight:900,cursor:"pointer",opacity:loading?0.65:1}}>{loading===plan.key?"Opening secure checkout…":"Choose this plan →"}</button>
          </article>)}
        </section>
        <p style={{textAlign:"center",fontSize:12,color:"#667085",lineHeight:1.7,marginTop:28}}>Secure checkout powered by Stripe. Discount applies to the first subscription payment only. Your selected plan renews at its regular monthly rate unless canceled under the subscription terms.</p>
        <footer style={{textAlign:"center",marginTop:45,fontSize:11,color:"#98a2b3"}}>© {new Date().getFullYear()} Get Cha Right Fitness · Villa Rica, Georgia</footer>
      </div>
    </main>
  );
}
