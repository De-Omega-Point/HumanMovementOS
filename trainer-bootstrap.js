(async()=>{
  if(window.HMOBackend?.mode!=='supabase')return load('trainer.js');
  try{
    const s=await HMOBackend.session();
    if(!s){location.replace('account.html?next=trainer.html');return;}
    const me=await HMOBackend.me();if(me?.account_status==='suspended'){document.body.innerHTML='<main style="font:16px system-ui;padding:32px;max-width:720px;margin:auto"><h1>Account suspended</h1><p>This account is suspended. Contact a platform administrator.</p></main>';return;}
    if(me?.role==='administrator'){location.replace('administrator.html');return;}
    if(!me||me.role!=='trainer'){document.body.innerHTML='<main style="font:16px system-ui;padding:32px;max-width:720px;margin:auto"><h1>Trainer access required</h1><p>This account does not have Trainer access.</p><p>After your first sign-in, promote your profile to <code>trainer</code> once from the Supabase SQL editor, then reload.</p><p><a href="account.html">Account</a></p></main>';return;}
    window.HMO_TRAINER_PROFILE=me;load('trainer-live.js');
  }catch(e){document.body.innerHTML='<main style="font:16px system-ui;padding:32px"><h1>Connection error</h1><p>'+String(e.message||e)+'</p></main>';}
  function load(src){const x=document.createElement('script');x.src=src;x.defer=true;document.body.appendChild(x);}
})();
