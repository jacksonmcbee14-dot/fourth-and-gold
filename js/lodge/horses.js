// 🐎 Horse racing (out the back of the lodge → Horse stables).
//  • Buy a horse at the stables (Pony → Quarter horse → Thoroughbred → Arabian → Pegasus). Better breeds start
//    faster and can be trained higher.
//  • Train Speed, Stamina and Acceleration (costs money; it grows with each level and your net worth).
//  • Race in tiers: Maiden → Allowance → Stakes → Grade III → Grade II → Grade I → Triple Crown. Win 3 races in a
//    tier to move up — the other horses get faster, but good riding still wins.
//  • The race: tap STRIDE when the marker is in the green for a burst of speed. Bursts cost stamina; stumbles slow you.
//  • Four tracks: Dirt (all-round), Turf (speed), Mud (stamina), Snow (acceleration). Practise any track for free —
//    up to 3 practice runs a day also add a point to a random stat.

const HBREEDS={pony:{name:'Pony',base:20,cap:45,price:100000,coat:'#c08a4a',mane:'#6b3a1f'},quarter:{name:'Quarter horse',base:30,cap:65,price:1e6,coat:'#8a5a2a',mane:'#3a2010'},
  thoroughbred:{name:'Thoroughbred',base:40,cap:85,price:1e7,coat:'#5a3a20',mane:'#1a0e06'},arabian:{name:'Arabian',base:50,cap:100,price:1e8,coat:'#e8e2d6',mane:'#9a9a9a'},
  pegasus:{name:'Pegasus',base:60,cap:120,price:1e9,coat:'#ffffff',mane:'rainbow',wings:1}};
const HTIERS=['Maiden','Allowance','Stakes','Grade III','Grade II','Grade I','Triple Crown'], HT_BASE=[15,28,40,52,64,76,88];
const HTRACKS={dirt:{name:'Dirt',ic:'🟫',w:[1,1,1],sky:'#7fb0d8',ground:'#9a6a3a'},turf:{name:'Turf',ic:'🟩',w:[1.4,.8,.8],sky:'#8ac8f0',ground:'#4a9a42'},
  mud:{name:'Mud',ic:'🟤',w:[.8,1.5,.8],sky:'#8a9aa8',ground:'#5a3a20'},snow:{name:'Snow',ic:'⬜',w:[.8,.8,1.5],sky:'#cfd9e0',ground:'#f3f6fa'}};
const HNAMES=['Thunder','Biscuit','Lucky','Midnight','Golden','Rocket','Maple','Comet','Blaze','Shadow','Sugar','Dash'], HNAMES2=['Run','Star','Hooves','Bolt','Dream','Express','Jack','Glory'];
const hUnit=()=>nice(Math.max(5000,worth()*.0015));
const hStatCost=v=>nice(hUnit()*Math.pow(1.06,v));
const hPrice=b=>nice(HBREEDS[b].price*(typeof wealthX==='function'?Math.max(1,wealthX()/10):1));
const hTrackToday=()=>{ const k=Object.keys(HTRACKS); return k[[...dayKey()].reduce((s,c)=>s+c.charCodeAt(0),0)%k.length]; };
function hRating(H,track){ const w=HTRACKS[track||'dirt'].w; return (H.spd*w[0]*.5+H.sta*w[1]*.25+H.acc*w[2]*.25)/(w[0]*.5+w[1]*.25+w[2]*.25); }
const hFee=()=>nice(Math.max(10000,worth()*.004))*(1+(S.horse?S.horse.tier:0));

// Pixel horse (facing right), feet at (x, y).
const HSPR={top:['............hh..','...........hhhe.','..........mhhhhn','....jj...mhh....','...jjjj.mhh.....','..tbbjbbbbh.....','.ttbbbbbbbb.....','t..bbbbbbbb.....','...bbbbbbbb.....'],
  legs:[['...l.l...l.l....','...l.l...l.l....','..k..k..k..k....'],['....l.l.l...l...','...l...l..l.l...','..k...k.k....k..']]};
