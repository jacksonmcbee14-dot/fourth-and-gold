// 🗺️ The Grounds — a big top-down 8-bit world out the back of the lodge (tap to walk; the path is found for you).
// 12 regions around the lodge; three are open to everyone and prestige stars open the rest (fogged until then).
// Scattered across the map: 21 marshes (Dawn Flight hunting, js/lodge/hunt.js — each with its own birds, and a
// unique reward the first time you beat it), 11 golf courses, 8 horse tracks, lookout towers (zoom out to a huge
// view of the area and reveal it on your map), 84 treasure chests with collectibles, cash and rare guns, daily
// forage sparkles, the stables, the dog park, the hot springs and the gunsmith.
// The world is generated once from a fixed seed, so everyone shares the same map. Tiles are painted into cached
// chunks; only water, weather, chests, birds and you are animated.

const WD={W:220,H:164,T:16,CH:16};
const T_={G:0,PATH:1,WATER:2,TREE:3,ROCK:4,WALL:5,BRIDGE:6,FLOWER:7,REED:8,BLD:9,ICE:10,HOT:11,SAND:12,DEEP:13,DOOR:14};
const PASS=new Set([0,1,6,7,8,10,12,14]);
// Regions: palette (g ground, p path, w water), tree type, weather, tint overlay.
const REG=[
  {id:'lawn',name:'The Front Lawn',stars:0,at:[84,82],g:['#4f9a3c','#5fae46','#3d7f30'],p:['#c9a06a','#b08a58'],w:['#3a7ad0','#5a9ae8'],tree:'oak',fx:'motes'},
  {id:'pines',name:'Whispering Pines',stars:0,at:[30,84],g:['#2f6e3a','#3a7e44','#245a2e'],p:['#8a6a48','#74583a'],w:['#2a5aa0','#3a6ab8'],tree:'pine',fx:'fireflies',tint:'rgba(20,30,70,.18)'},
  {id:'lake',name:'Mirror Lake',stars:0,at:[138,84],g:['#5aa04a','#6ab456','#478a3a'],p:['#d8c08a','#c0a874'],w:['#3a8ae0','#6ab0f0'],tree:'oak',fx:'none'},
  {id:'marsh',name:'Duck Marsh',stars:1,at:[84,30],g:['#6a8a3a','#7a9a46','#556f2c'],p:['#9a7a52','#80643e'],w:['#4a7a8a','#6a9aa0'],tree:'willow',fx:'mist',tint:'rgba(255,170,150,.10)'},
  {id:'ridge',name:'Aurora Ridge',stars:2,at:[30,30],g:['#e4eef8','#f4f8ff','#c4d4e8'],p:['#a8b8d0','#94a4c0'],w:['#8ac0e8','#b0daf6'],tree:'snowpine',fx:'snow',tint:'rgba(30,40,120,.22)'},
  {id:'springs',name:'Hot Springs',stars:3,at:[138,30],g:['#e8e2f0','#f6f2fa','#cfc4dc'],p:['#c4b4d4','#ac9cc0'],w:['#3ad0c8','#7af0e0'],tree:'snowpine',fx:'snow',tint:'rgba(120,40,90,.12)'},
  {id:'falls',name:'Thunder Falls',stars:4,at:[84,136],g:['#3a9a3a','#4cb044','#2a7a2e'],p:['#c8a870','#b09058'],w:['#2a8ae0','#5ab8f8'],tree:'jungle',fx:'spray'},
  {id:'caves',name:'Crystal Caverns',stars:5,at:[30,136],g:['#3a2a50','#463460','#2c1e40'],p:['#5a4a72','#4a3a62'],w:['#2a4ab0','#4a6ad0'],tree:'crystal',fx:'sparkle',tint:'rgba(20,0,40,.35)',dark:1},
  {id:'orchard',name:'Blossom Orchard',stars:6,at:[138,136],g:['#7ab85a','#8ac868','#64a04a'],p:['#e0c494','#c8ac7c'],w:['#4a9ae0','#7ac0f4'],tree:'blossom',fx:'petals',tint:'rgba(255,140,170,.08)'},
  {id:'cove',name:'Lighthouse Cove',stars:7,at:[192,84],g:['#e8d49a','#f2e2ae','#d0ba80'],p:['#c8b080','#b09868'],w:['#2a6ac0','#4a8ae0'],tree:'palm',fx:'glints',tint:'rgba(10,20,80,.25)'},
  {id:'summit',name:'Starfall Summit',stars:8,at:[192,30],g:['#4a4460','#565070','#3a3450'],p:['#6a6488','#5a5478'],w:['#3a3a9a','#5a5ac0'],tree:'deadpine',fx:'stars',tint:'rgba(10,0,40,.35)'},
  {id:'bayou',name:'Willow Bayou',stars:3,at:[192,136],g:['#4a6a32','#587a3c','#3a5626'],p:['#7a6440','#665234'],w:['#3a5a3a','#4a6e48'],tree:'willow',fx:'fireflies',tint:'rgba(20,40,10,.22)'},
];
const wdStars=()=>S.prestige||0;
const grStars=wdStars;
const regOpen=r=>REG[r].stars<=wdStars();

