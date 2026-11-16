// My Room: your loft upstairs. Place and drag the decor you've bought, change clothes at the wardrobe,
// and watch the trophy shelf fill in with your milestones.

/* ---------- Trophies (milestones; they survive a reset) ---------- */
const TROPHIES=[
  {id:'jackpot',  name:'First jackpot',      desc:'Hit a Golden Star jackpot on Jingle Jackpot.', icon:'star'},
  {id:'bigwin',   name:'Biggest win',        desc:'Your biggest single payout so far.',          icon:'bag'},
  {id:'parlay',   name:'Parlay hit',         desc:'Won a parlay at the sportsbook.',             icon:'ticket'},
  {id:'royal',    name:'Royal flush',        desc:'A royal flush in video poker.',               icon:'cards'},
  {id:'natural',  name:'Blackjack!',         desc:'Dealt a natural blackjack.',                  icon:'ace'},
  {id:'t_regular',name:'Regular',            desc:'Reached level 5.',                            icon:'cup1'},
  {id:'t_member', name:'Member',             desc:'Reached level 10.',                           icon:'cup2'},
  {id:'t_high',   name:'High Roller',        desc:'Reached level 20.',                           icon:'cup3'},
  {id:'t_legend', name:'Legend of the Lodge',desc:'Reached level 35.',                           icon:'crown'},
];
const hasTrophy=id=>!!(S.lodge.trophies&&S.lodge.trophies[id]);
function earnTrophy(id,value){
  S.lodge.trophies=S.lodge.trophies||{};
  const t=TROPHIES.find(x=>x.id===id); if(!t) return;
  const had=S.lodge.trophies[id];
  if(id==='bigwin'){ if(had&&had.v>=value) return; S.lodge.trophies[id]={at:Date.now(),v:value}; save(); if(!had||value>=100000) toast(had?`New biggest win: ${fmt$(value)}`:`Trophy: ${t.name} — ${fmt$(value)}`,'gold'); return; }
  if(had) return;
  S.lodge.trophies[id]={at:Date.now()}; save();
  setTimeout(()=>{ toast('Trophy earned: '+t.name+' — see it in My Room','gold'); [988,1319,1568].forEach((f,i)=>tone(f,.14,'triangle',.06,i*.1)); },600);
}
function titleTrophies(){ const L=levelOf(S.lodge.xp).L; if(L>=5)earnTrophy('t_regular'); if(L>=10)earnTrophy('t_member'); if(L>=20)earnTrophy('t_high'); if(L>=35)earnTrophy('t_legend'); }
// Watching the games for milestones (outcomes are never changed).
const _pick=pickBonus; pickBonus=async function(){ const W=await _pick.apply(this,arguments); earnTrophy('jackpot'); return W; };
const _vpDraw=vpDraw; vpDraw=function(){ _vpDraw(); if(VP.res===0) earnTrophy('royal'); };
const _bjSettle=bjSettle; bjSettle=function(){ _bjSettle(); if(BJ.hands.some(h=>h.res==='Blackjack')) earnTrophy('natural'); };
const _settle3=settleBets; settleBets=function(){
  const open=S.bets.filter(b=>b.st==='open'); _settle3();
  for(const b of open){ if(b.st==='won'){ if(b.legs.length>1) earnTrophy('parlay'); earnTrophy('bigwin',Math.round(b.pay-b.stake)); } }
};
const _setBank3=setBank; setBank=function(d){ _setBank3(d); if(d>0&&S.mode==='casino') earnTrophy('bigwin',Math.round(d)); };
const _gain=gainXP; gainXP=function(){ _gain.apply(this,arguments); titleTrophies(); };

function trophyIcon(c,icon,x,y,on){
  const g=on?LP.brass1:'#3a2617', h=on?LP.brass3:'#4a3220', r=on?LP.cran3:'#3a2617';
  const P=(X,Y,W,H,col)=>rect(c,x+X,y+Y,W,H,col);
  if(icon==='star'){ P(4,0,2,2,h); P(1,2,8,2,g); P(2,4,6,2,g); P(1,6,3,2,g); P(6,6,3,2,g); }
  else if(icon==='bag'){ P(3,0,4,2,g); P(1,2,8,7,g); P(4,4,2,3,on?LP.pine3:'#4a3220'); }
  else if(icon==='ticket'){ P(0,2,10,6,on?LP.snow2:'#4a3220'); P(2,4,6,1,r); P(2,6,4,1,r); }
  else if(icon==='cards'){ P(0,1,6,8,on?LP.snow2:'#4a3220'); P(4,0,6,8,on?'#efe6d2':'#3a2617'); P(6,3,2,2,r); }
  else if(icon==='ace'){ P(2,0,6,9,on?LP.snow2:'#4a3220'); P(4,3,2,3,on?LP.ink:'#3a2617'); P(3,4,4,1,on?LP.ink:'#3a2617'); }
  else if(icon==='crown'){ P(0,2,2,2,g); P(4,1,2,3,g); P(8,2,2,2,g); P(0,4,10,4,g); P(4,5,2,2,r); }
  else { const tall=icon==='cup3'?2:icon==='cup2'?1:0; P(1,0,8,4+tall,g); P(0,1,1,2,g); P(9,1,1,2,g); P(4,4+tall,2,2,g); P(2,6+tall,6,2,h); }
}

