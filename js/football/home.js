// Football Home tab (your teams, scores, playoff picture)
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
  const K=myN(), sf=NFL[K], a=NFLM.t[K], p=a.po/NFLM.n, seedNow=SEEDS[sf.conf].indexOf(K)+1;
  const seedMode=a.seed.indexOf(Math.max(...a.seed));
  const projW=(a.wins/NFLM.n);
  const next=MY_NSCHED.find(g=>!g.done&&new Date(g.t)>Date.now()-3.5*3600e3)||(K==='SF'?SF_SCHED[0]:null);
  const opp=next&&NFL[next.o];
  const nextTxt=next?`${next.loc==='away'?'@':'vs'} ${opp.n} · ${when(next.t,next.tba)}${next.tv?' · '+next.tv:''}`:'Regular season complete';
  const games=allGames('nfl').filter(g=>g.wk===(LIVE.nflWeek||'Week 10'));
  const conf=S.conf;
  const seedRows=SEEDS[conf].map((k,i)=>seedRow(i+1,k)).join('')+`<div class="hunt">In the hunt</div>`+SEEDS[conf+'_hunt'].map(k=>seedRow('',k)).join('');
  const heroMore=`<div class="between"><span>${rec(sf)} · ${ord(divRank(K))} in ${sf.conf} ${sf.div}</span><span class="gold">${seedNow?'#'+seedNow+' '+term('seed','seed')+' today':'Not seeded today'}</span></div>
    <div>${oddsTxt(sf.sb)} to win it all (${term('odds','American odds')}). Most likely finish: <b>${Math.round(projW)}–${17-Math.round(projW)}</b> and the <b>#${seedMode} seed</b>.</div>
    <div class="between"><span><span class="muted">Next</span> &nbsp;${esc(nextTxt)}</span>${next?'<button class="btn sm ghost" data-a="goBet">Bet it</button>':''}</div>
    <div class="stats">
      <div class="stat"><span class="eyebrow">Win division</span><b>${pct(a.div/NFLM.n)}</b></div>
      <div class="stat"><span class="eyebrow">#1 seed + ${term('bye','bye')}</span><b>${pct(a.s1/NFLM.n)}</b></div>
      <div class="stat"><span class="eyebrow">Proj. record</span><b>${Math.round(projW)}–${17-Math.round(projW)}</b></div>
    </div>`;
  const seedLine=seedNow?`If the season ended today, the ${esc(sf.n)} would be the #${seedNow} ${term('seed','seed')} in the ${sf.conf}${seedNow===1?` with a ${term('bye','bye')}`:seedNow>=5?` as a ${term('wildcard','wild card')}`:''}.`:`If the season ended today, the ${esc(sf.n)} would miss the playoffs.`;
  return `
  <div class="between" style="margin-bottom:18px">${leagueSeg()}<span class="small muted">${syncChip()}</span></div>
  ${card('nflHero',pct(p),playoffLine(p,'the '+esc(sf.n)),heroMore,{cls:'hero',style:`--hbg:${heroBg('nfl')}`,top:`<button class="eyebrow" style="color:rgba(255,255,255,.8)" data-a="teamSheet">${esc(sf.c)} ${esc(sf.n)} · playoff chance ›</button>`})}
  <div class="sechead"><h2>Scores</h2><span class="aside">${games[0]?games[0].wk:''}</span></div>
  ${gamesList('nflScores',games)}
  <div class="sechead"><h2>Playoff picture</h2></div>
  ${card('nflSeeds',seedNow?'#'+seedNow:'Out',seedLine,`<div class="seg" style="align-self:flex-start"><button data-a="conf" data-v="NFC" class="${conf==='NFC'?'on':''}">NFC</button><button data-a="conf" data-v="AFC" class="${conf==='AFC'?'on':''}">AFC</button></div>
    <div><div class="seedrow" style="padding:6px 4px;border:0"><span></span><span></span><span class="eyebrow">If it started today</span><span></span><span class="eyebrow" style="text-align:right">Chance</span></div><div class="seeds">${seedRows}</div></div>
    <p class="foot" style="margin:0">Seeds 1–4 win their division. 5–7 are ${term('wildcard','wild cards')}. Only the #1 seed gets a ${term('bye','bye')}.</p>`,{label:'Full playoff picture'})}
  <p class="foot">${LIVE.updated?'Scores and records live from ESPN':'Records through Thursday of Week 10'} · chances from 5,000 simulated seasons in-app.</p>`;
}
function seedRow(n,k){
  const t=NFL[k],p=nflP(k);
  return `<div class="seedrow ${k===myN()?'me':''}"><span class="n">${n}</span>${dotHTML({ab:k,col:t.col})}<span>${t.n} <span class="mono muted small">${rec(t)}</span></span><span class="pct">${pct(p)}</span><div class="bar"><i style="width:${p*100}%"></i></div></div>`;
}
function cfpField(list){
  // 5 highest-ranked conference champs (current leaders) + 7 at-large, seeded by rank
  const leaders={};list.forEach(t=>{if(t.cf!=='Ind'&&!leaders[t.cf])leaders[t.cf]=t;});
  const champs=Object.values(leaders).sort((a,b)=>a.r-b.r).slice(0,5);
  const field=new Set(champs);
  for(const t of list){if(field.size>=12)break;field.add(t);}
  return {field,seeded:[...field].sort((a,b)=>a.r-b.r)};
}
function cfpBracket(list,meName){
  const {field,seeded}=cfpField(list);
  const byes=seeded.slice(0,4), rest=seeded.slice(4);
  const pairs=[[0,7],[1,6],[2,5],[3,4]].map(([x,y])=>[rest[x],rest[y]]);
  const out=list.filter(t=>!field.has(t)).slice(0,2);
  return `<div class="byes">${byes.map((t,i)=>`<div class="bye"><b>#${i+1} · BYE</b>${esc(t.n)}</div>`).join('')}</div>
  <div class="eyebrow" style="margin:14px 2px 8px">First round · higher seed hosts</div>
  <div class="bracket">${pairs.map(([h,a])=>`<div class="bk ${(h.n===meName||a.n===meName)?'me':''}"><span><span class="s">${seeded.indexOf(a)+1}</span>${esc(a.n)}</span><span class="vs">AT</span><span class="r">${esc(h.n)}<span class="s" style="margin:0 0 0 6px">${seeded.indexOf(h)+1}</span></span></div>`).join('')}</div>
  <div class="small muted" style="margin:10px 2px 0">First teams out: ${out.map(t=>esc(t.n)).join(', ')}</div>`;
}
function homeCFB(){
  const byu=meC(), a=CFBM.t[byu.n], p=a.po/CFBM.n, projR=a.rank/CFBM.n, isByu=byu.ab==='BYU', tg=hasTitleGame();
  const games=allGames('cfb');
  const cw=LIVE.cfbWeek||11, today=games.filter(g=>g.wk==='Week '+cw), nextwk=games.filter(g=>g.wk==='Week '+(cw+1));
  // With live data, label each week by its busiest day; without it, keep the Nov 14 snapshot labels.
  const busiest=list=>{const n={};list.forEach(g=>{const k=new Date(g.t).toDateString();n[k]=(n[k]||0)+1;});const k=Object.keys(n).sort((x,y)=>n[y]-n[x])[0];return k?new Date(k):null;};
  const tDay=LIVE.cfbWeek&&busiest(today), nDay=LIVE.cfbWeek&&busiest(nextwk);
  const tHead=!tDay?'Tonight':tDay.toDateString()===new Date().toDateString()?'Tonight':'This week';
  const tAside=tDay?tDay.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}):'Sat, Nov 14';
  const nAside=nDay?nDay.toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Nov 21';
  const isB=g=>g.a.ab===byu.ab||g.h.ab===byu.ab, opp=g=>g.a.ab===byu.ab?g.h:g.a;
  const last=games.filter(g=>isB(g)&&g.s==='final').pop();
  const sub=isByu&&(!last||last.id==='c1')?'Beat Baylor 28–7 tonight · win over #5 Notre Dame':!last?byu.cf:(()=>{const me=last.a.ab===byu.ab?last.as:last.hs, them=last.a.ab===byu.ab?last.hs:last.as;return `${me>them?'Beat':me<them?'Lost to':'Tied'} ${opp(last).name} ${Math.max(me,them)}–${Math.min(me,them)}`;})();
  const nx=games.find(g=>isB(g)&&g.s!=='final');
  const nextTxt=nx?`${nx.h.ab===byu.ab?'vs':'@'} ${opp(nx).name} · ${new Date(nx.t).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}`:'Regular season complete';
  const heroMore=`<div class="between"><span>${rec(byu)} · ${esc(sub)}</span><span class="gold">${byu.unr?'Unranked':'#'+byu.r+' CFP'}</span></div>
    <div>Projected next ranking: <b>#${Math.max(1,Math.round(projR-.4))}–${Math.round(projR+.6)}</b>.${tg?` Winning the ${esc(byu.cf)} title is a guaranteed ticket in.`:''}</div>
    <div class="between"><span><span class="muted">Next</span> &nbsp;${esc(nextTxt)}</span>${nx?`<button class="btn sm ghost" data-a="goBet" data-g="${nx.id}">Bet it</button>`:''}</div>
    <div class="stats">
    ${tg?`<div class="stat"><span class="eyebrow">${esc(byu.cf)} title game</span><b>${pct(a.b12g/CFBM.n)}</b></div>
    <div class="stat"><span class="eyebrow">Win ${esc(byu.cf)}</span><b>${pct(a.b12w/CFBM.n)}</b></div>`:`<div class="stat"><span class="eyebrow">Proj. final rank</span><b>#${Math.round(projR)}</b></div>
    <div class="stat"><span class="eyebrow">Make the CFP</span><b>${pct(p)}</b></div>`}
    <div class="stat"><span class="eyebrow">First-round ${term('bye','bye')}</span><b>${pct(a.bye/CFBM.n)}</b></div>
    </div>`;
  const fs=cfpField(CFB).seeded.indexOf(byu)+1;
  const bLine=fs?`If the playoff were picked today, ${esc(byu.n)} would be the #${fs} ${term('seed','seed')}${fs<=4?` with a first-round ${term('bye','bye')}`:''}.`:`If the playoff were picked today, ${esc(byu.n)} would miss the 12-team field.`;
  return `
  <div class="between" style="margin-bottom:18px">${leagueSeg()}<span class="small muted">${syncChip()}</span></div>
  ${card('cfbHero',pct(p),playoffLine(p,isByu?'the Cougars':esc(byu.n),'the College Football Playoff'),heroMore,{cls:'hero',style:`--hbg:${heroBg('cfb')}`,top:`<button class="eyebrow" style="color:rgba(255,255,255,.8)" data-a="teamSheet">${esc(byu.n)} · playoff chance ›</button>`})}
  <div class="sechead"><h2>${tHead}</h2><span class="aside">${tAside}</span></div>
  ${gamesList('cfbNow',today)}
  <div class="sechead"><h2>If it ended today</h2><span class="aside">12-team CFP</span></div>
  ${card('cfbBracket',fs?'#'+fs:'Out',bLine,cfpBracket(CFB,byu.n)+`<p class="foot" style="margin:0">Five highest-ranked conference champions get in automatically, plus the next seven teams. Top four seeds get a ${term('bye','bye')}.</p>`,{label:'Full bracket'})}
  <div class="sechead"><h2>Next Saturday</h2><span class="aside">${nAside}</span></div>
  ${gamesList('cfbNext',nextwk)}
  <p class="foot">Rankings: CFP committee, Nov 10.${LIVE.updated?' Scores and records live from ESPN.':''} Chances from 5,000 simulated finishes in-app.</p>`;
}

