import {stripe,admin,requireUser,json} from '../_shared/billing.ts';
Deno.serve(async req=>{try{
 const {user}=await requireUser(req); const {plan_id}=await req.json();
 const {data:profile}=await admin.from('profiles').select('role,email,display_name').eq('id',user.id).single();
 if(profile?.role!=='client')return json({error:'client_required'},403);
 const {data:plan}=await admin.from('billing_plans').select('*').eq('id',plan_id).eq('active',true).single();
 if(!plan?.stripe_price_id)return json({error:'plan_not_ready'},400);
 let {data:customer}=await admin.from('billing_customers').select('*').eq('profile_id',user.id).maybeSingle();
 if(!customer){const c=await stripe.customers.create({email:profile.email||user.email||undefined,name:profile.display_name||undefined,metadata:{hmo_profile_id:user.id}});const {data}=await admin.from('billing_customers').insert({profile_id:user.id,stripe_customer_id:c.id}).select().single();customer=data;}
 const base=Deno.env.get('APP_URL'); if(!base)throw new Error('APP_URL_not_configured');
 const session=await stripe.checkout.sessions.create({mode:'subscription',customer:customer.stripe_customer_id,line_items:[{price:plan.stripe_price_id,quantity:1}],success_url:`${base}/billing.html?result=success&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${base}/billing.html?result=cancelled`,client_reference_id:user.id,subscription_data:{metadata:{hmo_client_id:user.id,hmo_plan_id:plan.id}},...(plan.trial_days>0?{subscription_data:{metadata:{hmo_client_id:user.id,hmo_plan_id:plan.id},trial_period_days:plan.trial_days}}:{})});
 return json({url:session.url});
}catch(e){return json({error:String(e?.message||e)},400)}});
