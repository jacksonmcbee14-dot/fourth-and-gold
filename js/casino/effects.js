// Visual effects: coins, confetti, snow, fireworks, sleigh, count-up
/* ---------- Effects (particles on a full-screen canvas) ---------- */
const fx=(()=>{let c,x,P=[],run=false,W=0,H=0,last=0,D=1;
  const MAXP=900;   // a hard cap so stacked celebrations (jackpot + fireworks + snow) can't swamp a phone
  function init(){if(c)return;c=document.createElement('canvas');c.id='fx';document.body.appendChild(c);x=c.getContext('2d');rs();addEventListener('resize',rs);}
  function rs(){D=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;}
  function add(p){if(P.length>=MAXP)return;P.push(p);if(!run){run=true;last=0;requestAnimationFrame(loop);}}
  // Each particle is pre-drawn once onto a small canvas, then just stamped with drawImage each frame
  // (no per-frame gradients or glow blurs). The look is the same as drawing them live.
  const SPR={};
  function sprite(key,size,draw){if(SPR[key])return SPR[key];const s=document.createElement('canvas');s.width=s.height=size;const g=s.getContext('2d');g.translate(size/2,size/2);draw(g);return SPR[key]=s;}
  const coinSpr=()=>sprite('coin',56,g=>{const r=26,gr=g.createLinearGradient(-r,-r,r,r);gr.addColorStop(0,'#f6ebcb');gr.addColorStop(.5,'#c8a45c');gr.addColorStop(1,'#6b5228');g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,6.3);g.fill();g.strokeStyle='#5e4520';g.lineWidth=2.8;g.stroke();g.beginPath();g.arc(0,0,r*.68,0,6.3);g.strokeStyle='rgba(122,78,14,.45)';g.lineWidth=2;g.stroke();});
  const sparkSpr=col=>sprite('spark'+col,48,g=>{const r=10;g.strokeStyle=col;g.lineWidth=4;g.shadowColor=col;g.shadowBlur=16;g.beginPath();g.moveTo(-r,0);g.lineTo(r,0);g.moveTo(0,-r);g.lineTo(0,r);g.stroke();});
  const snowSpr=()=>sprite('snow',16,g=>{g.fillStyle='rgba(243,234,216,.9)';g.beginPath();g.arc(0,0,7,0,6.3);g.fill();});
  // Motion is time-based: a dropped frame moves particles further instead of slowing the whole effect down.
  function loop(now){const f=last?Math.min(3,(now-last)/16.667):1;last=now;
    x.setTransform(D,0,0,D,0,0);x.clearRect(0,0,W,H);
    for(let i=P.length-1;i>=0;i--){const p=P[i];if(p.delay>0){p.delay-=16.667*f;continue;}
      const dr=p.drag===1?1:Math.pow(p.drag,f);p.vy+=p.g*f;p.vx*=dr;p.vy*=dr;p.x+=p.vx*f;p.y+=p.vy*f;p.rot+=p.vr*f;p.life-=f;
      if(p.y>H+40||p.life<=0||p.x<-60||p.x>W+60){P[i]=P[P.length-1];P.pop();continue;}draw(p);}
    x.globalAlpha=1;
    if(P.length)requestAnimationFrame(loop);else{run=false;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);}}
  function draw(p){x.globalAlpha=Math.min(1,p.life/30);
    if(p.t==='coin'){const ct=Math.cos(p.tilt),st=Math.sin(p.tilt),sx=Math.max(.12,Math.abs(Math.cos(p.rot)))*p.r/26;
      x.setTransform(D*ct*sx,D*st*sx,-D*st*p.r/26,D*ct*p.r/26,D*p.x,D*p.y);x.drawImage(coinSpr(),-28,-28);}
    else if(p.t==='conf'){const cr=Math.cos(p.rot),sr=Math.sin(p.rot),k=Math.cos(p.rot*2);
      x.setTransform(D*cr,D*sr,-D*sr*k,D*cr*k,D*p.x,D*p.y);x.fillStyle=p.c;x.fillRect(-p.r,-p.r/2.4,p.r*2,p.r/1.2);}
    else if(p.t==='snow'){const k=p.r/7;x.setTransform(D*k,0,0,D*k,D*p.x,D*p.y);x.drawImage(snowSpr(),-8,-8);}
    else{const k=p.r/10,cr=Math.cos(p.rot)*k,sr=Math.sin(p.rot)*k;x.setTransform(D*cr,D*sr,-D*sr,D*cr,D*p.x,D*p.y);x.drawImage(sparkSpr(p.c),-24,-24);}
  }
  const R=(a,b)=>a+Math.random()*(b-a);
  return{
    coins(n,dur=2000){init();for(let i=0;i<n;i++)add({t:'coin',x:R(0,W),y:R(-80,-10),vx:R(-1,1),vy:R(2,5),g:.2,drag:.996,rot:R(0,6),vr:R(.08,.22),tilt:R(-.4,.4),r:R(7,13),life:420,delay:R(0,dur)});},
    fountain(n){init();const cx=W/2,cy=H*.6;for(let i=0;i<n;i++)add({t:'coin',x:cx+R(-30,30),y:cy,vx:R(-5.5,5.5),vy:R(-15,-8),g:.42,drag:.99,rot:R(0,6),vr:R(.1,.28),tilt:R(-.4,.4),r:R(6,11),life:220,delay:R(0,450)});},
    confetti(n){init();const cols=['#8e2533','#24533e','#f3ead8','#c8a45c'];for(let i=0;i<n;i++)add({t:'conf',x:W/2+R(-50,50),y:H*.42,vx:R(-10,10),vy:R(-16,-4),g:.26,drag:.97,rot:R(0,6),vr:R(-.3,.3),r:R(4,8),c:cols[i%4],life:280,delay:R(0,300)});},
    snow(n){init();for(let i=0;i<n;i++)add({t:'snow',x:R(0,W),y:R(-60,-5),vx:R(-1.2,1.2),vy:R(1.4,3.4),g:0,drag:1,rot:0,vr:0,r:R(1.5,3.6),life:700,delay:R(0,2600)});},
    burst(px,py,n,col){init();for(let i=0;i<n;i++){const a=R(0,6.28),s=R(2,8);add({t:'spark',x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:.07,drag:.965,rot:R(0,3),vr:.12,r:R(2,5),c:col||'#ecd9a8',life:R(45,85),delay:0});}},
  };})();
