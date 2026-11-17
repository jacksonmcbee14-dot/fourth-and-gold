// 🏈 Game day: the sports side, rebuilt to be tapped. (Simple mode; "Full" keeps the classic sportsbook.)
//  • Today: your team's matchup (win-chance ring, live score), today's boost, live games, a "pick a winner" list
//    and your open bets as tickets.
//  • Bets: every game as two big team buttons in team colours. Tap a team → the quick-bet sheet: casino chips,
//    a big WIN number, and LOCK IT IN (with a stamp and confetti).

const QB={gid:null,side:null,stake:0};
const qbMax=()=>Math.floor(Math.min(S.bank,typeof tableMax==='function'?tableMax():Infinity));
const qbMin=()=>typeof tableMin==='function'?tableMin():1000;
const qbClamp=v=>Math.max(Math.min(qbMin(),qbMax()),Math.min(qbMax(),v));
const qbDefault=()=>qbClamp(Math.round(S.bank*.02/1000)*1000);
const badge=(t,big)=>`<span class="gd-badge ${big?'big':''}" style="--c:${t.col||'#3a2b1f'}">${esc(t.ab.slice(0,4))}</span>`;
const winAt=(stake,o)=>Math.round(payoutFor(stake,o)-stake);
const short=s=>String(s||'').replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s*/,'');

function gdHead(){ const open=S.bets.filter(b=>b.st==='open'), sb=S.sb||{};
  return `<div class="gd-chips"><span class="gd-chip">💰 ${k$(S.bank)}</span><button class="gd-chip" data-a="gdMine">🎟️ ${open.length} open</button>${sb.streak?`<span class="gd-chip hot">🔥 ${sb.streak} in a row</span>`:''}${typeof GAME_DAYS!=='undefined'&&GAME_DAYS.includes(new Date().getDay())?'<span class="gd-chip hot">⚡ Game day ×2</span>':''}</div>`; }
function gdHero(lg){
  const g=typeof nextMyGame==='function'?nextMyGame(lg):null; if(!g) return '';
  const K=lg==='nfl'?myN():myC(), meA=g.a.ab===K, me=meA?g.a:g.h, op=meA?g.h:g.a, live=g.s==='live'&&g.as!=null;
  const M=market(g), p=meA?1-M.ph:M.ph, o=meA?M.mlA:M.mlH, st=qbDefault(), ok=betable(g);
  return `<section class="gd-hero" style="--a:${me.col||'#7a1a20'};--b:${op.col||'#1a2a4a'}">
    <div class="gd-hero-top">${live?`<span class="livebadge">LIVE</span> ${esc(g.clock||'')}`:`📅 ${esc(short(when(g.t,g.tba)))}${g.tv?' · 📺 '+esc(g.tv):''}`}</div>
    <div class="gd-vs"><button class="gd-team" data-a="qb" data-g="${g.id}" data-s="${meA?'a':'h'}" ${ok?'':'disabled'}>${badge(me,1)}<b>${esc(me.name)}</b>${live?`<em>${meA?g.as:g.hs}</em>`:''}</button>
      <div class="gd-mid">${live?'<i>–</i>':ring(p,pct(p),78,7,'#ffd84a')}</div>
      <button class="gd-team" data-a="qb" data-g="${g.id}" data-s="${meA?'h':'a'}" ${ok?'':'disabled'}>${badge(op,1)}<b>${esc(op.name)}</b>${live?`<em>${meA?g.hs:g.as}</em>`:''}</button></div>
    ${ok?`<button class="gd-go" data-a="qb" data-g="${g.id}" data-s="${meA?'a':'h'}">🔥 Bet ${esc(me.name)} · win +${k$(winAt(st,o))}</button>`:''}</section>`; }
function gdBoost(){ if(typeof boostGame!=='function') return ''; const B=boostGame(); if(!B) return '';
  return `<button class="gd-boost" data-a="boostAdd" ${boostUsed()?'disabled':''}><span>🚀</span><b>${esc(B.team.name)}</b><s>${oddsTxt(B.base)}</s><em>${oddsTxt(B.odds)}</em><small>${boostUsed()?'USED':'BOOST'}</small></button>`; }
function gdLive(gs){ const L=gs.filter(g=>g.s==='live'&&g.as!=null); if(!L.length) return '';
  return `<div class="gd-h">🔴 Live now</div><div class="gd-scroll">${L.map(g=>`<button class="gd-live" data-a="qb" data-g="${g.id}" data-s="h" ${betable(g)?'':'disabled'}><span>${badge(g.a)} <b>${g.as}</b></span><span>${badge(g.h)} <b>${g.hs}</b></span><small>${esc(g.clock||'')}</small></button>`).join('')}</div>`; }
