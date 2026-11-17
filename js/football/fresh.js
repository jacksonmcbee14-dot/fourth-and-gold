// ✨ Fresh, tap-first versions of Season, Predict, Ranks and League (same data and actions, far fewer words).
// The simulator, W/L pickers, brackets and league actions are all reused; only the layout changes.

const fx$=(t)=>`<span class="gd-badge" style="--c:${t.col||'#3a2b1f'}">${esc(String(t.ab||'').slice(0,4))}</span>`;
function lgChips(){ return `<div class="gd-lg">${[['nfl','🏈 NFL'],['cfb','🎓 College']].map(([v,l])=>`<button data-a="lg" data-v="${v}" class="${S.lg===v?'on':''}">${l}</button>`).join('')}<span class="fr-sync">${typeof syncChip==='function'?syncChip():''}</span></div>`; }
function frTiles(games,n){ if(!games.length) return '<div class="gd-empty">😴 No games</div>';
  return `<div class="fr-tiles">${games.slice(0,n||12).map((g,i)=>{ const live=g.s==='live', fin=g.s==='final', sc=g.as!=null&&(live||fin), aw=fin&&g.as>g.hs, hw=fin&&g.hs>g.as;
    return `<button class="fr-tile ${g.mine?'mine':''} ${live?'live':''}" style="--d:${i*30}ms" ${betable(g)?`data-a="qb" data-g="${g.id}" data-s="h"`:''}>
      <span class="${aw?'w':''}">${fx$(g.a)}<b>${esc(g.a.name)}</b>${sc?`<em>${g.as}</em>`:''}</span><span class="${hw?'w':''}">${fx$(g.h)}<b>${esc(g.h.name)}</b>${sc?`<em>${g.hs}</em>`:''}</span>
      <small>${live?'<i class="livebadge">LIVE</i> '+esc(g.clock||''):fin?'FINAL':esc(String(when(g.t,g.tba)).replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s*/,''))}</small></button>`; }).join('')}</div>`; }
function frHero(team,p,label,chips,extra){ return `<section class="gd-hero fr-hero" style="--a:${team.col||'#7a1a20'};--b:#120a06"><button class="fr-hero-t" data-a="teamSheet">${fx$(team)}<b>${esc(team.n||team.name)}</b><span>›</span></button>
  <div class="fr-ring">${ring(p,label,120,10,'#ffd84a')}</div><div class="gd-chips fr-c">${chips.filter(Boolean).map(c=>`<span class="gd-chip">${c}</span>`).join('')}</div>${extra||''}</section>`; }

/* ---------- Season ---------- */
viewHome=function(){ return `<div class="gd">${lgChips()}${S.lg==='nfl'?frSeasonNFL():frSeasonCFB()}</div>`; };
function frSeasonNFL(){ const K=myN(), sf=NFL[K], a=NFLM.t[K], n=NFLM.n, p=a.po/n, seed=SEEDS[sf.conf].indexOf(K)+1, w=Math.round(a.wins/n);
  const games=allGames('nfl').filter(g=>g.wk===(LIVE.nflWeek||'Week 10')), conf=S.conf||sf.conf;
  const seeds=SEEDS[conf].map((k,i)=>frSeedRow(i+1,k)).join('')+`<div class="fr-hunt">👀 In the hunt</div>`+SEEDS[conf+'_hunt'].map(k=>frSeedRow('',k)).join('');
  return frHero({...sf,ab:K},p,'🏆 PLAYOFFS',[`📋 ${rec(sf)}`,seed?`🎯 #${seed} seed`:'❌ Out today',`📈 ${w}–${17-w}`,`👑 ${pct(a.div/n)} div`,`🥇 ${pct(a.s1/n)} #1`,`🏆 ${oddsTxt(sf.sb)} SB`],`<button class="gd-go" data-a="goBet">🔥 Bet the ${esc(sf.n)}</button>`)
    +`<div class="gd-h">🏈 ${esc(games[0]?games[0].wk:'This week')}</div>${frTiles(games)}
    <div class="gd-h">🎯 Playoff picture</div><div class="gd-lg fr-2">${['NFC','AFC'].map(c=>`<button data-a="conf" data-v="${c}" class="${conf===c?'on':''}">${c}</button>`).join('')}</div><div class="fr-seeds">${seeds}</div>`; }