/* ---------- world generation (fixed seed) ---------- */
function wdHash(x,y,s){ let h=(x*374761393+y*668265263+s*982451653)|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; }
function wdNoise(x,y,sc,s){ const fx=x/sc, fy=y/sc, x0=Math.floor(fx), y0=Math.floor(fy), tx=fx-x0, ty=fy-y0, sm=t=>t*t*(3-2*t);
  const a=wdHash(x0,y0,s), b=wdHash(x0+1,y0,s), c=wdHash(x0,y0+1,s), d=wdHash(x0+1,y0+1,s), u=sm(tx), v=sm(ty); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
let WORLD=null;
function wdGen(){ if(WORLD) return WORLD; const {W,H}=WD, N=W*H, map=new Uint8Array(N), reg=new Uint8Array(N), v=new Uint8Array(N), r=prng(2026);
  const I=(x,y)=>y*W+x, inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const wx=x+(wdNoise(x,y,9,1)-.5)*18, wy=y+(wdNoise(x,y,9,2)-.5)*18; let best=0,bd=1e9; REG.forEach((R,i)=>{ const d=(wx-R.at[0])**2+(wy-R.at[1])**2; if(d<bd){bd=d;best=i;} }); reg[I(x,y)]=best; v[I(x,y)]=(wdHash(x,y,7)*255)|0; }
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=I(x,y), R=REG[reg[i]], n=wdNoise(x,y,6,3), n2=wdNoise(x,y,4,4), rnd=wdHash(x,y,11), dx=x-R.at[0], dy=y-R.at[1]; let t=T_.G;
    if(R.id==='cove') t=x>205?T_.DEEP:x>200?T_.WATER:T_.SAND;
    if(R.id==='lake'&&(dx*dx/400+dy*dy/144)<1&&!((dx-4)**2+(dy+1)**2<6)) t=T_.WATER;
    if(R.id==='marsh'||R.id==='bayou'){ if(n>.56) t=T_.WATER; else if(n>.5) t=T_.REED; }
    if(R.id==='ridge'&&n>.64) t=T_.ICE;
    if(R.id==='springs'&&n2>.74) t=T_.HOT;
    if(R.id==='falls'&&Math.abs(x-(R.at[0]+Math.sin(y*.16)*7+8))<2) t=T_.WATER;
    if(R.id==='caves'&&n>.58) t=T_.WALL;
    if(R.id==='summit'&&n>.62) t=T_.ROCK;
    if(t===T_.G||t===T_.SAND){ const dens={lawn:.62,pines:.42,lake:.66,marsh:.7,ridge:.5,springs:.6,falls:.4,caves:.72,orchard:.5,cove:.74,summit:.68,bayou:.5}[R.id];
      if(n2>dens&&rnd<.72) t=T_.TREE; else if(rnd<.012) t=T_.ROCK; else if(rnd<.06&&/lawn|orchard|falls|lake/.test(R.id)) t=T_.FLOWER; }
    if(x<2||y<2||x>=W-2||y>=H-2) t=R.id==='cove'?T_.DEEP:T_.TREE;
    map[i]=t; }
  const L=[], used=[];
  const free=(x,y,w,h)=>{ if(x<4||y<4||x+w>W-4||y+h>H-5) return false; return !used.some(u=>x<u[0]+u[2]+3&&x+w+3>u[0]&&y<u[1]+u[3]+4&&y+h+4>u[1]); };
  const place=(o,ri,dx,dy)=>{ const R=REG[ri]; let x=R.at[0]+dx, y=R.at[1]+dy, tries=0;
    while((!free(x,y,o.w,o.h)||reg[I(Math.max(0,Math.min(W-1,x+(o.w>>1))),Math.max(0,Math.min(H-1,y+(o.h>>1))))]!==ri)&&tries++<400){ x=R.at[0]+Math.round((r()-.5)*40); y=R.at[1]+Math.round((r()-.5)*34); }
    used.push([x,y,o.w,o.h]); o.x=x; o.y=y; o.reg=ri; o.door=[x+(o.w>>1),y+o.h];
    for(let yy=y-1;yy<=y+o.h+1;yy++) for(let xx=x-1;xx<=x+o.w;xx++) if(inb(xx,yy)) map[I(xx,yy)]=R.id==='cove'?T_.SAND:T_.G;
    for(let yy=y;yy<y+o.h;yy++) for(let xx=x;xx<x+o.w;xx++) map[I(xx,yy)]=T_.BLD;
    map[I(o.door[0],o.door[1])]=T_.DOOR; L.push(o); return o; };
  const RI=id=>REG.findIndex(R=>R.id===id);
  place({k:'home',name:'The Lodge',ic:'🏠',w:7,h:5},RI('lawn'),-3,-5);
  place({k:'stables',name:'The Stables',ic:'🐎',w:5,h:3},RI('lawn'),10,4);
  place({k:'gunsmith',name:'The Gunsmith',ic:'🔫',w:4,h:3},RI('lawn'),-12,4);
  place({k:'dogpark',name:'Dog Park',ic:'🐾',w:5,h:3},RI('pines'),4,6);
  place({k:'soak',name:'The Hot Springs',ic:'♨️',w:5,h:3},RI('springs'),0,0);
  [['links','lawn',12,-10],['ridge','pines',-8,-8],['lakes','lake',6,14],['birch','marsh',10,8],['frost','ridge',6,8],['steam','springs',-12,8],['canyon','falls',-12,-6],
   ['grotto','caves',8,-6],['sakura','orchard',-8,-8],['dunes','cove',-6,-14],['skyline','summit',-8,8]].forEach(([c,rg,dx,dy])=>place({k:'golf',course:c,ic:'⛳',w:5,h:3},RI(rg),dx,dy));
  [['meadow','lawn',-14,-10],['timber','pines',-6,14],['glacier','ridge',-10,-8],['bog','bayou',8,10],['sands','cove',-6,12],['skyway','summit',8,-8],['petal','orchard',10,10],['jungle','falls',10,8]].forEach(([tr,rg,dx,dy])=>place({k:'track',track:tr,ic:'🏇',w:6,h:4},RI(rg),dx,dy));
  [['lawn',-16,10],['lake',-16,-10],['ridge',12,-12],['falls',0,-14],['cove',4,0],['summit',0,0],['caves',-10,10],['bayou',-10,-10],['orchard',0,0]].forEach(([rg,dx,dy])=>place({k:'lookout',name:REG[RI(rg)].name+' Lookout',ic:'🔭',w:3,h:3},RI(rg),dx,dy));
  const MR={lawn:1,pines:1,lake:2,marsh:4,ridge:1,springs:1,falls:2,caves:1,orchard:1,cove:2,summit:1,bayou:4}; let mi=0;
  for(const [rg,n] of Object.entries(MR)) for(let k=0;k<n;k++){ const o=place({k:'marsh',m:mi++,ic:'🦆',w:6,h:4},RI(rg),Math.round((r()-.5)*30),Math.round((r()-.5)*24));
    for(let yy=o.y;yy<o.y+3;yy++) for(let xx=o.x;xx<o.x+o.w;xx++) map[I(xx,yy)]=(xx===o.x||xx===o.x+o.w-1)?T_.REED:T_.WATER;
    for(let xx=o.x;xx<o.x+o.w;xx++) map[I(xx,o.y+3)]=xx===o.x+2||xx===o.x+3?T_.BLD:T_.REED; o.door=[o.x+2,o.y+4]; map[I(o.door[0],o.door[1])]=T_.DOOR; }
  // paths from the lodge to every landmark (bridges over water)
  const home=L[0]; const carve=(ax,ay,bx,by)=>{ let x=ax,y=ay; const step=()=>{ if(!inb(x,y)) return; const i=I(x,y), t=map[i]; if(t===T_.BLD||t===T_.DOOR) return; if(t===T_.WATER||t===T_.DEEP) map[i]=T_.BRIDGE; else if(t!==T_.BRIDGE) map[i]=T_.PATH; };
    while(x!==bx){ step(); x+=Math.sign(bx-x); } while(y!==by){ step(); y+=Math.sign(by-y); } step(); };
  // roads: lodge → each region's centre (the main roads), then branches from the centre to every landmark there
  const hub=[home.door[0],home.door[1]+1];
  REG.forEach((R,ri)=>{ const c=R.at; if(ri) { carve(hub[0],hub[1],c[0],hub[1]); carve(c[0],hub[1],c[0],c[1]); }
    for(const o of L.slice(1)){ if(o.reg!==ri) continue; const tx=o.door[0], ty=o.door[1]+1; carve(c[0],c[1],c[0],ty); carve(c[0],ty,tx,ty); } });
  // only spots you can actually walk to (flood fill from the lodge over passable ground)
  const reach=new Uint8Array(N), q=[I(hub[0],hub[1])]; reach[q[0]]=1; for(let h=0;h<q.length;h++){ const c=q[h], cx=c%W, cy=(c/W)|0; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=cx+dx, ny=cy+dy; if(!inb(nx,ny)) continue; const n=I(nx,ny); if(reach[n]||!PASS.has(map[n])) continue; reach[n]=1; q.push(n); } }
  const chests=[]; let guard=0; while(chests.length<84&&guard++<40000){ const x=4+Math.floor(r()*(W-8)), y=4+Math.floor(r()*(H-9)), i=I(x,y); if(map[i]!==T_.G||!reach[i]) continue;
    if(chests.some(c=>Math.abs(c.x-x)+Math.abs(c.y-y)<9)) continue; if(L.some(o=>x>=o.x-3&&x<=o.x+o.w+3&&y>=o.y-3&&y<=o.y+o.h+3)) continue; chests.push({x,y,reg:reg[i],n:chests.length}); }
  return WORLD={map,reg,v,L,chests,I}; }

/* ---------- 8-bit painting ---------- */
function px(x,X,Y,c){ x.fillStyle=c; x.fillRect(X,Y,1,1); }
function wdTile(x,X,Y,t,R,vv,nb){ const g=R.g, rnd=k=>(Math.imul(vv+1,(k+3)*2654435761)>>>8)%16;
  const ground=()=>{ x.fillStyle=g[0]; x.fillRect(X,Y,16,16); for(let k=0;k<7;k++) px(x,X+rnd(k),Y+rnd(k+9),k%2?g[1]:g[2]); if(vv%5===0){ px(x,X+rnd(20),Y+rnd(21),g[1]); px(x,X+rnd(20),Y+Math.max(0,rnd(21)-1),g[1]); px(x,X+Math.min(15,rnd(20)+2),Y+Math.max(0,rnd(21)-1),g[2]); } };
  const water=(c1,c2)=>{ x.fillStyle=c1; x.fillRect(X,Y,16,16); x.fillStyle=c2; for(let k=0;k<3;k++) x.fillRect(X+Math.min(12,rnd(k)),Y+rnd(k+5),4,1);
    x.fillStyle='rgba(255,255,255,.5)'; if(nb[0]) x.fillRect(X,Y,16,1); if(nb[3]) x.fillRect(X,Y,1,16); if(nb[1]) x.fillRect(X+15,Y,1,16); if(nb[2]){ x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(X,Y+15,16,1); } };
  switch(t){
    case T_.G: case T_.DOOR: case T_.BLD: ground(); break;
    case T_.SAND: x.fillStyle='#ecd6a0'; x.fillRect(X,Y,16,16); for(let k=0;k<6;k++) px(x,X+rnd(k),Y+rnd(k+4),k%2?'#d6be86':'#fff0c4'); break;
    case T_.PATH: x.fillStyle=R.p[0]; x.fillRect(X,Y,16,16); for(let k=0;k<6;k++) px(x,X+rnd(k),Y+rnd(k+7),R.p[1]); if(vv%3===0){ x.fillStyle='rgba(255,255,255,.25)'; x.fillRect(X+rnd(2),Y+rnd(3),2,1); } break;
    case T_.FLOWER: ground(); { const fc=['#ffd84a','#ff6a8a','#ffffff','#b07aff'][vv%4]; for(let k=0;k<3;k++){ const fx=X+2+rnd(k)%12, fy=Y+2+rnd(k+3)%11; px(x,fx-1,fy,fc); px(x,fx+1,fy,fc); px(x,fx,fy-1,fc); px(x,fx,fy+1,'#2a6a2a'); px(x,fx,fy,'#ffe9a0'); } } break;
    case T_.WATER: water(R.w[0],R.w[1]); break;
    case T_.DEEP: water('#163a7a','#20509a'); break;
    case T_.HOT: water('#2ab8b0','#7af0e0'); x.fillStyle='rgba(255,255,255,.2)'; x.fillRect(X+4,Y+4,8,8); break;
    case T_.ICE: x.fillStyle='#bfe2f6'; x.fillRect(X,Y,16,16); x.fillStyle='#e8f6ff'; x.fillRect(X+2,Y+3,5,1); x.fillRect(X+9,Y+10,4,1); px(x,X+rnd(3),Y+rnd(4),'#ffffff'); break;
    case T_.BRIDGE: water(R.w[0],R.w[1]); x.fillStyle='#8a5a2a'; x.fillRect(X,Y+2,16,12); x.fillStyle='#a8743a'; for(let k=0;k<16;k+=4) x.fillRect(X+k,Y+2,3,12); x.fillStyle='#5a3618'; x.fillRect(X,Y+2,16,1); x.fillRect(X,Y+13,16,1); break;
    case T_.REED: if(nb.wet) water(R.w[0],R.w[1]); else ground(); for(let k=0;k<4;k++){ const rx=X+2+rnd(k)%12, ry=Y+3+rnd(k+1)%5; x.fillStyle='#6a7a2a'; x.fillRect(rx,ry+2,1,8); x.fillStyle='#5a3a1a'; x.fillRect(rx,ry,1,3); } break;
    case T_.ROCK: ground(); x.fillStyle='#5a5a66'; x.fillRect(X+3,Y+6,10,8); x.fillRect(X+4,Y+5,8,1); x.fillStyle='#8a8a98'; x.fillRect(X+4,Y+6,5,3); x.fillStyle='#b8b8c6'; x.fillRect(X+5,Y+6,2,1); x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(X+3,Y+14,10,1); break;
    case T_.WALL: x.fillStyle='#2a1c3c'; x.fillRect(X,Y,16,16); x.fillStyle='#3c2a54'; for(let k=0;k<16;k+=4) x.fillRect(X+((k/4)%2?0:4),Y+k,8,3); x.fillStyle='#5a4278'; x.fillRect(X,Y,16,1); if(vv%4===0){ px(x,X+rnd(1),Y+rnd(2),'#7af0ff'); px(x,X+Math.min(15,rnd(1)+1),Y+rnd(2),'#ff7ae0'); } break;
    case T_.TREE: if(R.id==='cove'){ x.fillStyle='#ecd6a0'; x.fillRect(X,Y,16,16); } else ground(); wdTree(x,X,Y,R.tree,vv); break;
  } }
