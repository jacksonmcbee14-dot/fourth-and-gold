// Lodge Links: a 6-hole 8-bit golf course out the lodge's back door.
// Tap the course to aim, pick a club (it picks one for you), tap SWING and tap again with the marker in the green.
// Green = a perfect strike. Yellow = a little off. Red = a big miss (left side hooks left, right side slices right).
// Wind pushes the ball in the air. Water and out of bounds cost a stroke; sand and rough cost distance.
// The course art changes with the season (js/season.js). Challenges use a seed so both players get the same wind.

const GOLF_CLUBS=[ // [short, name, max carry in yards, seconds for the meter to cross, roll after landing (share of carry)]
  ['DR','Driver',240,.95,.14],['3W','3 wood',215,1.0,.12],['5I','5 iron',175,1.1,.08],['7I','7 iron',150,1.15,.06],
  ['9I','9 iron',125,1.2,.05],['PW','Wedge',100,1.3,.03],['SW','Sand wedge',70,1.35,.02],['PT','Putter',40,1.5,0],
];
// Holes in yards: x is left(-)/right(+) of the tee, y is forward from the tee.
// fair: capsules [x1,y1,x2,y2,radius] · green/sand/ellipse water: [x,y,rx,ry] · capsule water: [x1,y1,x2,y2,r] · trees: [x,y,r]
const GOLF_HOLES=[
  {par:4,len:340,fair:[[0,30,0,300,20]],green:[2,332,13,11],sand:[[-19,318,7,5],[20,250,8,5]],water:[],
   trees:[[-40,120,9],[44,180,10],[-38,240,8],[38,90,8],[-34,334,9],[34,330,8]],deco:[[16,4,'man'],[-14,0,'gift']]},
  {par:3,len:155,fair:[[0,18,0,40,12]],green:[0,150,14,11],sand:[[15,165,7,4],[-16,139,5,4]],water:[[0,96,34,18]],
   trees:[[-36,60,8],[34,128,9],[-34,165,8]],deco:[[16,0,'man']]},
  {par:4,len:360,fair:[[0,30,8,190,20],[8,190,-48,322,18]],green:[-58,346,13,11],sand:[[-36,352,6,5],[-72,334,5,4]],water:[[-46,170,18,26]],
   trees:[[34,232,10],[26,284,9],[-6,262,8],[38,120,8],[-34,92,8]],deco:[[-16,2,'gift']]},
  {par:5,len:480,fair:[[0,30,24,232,22],[24,232,-8,442,20]],green:[-10,468,14,11],sand:[[11,456,6,5],[-29,462,6,4],[44,262,7,5]],water:[[-120,300,120,300,6]],
   trees:[[-34,150,9],[56,190,9],[-44,250,10],[-40,380,9],[40,400,9]],deco:[[18,2,'man'],[-16,2,'gift']]},
  {par:3,len:175,fair:[[0,16,0,30,10]],green:[0,172,15,12],sand:[[-13,186,5,3]],water:[[0,166,38,30]],
   trees:[[-44,90,9],[42,120,9]],deco:[[16,0,'man']]},
  {par:4,len:395,fair:[[0,30,-8,212,20],[-8,212,42,352,18]],green:[48,380,13,11],sand:[[30,372,6,5],[64,386,5,5],[-22,216,8,5]],water:[[74,250,18,42]],
   trees:[[-44,300,10],[-30,350,9],[20,120,9],[-36,110,8],[8,270,8]],deco:[[-16,2,'gift'],[14,2,'man']]},
];
const GOLF_PAR=GOLF_HOLES.reduce((s,h)=>s+h.par,0);
const GPAL={
  holiday:{rough:['#dfe8ee','#cfdbe3'],fair:['#5a9a58','#4f8c4e'],green:['#72c86c','#66bc62'],sand:['#e9d6a2','#dcc68c'],water:['#a8d8ee','#c4e6f5'],oob:['#9fb0bf','#93a5b5'],leaf:['#1a4232','#24533e'],tip:'#f3ead8',flag:'#c0505a',pole:'cane',waterName:'Thin ice!'},
  winter: {rough:['#d6e0e6','#c7d3db'],fair:['#5a9058','#4f844e'],green:['#6ab866','#60ac5c'],sand:['#e1d0a2','#d4c08c'],water:['#a0cfe6','#bfe0f0'],oob:['#9fb0bf','#93a5b5'],leaf:['#163a2c','#1f4a38'],tip:'#f3ead8',flag:'#4a7fd0',pole:'#f3ead8',waterName:'Thin ice!'},
  spring: {rough:['#3f7a3a','#386f35'],fair:['#5aa850','#519c48'],green:['#78d26c','#6ec664'],sand:['#eadaa8','#ddca90'],water:['#2b6cb0','#3a7cc0'],oob:['#2a4a2a','#264426'],leaf:['#e88aa8','#f2b8c8'],tip:'#fff0f4',flag:'#f2d24b',pole:'#f3ead8',waterName:'Splash!'},
  summer: {rough:['#8a9a4a','#7f8f44'],fair:['#5aa850','#519c48'],green:['#78d26c','#6ec664'],sand:['#f0dca0','#e4cc88'],water:['#1e88b0','#2a98c0'],oob:['#c8b070','#bca464'],leaf:['#2a6a3a','#3a8a4a'],tip:'#8ac85a',flag:'#e0303a',pole:'#f3ead8',waterName:'Splash!'},
  fall:   {rough:['#6a7a3a','#627036'],fair:['#5a9a50','#518e48'],green:['#70c464','#66b85c'],sand:['#e6d2a0','#d8c28a'],water:['#2b6cb0','#3a7cc0'],oob:['#3a3a2a','#343424'],leaf:['#c9782c','#e8963c'],tip:'#f2b26b',flag:'#7d1f2a',pole:'#f3ead8',waterName:'Splash!'},
};

