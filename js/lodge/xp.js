// XP and levels: you earn XP for playing (a bonus for winning), and level up through lodge titles.
// This only watches what happens in the games; it never changes odds, payouts or outcomes.

const XP_CAP=800;   // play XP per day (daily visits and won bets don't count toward it)
const TITLES=[[1,'Guest'],[5,'Regular'],[10,'Member'],[20,'High Roller'],[35,'Legend of the Lodge']];
const xpNeed=L=>100+40*(L-1);
function levelOf(xp){ let L=1,left=xp||0; while(left>=xpNeed(L)){ left-=xpNeed(L); L++; } return {L,into:left,need:xpNeed(L)}; }
function titleOf(L){ let t=TITLES[0][1]; for(const [l,n] of TITLES) if(L>=l) t=n; return t; }
const XPS={suppress:false,capNoted:''};

function gainXP(n,why,capped=true){
  if(!(n>0)) return;
  const day=dayKey();
  if(!S.lodge.xpToday||S.lodge.xpToday.day!==day) S.lodge.xpToday={day,n:0};
  if(capped){ const room=Math.max(0,XP_CAP-S.lodge.xpToday.n); n=Math.min(n,room);
    if(!n){ if(XPS.capNoted!==day){ XPS.capNoted=day; toast('Today’s XP limit reached — more tomorrow','gold'); } return; }
    S.lodge.xpToday.n+=n; }
  const before=levelOf(S.lodge.xp).L; S.lodge.xp=(S.lodge.xp||0)+n; const after=levelOf(S.lodge.xp).L;
  save(); xpPop(n); xpHud();
  if(after>before) setTimeout(()=>levelUp(before,after),350);
}
// A small "+5 XP" that floats up near your bankroll.
function xpPop(n){
  const el=document.createElement('div'); el.className='xppop'; el.textContent='+'+n+' XP';
  document.body.appendChild(el); setTimeout(()=>el.remove(),1300);
}
// Level, title and XP bar in the lodge.
function xpHud(){
  const el=document.getElementById('lgLvl'); if(!el) return;
  const {L,into,need}=levelOf(S.lodge.xp);
  el.innerHTML=`<span>LV ${L} · ${titleOf(L).toUpperCase()}</span><i><b style="width:${Math.round(into/need*100)}%"></b></i>`;
}
function levelUp(a,b){
  const t0=titleOf(a), t1=titleOf(b), newTitle=t1!==t0;
  document.querySelectorAll('.lvlup').forEach(x=>x.remove());
  const el=document.createElement('div'); el.className='lvlup';
  el.innerHTML=`<div class="lvl-box"><div class="lvl-k">LEVEL UP!</div><div class="lvl-n">${b}</div>
    <div class="lvl-t">${newTitle?'NEW TITLE<br>':''}${t1.toUpperCase()}</div>
    <div class="lvl-s">${(()=>{const u=typeof unlocksBetween==='function'?unlocksBetween(a,b):[];return u.length?'New at the merchant: '+u.map(esc).join(', '):newTitle?'The whole lodge knows your name now.':'Keep climbing — the merchant saves the best for regulars.';})()}</div><div class="lvl-tap">TAP TO CONTINUE</div></div>`;
  document.body.appendChild(el);
  [523,659,784,1047,1319].forEach((f,i)=>tone(f,.16,'square',.05,i*.09)); tone(1568,.5,'square',.05,.5);
  try{ fx.confetti(newTitle?200:120); fx.burst(innerWidth/2,innerHeight*.4,60,'#ecd9a8'); if(newTitle) fireworks(4); }catch(e){}
  const close=()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),300); };
  el.addEventListener('click',close); setTimeout(close,5000);
}

/* ---------- Where XP comes from (each wraps an existing action and only looks at what happened) ---------- */
const _spinSnd=SND.spin; SND.spin=function(){ gainXP(2,'Slot spin'); return _spinSnd.apply(this,arguments); };
const _rSpin=rSpin; rSpin=function(){ const was=RL.spinning; _rSpin(); if(!was&&RL.spinning) gainXP(5,'Roulette'); };
const _bjDeal=bjDeal; bjDeal=function(){ const h=BJ.hands; _bjDeal(); if(BJ.hands!==h) gainXP(5,'Blackjack'); };
const _vpDeal=vpDeal; vpDeal=function(){ const was=VP.phase; _vpDeal(); if(was==='bet'&&VP.phase==='draw') gainXP(5,'Video poker'); };
const _crRoll=crRoll; crRoll=function(){ const was=CR.rolling; _crRoll(); if(!was&&CR.rolling) gainXP(5,'Craps'); };
const _place=ACT.placeSlip; ACT.placeSlip=el=>{ const n=S.bets.length; _place(el); const d=S.bets.length-n; if(d>0) gainXP(10*d,'Bet placed'); };
const _settle2=settleBets; settleBets=function(){ const w=S.picks.w; _settle2(); const d=S.picks.w-w; if(d>0) gainXP(25*d,'Bet won',false); };
const _setBank2=setBank; setBank=function(d){ _setBank2(d); if(d>0&&S.mode==='casino'&&!XPS.suppress) gainXP(d>=250000?13:3,'Casino win'); };
const _crClear=ACT.crclear; ACT.crclear=el=>{ XPS.suppress=true; try{ _crClear(el); } finally { XPS.suppress=false; } };   // taking chips down isn't a win
// First visit of the day.
function xpDaily(){ if(S.lodge.visitDay!==dayKey()){ S.lodge.visitDay=dayKey(); save(); setTimeout(()=>gainXP(50,'Daily visit',false),2500); } }