function wdTree(x,X,Y,type,vv){ x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(X+3,Y+14,10,2);
  if(type==='pine'||type==='snowpine'||type==='deadpine'){ x.fillStyle='#5a3618'; x.fillRect(X+7,Y+12,2,3); const c=type==='deadpine'?['#3a3450','#5a5478']:['#1e5a2a','#2e7a36'];
    for(let yy=1;yy<13;yy++){ const w=1+Math.floor(yy*.55)+(yy%4===0?-1:0); x.fillStyle=c[0]; x.fillRect(X+8-w,Y+yy,w*2,1); x.fillStyle=c[1]; x.fillRect(X+8-w,Y+yy,Math.max(1,w-1),1); }
    if(type==='snowpine'){ x.fillStyle='#f4f8ff'; for(const [a,b,w] of [[7,1,2],[6,4,2],[9,5,2],[5,8,3],[9,9,3]]) x.fillRect(X+a,Y+b,w,1); }
    if(type==='deadpine'&&vv%3===0) px(x,X+8,Y+3,'#ffd84a'); }
  else if(type==='oak'||type==='blossom'||type==='jungle'){ x.fillStyle='#5a3618'; x.fillRect(X+7,Y+10,2,5); const c=type==='blossom'?['#d85a8a','#ff9ac0','#ffd0e4']:type==='jungle'?['#1a6a2a','#2a8a34','#5ac04a']:['#2a6a2a','#3a8a3a','#6ab04a'];
    x.fillStyle=c[0]; x.fillRect(X+2,Y+3,12,8); x.fillRect(X+3,Y+2,10,10); x.fillRect(X+4,Y+1,8,1); x.fillStyle=c[1]; x.fillRect(X+3,Y+2,8,6); x.fillRect(X+4,Y+1,6,1); x.fillStyle=c[2]; x.fillRect(X+4,Y+3,3,2); px(x,X+9,Y+2,c[2]);
    if(type==='blossom') for(let k=0;k<4;k++) px(x,X+3+((vv+k*5)%10),Y+3+((vv+k*3)%7),'#ffffff'); if(type==='jungle'){ x.fillStyle=c[0]; x.fillRect(X+1,Y+6,2,4); x.fillRect(X+13,Y+5,2,4); } }
  else if(type==='palm'){ x.fillStyle='#8a5a2a'; for(let k=0;k<10;k++) x.fillRect(X+7+Math.round(Math.sin(k*.3)*1.5),Y+5+k,2,1); x.fillStyle='#2a8a3a'; for(const [a,b,w] of [[2,4,5],[9,4,5],[4,2,8],[1,6,3],[12,6,3]]) x.fillRect(X+a,Y+b,w,2); px(x,X+7,Y+6,'#6a3a1a'); px(x,X+9,Y+6,'#6a3a1a'); }
  else if(type==='willow'){ x.fillStyle='#4a3a28'; x.fillRect(X+7,Y+9,2,6); x.fillStyle='#4a6a2a'; x.fillRect(X+3,Y+2,10,5); x.fillStyle='#6a8a3a'; for(let k=0;k<6;k++) x.fillRect(X+2+k*2,Y+4,1,6+((vv+k)%4)); x.fillStyle='#8aaa4a'; x.fillRect(X+5,Y+2,5,1); }
  else if(type==='crystal'){ for(const [a,h,c,c2] of [[4,9,'#3ad0f0','#bff6ff'],[8,12,'#c05ae0','#ffc0ff'],[11,7,'#3ad0f0','#bff6ff']]){ x.fillStyle=c; x.fillRect(X+a,Y+15-h,3,h); x.fillStyle=c2; x.fillRect(X+a,Y+15-h,1,h-1); px(x,X+a+1,Y+14-h,c2); } } }
