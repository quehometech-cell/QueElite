import { createClient } from "@supabase/supabase-js";
export const runtime="nodejs";

function clean(v,n=500){return typeof v==="string"?v.trim().slice(0,n):null}
export async function POST(req){
  try{
    const body=await req.json();
    const first_name=clean(body.first_name,100);
    const email=clean(body.email,320)?.toLowerCase();
    if(!first_name) return Response.json({error:"Enter your first name."},{status:400});
    if(!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return Response.json({error:"Enter a valid email."},{status:400});
    const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
    const payload={first_name,email,phone:clean(body.phone,40),primary_goal:clean(body.primary_goal,100),training_location:clean(body.training_location,100),daily_sitting_hours:clean(body.daily_sitting_hours,100),biggest_obstacle:clean(body.biggest_obstacle,200),source:clean(body.source,100)||"website_assistant",utm_source:clean(body.utm_source,200),utm_medium:clean(body.utm_medium,200),utm_campaign:clean(body.utm_campaign,200),sms_consent:body.sms_consent===true,email_consent:body.email_consent===true,updated_at:new Date().toISOString()};
    const {data,error}=await admin.from("leads").upsert(payload,{onConflict:"email",ignoreDuplicates:false}).select("id").single();
    if(error) throw error;
    return Response.json({ok:true,id:data.id});
  }catch(e){console.error("lead capture",e);return Response.json({error:"We couldn't save that right now. Please try again."},{status:500})}
}
