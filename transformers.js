/* Human Movement OS v1.0 · Transformers.js adapter
   Local text interpretation with deterministic fallback. This module never diagnoses. */
(function(root,factory){const api=factory(); if(typeof module==='object'&&module.exports)module.exports=api; root.HMOTransformers=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const lex={
    movement_concern:['pain','painful','hurt','hurts','sharp','weird','ache','aching','sore','shoulder','knee','wrist','elbow','back'],
    recovery:['tired','fatigue','fatigued','exhausted','sleep','poor sleep','drained','recovery'],
    schedule_barrier:['busy','work','shift','time','travel','missed','late','schedule','family'],
    positive:['good','great','strong','easy','better','improving','confident','comfortable','progress'],
    difficulty:['hard','difficult','struggle','struggling','too much','heavy','challenging']
  };
  function classify(text=''){
    const t=String(text).toLowerCase();const scores={};
    for(const [k,words] of Object.entries(lex))scores[k]=words.reduce((n,w)=>n+(t.includes(w)?1:0),0);
    const labels=Object.entries(scores).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([label,score])=>({label,score}));
    return {text:String(text),labels,top:labels[0]?.label||'neutral',method:'local-deterministic'};
  }
  function explainLabel(label){return ({movement_concern:'Movement concern mentioned',recovery:'Recovery or tiredness mentioned',schedule_barrier:'Schedule barrier mentioned',positive:'Positive training feedback',difficulty:'Training difficulty mentioned',neutral:'No notable text signal'})[label]||'General note';}
  return {version:'0.8.0',classify,explainLabel};
});