function drawHorse(x,H,cx,cy,frame,sc,silk,t){ sc=sc||1; const B=HBREEDS[H.breed]||HBREEDS.pony, rows=HSPR.top.concat(HSPR.legs[frame?1:0]), X=Math.round(cx-8*sc), Y=Math.round(cy-rows.length*sc);
  rows.forEach((r,yy)=>[...r].forEach((ch,xx)=>{ if(ch==='.') return; let c={h:B.coat,b:B.coat,l:B.coat,e:'#16161c',n:'#3a2a2a',k:'#2a2a30',j:silk||'#e0203a',t:B.mane,m:B.mane}[ch];
    if(c==='rainbow') c=`hsl(${(xx*30+yy*20+(t||0)*200)%360},90%,62%)`; x.fillStyle=c; x.fillRect(X+xx*sc,Y+yy*sc,sc,sc); }));
  if(B.wings){ const f=Math.sin((t||0)*12)>0; x.fillStyle='#dff4ff'; for(let i=0;i<5;i++) x.fillRect(X+(5+i)*sc,Y+(f?3-i:4-Math.floor(i/2))*sc,sc,sc); } }

/* ---------- The stables screen ---------- */
const HR={el:null,c:null,ctx:null,loop:null,tab:'horse',race:null};
function hrDom(){ if(HR.el) return; const el=document.createElement('div'); el.id='horses'; el.className='golf';
  el.innerHTML=`<div class="gf-col"><div class="gf-top"><button class="lg-btn lg-round" data-hr="quit" aria-label="Leave the stables">X</button><span class="gf-hole hr-title">🐎 STABLES</span><span class="gf-tot hr-bank"></span></div>
    <div class="gf-stage"><div class="gf-card hr-card"></div></div><div class="gf-bot hr-bot"></div></div>`;
  document.body.appendChild(el); HR.el=el; const {c,ctx}=makeCanvas(el.querySelector('.gf-stage')); HR.c=c; HR.ctx=ctx; HR.loop=makeLoop(hrDraw);
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-hr]'); if(!b||b.disabled) return; e.stopPropagation(); HR_ACT[b.dataset.hr]&&HR_ACT[b.dataset.hr](b); });
  c.addEventListener('pointerdown',()=>{ if(HR.race&&HR.race.phase==='run') hrStride(); }); }
function hrCard(h){ const c=HR.el.querySelector('.hr-card'); if(h==null){ c.classList.remove('on'); return; } c.innerHTML=`<div class="gf-card-in pk-in">${h}</div>`; c.classList.add('on'); }
function hrBar(){ const H=S.horse, bot=HR.el.querySelector('.hr-bot'); HR.el.querySelector('.hr-bank').textContent=k$(S.bank);
  if(HR.race&&HR.race.phase!=='done'){ bot.innerHTML=`<div class="hr-meter"><i></i><b class="hr-mark"></b></div><div class="hr-stam"><u></u></div><button class="gf-swing" data-hr="stride">🏇 STRIDE!</button>`; return; }
  bot.innerHTML=`<div class="pk-grid">${[['horse','🐎 HORSE'],['race','🏁 RACE'],['practice','🏋️ PRACTICE'],['shop','🛒 STABLES']].map(([k,l])=>`<button class="lg-btn ${HR.tab===k?'lg-gold':''}" data-hr="tab" data-v="${k}">${l}</button>`).join('')}</div>`; }
