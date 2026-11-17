// 🎯 The driving range: three mini games that build your golf level (js/golf/skill.js).
//  • Long drive: 5 balls with the driver. Your longest carry counts.
//  • Target practice: 5 balls at flags from 60 to 180 yards. Points for landing close.
//  • Perfect streak: hit the green as many times in a row as you can. The meter speeds up each time.
// Every ball earns golf XP. Beating your best in a game pays a prize that grows with your golf level.

const RANGE={el:null,c:null,ctx:null,loop:null,game:null,balls:0,shots:[],anim:null,meter:null,phase:'menu',score:0,target:0,speed:1,msg:null};
const RANGE_GAMES={
  drive:{name:'Long drive',icon:'🚀',blurb:'5 balls with the driver. Longest carry wins.',unit:'yds',prize:50000},
  target:{name:'Target practice',icon:'🎯',blurb:'5 balls at flags 60–180 yards out. Land close for points.',unit:'pts',prize:50000},
  streak:{name:'Perfect streak',icon:'🔥',blurb:'Hit the green again and again. It speeds up every time.',unit:'in a row',prize:75000},
};
const R_Y=yd=>PH-30-(yd/300)*(PH-60), R_X=lat=>PW/2+lat*.7;

function rangeDom(){
  if(RANGE.el) return;
  const el=document.createElement('div'); el.id='range'; el.className='golf';
  el.innerHTML=`<div class="gf-col">
    <div class="gf-top"><button class="lg-btn lg-round" data-rg="quit" aria-label="Leave the range">X</button><span class="gf-hole rg-title">DRIVING RANGE</span><span class="gf-lv rg-lv"></span><span class="gf-tot rg-score">0</span></div>
    <div class="gf-stage"><div class="gf-card rg-card"></div></div>
    <div class="gf-bot"><div class="gf-info"><span class="rg-left"></span><span class="rg-best"></span></div>
      <div class="gf-meter" data-rg="swing"><i class="r"></i><i class="y"></i><i class="g"></i><i class="y"></i><i class="r"></i><b class="gf-mark"></b></div>
      <button class="gf-swing" data-rg="swing">SWING</button></div></div>`;
  document.body.appendChild(el); RANGE.el=el;
  const {c,ctx}=makeCanvas(el.querySelector('.gf-stage')); RANGE.c=c; RANGE.ctx=ctx; RANGE.loop=makeLoop(rangeDraw);
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-rg]'); if(!b||b.disabled) return; e.stopPropagation(); RG_ACT[b.dataset.rg]&&RG_ACT[b.dataset.rg](b); });
}
function rangeMeter(){ if(RANGE.el) golfZones(RANGE.el.querySelector('.gf-meter')); }
function rangeHud(){
  const g=RANGE_GAMES[RANGE.game], best=rangeBest(RANGE.game);
  RANGE.el.querySelector('.rg-lv').textContent='LV '+golfLv();
  RANGE.el.querySelector('.rg-score').textContent=RANGE.game?String(RANGE.score):'—';
  RANGE.el.querySelector('.rg-title').textContent=g?g.name.toUpperCase():'DRIVING RANGE';
  RANGE.el.querySelector('.rg-left').textContent=g?(RANGE.game==='streak'?'STREAK '+RANGE.score:'BALLS LEFT '+(5-RANGE.balls)):'';
  RANGE.el.querySelector('.rg-best').textContent=g&&best?'BEST '+best+' '+g.unit.toUpperCase():'';
  RANGE.el.querySelector('.gf-meter').classList.toggle('on',RANGE.phase==='meter');
  const sw=RANGE.el.querySelector('.gf-swing'); sw.disabled=!(RANGE.phase==='ready'||RANGE.phase==='meter'); sw.textContent=RANGE.phase==='meter'?'HIT!':'SWING'; sw.classList.toggle('hit',RANGE.phase==='meter');
}
const rangeBest=g=>(S.golf&&S.golf.range&&S.golf.range[g])||0;
function rangeMenu(){
  RANGE.phase='menu'; RANGE.game=null; RANGE.shots=[]; RANGE.anim=null;
  const card=RANGE.el.querySelector('.rg-card');
  card.innerHTML=`<div class="gf-card-in"><div class="gf-k">DRIVING RANGE · GOLF LV ${golfLv()}</div>
    ${Object.entries(RANGE_GAMES).map(([k,g])=>`<button class="rg-game" data-rg="start" data-v="${k}"><b>${g.icon} ${g.name.toUpperCase()}</b><small>${esc(g.blurb)}</small><small class="gold">${rangeBest(k)?'BEST '+rangeBest(k)+' '+g.unit.toUpperCase()+' · ':''}NEW BEST PAYS ${k$(g.prize*golfPayX())}</small></button>`).join('')}
    <div class="tchips"><span style="--d:0ms">⛳ Every ball = XP</span><span style="--d:70ms">🎯 Bigger sweet spot</span><span style="--d:140ms">💰 Bigger prizes</span></div></div>`;
  card.classList.add('on'); rangeHud();
}
function rangeStart(g){
  RANGE.game=g; RANGE.balls=0; RANGE.score=0; RANGE.shots=[]; RANGE.speed=1; RANGE.el.querySelector('.rg-card').classList.remove('on');
  rangeNext(); rangeMeter();
}
function rangeNext(){ RANGE.phase='ready'; RANGE.anim=null; if(RANGE.game==='target') RANGE.target=[60,90,120,150,180][Math.floor(Math.random()*5)]; rangeHud(); }
function rangeSwing(){
  if(RANGE.phase==='ready'){ RANGE.phase='meter'; RANGE.meter={t:0,p:0}; tone(500,.04,'square',.03); rangeHud(); return; }
  if(RANGE.phase!=='meter') return;
  const p=RANGE.meter.p, d=Math.abs(p-.5)*2, side=p<.5?-1:1, K=golfK(), q=d<K.perfect?'perfect':d<K.good?'good':'miss', G=RANGE.game;
  tone(260,.08,'square',.05); tone(180,.12,'triangle',.05,.03); if(q==='perfect') tone(1046,.12,'square',.04,.05);
  let carry, lat, line='', xp=q==='perfect'?8:q==='good'?4:1;
  if(G==='drive'){ carry=Math.round(230*(1+.12*(golfLv()-1)/49)*(q==='perfect'?1+Math.random()*.05:q==='good'?1-d*.25*K.err:1-(.3+d*.3)*K.err)); lat=side*(q==='perfect'?Math.random()*4:q==='good'?d*25:15+d*40)*K.err;
    RANGE.score=Math.max(RANGE.score,carry); line=carry+' YDS'; xp+=Math.floor(carry/30); }
  else if(G==='target'){ const t=RANGE.target, f=q==='perfect'?1+(Math.random()-.5)*.04:q==='good'?1+side*d*.3*K.err:1+side*(.2+d*.4)*K.err;
    carry=Math.round(t*f); lat=side*(q==='perfect'?Math.random()*2:q==='good'?d*14:8+d*20)*K.err;
    const off=Math.hypot(carry-t,lat), pts=off<3?50:off<8?25:off<15?10:0; RANGE.score+=pts; line=pts?(off<3?'DART! ':'')+'+'+pts+' PTS':Math.round(off)+' YDS OFF'; xp+=Math.round(pts/5); }
  else { carry=150; lat=0; if(q==='perfect'){ RANGE.score++; RANGE.speed*=1.1; line='STREAK '+RANGE.score; xp+=2+RANGE.score; } else { line=q==='good'?'CLOSE — STREAK OVER':'MISS — STREAK OVER'; lat=side*30; carry=110; } }
  golfXP(xp,'range');
  RANGE.anim={from:[0,0],to:[lat,carry],t:0,dur:.6+carry/300,h:Math.max(8,carry*.2),line,q};
  RANGE.phase='fly'; if(G!=='streak') RANGE.balls++; rangeHud();
}
function rangeLanded(){
  const A=RANGE.anim; RANGE.shots.push({x:A.to[0],y:A.to[1],q:A.q}); RANGE.msg={a:A.line,until:performance.now()+1100};
  const over=RANGE.game==='streak'?A.q!=='perfect':RANGE.balls>=5;
  if(over) setTimeout(rangeEnd,1100); else setTimeout(rangeNext,700);
  RANGE.phase='wait'; RANGE.anim=null; rangeHud();
}
function rangeEnd(){
  const g=RANGE_GAMES[RANGE.game], best=rangeBest(RANGE.game), pb=RANGE.score>best&&RANGE.score>0;
  S.golf=S.golf||{}; S.golf.range=S.golf.range||{}; let prize=0;
  if(pb){ S.golf.range[RANGE.game]=RANGE.score; prize=Math.round(g.prize*golfPayX()); setBank(prize); try{ fx.coins(50,1600); }catch(e){} [523,659,784,1047].forEach((f,i)=>tone(f,.12,'square',.05,i*.09)); }
  golfXP(15,'range'); save();
  const card=RANGE.el.querySelector('.rg-card');
  card.innerHTML=`<div class="gf-card-in"><div class="gf-k">${esc(g.name.toUpperCase())}</div><div class="gf-big">${RANGE.score} <small>${esc(g.unit)}</small></div>
    ${pb?`<div class="gf-k gold">NEW PERSONAL BEST · +${k$(prize)}</div>`:best?`<div class="gf-k">BEST ${best}</div>`:''}
    <div class="gf-k">GOLF LEVEL ${golfLv()}</div>
    <div class="gf-row"><button class="lg-btn lg-gold" data-rg="start" data-v="${RANGE.game}">AGAIN</button><button class="lg-btn" data-rg="menu">OTHER GAMES</button></div></div>`;
  card.classList.add('on'); RANGE.phase='menu-end'; rangeHud();
}
function rangeDraw(t,dt){
  const x=RANGE.ctx;
  // the range: mown stripes, yardage boards and a tee mat
  for(let y=0;y<PH;y+=10) rect(x,0,y,PW,10,(y/10)%2?'#3e8a3a':'#45953f');
  rect(x,0,0,PW,14,'#2a5a6a'); for(let i=0;i<PW;i+=9) rect(x,i,10+(i%3),6,4,'#2a6a3a');
  for(const yd of [50,100,150,200,250]){ const y=R_Y(yd); rect(x,0,y,PW,1,'rgba(255,255,255,.25)'); rect(x,4,y-6,18,9,'#f3ead8'); ptext(x,String(yd),6,y-4,'#1a1006'); }
  rect(x,PW/2-14,PH-28,28,10,'#2a6a3a'); rect(x,PW/2-14,PH-28,28,1,'#7ad070');
  if(RANGE.game==='target'&&RANGE.phase!=='menu'){ const ty=R_Y(RANGE.target), tx=R_X(0);
    for(const [r,c] of [[12,'#f3ead8'],[8,'#d0303a'],[4,'#f3ead8']]) for(let yy=-r;yy<=r;yy++){ const w=Math.round(r*2*Math.sqrt(1-(yy/(r+.5))**2)); rect(x,tx-w,ty+yy*.5,w*2,1,c); }
    rect(x,tx,ty-16,1,16,'#cfd9e0'); rect(x,tx+1,ty-16,6,4,'#ffd84a'); ptext(x,RANGE.target+'Y',tx+8,ty-14,'#ffffff'); }
  if(RANGE.game==='streak'&&RANGE.phase!=='menu'){ const ty=R_Y(150), tx=R_X(0); rect(x,tx-10,ty-3,20,6,'#7a4e24'); rect(x,tx-9,ty-2,18,4,'#1a1006'); ptext(x,'BUCKET',tx-12,ty+6,'#f3ead8'); }
  for(const s of RANGE.shots) rect(x,R_X(s.x),R_Y(s.y),2,2,s.q==='perfect'?'#ffd84a':'#ffffff');
  // the meter
  if(RANGE.phase==='meter'){ const m=RANGE.meter; m.t+=dt; const per=.8*golfK().speed/RANGE.speed, ph=(m.t/per)%2; m.p=ph<1?ph:2-ph; const mk=RANGE.el.querySelector('.gf-mark'); if(mk) mk.style.left=(m.p*100)+'%'; }
  // the ball in the air
  const A=RANGE.anim;
  if(A){ A.t+=dt; const k=Math.min(1,A.t/A.dur), bx=A.to[0]*k, by=A.to[1]*k, h=Math.sin(k*Math.PI)*A.h;
    rect(x,R_X(bx),R_Y(by),2,1,'rgba(0,0,0,.4)'); rect(x,R_X(bx),R_Y(by)-h*.4,2,2,'#ffffff'); if(k>=1) rangeLanded(); }
  else if(RANGE.phase==='ready'||RANGE.phase==='meter') rect(x,PW/2-1,PH-25,2,2,'#ffffff');
  if(RANGE.msg&&performance.now()<RANGE.msg.until){ const w=ptextW(RANGE.msg.a)+10; rect(x,PW/2-w/2,60,w,13,'rgba(5,9,15,.75)'); ptext(x,RANGE.msg.a,PW/2-w/2+5,64,'#ffd84a'); }
}
const RG_ACT={
  quit:()=>closeRange(),
  start:b=>rangeStart(b.dataset.v),
  menu:()=>rangeMenu(),
  swing:()=>rangeSwing(),
};
function openRange(){
  rangeDom(); closeModal(); RANGE.el.classList.add('on'); document.body.classList.add('in-golf');
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop();
  rangeMenu(); rangeMeter(); RANGE.loop.start();
}
function closeRange(){
  if(!RANGE.el) return; RANGE.loop.stop(); RANGE.el.classList.remove('on'); document.body.classList.remove('in-golf'); RANGE.phase='off';
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start();
  if(!(typeof lodgeActive==='function'&&lodgeActive())) render();
}
Object.assign(ACT,{ rangeOpen:()=>openRange() });
