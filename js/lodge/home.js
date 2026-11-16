// Your home: My Room grows with your level, from an attic loft to an estate with five rooms and a putting green.
//  • Every home tier is bigger and fancier (walls, floors, trim, chandeliers) and adds windows; bigger homes add rooms.
//  • Thieves break in through the front door (guard dog, bouncer) or a window. Each security camera covers one
//    window; an uncovered window is the easy way in, so a bigger home needs more cameras.
//  • The vault room has no windows: cash you put in it can't be stolen (supabase/update-14-homes.sql).
//  • The Estate's putting green is a real 3-hole course you can play.

const HOMES=[
  {lv:1,  name:'Attic loft',  rooms:['main'],                              windows:1, safe:0},
  {lv:10, name:'Cabin suite', rooms:['main'],                              windows:2, safe:0},
  {lv:20, name:'Chalet',      rooms:['main','bed'],                        windows:3, safe:0},
  {lv:35, name:'Lodge house', rooms:['main','bed','vault'],                windows:4, safe:1e10},
  {lv:50, name:'Mansion',     rooms:['main','bed','vault','game'],         windows:6, safe:1e11},
  {lv:100,name:'Estate',      rooms:['main','bed','vault','game','green'], windows:8, safe:1e12},
];
const ROOM_NAMES={main:'Main room',bed:'Bedroom',vault:'Vault room',game:'Game room',green:'Putting green'};
const HOME_PAL=[
  {w1:'#1f3328',w2:'#1a2d23',wl:'#13241b',wain:LP.wal1,trim:LP.brass0,f1:LP.wal3,f2:'#33220f',fl:'#24170d',floor:'boards'},
  {w1:'#5a3a22',w2:'#4e321d',wl:'#3a2412',wain:'#3a2412',trim:LP.brass0,f1:'#6b4a2a',f2:'#5e4024',fl:'#3a2412',floor:'boards'},
  {w1:'#4a1a22',w2:'#42171e',wl:'#c8a45c',wain:'#2a0e14',trim:LP.brass1,f1:'#8a5a2a',f2:'#7a4e24',fl:'#4a2e14',floor:'boards'},
  {w1:'#1a2440',w2:'#18213b',wl:'#2a3658',wain:'#10182e',trim:LP.brass1,f1:'#7a4a24',f2:'#5e3a1c',fl:'#3a2412',floor:'herring'},
  {w1:'#123a2a',w2:'#0f3324',wl:'#c8a45c',wain:'#0a2418',trim:'#ffd84a',f1:'#e8e2d6',f2:'#c8c0b0',fl:'#a8a090',floor:'marble'},
  {w1:'#16161c',w2:'#131318',wl:'#ffd84a',wain:'#0a0a0e',trim:'#ffd84a',f1:'#f3efe6',f2:'#1a1a20',fl:'#c8a45c',floor:'marble'},
];
// A home can also be gifted by a friend (S.lodge.giftHome): you live in whichever is bigger.
const homeTier=()=>{ const L=myLevel(); let i=0; HOMES.forEach((h,k)=>{ if(L>=h.lv) i=k; }); return Math.max(i,Math.min(HOMES.length-1,S.lodge.giftHome||0)); };
const home=()=>HOMES[homeTier()];
const curRoom=()=>{ const r=S.lodge.roomId||'main'; return home().rooms.includes(r)?r:'main'; };
const roomPlain=()=>{ const r=curRoom(); return r==='vault'||r==='green'; };
const camsOwned=()=>(S.lodge.camsBought||0)+(owns('decor_cameras')?1:0);
// Keep the server's view of your home (windows, cameras, tier) up to date.
function homeSync(){ const i=homeTier(), H=HOMES[i], cams=Math.min(H.windows,camsOwned()); let ch=false;
  if(S.lodge.home!==i){ const up=S.lodge.home!=null&&i>S.lodge.home; S.lodge.home=i; ch=true; if(up) setTimeout(()=>celebrate('New home!',`You moved into the ${H.name}.`,`${H.rooms.length} room${H.rooms.length>1?'s':''} · ${H.windows} windows`),1200); }
  if(S.lodge.windows!==H.windows){ S.lodge.windows=H.windows; ch=true; }
  if(S.lodge.cams!==cams){ S.lodge.cams=cams; ch=true; }
  if(ch) save(); }
