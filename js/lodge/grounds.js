// 🌄 The Grounds: walk out the back of the lodge into a big scrolling world. Three areas are open to everyone;
// every prestige star opens one more (11 in all), each with its own sky, weather and landmarks:
//   Front Lawn (lodge, golf clubhouse) · Whispering Pines (stables, dog park) · Mirror Lake ·
//   ⭐1 Duck Marsh (Dawn Flight hunting) · ⭐2 Aurora Ridge · ⭐3 Hot Springs · ⭐4 Thunder Falls ·
//   ⭐5 Crystal Caverns · ⭐6 Blossom Orchard · ⭐7 Lighthouse Cove · ⭐8 Starfall Summit.
// Every area past the lawn hides a daily find ✨ (cash + XP). Tap to walk; tap a landmark to go in.
// Drawn smooth at full phone resolution: scenery is painted once into cached tiles (three parallax layers),
// and only the sky, weather, water, aurora and you are animated each frame.

const GR={el:null,c:null,ctx:null,loop:null,me:null,cam:0,S:1,SW:400,tiles:new Map(),zoneShown:-1,hold:null,open:false,paused:false};
const GR_H=640, GR_ZW=760, GR_FLOOR=548, GR_TW=380;
const GR_Z=[
  {id:'lawn',name:'The Front Lawn',stars:0,sky:['#2c3a7a','#e9876a','#ffd38a'],sun:{c:'#fff4cc',g:'#ffb35c',r:44,y:400},far:['#6b5a9c','#8c6ba3'],snow:'#ffe6d0',haze:'#ffb88a',tree:'pine',tc:['#3a3550','#2a2740'],gr:['#6a8a3a','#2f4a22'],path:'#d6ad74',fx:'motes',night:0},
  {id:'woods',name:'Whispering Pines',stars:0,sky:['#1a2250','#4a4a92','#c08ab8'],moon:{c:'#f4ecff',r:16,y:150},far:['#3a3f72','#4a4a82'],snow:'#d8e0ff',haze:'#8a72b0',tree:'pine',tc:['#1c2a3a','#14202e'],gr:['#2e5a3a','#14301e'],path:'#7a6450',fx:'fireflies',night:.6},
  {id:'lake',snowy:1,name:'Mirror Lake',stars:0,sky:['#0a1030','#2a3a7a','#86a8d8'],moon:{c:'#fffbe8',r:30,y:170},far:['#3a4a7a','#5a6a9a'],snow:'#ffffff',haze:'#8ab0e0',tree:'snowpine',tc:['#1c2c3c','#14202c'],gr:['#e4ecf8','#a8b8d0'],path:'#c4d0e6',fx:'snow',night:.75,water:1},
  {id:'marsh',name:'Duck Marsh',stars:1,sky:['#4a5a8a','#e48aa0','#ffd4a4'],sun:{c:'#fff0d8',g:'#ff9a7a',r:52,y:430},far:['#7a7aa0','#9a8ab0'],snow:'#ffe8f0',haze:'#ffc8c0',tree:'willow',tc:['#4a5a5a','#3a4a48'],gr:['#6a7a3a','#2a3a20'],path:'#8a6a4a',fx:'mist',night:0,water:1},
  {id:'ridge',snowy:1,name:'Aurora Ridge',stars:2,sky:['#02040e','#0a1a3a','#163652'],far:['#1a2a4a','#22324e'],snow:'#e0f0ff',haze:'#2a5a6a',tree:'snowpine',tc:['#0c1820','#08121a'],gr:['#c8d8f0','#8aa0c8'],path:'#9ab0d0',fx:'snow',night:1,aurora:1},
  {id:'springs',snowy:1,name:'Hot Springs',stars:3,sky:['#1a1a3a','#5a3a6a','#e88a7a'],moon:{c:'#fff0f4',r:20,y:140},far:['#4a3a6a','#6a4a7a'],snow:'#ffe0e8',haze:'#c88aa0',tree:'snowpine',tc:['#1e1a2e','#16121f'],gr:['#ece4f4','#b8a8c8'],path:'#c8b8d8',fx:'snow',night:.5},
  {id:'falls',name:'Thunder Falls',stars:4,sky:['#2a7ad0','#74bcf0','#d0f4ff'],sun:{c:'#ffffff',g:'#fff6c0',r:34,y:120},far:['#5a7a8a','#6a9a9a'],snow:'#f0ffff',haze:'#c0e8f0',tree:'round',tc:['#2a7a4a','#1c5a36'],gr:['#58b04e','#2a6a2a'],path:'#c8b080',fx:'spray',night:0},
  {id:'caves',name:'Crystal Caverns',stars:5,sky:['#0a0614','#1a0e2a','#2a1440'],far:['#1a0f2a','#241834'],snow:'#7af0ff',haze:'#3a1a5a',tree:'crystal',tc:['#3affff','#ff5ad8'],gr:['#2a1a3a','#140a20'],path:'#4a3a5a',fx:'sparkle',night:1,cave:1},
  {id:'orchard',name:'Blossom Orchard',stars:6,sky:['#5a4aa0','#ff9ab0','#ffe4b8'],sun:{c:'#fff4e0',g:'#ffb0a0',r:48,y:410},far:['#a07ab0','#c08ab0'],snow:'#fff0f8',haze:'#ffc0d0',tree:'blossom',tc:['#ff9ac8','#ffc4dc'],gr:['#7ab05a','#4a7a3a'],path:'#e0c090',fx:'petals',night:0},
  {id:'cove',name:'Lighthouse Cove',stars:7,sky:['#050a1e','#14285a','#3a5a8a'],moon:{c:'#fffbe8',r:36,y:160},far:['#14203a','#1e2e4a'],snow:'#d0e0ff',haze:'#2a4a7a',tree:'palm',tc:['#0e1a2a','#0a1420'],gr:['#d8c49a','#9a845a'],path:'#e6d4aa',fx:'glints',night:.9,sea:1},
  {id:'summit',name:'Starfall Summit',stars:8,sky:['#020108','#120a2a','#2a1a4a'],far:['#0e0a1e','#1a1430'],snow:'#c0b0ff',haze:'#2a1a4a',tree:'none',tc:['#0e0a1e','#0e0a1e'],gr:['#3a3450','#1a1428'],path:'#5a5070',fx:'shooting',night:1,galaxy:1},
];
// Landmarks: [zone, x in zone, width, icon, label, action]
const GR_L=[
  [0,150,190,'🏠','The Lodge','home'],[0,560,150,'⛳','Golf Clubhouse','golf'],
  [1,190,190,'🐎','Stables','horses'],[1,560,150,'🐾','Dog Park','walks'],
  [2,420,150,'🎣','The Dock','rest'],
  [3,390,170,'🦆','Hunting Blind · Dawn Flight','hunt'],
  [4,400,130,'🔭','The Overlook','rest'],[5,390,190,'♨️','The Springs','soak'],[6,400,160,'🌈','Falls Lookout','rest'],
  [7,390,160,'💎','The Geode','rest'],[8,400,150,'🌸','Orchard Swing','rest'],[9,480,120,'🗼','The Lighthouse','rest'],[10,420,170,'🌌','Observatory','rest'],
];
const grStars=()=>S.prestige||0;
const grOpenZones=()=>Math.min(GR_Z.length,3+grStars());
const grEnd=()=>grOpenZones()*GR_ZW;
const grDay=()=>typeof dayKey==='function'?dayKey():new Date().toDateString();
const grFindX=z=>z*GR_ZW+90+((z*137)%5)*30;
function grState(){ S.grounds=S.grounds||{}; if(S.grounds.day!==grDay()){ S.grounds.day=grDay(); S.grounds.found=[]; } return S.grounds; }