function wdBld(x,o,X,Y){ const w=o.w*16, h=o.h*16, D=(o.door[0]-o.x)*16;
  const logs=(x0,y0,ww,hh,c1,c2)=>{ for(let yy=0;yy<hh;yy+=4){ x.fillStyle=yy%8?c1:c2; x.fillRect(x0,y0+yy,ww,4); x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(x0,y0+yy+3,ww,1); } };
  const roof=(x0,y0,ww,hh,c1,c2,snow)=>{ for(let k=0;k<hh;k++){ const inset=Math.round(k*(ww/2)/hh); x.fillStyle=k%3?c1:c2; x.fillRect(x0+inset,y0+hh-k-1,ww-inset*2,1); } if(snow){ x.fillStyle='#f4f8ff'; x.fillRect(x0+ww/2-3,y0,6,2); } };
  const win=(wx,wy)=>{ x.fillStyle='#3a2414'; x.fillRect(wx-1,wy-1,8,8); x.fillStyle='#ffcf5a'; x.fillRect(wx,wy,6,6); x.fillStyle='#fff0a0'; x.fillRect(wx,wy,2,2); x.fillStyle='#3a2414'; x.fillRect(wx+3,wy,1,6); x.fillRect(wx,wy+3,6,1); };
  const door=c=>{ x.fillStyle=c||'#3a1e0e'; x.fillRect(X+D+3,Y+h-12,10,12); px(x,X+D+11,Y+h-6,'#ffd84a'); };
  x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(X+2,Y+h,w,3);
  if(o.k==='home'){ logs(X,Y+28,w,h-28,'#8a5a32','#7a4c28'); roof(X-4,Y,w+8,30,'#5a2a1a','#6a341e',1); x.fillStyle='#6a6a72'; x.fillRect(X+w-26,Y+2,8,18); win(X+10,Y+44); win(X+w-16,Y+44); win(X+30,Y+44); win(X+w-36,Y+44); door('#4a2410'); x.fillStyle='#ffd84a'; x.fillRect(X+w/2-12,Y+31,24,8); ptext(x,'LODGE',X+w/2-10,Y+33,'#3a1e0e'); }
  else if(o.k==='stables'){ x.fillStyle='#a82a20'; x.fillRect(X,Y+16,w,h-16); x.fillStyle='#f4eee0'; x.fillRect(X,Y+16,w,1); roof(X-2,Y,w+4,18,'#5a1a14','#6a2018'); x.fillRect(X+D+1,Y+h-14,14,14); x.fillStyle='#a82a20'; x.fillRect(X+D+3,Y+h-12,10,12); for(let k=0;k<10;k++){ px(x,X+D+3+k,Y+h-12+k,'#f4eee0'); px(x,X+D+12-k,Y+h-12+k,'#f4eee0'); } win(X+6,Y+22); win(X+w-12,Y+22); }
  else if(o.k==='gunsmith'){ x.fillStyle='#6a6a78'; x.fillRect(X,Y+12,w,h-12); for(let k=0;k<h-12;k+=4){ x.fillStyle='#5a5a66'; x.fillRect(X+(k%8?0:6),Y+12+k,10,1); } roof(X-2,Y,w+4,14,'#3a3a46','#2a2a34'); door('#2a1a10'); win(X+5,Y+20); x.fillStyle='#c8a45c'; x.fillRect(X+w-18,Y+18,15,9); ptext(x,'GUN',X+w-16,Y+20,'#2a1a10'); }
  else if(o.k==='golf'){ x.fillStyle='#f4eee0'; x.fillRect(X,Y+14,w,h-14); roof(X-2,Y,w+4,16,'#2a6a3a','#1e5a2e'); door('#2a6a3a'); win(X+6,Y+22); win(X+w-12,Y+22); x.fillStyle='#ffffff'; x.fillRect(X+w+6,Y+4,1,30); x.fillStyle='#e0203a'; x.fillRect(X+w+7,Y+4,7,4); x.fillStyle='#5ac04a'; x.fillRect(X+w+1,Y+33,12,4); px(x,X+w+6,Y+34,'#111'); }
  else if(o.k==='track'){ x.fillStyle='#b8905a'; x.fillRect(X,Y,w,h); x.fillStyle='#4aa040'; x.fillRect(X+10,Y+10,w-20,h-20); x.fillStyle='#ffffff'; for(let k=0;k<w;k+=6){ x.fillRect(X+k,Y,3,1); x.fillRect(X+k,Y+h-1,3,1); } x.fillRect(X+w/2,Y,1,10); x.fillStyle='#e0203a'; x.fillRect(X+14,Y+18,10,6); x.fillStyle='#5a3a1a'; x.fillRect(X+w-26,Y+18,12,10); x.fillStyle='#3a2a1a'; x.fillRect(X+D+2,Y+h-10,12,10); }
  else if(o.k==='dogpark'){ x.fillStyle='#5ab04a'; x.fillRect(X,Y,w,h); x.fillStyle='#d8c8a8'; for(let k=0;k<w;k+=5) x.fillRect(X+k,Y,1,h); x.fillRect(X,Y,w,1); x.fillRect(X,Y+h-1,w,1); x.fillStyle='#ffd84a'; x.fillRect(X+14,Y+14,8,8); ptext(x,'DOG',X+w-20,Y+6,'#3a2a1a'); }
  else if(o.k==='soak'){ x.fillStyle='#c8c0d8'; x.fillRect(X,Y,w,h); x.fillStyle='#2ab8b0'; x.fillRect(X+4,Y+6,w-8,h-12); x.fillStyle='#7af0e0'; x.fillRect(X+8,Y+10,w-16,h-20); for(const lx of [X+2,X+w-4]){ x.fillStyle='#3a2a1a'; x.fillRect(lx,Y-8,2,12); x.fillStyle='#ff9a50'; x.fillRect(lx-1,Y-11,4,4); } }
  else if(o.k==='lookout'){ x.fillStyle='#6a4a2a'; for(const lx of [X+6,X+w-8]) x.fillRect(lx,Y+10,3,h-10); for(let k=0;k<4;k++){ x.fillStyle='#8a6a3a'; x.fillRect(X+6,Y+14+k*8,w-12,1); } x.fillStyle='#8a5a2a'; x.fillRect(X+2,Y+4,w-4,8); x.fillStyle='#5a2a1a'; x.fillRect(X,Y,w,5); x.fillStyle='#c8c8d8'; x.fillRect(X+w-14,Y+1,8,3); }
  else if(o.k==='marsh'){ x.fillStyle='#7a6a3a'; x.fillRect(X+26,Y+50,36,14); x.fillStyle='#5a7a2a'; for(let k=0;k<36;k+=2) x.fillRect(X+26+k,Y+46-(k%6),2,8); x.fillStyle='#1a140a'; x.fillRect(X+32,Y+55,24,4); } }
const WC=new Map();
function wdChunk(cx,cy){ const key=cx+','+cy+':'+wdStars(); let c=WC.get(key); if(c){ WC.delete(key); WC.set(key,c); return c; } const Wd=wdGen(), {W,H,T,CH}=WD;
  c=document.createElement('canvas'); c.width=c.height=T*CH; const x=c.getContext('2d'), X0=cx*CH, Y0=cy*CH;
  const wet=k=>k===T_.WATER||k===T_.DEEP||k===T_.BRIDGE||k===T_.HOT;
  for(let ty=Y0;ty<Y0+CH&&ty<H;ty++) for(let tx=X0;tx<X0+CH&&tx<W;tx++){ const i=Wd.I(tx,ty), t=Wd.map[i], R=REG[Wd.reg[i]], at=(a,b)=>{ const xx=tx+a, yy=ty+b; return xx<0||yy<0||xx>=W||yy>=H?T_.G:Wd.map[Wd.I(xx,yy)]; };
    const nb=[!wet(at(0,-1))&&at(0,-1)!==T_.REED,!wet(at(1,0))&&at(1,0)!==T_.REED,!wet(at(0,1))&&at(0,1)!==T_.REED,!wet(at(-1,0))&&at(-1,0)!==T_.REED]; nb.wet=wet(at(1,0))||wet(at(-1,0))||wet(at(0,1))||wet(at(0,-1));
    wdTile(x,(tx-X0)*T,(ty-Y0)*T,t,R,Wd.v[i],nb); }
  for(const o of Wd.L){ const X=(o.x-X0)*T, Y=(o.y-Y0)*T; if(X>T*CH+40||Y>T*CH+40||X+o.w*T<-40||Y+o.h*T<-60) continue; wdBld(x,o,X,Y); }
  for(let ty=Y0;ty<Y0+CH&&ty<H;ty++) for(let tx=X0;tx<X0+CH&&tx<W;tx++){ const ri=Wd.reg[Wd.I(tx,ty)]; if(regOpen(ri)) continue; x.fillStyle='rgba(12,10,26,.8)'; x.fillRect((tx-X0)*T,(ty-Y0)*T,T,T); if(Wd.v[Wd.I(tx,ty)]%7===0){ x.fillStyle='rgba(180,180,220,.12)'; x.fillRect((tx-X0)*T+2,(ty-Y0)*T+6,10,3); } }
  REG.forEach((R,ri)=>{ if(regOpen(ri)) return; const [ax,ay]=R.at; if(ax>=X0&&ax<X0+CH&&ay>=Y0&&ay<Y0+CH){ const lx=(ax-X0)*T, ly=(ay-Y0)*T, s='STAR '+R.stars, n=R.name.toUpperCase(); ptext(x,s,lx-ptextW(s)/2,ly,'#ffd84a'); ptext(x,n,lx-ptextW(n)/2,ly+8,'#c8c0e0'); } });
  WC.set(key,c); if(WC.size>48) WC.delete(WC.keys().next().value); return c; }

/* ---------- state, chests and forage ---------- */
function wdState(){ S.world=Object.assign({chests:[],seen:'',marsh:{},items:[],day:'',forage:[]},S.world||{}); const W=S.world, day=typeof dayKey==='function'?dayKey():new Date().toDateString(); if(W.day!==day){ W.day=day; W.forage=[]; } return W; }
const TRINKETS=['🧭 Brass Compass','🪙 Pirate Doubloon','🗝️ Rusty Key','📜 Old Map','🦴 Dino Bone','🐚 Conch Shell','💎 Raw Sapphire','🪶 Eagle Feather','⌛ Sand Timer','🏺 Clay Urn','🔔 Silver Bell','🎲 Ivory Dice','🧿 Lucky Eye','🪬 Hamsa Charm','🕯️ Lantern Wick','🍄 Glow Mushroom','🌰 Golden Acorn','🪨 Meteorite','❄️ Never-melt Ice','🔮 Fortune Orb','🎻 Tiny Fiddle','🧸 Old Teddy','📯 Post Horn','⚓ Ship Anchor','🗿 Stone Head','🦪 Black Pearl','🌵 Desert Rose','🪵 Petrified Wood','🎐 Wind Chime','🧩 Puzzle Box','🏹 Arrowhead','🪖 Old Helmet','🍯 Honey Jar','🦋 Pinned Butterfly','🌋 Lava Glass','⭐ Fallen Star','🪐 Ringed Pebble','🐉 Dragon Scale','🦉 Owl Totem','🦆 Carved Decoy','🎣 Lucky Lure','🍀 Four-leaf Clover','🧪 Strange Tonic','🪞 Hand Mirror','🗡️ Letter Opener','🎩 Top Hat Pin','🧶 Golden Yarn','📿 Prayer Beads','🪃 Boomerang','👑 Tiny Crown'];
const CHEST_GUNS=['tracker','bramble','sunbeam','reefer','moonlit','geode','gale'];
function wdChestPrize(n){ if(n%12===5) return {kind:'gun',gun:CHEST_GUNS[Math.floor(n/12)%CHEST_GUNS.length]}; const tIdx=n-Math.floor((n+7)/12); if(n%4!==3&&tIdx<TRINKETS.length) return {kind:'trinket',name:TRINKETS[tIdx]}; return {kind:'cash'}; }
function wdOpenChest(c){ const W=wdState(); if(W.chests.includes(c.n)) return; W.chests.push(c.n); const p=wdChestPrize(c.n); let msg;
  if(p.kind==='trinket'&&!W.items.includes(p.name)){ W.items.push(p.name); msg=`🧰 Treasure! ${p.name}`; }
  else if(p.kind==='gun'&&HU_GUNS[p.gun]){ const P=huMine(); if(!P.guns.includes(p.gun)) P.guns.push(p.gun); msg=`🧰 A rare gun: ${HU_GUNS[p.gun].icon} ${HU_GUNS[p.gun].name}!`; }
  else { const cash=nice(Math.max(50000,cashNow()*.004*(1+REG[c.reg].stars*.4))); setBank(cash); msg=`🧰 A purse of coins: +${k$(cash)}`; }
  if(typeof gainXP==='function') gainXP(25,'Treasure'); save(); try{ fx.confetti(70); }catch(e){} [784,988,1319].forEach((f,i)=>tone(f,.1,'square',.05,i*.08)); toast(msg,'gold'); wdHud(); }
