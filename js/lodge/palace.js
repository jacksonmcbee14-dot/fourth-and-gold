// 👑 The Palace: an owner-only home above the Estate (no level reaches it; it is gifted through the inbox, kind
// palace — older versions leave that kind alone). Eight rooms: throne room, royal suite, ballroom, grand pool, supercar garage, treasury,
// game room and putting green. Royal purple and gold-lattice walls, marble columns, a crown chandelier, a throne on a
// gold dais, a red carpet, and things that move: twinkling sparkles, a disco floor, pool shimmer, blinking headlights.
// It comes with 12 cameras (one per window) and both butlers in diamond tuxedos.

HOMES.push({lv:Infinity,owner:true,name:'Palace',rooms:['main','bed','ball','pool','garage','vault','game','green'],windows:12,safe:1e13,
  names:{main:'Throne room',bed:'Royal suite',vault:'Treasury'}});
HOME_PAL.push({w1:'#3a1458',w2:'#32104c',wl:'#24083a',wain:'#1a0628',trim:'#ffd84a',f1:'#f3efe6',f2:'#e8d9a8',fl:'#c8a45c',floor:'marble'});
Object.assign(ROOM_NAMES,{ball:'Ballroom',pool:'Grand pool',garage:'Supercar garage'});
const PALACE=HOMES.length-1;
const roomLabel=r=>(home().names&&home().names[r])||ROOM_NAMES[r];

const PG='#ffd84a', PG2='#c8962a', PG3='#fff3b0', PRED='#b0102a', PRED2='#7a0a1c', PRUBY='#e0203a', PSAPH='#3a7aff', PEMER='#30d060';
function palCrown(x,cx,y,s){   // a little gold crown, s = scale 1 or 2
  rect(x,cx-4*s,y+3*s,9*s,3*s,PG); for(const k of [-4,0,4]) rect(x,cx+k*s,y,s,3*s,PG); rect(x,cx-s,y+4*s,2*s,s,PRUBY); }
function palCircle(x,cx,cy,r,col,edge){ for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){ const d=xx*xx+yy*yy; if(d<=r*r) rect(x,cx+xx,cy+yy,1,1,edge&&d>(r-1.2)**2?edge:col); } }

