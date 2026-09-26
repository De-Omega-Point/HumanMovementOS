/* De-Omega-Point Human Movement OS | authored training templates, not medical advice. */
(function (root, factory) {
  const api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.MovementProgramme = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PHASES = [
    {id:1, title:'Foundation', full:'Super Movement', start:1, end:12, line:'Control first. Build a repeatable base.'},
    {id:2, title:'Performance', full:'Human Performance', start:13, end:24, line:'Strength through range. Introduce skill.'},
    {id:3, title:'Mastery', full:'Movement Mastery', start:25, end:36, line:'Refine leverage, balance and coordination.'},
    {id:4, title:'Lifetime', full:'Lifetime Athleticism', start:37, end:52, line:'Keep strength useful, adaptable and sustainable.'}
  ];
  const THEMES = [
    ['Reconnect','Find comfortable variations. Leave several repetitions in reserve.'],
    ['Usable range','Keep the load steady. Explore only the range you control.'],
    ['Build consistency','Add a repetition only when the previous exposure felt comfortable.'],
    ['Absorb','Fewer sets. Keep familiar movement patterns and comfortable ranges.'],
    ['Tendon capacity','Repeat steady resistance work. Do not add load and volume together.'],
    ['Strength through range','Use the same controlled depth on every repetition.'],
    ['Elastic preparation','Optional low-impact preparation, not a compulsory jumping test.'],
    ['Restore','Reduce sets and review the next-day response.'],
    ['Single-side control','Use support for split stance and balance when useful.'],
    ['Controlled power','Keep any familiar elastic work brief and well rested.'],
    ['Connect the patterns','Practise squat, hinge, push, pull, carry and floor transitions.'],
    ['Foundation review','Repeat comfortable benchmarks. No maximum testing required.'],
    ['Skill foundations','Choose two skill priorities. Start with supported variations.'],
    ['Position before duration','A shorter clean hold is enough. Stop before shape deteriorates.'],
    ['Steady loading','Keep resistance work challenging but submaximal.'],
    ['Consolidate','Reduce total sets. Keep skill practice easy.'],
    ['Own your range','Use controlled split squats, hinges and comfortable overhead reach.'],
    ['Compression control','Lift the legs without throwing the trunk backwards.'],
    ['Handstand quality','Use a supported pike or your already-practised wall position.'],
    ['Elastic control','A lighter week. Power stays optional and low volume.'],
    ['Lever foundations','Keep feet or assistance available. No deadline for a harder lever.'],
    ['Push foundations','Choose a familiar lean or incline push-up. Keep wrists comfortable.'],
    ['Lateral strength','Build side support and carries before any flag attempts.'],
    ['Performance review','Record the same variations and conditions as your last review.'],
    ['Control under leverage','Practise your selected skills without adding multiple new demands.'],
    ['Cleaner shapes','Keep leverage unchanged while improving control.'],
    ['Press foundations','Compression and supported pike work; no forced press negatives.'],
    ['Tissue consolidation','Fewer sets. Review wrists, elbows, shoulders and next-day comfort.'],
    ['Single-arm foundations','Single-arm rows and carries, not compulsory one-arm eccentrics.'],
    ['Single-side balance','Use support and controlled single-leg loading.'],
    ['Handstand weight shift','Only use familiar supported shifts with a safe exit.'],
    ['Reload and reset','Keep practice light. Recovery is part of the programme.'],
    ['Lever refinement','Use the same supported variation until you can repeat it cleanly.'],
    ['Planche refinement','Choose leverage you already tolerate. More difficult is optional.'],
    ['Athletic preparation','March, step, carry and decelerate before increasing speed.'],
    ['Mastery review','Record capability, comfort and repeatability, not just personal bests.'],
    ['Pulling independence','Use controlled single-arm rows and familiar pull-up work.'],
    ['Assistance calibration','Change assistance only after repeated comfortable exposures.'],
    ['Press integration','Combine compression with supported shoulder control.'],
    ['Rebuild','Reduce volume and keep familiar variations.'],
    ['Handstand balance','Refine two-arm support before considering one-arm coaching.'],
    ['Assisted weight shift','A steady two-arm position remains a valid endpoint.'],
    ['Rotation','Turn smoothly through the hips and trunk without forcing range.'],
    ['Mobility in motion','A lighter week of controlled floor-to-stand and lateral movement.'],
    ['Acceleration preparation','Marching or familiar relaxed strides, not all-out sprints.'],
    ['Deceleration control','Practise slowing down before adding speed or direction changes.'],
    ['Reaction and balance','Begin with deliberate stepping near support.'],
    ['Consolidate','Keep the useful work and reduce fatigue.'],
    ['Floor independence','Use hands and support as needed. No unsupervised falling drills.'],
    ['Sustainable capacity','Steady work with enough rest to preserve technique.'],
    ['Movement integration','Connect familiar patterns without rushing transitions.'],
    ['Annual review','Review the year. Choose the next repeatable training block.']
  ];
  const WEEKS = THEMES.map((t,i)=>({number:i+1, phase:PHASES.find(p=>i+1<=p.end).id,
    title:t[0], focus:t[1], deload:(i+1)%4===0, audit:[12,24,36,52].includes(i+1)}));
  const EX = {};
  function add(id,name,group,equipment,tags,cues,easier,watch,opts={}) {
    EX[id]={id,name,group,equipment,tags,cues,easier,watch, ...opts};
  }
  add('pulse','Easy march or cycle','Warm-up','Clear space or bike',['Warm-up'],['Begin at an easy pace.','Gradually increase movement without becoming breathless.','You should still be able to speak in sentences.'],'March seated or walk gently.','Stop for dizziness, chest discomfort or unusual breathlessness.');
  add('wrists','Wrist and shoulder preparation','Warm-up','Wall or sturdy bench',['Mobility'],['Circle the wrists gently.','Place hands on a wall or bench and make small weight shifts.','Add comfortable shoulder circles; keep pressure light.'],'Keep the hands unloaded and reduce the range.','Do not press through wrist or shoulder pain.');
  add('jointprep','Ankle rocks and supported squat','Warm-up','Stable support',['Mobility'],['Hold a stable support for ankle rocks.','Let each knee travel comfortably over the toes.','Add slow shallow squats and gentle hip turns.'],'Use smaller movements or sit-to-stand.','Heels remain supported; no forced depth.');
  add('ramp','Exercise-specific rehearsal','Warm-up','Your first exercise setup',['Warm-up'],['Rehearse the first main exercise with little or no resistance.','Check the surface, equipment and range.','Add another preparation set when the working load is heavier.'],'Practise without external load.','This timer is a guide, not a reason to skip additional preparation.');
  add('squat','Goblet squat','Strength','Dumbbell or kettlebell',['Muscle','Bone','Mobility'],['Hold the load close and stand at a comfortable width.','Sit between the hips with heels grounded.','Stand steadily; breathe throughout the repetition.'],'Bodyweight sit-to-stand from a sturdy bench.','Use a comfortable depth; do not force a deep squat.');
  add('hinge','Romanian deadlift','Strength','Dumbbells or barbell',['Muscle','Bone','Tendon'],['Begin with soft knees and load close to the legs.','Move the hips back while keeping the trunk controlled.','Stop before losing position, then stand through the hips.'],'Unloaded hip hinge to a wall.','A hamstring stretch is not a reason to round further or chase the floor.');
  add('split','Supported split squat','Strength','Stable support; optional dumbbells',['Muscle','Bone','Mobility'],['Take a split stance and hold support as needed.','Lower in a comfortable vertical path.','Push through the front foot and finish both sides.'],'Shorten the stance and depth.','Repetitions shown are for each side.',{perSide:true});
  add('calf','Standing calf raise','Strength','Stable support; optional weight',['Muscle','Tendon'],['Use support and keep pressure through the ball of the foot.','Rise steadily without rolling the ankles out.','Lower slowly to a comfortable position.'],'Two-leg calf raise with no added weight.','No bouncing. Stop for increasing Achilles or heel pain.');
  add('soleus','Bent-knee calf raise','Strength','Chair and optional weight',['Muscle','Tendon'],['Sit with knees bent and feet supported.','Raise both heels steadily.','Pause briefly and lower with control.'],'Use no additional load.','Keep the movement comfortable; do not force the bottom range.');
  add('push','Push-up progression','Strength','Wall, bench or floor',['Muscle','Bone'],['Choose a height that allows controlled repetitions.','Lower the chest between the hands with the trunk steady.','Push away without letting the hips sag.'],'Use a higher, sturdy incline.','Stop before technique fails; avoid painful shoulder depth.');
  add('row','Supported row','Strength','Cable, band or dumbbell',['Muscle','Tendon'],['Set a secure stance or chest support.','Draw the elbow back without twisting the trunk.','Return slowly and keep the shoulder comfortable.'],'Use a lighter band or weight.','Check band anchors before using them.');
  add('pull','Pull-up progression','Strength','Secure bar; assistance if needed',['Muscle','Tendon'],['Use a comfortable grip and active shoulders.','Pull without kicking or craning the neck.','Lower with control, leaving about two repetitions in reserve.'],'Assisted pull-up or supported row.','High pull-up repetitions do not prove readiness for a lever or one-arm pull-up.');
  add('carry','Farmer carry','Strength','Two comfortable weights',['Muscle','Bone'],['Pick up the weights with a controlled hinge.','Walk tall with short, steady steps.','Set the load down before grip or posture deteriorates.'],'Use lighter weights or a short standing hold.','Clear the walking route before starting.');
  add('suitcase','Suitcase carry','Strength','One comfortable weight',['Muscle','Bone','Balance'],['Hold one weight at your side.','Walk without leaning away from it.','Switch sides and keep the same controlled pace.'],'Use less weight or a shorter supported standing hold.','Time shown is for each side.',{perSide:true});
  add('cossack','Supported lateral squat','Mobility','Stable support',['Muscle','Mobility'],['Take a wide but comfortable stance and hold support.','Shift onto one leg while keeping the other long.','Return through the centre and work both sides.'],'Reduce width and depth.','Do not force the inner thigh or roll the foot painfully.',{perSide:true});
  add('hip90','Supported 90/90 hip turns','Mobility','Mat or firm cushion',['Mobility'],['Sit with hands behind you for support.','Turn the knees gently from side to side.','Use a cushion or reduce the range when needed.'],'Seated hip rotations from a chair.','No forcing the knees towards the floor.');
  add('ankle','Knee-to-wall ankle rocks','Mobility','Wall',['Mobility'],['Place a foot near the wall with heel down.','Move the knee towards the wall over the toes.','Return gently and repeat on the other side.'],'Shorten the foot-to-wall distance.','Time shown is for each side.',{perSide:true});
  add('thoracic','Side-lying upper-back rotation','Mobility','Mat',['Mobility'],['Lie on your side with knees comfortably bent.','Open the top arm while rotating through a comfortable range.','Breathe steadily and return slowly.'],'Keep the arm bent or use a seated rotation.','Do not force the shoulder or lower back.',{perSide:true});
  add('pike','Seated pike compression lifts','Skill','Mat or blocks',['Muscle','Mobility'],['Sit tall with hands beside the thighs.','Lift one heel or both without throwing the torso backwards.','Lower quietly and use a small controlled range.'],'Bend the knees or lift one leg at a time.','Stop if the hip or lower back pinches.');
  add('straddle','Straddle compression lifts','Skill','Mat or blocks',['Muscle','Mobility'],['Sit with a comfortable straddle width.','Press gently into the floor and lift a heel.','Alternate or lift both while staying controlled.'],'Narrow the stance or bend the knees.','Do not force pancake depth.');
  add('pikehold','Supported pike hold','Skill','Sturdy bench or floor',['Muscle','Balance'],['Place hands on a sturdy incline or the floor.','Raise the hips and gently push the surface away.','Keep breathing and use only a comfortable shoulder angle.'],'Hold a wall-supported forward lean.','This is the default handstand foundation; it is not an inverted handstand.');
  add('wallstand','Familiar wall handstand','Skill','Clear wall; non-slip surface',['Muscle','Balance'],['Use only an entry and exit you have already practised.','Push the floor away and keep the trunk controlled.','Exit before fatigue or loss of position.'],'Supported pike hold.','Only select after confirming comfortable weight-bearing and a reliable safe exit.',{advanced:true});
  add('shift','Supported pike weight shifts','Skill','Sturdy bench or floor',['Muscle','Balance'],['Begin in a supported pike you already control.','Move pressure slightly from one hand towards the other.','Keep both hands down and return to centre.'],'Use a higher incline or remain still.','Do not lift a hand or attempt a one-arm handstand from this drill.');
  add('lean','Gentle planche lean','Skill','Floor, parallettes or bench',['Muscle','Tendon'],['Start in a comfortable incline or floor support.','Push the surface away and lean forwards only a little.','Return before elbow, wrist or shoulder discomfort.'],'Use a high incline plank.','Leverage stays self-selected. No mandatory tuck or full planche.');
  add('leverprep','Feet-supported lever foundation','Skill','Low securely fixed bar or rings',['Muscle','Tendon'],['Keep both feet supported and choose an easy body angle.','Hold the trunk steady with active shoulders.','Maintain assistance throughout the short hold.'],'Supported row with bent knees.','Check anchors. Do not lift the feet to force a full front lever.');
  add('tucklever','Familiar assisted tuck lever','Skill','Secure bar or rings; assistance',['Muscle','Tendon'],['Use only an assisted tuck position you already practise.','Keep the trunk controlled and shoulders active.','Exit before the shape changes or strain increases.'],'Feet-supported lever foundation.','Coach review is appropriate before reducing assistance.',{advanced:true});
  add('hang','Feet-supported active hang','Skill','Secure bar with foot support',['Muscle','Tendon','Mobility'],['Keep the feet supported so the arms take a comfortable load.','Maintain gentle shoulder engagement.','Breathe and step down under control.'],'Supported overhead reach.','Not a passive forced shoulder stretch.');
  add('sideplank','Side plank progression','Strength','Mat or sturdy bench',['Muscle'],['Use a bent-knee or incline support to start.','Lift the hips into a comfortable straight line.','Breathe and lower before the shoulder or trunk position fails.'],'Use a higher incline or shorter hold.','Time shown is for each side.',{perSide:true});
  add('flagprep','Feet-supported flag grip practice','Skill','Secure purpose-built vertical apparatus',['Muscle','Tendon'],['Keep the feet on the ground and use very light arm pressure.','Practise a comfortable push-pull grip with a stable trunk.','Release without jumping or lifting the body sideways.'],'Side plank progression.','Use suitable apparatus and coaching. No flag eccentrics or airborne attempts.',{perSide:true});
  add('lsit','Supported tuck L-sit','Skill','Stable parallettes or blocks',['Muscle','Mobility'],['Set stable hands and keep the shoulders supported.','Keep toes down as needed and lift the hips a little.','Breathe and lower before the shoulders sink.'],'Seated compression lifts.','Avoid breath-holding and forcing locked elbows.');
  add('singlehinge','Supported single-leg hinge','Strength','Stable support; optional dumbbell',['Muscle','Bone','Balance'],['Use one hand for support.','Move the hips back over the standing leg.','Keep the pelvis controlled and return slowly.'],'Kickstand hinge with the rear toes down.','Use the same comfortable range on each side.',{perSide:true});
  add('stepup','Low step-up','Strength','Secure low step; support',['Muscle','Bone','Balance'],['Place the whole foot on a low, stable step.','Stand through the leading leg without launching from the floor.','Lower slowly and use support as needed.'],'Use a lower step or sit-to-stand.','Repetitions shown are for each side.',{perSide:true});
  add('singlearmrow','Supported single-arm row','Strength','Bench and dumbbell or cable',['Muscle','Tendon'],['Support the free hand or chest.','Pull the elbow back without rotating the torso.','Lower slowly and repeat on the other side.'],'Lighter supported row.','A foundation for pulling, not a test of one-arm pull-up readiness.',{perSide:true});
  add('deadbug','Dead bug','Strength','Mat',['Muscle'],['Lie on your back with knees bent and arms raised.','Move opposite arm and leg only as far as trunk control allows.','Return and alternate while breathing normally.'],'Move only the legs or slide one heel.','Avoid forcing the lower back or holding your breath.');
  add('crawl','Short bear crawl','Movement','Clear non-slip floor',['Muscle','Coordination'],['Start on hands and knees; hover only if comfortable.','Take a few small opposite-hand-and-foot steps.','Keep the trunk quiet and stop before form breaks down.'],'Hands-and-knees crawl or standing cross-body march.','Avoid on painful wrists or slippery flooring.');
  add('floor','Supported floor-to-stand','Movement','Mat and sturdy support',['Mobility','Balance'],['Use a stable support to lower through half-kneeling.','Move to a comfortable seated position.','Return using the support and hands as needed.'],'Practise chair sit-to-stand.','No requirement to avoid your hands; this is not a longevity score.');
  add('balance','Supported single-leg balance','Movement','Sturdy support within reach',['Balance'],['Stand beside support with eyes open.','Lift one foot slightly and keep the standing knee soft.','Touch the support whenever needed.'],'Keep both feet down in a narrow stance.','No eyes-closed balance or unstable surfaces required.',{perSide:true});
  add('march','Controlled athletic march','Movement','Clear level space',['Coordination','Muscle'],['Walk or march with a comfortable rhythm.','Lift each knee only as high as controlled.','Place the foot down quietly and maintain balance.'],'Easy walk or seated march.','This is not a sprint.');
  add('pogo','Low two-foot pogo','Power','Clear level surface; suitable footwear',['Tendon','Bone','Power'],['Only use this after comfortable prior impact training.','Make low two-foot rebounds and land quietly.','Stop before losing control, comfort or spring.'],'Controlled calf raises or marching.','Optional. Skip with pain, injury or unassessed fracture risk.',{impact:true});
  add('stepreact','Direction-change stepping','Movement','Clear level space; nearby support',['Balance','Coordination'],['Step slowly forwards, sideways and back.','Return to a balanced stance between directions.','Increase unpredictability only while staying controlled.'],'Use deliberate side steps beside support.','No sudden hard cuts or fast pivots.');
  add('chop','Light standing band rotation','Strength','Light band with secure anchor',['Muscle','Coordination'],['Use a stable stance and light resistance.','Turn smoothly through the hips and trunk in a comfortable range.','Return slowly and change sides.'],'Unloaded standing turns.','No forceful twisting or fixed-feet maximum rotation.',{perSide:true});
  add('hamstretch','Gentle supported hamstring stretch','Flexibility','Chair or mat',['Mobility'],['Support the leg with the knee comfortably bent.','Hinge a little until you feel a mild stretch.','Breathe and reduce the range rather than forcing it.'],'Keep a greater bend in the knee.','No bouncing, tingling or painful stretching.',{perSide:true});
  add('hipstretch','Supported hip-flexor stretch','Flexibility','Mat and stable support',['Mobility'],['Use a comfortable half-kneeling or standing split stance.','Gently tuck the pelvis and shift only slightly forward.','Breathe and relax the front of the hip.'],'Use a shorter standing split stance.','Do not arch the lower back to create more range.',{perSide:true});
  add('reach','Comfortable overhead reach','Mobility','Wall or chair',['Mobility'],['Reach both arms only as far overhead as comfortable.','Keep the ribs relaxed rather than arching the back.','Lower and repeat slowly.'],'Reach one arm at a time or at a lower angle.','Stop for shoulder pain or tingling.');
  add('breathe','Easy walk and settle','Cool-down','Clear space or chair',['Recovery'],['Slow your pace gradually.','Breathe normally and relax the shoulders.','Notice how the session felt without forcing deep breaths.'],'Sit comfortably and let breathing settle.','Seek help for persistent unusual symptoms.');
  const DAYS=[
    {id:'mon',short:'Mon',title:'Lower-body strength',sub:'Squat · hinge · calf',type:'main'},
    {id:'tue',short:'Tue',title:'Upper-body strength',sub:'Skill · push · pull',type:'main'},
    {id:'wed',short:'Wed',title:'Mobility and reset',sub:'Optional · comfortable range',type:'recovery'},
    {id:'thu',short:'Thu',title:'Full-body control',sub:'Single-side strength · carry',type:'main'},
    {id:'fri',short:'Fri',title:'Recovery day',sub:'Rest or an easy walk',type:'rest'},
    {id:'sat',short:'Sat',title:'Skill and movement',sub:'Balance · compression · flow',type:'main'},
    {id:'sun',short:'Sun',title:'Recover and review',sub:'Rest · next-week check-in',type:'rest'}
  ];
  const SKILLS={
    handstand:{name:'Handstand',base:'pikehold',experienced:'wallstand',path:['Supported pike','Familiar wall line','Two-arm balance','Coach-guided press / one-arm preparation']},
    compression:{name:'Compression',base:'pike',experienced:'pike',path:['Bent-knee lift','Pike lift','Straddle lift','Supported L-sit','Press foundations']},
    lever:{name:'Front lever',base:'leverprep',experienced:'tucklever',path:['Supported row','Feet-supported hold','Familiar assisted tuck','Coach-reviewed longer lever']},
    planche:{name:'Planche',base:'lean',experienced:'lean',path:['Incline support','Gentle lean','Repeatable supported shape','Coach-guided tuck / longer lever']},
    flag:{name:'Human flag',base:'sideplank',experienced:'flagprep',path:['Side plank','Suitcase carry','Feet-supported grip with coaching','Coach-guided flag preparation']},
    onearmpull:{name:'One-arm pull pathway',base:'singlearmrow',experienced:'singlearmrow',path:['Supported row','Familiar pull-ups','Assisted pulling with coaching','No automatic one-arm eccentrics']}
  };
  const SOURCES=[
    {title:'WHO: physical activity',url:'https://www.who.int/initiatives/behealthy/physical-activity',note:'General adult activity guidance. A skill programme does not replace aerobic activity.'},
    {title:'WHO: benefits and guidance',url:'https://www.who.int/news-room/fact-sheets/detail/physical-activity',note:'All activity counts. Public-health guidance is not clearance for advanced gymnastics.'},
    {title:'Bohm et al. (2015): tendon loading review',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4532714/',note:'Loading evidence for healthy adult Achilles and patellar tendons. This does not validate a specific calisthenics progression or the app.'},
    {title:'Healthdirect: bone health',url:'https://www.healthdirect.gov.au/osteoporosis',note:'Bone-health and fracture-risk context. Exercise logs cannot measure bone density.'},
    {title:'MDN: screen wake lock',url:'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API',note:'Screen-on support depends on browser, power state, HTTPS and permissions.'},
    {title:'MDN: media autoplay',url:'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay',note:'Audio needs a user gesture and may still be restricted by the device.'},
    {title:'MDN: page visibility',url:'https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API',note:'Background timers can be throttled. The app reconciles elapsed time but does not promise locked-screen alarms.'}
  ];
  function clamp(n,min,max){return Math.min(max,Math.max(min,n));}
  function week(n){return WEEKS[clamp(Math.round(Number(n)||1),1,52)-1];}
  function makeWorkout(n,day='mon',options={}){
    const w=week(n), d=DAYS.find(x=>x.id===day)||DAYS[0];
    const ready=options.readiness||'ready';
    const recovery=d.type!=='main';
    const baseSets=w.number<3?2:3;
    const sets=Math.max(1,baseSets-(w.deload?1:0)-(ready==='lighter'?1:0));
    const skillSets=w.deload||ready==='lighter'?2:3;
    const intensity=w.number<5||w.deload||ready==='lighter'?'Easy to moderate · leave 3–4 reps in reserve':'Moderate · leave about 2–3 reps in reserve';
    let items=[];
    const put=(id,ss=sets,reps=8,seconds=0,rest=90,block='Strength')=>items.push({id,sets:ss,reps,seconds,rest,block});
    if(recovery){
      put('pulse',1,0,120,10,'Warm-up'); put('ankle',1,0,30,10,'Mobility');
      put('hip90',1,0,60,10,'Mobility'); put('thoracic',1,0,30,10,'Mobility');
      put('reach',1,0,45,10,'Mobility'); put('floor',1,4,0,20,'Movement');
      put('hamstretch',1,0,30,10,'Flexibility'); put('breathe',1,0,60,0,'Cool-down');
    }else{
      put('pulse',1,0,180,10,'Warm-up'); put('wrists',1,0,60,10,'Warm-up'); put('jointprep',1,0,60,10,'Warm-up'); put('ramp',1,0,60,20,'Warm-up');
      let choices=(options.skills||['handstand','compression']).filter(k=>SKILLS[k]).slice(0,2);
      if(!choices.length)choices=['handstand','compression'];
      const key=day==='tue'?choices[0]:choices[1]||choices[0];
      const skill=SKILLS[key];
      let sid=options.experienced&&w.phase>1?skill.experienced:skill.base;
      if(day==='tue'||day==='sat'){
        if(key==='compression'){sid=w.phase>=3?'straddle':'pike'; put(sid,skillSets,6,0,60,'Skill');}
        else if(key==='onearmpull')put(sid,skillSets,6,0,90,'Skill');
        else put(sid,skillSets,0,options.experienced&&w.phase>1?15:12,90,'Skill');
      }
      if(day==='mon'){
        put('squat',sets,8,0,120);put('hinge',sets,8,0,120);put('calf',sets,10,0,75);put('carry',2,0,30,60);put('cossack',1,5,0,30,'Mobility');
      }else if(day==='tue'){
        put(options.equipment==='home'?'row':'pull',sets,w.phase>1?6:8,0,120);
        put('push',sets,8,0,120);put('row',Math.max(1,sets-1),8,0,90);put('deadbug',2,6,0,45);
      }else if(day==='thu'){
        put(w.phase>=3?'stepup':'split',sets,6,0,100);put(w.phase>=3?'singlehinge':'hinge',sets,6,0,100);
        put('push',sets,8,0,100);put(w.phase>=3?'singlearmrow':'row',sets,8,0,100);
        put('soleus',2,10,0,60); if(options.budget===60)put('suitcase',2,0,25,60);
      }else{
        if(w.number>=7&&options.impact&&ready!=='lighter'&&!w.deload)put('pogo',2,10,0,75,'Power'); else put(w.phase===4?'stepreact':'march',2,0,30,30,'Movement');
        put('squat',Math.max(1,sets-1),8,0,90);put(w.phase>=3?'singlearmrow':'row',Math.max(1,sets-1),8,0,90);
        if(w.number===43)put('chop',2,6,0,60); else put('suitcase',2,0,25,60);
        put('balance',1,0,25,15,'Movement');put(w.phase===4?'floor':'crawl',2,w.phase===4?4:0,w.phase===4?0:20,40,'Movement');
      }
      if(options.budget===60&&day==='tue')put('hang',2,0,20,60,'Skill');
      put(day==='tue'?'thoracic':'hipstretch',1,0,30,10,'Flexibility');
      put(day==='sat'?'reach':'hamstretch',1,0,30,10,'Flexibility');put('breathe',1,0,60,0,'Cool-down');
    }
    // Fit the selected budget by trimming accessory volume, never by shortening recovery.
    // The final estimate is a planning aid; equipment setup and individual pace can vary.
    const estimateItems = () => items.reduce((sum,it)=> {
      const sideCount=EX[it.id].perSide?2:1;
      return sum + it.sets*((it.seconds||it.reps*5)*sideCount + (sideCount===2?20+it.rest:it.rest) + 5*sideCount);
    },0);
    if(!recovery)for(let guard=0;guard<30&&estimateItems()>(options.budget||45)*60-90;guard++) {
      const candidate=[...items].reverse().find(it=>it.block==='Strength'&&it.sets>1);
      if(!candidate)break;
      candidate.sets--;
    }
    // No previous performance or calendar position is treated as evidence of skill readiness.
    const steps=[];
    items.forEach((it,gid)=>{const e=EX[it.id];for(let s=1;s<=it.sets;s++){
      const sides=e.perSide?['Left','Right']:[''];
      sides.forEach(side=>steps.push({...it,gid,set:s,side,name:e.name,
        rest:side==='Left'?20:it.rest,target:it.seconds?`${it.seconds}s`:String(it.reps)}));
    }});
    if(steps.length)steps[steps.length-1].rest=0;
    let planned=steps.reduce((a,s)=>a+(s.seconds||s.reps*5)+s.rest+5,0);
    return {week:w.number,phase:w.phase,day:d.id,title:recovery?'Mobility and reset':d.title,
      type:recovery?'recovery':'main',intensity,deload:w.deload,items,steps,estimatedMinutes:Math.ceil(planned/60),budget:options.budget||45};
  }
  return {PHASES,WEEKS,EX,DAYS,SKILLS,SOURCES,week,makeWorkout};
});
