// 🤵 Butlers. The first comes with the Mansion (gifted or earned), the second at level 75. Each one does one job a day:
//   • Play for you: slots, blackjack, roulette, golf, or a sports parlay. He plays with house money (5% of your net
//     worth, at least $1M), his wins pay double or more (his suit, below), you keep the profit, and his losses are on the house.
//   • Stand guard for 24 hours: anyone who breaks in gets caught (checked on the server: supabase/update-15-butlers.sql).
//   • Rob someone for you: he picks a target, finds the easiest way in, and cracks the safe himself. Fines are on the house.
//   • Run errands: collects today's daily bonus, doubled.
//   • Shop the limited shelf: buys the best piece you don't own, 25% off.
//   • Mix an old fashioned: a free one that doesn't use up your one a day.
// Always on: while you have a butler your daily streak never breaks, and his suit (and his win multiplier) gets better as you level up.

const BUTLERS=[{name:'Hollis',need:()=>homeTier()>=4,why:'Comes with the Mansion'},{name:'Pemberton',need:()=>myLevel()>=75,why:'Joins at level 75'}];
const BSUITS=[{lv:0,name:'Black tie',x:2},{lv:60,name:'Silver tails',x:2.25},{lv:75,name:'Gold tails',x:2.5},{lv:90,name:'Velvet smoking jacket',x:2.75},{lv:100,name:'Diamond tuxedo',x:3}];
const butlerSuit=()=>{ let s=BSUITS[0]; for(const x of BSUITS) if(myLevel()>=x.lv) s=x; return s; };
const butlerStake=()=>nice(Math.max(1e6,worth()*.05));
const butlersHave=()=>BUTLERS.filter(b=>b.need());
const butlerFree=()=>butlersHave().find(b=>!butlerUsed(b.name));
function butlerUsed(name){ const d=S.lodge.butlers; return !!(d&&d.day===dayKey()&&(d.used||[]).includes(name)); }
function butlerMark(name){ const day=dayKey(); if(!S.lodge.butlers||S.lodge.butlers.day!==day) S.lodge.butlers={day,used:[]}; S.lodge.butlers.used.push(name); save(); }
const guardOn=()=>(S.lodge.guardUntil||0)>Date.now();

/* ---------- Playing for you ---------- */
// Each game is a list of rounds; every round returns [line, change]. K scales the bets, X is the suit's win multiplier.
const pick=a=>a[Math.floor(Math.random()*a.length)];
const BJOBS={
  slots:{label:'🎰 Slots',rounds:(K,X)=>Array.from({length:20},(_,i)=>{ const bet=K*50000, r=Math.random();
    const sym=['🍒','🍋','🔔','⭐','💎','7️⃣'], m=r<.004?50:r<.019?10:r<.049?5:r<.109?3:r<.179?2:0;
    const reel=m?Array(3).fill({2:'🍒',3:'🔔',5:'⭐',10:'💎',50:'7️⃣'}[m]).join(''):[pick(sym),pick(sym),pick(sym)].join('');
    return m?[`Spin ${i+1}: ${reel} — ${m}× ×${X}`,bet*m*X-bet]:[`Spin ${i+1}: ${reel}`,-bet]; })},
  blackjack:{label:'🃏 Blackjack',rounds:(K,X)=>Array.from({length:20},(_,i)=>{ const bet=K*50000, r=Math.random();
    if(r<.045) return [`Hand ${i+1}: Blackjack! ×${X}`,bet*1.5*X];
    if(r<.47) return [`Hand ${i+1}: ${17+Math.floor(Math.random()*4)} beats the dealer ×${X}`,bet*X];
    if(r<.56) return [`Hand ${i+1}: Push`,0];
    return [`Hand ${i+1}: ${Math.random()<.4?'Bust':'Dealer wins'}`,-bet]; })},
  roulette:{label:'🎡 Roulette',rounds:(K,X)=>Array.from({length:20},(_,i)=>{ const bet=K*50000, n=Math.floor(Math.random()*37), red=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n);
    return red?[`Spin ${i+1}: ${n} red — win ×${X}`,bet*X]:[`Spin ${i+1}: ${n} ${n?'black':'green'}`,-bet]; })},
  golf:{label:'⛳ Golf',rounds:(K,X)=>Array.from({length:9},(_,i)=>{ const bet=K*100000, r=Math.random(), par=pick([3,4,4,5]);
    if(r<.04) return [`Hole ${i+1} (par ${par}): Eagle! ×${X}`,bet*4*X];
    if(r<.25) return [`Hole ${i+1} (par ${par}): Birdie ×${X}`,bet*X];
    if(r<.72) return [`Hole ${i+1} (par ${par}): Par`,0];
    return [`Hole ${i+1} (par ${par}): Bogey`,-bet]; })},
};