/* ---------- colour helpers ---------- */
const grRGB=h=>{ if(h[0]!=='#') return h.match(/[\d.]+/g).slice(0,3).map(Number); h=h.replace('#',''); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; };
const grMix=(a,b,k)=>{ const A=grRGB(a),B=grRGB(b); return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')})`; };
const grMixA=(a,b,k,al)=>{ const A=grRGB(a),B=grRGB(b); return `rgba(${A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')},${al})`; };
const grRand=s=>{ let a=s|0; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
// Zone blend at a world x: [zone a, zone b, k] — scenery eases from one area into the next over 160 px.
function grBlend(wx){ const z=Math.max(0,Math.min(GR_Z.length-1,Math.floor(wx/GR_ZW))), into=wx-z*GR_ZW, band=160;
  if(into>GR_ZW-band/2&&z<GR_Z.length-1) return [GR_Z[z],GR_Z[z+1],(into-(GR_ZW-band/2))/band];
  if(into<band/2&&z>0) return [GR_Z[z-1],GR_Z[z],.5+into/band];
  return [GR_Z[z],GR_Z[z],0]; }
const grCol=(wx,key,i)=>{ const [a,b,k]=grBlend(wx), A=typeof a[key]==='string'?a[key]:a[key][i], B=typeof b[key]==='string'?b[key]:b[key][i]; return k?grMix(A,B,k):A; };

/* ---------- painting the scenery tiles (once each) ---------- */
// Layer 0 = far mountains (parallax .2), 1 = hills and trees (.5), 2 = the ground you walk on (1).
const GR_F=[.2,.5,1];
const grRidge=(lx,seed,amp)=>{ let y=0; for(const [f,a,p] of [[.004,1,0],[.011,.45,1.7],[.023,.22,4.1],[.051,.09,2.3]]) y+=Math.sin(lx*f+p+seed)*a; return y*amp; };
function grTile(layer,i){ const key=layer+':'+i; let t=GR.tiles.get(key); if(t){ GR.tiles.delete(key); GR.tiles.set(key,t); return t; }
  const S=GR.S, c=document.createElement('canvas'); c.width=Math.ceil(GR_TW*S); c.height=Math.ceil(GR_H*S); const x=c.getContext('2d'); x.scale(S,S);
  const x0=i*GR_TW, f=GR_F[layer]; x.translate(-x0,0);
  if(layer===0) grPaintFar(x,x0,f); else if(layer===1) grPaintMid(x,x0,f,i); else grPaintNear(x,x0,i);
  GR.tiles.set(key,c); if(GR.tiles.size>22) GR.tiles.delete(GR.tiles.keys().next().value); return c; }
// A colour that follows the scenery smoothly: fz(zone) gives each area's colour, blended across area edges.
function grAt(wx,fz){ const [a,b,k]=grBlend(wx), A=fz(a); return k?grMix(A,fz(b),k):A; }
// A left-to-right gradient across a tile, so neighbouring tiles always meet with the same colour (no seams).
function grHG(x,x0,W,f,fz,al){ const g=x.createLinearGradient(x0,0,x0+W,0); for(let k=0;k<=8;k++){ const c=grRGB(grAt((x0+W*k/8)/f,fz)); g.addColorStop(k/8,`rgba(${c.join(',')},${al==null?1:al})`); } return g; }
function grFarLive(x,t){ const W=GR.SW, f=GR_F[0], off=GR.cam*f, [a,b,k]=grBlend(GR.cam+W/2), C=fz=>k?grMix(fz(a),fz(b),k):fz(a), cave=(a.cave?1-k:0)+(b.cave?k:0);
  for(const [base,amp,seed,front] of [[320,110,1.3,0],[372,78,4.2,1]]){
    const path=()=>{ x.beginPath(); x.moveTo(-2,GR_H); for(let sx=-2;sx<=W+3;sx+=3) x.lineTo(sx,base+grRidge(off+sx,seed,amp)); x.lineTo(W+3,GR_H); x.closePath(); };
    path(); const g=x.createLinearGradient(0,base-amp,0,base+amp*1.6); g.addColorStop(0,C(z=>front?grMix(z.far[0],'#000000',.12):grMix(z.far[1],z.sky[2],.4))); g.addColorStop(1,C(z=>front?grMix(z.far[0],'#000000',.45):grMix(z.far[1],z.haze,.55))); x.fillStyle=g; x.fill();
    x.beginPath(); const snowLine=base-amp*.2; for(let sx=-2;sx<=W+3;sx+=3) x.lineTo(sx,base+grRidge(off+sx,seed,amp));
    for(let sx=W+3;sx>=-2;sx-=3){ const r=base+grRidge(off+sx,seed,amp), lx=off+sx; x.lineTo(sx,Math.max(r,Math.min(snowLine,r+12+Math.sin(lx*.3)*5+Math.sin(lx*.07)*4))); } x.closePath();
    x.globalAlpha=front?.75:.9; x.fillStyle=C(z=>z.snow); x.fill(); x.globalAlpha=1;
    if(cave>.05){ x.globalAlpha=cave; x.fillStyle=grMix(GR_Z[7].far[front],'#000000',.2); const r=grRand(seed*99); for(let q=0;q<26;q++){ const sx=((r()*1400-off*(front?1.2:1))%1400+1400)%1400-200, w=8+r()*22, h=40+r()*150; x.beginPath(); x.moveTo(sx-w,0); x.lineTo(sx+w,0); x.lineTo(sx,h); x.fill(); } x.globalAlpha=1; } }
  for(let q=0;q<7;q++){ x.globalAlpha=.07+q*.05; x.fillStyle=C(z=>z.haze); x.fillRect(0,392+q*18,W,18); } x.globalAlpha=.45; x.fillRect(0,518,W,GR_H-518); x.globalAlpha=1; }
 // rolling hills in the middle distance, live in the camera's colours (the open sea in the cove)
function grMidLive(x){ const W=GR.SW, f=GR_F[1], off=GR.cam*f, [a,b,k]=grBlend(GR.cam+W/2), C=fz=>k?grMix(fz(a),fz(b),k):fz(a), sea=(a.sea?1-k:0)+(b.sea?k:0);
  if(sea>.02){ x.globalAlpha=sea; const sg=x.createLinearGradient(0,428,0,540); sg.addColorStop(0,'#2a4a7a'); sg.addColorStop(1,'#08142a'); x.fillStyle=sg; x.fillRect(0,428,W,120); x.globalAlpha=1; }
  x.beginPath(); x.moveTo(-2,GR_H); for(let sx=-2;sx<=W+3;sx+=3) x.lineTo(sx,430+grRidge(off+sx,7.7,26)); x.lineTo(W+3,GR_H); x.closePath();
  const g=x.createLinearGradient(0,410,0,560); g.addColorStop(0,C(z=>grMix(z.gr[1],z.sky[2],.25))); g.addColorStop(1,C(z=>grMix(z.gr[1],'#000000',.5))); x.globalAlpha=1-sea*.85; x.fillStyle=g; x.fill(); x.globalAlpha=1; }
function grPaintFar(x,x0,f){
  const W=GR_TW;
  // two mountain ranges: a hazy one far back, a darker one in front, both with snow (or crystal) ridgelines
  for(const [base,amp,seed,front] of [[320,110,1.3,0],[372,78,4.2,1]]){
    const ridge=()=>{ x.beginPath(); x.moveTo(x0-2,GR_H); for(let lx=x0-2;lx<=x0+W+2;lx+=3) x.lineTo(lx,base+grRidge(lx,seed,amp)); x.lineTo(x0+W+2,GR_H); x.closePath(); };
    ridge(); x.fillStyle=grHG(x,x0,W,f,z=>front?grMix(z.far[0],'#000000',.18):grMix(z.far[1],z.sky[2],.45)); x.fill();
    ridge(); const sh=x.createLinearGradient(0,base-amp,0,base+amp*1.4); sh.addColorStop(0,'rgba(255,255,255,.06)'); sh.addColorStop(1,front?'rgba(0,0,0,.35)':'rgba(0,0,0,.12)'); x.fillStyle=sh; x.fill();
    x.beginPath(); const snowLine=base-amp*.2; for(let lx=x0-2;lx<=x0+W+2;lx+=3) x.lineTo(lx,base+grRidge(lx,seed,amp));
    for(let lx=x0+W+2;lx>=x0-2;lx-=3){ const r=base+grRidge(lx,seed,amp); x.lineTo(lx,Math.max(r,Math.min(snowLine,r+12+Math.sin(lx*.3)*5+Math.sin(lx*.07)*4))); } x.closePath();
    x.fillStyle=grHG(x,x0,W,f,z=>z.snow,front?.75:.9); x.fill();
    // cave roof: stalactites, only over the caverns
    const r=grRand(Math.round(x0)+seed*99); for(let k=0;k<14;k++){ const sx=x0+r()*W, w=8+r()*22, h=40+r()*140; if(!grBlend(sx/f)[0].cave) continue; x.fillStyle=grMix(GR_Z[7].far[front],'#000000',.2); x.beginPath(); x.moveTo(sx-w,0); x.lineTo(sx+w,0); x.lineTo(sx,h); x.fill(); }
  }
  // atmospheric haze pooling in the valleys
  for(let k=0;k<7;k++){ x.fillStyle=grHG(x,x0,W,f,z=>z.haze,.07+k*.05); x.fillRect(x0,392+k*18,W,18); } x.fillStyle=grHG(x,x0,W,f,z=>z.haze,.45); x.fillRect(x0,518,W,GR_H-518);
}
function grTree(x,type,tx,ty,s,c,r){
  if(type==='pine'||type==='snowpine'){ x.fillStyle=c[1]; x.fillRect(tx-2*s,ty-8*s,4*s,8*s);
    for(let k=0;k<4;k++){ const w=(16-k*3)*s, y=ty-8*s-k*12*s; x.fillStyle=k%2?c[0]:c[1]; x.beginPath(); x.moveTo(tx-w,y); x.lineTo(tx+w,y); x.lineTo(tx,y-20*s); x.fill();
      if(type==='snowpine'){ x.fillStyle='rgba(240,248,255,.9)'; x.beginPath(); x.moveTo(tx-w*.6,y-6*s); x.lineTo(tx,y-20*s); x.lineTo(tx+w*.5,y-7*s); x.lineTo(tx+w*.1,y-9*s); x.fill(); } } }
  else if(type==='round'||type==='blossom'){ x.fillStyle='#4a3020'; x.fillRect(tx-2.5*s,ty-26*s,5*s,26*s);
    for(let k=0;k<7;k++){ const a=k/7*Math.PI*2, rr=(10+r()*5)*s; x.fillStyle=k%2?c[0]:c[1]; x.beginPath(); x.arc(tx+Math.cos(a)*10*s,ty-36*s+Math.sin(a)*8*s,rr,0,7); x.fill(); }
    x.fillStyle=c[1]; x.beginPath(); x.arc(tx,ty-40*s,12*s,0,7); x.fill(); if(type==='blossom'){ x.fillStyle='rgba(255,255,255,.6)'; for(let k=0;k<10;k++){ x.beginPath(); x.arc(tx+(r()-.5)*36*s,ty-38*s+(r()-.5)*26*s,1.6*s,0,7); x.fill(); } } }
  else if(type==='willow'){ x.fillStyle='#3a3028'; x.fillRect(tx-2*s,ty-30*s,4*s,30*s); x.strokeStyle=c[0]; x.lineWidth=1.6*s;
    for(let k=0;k<16;k++){ const a=-Math.PI+k/15*Math.PI, ex=tx+Math.cos(a)*22*s, ey=ty-38*s+Math.sin(a)*10*s; x.beginPath(); x.moveTo(tx,ty-34*s); x.quadraticCurveTo(ex,ey-6*s,ex+(r()-.5)*4*s,ey+24*s+r()*10*s); x.stroke(); } }
  else if(type==='palm'){ x.strokeStyle='#2a2018'; x.lineWidth=4*s; x.beginPath(); x.moveTo(tx,ty); x.quadraticCurveTo(tx+8*s,ty-30*s,tx+4*s,ty-56*s); x.stroke(); x.fillStyle=c[0];
    for(let k=0;k<6;k++){ const a=-Math.PI*.9+k*.36; x.beginPath(); x.moveTo(tx+4*s,ty-56*s); x.quadraticCurveTo(tx+4*s+Math.cos(a)*20*s,ty-66*s+Math.sin(a)*8*s,tx+4*s+Math.cos(a)*34*s,ty-50*s+Math.sin(a)*14*s); x.lineTo(tx+4*s+Math.cos(a)*30*s,ty-54*s+Math.sin(a)*14*s); x.fill(); } }
  else if(type==='crystal'){ for(let k=0;k<3;k++){ const h=(20+r()*34)*s, w=(5+r()*5)*s, ox=(k-1)*9*s, col=c[(k+(tx|0))%2]; const g=x.createLinearGradient(0,ty-h,0,ty); g.addColorStop(0,'#ffffff'); g.addColorStop(.3,col); g.addColorStop(1,'rgba(0,0,0,.3)');
    x.fillStyle=g; x.beginPath(); x.moveTo(tx+ox-w,ty); x.lineTo(tx+ox-w*.7,ty-h*.8); x.lineTo(tx+ox,ty-h); x.lineTo(tx+ox+w*.7,ty-h*.8); x.lineTo(tx+ox+w,ty); x.fill(); } }
}
function grPaintMid(x,x0,f,i){
  const W=GR_TW, wx=lx=>lx/f, r=grRand(i*977+3);
  // rolling hills
  const zc=grBlend(wx(x0+W/2))[0];
  // tree line
  for(let k=0;k<10;k++){ const lx=x0+r()*W, z=grBlend(wx(lx))[0], s=.8+r()*.6; if(z.tree==='none'||z.sea) continue; grTree(x,z.tree,lx,452+grRidge(lx,7.7,26)*.6+r()*20,s,z.tc.map(c=>grMix(c,'#000000',.25)),r); }
  if(zc.galaxy){ // observatory hills: little telescope domes far away
    x.fillStyle='#2a2440'; for(let k=0;k<2;k++){ const lx=x0+40+k*170; x.beginPath(); x.arc(lx,440,12,Math.PI,0); x.fill(); x.fillRect(lx-12,440,24,10); } }
}
function grPaintNear(x,x0,i){
  const W=GR_TW, r=grRand(i*31+7);
  // ground and path
  x.fillStyle=grHG(x,x0,W,1,z=>z.gr[0]); x.fillRect(x0,500,W,GR_H-500); const dg=x.createLinearGradient(0,500,0,GR_H); dg.addColorStop(0,'rgba(0,0,0,0)'); dg.addColorStop(1,'rgba(0,0,0,.45)'); x.fillStyle=dg; x.fillRect(x0,500,W,GR_H-500);
  x.fillStyle=grHG(x,x0,W,1,z=>z.path); x.beginPath(); x.moveTo(x0,532); for(let lx=x0;lx<=x0+W;lx+=6) x.lineTo(lx,532+Math.sin(lx*.02)*3); for(let lx=x0+W;lx>=x0;lx-=6) x.lineTo(lx,572+Math.sin(lx*.017)*4); x.fill();
  x.fillStyle='rgba(0,0,0,.12)'; for(let k=0;k<70;k++){ x.fillRect(x0+r()*W,536+r()*34,2+r()*3,1.5); }
  x.fillStyle='rgba(255,255,255,.12)'; for(let k=0;k<40;k++){ x.fillRect(x0+r()*W,536+r()*34,2,1); }
  // water: frozen lake / marsh pools / sea
  GR_Z.forEach((z,zi)=>{ if(!z.water&&!z.sea) return; const a=Math.max(x0,zi*GR_ZW+40), b=Math.min(x0+W,(zi+1)*GR_ZW-40); if(b<=a) return;
    const wg=x.createLinearGradient(0,498,0,532); wg.addColorStop(0,z.sea?'#3a6aaa':z.id==='lake'?'#a8ccf2':'#d8a8b8'); wg.addColorStop(1,z.sea?'#123060':z.id==='lake'?'#5a7ab0':'#6a6a8a'); x.fillStyle=wg;
    x.beginPath(); x.moveTo(a,516); x.quadraticCurveTo(a+12,500,a+40,500); x.lineTo(b-40,500); x.quadraticCurveTo(b-12,500,b,516); x.quadraticCurveTo(b-12,532,b-40,532); x.lineTo(a+40,532); x.quadraticCurveTo(a+12,532,a,516); x.fill();
    if(z.sea){ x.fillStyle='rgba(255,255,255,.55)'; for(let k=0;k<8;k++) x.fillRect(a+r()*(b-a),529,10+r()*20,2); } });
  // grass tufts / reeds / snow lumps / rocks along the path edges
  for(let k=0;k<26;k++){ const lx=x0+r()*W, z=grBlend(lx)[0], y=k%2?530+r()*4:574+r()*40;
    if(z.snowy){ x.fillStyle='rgba(255,255,255,.75)'; x.beginPath(); x.ellipse(lx,y,8+r()*8,3+r()*2,0,0,7); x.fill(); }
    else if(z.id==='marsh'){ x.strokeStyle='#6a5a30'; x.lineWidth=1.5; for(let q=0;q<5;q++){ x.beginPath(); x.moveTo(lx+q*3,y); x.lineTo(lx+q*3+(r()-.5)*6,y-18-r()*16); x.stroke(); } x.fillStyle='#4a3020'; x.fillRect(lx+5,y-24,3,8); }
    else if(z.cave){ x.fillStyle=k%2?'rgba(58,255,255,.5)':'rgba(255,90,216,.5)'; x.beginPath(); x.moveTo(lx-3,y); x.lineTo(lx,y-10-r()*10); x.lineTo(lx+3,y); x.fill(); }
    else { x.strokeStyle=grMix(z.gr[0],'#ffffff',.15); x.lineWidth=1.4; for(let q=0;q<4;q++){ x.beginPath(); x.moveTo(lx+q*2,y); x.lineTo(lx+q*2+(r()-.5)*5,y-6-r()*7); x.stroke(); } } }
  // foreground trees between landmarks
  for(let k=0;k<3;k++){ const lx=x0+r()*W, z=grBlend(lx)[0]; if(z.tree==='none'||GR_L.some(L=>Math.abs(L[0]*GR_ZW+L[1]-lx)<L[2]/2+30)||z.sea) continue; grTree(x,z.tree,lx,512,1.2+r()*.5,z.tc,r); }
  // landmarks
  for(const L of GR_L){ const lx=L[0]*GR_ZW+L[1]; if(lx+L[2]<x0-60||lx-L[2]>x0+W+60) continue; x.save(); grLandmark(x,L,lx); x.restore(); }
  // the star gate at the edge of what's open
  for(let z=3;z<GR_Z.length;z++){ const gx=z*GR_ZW; if(gx<x0-80||gx>x0+W+80) continue; grGate(x,gx,GR_Z[z].stars); }
}
function grGlow(x,cx,cy,r,col){ const g=x.createRadialGradient(cx,cy,0,cx,cy,r); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(cx-r,cy-r,r*2,r*2); }
function grLandmark(x,L,cx){ const [z,,w,,,act]=L, base=530;
  const logWall=(x0,y0,ww,hh,c1,c2)=>{ for(let yy=y0;yy<y0+hh;yy+=7){ const g=x.createLinearGradient(0,yy,0,yy+7); g.addColorStop(0,c1); g.addColorStop(1,c2); x.fillStyle=g; x.fillRect(x0,yy,ww,7); x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(x0,yy+6,ww,1); } };
  const roof=(x0,y0,ww,h,c)=>{ x.fillStyle=c; x.beginPath(); x.moveTo(x0-10,y0); x.lineTo(x0+ww/2,y0-h); x.lineTo(x0+ww+10,y0); x.fill(); x.fillStyle='rgba(255,255,255,.85)'; x.beginPath(); x.moveTo(x0-10,y0); x.lineTo(x0+ww/2,y0-h); x.lineTo(x0+ww+10,y0); x.lineTo(x0+ww+4,y0-4); x.lineTo(x0+ww/2,y0-h+6); x.lineTo(x0-4,y0-4); x.fill(); };
  const win=(wx0,wy,ww,hh)=>{ grGlow(x,wx0+ww/2,wy+hh/2,ww*1.6,'rgba(255,190,90,.55)'); x.fillStyle='#ffcf7a'; x.fillRect(wx0,wy,ww,hh); x.fillStyle='#ffe9b0'; x.fillRect(wx0+2,wy+2,ww/2-3,hh/2-3); x.fillStyle='#3a2414'; x.fillRect(wx0+ww/2-1,wy,2,hh); x.fillRect(wx0,wy+hh/2-1,ww,2); };
  if(act==='home'){ const l=cx-w/2; logWall(l,430,w,100,'#8a5a32','#5a3618'); roof(l,432,w,70,'#3a2418'); x.fillStyle='#5a5a62'; x.fillRect(l+w-40,330,20,60); win(l+18,452,30,30); win(l+w-48,452,30,30);
    x.fillStyle='#2a160a'; x.fillRect(cx-16,470,32,60); grGlow(x,cx,500,40,'rgba(255,170,70,.35)'); x.fillStyle='#ffcf7a'; x.fillRect(cx+8,498,3,3); x.fillStyle='#7a5a3a'; x.fillRect(l-6,526,w+12,6); }
  else if(act==='golf'){ const l=cx-w/2; x.fillStyle='#f4eee0'; x.fillRect(l,454,w,76); roof(l,456,w,40,'#2a5a3a'); win(l+16,474,26,24); win(l+w-42,474,26,24); x.fillStyle='#2a5a3a'; x.fillRect(cx-12,486,24,44);
    x.strokeStyle='#ddd'; x.lineWidth=2; x.beginPath(); x.moveTo(l+w+26,530); x.lineTo(l+w+26,452); x.stroke(); x.fillStyle='#e0203a'; x.beginPath(); x.moveTo(l+w+26,452); x.lineTo(l+w+50,460); x.lineTo(l+w+26,468); x.fill(); }
  else if(act==='horses'){ const l=cx-w/2; x.fillStyle='#9a2a20'; x.fillRect(l,444,w,86); x.fillStyle='#7a1e16'; x.beginPath(); x.moveTo(l-8,446); x.lineTo(cx,396); x.lineTo(l+w+8,446); x.fill();
    x.strokeStyle='#f4eee0'; x.lineWidth=3; x.strokeRect(cx-26,470,52,60); x.beginPath(); x.moveTo(cx-26,470); x.lineTo(cx+26,530); x.moveTo(cx+26,470); x.lineTo(cx-26,530); x.stroke(); win(l+12,460,22,20); win(l+w-34,460,22,20);
    x.strokeStyle='#e8d8b8'; x.lineWidth=2; for(let k=0;k<3;k++){ x.beginPath(); x.moveTo(l+w+10,504+k*8); x.lineTo(l+w+90,504+k*8); x.stroke(); } }
  else if(act==='walks'){ const l=cx-w/2; x.strokeStyle='#e8d8b8'; x.lineWidth=2; for(let k=0;k<6;k++){ x.beginPath(); x.moveTo(l+k*w/5,500); x.lineTo(l+k*w/5,530); x.stroke(); } x.beginPath(); x.moveTo(l,506); x.lineTo(l+w,506); x.stroke();
    x.fillStyle='#3a6a3a'; x.fillRect(cx-30,470,4,30); x.fillStyle='#ffd84a'; x.beginPath(); x.arc(cx-28,466,10,0,7); x.fill(); x.fillStyle='#3a2a1a'; x.font='bold 11px sans-serif'; x.textAlign='center'; x.fillText('🐾',cx-28,470); }
  else if(act==='hunt'){ const l=cx-w/2; x.fillStyle='#5a4a2a'; x.fillRect(l+20,470,w-40,60); x.fillStyle='#3a5a2a'; for(let k=0;k<20;k++){ x.beginPath(); x.moveTo(l+20+k*(w-40)/19,474); x.lineTo(l+16+k*(w-40)/19,440-((k*7)%12)); x.lineTo(l+24+k*(w-40)/19,474); x.fill(); }
    x.fillStyle='#1a140a'; x.fillRect(l+40,486,w-80,14); x.fillStyle='#7a5a3a'; x.fillRect(l+16,526,w-32,6); }
  else if(act==='soak'){ for(const [dx,rw] of [[-50,60],[40,70]]){ const g=x.createRadialGradient(cx+dx,520,4,cx+dx,520,rw); g.addColorStop(0,'#9affef'); g.addColorStop(1,'#1a8a9a'); x.fillStyle=g; x.beginPath(); x.ellipse(cx+dx,522,rw,12,0,0,7); x.fill(); x.strokeStyle='#d8d0e0'; x.lineWidth=4; x.stroke(); }
    for(const lx of [cx-100,cx+100]){ x.fillStyle='#3a2a1a'; x.fillRect(lx,470,3,56); grGlow(x,lx+1,468,26,'rgba(255,150,80,.6)'); x.fillStyle='#ff9a50'; x.fillRect(lx-4,462,11,12); } }
  else if(act==='hunt'||act==='rest'){ const zz=GR_Z[z].id;
    if(zz==='lake'){ x.fillStyle='#6a4a2a'; x.fillRect(cx-70,512,140,8); for(let k=0;k<6;k++) x.fillRect(cx-66+k*26,512,4,18); x.fillStyle='#4a3a2a'; x.fillRect(cx+50,494,4,18); x.strokeStyle='#ccc'; x.lineWidth=1; x.beginPath(); x.moveTo(cx+52,494); x.quadraticCurveTo(cx+80,470,cx+96,516); x.stroke(); }
    else if(zz==='ridge'){ x.fillStyle='#4a3a2a'; x.fillRect(cx-40,508,80,8); x.fillRect(cx-36,516,4,14); x.fillRect(cx+32,516,4,14); x.fillStyle='#6a6a7a'; x.save(); x.translate(cx+50,490); x.rotate(-.5); x.fillRect(-4,-14,8,28); x.restore(); x.fillRect(cx+48,500,3,30); }
    else if(zz==='falls'){ x.fillStyle='#5a4a3a'; x.fillRect(cx-60,508,120,6); x.fillRect(cx-56,514,4,16); x.fillRect(cx+52,514,4,16); }
    else if(zz==='caves'){ grTree(x,'crystal',cx,530,2.6,['#3affff','#ff5ad8'],grRand(9)); grGlow(x,cx,480,90,'rgba(120,255,255,.35)'); }
    else if(zz==='orchard'){ grTree(x,'blossom',cx,530,2,['#ff9ac8','#ffc4dc'],grRand(11)); x.strokeStyle='#5a3a2a'; x.lineWidth=1.5; x.beginPath(); x.moveTo(cx+18,456); x.lineTo(cx+18,506); x.moveTo(cx+38,456); x.lineTo(cx+38,506); x.stroke(); x.fillStyle='#7a4a2a'; x.fillRect(cx+14,506,28,5); }
    else if(zz==='cove'){ x.fillStyle='#f0f0f0'; x.beginPath(); x.moveTo(cx-18,530); x.lineTo(cx-10,370); x.lineTo(cx+10,370); x.lineTo(cx+18,530); x.fill(); x.fillStyle='#e0203a'; for(let k=0;k<4;k++) x.fillRect(cx-16+k*1.5,500-k*40,32-k*3,14);
      x.fillStyle='#2a2a3a'; x.fillRect(cx-14,350,28,22); grGlow(x,cx,360,60,'rgba(255,240,170,.7)'); x.fillStyle='#fff6c0'; x.fillRect(cx-9,354,18,14); x.fillStyle='#2a2a3a'; x.beginPath(); x.moveTo(cx-16,350); x.lineTo(cx,334); x.lineTo(cx+16,350); x.fill(); }
    else if(zz==='summit'){ x.fillStyle='#d8d4e8'; x.beginPath(); x.arc(cx,470,46,Math.PI,0); x.fill(); x.fillStyle='#b8b4c8'; x.fillRect(cx-46,470,92,60); x.fillStyle='#1a1428'; x.fillRect(cx-6,426,12,44); x.save(); x.translate(cx,440); x.rotate(-.6); x.fillStyle='#8a86a0'; x.fillRect(-5,-40,10,40); x.restore(); win(cx-12,488,24,20); }
  }
}
function grGate(x,gx,need){ x.fillStyle='#4a4458'; x.fillRect(gx-44,420,16,112); x.fillRect(gx+28,420,16,112); x.beginPath(); x.arc(gx,424,44,Math.PI,0); x.lineTo(gx+28,424); x.arc(gx,424,28,0,Math.PI,true); x.fill();
  x.fillStyle='#ffd84a'; x.font='bold 15px sans-serif'; x.textAlign='center'; x.fillText('⭐'.repeat(Math.min(need,4))+(need>4?'×'+need:''),gx,402); }

/* ---------- the animated sky and weather ---------- */
const GR_STARS=Array.from({length:150},(_,i)=>{ const r=grRand(i+1); return [r(),r()*.62,r()*1.6+.4,r()*6]; });
const GR_P=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),v:Math.random(),p:Math.random()*6}));
function grSky(x,t){ const W=GR.SW, mid=GR.cam+W/2, [a,b,k]=grBlend(mid);
  const g=x.createLinearGradient(0,0,0,GR_H*.75); for(let i=0;i<3;i++) g.addColorStop(i/2,k?grMix(a.sky[i],b.sky[i],k):a.sky[i]); x.fillStyle=g; x.fillRect(0,0,W,GR_H);
  for(const [Z,w] of [[a,1-k],[b,k]]){ const B=Z.sun||Z.moon; if(!B||w<.02) continue; const cx=W*.7-(GR.cam%GR_ZW)*.06, cy=B.y; x.globalAlpha=w;
    const g2=x.createRadialGradient(cx,cy,0,cx,cy,B.r*(Z.sun?6:4)); g2.addColorStop(0,Z.sun?B.g:'rgba(255,255,255,.45)'); g2.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g2; x.fillRect(cx-B.r*6,cy-B.r*6,B.r*12,B.r*12);
    x.fillStyle=B.c; x.beginPath(); x.arc(cx,cy,B.r,0,7); x.fill(); if(Z.moon){ x.fillStyle='rgba(170,170,200,.22)'; [[-.3,-.2,.25],[.25,.15,.18],[.05,.4,.12]].forEach(([p,q,rr])=>{ x.beginPath(); x.arc(cx+p*B.r,cy+q*B.r,rr*B.r,0,7); x.fill(); }); } x.globalAlpha=1; }
  const night=a.night+(b.night-a.night)*k, cave=(a.cave?1-k:0)+(b.cave?k:0), noStars=Math.max(0,night-cave);
  if(noStars>.05){ for(const [sx,sy,sr,tw] of GR_STARS){ const al=noStars*(.45+.55*Math.sin(t*1.7+tw))*.9; if(al<=0) continue; x.fillStyle=`rgba(255,255,255,${al})`; x.fillRect(((sx*W*1.6-GR.cam*.05)%(W*1.6)+W*1.6)%(W*1.6)-W*.3,sy*GR_H,sr,sr); } }
  const gal=(a.galaxy?1-k:0)+(b.galaxy?k:0); if(gal>.02){ x.save(); x.globalAlpha=gal*.55; x.translate(W/2,180); x.rotate(-.35); const mg=x.createLinearGradient(0,-60,0,60); mg.addColorStop(0,'rgba(120,90,255,0)'); mg.addColorStop(.5,'rgba(220,190,255,.55)'); mg.addColorStop(1,'rgba(255,120,200,0)'); x.fillStyle=mg; x.fillRect(-W,-60,W*2,120);
    for(let i=0;i<220;i++){ const r=GR_STARS[i%150]; x.fillStyle='rgba(255,255,255,.8)'; x.fillRect((r[0]-.5)*W*2,(r[1]-.31)*190,1.2,1.2); } x.restore(); }
  const aur=(a.aurora?1-k:0)+(b.aurora?k:0)+gal*.6; if(aur>.02){ x.save(); x.globalCompositeOperation='lighter';
    for(const [col,base,ph,amp] of [['58,255,170',150,0,34],['120,140,255',190,2.1,26],['255,90,200',120,4.2,20]]){ x.beginPath(); for(let sx=0;sx<=W;sx+=8) x.lineTo(sx,base+Math.sin(sx*.012+t*.45+ph)*amp+Math.sin(sx*.031-t*.8)*9);
      for(let sx=W;sx>=0;sx-=8) x.lineTo(sx,base+110+Math.sin(sx*.01+t*.4+ph)*amp*.6); x.closePath(); const ag=x.createLinearGradient(0,base-40,0,base+120); ag.addColorStop(0,`rgba(${col},0)`); ag.addColorStop(.35,`rgba(${col},${.42*aur})`); ag.addColorStop(1,`rgba(${col},0)`); x.fillStyle=ag; x.fill(); }
    x.restore(); }
}
function grWeather(x,t,dt){ const W=GR.SW, [a,b,k]=grBlend(GR.cam+W/2), z=k>.5?b:a;
  for(const p of GR_P){ p.y+=dt*(z.fx==='snow'?.05+p.v*.06:z.fx==='petals'?.04+p.v*.03:z.fx==='spray'?-.08:z.fx==='mist'?0:.01); p.x+=dt*(z.fx==='petals'?.03:z.fx==='mist'?.01+p.v*.01:.005*Math.sin(t+p.p));
    if(p.y>1) p.y-=1; if(p.y<0) p.y+=1; if(p.x>1) p.x-=1; const px=p.x*W, py=p.y*GR_H;
    if(z.fx==='snow'){ x.fillStyle='rgba(255,255,255,.85)'; x.beginPath(); x.arc(px+Math.sin(t+p.p)*6,py,1+p.v*2,0,7); x.fill(); }
    else if(z.fx==='fireflies'&&p.y>.45){ const al=.5+.5*Math.sin(t*3+p.p); grGlow(x,px+Math.sin(t*.7+p.p)*20,py+Math.cos(t*.6+p.p)*12,9,`rgba(220,255,120,${al*.7})`); }
    else if(z.fx==='motes'){ x.fillStyle=`rgba(255,230,160,${.3+.3*Math.sin(t*2+p.p)})`; x.fillRect(px+Math.sin(t*.5+p.p)*14,py,2,2); }
    else if(z.fx==='petals'){ x.save(); x.translate(px+Math.sin(t+p.p)*16,py); x.rotate(t*2+p.p); x.fillStyle='rgba(255,170,205,.9)'; x.beginPath(); x.ellipse(0,0,4,2,0,0,7); x.fill(); x.restore(); }
    else if(z.fx==='sparkle'){ const al=Math.max(0,Math.sin(t*2.5+p.p*3)); x.fillStyle=`rgba(${p.v>.5?'120,255,255':'255,140,230'},${al})`; x.fillRect(px,py,2,2); x.fillRect(px-2,py+.5,6,1); x.fillRect(px+.5,py-2,1,6); }
    else if(z.fx==='spray'&&p.y>.5){ x.fillStyle='rgba(255,255,255,.35)'; x.beginPath(); x.arc(px,py,1.5+p.v*2,0,7); x.fill(); }
    else if(z.fx==='mist'&&p.v<.3){ x.fillStyle='rgba(255,230,235,.07)'; x.beginPath(); x.ellipse(px,440+p.y*120,120,22,0,0,7); x.fill(); }
    else if(z.fx==='glints'&&p.y>.7){ x.fillStyle=`rgba(255,255,230,${Math.max(0,Math.sin(t*4+p.p*5))*.8})`; x.fillRect(px,476+p.v*50,3,1); } }
  if(z.fx==='shooting'){ const ph=(t*.35)%1, sx=(Math.floor(t*.35)*137%10)/10*W; if(ph<.25){ const q=ph/.25; x.strokeStyle=`rgba(255,255,255,${1-q})`; x.lineWidth=2; x.beginPath(); x.moveTo(sx+q*160,60+q*90); x.lineTo(sx+q*160-50,60+q*90-28); x.stroke(); } }
}
// Moving water, steam, waterfall and the lighthouse beam, drawn in world space over the ground.
function grLive(x,t){ const W=GR.SW, z0=Math.floor(GR.cam/GR_ZW), z1=Math.floor((GR.cam+W)/GR_ZW);
  for(let z=z0;z<=z1;z++){ const Z=GR_Z[z]; if(!Z) continue; const ox=z*GR_ZW-GR.cam;
    if(Z.water||Z.sea){ x.strokeStyle='rgba(255,255,255,.35)'; x.lineWidth=1; for(let k=0;k<10;k++){ const lx=ox+((k*97+t*(Z.sea?30:12))%GR_ZW); x.beginPath(); x.moveTo(lx,508+(k%4)*6); x.lineTo(lx+14+(k%3)*8,508+(k%4)*6); x.stroke(); }
      const B=Z.moon||Z.sun; if(B){ const mx=ox+GR_ZW*.55+(GR.cam-z*GR_ZW)*.8; for(let k=0;k<6;k++){ x.fillStyle=`rgba(255,250,220,${.35-k*.05})`; x.fillRect(mx-18+Math.sin(t*3+k)*4,506+k*4,36-k*4,2); } } }
    if(Z.id==='springs'){ for(let k=0;k<8;k++){ const q=((t*.25+k/8)%1), sx=ox+390+(k%2?40:-50)+Math.sin(t+k)*10; x.fillStyle=`rgba(255,255,255,${.22*(1-q)})`; x.beginPath(); x.arc(sx,512-q*120,10+q*26,0,7); x.fill(); } }
    if(Z.id==='falls'){ const fx=ox+620; const g=x.createLinearGradient(0,300,0,520); g.addColorStop(0,'rgba(220,250,255,.95)'); g.addColorStop(1,'rgba(160,220,255,.8)'); x.fillStyle=g; x.fillRect(fx-36,300,72,222);
      x.fillStyle='rgba(255,255,255,.7)'; for(let k=0;k<12;k++){ const yy=300+((t*220+k*37)%222); x.fillRect(fx-34+(k*13)%66,yy,3,18); } x.fillStyle='#5a6a7a'; x.fillRect(fx-60,286,24,236); x.fillRect(fx+36,286,24,236);
      x.save(); x.globalAlpha=.28+.06*Math.sin(t*.8); for(const [c,r] of [['#ff4a4a',150],['#ffb84a',142],['#ffff6a',134],['#6aff6a',126],['#6ab0ff',118],['#b06aff',110]]){ x.strokeStyle=c; x.lineWidth=8; x.beginPath(); x.arc(fx,540,r,Math.PI*1.12,Math.PI*1.88); x.stroke(); } x.restore();
      for(let k=0;k<10;k++){ const q=((t*.6+k/10)%1); x.fillStyle=`rgba(255,255,255,${.3*(1-q)})`; x.beginPath(); x.arc(fx+(k-5)*9,518-q*30,8+q*16,0,7); x.fill(); } }
    if(Z.id==='cove'){ const lx=ox+480, ly=360, a=t*1.1; x.save(); x.globalCompositeOperation='lighter'; for(const s of [1,-1]){ const g=x.createLinearGradient(lx,ly,lx+Math.cos(a)*s*400,ly); g.addColorStop(0,'rgba(255,245,190,.5)'); g.addColorStop(1,'rgba(255,245,190,0)'); x.fillStyle=g;
      x.beginPath(); x.moveTo(lx,ly); x.lineTo(lx+Math.cos(a)*s*400,ly-30); x.lineTo(lx+Math.cos(a)*s*400,ly+30); x.fill(); } x.restore(); }
  } }

