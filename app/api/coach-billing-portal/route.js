import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(request){
 try{
  const token=(request.headers.get("authorization")||"").replace(/^Bearer\s+/,"");
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const {data:{user}}=await supabase.auth.getUser(token);
  if(!user)return Response.json({error:"Unauthorized"},{status:401});
  const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
  const {data:w}=await admin.from("coach_workspaces").select("stripe_customer_id").eq("owner_id",user.id).single();
  if(!w?.stripe_customer_id)return Response.json({error:"No billing account found."},{status:404});
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
  const session=await stripe.billingPortal.sessions.create({customer:w.stripe_customer_id,return_url:"https://www.getcharightfitness.com/coach"});
  return Response.json({url:session.url});
 }catch(error){console.error("Coach billing portal error:",error);return Response.json({error:"Unable to open billing."},{status:500});}
}