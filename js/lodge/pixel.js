// Lodge pixel engine: a tiny 192×320 canvas scaled up with sharp pixels, sprites drawn from text grids,
// and an animation loop that only runs while the lodge is on screen and the app is visible.

const PW=192, PH=320;
const LP={ // the lodge palette: pine, walnut, brass, cranberry, ember, snow, stone, night
  night0:'#05090f', night1:'#0a1420', night2:'#0f1d2e', star:'#f3ead8', moon:'#ecd9a8',
  pine0:'#071510', pine1:'#0b1a14', pine2:'#123024', pine3:'#1a4232', pine4:'#24533e', pine5:'#2a6a4a',
  wal0:'#120a06', wal1:'#1c1410', wal2:'#2a1d15', wal3:'#3a2617', wal4:'#4a3220', wal5:'#6b4a2a', wal6:'#8a6238',
  brass0:'#7d6534', brass1:'#c8a45c', brass2:'#ecd9a8', brass3:'#f6ebcb',
  cran0:'#4a0f17', cran1:'#7d1f2a', cran2:'#9a2a35', cran3:'#c0505a',
  emb0:'#c9782c', emb1:'#e8963c', emb2:'#f2b26b', emb3:'#ffdca8', emb4:'#fff3e0',
  snow0:'#9fb0bf', snow1:'#cfd9e0', snow2:'#f3ead8',
  st0:'#2b2b30', st1:'#3c3c44', st2:'#55545c', st3:'#6f6d72',
  ink:'#05070a',
};

