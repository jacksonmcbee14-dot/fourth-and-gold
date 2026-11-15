// Live layer: updates scores, records, seeds, rankings and futures results.

/* =========================================================
   LIVE LAYER
   In the Claude artifact, a shared live-scores feed called applyLive()
   whenever scores changed. There is no feed here yet, so the app shows the
   Nov 14 snapshot in js/football/data.js. To add a feed later, fetch the
   data in connect() and pass it to applyLive() in the same shape:
     { games:{id:{s,as,hs,clock,t}}, extra:[...], futures:{id:'won'|'lost'|'push'},
       updated:ISO time, records:{SF:{w,l,t}}, seeds:{NFC:[...],AFC:[...]},
       cfbRanks:[{n,r}] }
   ========================================================= */
function applyLive(d){
  d=d||{};
  LIVE.games=d.games||{}; LIVE.extra=Array.isArray(d.extra)?d.extra:[]; LIVE.futures=d.futures||{}; LIVE.updated=d.updated||null;
  if(d.records&&typeof d.records==='object'){ for(const k in d.records){ const r=d.records[k]; if(NFL[k]&&r){NFL[k].w=r.w;NFL[k].l=r.l;NFL[k].t=r.t||0;} const c=CFB.find(t=>t.ab===k); if(c&&r){c.w=r.w;c.l=r.l;} } }
  if(d.seeds&&d.seeds.NFC&&d.seeds.AFC) Object.assign(SEEDS,d.seeds);
  if(d.cfbRanks&&Array.isArray(d.cfbRanks)) d.cfbRanks.forEach(x=>{const c=CFB.find(t=>t.n===x.n);if(c){c.r=x.r;c.s=100-x.r*2.2;}});
  CFB.sort((a,b)=>a.r-b.r);
  baseModels(); NFLM_S=null; CFBM_S=null; settleBets(); if(!SLIP&&!RL.spinning&&!CR.rolling&&!SL.spinning&&BJ.phase!=='dealer'&&!(S.mode==='casino'&&S.ctab==='slots')) render(); else slipBar();
}
async function connect(){
  // No live feed connected yet. See the note above.
}