const GOLF={el:null,c:null,ctx:null,loop:null,o:null,h:0,H:null,cards:[],strokes:0,ball:null,prev:null,aim:null,club:0,cam:null,bg:null,
  phase:'aim',meter:null,anim:null,msg:null,wind:null,tips:0};
const gclub=()=>GOLF_CLUBS[GOLF.club];

/* ---------- Terrain ---------- */
const inE=(e,x,y)=>((x-e[0])/e[2])**2+((y-e[1])/e[3])**2<=1;
function inCap(c,x,y){ const [x1,y1,x2,y2,r]=c, dx=x2-x1, dy=y2-y1, L=dx*dx+dy*dy||1, t=clamp(((x-x1)*dx+(y-y1)*dy)/L,0,1); return (x-x1-t*dx)**2+(y-y1-t*dy)**2<=r*r; }
const inW=(w,x,y)=>w.length===5?inCap(w,x,y):inE(w,x,y);
function terr(H,x,y){
  if(Math.abs(x)>H.hw||y<-14||y>H.len+40) return 'oob';
  if(inE(H.green,x,y)) return 'green';
  for(const s of H.sand) if(inE(s,x,y)) return 'sand';
  for(const w of H.water) if(inW(w,x,y)) return 'water';
  if(Math.abs(x)<7&&y>-7&&y<7) return 'tee';
  for(const f of H.fair) if(inCap(f,x,y)) return 'fair';
  return 'rough';
}
const treeAt=(H,x,y)=>H.trees.find(t=>(x-t[0])**2+(y-t[1])**2<(t[2]*.75)**2);

/* ---------- Camera: the whole hole, or zoomed in near the green ---------- */
function camFull(H){ const s=(PH-30)/(H.len+34); return {s,cx:0,cy:(H.len+20-14)/2}; }
function camFor(){
  const H=GOLF.H, b=GOLF.ball, cup=H.cup, d=Math.hypot(cup[0]-b[0],cup[1]-b[1]);
  if(d>46) return camFull(H);
  const s=Math.min(3.4,(PH-90)/(Math.abs(cup[1]-b[1])+18),(PW-24)/(Math.abs(cup[0]-b[0])+18));
  return {s,cx:(b[0]+cup[0])/2,cy:(b[1]+cup[1])/2};
}
const toS=(x,y,cam=GOLF.cam)=>[PW/2+(x-cam.cx)*cam.s, PH/2-(y-cam.cy)*cam.s];
const toW=(X,Y,cam=GOLF.cam)=>[cam.cx+(X-PW/2)/cam.s, cam.cy-(Y-PH/2)/cam.s];