setInterval(homeSync,5000); setTimeout(homeSync,800);
// A friend gave you a home (arrives through the inbox, see socInbox in js/league/social.js).
function homeGiftInbox(it){ const t=Math.max(0,Math.min(HOMES.length-1,+it.amount||0)), H=HOMES[t], from=it.label||'A friend';
  if(t>(S.lodge.giftHome||0)) S.lodge.giftHome=t;
  S.lodge.home=homeTier(); S.lodge.windows=home().windows; save();
  setTimeout(()=>celebrate('Free upgrade!',`${from} gave you the ${H.name} — for free.`,`${H.rooms.length} rooms · ${H.windows} windows`),600); }
// Check for gifts and robberies soon after opening the app, not only on the League tab.
setTimeout(()=>{ if(typeof socRefresh==='function') socRefresh(true); },4000);

/* ---------- Drawing the rooms ---------- */
const HOME_BG={};
function drawHomeBg(tier,room,wins,cams){
  const key=[tier,room,wins,cams].join('|'); if(HOME_BG[key]) return HOME_BG[key];
  const P=HOME_PAL[tier]||HOME_PAL[0], c=document.createElement('canvas'); c.width=PW; c.height=PH; const x=c.getContext('2d'); x.imageSmoothingEnabled=false;
  const steel=room==='vault', turf=room==='green';
  // walls
  for(let xx=0;xx<PW;xx+=7){ rect(x,xx,0,7,172,steel?((xx/7)%2?'#3a3a44':'#34343d'):(xx/7)%2?P.w1:P.w2); rect(x,xx,0,1,172,steel?'#2a2a30':P.wl); }
  if(steel) for(let y=14;y<150;y+=18) for(let xx=4;xx<PW;xx+=14) rect(x,xx,y,1,1,'#8a929e');
  // ceiling: the attic slopes, or a flat ceiling with crown moulding in bigger homes
  if(tier===0&&!steel){ for(let i=0;i<34;i++){ rect(x,0,i,34-i,1,LP.wal0); rect(x,PW-34+i,i,34-i,1,LP.wal0); } rect(x,0,0,PW,6,LP.wal0); for(const bx of [40,92,144]) rect(x,bx,0,6,10,LP.wal3); }
  else { rect(x,0,0,PW,6,LP.wal0); rect(x,0,6,PW,2,P.trim); if(tier>=4) for(let xx=2;xx<PW;xx+=6) rect(x,xx,8,3,2,P.trim); }
  // wainscot and floor
  rect(x,0,150,PW,22,steel?'#2a2a30':P.wain); rect(x,0,150,PW,2,steel?'#8a929e':P.trim);
  if(tier>=3&&!steel) for(let xx=6;xx<PW;xx+=24){ rect(x,xx,155,16,13,'rgba(255,255,255,.05)'); rect(x,xx,155,16,1,P.trim); }
  for(let y=172;y<PH;y+=5){
    if(turf){ rect(x,0,y,PW,5,(y/5)%2?'#5aa850':'#519c48'); continue; }
    if(steel){ rect(x,0,y,PW,5,(y/5)%2?'#4a4a52':'#44444c'); rect(x,0,y+4,PW,1,'#2a2a30'); continue; }
    if(P.floor==='marble'){ for(let xx=0;xx<PW;xx+=10) rect(x,xx,y,10,5,((xx/10|0)+(y/5|0))%2?P.f1:P.f2); continue; }
    if(P.floor==='herring'){ for(let xx=0;xx<PW;xx+=8) rect(x,xx,y,8,5,((xx/8|0)+(y/5|0))%2?P.f1:P.f2); rect(x,0,y+4,PW,1,P.fl); continue; }
    rect(x,0,y,PW,5,(y/5)%2?P.f1:P.f2); rect(x,0,y+4,PW,1,P.fl); for(let xx=((y/5)%3)*22;xx<PW;xx+=64) rect(x,xx,y,1,4,P.fl);
  }
  if(turf){ for(let yy=-10;yy<=10;yy++){ const w=Math.round(40*Math.sqrt(1-(yy/10.5)**2)); rect(x,110-w,236+yy,w*2,1,(yy+10)%3?'#72c86c':'#66bc62'); } rect(x,128,234,3,2,'#121216'); for(let i=0;i<16;i++) rect(x,129,218+i,1,1,i%4<2?'#f3ead8':'#d0303a'); rect(x,130,218,6,4,'#d0303a'); }
  // windows: the big one (window 1) and smaller ones up high; a camera marks each covered window
  if(!steel&&!turf){
    rect(x,64,28,40,56,LP.wal0); rect(x,66,30,36,52,tier>=4?P.trim:LP.wal4); rect(x,68,32,32,48,LP.night1); rect(x,62,82,44,4,tier>=4?P.trim:LP.wal5);
    const spots=[8,28,48,112,132,152,172].filter(sx=>!(room==='main'&&sx>=112));
    const extra=room==='main'?Math.min(wins-1,spots.length):0;
    for(let k=0;k<extra;k++){ const sx=spots[k]; rect(x,sx,11,14,16,LP.wal0); rect(x,sx+1,12,12,14,LP.night1); rect(x,sx+6,12,1,14,LP.wal4); rect(x,sx+1,18,12,1,LP.wal4); }
    if(room==='main'){ const pos=[[100,28]].concat(spots.slice(0,extra).map(sx=>[sx+11,10]));
      pos.forEach(([cx,cy],k)=>{ if(k<cams){ rect(x,cx,cy,4,3,'#cfd9e0'); rect(x,cx+3,cy+1,1,1,'#ff3a3a'); } }); }
  }
  // chandelier in the mansion and estate
  if(tier>=4&&!turf){ rect(x,95,8,2,10,P.trim); rect(x,86,18,20,2,P.trim); for(const cx of [86,92,98,104]){ rect(x,cx,15,2,3,'#fff3b0'); } for(const cx of [88,95,102]) rect(x,cx,20,1,4,'#bff6ff'); }
  // wardrobe and the stairs down (every room), trophy shelf (main room)
  const W=ROOM_WARDROBE; rect(x,W.x,W.y,W.w,W.h,LP.wal4); rect(x,W.x,W.y,W.w,4,LP.wal5); rect(x,W.x+2,W.y+6,14,W.h-10,LP.wal3); rect(x,W.x+18,W.y+6,14,W.h-10,LP.wal3);
  rect(x,W.x+14,W.y+40,2,6,LP.brass1); rect(x,W.x+18,W.y+40,2,6,LP.brass1); rect(x,W.x+4,W.y+10,10,24,'#3d5560'); rect(x,W.x+5,W.y+12,2,8,'#7fa8c0');
  if(room==='main'){ const T=ROOM_SHELF; for(const sy of [T.y+28,T.y+58]){ rect(x,T.x,sy,T.w,4,LP.wal5); rect(x,T.x,sy,T.w,1,LP.wal6); } ptext(x,'TROPHIES',T.x+T.w/2-ptextW('TROPHIES')/2,T.y-1,LP.brass1); }
  const D=ROOM_STAIRS; rect(x,D.x,D.y,D.w,D.h,LP.ink); for(let i=0;i<4;i++) rect(x,D.x,D.y+6+i*10,D.w-i*8,3,LP.wal4); rect(x,D.x+D.w-2,D.y-10,2,D.h+10,LP.brass1); rect(x,D.x,D.y-10,D.w,2,LP.brass1); ptext(x,'DOWN',6,D.y-8,LP.brass2);
  // what makes each room itself
  if(steel){ for(let yy=-26;yy<=26;yy++)for(let xx=-26;xx<=26;xx++){ const d=xx*xx+yy*yy; if(d<=676) rect(x,118+xx,92+yy,1,1,d>560?'#8a929e':'#5a5a64'); }
    for(let a=0;a<8;a++){ const an=a/8*6.283; rect(x,118+Math.cos(an)*16,92+Math.sin(an)*16,3,3,'#cfd9e0'); } rect(x,114,88,8,8,LP.brass1); ptext(x,'VAULT',118-ptextW('VAULT')/2,124,'#cfd9e0'); }
  if(room==='game'){ ptext(x,'GAME ROOM',96-ptextW('GAME ROOM')/2,16,'#ff3ad0'); rect(x,40,24,112,1,'#3affd0'); }
  if(turf){ ptext(x,'PUTTING GREEN',96-ptextW('PUTTING GREEN')/2,40,'#f3ead8'); }
  if(room==='bed'){ ptext(x,'BEDROOM',96-ptextW('BEDROOM')/2,16,P.trim); }
  return HOME_BG[key]=c;
}
drawRoomStatic=function(){ return drawHomeBg(homeTier(),curRoom(),home().windows,Math.min(home().windows,camsOwned())); };
// Friends see your main room, in your home's style.
drawFriendRoom=function(cv,d){
  const x=cv.getContext('2d'); x.imageSmoothingEnabled=false; x.drawImage(drawHomeBg(d.home||0,'main',d.windows||1,d.cams||0),0,0);
  const room=(Array.isArray(d.room)?d.room:[]).filter(p=>ITEM[p.id]&&DECOR_ART[p.id]);
  room.sort((a,b)=>(ITEM[a.id].floor?0:1)-(ITEM[b.id].floor?0:1)||(ITEM[a.id].wall?0:1)-(ITEM[b.id].wall?0:1)||(a.y+ITEM[a.id].h)-(b.y+ITEM[b.id].h));
  for(const p of room) DECOR_ART[p.id](x,p.x,p.y,0);
  drawPerson(x,'player','idle0',typeof lookFor==='function'?lookFor(d.outfit):null,140,262,-1);
};