/* ---------- you, finds, landmarks ---------- */
function grNear(){ const m=GR.me; return GR_L.find(L=>L[0]<grOpenZones()&&Math.abs(L[0]*GR_ZW+L[1]-m.x)<Math.max(50,L[2]/2)); }
function grDraw(t,dt){ const x=GR.ctx, m=GR.me, W=GR.SW;
  // walk
  const tx=GR.hold!=null?GR.hold:m.tx; if(tx!=null){ const d=tx-m.x; if(Math.abs(d)>2){ const st=Math.sign(d)*Math.min(Math.abs(d),240*dt); m.x+=st; m.face=Math.sign(d); m.walk+=dt; } else if(GR.hold==null){ m.tx=null; if(m.arrive){ const a=m.arrive; m.arrive=null; setTimeout(a,80); } } }
  m.x=Math.max(60,Math.min(grEnd()-50,m.x));
  const want=Math.max(0,Math.min(grEnd()-W,m.x-W*.42)); GR.cam+=(want-GR.cam)*Math.min(1,dt*4);
  x.setTransform(GR.S,0,0,GR.S,0,0); x.imageSmoothingEnabled=true;
  grSky(x,t);
  grFarLive(x,t); grMidLive(x);
  for(let layer=1;layer<3;layer++){ const f=GR_F[layer], off=GR.cam*f, i0=Math.floor(off/GR_TW), i1=Math.floor((off+W)/GR_TW);
    for(let i=i0;i<=i1;i++){ if(i<0) continue; if(layer===2&&i*GR_TW>grEnd()+GR_TW) continue; x.drawImage(grTile(layer,i),Math.floor((i*GR_TW-off)*GR.S)/GR.S,0,GR_TW+1.5/GR.S,GR_H); } }
  // darkness past the open edge
  const edge=grEnd()-GR.cam; if(edge<W){ const g=x.createLinearGradient(edge-30,0,edge+120,0); g.addColorStop(0,'rgba(5,6,14,0)'); g.addColorStop(1,'rgba(5,6,14,.92)'); x.fillStyle=g; x.fillRect(edge-30,0,W-edge+30,GR_H); }
  x.save(); x.translate(0,0); grLive(x,t); x.restore();
  // daily finds
  const G=grState(); for(let z=1;z<grOpenZones();z++){ if(G.found.includes(z)) continue; const fx=grFindX(z)-GR.cam; if(fx<-20||fx>W+20) continue; const bob=Math.sin(t*3+z)*4;
    grGlow(x,fx,520+bob,26,'rgba(255,240,150,.7)'); x.fillStyle='#fff6c0'; x.save(); x.translate(fx,520+bob); x.rotate(t); for(let k=0;k<4;k++){ x.rotate(Math.PI/2); x.beginPath(); x.moveTo(0,-9); x.lineTo(2.5,0); x.lineTo(-2.5,0); x.fill(); } x.restore();
    if(Math.abs(grFindX(z)-m.x)<26) grCollect(z); }
  // landmark sign above the nearest one
  const nl=grNear(); if(nl){ const lx=nl[0]*GR_ZW+nl[1]-GR.cam; x.font='600 15px system-ui,sans-serif'; x.textAlign='center'; const tw=x.measureText(nl[3]+' '+nl[4]).width+20, yy=400+Math.sin(t*2)*3;
    x.fillStyle='rgba(10,8,20,.72)'; x.beginPath(); if(x.roundRect) x.roundRect(lx-tw/2,yy-18,tw,26,13); else x.rect(lx-tw/2,yy-18,tw,26); x.fill(); x.fillStyle='#ffe9b0'; x.fillText(nl[3]+' '+nl[4],lx,yy); }
  // you (the lodge's pixel character, scaled up crisp)
  const px=m.x-GR.cam, spr=personSprite('player',m.tx!=null||GR.hold!=null?'walk'+((m.walk*9|0)%4):'idle0',typeof lodgeLook==='function'?lodgeLook():null), sc=4;
  x.fillStyle='rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(px,GR_FLOOR+2,20,5,0,0,7); x.fill();
  x.imageSmoothingEnabled=false; x.save(); x.translate(px,GR_FLOOR-PERSON_H*sc); if(m.face<0){ x.scale(-1,1); } x.drawImage(spr,-6*sc,0,12*sc,PERSON_H*sc); x.restore(); x.imageSmoothingEnabled=true;
  grWeather(x,t,dt);
  // soft cinematic vignette
  if(!GR.vig||GR.vig.w!==W){ const v=document.createElement('canvas'); v.width=Math.ceil(W*GR.S); v.height=Math.ceil(GR_H*GR.S); const vx=v.getContext('2d'); vx.scale(GR.S,GR.S); const g=vx.createRadialGradient(W/2,GR_H*.46,GR_H*.28,W/2,GR_H*.5,GR_H*.78); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.42)'); vx.fillStyle=g; vx.fillRect(0,0,W,GR_H); GR.vig={w:W,c:v}; }
  x.drawImage(GR.vig.c,0,0,W,GR_H);
  // zone title
  const zi=Math.min(grOpenZones()-1,Math.floor(m.x/GR_ZW)); if(zi!==GR.zoneShown){ GR.zoneShown=zi; grHud(true); }
  const act=GR.el.querySelector('.gr-act'); const want2=nl?nl[5]:''; if(act.dataset.v!==(nl?nl[4]:'')){ act.dataset.v=nl?nl[4]:''; act.innerHTML=nl?`${nl[3]} ${nl[5]==='home'?'Go inside':nl[5]==='rest'?'Take in the view':'Enter'} · <b>${esc(nl[4])}</b>`:''; act.classList.toggle('on',!!nl); }
}
function grCollect(z){ const G=grState(); if(G.found.includes(z)) return; G.found.push(z); const cash=nice(Math.max(25000,cashNow()*.002*(1+z*.25)));
  setBank(cash); if(typeof gainXP==='function') gainXP(15+z*3,'Exploring'); save(); try{ fx.coins(30,1200); }catch(e){} tone(1046,.08,'triangle',.05); tone(1568,.12,'triangle',.04,.08);
  toast(`✨ Found something in ${GR_Z[z].name}: +${k$(cash)}`,'gold'); grHud(); }
