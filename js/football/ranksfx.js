// 🏆 Ranks, smooth: nothing re-renders the whole screen. The leaderboard loads into its own slot (a shimmering
// placeholder crossfades into a podium + rows), "Show all" slides open in place, your net worth counts up and the
// progress bar fills. Also stops the leaderboard from retrying (and redrawing) in a loop when it can't load.

const _loadBoardR=loadBoard;
loadBoard=function(){ if(Date.now()-(PROF.boardTry||0)<20e3) return new Promise(()=>{}); PROF.boardTry=Date.now(); return _loadBoardR(); };   // a retry too soon does nothing (so nothing redraws)
function rkBoardHTML(){
  if(!cloudOn()) return '';
  const L=PROF.board, meKey=PROF.me&&PROF.me.name.trim().toLowerCase();
  if(!L) return `<div class="rk-skel">${Array.from({length:5},(_,i)=>`<i style="--d:${i*80}ms"></i>`).join('')}</div>`;
  if(!L.length) return `<div class="gd-empty">👋 Be the first on the board</div>`;
  const me=L.findIndex(p=>p.name.trim().toLowerCase()===meKey), pod=L.slice(0,3);
  const row=(p,i)=>`<button class="rk-row ${i===me?'me':''}" style="--d:${Math.min(i-3,12)*45}ms" data-a="visitLodge" data-v="${esc(p.name)}"><span class="fr-n">${i+1}</span>${typeof avatarImg==='function'?avatarImg(p.outfit,false):''}<b>${esc(p.name)}${typeof stars==='function'?stars(p.prestige||0):''}<small>Lv ${levelOf(p.xp||0).L}${p.debt>0?' · 🧾 owes '+k$(p.debt):''}</small></b><em>${k$(p.bank)}</em></button>`;
  return `<div class="rk-pod">${[1,0,2].map(i=>pod[i]?`<button class="rk-p p${i+1} ${i===me?'me':''}" data-a="visitLodge" data-v="${esc(pod[i].name)}" style="--d:${[120,0,240][i]}ms"><span class="rk-av">${typeof avatarImg==='function'?avatarImg(pod[i].outfit,i===0):''}</span><b>${esc(pod[i].name)}</b><em>${k$(pod[i].bank)}</em><div class="rk-step"><span>${['🥇','🥈','🥉'][i]}</span></div></button>`:'<div></div>').join('')}</div>
    <div class="rk-rows">${L.slice(3,10).map((p,k)=>row(p,k+3)).join('')}${me>=10?row(L[me],me):''}</div>`;
}
function rkSwap(){ const el=document.getElementById('rkBoard'); if(!el) return; const h=rkBoardHTML(); if(el.dataset.h===h) return;
  el.classList.add('out'); setTimeout(()=>{ el.innerHTML=h; el.dataset.h=h; el.classList.remove('out'); el.classList.add('in'); },180); }
function rkRatings(){ if(S.mode==='casino') return '';
  let list;
  if(S.lg==='nfl'){ const elos=KEYS.map(k=>NFL[k].elo), lo=Math.min(...elos), hi=Math.max(...elos);
    list=KEYS.map(k=>({k,t:NFL[k],sc:Math.round(40+59*(NFL[k].elo-lo)/(hi-lo)),p:nflP(k)})).sort((a,b)=>b.sc-a.sc||b.p-a.p).map((o,i)=>rkRate(i+1,{ab:o.k,col:o.t.col},o.t.n,rec(o.t),o.sc,o.sc/99,o.sc>=94?0:o.sc>=80?1:o.sc>=62?2:3,o.k===myN(),i)); }
  else list=CFB.map((t,i)=>{ const a=CFBM.t[t.n], p=a.po/CFBM.n, mv=Math.round(t.r-a.rank/CFBM.n); return rkRate(t.unr?'NR':t.r,t,t.n+(mv>0?' ▲'+mv:mv<0?' ▼'+(-mv):''),rec(t),pct(p),p,p>=.85?0:p>=.45?1:p>=.12?2:3,t.me,i); });
  return `<div class="gd-h">${S.lg==='nfl'?'⚡ Power ratings':'🏆 CFP Top 25'}</div><div class="rk-list ${uiState().all.ranks?'all':''}">${list.join('')}</div>
    <button class="gd-more rk-more" data-a="rkMore">${uiState().all.ranks?'Show less ▲':'Show all ▼'}</button>`; }