function wdForage(){ const W=wdState(), Wd=wdGen(), r=prng([...W.day].reduce((s,c)=>s+c.charCodeAt(0),0)), out=[];
  for(let g=0;out.length<14&&g<6000;g++){ const x=4+Math.floor(r()*(WD.W-8)), y=4+Math.floor(r()*(WD.H-8)), i=Wd.I(x,y); if(Wd.map[i]!==T_.G||!regOpen(Wd.reg[i])) continue; out.push({x,y,n:out.length}); } return out; }
function wdForageGet(f){ const W=wdState(); if(W.forage.includes(f.n)) return; W.forage.push(f.n); const cash=nice(Math.max(20000,cashNow()*.0015)); setBank(cash); if(typeof gainXP==='function') gainXP(10,'Foraging'); save(); tone(1046,.06,'triangle',.05); toast(`✨ Found +${k$(cash)} (${W.forage.length}/14 today)`,'gold'); wdHud(); }

/* ---------- moving around ---------- */
const GR={el:null,c:null,ctx:null,loop:null,me:null,cam:[0,0],VW:192,VH:340,sc:2,open:false,paused:false,forage:null,parts:[],ri:-1};
const wdPass=(tx,ty)=>{ if(tx<0||ty<0||tx>=WD.W||ty>=WD.H) return false; const Wd=wdGen(), i=Wd.I(tx,ty); return PASS.has(Wd.map[i])&&regOpen(Wd.reg[i]); };
const wdMeT=()=>[Math.round((GR.me.x-8)/16),Math.round((GR.me.y-15)/16)];
function wdPath(sx,sy,gx,gy){ const W=WD.W, prev=new Int32Array(W*WD.H).fill(-1), s=sy*W+sx, goal=gy*W+gx, q=[s]; prev[s]=s; let h=0;
  while(h<q.length){ const c=q[h++]; if(c===goal) break; const x=c%W, y=(c/W)|0; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy, n=ny*W+nx; if(nx<0||ny<0||nx>=W||ny>=WD.H||prev[n]>=0||!wdPass(nx,ny)) continue; prev[n]=c; q.push(n); } }
  if(prev[goal]<0) return null; const out=[]; let c=goal; while(c!==s){ out.push([c%W,(c/W)|0]); c=prev[c]; } return out.reverse(); }
function wdNearPass(tx,ty){ if(wdPass(tx,ty)) return [tx,ty]; for(let r=1;r<6;r++) for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){ if(Math.abs(dx)!==r&&Math.abs(dy)!==r) continue; if(wdPass(tx+dx,ty+dy)) return [tx+dx,ty+dy]; } return null; }
function wdWalkTo(tx,ty,arrive){ const st=wdMeT(), g=wdNearPass(tx,ty); if(!g) return; if(g[0]===st[0]&&g[1]===st[1]){ GR.me.path=[]; if(arrive) setTimeout(arrive,60); return; }
  const p=wdPath(st[0],st[1],g[0],g[1]); if(!p){ tone(200,.05,'square',.03); return; } GR.me.path=p; GR.me.arrive=arrive||null; }
function wdLandAt(tx,ty){ return wdGen().L.find(o=>tx>=o.x&&tx<o.x+o.w&&ty>=o.y-1&&ty<=o.y+o.h); }
function wdNearL(){ const [tx,ty]=wdMeT(); return wdGen().L.find(o=>Math.abs(o.door[0]-tx)<=1&&Math.abs(o.door[1]-ty)<=1&&regOpen(o.reg)); }
function wdName(o){ if(o.k==='golf') return courseName(o.course); if(o.k==='track') return (HTRACKS[o.track]||{}).name||'Race track'; if(o.k==='marsh') return HU_MARSH[o.m].name; return o.name; }

