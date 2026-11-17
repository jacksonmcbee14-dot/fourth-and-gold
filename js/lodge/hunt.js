// 🦆 Dawn Flight — a hunting game at Duck Marsh (the Grounds), open from your first prestige star.
// Pick a gun and a stake, then 10 ducks come up out of the reeds in 5 waves of two. You get a few shells per wave;
// tap to shoot. The more you bring down, the bigger the payout (6 of 10 gets half your stake back, 10 of 10 pays ×5),
// times your gun's bonus. A rare golden duck pays 3× your stake on its own. Ducks get faster every wave.
// Guns trade shells, spread and payout. The scenery is painted once (sunrise over the marsh) so play stays smooth.

const HUNT={el:null,c:null,ctx:null,loop:null,bg:null,S:1,SW:400,g:null};
const HU_H=640;
const HU_GUNS={
  field:{name:'Field Shotgun',icon:'🔫',price:0,shells:3,r:26,pay:1,desc:'The old reliable'},
  pump:{name:'Pump Action',icon:'🎯',price:5e6,shells:4,r:28,pay:1,desc:'One more shell a wave'},
  double:{name:'Double Barrel',icon:'💥',price:2e7,shells:2,r:42,pay:1.1,desc:'Two shells, huge spread'},
  semi:{name:'Semi-Auto',icon:'⚡',price:1e8,shells:5,r:24,pay:1.15,desc:'Five quick shells'},
  rifle:{name:'Marksman Rifle',icon:'🔭',price:5e8,shells:3,r:16,pay:1.6,desc:'Tight shot, big pay'},
  gold:{name:'Gilded Over-Under',icon:'🏆',price:2e9,shells:4,r:34,pay:1.3,stars:2,desc:'Wide, golden, generous'},
  star:{name:'Starfire',icon:'🌟',price:1e10,shells:5,r:36,pay:1.5,stars:4,desc:'Shots leave starlight'},
};
const HU_LADDER=[0,0,0,0,0,0,.5,1,1.6,2.5,5];
const huMine=()=>{ S.hunt=Object.assign({guns:['field'],gun:'field',best:0,stake:0,rounds:0},S.hunt||{}); return S.hunt; };
const huHas=k=>huMine().guns.includes(k);
const huGun=()=>HU_GUNS[huHas(huMine().gun)?huMine().gun:'field'];
const huPrice=k=>nice(HU_GUNS[k].price*Math.max(starOff(),wealthX()/1500));   // the Starfire ≈ 40% of the $1T vault
const huStakes=()=>{ const c=Math.max(1e5,cashNow()); return [...new Set([.001,.005,.01,.02,.05].map(f=>nice(Math.max(10000,c*f))))]; };

