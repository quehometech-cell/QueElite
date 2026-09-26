"use client";

import { useEffect, useState } from "react";

export default function InstallApp() {
  const [prompt, setPrompt] = useState(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const beforeInstall = (event) => {
      event.preventDefault();
      setPrompt(event);
    };
    const appInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", appInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", appInstalled);
    };
  }, []);

  async function install() {
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
      return;
    }
    if (ios) setShowIosHelp(true);
  }

  if (installed) return null;

  return (
    <div style={styles.wrap}>
      <div>
        <strong style={styles.title}>Use Get Cha Right like an app</strong>
        <div style={styles.copy}>Add your coaching portal to your phone for faster access to workouts, check-ins, nutrition, and progress.</div>
      </div>
      <button type="button" onClick={install} style={styles.button}>
        {ios ? "ADD TO IPHONE" : "INSTALL APP"}
      </button>
      {showIosHelp ? (
        <div style={styles.help}>
          On iPhone: tap the <strong>Share</strong> button in Safari, then choose <strong>Add to Home Screen</strong> and tap <strong>Add</strong>.
          <button type="button" onClick={() => setShowIosHelp(false)} style={styles.close}>GOT IT</button>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  wrap: {display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:14,alignItems:"center",background:"#111111",border:"1px solid #2A2A2A",borderRadius:16,padding:"16px 18px",marginBottom:18},
  title: {display:"block",color:"#FFFFFF",fontSize:15,marginBottom:5},
  copy: {color:"#999999",fontSize:13,lineHeight:1.5},
  button: {minHeight:44,border:0,borderRadius:9,padding:"0 16px",background:"#F4C20D",color:"#050505",fontWeight:900,cursor:"pointer"},
  help: {gridColumn:"1 / -1",background:"#080808",border:"1px solid #333333",borderRadius:10,padding:14,color:"#D8D8D8",fontSize:13,lineHeight:1.6},
  close: {marginLeft:12,minHeight:36,border:"1px solid #F4C20D",borderRadius:8,background:"transparent",color:"#F4C20D",fontWeight:900,padding:"0 12px",cursor:"pointer"}
};