// Everything that doesn't move, drawn once on top of the regular room.
function palStatic(x,room,cams){
  const P=HOME_PAL[PALACE];
  if(room==='green') return;
  if(room==='vault'){ palCrown(x,118,54,2); ptext(x,'ROYAL',118-ptextW('ROYAL')/2,136,PG);
    for(let r=0;r<4;r++) for(let k=0;k<4-r;k++){ const bx=136+k*12+r*6, by=226-r*6; rect(x,bx,by,11,6,PG); rect(x,bx,by,11,1,PG3); rect(x,bx,by+5,11,1,PG2); }
    for(let k=0;k<14;k++){ const cx=60+(k*7)%40, cy=230-(k%4)*3; palCircle(x,cx,cy,2,PG,PG2); }
    return; }
  // clear the old chandelier and room sign, then gold lattice walls
  for(let xx=58;xx<120;xx++) rect(x,xx,8,1,20,xx%7===0?P.wl:(Math.floor(xx/7)%2?P.w1:P.w2));
  const skip=(xx,yy)=>(xx>=60&&xx<=108&&yy>=20&&yy<=88)||(room==='main'&&xx>=116&&yy<=94)||(room==='main'&&yy<30&&xx<64)||(xx<=42&&yy>=88);
  for(let yy=32;yy<148;yy+=12) for(let xx=((yy/12)%2)*6+3;xx<PW;xx+=12) if(!skip(xx,yy)){ rect(x,xx,yy-1,1,1,PG2); rect(x,xx-1,yy,3,1,PG2); rect(x,xx,yy+1,1,1,PG2); rect(x,xx,yy,1,1,PG); }
  // marble columns with gold capitals
  for(const cx of [48,110]){ rect(x,cx,10,7,140,'#efe8dc'); rect(x,cx+1,12,1,136,'#d8d0c0'); rect(x,cx+5,12,1,136,'#d8d0c0');
    for(let v=0;v<4;v++) rect(x,cx+2+(v%2),24+v*30,1,14,'#c8c0b0'); rect(x,cx-2,8,11,3,PG); rect(x,cx-2,11,11,1,PG2); rect(x,cx-2,146,11,4,PG); }
  // gold arch over the big window
  for(let xx=-24;xx<=24;xx++){ const h=Math.round(Math.sqrt(576-xx*xx)*.3); rect(x,84+xx,27-h,1,h,PG); rect(x,84+xx,27-h,1,1,PG3); }
  rect(x,62,26,44,2,PG2);
  // crown chandelier
  rect(x,84,0,2,7,PG); rect(x,68,14,34,5,PG); rect(x,68,18,34,1,PG2);
  for(let k=0;k<5;k++){ const px=68+k*8; rect(x,px,8,3,6,PG); rect(x,px+1,6,1,2,PG3); }
  [[71,PRUBY],[78,PSAPH],[85,PEMER],[92,PSAPH],[98,PRUBY]].forEach(([jx,c])=>rect(x,jx,15,2,2,c));
  for(let k=0;k<7;k++) rect(x,69+k*5,19,1,4+(k%2)*3,'#bff6ff');
  // red carpet down the middle of the floor
  rect(x,70,172,28,PH-172,PRED); rect(x,70,172,2,PH-172,PG); rect(x,96,172,2,PH-172,PG);
  for(let yy=180;yy<PH;yy+=12){ rect(x,83,yy,2,1,PG); rect(x,82,yy+1,4,1,PG); rect(x,83,yy+2,2,1,PG); }
  const label=t=>{ const w=ptextW(t), lx=150-w/2; rect(x,lx-4,96,w+8,12,PG); rect(x,lx-3,97,w+6,10,'#1a0628'); ptext(x,t,lx,99,'#ffffff'); };
  if(room==='main'){
    // banners
    for(const [bx,by] of [[18,32],[170,98]]){ rect(x,bx,by,14,42,PRED); rect(x,bx,by,14,2,PG); rect(x,bx,by+42,7,4,PRED); rect(x,bx+7,by+42,7,2,PRED); rect(x,bx-1,by-2,16,2,PG2); palCrown(x,bx+7,by+12,1); }
    // throne on a gold dais
    rect(x,56,166,56,6,PG2); rect(x,60,160,48,6,PG); rect(x,60,160,48,1,PG3);
    const o=12;
    rect(x,70,92+o,28,56,PG); rect(x,73,96+o,22,40,PRED); rect(x,74,97+o,2,38,'#d02040'); rect(x,84,100+o,1,30,PRED2);
    rect(x,76,86+o,16,6,PG); rect(x,76,82+o,3,4,PG); rect(x,82,80+o,4,6,PG); rect(x,89,82+o,3,4,PG); rect(x,83,87+o,2,2,PSAPH); rect(x,77,87+o,1,1,PRUBY); rect(x,90,87+o,1,1,PRUBY);
    rect(x,64,116+o,6,20,PG); rect(x,98,116+o,6,20,PG); rect(x,66,126+o,36,6,PRED); rect(x,66,132+o,36,4,PG); rect(x,66,136+o,3,10,PG2); rect(x,99,136+o,3,10,PG2);
    rect(x,62,166,44,6,'#1a1006'); ptext(x,'OWNER',84-ptextW('OWNER')/2,166,PG);
  }
  if(room==='bed'){ label('ROYAL SUITE');
    rect(x,116,118,70,6,'#5a1a8a'); for(let xx=116;xx<186;xx+=4) rect(x,xx,124,2,3,PG);
    rect(x,117,124,3,84,PG); rect(x,182,124,3,84,PG); rect(x,120,148,62,28,PG); rect(x,123,151,56,22,PRED); palCrown(x,151,154,1);
    rect(x,118,176,68,10,'#f3ead8'); rect(x,124,172,16,6,'#ffffff'); rect(x,162,172,16,6,'#ffffff'); rect(x,118,184,68,22,PRED); rect(x,118,184,68,2,PG); rect(x,118,204,68,2,PG); }
  if(room==='ball'){ label('BALLROOM');
    rect(x,150,0,1,28,'#cfd9e0');
    for(let yy=-7;yy<=7;yy++)for(let xx=-7;xx<=7;xx++) if(xx*xx+yy*yy<=49) rect(x,150+xx,36+yy,1,1,((xx+8)>>1)+((yy+8)>>1)&1?'#e8eef4':'#8a929e'); }
  if(room==='pool'){ label('GRAND POOL');
    rect(x,48,188,140,94,PG); rect(x,51,191,134,88,'#2a90c8'); for(let yy=193;yy<278;yy+=6) rect(x,51,yy,134,2,'#3ab0e0'); for(const lx of [84,118,152]) rect(x,lx,191,1,88,'#bff6ff');
    rect(x,150,182,34,4,'#cfd9e0'); rect(x,180,182,3,8,'#8a929e');
    for(const [tx,ty] of [[44,140],[176,124]]){ rect(x,tx,ty+24,10,10,PG2); rect(x,tx+4,ty+4,2,22,'#7a4e24'); for(const [dx,dy,w] of [[-6,2,8],[4,0,8],[-2,-2,8],[2,4,6],[-4,6,6]]) rect(x,tx+4+dx,ty+dy,w,2,'#30a050'); } }
  if(room==='garage'){ label('SUPERCAR GARAGE');
    rect(x,120,108,64,42,'#4a4a52'); for(let yy=110;yy<150;yy+=5) rect(x,120,yy,64,1,'#3a3a40'); rect(x,120,108,64,2,PG);
    for(let xx=56;xx<190;xx+=34) rect(x,xx,196,2,96,'#f3ead8');
    const car=(cy,body,dark)=>{ rect(x,64,cy+6,84,12,body); rect(x,64,cy+6,84,2,PG3); rect(x,88,cy-2,36,10,dark); rect(x,92,cy,12,6,'#7fd0ff'); rect(x,108,cy,12,6,'#7fd0ff');
      rect(x,146,cy+8,4,3,PG3); rect(x,64,cy+8,3,3,'#ff3a3a'); palCircle(x,80,cy+19,6,'#16161c'); palCircle(x,132,cy+19,6,'#16161c'); palCircle(x,80,cy+19,2,'#cfd9e0'); palCircle(x,132,cy+19,2,'#cfd9e0'); };
    car(200,PG,'#16161c'); car(250,'#c0102a','#16161c'); }
  if(room==='game'){ label('GAME ROOM'); }
}
const _drawHomeBgP=drawHomeBg;
drawHomeBg=function(tier,room,wins,cams){ const c=_drawHomeBgP(tier,room,wins,cams); if(tier===PALACE&&!c._pal){ palStatic(c.getContext('2d'),room,cams); c._pal=1; } return c; };

