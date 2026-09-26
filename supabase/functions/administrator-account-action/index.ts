import {admin,requireUser,json} from '../_shared/billing.ts';
Deno.serve(async req=>{try{
 const {user}=await requireUser(req);
 const {data:me}=await admin.from('profiles').select('role').eq('id',user.id).single();
 if(me?.role!=='administrator')return json({error:'administrator_required'},403);
 const {profile_id,action,confirm}=await req.json();
 if(!profile_id||!['delete'].includes(action))return json({error:'invalid_action'},400);
 if(profile_id===user.id)return json({error:'cannot_delete_self'},400);
 const {data:target}=await admin.from('profiles').select('id,role,email,display_name').eq('id',profile_id).single();
 if(!target)return json({error:'profile_not_found'},404);
 if(target.role!=='client')return json({error:'delete_clients_only'},400);
 const {data:subs}=await admin.from('billing_subscriptions').select('status').eq('client_id',profile_id).in('status',['active','trialing','past_due']);
 if((subs||[]).length)return json({error:'active_subscription_must_be_resolved_first'},409);
 if(confirm!=='DELETE')return json({error:'explicit_confirmation_required'},400);
 await admin.from('admin_audit_log').insert({actor_id:user.id,action:'client_delete_requested',target_profile_id:profile_id,metadata:{email:target.email,display_name:target.display_name}});
 const {error}=await admin.auth.admin.deleteUser(profile_id);
 if(error)throw error;
 return json({ok:true});
}catch(e){return json({error:String(e?.message||e)},400)}});