function wdDraw(t,dt){ const x=GR.ctx, m=GR.me, Wd=wdGen(), {T,CH}=WD, VW=GR.VW, VH=GR.VH;
  if(m.path&&m.path.length){ const [nx,ny]=m.path[0], gx=nx*16+8, gy=ny*16+15, dx=gx-m.x, dy=gy-m.y, d=Math.hypot(dx,dy), sp=80*dt;
    if(d<=sp){ m.x=gx; m.y=gy; m.path.shift(); } else { m.x+=dx/d*sp; m.y+=dy/d*sp; } if(Math.abs(dx)>.5) m.face=dx<0?-1:1; m.walk+=dt;
    if(!m.path.length&&m.arrive){ const a=m.arrive; m.arrive=null; setTimeout(a,80); } }
  GR.cam[0]=Math.max(0,Math.min(WD.W*T-VW,Math.round(m.x-VW/2))); GR.cam[1]=Math.max(0,Math.min(WD.H*T-VH,Math.round(m.y-VH/2-10)));
  const [cx,cy]=GR.cam; x.fillStyle='#000'; x.fillRect(0,0,VW,VH);
  for(let gy=Math.floor(cy/(T*CH));gy<=Math.floor((cy+VH)/(T*CH));gy++) for(let gx=Math.floor(cx/(T*CH));gx<=Math.floor((cx+VW)/(T*CH));gx++) x.drawImage(wdChunk(gx,gy),gx*T*CH-cx,gy*T*CH-cy);
  const t0x=Math.floor(cx/T), t0y=Math.floor(cy/T);
  for(let ty=t0y;ty<=t0y+VH/T+1;ty++) for(let tx=t0x;tx<=t0x+VW/T+1;tx++){ if(tx>=WD.W||ty>=WD.H) continue; const i=Wd.I(tx,ty), tt=Wd.map[i]; if(tt!==T_.WATER&&tt!==T_.DEEP&&tt!==T_.HOT) continue; if(!regOpen(Wd.reg[i])) continue;
    const ph=(t*1.6+Wd.v[i]*.05)%3; if(ph<1){ x.fillStyle='rgba(255,255,255,.7)'; x.fillRect(tx*T-cx+(Wd.v[i]%10)+Math.floor(ph*4),ty*T-cy+(Wd.v[i]%12)+2,3,1); }
    if(tt===T_.HOT&&Wd.v[i]%3===0){ const q=(t*.6+Wd.v[i]*.01)%1; x.fillStyle=`rgba(255,255,255,${.35*(1-q)})`; x.fillRect(tx*T-cx+6,ty*T-cy+4-q*18,Math.max(1,4-q*2),3); } }
  const home=Wd.L[0]; for(let k=0;k<4;k++){ const q=((t*.5+k/4)%1); x.fillStyle=`rgba(200,200,210,${.5*(1-q)})`; x.fillRect(Math.round((home.x*T+home.w*T-22)-cx+Math.sin(t+k)*3),Math.round(home.y*T-cy-q*30),3+Math.round(q*3),3); }
  const W=wdState();
  for(const o of Wd.L){ if(o.k!=='marsh'||!regOpen(o.reg)) continue; const ox=o.x*T-cx, oy=o.y*T-cy; if(ox<-100||oy<-80||ox>VW+20||oy>VH+20) continue; const M=HU_MARSH[o.m], sp=hu8Sprite(M.birds[0],0);
    for(let k=0;k<2;k++){ const bx=ox+18+((t*7+k*31)%54), by=oy+6+k*16+Math.round(Math.sin(t*2+k)); x.drawImage(sp,0,0,sp.width,Math.ceil(sp.height*.8),Math.round(bx),by,sp.width,Math.ceil(sp.height*.8)); }
    if(W.marsh[o.m]&&W.marsh[o.m].beat){ x.fillStyle='#ffd84a'; x.fillRect(ox+44,oy+48,5,5); x.fillStyle='#fff6c0'; x.fillRect(ox+45,oy+49,2,2); } }
  for(const c of Wd.chests){ if(!regOpen(c.reg)) continue; const X=c.x*T-cx, Y=c.y*T-cy; if(X<-16||Y<-16||X>VW||Y>VH) continue; const open=W.chests.includes(c.n);
    x.fillStyle='rgba(0,0,0,.3)'; x.fillRect(X+2,Y+13,12,2); x.fillStyle=open?'#5a3a1a':'#8a5a22'; x.fillRect(X+2,Y+5,12,9); x.fillStyle=open?'#3a2410':'#a8742c'; x.fillRect(X+2,Y+(open?3:5),12,3); x.fillStyle='#ffd84a'; x.fillRect(X+7,Y+8,2,3); x.fillRect(X+2,Y+9,12,1);
    if(!open&&Math.sin(t*3+c.n)>.6){ x.fillStyle='#fff6c0'; x.fillRect(X+12,Y+2,1,3); x.fillRect(X+11,Y+3,3,1); } }
  GR.forage=GR.forage||wdForage(); for(const f of GR.forage){ if(W.forage.includes(f.n)) continue; const X=f.x*T-cx+8, Y=f.y*T-cy+8+Math.round(Math.sin(t*3+f.n)*2); if(X<-8||Y<-8||X>VW+8||Y>VH+8) continue;
    x.fillStyle=(t*4+f.n)%2<1?'#fff6c0':'#ffd84a'; x.fillRect(X-1,Y-3,2,7); x.fillRect(X-3,Y-1,7,2); x.fillStyle='#ffffff'; x.fillRect(X,Y,1,1);
    if(Math.abs(m.x-(f.x*T+8))<10&&Math.abs(m.y-(f.y*T+15))<12) wdForageGet(f); }
  const fr=m.path&&m.path.length?'walk'+((m.walk*8|0)%4):'idle0', spr=personSprite('player',fr,typeof lodgeLook==='function'?lodgeLook():null);
  x.fillStyle='rgba(0,0,0,.3)'; x.fillRect(Math.round(m.x-cx-5),Math.round(m.y-cy-1),10,2);
  x.save(); x.translate(Math.round(m.x-cx),Math.round(m.y-cy-PERSON_H)); if(m.face<0) x.scale(-1,1); x.drawImage(spr,-6,0); x.restore();
  { const [ax,ay]=wdMeT(); const ch=Wd.chests.find(c=>c.x===ax&&c.y===ay&&!W.chests.includes(c.n)&&regOpen(c.reg)); if(ch) wdOpenChest(ch); }
  const [mtx,mty]=wdMeT(), ri=Wd.reg[Wd.I(Math.max(0,Math.min(WD.W-1,mtx)),Math.max(0,Math.min(WD.H-1,mty)))], R=REG[ri];
  if(R.tint){ x.fillStyle=R.tint; x.fillRect(0,0,VW,VH); }
  if(R.dark){ const g=x.createRadialGradient(m.x-cx,m.y-cy-10,12,m.x-cx,m.y-cy-10,95); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,10,.72)'); x.fillStyle=g; x.fillRect(0,0,VW,VH); }
  wdWeather(x,t,dt,R);
  if(ri!==GR.ri){ GR.ri=ri; wdHud(true); }
  const nl=wdNearL(), act=GR.el.querySelector('.gr-act'), key=nl?nl.k+(nl.m??nl.course??nl.track??''):''; if(act.dataset.v!==key){ act.dataset.v=key; act.innerHTML=nl?`${nl.ic} <b>${esc(wdName(nl))}</b>`:''; act.classList.toggle('on',!!nl); }
  wdSee(Math.floor(mtx/8),Math.floor(mty/8),2); }
function wdSee(bx,by,r){ const W=wdState(), cols=Math.ceil(WD.W/8), rows=Math.ceil(WD.H/8); if(W.seen.length!==cols*rows) W.seen='0'.repeat(cols*rows); let s=W.seen, ch=false;
  for(let y=by-r;y<=by+r;y++) for(let x=bx-r;x<=bx+r;x++){ if(x<0||y<0||x>=cols||y>=rows) continue; const i=y*cols+x; if(s[i]!=='1'){ s=s.slice(0,i)+'1'+s.slice(i+1); ch=true; } } if(ch) W.seen=s; }
function wdWeather(x,t,dt,R){ const VW=GR.VW, VH=GR.VH; if(!GR.parts.length) for(let k=0;k<44;k++) GR.parts.push({x:Math.random()*VW,y:Math.random()*VH,v:Math.random(),p:Math.random()*6});
  for(const p of GR.parts){ const f=R.fx, X=Math.round(p.x), Y=Math.round(p.y);
    if(f==='snow'){ p.y+=dt*(14+p.v*14); p.x+=Math.sin(t+p.p)*.2; x.fillStyle='#ffffff'; x.fillRect(X,Y,p.v>.6?2:1,p.v>.6?2:1); }
    else if(f==='petals'){ p.y+=dt*(10+p.v*8); p.x+=dt*8; x.fillStyle=p.v>.5?'#ffb0d0':'#ff8ab8'; x.fillRect(X,Y,2,1); }
    else if(f==='fireflies'){ const a=Math.sin(t*3+p.p); if(a>0){ x.fillStyle=a>.7?'#f0ff8a':'#a0c040'; x.fillRect(Math.round(p.x+Math.sin(t*.7+p.p)*8),Math.round(p.y+Math.cos(t*.5+p.p)*6),1,1); } }
    else if(f==='sparkle'){ if(Math.sin(t*2.5+p.p*3)>.8){ x.fillStyle=p.v>.5?'#7af0ff':'#ff8ae8'; x.fillRect(X,Y,1,3); x.fillRect(X-1,Y+1,3,1); } }
    else if(f==='motes'){ if(p.v<.4){ x.fillStyle='rgba(255,240,170,.7)'; x.fillRect(Math.round(p.x+Math.sin(t*.5+p.p)*6),Y,1,1); } }
    else if(f==='mist'){ if(p.v<.15){ p.x+=dt*4; x.fillStyle='rgba(255,230,230,.08)'; x.fillRect(X-20,Y,40,6); } }
    else if(f==='stars'){ if(Math.sin(t*1.5+p.p*4)>.5){ x.fillStyle='#ffffff'; x.fillRect(X,Math.round(p.y*.4),1,1); } }
    else if(f==='spray'){ if(p.v<.3){ p.y-=dt*10; x.fillStyle='rgba(255,255,255,.4)'; x.fillRect(X,Y,1,1); } }
    else if(f==='glints'){ if(Math.sin(t*4+p.p*5)>.85){ x.fillStyle='#ffffe0'; x.fillRect(X,Y,2,1); } }
    if(p.y>VH) p.y-=VH; if(p.y<0) p.y+=VH; if(p.x>VW) p.x-=VW; }
  if(R.fx==='stars'){ const ph=(t*.3)%1; if(ph<.2){ const q=ph/.2, sx=((Math.floor(t*.3)*53)%VW); x.fillStyle=`rgba(255,255,255,${1-q})`; for(let k=0;k<6;k++) x.fillRect(Math.round(sx+q*60-k*2),Math.round(20+q*30-k),1,1); } } }

/* ---------- landmarks ---------- */
function wdAct(o){ if(!regOpen(o.reg)) return; const k=o.k;
  if(k==='home') return closeGrounds();
  if(k==='soak'){ const W=wdState(); if(W.soak===W.day){ toast('♨️ You already soaked today — come back tomorrow','gold'); return; } W.soak=W.day; if(typeof gainXP==='function') gainXP(80,'Hot springs'); save(); toast('♨️ A long soak. +80 XP','gold'); return; }
  if(k==='lookout') return wdLookout(o);
  if(k==='gunsmith') return huShop();
  if(k==='golf') return modal(`<div class="fgm-k">⛳ ${esc(courseName(o.course))}</div><p class="muted" style="text-align:center">${esc(GOLF_COURSES[o.course].blurb)}<br>Green fee ${k$(golfHoleFee())} a hole · eagle ${k$(Math.round(golfHoleFee()*20*golfLvX()))} · ace ${k$(Math.round(golfHoleFee()*100*golfLvX()))}</p>
    <div class="fgm-row" style="flex-direction:column;gap:8px">${[3,6,9].map(n=>`<button class="btn ${n===6?'gold':''} wide" data-a="wdGolf" data-v="${o.course}" data-n="${n}">${n} holes · ${k$(golfHoleFee()*n)}</button>`).join('')}</div>`);
  if(k==='track'){ const T=HTRACKS[o.track]; return modal(`<div class="fgm-k">🏇 ${esc(T.name)}</div><p class="muted" style="text-align:center">${esc(T.blurb||'')}</p><div class="fgm-row" style="flex-direction:column;gap:8px">
    ${S.horse?`<button class="btn gold wide" data-a="wdTrack" data-v="${o.track}">Practice here (free)</button>`:'<p class="muted" style="text-align:center">You need a horse — the stables are on the Front Lawn.</p>'}<button class="btn wide" data-a="wdStables">🐎 Open the stables</button></div>`); }
  grPause();
  if(k==='stables') openHorses(); else if(k==='dogpark') openWalks(); else if(k==='marsh') openHunt(o.m); }