function hrTab(){ const H=S.horse;
  if(!H||HR.tab==='shop') return hrShop();
  if(HR.tab==='horse'){ const B=HBREEDS[H.breed], st=[['spd','⚡ SPEED'],['sta','💨 STAMINA'],['acc','🚀 ACCEL']];
    hrCard(`<div class="gf-k">${esc(H.name.toUpperCase())} · ${esc(B.name.toUpperCase())}</div><canvas class="hr-port" width="96" height="40"></canvas>
      ${st.map(([k,l])=>`<div class="hr-stat"><span>${l}</span><i><u style="width:${Math.min(100,H[k]/B.cap*100)}%"></u></i><b>${H[k]}</b>${H[k]<B.cap?`<button class="lg-btn lg-gold" data-hr="train" data-v="${k}" ${hStatCost(H[k])>S.bank?'disabled':''}>+1 · ${k$(hStatCost(H[k]))}</button>`:'<span class="hr-max">MAX</span>'}</div>`).join('')}
      <div class="tchips"><span>🏆 ${HTIERS[H.tier]}</span><span>${'🥇'.repeat(H.wins||0)}${'⚪'.repeat(3-(H.wins||0))}</span><span>🏁 ${H.races||0} races</span></div>`);
    const cv=HR.el.querySelector('.hr-port'); if(cv){ const x=cv.getContext('2d'); x.imageSmoothingEnabled=false; const draw=()=>{ if(!document.body.contains(cv)) return; const t=performance.now()/1000; x.clearRect(0,0,96,40); rect(x,0,36,96,4,'#4a9a42'); drawHorse(x,H,48,36,(t*4|0)%2,2,H.silk,t); requestAnimationFrame(draw); }; draw(); } return; }
  if(HR.tab==='race'){ const tr=hTrackToday(), T=HTRACKS[tr];
    hrCard(`<div class="gf-k">🏁 ${HTIERS[H.tier].toUpperCase()} RACE</div><div class="tchips"><span>${T.ic} ${T.name} today</span><span>${'🥇'.repeat(H.wins||0)}${'⚪'.repeat(3-(H.wins||0))} → ${HTIERS[Math.min(6,H.tier+1)]}</span></div>
      <div class="tchips"><span>🥇 ×4</span><span>🥈 ×2</span><span>🥉 refund</span></div>
      <button class="lg-btn lg-gold" data-hr="race" ${hFee()>S.bank?'disabled':''}>🏇 ENTER · ${k$(hFee())}</button>`); return; }
  if(HR.tab==='practice'){ const left=3-((S.horse.pDay===dayKey()&&S.horse.pN)||0);
    hrCard(`<div class="gf-k">🏋️ PRACTICE · FREE</div><div class="tchips"><span>${left>0?'⭐ +1 stat · '+left+' left today':'⭐ No stat gains left today'}</span></div>
      <div class="hr-tracks">${Object.entries(HTRACKS).map(([k,T])=>`<button class="rg-game" data-hr="practice" data-v="${k}"><b>${T.ic} ${T.name.toUpperCase()}</b><small>${['ALL-ROUND','SPEED','STAMINA','ACCEL'][Object.keys(HTRACKS).indexOf(k)]} TRACK</small></button>`).join('')}</div>`); return; } }
function hrShop(){ const H=S.horse;
  hrCard(`<div class="gf-k">🛒 THE STABLES</div>${Object.entries(HBREEDS).map(([k,B])=>`<button class="rg-game" data-hr="buy" data-v="${k}" ${H&&H.breed===k?'disabled':''}><b>${B.wings?'🦄':'🐎'} ${B.name.toUpperCase()}</b><small>⚡ START ${B.base} · MAX ${B.cap}</small><small class="gold">${H&&H.breed===k?'YOURS':k$(hPrice(k))}</small></button>`).join('')}
    ${H?'<div class="tchips"><span>🏆 Your tier stays</span></div>':''}`); }
function openHorses(){ if(typeof closeModal==='function') closeModal(); hrDom(); HR.race=null; HR.tab=S.horse?'horse':'shop'; HR.el.classList.add('on'); document.body.classList.add('in-golf');
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop(); hrTab(); hrBar(); HR.loop.start(); }
function closeHorses(){ if(!HR.el) return; HR.loop.stop(); HR.el.classList.remove('on'); document.body.classList.remove('in-golf'); HR.race=null; save();
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start(); else render(); }