/* ---------- The room ---------- */
const ROOM_SHELF={x:118,y:30,w:70,h:62}, ROOM_WARDROBE={x:6,y:92,w:34,h:84}, ROOM_STAIRS={x:0,y:276,w:42,h:44};
let ROOM_BG=null;
function drawRoomStatic(){
  if(ROOM_BG) return ROOM_BG;
  const c=document.createElement('canvas'); c.width=PW; c.height=PH; const x=c.getContext('2d'), r=prng(77);
  for(let xx=0;xx<PW;xx+=7){ rect(x,xx,0,7,172,(xx/7)%2?'#1f3328':'#1a2d23'); rect(x,xx,0,1,172,'#13241b'); }        // pine-green panelled walls
  for(let i=0;i<34;i++){ rect(x,0,i,34-i,1,LP.wal0); rect(x,PW-34+i,i,34-i,1,LP.wal0); }                               // sloped attic ceiling
  rect(x,0,0,PW,6,LP.wal0); for(const bx of [40,92,144]) rect(x,bx,0,6,10,LP.wal3);
  rect(x,0,150,PW,22,LP.wal1); rect(x,0,150,PW,2,LP.brass0);                                                               // wainscot
  for(let y=172;y<PH;y+=5){ rect(x,0,y,PW,5,(y/5)%2?LP.wal3:'#33220f'); rect(x,0,y+4,PW,1,'#24170d'); for(let xx=((y/5)%3)*22;xx<PW;xx+=64) rect(x,xx,y,1,4,'#24170d'); }
  // window
  rect(x,64,28,40,56,LP.wal0); rect(x,66,30,36,52,LP.wal4); rect(x,68,32,32,48,LP.night1); rect(x,62,82,44,4,LP.wal5);
  // wardrobe
  const W=ROOM_WARDROBE; rect(x,W.x,W.y,W.w,W.h,LP.wal4); rect(x,W.x,W.y,W.w,4,LP.wal5); rect(x,W.x+2,W.y+6,14,W.h-10,LP.wal3); rect(x,W.x+18,W.y+6,14,W.h-10,LP.wal3);
  rect(x,W.x+14,W.y+40,2,6,LP.brass1); rect(x,W.x+18,W.y+40,2,6,LP.brass1); rect(x,W.x+4,W.y+10,10,24,'#3d5560'); rect(x,W.x+5,W.y+12,2,8,'#7fa8c0');
  rect(x,W.x+2,W.y+W.h,4,3,LP.wal0); rect(x,W.x+W.w-6,W.y+W.h,4,3,LP.wal0);
  // trophy shelf (two shelves)
  const T=ROOM_SHELF; for(const sy of [T.y+28,T.y+58]){ rect(x,T.x,sy,T.w,4,LP.wal5); rect(x,T.x,sy,T.w,1,LP.wal6); rect(x,T.x+4,sy+4,2,4,LP.brass0); rect(x,T.x+T.w-6,sy+4,2,4,LP.brass0); }
  ptext(x,'TROPHIES',T.x+T.w/2-ptextW('TROPHIES')/2,T.y-1,LP.brass1);
  // stairs down
  const D=ROOM_STAIRS; rect(x,D.x,D.y,D.w,D.h,LP.ink); for(let i=0;i<4;i++) rect(x,D.x,D.y+6+i*10,D.w-i*8,3,LP.wal4); rect(x,D.x+D.w-2,D.y-10,2,D.h+10,LP.brass1); rect(x,D.x,D.y-10,D.w,2,LP.brass1);
  ptext(x,'DOWN',6,D.y-8,LP.brass2);
  return ROOM_BG=c;
}
const placed=()=>S.lodge.room=(S.lodge.room||[]).filter(p=>owns(p.id));
function clampDecor(it,x,y){
  if(it.wall) return [clamp(x,44,PW-it.w-2), clamp(y,92,150-it.h+8)];
  return [clamp(x,it.floor?4:44,PW-it.w-2), clamp(y,174,300-it.h)];
}
function makeRoom(host){
  const {c,ctx}=makeCanvas(host);
  const snow=snowField(16,61,{x:68,y:32,w:32,h:48});
  const me={x:150,y:262,tx:150,ty:262,face:-1,speed:40,walkT:0};
  const ED={on:false,drag:null,sel:null,moved:false,min:false};
  const loop=makeLoop((t,dt)=>{
    ctx.drawImage(drawRoomStatic(),0,0);
    const plain=typeof roomPlain==='function'&&roomPlain();   // vault room and putting green: no window, no trophy shelf (js/lodge/home.js)
    if(!plain){ rect(ctx,68,32,32,48,LP.night1); for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++) if(xx*xx+yy*yy<=9) rect(ctx,90+xx,40+yy,1,1,LP.moon);
    snow.draw(ctx,dt,LP.snow2); rect(ctx,68,74,32,6,LP.snow1); rect(ctx,83,32,2,48,LP.wal4); rect(ctx,68,54,32,2,LP.wal4); }
    // trophies on the shelf
    if(!plain) TROPHIES.forEach((tr,i)=>{ const row=i<5?0:1, col=row?i-5:i, sx=ROOM_SHELF.x+4+col*13+(row?6:0), sy=ROOM_SHELF.y+18+row*30;
      trophyIcon(ctx,tr.icon,sx,sy,hasTrophy(tr.id)); if(hasTrophy(tr.id)&&Math.sin(t*2+i)>.93) rect(ctx,sx+8,sy,1,1,LP.brass3); });
    // decor: rugs first, then everything else from back to front
    const list=drawOrder();
    let meDrawn=false;
    const drawMe=()=>{ const dx=me.tx-me.x, dy=me.ty-me.y, d=Math.hypot(dx,dy), mv=d>.5;
      if(mv){ const st=Math.min(d,me.speed*dt); me.x+=dx/d*st; me.y+=dy/d*st; if(Math.abs(dx)>.5) me.face=dx<0?-1:1; me.walkT+=dt; }
      drawPerson(ctx,'player',mv?'walk'+((me.walkT*10|0)%4):(Math.sin(t*.8)>.97?'idle1':'idle0'),lodgeLook(),me.x,me.y,me.face); drawHeld(ctx,me.x,me.y,me.face,t); meDrawn=true; };
    for(const p of list){ const it=ITEM[p.id];
      if(!meDrawn&&!it.wall&&!it.floor&&p.y+it.h>me.y) drawMe();
      DECOR_ART[p.id]&&DECOR_ART[p.id](ctx,p.x,p.y,t);
      if(ED.on){ ctx.globalAlpha=ED.sel===p?.9:.35; rect(ctx,p.x-1,p.y-1,it.w+2,1,LP.emb2); rect(ctx,p.x-1,p.y+it.h,it.w+2,1,LP.emb2); rect(ctx,p.x-1,p.y-1,1,it.h+2,LP.emb2); rect(ctx,p.x+it.w,p.y-1,1,it.h+2,LP.emb2); ctx.globalAlpha=1; } }
    if(!meDrawn) drawMe();
    if(ED.on){ ctx.globalAlpha=.08+.04*Math.sin(t*4); rect(ctx,0,0,PW,PH,LP.emb2); ctx.globalAlpha=1; }
  });
  const toRoom=e=>{ const b=c.getBoundingClientRect(); return [(e.clientX-b.left)/b.width*PW,(e.clientY-b.top)/b.height*PH]; };
  const drawOrder=()=>placed().slice().sort((a,b)=>(ITEM[a.id].floor?0:1)-(ITEM[b.id].floor?0:1)||(ITEM[a.id].wall?0:1)-(ITEM[b.id].wall?0:1)||(a.y+ITEM[a.id].h)-(b.y+ITEM[b.id].h));
  const hitDecor=(px,py)=>drawOrder().reverse().find(p=>{const it=ITEM[p.id];return px>=p.x&&px<p.x+it.w&&py>=p.y&&py<p.y+it.h;});   // whatever is drawn on top
  const inR=(R,px,py)=>px>=R.x&&px<R.x+R.w&&py>=R.y&&py<R.y+R.h;
  c.addEventListener('pointerdown',e=>{
    const [px,py]=toRoom(e);
    if(ED.on){ const p=hitDecor(px,py); ED.sel=p||null; ED.moved=false; if(p){ ED.drag={p,ox:px-p.x,oy:py-p.y}; c.setPointerCapture(e.pointerId); trayFade(true); } roomTray(); return; }
  });
  c.addEventListener('pointermove',e=>{ if(!ED.on||!ED.drag) return; const [px,py]=toRoom(e), {p,ox,oy}=ED.drag; const [nx,ny]=clampDecor(ITEM[p.id],Math.round(px-ox),Math.round(py-oy)); if(nx!==p.x||ny!==p.y){ p.x=nx; p.y=ny; ED.moved=true; } });
  c.addEventListener('pointerup',()=>{ trayFade(false); if(ED.drag){ ED.drag=null; if(ED.moved){ save(); tone(500,.04,'square',.02); } } });
  c.addEventListener('click',e=>{
    if(ED.on) return;
    const [px,py]=toRoom(e);
    if(inR(ROOM_WARDROBE,px,py)){ walk(30,186,()=>openShop('closet')); return; }
    if(inR(ROOM_SHELF,px,py)){ walk(150,190,openTrophies); return; }
    if(inR(ROOM_STAIRS,px,py)){ walk(30,274,()=>lodgeHub()); return; }
    if(py>=176) walk(px,py);
  });
  function trayFade(on){ const b=LODGE.el.querySelector('.lg-tray'); if(b) b.classList.toggle('dragging',on); }
  // Arrange for me: every piece you own, placed at random but tidily — rugs in the middle, art at eye level
  // on the walls, furniture against the back and side walls, nothing overlapping. Each press gives a new layout.
  function arrange(){
    const R=Math.random, own=ITEMS.filter(i=>i.cat==='decor'&&owns(i.id)).sort((a,b)=>b.w*b.h-a.w*a.h||b.price-a.price);
    const walls=[], rugs=[], furn=[], out=[];
    const hit=(x,y,w,h,L)=>L.some(b=>x<b.x+b.w+2&&x+w+2>b.x&&y<b.y+b.h+2&&y+h+2>b.y);
    const fit=(it,Z,L,score)=>{ let best=null; for(let k=0;k<220;k++){ const x=Math.round(Z.x+R()*(Z.w-it.w)), y=Math.round(Z.y+R()*(Z.h-it.h)); if(Z.w<it.w||Z.h<it.h||hit(x,y,it.w,it.h,L)) continue;
        const sc=score(x,y,it)+R()*10; if(!best||sc<best.sc) best={x,y,sc}; } return best; };
    let left=0;
    for(const it of own){
      let L,Z,score;
      if(it.wall){ L=walls; Z={x:44,y:92,w:PW-46,h:66}; score=(x,y,i)=>Math.abs(y+i.h/2-118)*1.5; }
      else if(it.floor){ L=rugs; Z={x:44,y:176,w:PW-48,h:120}; score=(x,y,i)=>Math.abs(x+i.w/2-112)*.6+Math.abs(y+i.h/2-238)*.8; if(rugs.length>=3){ left++; continue; } }
      else { L=furn; Z={x:44,y:174,w:PW-46,h:126}; score=(x,y,i)=>Math.min(y-174,(x-44)*1.2,(PW-2-x-i.w)*1.2,(300-y-i.h)*1.6)*2; }
      const b=fit(it,Z,L,score); if(!b){ left++; continue; }
      const [x,y]=clampDecor(it,b.x,b.y); const box={id:it.id,x,y,w:it.w,h:it.h}; L.push(box); out.push({id:it.id,x,y});
    }
    S.lodge.room=out; ED.sel=null; save(); roomTray();
    [523,659,784,1047].forEach((f,i)=>tone(f,.08,'square',.04,i*.06));
    toast(out.length?`Arranged ${out.length} piece${out.length>1?'s':''}`+(left?` · ${left} didn’t fit`:''):'Buy some decor from Silas first','gold');
  }
  function walk(x,y,arrive){ me.tx=clamp(x,10,182); me.ty=clamp(y,186,300); const d=Math.hypot(me.tx-me.x,me.ty-me.y); me.speed=Math.max(40,d/.85); tone(520,.04,'square',.02);
    if(arrive) setTimeout(arrive,d/me.speed*1000+120); }
  // Decorating: the tray of owned decor, and Store for the selected piece.
  function roomTray(){
    const box=LODGE.el.querySelector('.lg-tray'); if(!box) return;
    const unplaced=ITEMS.filter(i=>i.cat==='decor'&&owns(i.id)&&!placed().some(p=>p.id===i.id));
    box.classList.toggle('min',ED.min);
    box.innerHTML=`<div class="lg-tray-h">${ED.sel?`<span>${esc(ITEM[ED.sel.id].name)}</span><button class="lg-btn" data-lg="decStore">Store it</button>`:`<span>${unplaced.length?(ED.min?unplaced.length+' pieces to place':'Tap a piece to place it · drag to move'):(placed().length?'Drag pieces to move them':'Buy decor from Silas the merchant')}</span>`}
        <button class="lg-btn" data-lg="decArrange">Arrange for me</button><button class="lg-btn lg-round" data-lg="decMin" aria-label="${ED.min?'Show pieces':'Hide pieces'}">${ED.min?'▲':'▼'}</button></div>
      <div class="lg-tray-list">${unplaced.map(i=>`<button class="lg-item" data-lg="decPlace" data-id="${i.id}"><span class="lg-ic" data-ic="${i.id}"></span><span class="lg-in">${esc(i.name)}</span></button>`).join('')}</div>`;
    box.querySelectorAll('[data-ic]').forEach(s=>s.appendChild(iconCanvas(ITEM[s.dataset.ic],1)));
  }
  const api={loop,canvas:c,me,ED,arrange,tray:roomTray,
    setEdit(on){ ED.on=on; ED.sel=null; ED.drag=null; let box=LODGE.el.querySelector('.lg-tray');
      if(on&&!box){ box=document.createElement('div'); box.className='lg-tray'; LODGE.el.querySelector('.lg-stage').appendChild(box); }
      if(!on&&box) box.remove(); if(on) roomTray(); save(); },
    place(id){ const it=ITEM[id]; if(!it||!owns(id)||placed().some(p=>p.id===id)) return; const n=placed().length, [x,y]=clampDecor(it,Math.round(96-it.w/2)+(n%3-1)*24,(it.wall?100:226)+(n%2)*14); const p={id,x,y}; S.lodge.room=placed().concat(p); ED.sel=p; ED.min=true; save(); tone(784,.08,'square',.04); roomTray(); },
    store(){ if(!ED.sel) return; S.lodge.room=placed().filter(p=>p!==ED.sel); ED.sel=null; save(); roomTray(); },
  };
  return api;
}
function openTrophies(){
  closeShop(); const box=document.createElement('div'); box.className='lg-shop';
  const fmtd=ts=>new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  box.innerHTML=`<div class="lg-shop-head"><span class="lg-dlg-who">TROPHY SHELF</span><span class="lg-bank-s">${TROPHIES.filter(t=>hasTrophy(t.id)).length} / ${TROPHIES.length}</span><button class="lg-btn lg-round" data-lg="shopClose" aria-label="Close">X</button></div>
    <div class="lg-shop-body"><div class="lg-trophies">${TROPHIES.map(t=>{const h=S.lodge.trophies&&S.lodge.trophies[t.id];return `<div class="lg-trophy ${h?'':'off'}"><span class="lg-ic" data-tr="${t.icon}" data-on="${h?1:0}"></span><div><div class="lg-prev-name">${esc(t.name)}</div><div class="lg-prev-desc">${esc(t.desc)}${h?`<br><span class="gold">${t.id==='bigwin'?fmt$(h.v)+' · ':''}${fmtd(h.at)}</span>`:'<br>Not yet'}</div></div></div>`;}).join('')}</div></div>`;
  LODGE.el.querySelector('.lg-stage').appendChild(box);
  box.querySelectorAll('[data-tr]').forEach(s=>{ const c=document.createElement('canvas'); c.width=12; c.height=12; c.className='px'; c.style.width='36px'; c.style.height='36px'; trophyIcon(c.getContext('2d'),s.dataset.tr,1,1,s.dataset.on==='1'); s.appendChild(c); });
}
Object.assign(LG_ACT,{
  decorate:()=>{ const r=LODGE.room; if(!r) return; r.setEdit(!r.ED.on); setHud('room'); },
  decPlace:b=>LODGE.room&&LODGE.room.place(b.dataset.id),
  decStore:()=>LODGE.room&&LODGE.room.store(),
  decArrange:()=>LODGE.room&&LODGE.room.arrange(),
  decMin:()=>{ const r=LODGE.room; if(!r) return; r.ED.min=!r.ED.min; r.tray(); },
});
titleTrophies();