// A report panel the butler fills in line by line.
function butlerPanel(b,title,intro){
  closeShop(); const box=document.createElement('div'); box.className='lg-shop lg-home lg-butler';
  box.innerHTML=`<div class="lg-shop-head"><span class="lg-dlg-who">🤵 ${esc(b.name.toUpperCase())} · ${esc(title.toUpperCase())}</span><button class="lg-btn lg-round" data-lg="shopClose" aria-label="Close">X</button></div>
    <div class="lg-shop-body"><div class="lg-prev-desc">“${esc(intro)}”</div><div class="bt-log"></div><div class="bt-bal"></div><div class="bt-end"></div></div>`;
  LODGE.el.querySelector('.lg-stage').appendChild(box);
  return {box,line:(t,cls)=>{ const el=document.createElement('div'); el.className='bt-line '+(cls||''); el.textContent=t; const log=box.querySelector('.bt-log'); log.appendChild(el); log.scrollTop=log.scrollHeight; },
    bal:t=>{ box.querySelector('.bt-bal').textContent=t; },
    end:t=>{ box.querySelector('.bt-end').innerHTML=`<div class="lg-prev-desc"><b>${esc(t)}</b></div><button class="lg-btn lg-gold" data-lg="homeOpen">Back home</button>`; }};
}

function butlerPlay(job){
  const b=butlerFree(), J=BJOBS[job]; if(!b||!J) return;
  butlerMark(b.name);
  const stake=butlerStake(), X=butlerSuit().x, rounds=J.rounds(stake/1e6,X); let bal=stake;
  const P=butlerPanel(b,J.label,`Very good. I’ll take the house’s ${k$(stake)} and see what I can do.`); P.bal('Balance: '+k$(bal));
  let i=0, done=false;
  const step=()=>{ if(!document.body.contains(P.box)){ finish(true); return; } if(i>=rounds.length||bal<=0){ finish(false); return; }
    const [line,ch]=rounds[i++]; bal=Math.max(0,bal+ch);
    P.line(line+(ch?` (${ch>0?'+':'−'}${k$(Math.abs(ch))})`:''),ch>0?'win':ch<0?'loss':''); P.bal('Balance: '+k$(bal));
    if(ch>0) tone(660+Math.min(600,ch/(stake/200)),.06,'square',.03);
    setTimeout(step,260); };
  function finish(silent){ if(done) return; done=true;
    while(i<rounds.length&&bal>0){ const [,ch]=rounds[i++]; bal=Math.max(0,bal+ch); }   // finish quietly if the panel was closed early
    const profit=Math.max(0,Math.round(bal-stake)); if(profit>0) setBank(profit);
    butlerLog(b,job,profit);
    if(silent){ toast('🤵 '+(profit>0?`${b.name} won you ${k$(profit)}`:`${b.name} broke even — nothing lost`),profit>0?'win':'gold'); return; }
    P.end(profit>0?`${b.name} turned the house’s ${k$(stake)} into ${k$(bal)}. You keep ${fmt$(profit)}.`:`${b.name} came back with ${k$(bal)} — no profit today, but it cost you nothing.`);
    if(profit>0) tone(988,.15,'square',.05); }
  setTimeout(step,500);
}
function butlerLog(b,job,profit){ S.lodge.butlerLog=[{at:Date.now(),name:b.name,job,profit}].concat(S.lodge.butlerLog||[]).slice(0,10); save(); }