// Things that move, drawn every frame on top.
const PAL_CV=document.createElement('canvas'); PAL_CV.width=PW; PAL_CV.height=PH;
function palAnim(x,room,t){
  if(room==='green') return;
  for(let i=0;i<22;i++){ const s=Math.sin(t*2.6+i*1.7); if(s<.75) continue; const px=(i*53+11)%PW, py=room==='vault'?40+(i*29)%120:30+(i*37)%118;
    rect(x,px,py,1,1,'#ffffff'); if(s>.9){ rect(x,px-1,py,1,1,PG); rect(x,px+1,py,1,1,PG); rect(x,px,py-1,1,1,PG); rect(x,px,py+1,1,1,PG); } }
  if(room==='vault') return;
  const k=Math.floor(t*3)%5; [[71,PRUBY],[78,PSAPH],[85,PEMER],[92,PSAPH],[98,PRUBY]].forEach(([jx],i)=>{ if(i===k) rect(x,jx,15,2,2,'#ffffff'); });
  if(room==='main'){ for(let i=0;i<8;i++){ const y=PH-((t*14+i*41)%(PH-180)), xx=72+((i*7)%24); rect(x,xx,y,1,1,(i%2)?PG:PG3); } }
  if(room==='ball'){ const cols=['#ff3a6a','#ffd84a','#3affd0','#3a7aff','#b03aff','#ff8a3a'];
    for(let j=0;j<10;j++) for(let i=0;i<16;i++){ const tx=12+i*11, ty=182+j*11; if(tx>=70&&tx<=96) continue; if(tx<44&&ty>268) continue;
      rect(x,tx,ty,10,10,cols[(i+j+Math.floor(t*4))%6]); rect(x,tx,ty,10,1,'rgba(255,255,255,.35)'); }
    for(let i=0;i<9;i++){ const a=t*.8+i*.7, px=150+Math.cos(a)*(40+i*9), py=80+Math.sin(a*1.3)*50; if(px>0&&px<PW) rect(x,px,py,2,2,cols[i%6]); } }
  if(room==='pool'){ for(let k2=0;k2<12;k2++){ const sx=52+((k2*23+t*18)%126), sy=194+k2*7; rect(x,sx,sy,6,1,'#e6fbff'); } }
  if(room==='garage'){ const on=Math.sin(t*5)>0; for(const cy of [200,250]){ if(on){ rect(x,150,cy+7,8,5,'rgba(255,243,176,.6)'); rect(x,158,cy+6,10,7,'rgba(255,243,176,.25)'); }
    rect(x,66,cy+25,80,2,`rgba(176,58,255,${.35+.3*Math.sin(t*3)})`); } }
}
const _drawRoomStaticP=drawRoomStatic;
drawRoomStatic=function(){ const bg=_drawRoomStaticP(); if(homeTier()!==PALACE) return bg;
  const x=PAL_CV.getContext('2d'); x.imageSmoothingEnabled=false; x.clearRect(0,0,PW,PH); x.drawImage(bg,0,0); palAnim(x,curRoom(),performance.now()/1000); return PAL_CV; };

// Moving in: the Palace comes with a camera on every window, and its own announcement.
const _homeGiftInboxP=homeGiftInbox;
homeGiftInbox=function(it){ if(+it.amount!==PALACE) return _homeGiftInboxP(it);
  S.lodge.giftHome=PALACE; S.lodge.camsBought=Math.max(S.lodge.camsBought||0,HOMES[PALACE].windows); S.lodge.home=PALACE; S.lodge.windows=HOMES[PALACE].windows; save(); homeSync();
  try{ fx.confetti(220); fx.coins(120,2600); }catch(e){} [523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.14,'square',.05,i*.1));
  setTimeout(()=>celebrate('👑 The Palace',`Built for ${it.label||'the owner of the game'}. Throne room, royal suite, ballroom, grand pool, supercar garage, treasury, game room and putting green.`,'8 rooms · 12 windows · 12 cameras'),600); };
