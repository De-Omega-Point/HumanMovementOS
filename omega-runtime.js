/* Human Movement OS v1.0 · OmegaRuntime.js
   Local-first orchestration, verification and role safety. No remote model authority. */
(function(root,factory){const api=factory(); if(typeof module==='object'&&module.exports)module.exports=api; root.OmegaRuntime=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const AUDIT=[];
  const ROLE_CAPS={
    client:new Set(['read_self','workout_copilot']),
    trainer:new Set(['read_assigned_clients','coaching_intelligence','draft_review']),
    administrator:new Set(['platform_intelligence','read_platform'])
  };
  function can(role,cap){return !!ROLE_CAPS[role]?.has(cap)}
  function audit(event,payload={}){const row={at:new Date().toISOString(),event,payload};AUDIT.push(row);if(AUDIT.length>250)AUDIT.shift();return row}
  function verify({evidence=[],reconstruction=false,contradictions=[]}={}){
    const grounded=Array.isArray(evidence)&&evidence.filter(Boolean).length>0;
    const independent=!!reconstruction;
    const falsified=Array.isArray(contradictions)&&contradictions.filter(Boolean).length>0;
    const score=[grounded,independent,!falsified].filter(Boolean).length;
    return {score,status:score===3?'VERIFIED':score===2?'REVIEW':'ABSTAIN',grounded,independent,contradictions:contradictions||[]};
  }
  function route({role='client',task,input={}}){
    const map={attention:'coaching_intelligence',weekly_review:'draft_review',platform:'platform_intelligence',copilot:'workout_copilot'};
    const cap=map[task]; if(!cap||!can(role,cap)){audit('route_denied',{role,task});return {ok:false,status:'DENIED',reason:'Role not permitted'};}
    audit('route_allowed',{role,task});return {ok:true,status:'ROUTED',task,input};
  }
  function humanGate(action,{confidence='REVIEW',risk='normal'}={}){
    const blocked=['diagnosis','medical_clearance','autonomous_programme_change','role_change'];
    if(blocked.includes(action))return {allowed:false,requiresHuman:true,reason:'Human decision required'};
    if(confidence!=='VERIFIED'||risk==='elevated')return {allowed:false,requiresHuman:true,reason:'Trainer review required'};
    return {allowed:true,requiresHuman:false};
  }
  return {version:'0.8.0',can,route,verify,humanGate,audit,history:()=>AUDIT.slice()};
});