/* ---------- Sports parlay (settles when the games finish) ---------- */
function butlerParlay(){
  const games=(typeof allGames==='function'?allGames():[]).filter(g=>g.s==='pre'&&g.h&&g.a);
  if(games.length<2){ toast('No games he can bet on right now — try later','loss'); return; }
  const b=butlerFree(); if(!b) return;
  const legs=games.sort(()=>Math.random()-.5).slice(0,3).map(g=>{ const M=market(g), home=M.ph>=.5, t=home?g.h:g.a;
    return {gid:g.id,m:'ml',s:home?'h':'a',odds:home?M.mlH:M.mlA,label:t.name+' to win',sub:g.a.name+' at '+g.h.name}; });
  const stake=butlerStake(), X=butlerSuit().x, dec=legs.reduce((p,l)=>p*decOf(l.odds),1);
  butlerMark(b.name);
  S.butlerBets=(S.butlerBets||[]).concat([{id:Date.now(),name:b.name,legs,stake,x:X,st:'open'}]); save();
  const P=butlerPanel(b,'🏈 Sports parlay',`I’ve put the house’s ${k$(stake)} on a ${legs.length}-leg parlay.`);
  legs.forEach(l=>P.line(`${l.label} (${oddsTxt(l.odds)}) · ${l.sub}`));
  P.end(`If it hits, you get ${fmt$(Math.round(stake*(dec-1)*X))} (wins ×${X}). If it misses, it’s on the house.`);
}
function butlerSettle(){
  const open=(S.butlerBets||[]).filter(b=>b.st==='open'); if(!open.length||typeof allGames!=='function') return;
  const gs={}; allGames().forEach(g=>gs[g.id]=g); let ch=false;
  for(const bt of open){ const rs=bt.legs.map(l=>legRes(l,gs)); if(!rs.includes('lost')&&!rs.every(r=>r)) continue; ch=true;
    if(rs.includes('lost')){ bt.st='lost'; toast(`🤵 ${bt.name}’s parlay missed — on the house`,'gold'); }
    else { const dec=bt.legs.reduce((p,l,i)=>p*(rs[i]==='won'?decOf(l.odds):1),1), profit=Math.round(bt.stake*(dec-1)*bt.x);
      bt.st='won'; bt.pay=profit; if(profit>0){ setBank(profit); toast(`🤵 ${bt.name}’s parlay hit! +${fmt$(profit)}`,'win'); } } }
  if(ch){ S.butlerBets=S.butlerBets.slice(-20); save(); }
}
setInterval(butlerSettle,15000); setTimeout(butlerSettle,3000);

/* ---------- Stand guard ---------- */
function butlerGuard(){ const b=butlerFree(); if(!b) return; butlerMark(b.name);
  S.lodge.guardUntil=Date.now()+864e5; save();
  const P=butlerPanel(b,'🛡 Standing guard','I’ll be at the front door. Nobody gets past me tonight.');
  P.end('For the next 24 hours, anyone who breaks in — door or window — gets caught and pays you a fine.'); }

/* ---------- Rob someone ---------- */
async function butlerRob(){
  if(!(typeof socOn==='function'&&socOn())){ toast('Make a profile first so he knows where to go','loss'); return; }
  const b=butlerFree(); if(!b) return;
  const P=butlerPanel(b,'🕵 Heist','Leave it with me. I know a few lodges with loose windows.');
  try{ if(!PROF.board||Date.now()-PROF.boardAt>60e3) await loadBoard(); }catch(e){}
  const meKey=(PROF.me&&PROF.me.name||'').trim().toLowerCase();
  const list=(PROF.board||[]).filter(p=>p.name&&p.name.trim().toLowerCase()!==meKey).sort((a,c)=>(c.bank||0)-(a.bank||0)).slice(0,8);
  let target=null, view=null;
  for(const p of list){ P.line('Casing '+p.name+'’s place…');
    let d=null; try{ d=await srpc('fg_lodge_view',{p_name:p.name}); }catch(e){}
    if(!d||d.error) continue;
    if(!d.tries_left){ P.line('You’re out of robbery tries today.','loss'); P.end('No tries left — he’ll go tomorrow. (This didn’t use him up.)'); return; }
    if(d.shield_until){ P.line('  Just robbed — shielded.'); continue; }
    if(d.guard){ P.line('  Their butler is on the door. Moving on.'); continue; }
    target=p; view=d; break; }
  if(!target){ P.end('Nobody worth robbing right now. (This didn’t use him up.)'); return; }
  butlerMark(b.name);
  const wins=view.windows||0, cams=Math.min(wins,view.cams||0), entry=wins>cams?cams+1:0;
  P.line(entry?`Going in through window ${entry} — no camera on it.`:'Every window has a camera. Trying the front door.');
  const cracked=Math.random()<.75; P.line(cracked?'Cracked the safe…':'Fumbled the dial — alarm!',cracked?'win':'loss');
  let r=null; try{ r=await srpc('fg_heist2',{p_name:target.name,p_cracked:cracked,p_entry:entry}); }catch(e){}
  if(!r||r.error){ P.end('Couldn’t reach their lodge. Try again later.'); return; }
  if(r.result==='stole'){ setBank(r.amount); butlerLog(b,'rob',r.amount); try{ fx.coins(60,1800); }catch(e){} P.line(`Got out with ${fmt$(r.amount)}.`,'win'); P.end(`${b.name} robbed ${target.name}: +${fmt$(r.amount)}`); }
  else { butlerLog(b,'rob',0); P.line(r.result==='caught'?(r.guard?'Their butler caught me.':'Their security caught me.'):'The alarm went off.','loss'); P.end(`No luck at ${target.name}’s. The fine (${fmt$(r.fine)}) is on the house.`); }
  if(typeof socRefresh==='function'){ SOC.at=0; socRefresh(true); }
}