/* ---------- the scenery: sunrise over the marsh (painted once per screen size) ---------- */
function huPaint(){ const S=HUNT.S, W=HUNT.SW, c=document.createElement('canvas'); c.width=Math.ceil(W*S); c.height=Math.ceil(HU_H*S); const x=c.getContext('2d'); x.scale(S,S); const r=grRand(77);
  const sky=x.createLinearGradient(0,0,0,430); [[0,'#1c2350'],[.35,'#5a3f7a'],[.62,'#e0789a'],[.82,'#ffb07a'],[1,'#ffe1a0']].forEach(([k,c])=>sky.addColorStop(k,c)); x.fillStyle=sky; x.fillRect(0,0,W,HU_H);
  for(let i=0;i<60;i++){ x.fillStyle=`rgba(255,255,255,${.5*(1-r()*.7)})`; x.fillRect(r()*W,r()*150,1.3,1.3); }
  const sx=W*.62; grGlow(x,sx,420,260,'rgba(255,200,120,.55)'); grGlow(x,sx,420,120,'rgba(255,240,200,.8)'); x.fillStyle='#fff6dc'; x.beginPath(); x.arc(sx,420,46,0,7); x.fill();
  x.save(); x.globalCompositeOperation='lighter'; for(let k=0;k<14;k++){ const a=Math.PI+k/13*Math.PI; x.fillStyle=`rgba(255,220,160,${.05+.03*(k%2)})`; x.beginPath(); x.moveTo(sx,420); x.lineTo(sx+Math.cos(a-.04)*900,420+Math.sin(a-.04)*900); x.lineTo(sx+Math.cos(a+.04)*900,420+Math.sin(a+.04)*900); x.fill(); } x.restore();
  for(const [y0,amp,seed,col,al] of [[380,70,1.1,'#6a4a8a',.8],[410,50,3.3,'#4a3a6a',.9],[438,30,5.5,'#2e2846',1]]){ x.globalAlpha=al; x.fillStyle=col; x.beginPath(); x.moveTo(0,HU_H); for(let xx=0;xx<=W;xx+=4) x.lineTo(xx,y0+grRidge(xx*1.6,seed,amp)); x.lineTo(W,HU_H); x.fill(); x.globalAlpha=1;
    const m=x.createLinearGradient(0,y0-20,0,y0+60); m.addColorStop(0,'rgba(255,200,200,0)'); m.addColorStop(1,'rgba(255,190,190,.35)'); x.fillStyle=m; x.fillRect(0,y0-20,W,80); }
  x.fillStyle='#1c1a2a'; for(let k=0;k<24;k++){ const tx=r()*W, s=.6+r()*.5; grTree(x,'pine',tx,458,s,['#1c1a2a','#16141f'],r); }
  const wg=x.createLinearGradient(0,456,0,HU_H); wg.addColorStop(0,'#f0a08a'); wg.addColorStop(.4,'#8a5a8a'); wg.addColorStop(1,'#1e1a34'); x.fillStyle=wg; x.fillRect(0,456,W,HU_H-456);
  for(let k=0;k<10;k++){ x.fillStyle=`rgba(255,240,200,${.35-k*.03})`; x.fillRect(sx-40+k*2+Math.sin(k)*6,462+k*9,80-k*6,2); }
  x.fillStyle='#2a2a1e'; for(let k=0;k<70;k++){ const bx=r()*W, h=40+r()*90; x.strokeStyle=k%3?'#2a3020':'#3a3a24'; x.lineWidth=2+r()*2; x.beginPath(); x.moveTo(bx,HU_H); x.quadraticCurveTo(bx+(r()-.5)*20,HU_H-h*.6,bx+(r()-.5)*30,HU_H-h); x.stroke();
    if(k%4===0){ x.fillStyle='#4a3020'; x.beginPath(); x.ellipse(bx+(r()-.5)*4,HU_H-h-6,3,9,0,0,7); x.fill(); } }
  return c; }

/* ---------- ducks ---------- */
function huDuck(x,d,t){ const flap=Math.sin(t*18+d.p), gold=d.gold, s=d.s; x.save(); x.translate(d.x,d.y); x.scale(d.vx<0?-s:s,s); if(d.dead) x.rotate(d.spin);
  if(gold){ grGlow(x,0,0,40,'rgba(255,220,100,.45)'); }
  x.fillStyle=gold?'#e8b42c':'#8a7a6a'; x.beginPath(); x.ellipse(0,0,18,9,-.1,0,7); x.fill();               // body
  x.fillStyle=gold?'#ffd84a':'#6a4a3a'; x.beginPath(); x.ellipse(10,-1,8,7,0,0,7); x.fill();                // chest
  x.fillStyle=gold?'#fff3a0':d.teal?'#3a8a7a':'#1a6a3a'; x.beginPath(); x.arc(20,-8,6.5,0,7); x.fill();    // head
  x.fillStyle='#fff'; x.fillRect(16,-3,7,1.6);                                                                // collar
  x.fillStyle='#ffb02a'; x.beginPath(); x.moveTo(25,-9); x.lineTo(32,-7); x.lineTo(25,-5); x.fill();         // bill
  x.fillStyle='#111'; x.fillRect(21,-10,1.8,1.8);
  x.fillStyle=gold?'#fff6c0':'#5a6a7a'; x.beginPath(); x.moveTo(-4,-2); x.quadraticCurveTo(-2,-2-22*flap,8,-2-26*flap); x.lineTo(10,-2); x.fill();   // wing
  x.fillStyle=gold?'#ffe080':'#3a5aaa'; x.fillRect(-1,-4-8*flap,6,3);
  x.fillStyle=gold?'#c89a2a':'#3a3a3a'; x.beginPath(); x.moveTo(-17,-2); x.lineTo(-26,-5); x.lineTo(-25,3); x.fill();   // tail
  x.restore(); }
function huWave(g){ const n=2, sp=190+g.wave*55; g.ducks=[]; g.shells=huGun().shells; g.waveT=0;
  for(let i=0;i<n;i++){ const gold=Math.random()<.08; g.ducks.push({x:HUNT.SW*(.25+.5*Math.random()),y:560,vx:(Math.random()<.5?-1:1)*sp*(.6+Math.random()*.5),vy:-sp*(.7+Math.random()*.3),p:Math.random()*6,s:gold?1.05:1,gold,teal:Math.random()<.3,dead:false,gone:false,spin:0,zig:1+Math.random()*2}); }
  g.banner={t:0,txt:'WAVE '+(g.wave+1)}; tone(523,.06,'triangle',.04); }
