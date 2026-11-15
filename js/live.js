// Live layer (scores feed and account sync)
/* =========================================================
   LIVE LAYER (shared score store) + per-person wallet
   ========================================================= */
async function connect(){
  if(!window.claude||!window.claude.use) return;
  try{
    DB=await window.claude.use('db');
    if(!DB) return;
    DB.doc('live/scores').onSnapshot(snap=>{
      if(!snap.exists) return;
      const d=snap.data()||{};
      LIVE.games=d.games||{}; LIVE.extra=Array.isArray(d.extra)?d.extra:[]; LIVE.futures=d.futures||{}; LIVE.updated=d.updated||null;
      if(d.records&&typeof d.records==='object'){ for(const k in d.records){ const r=d.records[k]; if(NFL[k]&&r){NFL[k].w=r.w;NFL[k].l=r.l;NFL[k].t=r.t||0;} const c=CFB.find(t=>t.ab===k); if(c&&r){c.w=r.w;c.l=r.l;} } }
      if(d.seeds&&d.seeds.NFC&&d.seeds.AFC) Object.assign(SEEDS,d.seeds);
      if(d.cfbRanks&&Array.isArray(d.cfbRanks)) d.cfbRanks.forEach(x=>{const c=CFB.find(t=>t.n===x.n);if(c){c.r=x.r;c.s=100-x.r*2.2;}});
      CFB.sort((a,b)=>a.r-b.r);
      baseModels(); NFLM_S=null; CFBM_S=null; settleBets(); if(!SLIP&&!RL.spinning&&!CR.rolling&&!SL.spinning&&BJ.phase!=='dealer'&&!(S.mode==='casino'&&S.ctab==='slots')) render(); else slipBar();
    },()=>{});
    const user=await window.claude.use('user');
    if(user){ UID=await user.id(); }
    if(UID){
      const w=await DB.doc('data/users/'+UID+'/wallet').get();
      if(w.exists){const d=w.data();if(d&&d.upd>(S.upd||0)){try{S=Object.assign(S,JSON.parse(d.s));try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}render();}catch(e){}}}
    }
  }catch(e){}
}