/* ---------- Racing ---------- */
const SILKS=['#e0203a','#3a7aff','#3ad08a','#ffd84a','#b03aff','#ff8a3a'];
function hrStart(track,practice){ const H=S.horse, tier=H.tier, names=HNAMES.slice().sort(()=>Math.random()-.5), keys=Object.keys(HBREEDS);
  const field=[{me:1,name:H.name,h:H,rating:hRating(H,track),silk:H.silk||'#e0203a'}];
  for(let i=0;i<5;i++){ const r=HT_BASE[tier]+(-10+Math.random()*16); field.push({name:names[i]+' '+HNAMES2[(i*3+tier)%HNAMES2.length],h:{breed:keys[Math.min(4,Math.floor(tier/1.6)+(i%2))]},rating:Math.max(8,r),silk:SILKS[i+1],surge:0}); }
  field.forEach((f,i)=>{ f.pos=0; f.lane=i; f.v=0; f.burst=0; f.stum=0; f.done=0; });
  HR.race={phase:'count',t:0,track,practice,field,D:1000,stam:100,p:0,finish:[],cd:3}; hrCard(null); hrBar(); }
function hrStride(){ const R=HR.race; if(!R||R.phase!=='run') return; const me=R.field[0], H=S.horse, z=.12+H.acc/600, d=Math.abs(R.p-.5);
  if(me.stum>0) return;
  if(d<z/2){ if(R.stam>=10){ me.burst=1.2; R.stam-=14; tone(988,.05,'square',.04); R.flash='GREAT!'; } else { R.flash='TIRED!'; } }
  else if(d<z){ if(R.stam>=6){ me.burst=.6; R.stam-=9; tone(784,.05,'square',.04); R.flash='GOOD'; } }
  else { me.stum=.6; tone(200,.12,'sawtooth',.04); R.flash='STUMBLE!'; } R.flashT=.6; }
function hrRun(R,dt){ R.t+=dt; const H=S.horse;
  if(R.phase==='count'){ R.cd-=dt; if(R.cd<=0){ R.phase='run'; tone(1047,.2,'square',.06); hrBar(); } else if(Math.ceil(R.cd)!==R.lastCd){ R.lastCd=Math.ceil(R.cd); tone(523,.1,'square',.05); } return; }
  if(R.phase!=='run') return;
  R.p=(R.t*1/.9)%2; R.p=R.p<1?R.p:2-R.p; R.stam=Math.min(100,R.stam+dt*(4+H.sta/12));
  const mk=HR.el.querySelector('.hr-mark'); if(mk) mk.style.left=(R.p*100)+'%'; const st=HR.el.querySelector('.hr-stam u'); if(st) st.style.width=R.stam+'%';
  const z=.12+H.acc/600, mz=HR.el.querySelector('.hr-meter i'); if(mz){ mz.style.left=(50-z*50)+'%'; mz.style.width=(z*100)+'%'; }
  for(const f of R.field){ if(f.done) continue; let v=30+f.rating*.62;
    if(f.me){ if(f.burst>0){ v*=1+(.22+H.acc/900)*Math.min(1,f.burst); f.burst-=dt; } if(f.stum>0){ v*=.82; f.stum-=dt; } }
    else { f.surge-=dt; if(f.surge<=0){ f.surge=1+Math.random()*2; f.kick=(Math.random()-.4)*.14; } v*=1+(f.kick||0)+Math.sin(R.t*1.3+f.lane)*.03; if(f.pos>R.D*.75) v*=1.04; }
    f.v=v; f.pos+=v*dt; if(f.pos>=R.D){ f.pos=R.D; f.done=1; R.finish.push(f); if(f.me) tone(1319,.15,'square',.05); } }
  if(R.field[0].done&&!R.endAt) R.endAt=R.t; if(R.endAt&&(R.t-R.endAt>1.4||R.finish.length===R.field.length)) hrFinish(R); }
