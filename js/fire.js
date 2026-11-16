// 🔥 On a roll: flames around the whole game (the table felt or the slot machine) while you have heat, plus
// flickering fire on your chips, cards and placed bets. More heat, bigger and hotter flames.
// Heat itself is in js/economy.js. Drawn on one canvas around the game; stops when you cool off.

const FIRE={cv:null,ctx:null,host:null,raf:0,parts:[],last:0};
function fireHost(){ return S.mode==='casino'?document.querySelector('#view .felt, #view .cab'):null; }
function fireSync(){
  const heat=S.mode==='casino'&&!(typeof lodgeActive==='function'&&lodgeActive())?(S.heat||0):0;
  if(heat) document.body.dataset.heat=Math.min(5,heat); else delete document.body.dataset.heat;
  const host=heat?fireHost():null;
  if(!host){ fireStop(); return; }
  if(!FIRE.cv){ const cv=document.createElement('canvas'); cv.className='firering'; cv.setAttribute('aria-hidden','true'); document.body.appendChild(cv); FIRE.cv=cv; FIRE.ctx=cv.getContext('2d'); }
  if(FIRE.host!==host){ FIRE.host=host; FIRE.parts=[]; }
  if(!FIRE.raf&&!matchMedia('(prefers-reduced-motion: reduce)').matches){ FIRE.last=0; FIRE.raf=requestAnimationFrame(fireTick); }
}
function fireStop(){ if(FIRE.raf) cancelAnimationFrame(FIRE.raf); FIRE.raf=0; if(FIRE.cv) FIRE.cv.remove(); FIRE.cv=null; FIRE.host=null; FIRE.parts=[]; }
const PAD=26;   // how far the flames reach outside the game's edge
// Four soft flame blobs (white-hot, yellow, orange, ember), drawn once and stamped for every flame.
const FLAME=['255,214,110','255,150,40','235,80,25','140,30,15'].map(col=>{ const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d');
  const r=g.createRadialGradient(16,16,0,16,16,16); r.addColorStop(0,`rgba(${col},1)`); r.addColorStop(1,`rgba(${col},0)`); g.fillStyle=r; g.fillRect(0,0,32,32); return c; });
function fireTick(now){
  const cv=FIRE.cv, x=FIRE.ctx, host=FIRE.host; if(!cv||!host||!document.body.contains(host)){ fireStop(); return; }
  if(document.hidden){ FIRE.raf=requestAnimationFrame(fireTick); return; }
  const heat=+(document.body.dataset.heat||0); if(!heat){ fireStop(); return; }
  const dt=FIRE.last?Math.min(.05,(now-FIRE.last)/1000):.016; FIRE.last=now;
  const b=host.getBoundingClientRect(), W=b.width+PAD*2, H=b.height+PAD*2, dpr=Math.min(2,devicePixelRatio||1);
  cv.style.left=(b.left+scrollX-PAD)+'px'; cv.style.top=(b.top+scrollY-PAD)+'px'; cv.style.width=W+'px'; cv.style.height=H+'px';
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H);
  // spawn flames along the whole edge, more and bigger with more heat
  const per=(2*(W+H))/1000, n=Math.round((10+heat*12)*per*dt*10);
  for(let i=0;i<n;i++){ const t=Math.random()*2*(W+H); let px,py,nx=0,ny=0;
    if(t<W){ px=t; py=PAD; ny=-1; } else if(t<W+H){ px=W-PAD; py=t-W; nx=1; } else if(t<2*W+H){ px=2*W+H-t; py=H-PAD; ny=1; } else { px=PAD; py=2*(W+H)-t; nx=-1; }
    FIRE.parts.push({x:px+(Math.random()-.5)*4,y:py,vx:nx*(14+Math.random()*18)+(Math.random()-.5)*6,vy:ny*(14+Math.random()*18)-(10+Math.random()*25)*(.6+heat*.12),life:0,max:.35+Math.random()*.35+heat*.05,r:2+Math.random()*2.5+heat*.8}); }
  if(FIRE.parts.length>900) FIRE.parts.splice(0,FIRE.parts.length-900);
  x.globalCompositeOperation='lighter';
  const keep=[];
  for(const p of FIRE.parts){ p.life+=dt; if(p.life>=p.max) continue; keep.push(p);
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.96; const k=p.life/p.max, r=p.r*(1-k*.6);
    const s=FLAME[k<.25?0:k<.5?1:k<.8?2:3], d=r*4.4; x.globalAlpha=(1-k)*.6; x.drawImage(s,p.x-d/2,p.y-d/2,d,d); }
  x.globalAlpha=1;
  FIRE.parts=keep; x.globalCompositeOperation='source-over';
  FIRE.raf=requestAnimationFrame(fireTick);
}
// Follow the heat and the screen.
const _heatUIF=heatUI; heatUI=function(){ _heatUIF(); fireSync(); };
const _renderF=render; render=function(){ _renderF(); fireSync(); };
addEventListener('resize',()=>{ if(FIRE.cv) FIRE.last=0; });
