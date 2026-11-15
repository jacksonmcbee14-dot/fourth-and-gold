// Football Predict tab (scenario lab)
/* ---------- Predict ---------- */
let simRunning=false;
function viewPredict(){return S.lg==='nfl'?predNFL():predCFB();}
function tri(name,i,v){return `<div class="tri">${['A','W','L'].map(x=>`<button class="${v===x?'on '+x:''}" data-a="${name}" data-i="${i}" data-v="${x}">${x==='A'?'Auto':x}</button>`).join('')}</div>`}
function predNFL(){
  const a=NFLM_S||NFLM;const t=a.t.SF,n=a.n,p=t.po/n;
  const mx=Math.max(...a.sfW.slice(7,18));
  return `
  <div class="between" style="margin-bottom:14px">${leagueSeg()}<span class="eyebrow">Scenario lab</span></div>
  <div class="panel pad">
    <div class="between"><div><div class="eyebrow">49ers make the playoffs</div><div class="big" id="bigp">${pct(p).replace('%','')}<small>%</small></div></div>${ring(t.div/n,'Division',88,7)}</div>
    <div class="dist">${a.sfW.slice(7,18).map((c,i)=>`<div class="${i+7>=11?'ok':''}" style="height:${Math.max(2,c/mx*100)}%"></div>`).join('')}</div>
    <div class="distl">${a.sfW.slice(7,18).map((c,i)=>`<span>${i+7}</span>`).join('')}</div>
    <div class="small muted" style="margin-top:6px">How many games they finish with — green bars are almost always a playoff spot.</div>
    <div class="stats" style="margin-top:12px">
      <div class="stat"><span class="eyebrow">#1 seed</span><b>${pct(t.s1/n)}</b></div>
      <div class="stat"><span class="eyebrow">Avg wins</span><b>${(t.wins/n).toFixed(1)}</b></div>
      <div class="stat"><span class="eyebrow">Home game</span><b>${pct(t.div/n)}</b></div>
    </div>
    <div class="simbar"><i id="simfill"></i></div><div class="counter" id="simcount"></div>
    <div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="btn gold" data-a="runSim" style="flex:1">Run 10,000 seasons</button><button class="btn sm" data-a="sfAll" data-v="W">Win out</button><button class="btn sm" data-a="sfAll" data-v="L">Lose out</button><button class="btn sm" data-a="sfAll" data-v="A">Reset</button></div>
  </div>
  <div class="sechead"><h2>Call the games</h2><span class="aside">Tap W or L</span></div>
  <div class="chiprow">${SF_SCHED.map((g,i)=>{const o=NFL[g.o];const f=S.sfF[i];return `<div class="pg ${f}"><div class="row">${dotHTML({ab:g.o,col:o.col})}<div><div style="font-weight:600">${g.loc==='away'?'@ ':g.loc==='neutral'?'vs ':'vs '}${o.n}</div><div class="meta">Wk ${g.wk} · ${new Date(g.t).toLocaleDateString('en-US',{month:'short',day:'numeric'})}${g.loc==='neutral'?' · '+g.venue:''} · <span class="gold">${Math.round(g.p*100)}% to win</span></div></div></div>${tri('sfF',i,f)}</div>`}).join('')}</div>
  <div class="sechead"><h2>Bracket today</h2><div class="seg"><button data-a="conf" data-v="NFC" class="${S.conf==='NFC'?'on':''}">NFC</button><button data-a="conf" data-v="AFC" class="${S.conf==='AFC'?'on':''}">AFC</button></div></div>
  ${nflBracket(S.conf)}
  <p class="foot">The model rates each team from its record and the Super Bowl market, gives home teams a small edge, then plays out the rest of the season thousands of times. It's an estimate for fun, not a guarantee.</p>`;
}
function nflBracket(conf){
  const s=SEEDS[conf];
  const nm=k=>NFL[k].n;
  return `<div class="byes" style="grid-template-columns:1fr"><div class="bye ${s[0]==='SF'?'':''}" style="text-align:left;display:flex;justify-content:space-between;align-items:center"><span><b style="display:inline">#1 · BYE</b> &nbsp;${nm(s[0])}</span><span class="small muted">Skips Wild Card weekend</span></div></div>
  <div class="bracket" style="margin-top:8px">${[[1,6],[2,5],[3,4]].map(([h,a])=>`<div class="bk ${(s[h]==='SF'||s[a]==='SF')?'me':''}"><span><span class="s">${a+1}</span>${nm(s[a])}</span><span class="vs">AT</span><span class="r">${nm(s[h])}<span class="s" style="margin:0 0 0 6px">${h+1}</span></span></div>`).join('')}</div>`;
}
function predCFB(){
  const a=CFBM_S||CFBM, t=a.t.BYU, n=a.n, p=t.po/n;
  const b12=[['auto','Auto'],['win','Win it'],['lose','Lose it'],['miss','Miss it']];
  return `
  <div class="between" style="margin-bottom:14px">${leagueSeg()}<span class="eyebrow">Scenario lab</span></div>
  <div class="panel pad">
    <div class="between"><div><div class="eyebrow">BYU makes the CFP</div><div class="big" id="bigp">${pct(p).replace('%','')}<small>%</small></div></div>${ring(t.b12w/n,'Big 12',88,7)}</div>
    <div class="stats" style="margin-top:12px">
      <div class="stat"><span class="eyebrow">Proj. final rank</span><b>#${Math.round(t.rank/n)}</b></div>
      <div class="stat"><span class="eyebrow">Title game</span><b>${pct(t.b12g/n)}</b></div>
      <div class="stat"><span class="eyebrow">Top-4 bye</span><b>${pct(t.bye/n)}</b></div>
    </div>
    <div class="simbar"><i id="simfill"></i></div><div class="counter" id="simcount"></div>
    <div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="btn gold" data-a="runSim" style="flex:1">Run 10,000 seasons</button><button class="btn sm" data-a="byuAll" data-v="W">Win out</button><button class="btn sm" data-a="byuAll" data-v="A">Reset</button></div>
  </div>
  <div class="sechead"><h2>Call the games</h2><span class="aside">Regular season</span></div>
  <div class="chiprow">${BYU_SCHED.map((g,i)=>`<div class="pg ${S.byuF[i]}"><div class="row">${dotHTML({ab:g.ab,col:g.col})}<div><div style="font-weight:600">${g.loc==='away'?'@ ':'vs '}${g.o}</div><div class="meta">${new Date(g.t).toLocaleDateString('en-US',{month:'short',day:'numeric'})} · <span class="gold">${Math.round(g.p*100)}% to win</span></div></div></div>${tri('byuF',i,S.byuF[i])}</div>`).join('')}</div>
  <div class="sechead"><h2>Big 12 Championship</h2><span class="aside">Fri, Dec 4 · Arlington</span></div>
  <div class="seg" style="display:grid;grid-template-columns:repeat(4,1fr)">${b12.map(([v,l])=>`<button data-a="b12" data-v="${v}" class="${S.b12===v?'on':''}">${l}</button>`).join('')}</div>
  <div class="sechead"><h2>Help from rivals</h2><span class="aside">Chaos switches</span></div>
  <div class="toggle" data-a="tog" data-v="utahL"><div><div style="font-weight:600">Utah loses another game</div><div class="small muted">Opens the Big 12 title race</div></div><span class="sw ${S.utahL?'on':''}"></span></div>
  <div class="toggle" data-a="tog" data-v="ttuL"><div><div style="font-weight:600">Texas Tech loses another game</div><div class="small muted">Clears BYU's path to Arlington</div></div><span class="sw ${S.ttuL?'on':''}"></span></div>
  <p class="foot">Simple version: win and you climb, lose and you drop about five spots, conference champs get a bump. The committee is human, so treat this as a smart guess.</p>`;
}
let NFLM_S=null, CFBM_S=null;
function quickResim(){
  if(S.lg==='nfl') NFLM_S=nflRun(nflAgg(),3000,S.sfF);
  else CFBM_S=cfbRun(cfbAgg(),3000,{g:S.byuF,b12:S.b12,utahL:S.utahL,ttuL:S.ttuL});
}
function runSim(){
  if(simRunning)return; simRunning=true;
  const N=10000, chunk=500; const agg=S.lg==='nfl'?nflAgg():cfbAgg(); let done=0;
  const step=()=>{
    if(S.lg==='nfl') nflRun(agg,chunk,S.sfF); else cfbRun(agg,chunk,{g:S.byuF,b12:S.b12,utahL:S.utahL,ttuL:S.ttuL});
    done+=chunk;
    const f=$('#simfill'),c=$('#simcount'),b=$('#bigp');
    const tt=S.lg==='nfl'?agg.t.SF:agg.t.BYU;
    if(f)f.style.width=(done/N*100)+'%';
    if(c)c.textContent='Simulating season '+done.toLocaleString()+' of '+N.toLocaleString();
    if(b)b.innerHTML=pct(tt.po/agg.n).replace('%','')+'<small>%</small>';
    if(done<N) requestAnimationFrame(step);
    else{ simRunning=false; if(S.lg==='nfl')NFLM_S=agg; else CFBM_S=agg; render(); const c2=$('#simcount'); if(c2)c2.textContent='10,000 seasons played'; toast('10,000 seasons simulated','gold'); }
  };
  requestAnimationFrame(step);
}