function hrFinish(R){ R.phase='done'; const H=S.horse; const order=R.finish.concat(R.field.filter(f=>!f.done).sort((a,b)=>b.pos-a.pos)), place=order.findIndex(f=>f.me)+1;
  let lines=[]; H.races=(H.races||0)+1;
  if(R.practice){ if(H.pDay!==dayKey()){ H.pDay=dayKey(); H.pN=0; } if(H.pN<3){ H.pN++; const k=['spd','sta','acc'][Math.floor(Math.random()*3)]; if(H[k]<HBREEDS[H.breed].cap){ H[k]++; lines.push(({spd:'⚡',sta:'💨',acc:'🚀'})[k]+' +1'); } } }
  else { const prize=Math.round(R.fee*({1:4,2:2,3:1}[place]||0)); if(prize){ setBank(prize); lines.push('💰 +'+k$(prize)); }
    if(place===1){ H.wins=(H.wins||0)+1; if(typeof gainXP==='function') gainXP(60+H.tier*20,'Horse race',false); try{ fx.confetti(160); }catch(e){} }
    if(H.wins>=3&&H.tier<6){ H.tier++; H.wins=0; lines.push('⬆️ '+HTIERS[H.tier]); setTimeout(()=>celebrate('🏆 Promoted!',`${H.name} moves up to ${HTIERS[H.tier]}. The horses are faster here.`,HTIERS[H.tier]),900); } }
  save(); HR.tab=R.practice?'practice':'race';
  hrCard(`<div class="gf-k">${R.practice?'PRACTICE':HTIERS[H.tier]} · ${HTRACKS[R.track].ic} ${HTRACKS[R.track].name.toUpperCase()}</div><div class="gf-big">${['','🥇','🥈','🥉'][place]||''} #${place}</div>
    <div class="tchips">${lines.map(l=>`<span>${l}</span>`).join('')}${R.practice?'':`<span>${'🥇'.repeat(H.wins||0)}${'⚪'.repeat(3-(H.wins||0))}</span>`}</div>
    <div class="pk-field">${order.map((f,i)=>`<div class="${f.me?'me':''}"><b>${i+1}.</b> ${esc(f.name)}</div>`).join('')}</div>
    <div class="gf-row"><button class="lg-btn lg-gold" data-hr="${R.practice?'practice':'race'}" data-v="${R.track}">AGAIN</button><button class="lg-btn" data-hr="tab" data-v="horse">STABLE</button></div>`);
  HR.race=null; hrBar(); }
function hrDraw(t,dt){ const x=HR.ctx, R=HR.race;
  if(!R){ rect(x,0,0,PW,PH,'#7fb0d8'); rect(x,0,200,PW,120,'#4a9a42'); for(let i=0;i<PW;i+=24){ rect(x,i,186,2,16,'#f3ead8'); } rect(x,0,186,PW,2,'#f3ead8'); rect(x,20,120,50,66,'#9a2a35'); rect(x,16,112,58,10,'#6b3a1f'); rect(x,36,150,18,36,'#3a1a10');
    if(S.horse) drawHorse(x,S.horse,130,236,(t*2|0)%2,3,S.horse.silk,t); else ptext(x,'BUY A HORSE!',56,230,'#ffffff'); return; }
  hrRun(R,dt); const T=HTRACKS[R.track], me=R.field[0], cam=me.pos;
  rect(x,0,0,PW,110,T.sky); for(let i=0;i<5;i++){ const cx=((i*61-cam*.1)%240+240)%240-20; rect(x,cx,30+i*7,26,6,'#ffffff'); rect(x,cx+4,26+i*7,16,5,'#ffffff'); }
  rect(x,0,90,PW,20,'#2a6a2a'); for(let i=0;i<10;i++){ const sx=((i*40-cam*.3)%400+400)%400-20; rect(x,sx,94,24,16,'#3a8a3a'); }
  rect(x,0,110,PW,180,T.ground); for(let i=0;i<14;i++){ const px=((i*30-cam*1.2)%420+420)%420-20; rect(x,px,112,2,8,'#f3ead8'); } rect(x,0,112,PW,2,'#f3ead8'); rect(x,0,286,PW,2,'#f3ead8');
  if(R.track==='snow') for(let i=0;i<20;i++) rect(x,(i*37+t*30)%PW,(i*53+t*60)%300,1,1,'#ffffff');
  if(R.track==='mud') for(let i=0;i<12;i++) rect(x,((i*50-cam*1.2)%400+400)%400,140+i*12%140,6,2,'#3a2410');
  const fx2=60+(R.D-cam)*1.2; if(fx2<PW+10){ for(let yy=114;yy<286;yy+=6) rect(x,fx2,yy,4,3,((yy/6)|0)%2?'#16161c':'#ffffff'); }
  for(const f of R.field.slice().sort((a,b)=>a.lane-b.lane)){ const sx=60+(f.pos-cam)*1.2, sy=134+f.lane*27; if(sx<-30||sx>PW+30) continue;
    drawHorse(x,f.h,sx,sy,((t*(4+f.v/20))|0)%2,f.me?2:2,f.silk,t); if(f.me){ rect(x,sx-3,sy-30,6,4,'#ffd84a'); rect(x,sx-1,sy-26,2,2,'#ffd84a'); } }
  const pl=R.field.slice().sort((a,b)=>b.pos-a.pos).findIndex(f=>f.me)+1; rect(x,0,0,PW,16,'rgba(5,9,15,.6)'); ptext(x,'#'+pl+' OF 6',4,5,'#ffd84a'); ptext(x,Math.max(0,Math.round(R.D-me.pos))+'M',PW-ptextW(Math.max(0,Math.round(R.D-me.pos))+'M')-4,5,'#ffffff');
  if(R.phase==='count'){ const n=String(Math.ceil(R.cd)); ptext(x,n,96-ptextW(n)*1.5,60,'#ffffff',3); }
  if(R.flash&&R.flashT>0){ R.flashT-=dt; ptext(x,R.flash,96-ptextW(R.flash),40,R.flash==='STUMBLE!'||R.flash==='TIRED!'?'#e0203a':'#3ad08a',2); } }

