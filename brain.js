/* Human Movement OS v1.0 · Brain.js
   Deterministic coaching intelligence. Pattern support only, not medical diagnosis. */
(function(root,factory){const api=factory(root.OmegaRuntime,root.HMOTransformers); if(typeof module==='object'&&module.exports)module.exports=api; root.HMOBrain=api;})(typeof globalThis!=='undefined'?globalThis:this,function(Runtime,Tx){
  'use strict';
  Runtime=Runtime||((typeof require==='function')?require('./omega-runtime.js'):null);
  Tx=Tx||((typeof require==='function')?require('./transformers.js'):null);
  const day=86400000;
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  function recencyDays(date){if(!date)return Infinity;return Math.max(0,(Date.now()-new Date(date).getTime())/day)}
  function analyseClient(c={}){
    const workouts=(c._workouts||[]).slice().sort((a,b)=>new Date(b.completed_at)-new Date(a.completed_at));
    const recent=workouts.slice(0,6),completed=recent.filter(w=>w.completed),rpes=recent.map(w=>Number(w.perceived_effort)).filter(n=>Number.isFinite(n)&&n>0);
    const notes=[...(c._notes||[])].slice(0,8).map(n=>n.note||'').filter(Boolean);const noteSignals=notes.map(n=>Tx?.classify(n)).filter(Boolean);
    const signals=[];
    const add=(type,severity,title,detail,evidence,reconstruction=true,contradictions=[])=>{const verification=Runtime.verify({evidence,reconstruction,contradictions});signals.push({type,severity,title,detail,evidence,verification});};
    const ob=c._onboarding;
    if(ob?.readiness_response==='needs_review'||ob?.status==='review_needed')add('readiness','high','Readiness review requested','Client has asked for trainer review before progression.',['Onboarding readiness flag'],true,[]);
    const bill=c._billing?.status;
    if(['past_due','unpaid','incomplete','incomplete_expired'].includes(bill))add('billing','high','Payment attention','Billing status needs operational follow-up.',[`Billing status: ${bill}`],true,[]);
    const last=workouts[0];const days=recencyDays(last?.completed_at);
    if(workouts.length&&days>=7)add('adherence',days>=14?'high':'medium','Training gap',`No synced workout for ${Math.floor(days)} days.`,[`Last workout: ${last.completed_at}`],true,[]);
    if(recent.length>=3){const rate=completed.length/recent.length;if(rate<0.6)add('adherence','medium','Completion trending low',`${Math.round(rate*100)}% of the last ${recent.length} logged sessions were completed.`,[`${completed.length}/${recent.length} completed`],true,[]);}
    if(rpes.length>=3&&mean(rpes.slice(0,3))>=8.5)add('effort','medium','High effort trend',`Recent average RPE is ${mean(rpes.slice(0,3)).toFixed(1)}. Review before increasing difficulty.`,rpes.slice(0,3).map(x=>`RPE ${x}`),true,[]);
    const concernCount=noteSignals.filter(x=>x.labels?.some(l=>l.label==='movement_concern')).length;
    if(concernCount)add('language','high','Movement concern mentioned','A recent trainer/client note contains movement-discomfort language. Review the original note; no diagnosis is inferred.',[`Concern language in ${concernCount} note(s)`],true,[]);
    const scheduleCount=noteSignals.filter(x=>x.top==='schedule_barrier').length;
    if(scheduleCount>=2)add('schedule','medium','Repeated schedule barrier','Multiple recent notes mention time or scheduling barriers.',[`${scheduleCount} schedule-related notes`],true,[]);
    if(!signals.some(s=>['high','medium'].includes(s.severity))&&completed.length>=3&&mean(rpes)<=7.5)add('progress','positive','Progression review candidate','Recent sessions are being completed without a high-effort signal. Consider reviewing progression criteria.',[`${completed.length} recent completed sessions`,rpes.length?`Average RPE ${mean(rpes).toFixed(1)}`:'No high RPE evidence'],true,[]);
    const rank={high:4,medium:3,positive:1,low:0};signals.sort((a,b)=>rank[b.severity]-rank[a.severity]);
    const priority=signals.reduce((m,s)=>Math.max(m,rank[s.severity]||0),0);
    return {clientId:c.client?.id||c.id,name:c.client?.display_name||c.name||'Client',priority,signals,workoutCount:workouts.length,lastWorkout:last?.completed_at||null,verificationSummary:{verified:signals.filter(s=>s.verification.status==='VERIFIED').length,review:signals.filter(s=>s.verification.status==='REVIEW').length}};
  }
  function attentionQueue(clients=[]){return clients.map(analyseClient).filter(x=>x.signals.length).sort((a,b)=>b.priority-a.priority||String(a.name).localeCompare(String(b.name)));}

  function platformInsights(state={}){
    const subs=state.subscriptions||[],pays=state.payments||[],onb=state.onboarding||[],workouts=state.workouts||[];
    const out=[];
    const failed=pays.filter(x=>x.status==='failed').length;if(failed)out.push({severity:'high',title:'Failed payments',detail:`${failed} recent payment${failed===1?'':'s'} failed.`,verification:Runtime.verify({evidence:[`${failed} failed payment records`],reconstruction:true})});
    const review=onb.filter(x=>x.status==='review_needed').length;if(review)out.push({severity:'high',title:'Onboarding reviews',detail:`${review} client${review===1?'':'s'} need Trainer review.`,verification:Runtime.verify({evidence:[`${review} onboarding review flags`],reconstruction:true})});
    const waiting=onb.filter(x=>x.status==='submitted').length;if(waiting)out.push({severity:'medium',title:'Activation queue',detail:`${waiting} submitted onboarding record${waiting===1?'':'s'} await Trainer action.`,verification:Runtime.verify({evidence:[`${waiting} submitted onboarding records`],reconstruction:true})});
    const active=subs.filter(x=>x.status==='active').length,trial=subs.filter(x=>x.status==='trialing').length;if(active||trial)out.push({severity:'positive',title:'Subscription base',detail:`${active} active subscription${active===1?'':'s'}${trial?` and ${trial} trialling`:''}.`,verification:Runtime.verify({evidence:[`${active} active`,`${trial} trialling`],reconstruction:true})});
    if(!out.length&&workouts.length)out.push({severity:'positive',title:'Operations stable',detail:'No high-priority billing or onboarding exception is visible in the current snapshot.',verification:Runtime.verify({evidence:[`${workouts.length} workout records inspected`],reconstruction:true})});
    return out;
  }
  function weeklyReview(c={}){const a=analyseClient(c);const ws=(c._workouts||[]).slice(0,7),done=ws.filter(w=>w.completed).length,rpes=ws.map(w=>Number(w.perceived_effort)).filter(Number.isFinite);return {client:a.name,summary:`${done}/${ws.length||0} recent logged sessions completed${rpes.length?`; average RPE ${mean(rpes).toFixed(1)}`:''}.`,signals:a.signals.slice(0,3),suggestedAction:a.signals[0]?.severity==='high'?'Trainer review before progression':a.signals.some(s=>s.type==='progress')?'Review progression criteria':'Keep current plan and review normal coaching context',requiresTrainerApproval:true};}
  return {version:'0.8.0',analyseClient,attentionQueue,weeklyReview,platformInsights};
});