/* ---------- Rooms: each has its own decor ---------- */
function goRoom(id){
  if(!home().rooms.includes(id)) return;
  S.lodge.rooms=S.lodge.rooms||{}; S.lodge.rooms[curRoom()]=S.lodge.room||[];
  S.lodge.roomId=id; S.lodge.room=S.lodge.rooms[id]||[]; save(); closeShop(); openRoom();
  toast(typeof roomLabel==='function'?roomLabel(id):ROOM_NAMES[id],'gold');
}
// Your main room is what friends see when they visit, so keep a copy of it.
const _saveHome=save; save=function(){ if(S.lodge&&curRoom()==='main'){ S.lodge.rooms=S.lodge.rooms||{}; S.lodge.rooms.main=S.lodge.room; } return _saveHome.apply(this,arguments); };

/* ---------- The Home panel ---------- */
function homeHud(mode){
  const bar=LODGE.el&&LODGE.el.querySelector('.lg-bottom'); if(!bar) return; let b=document.getElementById('lgHome');
  if(mode==='room'){ if(!b){ b=document.createElement('button'); b.id='lgHome'; b.className='lg-btn'; b.dataset.lg='homeOpen'; b.textContent='Home'; const lvl=document.getElementById('lgLvl'); bar.insertBefore(b,lvl); } }
  else if(b) b.remove();
}
const camPrice=()=>nice(Math.max(100000,worth()*.01));
function homeOpen(){
  closeShop(); homeSync(); const i=homeTier(), H=HOMES[i], next=HOMES[i+1]&&!HOMES[i+1].owner?HOMES[i+1]:null, cams=Math.min(H.windows,camsOwned()), box=document.createElement('div'); box.className='lg-shop lg-home';
  const safeCap=H.safe;
  box.innerHTML=`<div class="lg-shop-head"><span class="lg-dlg-who">${esc(H.name.toUpperCase())}</span><span class="lg-bank-s">LV ${myLevel()}</span><button class="lg-btn lg-round" data-lg="shopClose" aria-label="Close">X</button></div>
    <div class="lg-shop-body">
      <div class="lg-prev-desc">${next?`Next home: <b>${esc(next.name)}</b> at level ${next.lv} — ${next.rooms.length} rooms, ${next.windows} windows.`:'You own the finest home in the lodge.'}</div>
      <div class="lg-home-h">ROOMS</div><div class="lg-rooms">${H.rooms.map(r=>`<button class="lg-btn ${r===curRoom()?'lg-gold':''}" data-lg="homeRoom" data-v="${r}">${esc(typeof roomLabel==='function'?roomLabel(r):ROOM_NAMES[r])}</button>`).join('')}</div>
      <div class="lg-home-h">SECURITY</div>
      <div class="lg-prev-desc">${H.windows} window${H.windows>1?'s':''} · ${cams} covered by cameras${cams<H.windows?` · <b>${H.windows-cams} open</b> — the easy way in for thieves`:' · all covered'}</div>
      ${cams<H.windows?`<button class="lg-btn lg-gold" data-lg="homeCam">Add a camera · ${k$(camPrice())}</button>`:''}
      ${safeCap?`<div class="lg-home-h">VAULT ROOM</div><div class="lg-prev-desc">No windows, no way in. Cash in here can’t be stolen — but you can’t bet it either.<br>Stored: <b>${fmt$(S.safe||0)}</b> of ${k$(safeCap)}</div>
        <div class="lg-rooms"><button class="lg-btn" data-lg="homeDeposit">Put cash in</button><button class="lg-btn" data-lg="homeWithdraw" ${(S.safe||0)>0?'':'disabled'}>Take cash out</button></div>`
        :`<div class="lg-home-h">VAULT ROOM</div><div class="lg-prev-desc">Comes with the Lodge house at level 35: a windowless room where your savings can’t be stolen.</div>`}
      ${H.rooms.includes('green')?`<div class="lg-home-h">PUTTING GREEN</div><button class="lg-btn lg-gold" data-lg="homeGolf">⛳ Practise on your green · 2× golf XP</button>`:''}
      <div class="lg-home-h">ALL HOMES</div>${HOMES.map((h,k)=>`<div class="lg-home-row ${k===i?'on':k<i?'done':''}"><span>${h.owner?'👑':'Lv '+h.lv}</span><b>${esc(h.name)}</b><small>${h.rooms.length} room${h.rooms.length>1?'s':''} · ${h.windows} win.</small></div>`).join('')}
    </div>`;
  LODGE.el.querySelector('.lg-stage').appendChild(box);
}
Object.assign(LG_ACT,{
  homeOpen:()=>homeOpen(),
  homeRoom:b=>goRoom(b.dataset.v),
  homeCam:()=>{ const H=home(); if(Math.min(H.windows,camsOwned())>=H.windows) return; const pr=camPrice(); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    setBank(-pr); S.spent=(S.spent||0)+pr; S.lodge.camsBought=(S.lodge.camsBought||0)+1; homeSync(); tone(880,.08,'square',.04); toast('📹 Camera installed','gold'); homeOpen(); },
  homeDeposit:()=>{ const cap=home().safe-(S.safe||0); if(cap<=0){ toast('Your vault room is full','loss'); return; }
    askAmount({title:'Put cash in the vault',value:Math.min(S.bank,cap),max:Math.min(S.bank,cap),note:'Safe from thieves',onSet:v=>{ S.bank-=v; S.safe=(S.safe||0)+v; save(); hudBank(); homeOpen(); toast('🔐 '+fmt$(v)+' locked away','gold'); },onCancel:()=>homeOpen()}); },
  homeWithdraw:()=>askAmount({title:'Take cash out of the vault',value:S.safe||0,max:S.safe||0,onSet:v=>{ S.safe-=v; S.bank+=v; save(); hudBank(); homeOpen(); toast(fmt$(v)+' back in your bankroll','gold'); },onCancel:()=>homeOpen()}),
  homeGolf:()=>{ closeShop(); openGolf({course:'home',holes:3}); },
});

