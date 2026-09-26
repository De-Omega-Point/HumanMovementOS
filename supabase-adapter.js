/* Human Movement OS v0.7 · production data adapter. Never place a service-role key here. */
window.HMOBackend = (() => {
  const cfg=window.HMO_CONFIG||{mode:'demo'};
  const demo=cfg.mode!=='supabase'||!cfg.supabaseUrl||!cfg.supabaseAnonKey||!window.supabase;
  const db=demo?null:window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  async function one(q){const {data,error}=await q;if(error)throw error;return data;}
  return {
    mode:demo?'demo':'supabase',client:db,
    async session(){if(demo)return null;return (await one(db.auth.getSession())).session;},
    async me(){if(demo)return null;const s=await this.session();if(!s)return null;return await one(db.from('profiles').select('id,role,email,display_name,account_status').eq('id',s.user.id).single());},
    async signIn(email,redirectTo){if(demo)return {demo:true};return await one(db.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo||location.href}}));},
    async signOut(){if(demo)return;return await one(db.auth.signOut());},
    onAuthChange(cb){if(demo)return()=>{};const {data}=db.auth.onAuthStateChange((event,session)=>cb(event,session));return()=>data.subscription.unsubscribe();},
    async ensureDefaultTemplate(){if(demo)return null;return await one(db.rpc('ensure_default_hmo_template'));},
    async programs(){if(demo)return null;return await one(db.from('program_templates').select('*').order('created_at',{ascending:false}));},
    async clients(){if(demo)return null;return await one(db.from('trainer_clients').select('id,status,goal,start_date,client:profiles!trainer_clients_client_id_fkey(id,display_name,email),program:client_programs(id,current_week,is_active,start_date,template:program_templates(id,name,duration_weeks,source_key))').order('created_at',{ascending:false}));},
    async workouts(clientId){if(demo)return null;return await one(db.from('workout_summaries').select('*').eq('client_id',clientId).order('completed_at',{ascending:false}).limit(20));},
    async notes(trainerClientId){if(demo)return null;return await one(db.from('trainer_notes').select('*').eq('trainer_client_id',trainerClientId).order('created_at',{ascending:false}).limit(20));},
    async saveNote(trainerClientId,note){if(demo)return null;const s=await this.session();return await one(db.from('trainer_notes').insert({trainer_client_id:trainerClientId,trainer_id:s.user.id,note}).select().single());},
    async createInvite(x){if(demo)return null;return await one(db.rpc('create_client_invite',{p_email:x.email,p_display_name:x.name,p_goal:x.goal||null,p_template_id:x.templateId||null,p_start_date:x.startDate||new Date().toISOString().slice(0,10)}));},
    async claimInvite(token){if(demo)return null;return await one(db.rpc('claim_client_invite',{p_token:token}));},
    async updateClient(trainerClientId,status,goal){if(demo)return null;return await one(db.from('trainer_clients').update({status,goal}).eq('id',trainerClientId).select().single());},
    async updateProgramme(programId,week){if(demo)return null;return await one(db.from('client_programs').update({current_week:week}).eq('id',programId).select().single());},
    async assignProgramme(trainerClientId,templateId,startDate,week=1){if(demo)return null;await one(db.from('client_programs').update({is_active:false}).eq('trainer_client_id',trainerClientId).eq('is_active',true));return await one(db.from('client_programs').insert({trainer_client_id:trainerClientId,template_id:templateId,start_date:startDate||new Date().toISOString().slice(0,10),current_week:week,is_active:true}).select().single());},
    async myAssignment(){if(demo)return null;const s=await this.session();if(!s)return null;const rows=await one(db.from('trainer_clients').select('id,status,goal,trainer:profiles!trainer_clients_trainer_id_fkey(id,display_name,email),program:client_programs(id,current_week,is_active,start_date,template:program_templates(id,name,duration_weeks,source_key))').eq('client_id',s.user.id));const row=(rows||[]).find(r=>Array.isArray(r.program)?r.program.some(p=>p.is_active):r.program?.is_active)||rows?.[0]||null;if(row&&Array.isArray(row.program))row.program=row.program.find(p=>p.is_active)||row.program[0]||null;return row;},


    async myOnboarding(){if(demo)return null;const s=await this.session();if(!s)return null;const rows=await one(db.from('client_onboarding').select('*').eq('client_id',s.user.id).limit(1));return rows?.[0]||null;},
    async submitOnboarding(x){if(demo)return null;return await one(db.rpc('submit_client_onboarding',{p_primary_goal:x.goal,p_experience_level:x.experience,p_training_days_per_week:x.days,p_preferred_session_minutes:x.minutes,p_equipment:x.equipment||[],p_readiness_response:x.readiness,p_readiness_notes:x.readinessNotes||null,p_consent_data:!!x.consentData,p_consent_coaching:!!x.consentCoaching}));},
    async trainerOnboarding(clientId){if(demo)return null;const rows=await one(db.from('client_onboarding').select('*').eq('client_id',clientId).limit(1));return rows?.[0]||null;},
    async trainerReviewOnboarding(clientId,decision){if(demo)return null;return await one(db.rpc('trainer_review_onboarding',{p_client_id:clientId,p_decision:decision}));},
    async administratorOnboarding(){if(demo)return null;return await one(db.from('client_onboarding').select('*,client:profiles!client_onboarding_client_id_fkey(id,display_name,email),reviewer:profiles!client_onboarding_reviewed_by_fkey(id,display_name,email)').order('updated_at',{ascending:false}));},
    async billingPlans(){if(demo)return null;return await one(db.from('billing_plans').select('id,slug,name,description,amount_cents,currency,interval,trial_days,active').eq('active',true).order('amount_cents',{ascending:true}));},
    async mySubscription(){if(demo)return null;const s=await this.session();if(!s)return null;const rows=await one(db.from('billing_subscriptions').select('id,status,current_period_end,cancel_at_period_end,trial_end,plan:billing_plans(id,slug,name,amount_cents,currency,interval)').eq('client_id',s.user.id).order('updated_at',{ascending:false}).limit(1));return rows?.[0]||null;},
    async myPayments(){if(demo)return null;const s=await this.session();if(!s)return null;return await one(db.from('billing_payments').select('id,amount_paid_cents,currency,status,paid_at,refunded_cents').eq('client_id',s.user.id).order('paid_at',{ascending:false}).limit(20));},
    async trainerBilling(clientId){if(demo)return null;const rows=await one(db.from('billing_subscriptions').select('id,status,current_period_end,cancel_at_period_end,trial_end,plan:billing_plans(id,slug,name,amount_cents,currency,interval)').eq('client_id',clientId).order('updated_at',{ascending:false}).limit(1));return rows?.[0]||null;},
    async administratorSubscriptions(){if(demo)return null;return await one(db.from('billing_subscriptions').select('id,client_id,status,current_period_end,cancel_at_period_end,trial_end,updated_at,client:profiles!billing_subscriptions_client_id_fkey(id,display_name,email),plan:billing_plans(id,slug,name,amount_cents,currency,interval)').order('updated_at',{ascending:false}));},
    async administratorPayments(){if(demo)return null;return await one(db.from('billing_payments').select('id,client_id,amount_paid_cents,currency,status,paid_at,refunded_cents,client:profiles!billing_payments_client_id_fkey(id,display_name,email)').order('paid_at',{ascending:false}).limit(100));},
    async invokeBillingFunction(name,body={}){if(demo)return {demo:true};const {data,error}=await db.functions.invoke(name,{body});if(error)throw error;return data;},
    async createCheckout(planId){return await this.invokeBillingFunction('create-checkout-session',{plan_id:planId});},
    async createBillingPortal(){return await this.invokeBillingFunction('create-portal-session',{});},
    async administratorRefund(paymentId,amountCents=null){return await this.invokeBillingFunction('administrator-refund',{payment_id:paymentId,amount_cents:amountCents});},

    async administratorAudit(){if(demo)return null;return await one(db.from('admin_audit_log').select('id,actor_id,action,target_profile_id,target_relationship_id,metadata,created_at').order('created_at',{ascending:false}).limit(100));},
    async administratorSetAccountStatus(profileId,status){if(demo)return null;return await one(db.rpc('administrator_set_account_status',{p_profile_id:profileId,p_status:status}));},
    async administratorArchiveClient(relationshipId){if(demo)return null;return await one(db.rpc('administrator_archive_client',{p_relationship_id:relationshipId}));},
    async administratorResetOnboarding(clientId){if(demo)return null;return await one(db.rpc('administrator_reset_onboarding',{p_client_id:clientId}));},
    async administratorResetProgramme(relationshipId,week=1){if(demo)return null;return await one(db.rpc('administrator_reset_programme',{p_relationship_id:relationshipId,p_week:week}));},
    async administratorRevokeInvite(inviteId){if(demo)return null;return await one(db.rpc('administrator_revoke_invite',{p_invite_id:inviteId}));},
    async administratorDeleteClient(profileId){if(demo)return null;return await this.invokeBillingFunction('administrator-account-action',{profile_id:profileId,action:'delete',confirm:'DELETE'});},
    async administratorProfiles(){if(demo)return null;return await one(db.from('profiles').select('id,role,email,display_name,account_status,created_at,updated_at').order('created_at',{ascending:false}));},
    async administratorRelationships(){if(demo)return null;return await one(db.from('trainer_clients').select('id,status,goal,start_date,created_at,trainer:profiles!trainer_clients_trainer_id_fkey(id,display_name,email,role),client:profiles!trainer_clients_client_id_fkey(id,display_name,email,role)').order('created_at',{ascending:false}));},
    async administratorWorkoutSummaries(){if(demo)return null;return await one(db.from('workout_summaries').select('id,client_id,session_title,completed,completed_at,duration_seconds,completed_sets,planned_sets,perceived_effort').order('completed_at',{ascending:false}).limit(100));},
    async administratorInvites(){if(demo)return null;return await one(db.from('client_invites').select('id,trainer_id,email,display_name,expires_at,claimed_at,created_at').order('created_at',{ascending:false}).limit(100));},
    async administratorSetRole(profileId,role){if(demo)return null;return await one(db.rpc('administrator_set_role',{p_profile_id:profileId,p_role:role}));},
    async administratorTransferClient(relationshipId,trainerId){if(demo)return null;return await one(db.rpc('administrator_transfer_client',{p_trainer_client_id:relationshipId,p_new_trainer_id:trainerId}));},
    async saveWorkoutSummary(x){if(demo)return null;const s=await this.session();if(!s)throw new Error('Not signed in');const a=await this.myAssignment();return await one(db.from('workout_summaries').insert({client_id:s.user.id,trainer_client_id:a?.id||null,programme_week:x.week,session_key:x.day,session_title:x.title,completed:!!x.completed,completed_at:x.completedAt,duration_seconds:x.durationSeconds,completed_sets:x.completedSets,planned_sets:x.plannedSets,perceived_effort:x.effort||null}).select().single());}
  };
})();
