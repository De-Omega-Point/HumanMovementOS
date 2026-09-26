import Stripe from 'npm:stripe@22';
import { createClient } from 'npm:@supabase/supabase-js@2';
export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
export const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
export function userClient(req:Request){return createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:req.headers.get('Authorization')||''}}});}
export async function requireUser(req:Request){const sb=userClient(req);const {data:{user},error}=await sb.auth.getUser();if(error||!user)throw new Error('authentication_required');return {user,sb};}
export function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}})}
