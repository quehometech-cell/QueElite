import { createClient } from "@supabase/supabase-js";
export const runtime="nodejs";
function admin(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}})}
async function userFrom(req){const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/,"");const a=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);const {data:{user}}=await a.auth.getUser(token);return user}
export async function POST(req){
 try{
  const user=await userFrom(req); if(!user)return Response.json({error:"Unauthorized"},{status:401});
  const {email}=await req.json(); const clean=String(email||"").trim().toLowerCase(); if(!clean||!clean.includes("@"))return Response.json({error:"Enter a valid email."},{status:400});
  const db=admin(); const {data:w}=await db.from("coach_workspaces").select("id,subscription_status,client_limit").eq("owner_id",user.id).single();
  if(!w||!["active","trialing"].includes(w.subscription_status))return Response.json({error:"Active coach subscription required."},{status:403});
  const {count}=await db.from("workspace_members").select("id",{count:"exact",head:true}).eq("workspace_id",w.id).eq("workspace_role","client").eq("status","active");
  const {count:pending}=await db.from("workspace_invites").select("id",{count:"exact",head:true}).eq("workspace_id",w.id).eq("invite_role","client").eq("status","pending");
  if((count||0)+(pending||0)>=Number(w.client_limit||0))return Response.json({error:`Your plan allows ${w.client_limit} clients. Upgrade before inviting another client.`},{status:403});
  const {data:existing}=await db.from("workspace_invites").select("id").eq("workspace_id",w.id).eq("email",clean).eq("status","pending").maybeSingle();
  let invite=existing;
  if(!invite){const x=await db.from("workspace_invites").insert({workspace_id:w.id,email:clean,invite_role:"client",status:"pending",invited_by:user.id}).select("id").single();if(x.error)throw x.error;invite=x.data}
  return Response.json({inviteUrl:`https://www.getcharightfitness.com/client-join?invite=${invite.id}`});
 }catch(e){console.error(e);return Response.json({error:"Unable to create invite."},{status:500})}
}