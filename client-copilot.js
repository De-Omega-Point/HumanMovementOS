/* Human Movement OS v1.0 · Workout Copilot
   Local, narrow, workout-friendly. It explains and navigates; it does not diagnose or change programmes. */
(function(){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function context(){const workout=document.body.classList.contains('workout-mode');const main=document.querySelector('.workout-card h1')?.textContent?.trim();const target=document.querySelector('.target-line')?.textContent?.trim();const next=document.querySelector('.next-up h3')?.textContent?.trim();return {workout,main,target,next};}
  function reply(kind){const c=context();
    if(kind==='current')return c.workout&&c.main?`You’re on <b>${esc(c.main)}</b>${c.target?`<br><span>${esc(c.target)}</span>`:''}. Follow the three visible cues and keep the movement comfortable.`:'Start or resume a guided workout and I’ll summarise the current movement.';
    if(kind==='next')return c.next?`Up next: <b>${esc(c.next)}</b>.`:'I can’t see the next step yet. The guided workout will reveal it when this step is complete.';
    if(kind==='tempo')return '<b>Tempo 3-1-1</b> means roughly 3 seconds lowering, 1 second pause, then 1 second lifting. Control matters more than matching a metronome perfectly.';
    if(kind==='easier'){const b=document.querySelector('[data-action="make-easier"]');if(b){b.click();return 'I opened the easier-variation option. Your Trainer still controls the programme; this only scales the current movement.';}return 'Use the movement’s Technique and alternatives panel. If the easier option still feels wrong, stop that movement and flag it for Trainer review.';}
    if(kind==='discomfort')return '<b>Don’t push through new or increasing discomfort.</b> Stop or change the provoking movement, use the easier option if appropriate, and record it in your session note so your Trainer can review it. This copilot does not diagnose injuries.';
    return 'I can help with the current movement, what comes next, tempo, easier options, and what to do if something feels wrong.';
  }
  const wrap=document.createElement('div');wrap.innerHTML=`<button id="hmo-copilot-button" class="hmo-copilot-button" aria-haspopup="dialog" aria-controls="hmo-copilot">Ω</button><dialog id="hmo-copilot" class="hmo-copilot"><div class="hmo-copilot-head"><div><small>LOCAL AI KIT</small><h3>Workout Copilot</h3></div><button class="hmo-copilot-close" aria-label="Close">×</button></div><div id="hmo-copilot-answer" class="hmo-copilot-answer">What do you need?</div><div class="hmo-copilot-grid"><button data-copilot="current">What am I doing?</button><button data-copilot="next">What’s next?</button><button data-copilot="tempo">Explain tempo</button><button data-copilot="easier">Make it easier</button><button data-copilot="discomfort">Something feels wrong</button></div><p class="hmo-copilot-foot">Local guidance only · Trainer controls programming · no diagnosis</p></dialog>`;document.body.append(...wrap.childNodes);
  const d=document.querySelector('#hmo-copilot'),ans=document.querySelector('#hmo-copilot-answer');
  document.querySelector('#hmo-copilot-button').onclick=()=>{OmegaRuntime?.audit?.('client_copilot_open');d.showModal()};
  document.querySelector('.hmo-copilot-close').onclick=()=>d.close();
  d.addEventListener('click',e=>{const b=e.target.closest('[data-copilot]');if(!b)return;const route=OmegaRuntime?.route?.({role:'client',task:'copilot',input:{kind:b.dataset.copilot}});if(route&&!route.ok){ans.textContent='This action is not available.';return;}ans.innerHTML=reply(b.dataset.copilot);});
})();