function huStep(g,dt,t){ g.waveT+=dt; const W=HUNT.SW;
  for(const d of g.ducks){ if(d.gone) continue;
    if(d.dead){ d.vy+=900*dt; d.y+=d.vy*dt; d.spin+=dt*8; if(d.y>HU_H+40) d.gone=true; continue; }
    const leaving=g.waveT>5.2||g.shells<=0&&g.waveT>.6; if(leaving){ d.vy=-Math.abs(d.vy)-260*dt*10; }
    else { if(d.x<40||d.x>W-40) d.vx*=-1; if(d.y<70) d.vy=Math.abs(d.vy); if(d.y>420&&g.waveT>1) d.vy=-Math.abs(d.vy); if(Math.random()<dt*d.zig*.6) d.vx*=-1; }
    d.x+=d.vx*dt; d.y+=d.vy*dt+Math.sin(t*3+d.p)*.6; if(d.y<-60){ d.gone=true; d.escaped=true; } }
  if(g.ducks.every(d=>d.gone)){ g.hitsRow.push(...g.ducks.map(d=>d.escaped?0:1)); g.wave++; if(g.wave>=5) huEnd(g); else huWave(g); } }
function huShoot(px,py){ const g=HUNT.g; if(!g||g.phase!=='play'||g.shells<=0) return; g.shells--; g.flash={x:px,y:py,t:0}; g.shake=6; tone(140,.09,'sawtooth',.08); tone(90,.14,'square',.05,.02);
  const G=huGun(); let hit=false;
  for(const d of g.ducks){ if(d.dead||d.gone) continue; if(Math.hypot(d.x-px,d.y-py)<G.r+8){ d.dead=true; d.vy=-120; hit=true; g.hits++; if(d.gold){ g.gold++; g.banner={t:0,txt:'🌟 GOLDEN DUCK!'}; }
    for(let k=0;k<14;k++) g.feathers.push({x:d.x,y:d.y,vx:(Math.random()-.5)*240,vy:(Math.random()-.8)*200,r:Math.random()*6,t:0,c:d.gold?'#ffe080':['#f4eee0','#8a7a6a','#1a6a3a'][k%3]});
    tone(880,.06,'square',.04,.05); } }
  if(G===HU_GUNS.star) for(let k=0;k<10;k++) g.feathers.push({x:px,y:py,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,r:0,t:0,c:'#fff6c0',star:1});
  if(!hit&&g.shells===0) g.banner={t:0,txt:'OUT OF SHELLS'}; }
function huEnd(g){ g.phase='over'; const P=huMine(), G=huGun(), mult=HU_LADDER[g.hits]*G.pay, pay=Math.round(g.stake*mult)+(g.gold?g.stake*3*g.gold:0);
  if(pay) setBank(pay); const best=g.hits>P.best; if(best) P.best=g.hits; P.rounds++; save(); if(typeof gainXP==='function') gainXP(12+g.hits*3,'Dawn Flight');
  if(pay>g.stake){ try{ fx.confetti(g.hits===10?200:100); fx.coins(60,1800); }catch(e){} }
  const card=HUNT.el.querySelector('.hu-card'); card.innerHTML=`<div class="gf-card-in"><div class="gf-k">DAWN FLIGHT · ${esc(G.name.toUpperCase())}</div><div class="gf-big">${g.hits} <small>/ 10</small></div>
    <div class="hu-row">${g.hitsRow.map(h=>h?'🦆':'·').join(' ')}</div>${g.gold?`<div class="gf-k gold">🌟 ${g.gold} golden duck${g.gold>1?'s':''} · +${k$(g.stake*3*g.gold)}</div>`:''}
    <div class="gf-k ${pay?'gold':''}">${pay?'+'+fmt$(pay)+(mult?' · ×'+(+mult.toFixed(2)):''):'No payout — 6 hits gets you paid'}${best?' · ⭐ NEW BEST':''}</div>
    <div class="fgm-row" style="justify-content:center;gap:8px;margin-top:10px"><button class="btn gold" data-hu="again">Again · ${k$(g.stake)}</button><button class="btn" data-hu="menu">Guns & stake</button></div></div>`; card.classList.add('on'); }
