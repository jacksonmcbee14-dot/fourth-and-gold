// Game list with live-score overrides, score rows, sync label
/* =========================================================
   GAMES + LIVE OVERRIDES
   ========================================================= */
function allGames(lg){
  const base=[...GAMES,...(LIVE.extra||[])].filter(g=>!lg||g.lg===lg);
  const now=Date.now();
  return base.map(g0=>{
    const g=Object.assign({},g0), o=LIVE.games[g.id];
    if(o){ if(o.s)g.s=o.s; if(o.as!=null)g.as=o.as; if(o.hs!=null)g.hs=o.hs; if(o.clock)g.clock=o.clock; if(o.q)g.q=o.q; if(o.t)g.t=o.t; if(o.tba!=null)g.tba=o.tba; }
    if(!g.s){ const k=new Date(g.t).getTime(); g.s = g.tba? 'pre' : now<k ? 'pre' : now<k+3.6*3600e3 ? 'inprog' : 'await'; }
    return g;
  }).sort((a,b)=>new Date(a.t)-new Date(b.t));
}
function gameRow(g){
  const fin=g.s==='final', live=g.s==='live';
  const aw=fin&&g.as>g.hs, hw=fin&&g.hs>g.as;
  const sc=(v)=> (fin||live)&&v!=null?v:'';
  let left='', right='';
  if(fin){left='<b style="color:var(--text)">Final</b>'; right=g.tv||'';}
  else if(live){left=`<span class="livebadge">LIVE</span>${g.clock?' · '+esc(g.clock):''}`; right=g.tv||'';}
  else if(g.s==='inprog'){left=`<span class="livebadge">IN PROGRESS</span>`; right='Score syncing';}
  else if(g.s==='await'){left='Played'; right='Final score syncing';}
  else {left=when(g.t,g.tba); right=(g.neutral?g.neutral+' · ':'')+(g.tv||'');}
  const rk=t=>t.rank?`<span class="rk">${t.rank}</span>`:'';
  return `<div class="game ${g.mine?'mine':''}">
    <div class="tm ${hw?'lose':''}">${dotHTML(g.a)}${rk(g.a)}<span class="nm">${esc(g.a.name)}</span></div><div class="sc">${sc(g.as)}</div>
    <div class="tm ${aw?'lose':''}">${dotHTML(g.h)}${rk(g.h)}<span class="nm">${esc(g.h.name)}</span></div><div class="sc">${sc(g.hs)}</div>
    <div class="gstatus"><span>${left}</span><span>${esc(right)}</span></div></div>`;
}
function syncChip(){
  if(LIVE.updated){const m=Math.round((Date.now()-new Date(LIVE.updated))/60000);return `<span class="sync ${m>90?'stale':''}"><i></i>Synced ${m<1?'just now':m<60?m+'m ago':Math.round(m/60)+'h ago'}</span>`;}
  return `<span class="sync stale"><i></i>Snapshot · Nov 14</span>`;
}

