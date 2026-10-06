"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import WorkoutBuilder from "../../../components/coach/WorkoutBuilder";

export default function WorkoutBuilderPage() {
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    async function checkAccess() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { if (active) setStatus("login"); return; }
        const { data, error: workspaceError } = await supabase.from("coach_workspaces")
          .select("id").eq("owner_id", user.id).eq("subscription_tier", "owner")
          .eq("subscription_status", "active").limit(1).maybeSingle();
        if (workspaceError) throw workspaceError;
        if (active) setStatus(data ? "ready" : "denied");
      } catch { if (active) setStatus("error"); }
    }
    checkAccess();
    return () => { active = false; };
  }, []);
  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>
    <a href="/coach" style={{ color: "#F4C20D" }}>← Coach portal</a>
    <h1>Workout Builder</h1>
    {status === "ready" ? <WorkoutBuilder /> : status === "loading" ? <p>Loading workout builder…</p> :
      status === "login" ? <p><a href="/login" style={{ color: "#F4C20D" }}>Sign in with your owner account</a> to add and edit workouts.</p> :
      <p role="alert">{status === "denied" ? "Only the platform owner can edit shared program templates." : "Unable to check access. Please refresh and try again."}</p>}
  </main>;
}
