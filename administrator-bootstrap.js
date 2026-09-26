(async()=>{
  if(window.HMOBackend?.mode!=='supabase')return load('administrator.js');
  try{
    const s=await HMOBackend.session();
    if(!s){location.replace('account.html?next=administrator.html');return;}
    const me=await HMOBackend.me();if(me?.account_status==='suspended'){document.body.innerHTML='<main style="font:16px system-ui;padding:32px;max-width:720px;margin:auto"><h1>Account suspended</h1><p>This account is suspended. Contact a platform administrator.</p></main>';return;}
    if(me?.role==='trainer'){location.replace('trainer.html');return;}
    if(me?.role==='client'){location.replace('index.html');return;}
    if(!me||me.role!=='administrator'){document.body.innerHTML='<main style="font:16px system-ui;padding:32px;max-width:720px;margin:auto"><h1>Administrator access required</h1><p>This account does not have platform administrator permissions.</p><p><a href="account.html">Account</a></p></main>';return;}
    window.HMO_ADMIN_PROFILE=me;load('administrator-live.js');
  }catch(e){document.body.innerHTML='<main style="font:16px system-ui;padding:32px"><h1>Connection error</h1><p>'+String(e.message||e)+'</p></main>';}
  function load(src){const x=document.createElement('script');x.src=src;x.defer=true;document.body.appendChild(x);}
})();