Object.assign(ACT,{ wdGolf:el=>{ closeModal(); grPause(); openGolf({course:el.dataset.v,holes:+el.dataset.n}); },
  wdTrack:el=>{ closeModal(); grPause(); openHorses(); setTimeout(()=>hrStart(el.dataset.v,true),80); }, wdStables:()=>{ closeModal(); grPause(); openHorses(); } });

/* ---------- lookout: zoom out to a huge picture of the area ---------- */
function wdLookout(o){ const Wd=wdGen(), R=REG[o.reg], sw=96, sh=72, x0=Math.max(0,Math.min(WD.W-sw,o.x-sw/2)), y0=Math.max(0,Math.min(WD.H-sh,o.y-sh/2));
  const c=document.createElement('canvas'); c.width=sw*16; c.height=sh*16; const x=c.getContext('2d');
  for(let gy=Math.floor(y0/WD.CH);gy<=Math.floor((y0+sh)/WD.CH);gy++) for(let gx=Math.floor(x0/WD.CH);gx<=Math.floor((x0+sw)/WD.CH);gx++) x.drawImage(wdChunk(gx,gy),(gx*WD.CH-x0)*16,(gy*WD.CH-y0)*16);
  const W=wdState(); x.font='bold 22px system-ui,sans-serif'; x.textAlign='center';
  for(const ch of Wd.chests){ if(ch.x<x0||ch.y<y0||ch.x>=x0+sw||ch.y>=y0+sh||!regOpen(ch.reg)) continue; const X=(ch.x-x0)*16, Y=(ch.y-y0)*16, got=W.chests.includes(ch.n);
    if(!got){ x.fillStyle='rgba(255,216,74,.35)'; x.beginPath(); x.arc(X+8,Y+8,18,0,7); x.fill(); } x.fillStyle=got?'#5a3a1a':'#ffd84a'; x.fillRect(X+2,Y+4,12,10); }
  for(const L of Wd.L){ if(L.x<x0||L.y<y0||L.x>=x0+sw||L.y>=y0+sh||!regOpen(L.reg)) continue; const X=(L.x-x0+L.w/2)*16, Y=(L.y-y0)*16-6, tx=L.ic+' '+wdName(L), w=x.measureText(tx).width+18;
    x.fillStyle='rgba(10,8,20,.78)'; x.fillRect(X-w/2,Y-24,w,30); x.fillStyle='#ffe9b0'; x.fillText(tx,X,Y); }
  wdSee(Math.floor(o.x/8),Math.floor(o.y/8),7); save();
  const el=document.createElement('div'); el.className='wd-look'; el.innerHTML=`<div class="wd-look-cap"><b>🔭 ${esc(R.name)}</b><small>Drag to look around · gold glows are unopened chests · added to your map</small></div><button class="btn gold wd-look-x">Back down</button>`;
  c.className='wd-look-img'; el.prepend(c); GR.el.appendChild(el); tone(523,.1,'triangle',.05); tone(784,.16,'triangle',.04,.12);
  const fit=Math.max(innerWidth/c.width,innerHeight/c.height)*1.02, big=GR.sc, sx=(o.x-x0+o.w/2)*16, sy=(o.y-y0)*16;
  let tx=innerWidth/2-sx*big, ty=innerHeight/2-sy*big, s=big; const set=()=>{ c.style.transform=`translate(${tx}px,${ty}px) scale(${s})`; }; c.style.transformOrigin='0 0'; set();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ c.style.transition='transform 2.8s cubic-bezier(.3,.1,.2,1)'; s=fit; tx=(innerWidth-c.width*fit)/2; ty=(innerHeight-c.height*fit)/2; set(); }));
  let drag=null; el.addEventListener('pointerdown',e=>{ if(e.target.closest('.wd-look-x')) return; drag=[e.clientX,e.clientY,tx,ty]; c.style.transition='none'; });
  el.addEventListener('pointermove',e=>{ if(!drag) return; tx=Math.min(0,Math.max(innerWidth-c.width*s,drag[2]+e.clientX-drag[0])); ty=Math.min(0,Math.max(innerHeight-c.height*s,drag[3]+e.clientY-drag[1])); set(); });
  el.addEventListener('pointerup',()=>drag=null); el.querySelector('.wd-look-x').onclick=()=>el.remove(); }

/* ---------- map and pack ---------- */
function wdMapOpen(){ const Wd=wdGen(), W=wdState(), s=2, c=document.createElement('canvas'); c.width=WD.W*s; c.height=WD.H*s; const x=c.getContext('2d'), cols=Math.ceil(WD.W/8);
  const col={1:'#c8a06a',2:'#3a7ad0',3:'#1e5a2a',4:'#7a7a88',5:'#2a1c3c',6:'#8a5a2a',8:'#6a7a2a',9:'#a85a3a',10:'#bfe2f6',11:'#3ad0c8',12:'#ecd6a0',13:'#163a7a',14:'#a85a3a'};
  if(W.seen.length!==cols*Math.ceil(WD.H/8)) wdSee(0,0,0);
  for(let y=0;y<WD.H;y++) for(let xx=0;xx<WD.W;xx++){ const i=Wd.I(xx,y), seen=W.seen[Math.floor(y/8)*cols+Math.floor(xx/8)]==='1', R=REG[Wd.reg[i]];
    x.fillStyle=!seen?'#0c0a1a':(col[Wd.map[i]]||R.g[0]); x.fillRect(xx*s,y*s,s,s); if(seen&&!regOpen(Wd.reg[i])){ x.fillStyle='rgba(12,10,26,.6)'; x.fillRect(xx*s,y*s,s,s); } }
  x.font='11px sans-serif'; x.textAlign='center'; for(const L of Wd.L){ if(W.seen[Math.floor(L.y/8)*cols+Math.floor(L.x/8)]!=='1') continue; x.fillText(L.ic,(L.x+L.w/2)*s,(L.y+L.h/2)*s+4); }
  x.fillStyle='#fff'; x.fillRect(GR.me.x/16*s-3,GR.me.y/16*s-3,7,7); x.fillStyle='#e0203a'; x.fillRect(GR.me.x/16*s-2,GR.me.y/16*s-2,5,5);
  const seenN=[...W.seen].filter(v=>v==='1').length;
  modal(`<div class="fgm-k">🗺️ The Grounds</div><div class="wd-map"></div><div class="tchips"><span>🧭 ${Math.round(seenN/W.seen.length*100)}% explored</span><span>🧰 ${W.chests.length}/${Wd.chests.length} chests</span><span>🦆 ${Object.values(W.marsh).filter(v=>v.beat).length}/${HU_MARSH.length} marshes</span></div>
    <div class="wd-legend">${REG.map((R,i)=>`<span class="${regOpen(i)?'':'lock'}">${regOpen(i)?'':'⭐'+R.stars+' '}${esc(R.name)}</span>`).join('')}</div>`);
  const box=document.querySelector('.fgm .wd-map'); if(box){ c.className='wd-map-c'; box.appendChild(c); } }
function wdPackOpen(){ const W=wdState(), P=huMine(), Wd=wdGen(), wins=HU_MARSH.filter((M,i)=>W.marsh[i]&&W.marsh[i].beat);
  modal(`<div class="fgm-k">🎒 Your pack</div><div class="tchips"><span>🧰 ${W.chests.length}/${Wd.chests.length} chests</span><span>🗿 ${W.items.length}/${TRINKETS.length} treasures</span><span>🔫 ${P.guns.length}/${Object.keys(HU_GUNS).length} guns</span></div>
    <div class="gd-h">🏆 Marsh prizes</div><div class="wd-grid">${wins.length?wins.map(M=>`<span>${M.reward.ic}<small>${esc(M.reward.name)}</small></span>`).join(''):'<div class="gd-empty">Beat a marsh to win its prize</div>'}</div>
    <div class="gd-h">🗿 Treasures</div><div class="wd-grid">${TRINKETS.map(t=>W.items.includes(t)?`<span>${t.split(' ')[0]}<small>${esc(t.slice(t.indexOf(' ')+1))}</small></span>`:'<span class="lock">❔</span>').join('')}</div>
    <div class="gd-h">🔫 Guns</div><div class="wd-grid">${Object.entries(HU_GUNS).map(([k,G])=>P.guns.includes(k)?`<span>${G.icon}<small>${esc(G.name)}</small></span>`:'<span class="lock">❔</span>').join('')}</div>`); }

