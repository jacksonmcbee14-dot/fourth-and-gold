// The lodge: a game layer wrapped around the whole app. The app underneath works exactly as before.
// Saved in S.lodge (and so in your profile): your Lodge-or-app choice, when the full welcome last played,
// and — in later passes — your look, XP, gear and room layout.

S.lodge=Object.assign({choice:'lodge',lastFull:'',owned:[],outfit:{},room:[],xp:0},S.lodge||{});
const LODGE={el:null,stage:null,scene:null,hub:null,welcome:null,active:false,labelsT:0,hudT:0};
const lodgeActive=()=>LODGE.active;
function lodgeLook(){ return typeof outfitLook==='function'?outfitLook():null; }   // your outfit (js/lodge/shop.js)

function lodgeDom(){
  if(LODGE.el) return;
  const el=document.createElement('div'); el.id='lodge'; el.className='lodge';
  el.innerHTML=`<div class="lg-col">
    <div class="lg-hud lg-top"><button class="lg-btn" data-lg="classic">Classic view</button><span class="lg-bank" id="lgBank"></span></div>
    <div class="lg-stage"><div class="lg-scene"></div><div class="lg-labels"></div><div class="lg-choice"></div></div>
    <div class="lg-hud lg-bottom"><button class="lg-btn" id="lgLeft" data-lg="myroom">My Room</button><span class="lg-lvl" id="lgLvl"></span><button class="lg-btn lg-round" id="lgRight" data-lg="labels" aria-label="Show what everything is">?</button></div></div>`;
  document.body.appendChild(el);
  LODGE.el=el; LODGE.stage=el.querySelector('.lg-scene');
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-lg]'); if(!b) return; e.stopPropagation(); LG_ACT[b.dataset.lg]&&LG_ACT[b.dataset.lg](b); });
}
function lodgeShow(mode){
  lodgeDom(); LODGE.active=true; LODGE.el.classList.add('on'); LODGE.el.dataset.mode=mode;
  document.body.classList.add('in-lodge'); closeTerm&&closeTerm();
  if(SL&&SL.auto) SL.auto=0;
}
function lodgeHide(){
  if(!LODGE.el) return; LODGE.active=false; LODGE.el.classList.remove('on'); document.body.classList.remove('in-lodge');
  if(LODGE.hub) LODGE.hub.loop.stop(); if(LODGE.welcome) LODGE.welcome.stop(); if(LODGE.room) LODGE.room.loop.stop();
  lodgeHeaderBtn();
}
function clearScene(){ if(LODGE.room){LODGE.room.setEdit(false);LODGE.room.loop.stop();LODGE.room=null;} if(typeof closeBar==='function') closeBar(); if(typeof closeShop==='function') closeShop(); if(LODGE.hub){LODGE.hub.loop.stop();LODGE.hub=null;} if(LODGE.welcome){LODGE.welcome.stop();LODGE.welcome=null;} LODGE.stage.innerHTML=''; LODGE.el.querySelector('.lg-labels').innerHTML=''; LODGE.el.querySelector('.lg-choice').innerHTML=''; }

/* ---------- Welcome and the two-button choice ---------- */
function lodgeWelcome(){
  lodgeShow('welcome'); clearScene();
  LODGE.welcome=makeWelcome(LODGE.stage,showChoice);
}
function showChoice(){
  const box=LODGE.el.querySelector('.lg-choice'); if(box.innerHTML) return;
  const lodgeFirst=S.lodge.choice!=='app';
  box.innerHTML=`<div class="lg-title">FOURTH<br><span>&amp;</span> GOLD</div>
    <button class="lg-btn ${lodgeFirst?'lg-gold':''}" data-lg="enter">Enter the Lodge</button>
    <button class="lg-btn ${lodgeFirst?'':'lg-gold'}" data-lg="app">Straight to the app</button>`;
  LODGE.el.dataset.mode='choice';
}

