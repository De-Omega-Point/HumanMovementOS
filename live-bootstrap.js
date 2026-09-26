(async()=>{
  if(window.HMOBackend?.mode!=='supabase')return load();
  try{
    const session=await HMOBackend.session();
    if(!session){location.replace('account.html?next='+encodeURIComponent(location.pathname+location.search));return;}
    const me=await HMOBackend.me();
    if(me?.role==='administrator'){location.replace('administrator.html');return;}
    if(me?.role==='trainer'){location.replace('trainer.html');return;}
    if(me?.account_status==='suspended'){document.body.innerHTML='<main style="font:16px system-ui;padding:32px;max-width:720px;margin:auto"><h1>Account suspended</h1><p>Your account is currently suspended. Contact your trainer or platform administrator.</p><p><a href="account.html">Account</a></p></main>';return;}
    window.HMO_CLIENT_LOCKED=true;document.body.classList.add('client-locked');
    const ob=await HMOBackend.myOnboarding();
    if(!ob||ob.status!=='approved'){location.replace('onboarding.html');return;}
    const a=await HMOBackend.myAssignment();
    if(a){
      const p=a.program||{};
      const fake={clients:[{id:session.user.id,name:me?.display_name||'Client',email:me?.email||session.user.email,program:p.template?.source_key||'hmo52',week:p.current_week||1,status:a.status||'trial'}]};
      localStorage.setItem('dop.hmo.trainer.v02',JSON.stringify(fake));
      window.HMO_CLIENT_ID=session.user.id;
    }
    load();
  }catch(e){console.error(e);document.body.innerHTML='<main style="font:16px system-ui;padding:32px;max-width:720px;margin:auto"><h1>Account connection needs attention</h1><p>'+String(e.message||e)+'</p><p><a href="account.html">Open account</a></p></main>';}
  function load(){const s=document.createElement('script');s.src='app.js';s.defer=true;document.body.appendChild(s);}
})();