// Seeded randomness so the room looks the same every time (wood grain, stones, stars).
function prng(seed){let a=seed|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ---------- People: one pixel template, recoloured per person (paper-doll) ---------- */
const BODY_TOP=[
  "............", "............", "............",           // 3 spare rows for hats (wardrobe, later pass)
  "....hhhh....", "...hhhhhh...", "...hssssh...", "...skssks...", "...ssssss...", "....ssss....",
];
const TORSO={
  idle:  ["...wwwwww...","..cwwccccc..",".cccccbcccc.",".cccccbcccc.",".cccccbcccc.",".sccccbcccs.","..ccccbccc..","..CCCCCCCC.."],
  swingA:["...wwwwww...","..cwwccccc..",".cccccbcccc.",".cccccbcccc.","scccccbcccc.","..ccccbcccs.","..ccccbccc..","..CCCCCCCC.."],
  swingB:["...wwwwww...","..cwwccccc..",".cccccbcccc.",".cccccbcccc.",".cccccbcccs.","s.ccccbccc..","..ccccbccc..","..CCCCCCCC.."],
  brushA:["..swwwwwws..","..cwwccccc..",".cccccbcccc.",".cccccbcccc.",".cccccbcccc.","..ccccbccc..","..ccccbccc..","..CCCCCCCC.."],
  brushB:["...wwwwww...","..cwwccccc..",".csccsbcccc.",".cccccbcccc.",".cccccbcccc.","..ccccbccc..","..ccccbccc..","..CCCCCCCC.."],
  pour:  ["...wwwwww...","..cwwccccc..",".cccccbcccss",".cccccbcccc.",".cccccbcccc.",".sccccbccc..","..ccccbccc..","..CCCCCCCC.."],
};
const LEGS={
  stand:["...pp..pp...","...pp..pp...","...pp..pp...","..ooo..ooo.."],
  stepA:["...pp..pp...","..pp....pp..","..pp....pp..",".ooo....ooo."],
  stepB:["....pppp....","....pppp....","....pppp....","...oooooo..."],
};
const PEOPLE={
  player:   {h:LP.wal4,s:'#e0b48a',k:LP.ink,c:LP.cran1,C:LP.cran0,b:LP.brass1,w:LP.brass2,p:LP.wal2,o:LP.wal0},
  bartender:{h:LP.wal0,s:'#d9a77c',k:LP.ink,c:'#efe6d2',C:'#b9ae98',b:LP.cran1,w:LP.cran1,p:LP.wal1,o:LP.wal0},
  merchant: {h:'#8f8a80',s:'#c99872',k:LP.ink,c:LP.pine4,C:LP.pine2,b:LP.brass1,w:LP.brass1,p:LP.wal2,o:LP.wal0},
};
const PFRAMES={
  idle0:['idle','stand'], idle1:['idle','stand'],
  walk0:['swingA','stepA'], walk1:['idle','stepB'], walk2:['swingB','stepA'], walk3:['idle','stepB'],
  brush0:['brushA','stand'], brush1:['brushB','stand'], pour0:['pour','stand'],
};
const SPR_CACHE={};
function personSprite(who,frame,colors){
  const key=who+':'+frame+':'+(colors?JSON.stringify(colors):'');
  if(SPR_CACHE[key]) return SPR_CACHE[key];
  const pal=Object.assign({},PEOPLE[who]||PEOPLE.player,colors||{});
  const [t,l]=PFRAMES[frame]||PFRAMES.idle0;
  const rows=BODY_TOP.map((r,i)=>frame==='idle1'&&i===6?r.replace(/k/g,'s'):r).concat(TORSO[t],LEGS[l]);
  const c=document.createElement('canvas'); c.width=12; c.height=rows.length; const x=c.getContext('2d');
  rows.forEach((r,y)=>[...r].forEach((ch,xx)=>{ if(ch!=='.'&&pal[ch]){ x.fillStyle=pal[ch]; x.fillRect(xx,y,1,1); } }));
  return SPR_CACHE[key]=c;
}
const PERSON_H=BODY_TOP.length+8+4;   // 21 pixels tall; feet at the bottom row

/* ---------- Drawing helpers ---------- */
const rect=(ctx,x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
// Tiny 3×5 pixel letters for signs drawn inside the art.
const GLYPH={A:'111101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'110101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','&':'010101010101011',' ':'000000000000000','4':'101101111001001','$':'011110010011110','0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','5':'111100111001111','6':'111100111101111','7':'111001001010010','8':'111101111101111','9':'111101111001111','.':'000000000000010','!':'010010010000010','?':'111001011000010',':':'000010000010000','-':'000000111000000','+':'000010111010000','%':'101001010100101'};
function ptext(ctx,s,x,y,c,scale=1){ctx.fillStyle=c;let cx=x;for(const ch of String(s).toUpperCase()){const g=GLYPH[ch]||GLYPH[' '];for(let i=0;i<15;i++)if(g[i]==='1')ctx.fillRect(cx+(i%3)*scale,y+Math.floor(i/3)*scale,scale,scale);cx+=4*scale;}return cx;}
const ptextW=(s,scale=1)=>String(s).length*4*scale-scale;

/* ---------- Animation loop that pauses itself ---------- */
function makeLoop(draw){
  let raf=0,on=false,t0=0,last=0;
  const tick=now=>{ if(!on) return; if(document.hidden){raf=0;return;} if(!t0)t0=now; const dt=Math.min(50,now-(last||now)); last=now; draw((now-t0)/1000,dt/1000); raf=requestAnimationFrame(tick); };
  const vis=()=>{ if(on&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(tick);} };
  document.addEventListener('visibilitychange',vis);
  return {start(){ if(on)return; on=true; t0=0; last=0; raf=requestAnimationFrame(tick); }, stop(){ on=false; if(raf)cancelAnimationFrame(raf); raf=0; }, get running(){return on;}};
}
function makeCanvas(host){
  const c=document.createElement('canvas'); c.width=PW; c.height=PH; c.className='px';
  host.appendChild(c); const ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=false; return {c,ctx};
}
// Snowflakes: a reusable particle field.
function snowField(n,seed,area){
  const r=prng(seed), A=area||{x:0,y:0,w:PW,h:PH};
  const f=Array.from({length:n},()=>({x:A.x+r()*A.w,y:A.y+r()*A.h,v:6+r()*14,d:r()*6.28,s:r()<.2?2:1}));
  return {draw(ctx,dt,c){ for(const p of f){ p.y+=p.v*dt; p.d+=dt*1.3; const x=p.x+Math.sin(p.d)*2; if(p.y>A.y+A.h){p.y=A.y-2;p.x=A.x+r()*A.w;} rect(ctx,x,p.y,p.s,p.s,c||LP.snow2); } }};
}