function frSeedRow(n,k){ const t=NFL[k], p=nflP(k); return `<div class="fr-seed ${k===myN()?'me':''}"><span class="fr-n ${n===1?'bye':''}">${n||'·'}</span>${fx$({ab:k,col:t.col})}<b>${esc(t.n)}</b><i><u style="width:${Math.round(p*100)}%;background:${t.col}"></u></i><em>${pct(p)}</em></div>`; }
function frSeasonCFB(){ const me=meC(), a=CFBM.t[me.n], n=CFBM.n, p=a.po/n, tg=hasTitleGame(), games=allGames('cfb'), cw=LIVE.cfbWeek||11;
  const now=games.filter(g=>g.wk==='Week '+cw), next=games.filter(g=>g.wk==='Week '+(cw+1)), F=cfpField(CFB).seeded, fs=F.indexOf(me)+1;
  return frHero(me,p,'🏆 CFP',[`📋 ${rec(me)}`,me.unr?'NR':`🎯 #${me.r}`,`📈 #${Math.round(a.rank/n)} proj`,fs?`🎟️ #${fs} seed`:'❌ Out today',`😴 ${pct(a.bye/n)} bye`,tg?`👑 ${pct(a.b12w/n)} ${esc(me.cf)}`:''],`<button class="gd-go" data-a="goBet">🔥 Bet ${esc(me.n)}</button>`)
    +`<div class="gd-h">🏈 This week</div>${frTiles(now)}<div class="gd-h">🎟️ If it ended today</div>
    <div class="fr-cfp">${F.map((t,i)=>`<div class="fr-cf ${t===me?'me':''} ${i<4?'bye':''}" style="--d:${i*30}ms"><span>${i+1}</span>${fx$(t)}<b>${esc(t.n)}</b>${i<4?'<em>BYE</em>':''}</div>`).join('')}</div>
    <div class="gd-h">📅 Next Saturday</div>${frTiles(next,8)}`; }

/* ---------- Predict (the simulator and pickers are reused) ---------- */
const _viewPredictF=viewPredict;
viewPredict=function(){ const tpl=document.createElement('template'); tpl.innerHTML=_viewPredictF(); const T=tpl.content, nfl=S.lg==='nfl';
  const team=nfl?{...NFL[myN()],ab:myN()}:meC(), M=nfl?(NFLM_S||NFLM):(CFBM_S||CFBM), t=M.t[nfl?myN():meC().n], p=t.po/M.n;
  const take=sel=>{ const e=T.querySelector(sel); return e?e.outerHTML:''; };
  const btns=[...T.querySelectorAll('[data-a=runSim],[data-a=sfAll],[data-a=byuAll],[data-a=sfReset]')].map(b=>b.outerHTML).join('');
  const chiprow=take('.chiprow'), extras=[...T.querySelectorAll('[data-a=b12]')].length?take('.seg [data-a=b12]')&&T.querySelector('[data-a=b12]').parentElement.outerHTML:'';
  const toggles=[...T.querySelectorAll('.toggle')].map(e=>e.outerHTML).join('');
  const bracket=T.querySelector('.bracket')?T.querySelector('.bracket').closest('.card,section'):null;
  return `<div class="gd">${lgChips()}<section class="gd-hero fr-hero" style="--a:${team.col||'#7a1a20'};--b:#120a06"><div class="fr-hero-t">${fx$(team)}<b>${esc(team.n)}</b></div>
    <div class="fr-big"><span id="bigp">${pct(p).replace('%','')}<small>%</small></span><small>${nfl?'🏆 MAKE THE PLAYOFFS':'🏆 MAKE THE CFP'}</small></div>
    <div class="simbar"><i id="simfill"></i></div><div class="counter" id="simcount"></div><div class="fr-btns">${btns.replace(/Run 10,000 seasons/,'🎲 Simulate 10,000')}</div></section>
    <div class="gd-h">🔮 Call the games <small>tap W or L</small></div>${chiprow}
    ${extras?`<div class="gd-h">👑 Title game</div>${extras}`:''}${toggles?`<div class="gd-h">🌪️ Chaos</div>${toggles}`:''}
    ${bracket?`<div class="gd-h">🎯 Bracket today</div>${bracket.outerHTML}`:''}</div>`; };