function grRest(L){ const z=GR_Z[L[0]]; const lines={lake:'The ice hums under the moon.',ridge:'The sky ripples green and violet over the peaks.',falls:'Mist on your face, a rainbow at your feet.',caves:'The crystals glow brighter as you breathe.',orchard:'Petals drift past the swing. Time slows down.',cove:'The beam sweeps the sea, slow and steady.',summit:'A shooting star. Then another.'};
  toast(`${L[3]} ${lines[z.id]||'Beautiful.'}`,'gold'); if(typeof gainXP==='function'&&grState().rest!==grDay()+L[0]){ grState().rest=grDay()+L[0]; gainXP(10,'Sightseeing'); save(); } }
function grAction(L){ const a=L[5];
  if(a==='home') return closeGrounds();
  if(a==='rest') return grRest(L);
  if(a==='soak'){ const G=grState(); if(G.soak===grDay()){ toast('♨️ You already soaked today — come back tomorrow','gold'); return; } G.soak=grDay(); if(typeof gainXP==='function') gainXP(60,'Hot springs'); save(); toast('♨️ A long soak. +60 XP','gold'); return; }
  grPause(); if(a==='golf'){ if(typeof golfChooser==='function') golfChooser(); else openGolf({}); }
  else if(a==='horses') openHorses(); else if(a==='walks') openWalks(); else if(a==='hunt') openHunt(); }

