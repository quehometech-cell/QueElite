import PWARegister from "../components/PWARegister";
import LeadAssistant from "../components/LeadAssistant";

export const metadata = {
  metadataBase: new URL("https://www.getcharightfitness.com"),
  title: { default: "Get Cha Right Fitness | Personalized Fitness Coaching", template: "%s | Get Cha Right Fitness" },
  description: "Personalized online and hybrid fitness coaching for adults who want to lose body fat, build muscle, get stronger, move better, and stay consistent.",
  authors: [{ name: "Que Kirby" }],
  creator: "Get Cha Right Fitness",
  publisher: "Get Cha Right Fitness",
  openGraph: { title: "Get Cha Right Fitness | Personalized Fitness Coaching", description: "Personalized fitness coaching built around your goal, schedule, experience, and training setup. Online and hybrid options available.", url: "https://www.getcharightfitness.com", siteName: "Get Cha Right Fitness", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Get Cha Right Fitness | Personalized Fitness Coaching", description: "Personalized online and hybrid fitness coaching for adults who want to build strength, lose body fat, improve conditioning, and move better." },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "Get Cha Right", statusBarStyle: "black-translucent" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#050505", color: "#FFFFFF", fontFamily: "Arial, sans-serif" }}>
        <PWARegister />
        {children}
        <LeadAssistant />
        <div className="site-action-bar" style={{ position:"fixed", left:0, right:0, bottom:"env(safe-area-inset-bottom)", zIndex:9998, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", padding:"8px 12px", boxSizing:"border-box", background:"rgba(5,5,5,.97)", borderTop:"1px solid #292929", backdropFilter:"blur(10px)", paddingBottom:"calc(8px + env(safe-area-inset-bottom))" }}>
          <details style={{ position:"relative", minWidth:0 }}>
            <summary style={{ listStyle:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", minHeight:"48px", boxSizing:"border-box", background:"#F4C20D", color:"#050505", borderRadius:"999px", padding:"0 12px", fontWeight:900, boxShadow:"0 6px 20px rgba(0,0,0,.28)", fontSize:"13px", whiteSpace:"nowrap" }}>💬 MESSAGE QUE</summary>
            <div style={{ position:"absolute", left:0, bottom:"58px", width:"min(320px, calc(100vw - 24px))", boxSizing:"border-box", background:"#111111", color:"#FFFFFF", border:"1px solid #333333", borderRadius:"16px", padding:"18px", boxShadow:"0 12px 30px rgba(0,0,0,.45)" }}>
              <div style={{ fontWeight:900, fontSize:"17px", marginBottom:"6px" }}>Talk directly with Que</div>
              <p style={{ color:"#B8B8B8", lineHeight:1.5, margin:"0 0 14px", fontSize:"13px" }}>Human support. You are contacting Que directly, not an AI bot.</p>
              <div style={{ display:"grid", gap:"8px" }}>
                <a href="sms:+14704854575" style={{ display:"block", textAlign:"center", background:"#F4C20D", color:"#050505", padding:"11px", borderRadius:"10px", textDecoration:"none", fontWeight:900 }}>TEXT QUE</a>
                <a href="mailto:que@getcharightfitness.com" style={{ display:"block", textAlign:"center", background:"#1B1B1B", color:"#FFFFFF", border:"1px solid #333333", padding:"11px", borderRadius:"10px", textDecoration:"none", fontWeight:900 }}>EMAIL QUE</a>
              </div>
            </div>
          </details>
          <a href="https://calendly.com/quehometech/30min" target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"48px", boxSizing:"border-box", background:"#F4C20D", color:"#050505", borderRadius:"999px", padding:"0 12px", fontWeight:900, boxShadow:"0 6px 20px rgba(0,0,0,.28)", fontSize:"13px", textDecoration:"none", whiteSpace:"nowrap" }}>BOOK ASSESSMENT</a>
        </div>
        <style>{`
          body { padding-bottom: 78px; }
          @media (min-width: 768px) { .site-action-bar { display:none !important; } body { padding-bottom:0; } }
        `}</style>
      </body>
    </html>
  );
}