/* ---------- Ranks ---------- */
viewRanks=function(){ const {net,football,casino}=plSplit(), inCasino=S.mode==='casino', si=statusFor(net), nx=STATUS[si+1], prog=nx?clamp((net-STATUS[si][0])/(nx[0]-STATUS[si][0]),0,1):1;
  const status=`<section class="fr-status"><div><small>YOUR STATUS</small><b>${esc(STATUS[si][1])}</b></div><em>${bank$(net)}</em>
    <i><u style="width:${prog*100}%"></u></i><div class="gd-chips"><span class="gd-chip">🎰 ${signed$(casino)}</span><span class="gd-chip">🏈 ${signed$(football)}</span><span class="gd-chip">🎟️ ${S.picks.w}–${S.picks.l}</span>${nx?`<span class="gd-chip hot">⬆️ ${esc(nx[1])} in ${bank$(nx[0]-net)}</span>`:''}</div></section>`;
  let list='';
  if(!inCasino){ if(S.lg==='nfl'){ const elos=KEYS.map(k=>NFL[k].elo), lo=Math.min(...elos), hi=Math.max(...elos);
      list=KEYS.map(k=>({k,t:NFL[k],sc:Math.round(40+59*(NFL[k].elo-lo)/(hi-lo)),p:nflP(k)})).sort((a,b)=>b.sc-a.sc||b.p-a.p).map((o,i)=>frRank(i+1,{ab:o.k,col:o.t.col},o.t.n,rec(o.t),o.sc,o.sc>=94?0:o.sc>=80?1:o.sc>=62?2:3,o.k===myN(),i));
    } else list=CFB.map((t,i)=>{ const a=CFBM.t[t.n], p=a.po/CFBM.n, mv=Math.round(t.r-a.rank/CFBM.n); return frRank(t.unr?'NR':t.r,t,t.n+(mv>0?' ▲'+mv:mv<0?' ▼'+(-mv):''),rec(t),pct(p),p>=.85?0:p>=.45?1:p>=.12?2:3,t.me,i); });
    const all=uiState().all.ranks; list=`<div class="gd-h">${S.lg==='nfl'?'⚡ Power ratings':'🏆 CFP Top 25'}</div><div class="fr-ranks">${(all?list:list.slice(0,10)).join('')}</div>${all?'':'<button class="gd-more" data-a="frAllRanks">Show all ›</button>'}`; }
  return `<div class="gd">${inCasino?'':lgChips()}${status}${typeof boardSection==='function'?boardSection(10):''}${list}</div>`; };
const FR_TIER=['👑','🔥','🫧','🎲'];
function frRank(no,t,name,sub,score,tier,me,i){ return `<div class="fr-rank ${me?'me':''} t${tier}" style="--d:${Math.min(i,15)*25}ms"><span class="fr-n">${no}</span>${fx$(t)}<b>${esc(name)}<small>${FR_TIER[tier]} ${esc(sub)}</small></b><em>${score}</em></div>`; }
ACT.frAllRanks=()=>{ uiState().all.ranks=1; save(); render(); };