/* ---------- open / close ---------- */
function grHud(flash){ if(!GR.el) return; const zi=Math.max(0,GR.zoneShown), Z=GR_Z[zi], n=grOpenZones(), G=grState();
  GR.el.querySelector('.gr-zone').innerHTML=`<b>${esc(Z.name)}</b><small>${zi+1} / ${GR_Z.length}${G.found.length?` · ✨ ${G.found.length}/${n-1} found today`:''}</small>`;
  if(flash){ const e=GR.el.querySelector('.gr-zone'); e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); }
  GR.el.querySelector('.gr-map').innerHTML=GR_Z.map((z,i)=>`<i class="${i<n?'':'lock'} ${i===zi?'on':''}" title="${esc(z.name)}">${i<n?'':'⭐'}</i>`).join('');
  GR.el.querySelector('.gr-star').textContent=`⭐ ${grStars()}`+(n<GR_Z.length?` · next area at ⭐${GR_Z[n].stars}`:' · all open'); }
function grSize(){ const r=GR.c.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1), S=r.height*dpr/GR_H;
  if(Math.abs(S-GR.S)>.01){ GR.S=S; GR.tiles.clear(); } GR.c.width=Math.round(r.width*dpr); GR.c.height=Math.round(r.height*dpr); GR.SW=r.width*dpr/S; }
