// Visual effects: coins, confetti, snow, fireworks, sleigh, count-up
/* ---------- Effects (particles on a full-screen canvas) ---------- */
const fx=(()=>{let c,x,P=[],run=false,W=0,H=0;
  function init(){if(c)return;c=document.createElement('canvas');c.id='fx';document.body.appendChild(c);x=c.getContext('2d');rs();addEventListener('resize',rs);}
  function rs(){const d=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0);}
  function add(p){P.push(p);if(!run){run=true;requestAnimationFrame(loop);}}
  function loop(){x.clearRect(0,0,W,H);
    for(let i=P.length-1;i>=0;i--){const p=P[i];if(p.delay>0){p.delay-=16;continue;}p.vy+=p.g;p.vx*=p.drag;p.vy*=p.drag;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.life--;
      if(p.y>H+40||p.life<=0||p.x<-60||p.x>W+60){P.splice(i,1);continue;}draw(p);}
    if(P.length)requestAnimationFrame(loop);else{run=false;x.clearRect(0,0,W,H);}}
  function draw(p){x.save();x.translate(p.x,p.y);x.globalAlpha=Math.min(1,p.life/30);
    if(p.t==='coin'){x.rotate(p.tilt);x.scale(Math.max(.12,Math.abs(Math.cos(p.rot))),1);const r=p.r,g=x.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#f6ebcb');g.addColorStop(.5,'#c8a45c');g.addColorStop(1,'#6b5228');x.fillStyle=g;x.beginPath();x.arc(0,0,r,0,6.3);x.fill();x.strokeStyle='#5e4520';x.lineWidth=1.4;x.stroke();x.beginPath();x.arc(0,0,r*.68,0,6.3);x.strokeStyle='rgba(122,78,14,.45)';x.stroke();}
    else if(p.t==='conf'){x.rotate(p.rot);x.scale(1,Math.cos(p.rot*2));x.fillStyle=p.c;x.fillRect(-p.r,-p.r/2.4,p.r*2,p.r/1.2);}
    else if(p.t==='snow'){x.fillStyle='rgba(243,234,216,.9)';x.beginPath();x.arc(0,0,p.r,0,6.3);x.fill();}
    else{x.rotate(p.rot);x.strokeStyle=p.c;x.lineWidth=2;x.shadowColor=p.c;x.shadowBlur=8;x.beginPath();x.moveTo(-p.r,0);x.lineTo(p.r,0);x.moveTo(0,-p.r);x.lineTo(0,p.r);x.stroke();}
    x.restore();}
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