/* ---------- League ---------- */
const _viewLeagueF=viewLeague;
viewLeague=function(){
  if(!socOn()||!SOC.me) return _viewLeagueF();
  const L=SOC.me.leagues||[];
  if(!L.length) return (typeof dailyCard==='function'?dailyCard():'')+`<div class="gd"><section class="fr-start"><div class="fr-trophy">🏆</div><b>Start a league</b>
      <div class="gd-chips"><span class="gd-chip">💸 Every win counts</span><span class="gd-chip">⚔️ Challenge friends</span><span class="gd-chip">🎁 Weekly prize</span></div>
      <button class="gd-go" data-a="lgCreate">✨ Create a league</button><button class="gd-more" data-a="lgJoin">🔑 Join with a code</button></section></div>`;
  const cur=socLeague(), V=LV.view[cur.id]; loadLeague(cur.id); const prize=ITEM[cur.prize];
  let h=(typeof dailyCard==='function'?dailyCard():'')+`<div class="gd"><div class="gd-scroll fr-lgs">${L.map(l=>`<button class="gd-chip ${l.id===cur.id?'hot':''}" data-a="lgPick" data-v="${l.id}">${esc(l.icon)} ${esc(l.name)}</button>`).join('')}<button class="gd-chip" data-a="lgMore">＋</button></div>
    <section class="fr-lg"><div class="fr-lg-top"><span class="fr-lg-ic">${esc(cur.icon)}</span><div><b>${esc(cur.name)}</b><small>👥 ${cur.members} · 🔑 <span class="mono">${esc(cur.code)}</span></small></div></div>
      <div class="fr-prize">${prizeIcon(cur.prize,3)}<div><small>🏆 THIS WEEK’S PRIZE</small><b>${esc(prize?prize.name:'A league prize')}</b><small>⏳ ${weekLeft()}</small></div></div>
      <div class="gd-chips"><span class="gd-chip hot">#${cur.rank}</span><span class="gd-chip ${cur.profit>=0?'up':'down'}">${signedK(cur.profit)} this week</span></div>
      <div class="fr-btns"><button class="gd-go" data-a="lgInvite">📨 Invite</button><button class="gd-go alt" data-a="chNew">⚔️ Challenge</button></div></section>`;
  if(!V) return h+'<div class="gd-empty">⏳ Loading…</div></div>';
  const M=V.members, champ=V.champs&&V.champs[0], pod=M.slice(0,3);
  h+=`<div class="gd-h">🏅 This week</div><div class="fr-podium">${[1,0,2].map(i=>pod[i]?`<div class="fr-pod p${i+1} ${pod[i].me?'me':''}"><span data-podav="${i}"></span><b>${esc(pod[i].name)}</b><em>${signedK(pod[i].profit)}</em><div>${['🥇','🥈','🥉'][i]}</div></div>`:'<div></div>').join('')}</div>
    <div class="fr-ranks">${M.slice(3).map((p,i)=>`<div class="fr-rank ${p.me?'me':''}" style="--d:${i*30}ms"><span class="fr-n">${i+4}</span>${avatar(lookFor(p.outfit))}<b>${esc(p.name)}${champ&&champ.name===p.name?' 👑':''}<small>Lv ${levelOf(p.xp).L}</small></b><em class="${p.profit>=0?'up':'down'}">${signedK(p.profit)}</em><button class="btn sm" data-a="visitLodge" data-v="${esc(p.name)}">🏠</button>${p.me?'':`<button class="btn sm" data-a="chNew" data-to="${esc(p.name)}">⚔️</button>`}</div>`).join('')}</div>
    <div class="gd-h">💬 Feed</div><div class="gd-scroll">${TAUNTS.map((t,i)=>`<button class="gd-chip" data-a="lgTaunt" data-n="${i}">${esc(t)}</button>`).join('')}</div>
    <div class="lgx-feed fr-feed">${(V.feed||[]).map(feedItem).join('')||'<div class="gd-empty">🤫 Quiet so far — win something!</div>'}</div>
    ${V.champs&&V.champs.length?`<div class="gd-h">👑 Champions</div><div class="gd-scroll">${V.champs.map(c=>`<span class="gd-chip">👑 ${esc(c.name)} · ${signedK(c.profit)}</span>`).join('')}</div>`:''}
    <div class="gd-tabs fr-2">${V.mine?'<button data-a="lgEdit">✏️ Edit</button>':''}<button data-a="lgLeave">🚪 Leave</button></div></div>`;
  setTimeout(()=>document.querySelectorAll('[data-podav]').forEach(s=>{ const p=pod[+s.dataset.podav]; if(p&&!s.firstChild){ s.innerHTML=avatar(lookFor(p.outfit)); if(typeof paintAvatars==='function') paintAvatars(); } }),0);
  return h; };
// Small print goes: footnotes are hidden on the football and league screens.
let FR_KEY='';
const _renderFr=render; render=function(){ _renderFr(); if(S.mode!=='casino') document.querySelectorAll('#view p.foot').forEach(e=>e.remove());
  // animate a screen the first time it opens, not on every refresh
  const k=[S.mode,S.ftab,S.ltab,S.ctab,S.lg,S.btab].join('|'); if(k===FR_KEY) document.querySelectorAll('#view .gd').forEach(e=>e.classList.add('still')); FR_KEY=k; };
