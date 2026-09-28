import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";
const PLANS = new Set(["starter","coach","pro","studio"]);
function client(token){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}})}
export async function POST(req){
 try{
  const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/,"");
  if(!token)return Response.json({error:"Unauthorized"},{status:401});
  const a=client(token); const {data:{user},error:uerr}=await a.auth.getUser(token);
  if(uerr||!user)return Response.json({error:"Unauthorized"},{status:401});
  const {fullName,businessName,plan}=await req.json();
  if(!fullName?.trim()||!businessName?.trim()||!PLANS.has(plan))return Response.json({error:"Invalid coach setup."},{status:400});
  const {data:workspaceId,error}=await a.rpc("initialize_coach_workspace",{p_full_name:fullName.trim(),p_business_name:businessName.trim(),p_plan:plan});
  if(error)throw error;
  return Response.json({ok:true,workspaceId});
 }catch(e){console.error("Coach setup:",e);return Response.json({error:e?.message||"Unable to set up coach workspace."},{status:500})}
}