function gdCard(g,n){ const M=market(g), st=QB.stake||qbDefault(), live=g.s==='live';
  const side=(t,s,o,sc)=>`<button class="gd-pick" style="--c:${t.col||'#3a2b1f'}" data-a="qb" data-g="${g.id}" data-s="${s}">${badge(t)}<b>${esc(t.name)}</b>${live?`<em>${sc}</em>`:`<small>+${k$(winAt(st,o))}</small>`}</button>`;
  return `<div class="gd-card ${g.mine?'mine':''}" style="--d:${(n||0)*50}ms"><div class="gd-card-h">${live?'<span class="livebadge">LIVE</span>':'⏰ '+esc(short(when(g.t,g.tba)))}${g.mine?' · ⭐':''}${g.tv?' · 📺 '+esc(g.tv):''}</div>
    <div class="gd-row">${side(g.a,'a',M.mlA,g.as)}<span class="gd-at">@</span>${side(g.h,'h',M.mlH,g.hs)}</div></div>`; }
function gdTickets(list,all){ if(!list.length) return all?'<div class="gd-empty">🎟️ No bets yet — tap a team!</div>':'';
  return `<div class="gd-h">🎟️ ${all?'Your bets':'Open bets'}</div><div class="gd-${all?'grid':'scroll'}">${list.map((b,i)=>`<div class="gd-ticket ${b.st}" style="--d:${i*50}ms"><b>${b.legs.length>1?'🎯 '+b.legs.length+'-leg parlay':esc(b.legs[0].label)}</b>
    <small>${esc(b.legs.length>1?'':b.legs[0].sub||'')}</small><span>${b.st==='won'?'✅ +'+k$(b.pay-b.stake):b.st==='lost'?'❌ −'+k$(b.stake):b.st==='push'?'↩️ Push':'💸 '+k$(b.stake)+' → '+k$(b.pay-b.stake)}</span></div>`).join('')}</div>`; }

viewToday=function(){ const gs=allGames().filter(g=>g.s!=='final'), pre=gs.filter(betable).sort((a,b)=>(b.mine?1:0)-(a.mine?1:0)||importance(b)-importance(a)).slice(0,6);
  return `<div class="gd">${gdHead()}${gdHero('nfl')}${gdHero('cfb')}${gdBoost()}${gdLive(gs)}
    ${pre.length?`<div class="gd-h">🎯 Pick a winner</div>${pre.map(gdCard).join('')}<button class="gd-more" data-a="goBet">All games ›</button>`:'<div class="gd-empty">😴 No games open right now</div>'}
    ${gdTickets(S.bets.filter(b=>b.st==='open').slice(-6).reverse())}</div>`; };
const _viewBetsG=viewBets;
viewBets=function(){ if(uiState().book==='full') return _viewBetsG();
  const blg=S.blg||'all', mine=S.btab==='mine';
  const top=`${gdHead()}<div class="gd-tabs"><button class="${mine?'':'on'}" data-a="btab" data-v="games">🏈 Games</button><button class="${mine?'on':''}" data-a="btab" data-v="mine">🎟️ My bets</button><button data-a="bookMode" data-v="full">⚙️ Pro</button></div>`;
  if(mine) return `<div class="gd">${top}${gdTickets(S.bets.slice().reverse(),true)}</div>`;
  const gs=allGames(blg==='all'?null:blg), live=gs.filter(g=>g.s==='live'&&betable(g)), pre=gs.filter(g=>g.s==='pre'), days={};
  pre.forEach(g=>{ const d=new Date(g.t).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}); (days[d]=days[d]||[]).push(g); });
  return `<div class="gd">${top}<div class="gd-lg">${[['all','🌎 All'],['nfl','🏈 NFL'],['cfb','🎓 College']].map(([v,l])=>`<button data-a="blg" data-v="${v}" class="${blg===v?'on':''}">${l}</button>`).join('')}</div>
    ${gdBoost()}${live.length?`<div class="gd-h">🔴 Live</div>${live.map(gdCard).join('')}`:''}
    ${Object.entries(days).map(([d,list])=>`<div class="gd-h">📅 ${esc(d.split(',')[0])} <small>${esc(d.split(',').slice(1).join(','))}</small></div>${list.map(gdCard).join('')}`).join('')||'<div class="gd-empty">😴 No games open right now</div>'}</div>`; };