const HR_ACT={
  quit:()=>closeHorses(), stride:()=>hrStride(),
  tab:b=>{ HR.tab=b.dataset.v; tone(700,.03,'square',.02); hrTab(); hrBar(); },
  buy:b=>{ const k=b.dataset.v, pr=hPrice(k); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; } const B=HBREEDS[k], old=S.horse;
    setBank(-pr); S.spent=(S.spent||0)+pr; S.horse={breed:k,name:old?old.name:HNAMES[Math.floor(Math.random()*HNAMES.length)]+' '+HNAMES2[Math.floor(Math.random()*HNAMES2.length)],spd:Math.max(B.base,old?Math.min(old.spd,B.cap):0),sta:Math.max(B.base,old?Math.min(old.sta,B.cap):0),acc:Math.max(B.base,old?Math.min(old.acc,B.cap):0),tier:old?old.tier:0,wins:old?old.wins:0,races:old?old.races:0,silk:SILKS[Math.floor(Math.random()*SILKS.length)]};
    save(); try{ fx.confetti(140); }catch(e){} [523,659,784,1047].forEach((f,i)=>tone(f,.1,'square',.05,i*.08)); HR.tab='horse'; hrTab(); hrBar(); celebrate('🐎 Meet '+S.horse.name+'!',`Your new ${B.name.toLowerCase()} is in the stable.`,'Train · Race · Win'); },
  train:b=>{ const H=S.horse, k=b.dataset.v, pr=hStatCost(H[k]); if(pr>S.bank||H[k]>=HBREEDS[H.breed].cap) return; setBank(-pr); S.spent=(S.spent||0)+pr; H[k]++; save(); tone(880,.05,'square',.04); hrTab(); },
  race:b=>{ const fee=hFee(); if(fee>S.bank){ toast('Not enough in the bankroll','loss'); return; } setBank(-fee); S.spent=(S.spent||0)+fee; save(); hrStart(hTrackToday(),false); HR.race.fee=fee; },
  practice:b=>{ if(!b.dataset.v){ HR.tab='practice'; hrTab(); hrBar(); return; } hrStart(b.dataset.v,true); },
};
Object.assign(ACT,{ horsesOpen:()=>openHorses() });
