// Football Home tab (49ers / BYU, scores, playoff picture)
/* =========================================================
   VIEWS — FOOTBALL
   ========================================================= */
function leagueSeg(){return `<div class="seg"><button data-a="lg" data-v="nfl" class="${S.lg==='nfl'?'on':''}">NFL</button><button data-a="lg" data-v="cfb" class="${S.lg==='cfb'?'on':''}">College</button></div>`}
function plain(p,team,extra){
  if(p>=.95) return `<b>Basically a lock.</b> ${team} would have to collapse to miss. ${extra}`;
  if(p>=.75) return `<b>In great shape.</b> Keep winning and ${team} are in. ${extra}`;
  if(p>=.5) return `<b>Better than a coin flip.</b> ${team} control a lot, but every game matters. ${extra}`;
  if(p>=.25) return `<b>On the bubble.</b> ${team} need wins and a little help. ${extra}`;
  return `<b>Long shot.</b> ${team} need to win out and get lucky. ${extra}`;
}
function viewHome(){
  return S.lg==='nfl'?homeNFL():homeCFB();
}
function homeNFL(){
  const sf=NFL.SF, a=NFLM.t.SF, p=a.po/NFLM.n;
  const seedMode=a.seed.indexOf(Math.max(...a.seed));
  const projW=(a.wins/NFLM.n);
  const next=SF_SCHED.find(g=>new Date(g.t)>Date.now()-3.5*3600e3)||SF_SCHED[0];
  const opp=NFL[next.o];
  const nextTxt=`${next.loc==='away'?'@':'vs'} ${opp.n} · ${when(next.t,next.tba)}${next.tv?' · '+next.tv:''}`;
  const games=allGames('nfl').filter(g=>g.wk==='Week 10');
  const conf=S.conf;
  const seedRows=SEEDS[conf].map((k,i)=>seedRow(i+1,k)).join('')+`<div class="hunt">In the hunt</div>`+SEEDS[conf+'_hunt'].map(k=>seedRow('',k)).join('');
  return `
  <div class="between" style="margin-bottom:14px">${leagueSeg()}<span class="small muted">${syncChip()}</span></div>
  <section class="hero" style="--hbg:radial-gradient(120% 90% at 100% 0%,#d03030 0%,#8c0b0b 38%,#3a0606 75%,#1a0404 100%)">
    <div class="top2"><span class="eyebrow" style="color:rgba(255,255,255,.75)">Your team · NFC West</span><span class="tag gold">#${SEEDS.NFC.indexOf('SF')+1} seed today</span></div>
    <div class="mainrow"><div><h1>49ers</h1><div class="rec">${rec(sf)}</div><div class="sub">1st in NFC West · ${oddsTxt(sf.sb)} to win it all</div></div>${ring(p,'Playoffs')}</div>
    <div class="plain">${plain(p,'the 49ers',`Most likely finish: <b>${Math.round(projW)}–${17-Math.round(projW)}</b> and the <b>#${seedMode} seed</b>.`)}</div>
    <div class="next"><span><span class="muted">Next</span> &nbsp;${esc(nextTxt)}</span><button class="btn sm ghost" data-a="goBet" data-g="n12">Bet it</button></div>
  </section>
  <div class="stats">
    <div class="stat"><span class="eyebrow">Win division</span><b>${pct(a.div/NFLM.n)}</b></div>
    <div class="stat"><span class="eyebrow">#1 seed + bye</span><b>${pct(a.s1/NFLM.n)}</b></div>
    <div class="stat"><span class="eyebrow">Proj. record</span><b>${Math.round(projW)}–${17-Math.round(projW)}</b></div>
  </div>
  <div class="sechead"><h2>Scores</h2><span class="aside">${games[0]?games[0].wk:''}</span></div>
  <div class="games">${(S.allScores?games:[...games.filter(g=>g.mine),...games.filter(g=>!g.mine).slice(0,4)]).map(gameRow).join('')}</div>
  ${games.length>5?`<button class="btn" style="width:100%;margin-top:8px" data-a="allScores">${S.allScores?'Show fewer':'Show all '+games.length+' games'}</button>`:''}
  <div class="sechead"><h2>Playoff picture</h2><div class="seg"><button data-a="conf" data-v="NFC" class="${conf==='NFC'?'on':''}">NFC</button><button data-a="conf" data-v="AFC" class="${conf==='AFC'?'on':''}">AFC</button></div></div>
  <div class="panel" style="padding:6px 10px"><div class="seedrow" style="padding:6px 4px;border:0"><span></span><span></span><span class="eyebrow">If it started today</span><span></span><span class="eyebrow" style="text-align:right">Chance</span></div><div class="seeds">${seedRows}</div></div>
  <p class="foot">Seeds 1–4 win their division. 5–7 are wild cards. Only the #1 seed skips the first round.<br>Records through Thursday of Week 10 · chances from 5,000 simulated seasons in-app.</p>`;
}
function seedRow(n,k){
  const t=NFL[k],p=nflP(k);
  return `<div class="seedrow ${k==='SF'?'me':''}"><span class="n">${n}</span>${dotHTML({ab:k,col:t.col})}<span>${t.n} <span class="mono muted small">${rec(t)}</span></span><span class="pct">${pct(p)}</span><div class="bar"><i style="width:${p*100}%"></i></div></div>`;
}
function cfpBracket(list,meName){
  // 5 highest-ranked conference champs (current leaders) + 7 at-large, seeded by rank
  const leaders={};list.forEach(t=>{if(t.cf!=='Ind'&&!leaders[t.cf])leaders[t.cf]=t;});
  const champs=Object.values(leaders).sort((a,b)=>a.r-b.r).slice(0,5);
  const field=new Set(champs);
  for(const t of list){if(field.size>=12)break;field.add(t);}
  const seeded=[...field].sort((a,b)=>a.r-b.r);
  const byes=seeded.slice(0,4), rest=seeded.slice(4);
  const pairs=[[0,7],[1,6],[2,5],[3,4]].map(([x,y])=>[rest[x],rest[y]]);
  const out=list.filter(t=>!field.has(t)).slice(0,2);
  return `<div class="byes">${byes.map((t,i)=>`<div class="bye"><b>#${i+1} · BYE</b>${esc(t.n)}</div>`).join('')}</div>
  <div class="eyebrow" style="margin:14px 2px 8px">First round · higher seed hosts</div>
  <div class="bracket">${pairs.map(([h,a])=>`<div class="bk ${(h.n===meName||a.n===meName)?'me':''}"><span><span class="s">${seeded.indexOf(a)+1}</span>${esc(a.n)}</span><span class="vs">AT</span><span class="r">${esc(h.n)}<span class="s" style="margin:0 0 0 6px">${seeded.indexOf(h)+1}</span></span></div>`).join('')}</div>
  <div class="small muted" style="margin:10px 2px 0">First teams out: ${out.map(t=>esc(t.n)).join(', ')}</div>`;
}
function homeCFB(){
  const byu=CFB.find(t=>t.me), a=CFBM.t.BYU, p=a.po/CFBM.n, projR=a.rank/CFBM.n;
  const games=allGames('cfb');
  const today=games.filter(g=>g.wk==='Week 11'), nextwk=games.filter(g=>g.wk==='Week 12');
  return `
  <div class="between" style="margin-bottom:14px">${leagueSeg()}<span class="small muted">${syncChip()}</span></div>
  <section class="hero" style="--hbg:radial-gradient(120% 90% at 100% 0%,#2e6bb5 0%,#0b3b78 35%,#06213f 75%,#030f1e 100%)">
    <div class="top2"><span class="eyebrow" style="color:rgba(255,255,255,.75)">Your team · Big 12</span><span class="tag gold">#${byu.r} CFP</span></div>
    <div class="mainrow"><div><h1>BYU</h1><div class="rec">${rec(byu)}</div><div class="sub">Beat Baylor 28–7 tonight · win over #5 Notre Dame</div></div>${ring(p,'Playoff')}</div>
    <div class="plain">${plain(p,'the Cougars',`Projected next ranking: <b>#${Math.max(1,Math.round(projR-.4))}–${Math.round(projR+.6)}</b>. Winning the Big 12 title is a guaranteed ticket in.`)}</div>
    <div class="next"><span><span class="muted">Next</span> &nbsp;@ Kansas · Sat, Nov 21</span><button class="btn sm ghost" data-a="goBet" data-g="c6">Bet it</button></div>
  </section>
  <div class="stats">
    <div class="stat"><span class="eyebrow">Big 12 title game</span><b>${pct(a.b12g/CFBM.n)}</b></div>
    <div class="stat"><span class="eyebrow">Win Big 12</span><b>${pct(a.b12w/CFBM.n)}</b></div>
    <div class="stat"><span class="eyebrow">First-round bye</span><b>${pct(a.bye/CFBM.n)}</b></div>
  </div>
  <div class="sechead"><h2>Tonight</h2><span class="aside">Sat, Nov 14</span></div>
  <div class="games">${today.map(gameRow).join('')}</div>
  <div class="sechead"><h2>If it ended today</h2><span class="aside">12-team CFP</span></div>
  ${cfpBracket(CFB,'BYU')}
  <div class="sechead"><h2>Next Saturday</h2><span class="aside">Nov 21</span></div>
  <div class="games">${nextwk.map(gameRow).join('')}</div>
  <p class="foot">Five highest-ranked conference champions get in automatically, plus the next seven teams. Top four seeds skip round one.<br>Rankings: CFP committee, Nov 10. Chances from 5,000 simulated finishes in-app.</p>`;
}