function rkRate(no,t,name,sub,score,fill,tier,me,i){ return `<div class="rk-rate t${tier} ${me?'me':''} ${i>=10?'extra':''}" style="--d:${Math.min(i,10)*35}ms;--f:${Math.max(.04,Math.min(1,fill))}">
  <span class="fr-n">${no}</span><span class="gd-badge" style="--c:${t.col||'#3a2b1f'}">${esc(String(t.ab||'').slice(0,4))}</span><b>${esc(name)}<small>${FR_TIER[tier]} ${esc(sub)}</small></b><em>${score}</em><i></i></div>`; }

viewRanks=function(){ const {net,football,casino}=plSplit(), si=statusFor(net), nx=STATUS[si+1], prog=nx?clamp((net-STATUS[si][0])/(nx[0]-STATUS[si][0]),0,1):1;
  if(cloudOn()&&(!PROF.board||Date.now()-PROF.boardAt>60e3)) loadBoard().then(rkSwap);
  return `<div class="gd rk">${S.mode==='casino'?'':lgChips()}
    <section class="rk-status"><div class="rk-shine"></div><small>YOUR STATUS</small><b>${esc(STATUS[si][1])}</b><em class="rk-count" data-to="${Math.round(net)}">${bank$(net)}</em>
      <div class="rk-bar"><u style="--p:${prog}"></u></div>${nx?`<small class="rk-next">⬆️ ${esc(nx[1])} in ${bank$(nx[0]-net)}</small>`:'<small class="rk-next">👑 Top of the house</small>'}
      <div class="gd-chips"><span class="gd-chip">🎰 ${signed$(casino)}</span><span class="gd-chip">🏈 ${signed$(football)}</span><span class="gd-chip">🎟️ ${S.picks.w}–${S.picks.l}</span></div></section>
    ${cloudOn()?`<div class="gd-h">🏅 Leaderboard <small>tap to visit</small></div><div id="rkBoard" data-h="">${rkBoardHTML()}</div>${PROF.me?'':'<button class="gd-go" data-a="pfShowSignup">✨ Join the leaderboard</button>'}`:''}
    ${rkRatings()}</div>`; };
ACT.rkMore=el=>{ const all=!uiState().all.ranks; uiState().all.ranks=all?1:0; save(); const L=document.querySelector('.rk-list'); if(L) L.classList.toggle('all',all); el.textContent=all?'Show less ▲':'Show all ▼'; if(!all) L.scrollIntoView({behavior:'smooth',block:'start'}); };
// After the screen draws: count the net worth up and fill the bar (first open only).
const _renderRk=render; render=function(){ _renderRk(); const R=document.querySelector('#view .rk'); if(!R) return; const el=document.getElementById('rkBoard'); if(el) el.dataset.h=el.innerHTML?rkBoardHTML():'';
  if(typeof paintAvatars==='function') paintAvatars();
  if(R.classList.contains('still')){ R.querySelectorAll('.rk-bar u').forEach(u=>u.classList.add('go')); return; }
  const c=R.querySelector('.rk-count'); if(c){ const to=+c.dataset.to, t0=performance.now(); const step=n=>{ const k=Math.min(1,(n-t0)/900), e=1-Math.pow(1-k,3); c.textContent=bank$(Math.round(to*e)); if(k<1&&document.body.contains(c)) requestAnimationFrame(step); }; requestAnimationFrame(step); }
  requestAnimationFrame(()=>requestAnimationFrame(()=>R.querySelectorAll('.rk-bar u').forEach(u=>u.classList.add('go')))); };