/* ---------- Errands, shopping, drinks ---------- */
function butlerDaily(){
  const st=dailyState(); if(!st.ready){ toast('You’ve already collected today’s bonus','loss'); return; }
  const b=butlerFree(); if(!b) return; butlerMark(b.name);
  const amt=DAILY[st.streak-1]; S.daily={day:st.today,streak:st.streak}; addGift(amt*2); if(typeof socBadge==='function') socBadge();
  const P=butlerPanel(b,'📬 Errands','Your daily envelope, collected and doubled.'); P.end(`Day ${st.streak} bonus: +${fmt$(amt*2)}`); butlerLog(b,'daily',amt*2); }
function butlerShop(){
  const opts=limitedNow().filter(it=>!owns(it.id)).sort((a,c)=>c.price-a.price);
  if(!opts.length){ toast('You already own everything on the limited shelf','loss'); return; }
  const b=butlerFree(); if(!b) return;
  for(const it of opts){ const before=S.bank; buyItem(it.id); if(owns(it.id)){ const paid=before-S.bank, back=Math.round(paid*.25);
      butlerMark(b.name); if(back>0) setBank(back);
      const P=butlerPanel(b,'🛍 Limited shelf','I had a word with Silas.'); P.line(`Bought the ${it.name} for ${fmt$(paid-back)} (25% off).`,'win'); P.end('It’s in your wardrobe.'); return; } }
  toast('He can’t afford anything on the shelf yet','loss'); }
function butlerDrink(){
  const b=butlerFree(); if(!b) return; const d=DRINKS.find(x=>x.id==='oldfash'); if(!d) return; butlerMark(b.name);
  S.lodge.drink={id:'oldfash',until:Date.now()+DRINK_MS,cap:drinkPrice(d)*OF_CAP,used:0}; save();
  if(typeof drinkUI==='function') drinkUI();
  const P=butlerPanel(b,'🥃 Old fashioned','Big cube, orange peel. On me.'); P.end('A free old fashioned — and you can still order your own today.'); }

/* ---------- Always on: the streak never breaks while you have a butler ---------- */
const _dailyStateB=dailyState;
dailyState=function(){ const r=_dailyStateB(); const d=S.daily||{};
  if(r.ready&&r.streak===1&&d.day&&d.streak&&butlersHave().length) return Object.assign(r,{streak:d.streak%7+1});
  return r; };

/* ---------- The Home panel's butler section ---------- */
const BACTS=[['butlerGo','slots','🎰 Slots'],['butlerGo','blackjack','🃏 Blackjack'],['butlerGo','roulette','🎡 Roulette'],['butlerGo','golf','⛳ Golf'],['butlerParlay','','🏈 Sports parlay'],
  ['butlerGuard','','🛡 Stand guard'],['butlerRob','','🕵 Rob someone'],['butlerDaily','','📬 Daily bonus ×2'],['butlerShop','','🛍 Limited shelf'],['butlerDrink','','🥃 Old fashioned']];