/* ---------- open / close ---------- */
function wdHud(flash){ if(!GR.el) return; const R=REG[Math.max(0,GR.ri)], W=wdState();
  GR.el.querySelector('.gr-zone').innerHTML=`<b>${esc(R.name)}</b><small>🧰 ${W.chests.length}/${wdGen().chests.length} · ✨ ${W.forage.length}/14 today</small>`;
  if(flash){ const e=GR.el.querySelector('.gr-zone'); e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); } }
function wdSize(){ const w=innerWidth, h=innerHeight, sc=Math.max(2,Math.round(Math.min(w,h*.62)/185)); GR.sc=sc; GR.VW=Math.ceil(w/sc); GR.VH=Math.ceil(h/sc); GR.c.width=GR.VW; GR.c.height=GR.VH; GR.c.style.width=GR.VW*sc+'px'; GR.c.style.height=GR.VH*sc+'px'; GR.ctx.imageSmoothingEnabled=false; GR.parts=[]; }
function grDom(){ if(GR.el) return; const el=document.createElement('div'); el.className='grounds'; el.innerHTML=`<canvas class="wd-c"></canvas>
  <div class="gr-top"><button class="gr-back" data-gr="close">← Lodge</button><div class="gr-zone"></div><div class="wd-btns"><button data-gr="map" aria-label="Map">🗺️</button><button data-gr="pack" aria-label="Pack">🎒</button></div></div>
  <button class="gr-act" data-gr="act"></button><div class="gr-tip">Tap to walk · tap a building, chest or marsh to go there</div>`;
  document.body.appendChild(el); GR.el=el; GR.c=el.querySelector('canvas'); GR.ctx=GR.c.getContext('2d'); GR.loop=makeLoop(wdDraw);
  GR.c.addEventListener('pointerdown',e=>{ const r=GR.c.getBoundingClientRect(), wx=GR.cam[0]+(e.clientX-r.left)/GR.sc, wy=GR.cam[1]+(e.clientY-r.top)/GR.sc, tx=Math.floor(wx/16), ty=Math.floor(wy/16); el.querySelector('.gr-tip').classList.add('off');
    const Wd=wdGen(), ch=Wd.chests.find(c=>c.x===tx&&c.y===ty&&regOpen(c.reg));
    if(ch){ wdWalkTo(ch.x,ch.y,()=>wdOpenChest(ch)); tone(660,.04,'square',.03); return; }
    const L=wdLandAt(tx,ty); if(L&&regOpen(L.reg)){ wdWalkTo(L.door[0],L.door[1],()=>wdAct(L)); tone(660,.04,'square',.03); return; }
    if(tx>=0&&ty>=0&&tx<WD.W&&ty<WD.H&&!regOpen(Wd.reg[Wd.I(tx,ty)])){ const R=REG[Wd.reg[Wd.I(tx,ty)]]; toast(`⭐ ${R.name} opens at prestige ${R.stars}`,'gold'); return; }
    wdWalkTo(tx,ty); tone(520,.03,'square',.02); });
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-gr]'); if(!b) return; const a=b.dataset.gr; if(a==='close') closeGrounds(); else if(a==='map') wdMapOpen(); else if(a==='pack') wdPackOpen(); else if(a==='act'){ const L=wdNearL(); if(L) wdAct(L); } });
  addEventListener('resize',()=>{ if(GR.open) wdSize(); }); }
function openGrounds(){ if(typeof closeModal==='function') closeModal(); grDom(); GR.open=true; GR.paused=false; GR.el.classList.add('on'); document.body.classList.add('in-golf');
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop(); wdGen(); wdSize(); const h=WORLD.L[0];
  GR.me=GR.me||{x:h.door[0]*16+8,y:(h.door[1]+1)*16+15,face:1,walk:0,path:null,arrive:null}; GR.forage=null; GR.ri=-1; wdHud(); GR.loop.start(); }
function closeGrounds(){ if(!GR.el) return; GR.loop.stop(); GR.open=false; GR.el.classList.remove('on'); document.body.classList.remove('in-golf'); GR.el.querySelectorAll('.wd-look').forEach(e=>e.remove()); save();
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start(); else render(); }
function grPause(){ GR.paused=true; if(GR.loop) GR.loop.stop(); }
function grResume(){ if(!GR.open) return; GR.paused=false; document.body.classList.add('in-golf'); if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop(); wdHud(); GR.loop.start(); }
for(const fn of ['closeGolf','closeWalks','closeHorses','closeHunt','closeRange']){ if(typeof window[fn]!=='function') continue; const f=window[fn]; window[fn]=function(){ const r=f.apply(this,arguments); if(GR.open) grResume(); return r; }; }
const grSubOpen=()=>!!document.querySelector('.golf.on');
const _closeModalGR=closeModal; closeModal=function(){ const r=_closeModalGR.apply(this,arguments); if(GR.open&&GR.paused) setTimeout(()=>{ if(GR.open&&GR.paused&&!grSubOpen()) grResume(); },60); return r; };
Object.assign(ACT,{ groundsOpen:()=>openGrounds() });

/* ---------- more golf courses and race tracks out on the map (not in the league pickers) ---------- */
(()=>{ const neg=a=>a.map(v=>{ const c=v.slice(); c[0]=-c[0]; if(c.length===5&&typeof c[2]==='number') c[2]=-c[2]; return c; });
  const mir=h=>Object.assign({},h,{fair:neg(h.fair||[]),green:h.green?[-h.green[0]].concat(h.green.slice(1)):h.green,sand:neg(h.sand||[]),water:neg(h.water||[]),trees:neg(h.trees||[]),deco:neg(h.deco||[])});
  const C=(id,name,blurb,holes)=>Object.defineProperty(GOLF_COURSES,id,{enumerable:false,value:{name:()=>name,blurb,holes}});
  C('birch','Cattail Commons','A marshland links. Reeds, ponds and a stiff breeze.',LAKES_HOLES.map(mir));
  C('frost','Frostbite Links','The home course mirrored and frozen over. Long and cold.',GOLF_HOLES.map(mir));
  C('steam','Steamwater Club','Hot pools steaming beside every green.',LAKES_HOLES.slice().reverse());
  C('canyon','Canyon Falls GC','The pine holes played backwards through a canyon.',RIDGE_HOLES.slice().reverse());
  C('grotto','The Grotto','Underground, lit by crystals. Tight and twisty.',RIDGE_HOLES.map(mir));
  C('sakura','Sakura Hills','Under the blossoms, the home course backwards.',GOLF_HOLES.slice().reverse());
  C('dunes','Lighthouse Dunes','Sand everywhere and the sea on your left.',GOLF_HOLES.slice().reverse().map(mir));
  C('skyline','Skyline Summit','Top of the world. Every hole over open air.',LAKES_HOLES.slice().reverse().map(mir));
  Object.assign(HTRACKS,{meadow:{name:'Clover Downs',ic:'🍀',w:[1.1,1,1],sky:'#8ac8f0',ground:'#a8803a',world:1,blurb:'A friendly dirt mile through the clover.'},timber:{name:'Timberline Turf',ic:'🌲',w:[1.3,.9,.8],sky:'#6a90b8',ground:'#3a7a3a',world:1,blurb:'Fast turf under the pines.'},
    glacier:{name:'Glacier Oval',ic:'🧊',w:[.7,.8,1.7],sky:'#d8e8f8',ground:'#eaf4ff',world:1,blurb:'Ice and snow — acceleration wins.'},bog:{name:'Bayou Mud Run',ic:'🐊',w:[.7,1.7,.8],sky:'#7a8a6a',ground:'#4a3a1a',world:1,blurb:'Deep mud. Stamina or bust.'},
    sands:{name:'Seaside Sands',ic:'🏖️',w:[.9,1.4,.9],sky:'#7ab0e8',ground:'#e0c890',world:1,blurb:'Heavy sand along the shore.'},skyway:{name:'Skyline Sprint',ic:'🌌',w:[1.6,.7,.9],sky:'#2a2a5a',ground:'#6a6488',world:1,blurb:'Thin air, flat-out speed.'},
    petal:{name:'Petal Park',ic:'🌸',w:[1.4,.9,.9],sky:'#ffc0d8',ground:'#7ab85a',world:1,blurb:'Turf under the blossoms.'},jungle:{name:'Jungle Circuit',ic:'🌿',w:[1,1.2,1.2],sky:'#7ac0e8',ground:'#5a7a2a',world:1,blurb:'Twisting and humid.'}}); })();