function huDraw(t,dt){ const x=HUNT.ctx, g=HUNT.g, W=HUNT.SW; x.setTransform(HUNT.S,0,0,HUNT.S,0,0);
  if(g&&g.shake){ x.translate((Math.random()-.5)*g.shake,(Math.random()-.5)*g.shake); g.shake*=.85; if(g.shake<.3) g.shake=0; }
  x.drawImage(HUNT.bg,0,0,W,HU_H);
  // drifting mist and glinting water
  for(let k=0;k<5;k++){ const mx=((t*(8+k*3)+k*240)%(W+400))-200; x.fillStyle='rgba(255,220,225,.06)'; x.beginPath(); x.ellipse(mx,450+k*14,220,18,0,0,7); x.fill(); }
  for(let k=0;k<14;k++){ const al=Math.max(0,Math.sin(t*2+k*1.7)); x.fillStyle=`rgba(255,240,210,${al*.5})`; x.fillRect((k*67)%W,470+(k*29)%120,8,1.5); }
  // birds far away
  for(let k=0;k<3;k++){ const bx=((t*20+k*130)%(W+60))-30, by=120+k*24+Math.sin(t+k)*6, w=Math.sin(t*8+k)*3; x.strokeStyle='rgba(40,30,60,.6)'; x.lineWidth=1.4; x.beginPath(); x.moveTo(bx-5,by-w); x.lineTo(bx,by); x.lineTo(bx+5,by-w); x.stroke(); }
  if(g){ if(g.phase==='play') huStep(g,dt,t);
    for(const d of g.ducks) if(!d.gone) huDuck(x,d,t);
    g.feathers=g.feathers.filter(f=>(f.t+=dt)<1.4); for(const f of g.feathers){ f.vy+=(f.star?0:260)*dt; f.x+=f.vx*dt; f.y+=f.vy*dt; f.vx*=.97; x.globalAlpha=1-f.t/1.4; x.fillStyle=f.c;
      if(f.star){ x.fillRect(f.x,f.y,2,2); } else { x.save(); x.translate(f.x,f.y); x.rotate(f.t*6+f.r); x.beginPath(); x.ellipse(0,0,5,2,0,0,7); x.fill(); x.restore(); } } x.globalAlpha=1;
    if(g.flash){ g.flash.t+=dt; const k=g.flash.t/.25; if(k>=1) g.flash=null; else { x.strokeStyle=`rgba(255,240,200,${1-k})`; x.lineWidth=3; x.beginPath(); x.arc(g.flash.x,g.flash.y,huGun().r*(.6+k*.6),0,7); x.stroke(); grGlow(x,g.flash.x,g.flash.y,30*(1-k),'rgba(255,230,160,.8)'); } }
    if(g.banner){ g.banner.t+=dt; if(g.banner.t>1.4) g.banner=null; else { const k=g.banner.t; x.globalAlpha=k<.2?k/.2:k>1.1?(1.4-k)/.3:1; x.font='900 30px system-ui,sans-serif'; x.textAlign='center'; x.lineWidth=6; x.strokeStyle='rgba(20,10,30,.8)'; x.strokeText(g.banner.txt,W/2,250); x.fillStyle='#fff6dc'; x.fillText(g.banner.txt,W/2,250); x.globalAlpha=1; } }
    // HUD: shells, hits, wave
    if(g.phase==='play'){ x.fillStyle='rgba(10,8,20,.55)'; x.fillRect(0,HU_H-46,W,46); x.font='bold 13px system-ui,sans-serif'; x.textAlign='left'; x.fillStyle='#ffe9b0'; x.fillText('WAVE '+(g.wave+1)+'/5',12,HU_H-18);
      for(let k=0;k<huGun().shells;k++){ x.fillStyle=k<g.shells?'#e0203a':'rgba(255,255,255,.2)'; x.fillRect(96+k*12,HU_H-32,8,18); x.fillStyle=k<g.shells?'#ffd84a':'rgba(255,255,255,.15)'; x.fillRect(96+k*12,HU_H-18,8,4); }
      x.textAlign='right'; x.font='15px sans-serif'; const row=g.hitsRow.map(h=>h?'🦆':'·').concat(g.ducks.map(d=>d.dead?'🦆':'·')); x.fillText(row.join(''),W-10,HU_H-17); } } }