function butlerSection(){
  const have=butlersHave(), suit=butlerSuit(), ready=butlerFree();
  const rows=BUTLERS.map(b=>{ const ok=b.need(), used=ok&&butlerUsed(b.name);
    return `<div class="lg-home-row ${ok?(used?'done':'on'):''}"><span>🤵</span><b>${esc(b.name)}</b><small>${ok?(used?'Back tomorrow':'Ready'):esc(b.why)}</small></div>`; }).join('');
  const nextSuit=BSUITS.find(s=>s.lv>myLevel());
  return `<div class="lg-home-h">BUTLERS</div>
    <div class="lg-prev-desc">${have.length?`Each butler does one job a day. When he plays, he uses <b>${k$(butlerStake())}</b> of house money (5% of your net worth), his wins pay <b>×${suit.x}</b>, and his losses are on the house.<br>Suit: <b>${esc(suit.name)}</b>${nextSuit?` · ${esc(nextSuit.name)} (×${nextSuit.x}) at level ${nextSuit.lv}`:''}.<br>While you have a butler, your daily streak never breaks.${guardOn()?`<br>🛡 Standing guard until ${new Date(S.lodge.guardUntil).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}.`:''}`:'Your first butler comes with the Mansion. He plays for you with house money, guards the house, robs for you, runs errands and more.'}</div>
    ${rows}
    ${ready?`<div class="lg-rooms">${BACTS.map(([a,v,t])=>`<button class="lg-btn lg-gold" data-lg="${a}" data-v="${v}">${t}</button>`).join('')}</div>`:''}`;
}
const _homeOpenB=homeOpen;
homeOpen=function(){ _homeOpenB(); const body=LODGE.el&&LODGE.el.querySelector('.lg-home .lg-shop-body'); if(!body) return;
  const all=[...body.querySelectorAll('.lg-home-h')].find(h=>h.textContent==='ALL HOMES'); const wrap=document.createElement('div'); wrap.innerHTML=butlerSection();
  [...wrap.childNodes].forEach(n=>body.insertBefore(n,all||null)); };
Object.assign(LG_ACT,{ butlerGo:b=>butlerPlay(b.dataset.v), butlerParlay:()=>butlerParlay(), butlerGuard:()=>butlerGuard(), butlerRob:()=>butlerRob(),
  butlerDaily:()=>butlerDaily(), butlerShop:()=>butlerShop(), butlerDrink:()=>butlerDrink() });

// A butler still free today? Show it on the Home button.
setInterval(()=>{ const btn=document.getElementById('lgHome'); if(!btn) return; const t=butlerFree()?'Home 🤵':'Home'; if(btn.textContent!==t) btn.textContent=t; },2000);

/* ---------- Hot-streak butler: at full heat (+50%), call a butler in and your wins pay ×2 (his suit) for 2 minutes ---------- */
const HOTB_MS=120e3;
const hotbOn=()=>(S.butlerHot||0)>Date.now();
const _heatWinB=heatWin;
heatWin=function(base,profit){ const r=_heatWinB(base,profit); return hotbOn()&&r>0?Math.round(r*butlerSuit().x):r; };
function hotbUI(){ let el=document.getElementById('butlerHot');
  const casino=S.mode==='casino'&&!(typeof lodgeActive==='function'&&lodgeActive());
  const show=casino&&(hotbOn()||((S.heat||0)>=HEAT_MAX&&butlerFree()));
  if(!show){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement('button'); el.id='butlerHot'; el.onclick=hotbGo; document.body.appendChild(el); }
  const t=hotbOn()?`🤵 ×${butlerSuit().x} · ${Math.ceil((S.butlerHot-Date.now())/1000)}s`:`🤵 Call ${butlerFree().name} · ×${butlerSuit().x} wins for 2 min`;
  el.className=hotbOn()?'on':''; if(el.textContent!==t) el.textContent=t; }
function hotbGo(){ if(hotbOn()) return; const b=butlerFree(); if(!b||(S.heat||0)<HEAT_MAX) return;
  butlerMark(b.name); S.butlerHot=Date.now()+HOTB_MS; save(); butlerLog(b,'hot',0);
  try{ fx.confetti(80); }catch(e){} [784,988,1319].forEach((f,i)=>tone(f,.1,'square',.05,i*.08));
  toast(`🤵 ${b.name} is at your shoulder — wins ×${butlerSuit().x} for 2 minutes`,'gold'); hotbUI(); }
setInterval(hotbUI,500);
