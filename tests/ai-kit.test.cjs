const assert=require('assert');
const Runtime=require('../omega-runtime.js');
global.OmegaRuntime=Runtime;
const Tx=require('../transformers.js');global.HMOTransformers=Tx;
const Brain=require('../brain.js');
assert.equal(Runtime.route({role:'client',task:'attention'}).ok,false);
assert.equal(Runtime.route({role:'trainer',task:'attention'}).ok,true);
assert.equal(Runtime.humanGate('diagnosis',{confidence:'VERIFIED'}).allowed,false);
assert.equal(Runtime.verify({evidence:['x'],reconstruction:true,contradictions:[]}).status,'VERIFIED');
assert.equal(Tx.classify('My shoulder feels weird and I am tired').top,'movement_concern');
const c={client:{id:'c1',display_name:'Maya'},_workouts:[
 {completed:true,completed_at:new Date(Date.now()-86400000).toISOString(),perceived_effort:9},
 {completed:true,completed_at:new Date(Date.now()-2*86400000).toISOString(),perceived_effort:9},
 {completed:true,completed_at:new Date(Date.now()-3*86400000).toISOString(),perceived_effort:9}],_notes:[{note:'shoulder feels weird overhead'}],_billing:{status:'active'},_onboarding:{status:'approved',readiness_response:'ready'}};
const a=Brain.analyseClient(c);assert(a.signals.some(s=>s.type==='effort'));assert(a.signals.some(s=>s.type==='language'));assert(a.signals.every(s=>['VERIFIED','REVIEW','ABSTAIN'].includes(s.verification.status)));
const review=Brain.weeklyReview(c);assert.equal(review.requiresTrainerApproval,true);
const pi=Brain.platformInsights({payments:[{status:'failed'}],onboarding:[{status:'review_needed'}],subscriptions:[],workouts:[]});assert(pi.length>=2);
console.log('AI kit tests: PASS');