function paintCourse(){
  const H=GOLF.H, cam=GOLF.cam, P=GPAL[SEASON.id]||GPAL.holiday;
  const c=document.createElement('canvas'); c.width=PW; c.height=PH; const x=c.getContext('2d');
  const img=x.createImageData(PW,PH), D=img.data, hex={};
  const rgb=h=>hex[h]||(hex[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
  const KIND=['rough','fair','tee','green','sand','water','oob'], T=new Uint8Array(PW*PH);
  for(let Y=0;Y<PH;Y++) for(let X=0;X<PW;X++){
    const [wx,wy]=toW(X+.5,Y+.5,cam), t=terr(H,wx,wy), pal=t==='tee'?P.fair:P[t]; T[Y*PW+X]=KIND.indexOf(t);
    let k=((Math.floor(wx*1.3)+Math.floor(wy*1.3))&1);
    if(t==='fair'||t==='tee') k=Math.floor(wy/9)&1;                  // mown stripes
    if(t==='green') k=(Math.floor(wx/3)+Math.floor(wy/3))&1;          // checkerboard cut
    if(t==='water') k=((Math.floor(wx*.8+Math.sin(wy*.6)*1.5))%5===0)?1:0;
    const col=rgb(pal[k]), i=(Y*PW+X)*4; D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=255;
  }
  x.putImageData(img,0,0);
  // edges: darken the pixel where the terrain changes, so shapes read clearly
  const EDGE={3:'rgba(20,70,30,.35)',4:'rgba(120,90,40,.4)',5:'rgba(10,30,60,.35)'};
  for(let Y=1;Y<PH;Y++) for(let X=1;X<PW;X++){ const i=Y*PW+X, k=T[i], col=EDGE[k]; if(col&&(T[i-PW]!==k||T[i-1]!==k)){ x.fillStyle=col; x.fillRect(X,Y,1,1); } }
  // out-of-bounds stakes
  for(let y=-10;y<H.len+40;y+=14) for(const sx of [-H.hw,H.hw]){ const [X,Y]=toS(sx,y,cam); if(X>-2&&X<PW+2){ rect(x,X,Y-3,1,3,'#f3ead8'); } }
  // tee markers
  for(const tx of [-4,4]){ const [X,Y]=toS(tx,0,cam); rect(x,X-1,Y-1,2,2,P.flag); }
  // decorations
  for(const [dx,dy,k] of H.deco||[]){ const [X,Y]=toS(dx,dy,cam), u=Math.max(1,Math.round(cam.s/1.6));
    if(k==='man'&&SEASON.snow){ rect(x,X-2*u,Y-4*u,4*u,4*u,'#f3ead8'); rect(x,X-1.5*u,Y-7*u,3*u,3*u,'#f3ead8'); rect(x,X-.5*u,Y-6*u,u,u,LP.emb1); rect(x,X-2*u,Y-8*u,4*u,u,'#16161c'); }
    else if(k==='gift'&&SEASON.xmas){ rect(x,X-2*u,Y-3*u,4*u,3*u,LP.cran2); rect(x,X-.5*u,Y-3*u,u,3*u,LP.brass2); }
    else if(k==='man'||k==='gift'){ for(let i=0;i<3;i++) rect(x,X-2*u+i*2*u,Y-2*u-(i%2)*u,u,u,P.leaf[1]); } }
  // trees (drawn over everything, bottom first so near trees overlap far ones)
  for(const t of [...H.trees].sort((a,b)=>b[1]-a[1])){ const [X,Y]=toS(t[0],t[1],cam), r=t[2]*cam.s;
    x.fillStyle='rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(X+r*.3,Y+r*.25,r*.8,r*.35,0,0,7); x.fill();
    rect(x,X-Math.max(1,r*.12),Y-r*.2,Math.max(2,r*.24),r*.45,'#4a3220');
    const layers=3; for(let i=0;i<layers;i++){ const w=r*(1-i*.28), top=Y-r*.25-i*r*.42-r*.5;
      for(let yy=0;yy<r*.6;yy++){ const ww=w*(yy/(r*.6)); rect(x,X-ww,top+yy,ww*2,1,P.leaf[(i+yy)%2?0:1]); }
      rect(x,X-w*.6,top+r*.55,w*.3,1,P.tip); }
  }
  return c;
}

/* ---------- Setting up a round and a hole ---------- */
function golfWind(seed,h){ const r=prng((seed||1)*97+h*13); const mph=Math.round(r()*14), a=r()*Math.PI*2; return {mph,a,x:Math.cos(a)*mph,y:Math.sin(a)*mph}; }
function golfHole(i){
  const H=Object.assign({},GOLF_HOLES[i]); const s=(PH-30)/(H.len+34); H.hw=(PW/s)/2-3; H.cup=[H.green[0]+(i%2?2:-2),H.green[1]+(i%3-1)*2];
  GOLF.h=i; GOLF.H=H; GOLF.strokes=0; GOLF.ball=[0,0]; GOLF.prev=[0,0]; GOLF.wind=golfWind(GOLF.o.seed,i);
  golfNewShot(); golfMsg(`HOLE ${i+1} · PAR ${H.par}`,`${H.len} YARDS${GOLF.wind.mph?` · WIND ${GOLF.wind.mph} MPH`:' · NO WIND'}`,1800);
}
function golfLie(){ return terr(GOLF.H,GOLF.ball[0],GOLF.ball[1]); }
const LIE_F={tee:1,fair:1,green:1,rough:.85,sand:.65};
function lieF(club){ const l=golfLie(); if(l==='sand'&&GOLF_CLUBS[club][0]==='SW') return .95; if(GOLF_CLUBS[club][0]==='PT'&&l!=='green') return l==='fair'||l==='tee'?.8:.5; return LIE_F[l]||1; }
function golfNewShot(){
  const H=GOLF.H, b=GOLF.ball; GOLF.aim=[H.cup[0],H.cup[1]]; GOLF.phase='aim'; GOLF.meter=null;
  const d=Math.hypot(H.cup[0]-b[0],H.cup[1]-b[1]), onGreen=golfLie()==='green';
  if(onGreen) GOLF.club=GOLF_CLUBS.length-1;
  else { let k=0; for(let i=0;i<GOLF_CLUBS.length-1;i++) if(GOLF_CLUBS[i][2]*lieF(i)>=d*.98) k=i; GOLF.club=k; }
  // aim no farther than the club can reach
  GOLF.cam=camFor(); GOLF.bg=paintCourse(); golfHud();
}

/* ---------- Taking a shot ---------- */
function golfStrike(p){
  const H=GOLF.H, b=GOLF.ball, C=gclub(), putt=C[0]==='PT', d=Math.abs(p-.5)*2, side=p<.5?-1:1;
  const q=d<.12?'perfect':d<.45?'good':'miss';
  const ax=GOLF.aim[0]-b[0], ay=GOLF.aim[1]-b[1], want=Math.hypot(ax,ay)||1, reach=C[2]*lieF(GOLF.club);
  let dist=Math.min(want,reach), ang=Math.atan2(ay,ax);
  if(putt){ dist*=q==='perfect'?1:q==='good'?1+side*d*.22:1+side*(.18+d*.3); ang+=(q==='perfect'?0:q==='good'?side*d*2.5:side*(2+d*4))*Math.PI/180; }
  else { dist*=q==='perfect'?1:q==='good'?1-d*.12:.86-d*.22; ang-=(q==='perfect'?0:q==='good'?side*d*6:side*(4+d*9))*Math.PI/180; }
  GOLF.strokes++; GOLF.prev=[b[0],b[1]];
  tone(putt?420:260,.08,'square',.05); if(!putt) tone(180,.12,'triangle',.05,.03);
  if(q==='perfect'){ tone(1046,.12,'square',.04,.05); golfMsg('PERFECT!','',700); }
  const dir=[Math.cos(ang),Math.sin(ang)];
  if(putt){ GOLF.anim={kind:'roll',from:[b[0],b[1]],dir,len:dist,t:0,dur:.35+dist/26}; }
  else{
    const W=GOLF.wind, drift=dist/100*.5;
    const land=[b[0]+dir[0]*dist+W.x*drift, b[1]+dir[1]*dist+W.y*drift];
    GOLF.anim={kind:'fly',from:[b[0],b[1]],to:land,t:0,dur:.7+dist/260,h:Math.max(6,dist*.18)};
  }
  GOLF.phase='fly'; golfHud();
}
// After the ball lands: hazards, trees, then the roll.
function golfLand(to,from){
  const H=GOLF.H, C=gclub(), t=terr(H,to[0],to[1]);
  if(Math.hypot(to[0]-H.cup[0],to[1]-H.cup[1])<.8) return golfHoled();
  if(t==='water') return golfPenalty(GPAL[SEASON.id].waterName);
  if(t==='oob') return golfPenalty('Out of bounds');
  const tr=treeAt(H,to[0],to[1]);
  if(tr){ // knocked down under the tree, back toward where you hit from
    const dx=from[0]-tr[0], dy=from[1]-tr[1], L=Math.hypot(dx,dy)||1; GOLF.ball=[tr[0]+dx/L*(tr[2]*.8),tr[1]+dy/L*(tr[2]*.8)];
    tone(150,.1,'square',.05); golfMsg('THWACK!','Off the tree',900); return golfRest();
  }
  const dx=to[0]-from[0], dy=to[1]-from[1], L=Math.hypot(dx,dy)||1;
  const rollF={green:1.3,fair:1,tee:1,rough:.35,sand:0}[t]||0, len=Math.hypot(dx,dy)*C[4]*rollF;
  GOLF.ball=[to[0],to[1]];
  if(t==='sand') tone(120,.12,'triangle',.04);
  if(len<.3) return golfRest();
  GOLF.anim={kind:'roll',from:[to[0],to[1]],dir:[dx/L,dy/L],len,t:0,dur:.25+len/40};
}
// Roll along the ground, stepping half a yard at a time.
function golfRollStep(A,k){
  const H=GOLF.H, dist=A.len*(1-(1-k)*(1-k)), prev=A.done||0;
  for(let s=prev+.5;s<=dist;s+=.5){
    const x=A.from[0]+A.dir[0]*s, y=A.from[1]+A.dir[1]*s, t=terr(H,x,y);
    if(Math.hypot(x-H.cup[0],y-H.cup[1])<.62&&A.len-s<6){ GOLF.ball=[H.cup[0],H.cup[1]]; GOLF.anim=null; golfHoled(); return true; }
    if(t==='water'){ GOLF.anim=null; golfPenalty(GPAL[SEASON.id].waterName); return true; }
    if(t==='oob'){ GOLF.anim=null; golfPenalty('Out of bounds'); return true; }
    if(t==='sand'&&!A.putt){ GOLF.ball=[x,y]; GOLF.anim=null; golfRest(); return true; }
    if(t==='rough'&&A.len-s>2&&!A.inRough){ A.inRough=true; A.len=Math.min(A.len,s+1.5); }
    GOLF.ball=[x,y]; A.done=s;
  }
  return false;
}
function golfPenalty(why){
  GOLF.strokes++; tone(200,.2,'sawtooth',.04); tone(140,.25,'sawtooth',.04,.12);
  golfMsg(why.toUpperCase(),'+1 stroke · hit again',1500);
  GOLF.ball=[GOLF.prev[0],GOLF.prev[1]]; golfRest();
}
function golfRest(){
  GOLF.anim=null;
  if(GOLF.strokes>=GOLF.H.par+4){ golfMsg('PICK IT UP','Max strokes reached',1300); setTimeout(()=>golfHoleDone(),1300); GOLF.phase='done'; return; }
  setTimeout(()=>{ if(GOLF.phase!=='done') golfNewShot(); },350);
}
const SCORE_NAMES={'-3':'ALBATROSS!','-2':'EAGLE!','-1':'BIRDIE!','0':'PAR','1':'BOGEY','2':'DOUBLE BOGEY','3':'TRIPLE BOGEY'};
function golfHoled(){
  GOLF.phase='done'; GOLF.anim=null; GOLF.ball=[GOLF.H.cup[0],GOLF.H.cup[1]];
  const diff=GOLF.strokes-GOLF.H.par, name=GOLF.strokes===1?'HOLE IN ONE!':(SCORE_NAMES[diff]||('+'+diff));
  [659,784,988,1319].forEach((f,i)=>tone(f,.1,'square',.05,i*.08));
  if(diff<0||GOLF.strokes===1){ try{ const b=GOLF.c.getBoundingClientRect(); fx.burst(b.left+b.width/2,b.top+b.height*.4,diff<=-2?90:50,'#ecd9a8'); if(diff<=-2||GOLF.strokes===1) fx.confetti(160); }catch(e){} }
  const bonus=GOLF.strokes===1?500000:diff<=-2?150000:diff===-1?25000:0;
  if(bonus&&!GOLF.o.noCash){ setBank(bonus); GOLF.cash+=bonus; }
  golfMsg(name,(bonus&&!GOLF.o.noCash?'+'+k$(bonus)+' · ':'')+GOLF.strokes+' stroke'+(GOLF.strokes>1?'s':''),1700);
  setTimeout(golfHoleDone,1700);
}
function golfHoleDone(){
  GOLF.cards[GOLF.h]=GOLF.strokes; if(typeof gainXP==='function') gainXP(6,'Golf hole');
  if(GOLF.h+1<GOLF_HOLES.length) golfHole(GOLF.h+1); else golfFinish();
}
const vsPar=n=>n===0?'E':n>0?'+'+n:String(n);
const golfTotal=()=>GOLF.cards.reduce((s,n)=>s+(n||0),0);
async function golfFinish(){
  GOLF.phase='card'; const tot=golfTotal(), rel=tot-GOLF_PAR;
  S.golf=S.golf||{}; const best=S.golf.best; if(best==null||tot<best) S.golf.best=tot; S.golf.rounds=(S.golf.rounds||0)+1; save();
  let note='';
  if(GOLF.o.onFinish){ try{ note=await GOLF.o.onFinish(tot)||''; }catch(e){ note='Couldn’t send your score. Check your connection.'; } }
  else if(typeof socPost==='function') socPost('golf',SEASON.id,tot,rel);
  const box=GOLF.el.querySelector('.gf-card');
  box.innerHTML=`<div class="gf-card-in"><div class="gf-k">${esc(SEASON.course.toUpperCase())}</div><div class="gf-big">${tot} <small>(${vsPar(rel)})</small></div>
    ${best!=null&&tot<best?'<div class="gf-k gold">NEW PERSONAL BEST</div>':S.golf.best!=null?`<div class="gf-k">BEST ${S.golf.best}</div>`:''}
    <table class="gf-tbl"><tr><th>HOLE</th>${GOLF_HOLES.map((h,i)=>`<th>${i+1}</th>`).join('')}<th>TOT</th></tr>
    <tr><td>PAR</td>${GOLF_HOLES.map(h=>`<td>${h.par}</td>`).join('')}<td>${GOLF_PAR}</td></tr>
    <tr><td>YOU</td>${GOLF.cards.map((n,i)=>`<td class="${n<GOLF_HOLES[i].par?'u':n>GOLF_HOLES[i].par?'o':''}">${n}</td>`).join('')}<td>${tot}</td></tr></table>
    ${GOLF.cash?`<div class="gf-k gold">+${k$(GOLF.cash)} in birdie money</div>`:''}
    ${note?`<div class="gf-note">${esc(note)}</div>`:''}
    <div class="gf-row"><button class="lg-btn lg-gold" data-gf="share">SHARE</button>${GOLF.o.onFinish?'':`<button class="lg-btn lg-gold" data-gf="challenge">CHALLENGE A FRIEND</button>`}</div>
    <div class="gf-row"><button class="lg-btn" data-gf="again">PLAY AGAIN</button><button class="lg-btn" data-gf="quit">DONE</button></div></div>`;
  box.classList.add('on');
  [523,659,784,1047].forEach((f,i)=>tone(f,.14,'square',.05,i*.1));
}

/* ---------- Messages and the bottom bar ---------- */
function golfMsg(a,b,ms){ GOLF.msg={a,b,until:performance.now()+(ms||1200)}; }
function golfHud(){
  const el=GOLF.el; if(!el) return; const H=GOLF.H, C=gclub(), b=GOLF.ball, lie=golfLie();
  const tot=GOLF.cards.reduce((s,n,i)=>s+(n||0)-GOLF_HOLES[i].par,0);
  el.querySelector('.gf-hole').textContent=`HOLE ${GOLF.h+1}/${GOLF_HOLES.length} · PAR ${H.par}`;
  el.querySelector('.gf-tot').textContent=vsPar(tot);
  const toPin=Math.round(Math.hypot(H.cup[0]-b[0],H.cup[1]-b[1]));
  el.querySelector('.gf-info').innerHTML=`<span>STROKE ${GOLF.strokes+1}</span><span>${{tee:'TEE',fair:'FAIRWAY',rough:'ROUGH',sand:'BUNKER',green:'GREEN'}[lie]||''}</span><span>PIN ${toPin}Y</span>`;
  const reach=Math.round(C[2]*lieF(GOLF.club));
  el.querySelector('.gf-club').innerHTML=`${C[1].toUpperCase()}<small>${C[0]==='PT'?'UP TO ':''}${reach}Y</small>`;
  const sw=el.querySelector('.gf-swing'); sw.textContent=GOLF.phase==='meter'?'HIT!':'SWING'; sw.disabled=!(GOLF.phase==='aim'||GOLF.phase==='meter');
  sw.classList.toggle('hit',GOLF.phase==='meter');
  el.querySelectorAll('[data-gf=club]').forEach(x=>x.disabled=GOLF.phase!=='aim');
  el.querySelector('.gf-meter').classList.toggle('on',GOLF.phase==='meter');
}

/* ---------- Drawing each frame ---------- */
function golfDraw(t,dt){
  const x=GOLF.ctx, H=GOLF.H, P=GPAL[SEASON.id]||GPAL.holiday; if(!H) return;
  x.drawImage(GOLF.bg,0,0);
  // flag
  const [cX,cY]=toS(H.cup[0],H.cup[1]), u=Math.max(1,Math.round(GOLF.cam.s/1.6)), ph=Math.max(10,Math.round(4*GOLF.cam.s));
  rect(x,cX-u,cY-u*.5,u*2,u,'#121216');
  for(let i=0;i<ph;i++) rect(x,cX,cY-i-1,1,1,P.pole==='cane'?((i>>1)%2?'#f3ead8':'#d0303a'):P.pole);
  const wave=Math.sin(t*6)>0?1:0;
  rect(x,cX+1,cY-ph,5,4,P.flag); rect(x,cX+5+wave,cY-ph+1,2,2,P.flag);
  // aim line and landing spot
  const A=GOLF.anim, b=GOLF.ball;
  if(GOLF.phase==='aim'||GOLF.phase==='meter'){
    const C=gclub(), ax=GOLF.aim[0]-b[0], ay=GOLF.aim[1]-b[1], L=Math.hypot(ax,ay)||1, d=Math.min(L,C[2]*lieF(GOLF.club));
    const land=[b[0]+ax/L*d,b[1]+ay/L*d], [bX,bY]=toS(b[0],b[1]), [lX,lY]=toS(land[0],land[1]);
    const n=Math.max(2,Math.hypot(lX-bX,lY-bY)/5|0);
    for(let i=1;i<n;i++){ if((i+((t*8)|0))%2) continue; rect(x,bX+(lX-bX)*i/n,bY+(lY-bY)*i/n,1,1,'#ffffff'); }
    const pulse=1+Math.round((Math.sin(t*6)+1));
    x.strokeStyle='#ffffff'; x.lineWidth=1; x.beginPath(); x.arc(Math.round(lX)+.5,Math.round(lY)+.5,2+pulse,0,7); x.stroke();
  }
  // ball (with a shadow while it flies)
  if(A&&A.kind==='fly'){
    A.t+=dt; const k=Math.min(1,A.t/A.dur), gx=A.from[0]+(A.to[0]-A.from[0])*k, gy=A.from[1]+(A.to[1]-A.from[1])*k, h=4*A.h*k*(1-k);
    const [X,Y]=toS(gx,gy); rect(x,X-1,Y,2,1,'rgba(0,0,0,.35)'); const lift=h*GOLF.cam.s*.7+Math.min(10,h*.5);
    rect(x,X-1,Y-1-lift,2,2,'#ffffff');
    if(k>=1){ const to=A.to, from=A.from; GOLF.anim=null; golfLand(to,from); }
  } else {
    if(A&&A.kind==='roll'){ A.t+=dt; const k=Math.min(1,A.t/A.dur); A.putt=gclub()[0]==='PT'; const ended=golfRollStep(A,k); if(!ended&&k>=1){ GOLF.anim=null; golfRest(); } }
    if(GOLF.phase!=='done'||Math.hypot(b[0]-H.cup[0],b[1]-H.cup[1])>.5){ const [X,Y]=toS(GOLF.ball[0],GOLF.ball[1]); rect(x,X-1,Y,2,1,'rgba(0,0,0,.3)'); rect(x,X-1,Y-1,2,2,'#ffffff'); }
  }
  // wind arrow (top right)
  const W=GOLF.wind; rect(x,PW-38,4,34,16,'rgba(5,9,15,.55)');
  if(W.mph){ const ax=PW-28, ay=12, dx=Math.cos(W.a), dy=-Math.sin(W.a); for(let i=-5;i<=5;i++) rect(x,ax+dx*i,ay+dy*i,1,1,'#f3ead8'); rect(x,ax+dx*5-1,ay+dy*5-1,2,2,'#f2b26b'); ptext(x,W.mph+'',PW-19,7,'#f3ead8'); ptext(x,'MPH',PW-19,13,'#9fb0bf'); }
  else ptext(x,'CALM',PW-34,10,'#f3ead8');
  // falling snow or petals
  if(GOLF.fallF) GOLF.fallF.draw(x,dt,SEASON.fall);
  // big message
  const M=GOLF.msg; if(M&&performance.now()<M.until){ const w=Math.max(ptextW(M.a,2),ptextW(M.b||''))+12; rect(x,PW/2-w/2,PH*.36-4,w,M.b?28:20,'rgba(5,9,15,.78)'); ptext(x,M.a,PW/2-ptextW(M.a,2)/2,PH*.36,'#ecd9a8',2); if(M.b) ptext(x,M.b,PW/2-ptextW(M.b)/2,PH*.36+15,'#f3ead8'); }
  // the meter marker
  if(GOLF.phase==='meter'){ const m=GOLF.meter; m.t+=dt; const per=gclub()[3]*({rough:.85,sand:.8}[golfLie()]||1); const ph2=(m.t/per)%2; m.p=ph2<1?ph2:2-ph2; const mk=GOLF.el.querySelector('.gf-mark'); if(mk) mk.style.left=(m.p*100)+'%'; }
}

/* ---------- Opening and closing ---------- */
function golfDom(){
  if(GOLF.el) return;
  const el=document.createElement('div'); el.id='golf'; el.className='golf';
  el.innerHTML=`<div class="gf-col">
    <div class="gf-top"><button class="lg-btn lg-round" data-gf="quit" aria-label="Leave the course">X</button><span class="gf-hole"></span><span class="gf-tot"></span></div>
    <div class="gf-stage"><div class="gf-vs"></div><div class="gf-card"></div></div>
    <div class="gf-bot"><div class="gf-info"></div>
      <div class="gf-clubs"><button class="lg-btn" data-gf="club" data-v="-1" aria-label="Longer club">‹</button><div class="gf-club"></div><button class="lg-btn" data-gf="club" data-v="1" aria-label="Shorter club">›</button></div>
      <div class="gf-meter" data-gf="swing"><i style="left:0;width:27.5%" class="r"></i><i style="left:27.5%;width:16.5%" class="y"></i><i style="left:44%;width:12%" class="g"></i><i style="left:56%;width:16.5%" class="y"></i><i style="left:72.5%;width:27.5%" class="r"></i><b class="gf-mark"></b></div>
      <button class="gf-swing" data-gf="swing">SWING</button></div></div>`;
  document.body.appendChild(el); GOLF.el=el;
  const stage=el.querySelector('.gf-stage'); const {c,ctx}=makeCanvas(stage); GOLF.c=c; GOLF.ctx=ctx;
  GOLF.loop=makeLoop(golfDraw);
  c.addEventListener('click',e=>{ if(GOLF.phase!=='aim') return; const r=c.getBoundingClientRect(); GOLF.aim=toW((e.clientX-r.left)/r.width*PW,(e.clientY-r.top)/r.height*PH); tone(700,.03,'square',.02);
    // choose the club that reaches the new target
    const d=Math.hypot(GOLF.aim[0]-GOLF.ball[0],GOLF.aim[1]-GOLF.ball[1]);
    if(gclub()[0]!=='PT'||golfLie()!=='green'){ let k=0; for(let i=0;i<GOLF_CLUBS.length-1;i++) if(GOLF_CLUBS[i][2]*lieF(i)>=d*.98) k=i; GOLF.club=k; }
    golfHud(); });
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-gf]'); if(!b||b.disabled) return; e.stopPropagation(); GF_ACT[b.dataset.gf]&&GF_ACT[b.dataset.gf](b); });
}
const GF_ACT={
  club:b=>{ if(GOLF.phase!=='aim') return; GOLF.club=clamp(GOLF.club+(+b.dataset.v),0,GOLF_CLUBS.length-1); tone(600,.04,'square',.03); golfHud(); },
  swing:()=>{
    if(GOLF.phase==='aim'){ GOLF.phase='meter'; GOLF.meter={t:0,p:0}; tone(500,.04,'square',.03); golfHud(); if(GOLF.tips<1&&!(S.golf&&S.golf.rounds)){ GOLF.tips++; golfMsg('NOW!','Tap again in the green',1400); } }
    else if(GOLF.phase==='meter'){ golfStrike(GOLF.meter.p); }
  },
  quit:()=>{ if(GOLF.phase!=='card'&&GOLF.cards.length+GOLF.strokes>0&&!confirm(GOLF.o.onFinish?'Leave the course? This challenge round will count as unfinished.':'Leave the course? This round won’t be saved.')) return; closeGolf(); },
  again:()=>{ const o=Object.assign({},GOLF.o); delete o.onFinish; delete o.vs; o.seed=Date.now()%100000; openGolf(o); },
  share:()=>{ const tot=golfTotal(); if(typeof shareCard==='function') shareCard({kind:'golf',game:'Golf',title:vsPar(tot-GOLF_PAR)+' at '+SEASON.course,amount:null,big:String(tot),sub:GOLF.cards.join(' · ')+' · par '+GOLF_PAR}); },
  challenge:()=>{ const tot=golfTotal(); closeGolf(); if(typeof challengeStart==='function') challengeStart({game:'golf'}); },
};
function openGolf(opts){
  golfDom(); GOLF.o=Object.assign({seed:Date.now()%100000},opts||{}); GOLF.cards=[]; GOLF.cash=0; GOLF.tips=0;
  GOLF.el.classList.add('on'); document.body.classList.add('in-golf'); GOLF.el.querySelector('.gf-card').classList.remove('on');
  const vs=GOLF.el.querySelector('.gf-vs'); vs.textContent=GOLF.o.vs?GOLF.o.vs:''; vs.style.display=GOLF.o.vs?'':'none';
  GOLF.fallF=snowField(SEASON.snow?28:14,77);
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop();
  golfHole(0); GOLF.loop.start();
  if(!(S.golf&&S.golf.rounds)) setTimeout(()=>golfMsg('TAP TO AIM','Then SWING · stop it in the green',2600),1900);
}
function closeGolf(){
  if(!GOLF.el) return; GOLF.loop.stop(); GOLF.el.classList.remove('on'); document.body.classList.remove('in-golf'); GOLF.phase='off';
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start();
  if(!(typeof lodgeActive==='function'&&lodgeActive())) render();
}