function huMenu(){ const P=huMine(), card=HUNT.el.querySelector('.hu-card'), st=huStakes(); if(!P.stake||!st.includes(P.stake)) P.stake=st[2]||st[0];
  card.innerHTML=`<div class="gf-card-in hu-menu"><div class="gf-k">🦆 DAWN FLIGHT</div><div class="hu-sub">10 ducks · 5 waves · tap to shoot<br>6 hits pays ½ · 7 ×1 · 8 ×1.6 · 9 ×2.5 · 10 ×5 · 🌟 golden duck +3×</div>
    <div class="hu-guns">${Object.entries(HU_GUNS).map(([k,G])=>{ const own=huHas(k), lock=G.stars&&grStars()<G.stars; return `<button class="hu-gun ${P.gun===k?'on':''} ${own?'':'lock'}" data-hu="${own?'use':lock?'locked':'buy'}" data-v="${k}"><span>${G.icon}</span><b>${esc(G.name)}</b>
      <small>${G.shells} shells · spread ${G.r} · pays ×${G.pay}</small><em>${own?(P.gun===k?'IN HAND':'USE'):lock?'⭐'+G.stars:k$(huPrice(k))}</em></button>`; }).join('')}</div>
    <div class="hu-stakes">${st.map(v=>`<button class="${P.stake===v?'on':''}" data-hu="stake" data-v="${v}">${k$(v)}</button>`).join('')}</div>
    <button class="btn gold wide" data-hu="play" ${P.stake>S.bank?'disabled':''}>Shoot · ${k$(P.stake)}</button>${P.best?`<div class="gf-k">BEST ${P.best} / 10 · ${P.rounds} hunts</div>`:''}</div>`; card.classList.add('on'); }
function huPlay(){ const P=huMine(); if(P.stake>S.bank){ toast('Not enough in the bankroll','loss'); return; } setBank(-P.stake); save();
  HUNT.el.querySelector('.hu-card').classList.remove('on'); HUNT.g={phase:'play',wave:0,hits:0,gold:0,stake:P.stake,ducks:[],feathers:[],hitsRow:[],shells:0}; huWave(HUNT.g); }
function huSize(){ const r=HUNT.c.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1); HUNT.S=r.height*dpr/HU_H; HUNT.c.width=Math.round(r.width*dpr); HUNT.c.height=Math.round(r.height*dpr); HUNT.SW=r.width*dpr/HUNT.S; HUNT.bg=huPaint(); }
function huDom(){ if(HUNT.el) return; const el=document.createElement('div'); el.id='hunt'; el.className='golf hunt'; el.innerHTML=`<canvas></canvas><button class="gf-x" data-hu="close" aria-label="Back">←</button><div class="hu-card gf-card"></div>`;
  document.body.appendChild(el); HUNT.el=el; HUNT.c=el.querySelector('canvas'); HUNT.ctx=HUNT.c.getContext('2d'); HUNT.loop=makeLoop(huDraw);
  HUNT.c.addEventListener('pointerdown',e=>{ const r=HUNT.c.getBoundingClientRect(); huShoot((e.clientX-r.left)/r.width*HUNT.SW,(e.clientY-r.top)/r.height*HU_H); });
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-hu]'); if(!b) return; const a=b.dataset.hu, k=b.dataset.v, P=huMine();
    if(a==='close') closeHunt(); else if(a==='play'||a==='again') huPlay(); else if(a==='menu') huMenu();
    else if(a==='stake'){ P.stake=+k; save(); huMenu(); } else if(a==='use'){ P.gun=k; save(); tone(700,.05,'square',.03); huMenu(); }
    else if(a==='locked') toast(`⭐ Prestige ${HU_GUNS[k].stars}× to unlock the ${HU_GUNS[k].name}`,'gold');
    else if(a==='buy'){ const pr=huPrice(k); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; } setBank(-pr); S.spent=(S.spent||0)+pr; P.guns.push(k); P.gun=k; save(); try{ fx.confetti(80); }catch(e){} toast(`${HU_GUNS[k].icon} ${HU_GUNS[k].name} — yours!`,'gold'); huMenu(); } });
  addEventListener('resize',()=>{ if(HUNT.el.classList.contains('on')) huSize(); }); }
function openHunt(){ if(grStars()<1){ toast('⭐ Dawn Flight opens at your first prestige','gold'); return; } if(typeof closeModal==='function') closeModal(); huDom(); HUNT.el.classList.add('on'); document.body.classList.add('in-golf');
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop(); huSize(); HUNT.g=null; huMenu(); HUNT.loop.start(); }
function closeHunt(){ if(!HUNT.el) return; HUNT.loop.stop(); HUNT.el.classList.remove('on'); document.body.classList.remove('in-golf'); if(HUNT.g&&HUNT.g.phase==='play'){ toast('Hunt abandoned — stake lost','loss'); } HUNT.g=null; save();
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start(); else if(!(typeof GR!=='undefined'&&GR.open)) render(); }
Object.assign(ACT,{ huntOpen:()=>openHunt() });