function grDom(){ if(GR.el) return; const el=document.createElement('div'); el.className='grounds'; el.innerHTML=`<canvas></canvas>
  <div class="gr-top"><button class="gr-back" data-gr="close">← Lodge</button><div class="gr-zone"></div><span class="gr-star"></span></div>
  <div class="gr-map"></div><button class="gr-act" data-gr="act"></button><div class="gr-tip">Tap anywhere to walk · tap a building to go in</div>`;
  document.body.appendChild(el); GR.el=el; GR.c=el.querySelector('canvas'); GR.ctx=GR.c.getContext('2d'); GR.loop=makeLoop(grDraw);
  const toWorld=e=>{ const r=GR.c.getBoundingClientRect(); return [GR.cam+(e.clientX-r.left)/r.width*GR.SW,(e.clientY-r.top)/r.height*GR_H]; };
  GR.c.addEventListener('pointerdown',e=>{ const [wx,wy]=toWorld(e); el.querySelector('.gr-tip').classList.add('off');
    const L=GR_L.find(L=>L[0]<grOpenZones()&&Math.abs(L[0]*GR_ZW+L[1]-wx)<L[2]/2+10&&wy>360&&wy<540);
    if(L){ const lx=L[0]*GR_ZW+L[1]; GR.me.tx=lx; GR.me.arrive=()=>grAction(L); tone(660,.05,'square',.03); return; }
    GR.me.arrive=null; GR.hold=wx; GR.c.setPointerCapture(e.pointerId); });
  GR.c.addEventListener('pointermove',e=>{ if(GR.hold!=null) GR.hold=toWorld(e)[0]; });
  const up=()=>{ if(GR.hold!=null){ GR.me.tx=GR.hold; GR.hold=null; } }; GR.c.addEventListener('pointerup',up); GR.c.addEventListener('pointercancel',up);
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-gr]'); if(!b) return; if(b.dataset.gr==='close') closeGrounds(); else if(b.dataset.gr==='act'){ const L=grNear(); if(L) grAction(L); } });
  addEventListener('resize',()=>{ if(GR.open) grSize(); }); }