/* ---------- The great room ---------- */
function lodgeHub(){
  lodgeShow('hub'); clearScene();
  LODGE.hub=makeHub(LODGE.stage,goSpot); LODGE.hub.loop.start();
  setHud('hub'); hudBank(); showLabels(3500); if(typeof xpHud==='function') xpHud();
}
function hudBank(){ const b=document.getElementById('lgBank'); if(b) b.textContent=bank$(S.bank)+((S.debt||0)>0?' · owes '+k$(S.debt):''); }
setInterval(()=>{ if(LODGE.active) hudBank(); },1000);
function showLabels(ms){
  const box=LODGE.el.querySelector('.lg-labels');
  box.innerHTML=SPOTS.map(([id,x,y,w,h,label])=>`<span class="lg-label" style="left:${(x+w/2)/PW*100}%;top:${(y+Math.min(h,40)/2)/PH*100}%">${esc(label)}</span>`).join('');
  box.classList.add('on'); clearTimeout(LODGE.labelsT); LODGE.labelsT=setTimeout(()=>box.classList.remove('on'),ms);
}
function goSpot(s){
  const dest=s[6];
  if(dest.soon){ toast(dest.soon,'gold'); return; }
  if(dest.bar){ openBar(); return; }
  if(dest.shop){ openShop(); return; }
  if(dest.room){ openRoom(); return; }
  if(dest.golf){ openGolf({}); return; }
  if(dest.league){ S.mode='league'; S.ltab='league'; LODGE.from=true; save(); lodgeHide(); scrollTo(0,0); render(); return; }
  S.mode=dest.mode; if(dest.ftab) S.ftab=dest.ftab; if(dest.ctab) S.ctab=dest.ctab;
  if(dest.ctab&&S.howto) S.howto[dest.ctab]=false;
  LODGE.from=true; save(); lodgeHide(); scrollTo(0,0); render();
}

/* ---------- Getting back and forth ---------- */
function lodgeHeaderBtn(){
  let b=document.getElementById('lodgeBtn');
  if(!b){ b=document.createElement('button'); b.id='lodgeBtn'; b.className='lodgebtn'; b.dataset.a='toLodge'; const top=document.querySelector('.top'); top.insertBefore(b,top.children[1]); }
  b.textContent=LODGE.from?'‹ Back to the lodge':'Lodge';
  b.classList.toggle('back',!!LODGE.from);
}
const LG_ACT={
  enter:()=>{ S.lodge.choice='lodge'; save(); lodgeHub(); profileAfterLodge(); },
  app:()=>{ S.lodge.choice='app'; LODGE.from=false; save(); lodgeHide(); render(); profileAfterLodge(); },
  classic:()=>{ S.lodge.choice='app'; LODGE.from=false; save(); lodgeHide(); render(); },
  myroom:()=>openRoom(),
  hub:()=>lodgeHub(),
  labels:()=>showLabels(4000),
};
Object.assign(ACT,{ toLodge:()=>{ closeSheet(); S.lodge.choice='lodge'; save(); lodgeHub(); } });
function profileAfterLodge(){ if(typeof profileWelcome==='function') setTimeout(profileWelcome,400); }

/* ---------- My Room ---------- */
function openRoom(){
  lodgeShow('room'); clearScene();
  LODGE.room=makeRoom(LODGE.stage); LODGE.room.loop.start();
  setHud('room'); hudBank(); if(typeof xpHud==='function') xpHud();
}
// The bottom buttons change with the room you're in.
function setHud(mode){
  const L=document.getElementById('lgLeft'), R=document.getElementById('lgRight'); if(!L||!R) return;
  if(mode==='room'){ L.textContent='Great room'; L.dataset.lg='hub'; R.textContent=LODGE.room&&LODGE.room.ED.on?'Done':'Decorate'; R.dataset.lg='decorate'; R.classList.remove('lg-round'); }
  else { L.textContent='My Room'; L.dataset.lg='myroom'; R.textContent='?'; R.dataset.lg='labels'; R.classList.add('lg-round'); }
}

// Every time the app opens: the welcome, then the choice.
function lodgeStart(){ lodgeHeaderBtn(); lodgeWelcome(); }
