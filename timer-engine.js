/* Deadline-based timing. UI refresh frequency is never the clock. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MovementTimer=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  class Clock {
    constructor(snapshot){
      this.mode='countdown';this.durationMs=60000;this.status='idle';this.startedAt=null;this.carriedMs=0;
      if(snapshot && ['countdown','stopwatch'].includes(snapshot.mode) && ['idle','running','paused','finished'].includes(snapshot.status)
        && Number.isFinite(snapshot.durationMs) && snapshot.durationMs>=0 && snapshot.durationMs<=86400000
        && Number.isFinite(snapshot.carriedMs) && snapshot.carriedMs>=0 && snapshot.carriedMs<=604800000
        && (snapshot.startedAt===null||Number.isFinite(snapshot.startedAt)) && (snapshot.status!=='running'||Number.isFinite(snapshot.startedAt))){this.mode=snapshot.mode;this.durationMs=snapshot.durationMs;this.status=snapshot.status;this.startedAt=snapshot.startedAt;this.carriedMs=snapshot.carriedMs;}
    }
    start(seconds=60,mode='countdown',now=Date.now()){
      if(!Number.isFinite(seconds)||seconds<0||seconds>86400)throw Error('Invalid timer duration');
      if(!['countdown','stopwatch'].includes(mode))throw Error('Invalid timer mode');
      this.mode=mode;this.durationMs=Math.round(seconds*1000);this.carriedMs=0;this.startedAt=now;this.status='running';return this;
    }
    elapsed(now=Date.now()) {return this.carriedMs+(this.status==='running'?Math.max(0,now-this.startedAt):0);}
    remaining(now=Date.now()){return this.mode==='stopwatch'?this.elapsed(now):Math.max(0,this.durationMs-this.elapsed(now));}
    pause(now=Date.now()){if(this.status==='running'){this.carriedMs=this.elapsed(now);this.startedAt=null;this.status='paused';}return this;}
    resume(now=Date.now()){if(this.status==='paused'){this.startedAt=now;this.status='running';}return this;}
    tick(now=Date.now()){
      if(this.status==='running'&&this.mode==='countdown'&&this.elapsed(now)>=this.durationMs){
        this.carriedMs=this.durationMs;this.startedAt=null;this.status='finished';return true;
      }return false;
    }
    extend(seconds){if(!Number.isFinite(seconds)||this.mode!=='countdown')return;
      this.durationMs=Math.min(86400000,Math.max(1000,this.durationMs+seconds*1000));
      if(this.status==='finished'&&this.carriedMs<this.durationMs)this.status='paused';
    }
    snapshot(){return {mode:this.mode,durationMs:this.durationMs,status:this.status,startedAt:this.startedAt,carriedMs:this.carriedMs};}
  }
  function format(ms,roundUp=false){const v=Math.max(0,roundUp?Math.ceil(ms/1000):Math.floor(ms/1000));const h=Math.floor(v/3600);const m=Math.floor(v/60)%60,s=v%60;
    return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(Math.floor(v/60)).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
  return {Clock,format};
});