function openGrounds(){ if(typeof closeModal==='function') closeModal(); grDom(); GR.open=true; GR.paused=false; GR.el.classList.add('on'); document.body.classList.add('in-golf');
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop();
  grSize(); GR.me=GR.me||{x:300,tx:null,face:1,walk:0,arrive:null}; GR.me.x=Math.max(60,Math.min(grEnd()-50,GR.me.x)); GR.cam=Math.max(0,GR.me.x-GR.SW*.42); GR.zoneShown=-1; grHud(); GR.loop.start(); }
function closeGrounds(){ if(!GR.el) return; GR.loop.stop(); GR.open=false; GR.el.classList.remove('on'); document.body.classList.remove('in-golf'); save();
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start(); else render(); }
function grPause(){ GR.paused=true; GR.loop.stop(); GR.hold=null; }
function grResume(){ if(!GR.open) return; GR.paused=false; document.body.classList.add('in-golf'); if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop(); grHud(); GR.loop.start(); }
// Coming back out of golf, the stables, the dog park or the hunt puts you back on the grounds.
for(const fn of ['closeGolf','closeWalks','closeHorses','closeHunt','closeRange']){ if(typeof window[fn]!=='function') continue; const f=window[fn]; window[fn]=function(){ const r=f.apply(this,arguments); if(GR.open) grResume(); return r; }; }
// A modal opened from the clubhouse (golf menu) that's closed without picking anything also brings the grounds back.
const _closeModalGR=closeModal; closeModal=function(){ const r=_closeModalGR.apply(this,arguments); if(GR.open&&GR.paused) setTimeout(()=>{ if(GR.open&&GR.paused&&!grSubOpen()) grResume(); },60); return r; };
const grSubOpen=()=>!!document.querySelector('.golf.on');   // golf, range, stables, dog park and the hunt all use the .golf overlay
Object.assign(ACT,{ groundsOpen:()=>openGrounds() });