/* ---------- The quick-bet sheet ---------- */
const QB_CHIPS=[[1000,'#e8e2d6'],[10000,'#3a7aff'],[50000,'#3ad08a'],[100000,'#16161c'],[250000,'#b03aff'],[1000000,'#ffd84a']];
function quickBet(gid,side){ const g=allGames().find(x=>x.id===gid); if(!g||!betable(g)) return; QB.gid=gid; QB.side=side; QB.stake=QB.stake?qbClamp(QB.stake):qbDefault(); renderQB(); $('#scrim').classList.add('on'); $('#sheet').classList.add('on'); SLIP=true; }
function renderQB(bump){ const g=allGames().find(x=>x.id===QB.gid); if(!g){ closeSheet(); return; } const M=market(g), t=QB.side==='a'?g.a:g.h, o=QB.side==='a'?M.mlA:M.mlH, win=winAt(QB.stake,o);
  const btn=(tm,s)=>`<button class="qb-team ${QB.side===s?'on':''}" style="--c:${tm.col||'#3a2b1f'}" data-a="qbSide" data-v="${s}">${badge(tm,1)}<b>${esc(tm.name)}</b><small>${oddsTxt(s==='a'?M.mlA:M.mlH)}</small></button>`;
  $('#sheet').innerHTML=`<div class="grab"></div><div class="qb">
    <div class="qb-h">🏈 Who wins?</div><div class="qb-vs">${btn(g.a,'a')}<span>VS</span>${btn(g.h,'h')}</div>
    <div class="qb-chips">${QB_CHIPS.map(([v,c])=>`<button class="qb-chip" style="--c:${c}" data-a="qbAdd" data-v="${v}">${k$(v)}</button>`).join('')}</div>
    <div class="qb-amt"><button data-a="qbClear">↺</button><b>${fmt$(QB.stake)}</b><button data-a="qbMax">MAX</button></div><div class="tchips"><span>🎚️ ${k$(qbMin())} – ${k$(qbMax())}</span></div>
    <div class="qb-win ${bump?'bump':''}"><small>WIN</small><b>+${fmt$(win)}</b></div>
    <button class="qb-go" data-a="qbGo" ${QB.stake>0&&QB.stake<=S.bank?'':'disabled'}>🎯 LOCK IT IN</button></div>`; }
function qbStamp(t,win){ const el=document.createElement('div'); el.className='qb-stamp'; el.innerHTML=`<div class="qb-tk" style="--c:${t.col||'#7a1a20'}">${badge(t,1)}<b>${esc(t.name)}</b><span>WIN +${fmt$(win)}</span><i>BET PLACED</i></div>`;
  document.body.appendChild(el); try{ fx.confetti(120); }catch(e){} [523,784,1047].forEach((f,i)=>tone(f,.1,'square',.05,i*.09)); setTimeout(()=>el.classList.add('out'),1400); setTimeout(()=>el.remove(),1800); }
Object.assign(ACT,{
  qb:el=>quickBet(el.dataset.g,el.dataset.s),
  qbSide:el=>{ QB.side=el.dataset.v; tone(700,.03,'square',.02); renderQB(true); },
  qbAdd:el=>{ const before=QB.stake; QB.stake=Math.min(qbMax(),(QB.stake||0)+(+el.dataset.v)); if(QB.stake===before) toast('Table max '+k$(qbMax()),'gold'); tone(600+Math.min(600,Math.log10(+el.dataset.v)*60),.04,'square',.03); renderQB(true); },
  qbClear:()=>{ QB.stake=Math.min(qbMin(),qbMax()); renderQB(); }, qbMax:()=>{ QB.stake=qbMax(); renderQB(true); },
  qbGo:()=>{ const g=allGames().find(x=>x.id===QB.gid); if(!g) return; const M=market(g), t=QB.side==='a'?g.a:g.h, o=QB.side==='a'?M.mlA:M.mlH;
    const saved=S.slip.slice(), n0=S.bets.length; S.slip=[]; ACT.pick({dataset:{g:g.id,m:'ml',s:QB.side}}); S.stake=QB.stake; S.slipMode='single';
    ACT.placeSlip(); const ok=S.bets.length>n0; S.slip=saved.filter(l=>l.gid!==g.id); save();
    if(ok){ closeSheet(); qbStamp(t,winAt(QB.stake,o)); render(); } else renderQB(); },
  gdMine:()=>{ S.ftab='bets'; S.btab='mine'; save(); scrollTo(0,0); render(); },
});