/* ---------- Your own putting green: 3 short holes, hidden from the Golf tab's course list ---------- */
Object.defineProperty(GOLF_COURSES,'home',{enumerable:false,value:{name:()=>'Home green',blurb:'Three short holes on your own estate.',holes:[
  {par:2,len:60,fair:[[0,10,0,40,14]],green:[0,52,18,14],sand:[[14,44,4,3]],water:[],trees:[],deco:[]},
  {par:2,len:70,fair:[[0,10,4,46,14]],green:[6,60,18,14],sand:[[-8,66,4,3]],water:[[0,30,10,4]],trees:[],deco:[]},
  {par:3,len:110,fair:[[0,10,-6,80,16]],green:[-8,98,18,14],sand:[[8,90,5,4],[-24,100,4,3]],water:[[10,55,12,8]],trees:[[-24,60,6]],deco:[]},
]}});

/* ---------- Robbing: choose your way in ---------- */
function robChoices(d,shield,left){
  if(shield) return `<button class="btn wide" disabled>🛡️ Shielded for ${left}h after a robbery</button>`;
  if(!d.tries_left) return `<button class="btn wide" disabled>No tries left today</button>`;
  const items=(d.defense||{}).items||[], guard=[items.includes('decor_guard_dog')?'dog':'',items.includes('decor_bouncer')?'bouncer':''].filter(Boolean);
  const wins=Math.max(1,d.windows||1), cams=d.cams||0;
  let html=`<div class="rob-h">🕵️ Pick your way in · ${d.tries_left} ${d.tries_left===1?'try':'tries'} left today</div><div class="rob-grid">
    <button class="rob-e" data-a="heistStart" data-v="0"><b>🚪 Front door</b><small>${guard.length?'Guarded: '+guard.join(' & '):'No guards'}</small></button>`;
  for(let w=1;w<=wins;w++){ const cov=w<=cams; html+=`<button class="rob-e ${cov?'cov':'open'}" data-a="heistStart" data-v="${w}"><b>🪟 Window ${w}</b><small>${cov?'📹 Camera — risky':'No camera — easiest'}</small></button>`; }
  html+=`</div>${d.has_safe?'<p class="small muted" style="margin:6px 0 0">🔐 They keep savings in a vault room — that cash can’t be taken.</p>':''}`;
  return html;
}