function fireworks(k){const cols=['#ecd9a8','#e8963c','#f3ead8','#c8a45c'];for(let i=0;i<k;i++)setTimeout(()=>{fx.burst(innerWidth*(.15+Math.random()*.7),innerHeight*(.12+Math.random()*.35),60,cols[i%4]);SND.boom();},i*380);}
function sleigh(){
  const d=document.createElement('div');d.className='sleigh';
  const deer=o=>`<g transform="translate(${o} 0)"><ellipse cx="20" cy="40" rx="14" ry="6.5"/><path d="M31 37 L37 27 L45 25 M37 27 L35 17 M36 21 L31 17 M39 26 L42 16 M41 20 L46 17 M10 45 L5 55 M14 46 L13 57 M26 45 L30 55 M30 44 L36 53 M7 38 L3 34"/></g>`;
  d.innerHTML=`<svg viewBox="0 0 260 70" width="260" height="70" fill="none" stroke="url(#gGold)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${deer(0)}${deer(48)}${deer(96)}
   <path d="M141 28 Q160 32 176 40" stroke-dasharray="3 4"/><path d="M176 40 H222 Q236 40 236 26 M174 40 Q170 54 184 55 H232 Q244 55 246 47"/><path d="M196 40 V26 Q196 18 206 18 H214"/>
   <circle cx="207" cy="12" r="5"/><path d="M203 8 L210 0 L214 8"/><path d="M200 19 Q207 30 214 19"/><path d="M220 38 Q228 22 238 30 Q236 38 228 39"/></svg>`;
  document.body.appendChild(d);
  const iv=setInterval(()=>{const r=d.getBoundingClientRect();if(r.right>0&&r.left<innerWidth)fx.burst(r.left+10,r.top+r.height*.6,3,'#ecd9a8');},70);
  SND.bells();
  setTimeout(()=>{clearInterval(iv);d.remove();},3800);
}
function countUp(sel,to,ms,done){
  const t0=performance.now();let last=0,stop=false;
  const step=t=>{if(stop)return;const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);setText(sel,fmt$(to*e));if(t-last>85&&k<1){tone(600+e*1500,.05,'square',.025);last=t;}if(k<1)requestAnimationFrame(step);else{setText(sel,fmt$(to));done&&done();}};
  requestAnimationFrame(step);
  return {finish(){stop=true;setText(sel,fmt$(to));done&&done();}};
}

