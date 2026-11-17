// 🎮 Every pet action is a mini game (Kennel Club, js/lodge/pets.js):
//  • Feed (grocery): food rains down — slide the bowl to catch it. More catches, more filling.
//  • Groom: your finger is the brush — scrub the mud spots off before time runs out (bubbles!). Spa day ends with a bow.
//  • Play: tug of war — tap as fast as you can before your pet wins.
//  • Obedience: Simon says. Your pet acts out each command (sit, paw, roll, speak… spin and beg later); repeat it.
//    Starts at 3 commands and gets longer, faster and adds new tricks as your pet levels up.
//  • Agility and Tricks: the meter gets faster as your pet levels up.
//  • Show: a runway walk, three judges flip their cards, then your placing. Upgrade: a glow-up.

const PG_KINDS=new Set(['feed','scrub','tug','memory','show','glow']);
const PGT={ptr:null,down:false};
function kenBg(x){
  for(let y=0;y<200;y+=8) rect(x,0,y,PW,8,(y/8)%2?'#5a3a28':'#553624'); rect(x,0,196,PW,4,'#c8a45c');
  for(let y=200;y<PH;y+=10) for(let xx=0;xx<PW;xx+=20) rect(x,xx+((y/10)%2)*10,y,20,10,((xx/20+y/10)|0)%2?'#c9b48a':'#bba57a');
}
const bark=P=>P.species==='cat'?'MEOW!':'WOOF!';
// A pet striking a pose, feet at (cx, cy).
function petPose(x,P,cx,cy,sc,t,pose,k){
  k=k==null?1:k; x.save();
  if(pose==='sit'){ x.translate(cx-4*sc,cy); x.rotate(-.28*k); drawPet(x,P,4*sc,0,1,t,0,sc); }
  else if(pose==='beg'){ x.translate(cx+2*sc,cy); x.rotate(-.75*k); drawPet(x,P,-2*sc,0,1,t,0,sc); }
  else if(pose==='roll'){ const H=9*sc; x.translate(cx,cy-H/2); x.rotate(Math.PI*2*k); drawPet(x,P,0,H/2,1,t,0,sc); }
  else if(pose==='spin'){ drawPet(x,P,cx,cy-Math.sin(k*Math.PI)*6*sc/4,Math.sin(k*Math.PI*4)>0?1:-1,t,0,sc); }
  else { drawPet(x,P,cx,cy-(pose==='jump'?Math.sin(k*Math.PI)*20:0),1,t,pose==='run'?((t*10|0)%2):0,sc);
    if(pose==='paw'){ x.fillStyle=((PET_BREEDS[P.species]||{})[P.breed]||{b:'#d9a24a'}).b; x.fillRect(cx+(9-6)*sc,cy-(4+3*k)*sc,sc,3*sc); }
    if(pose==='speak'){ const w=ptextW(bark(P))+6, bx=cx+2*sc, by=cy-14*sc; rect(x,bx,by,w,11,'#ffffff'); rect(x,bx+2,by+11,3,3,'#ffffff'); ptext(x,bark(P),bx+3,by+3,'#16161c'); } }
  x.restore();
}

/* ---------- Feeding: catch the food ---------- */
const FOOD_ART={kibble:['#8a5a2a','#6b3a1f'],chicken:['#e0a050','#f3ead8'],steak:['#b0303a','#7a1a20'],treats:['#f3ead8','#cfc6b4']};
petBuy=function(id){ const it=PET_FOOD.concat(PET_GROOM).find(x=>x[0]===id); if(!it) return; const pr=petUnit()*it[2];
  if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; } petTick(); setBank(-pr); S.spent=(S.spent||0)+pr; save(); kenCard(null); KEN.mode='game';
  if(it[4]!==undefined||id==='bath'||id==='spa') startScrub(it); else KEN.game={kind:'feed',it,t:0,dur:9,bowl:96,tx:96,pieces:[],spawn:0,caught:0,total:0,pops:[]};
  tone(660,.05,'square',.04); kenHud(); };
function feedStep(x,G,t,dt){ const P=S.pet; G.t+=dt; G.bowl+=(G.tx-G.bowl)*Math.min(1,dt*12);
  if(G.t<G.dur){ G.spawn-=dt; if(G.spawn<=0){ G.spawn=.45+Math.random()*.35; G.pieces.push({x:20+Math.random()*152,y:-6,v:70+Math.random()*50+G.t*6}); G.total++; } }
  const col=FOOD_ART[G.it[0]]||FOOD_ART.kibble;
  for(const p of G.pieces){ p.y+=p.v*dt; if(!p.done&&p.y>=262&&p.y<=272&&Math.abs(p.x-G.bowl)<16){ p.done=1; G.caught++; G.pops.push({x:p.x,y:262,t:0}); tone(880+G.caught*20,.04,'square',.03); }
    if(!p.done&&p.y<PH){ rect(x,p.x-2,p.y-2,5,4,col[0]); rect(x,p.x-1,p.y-1,2,1,col[1]); } }
  G.pieces=G.pieces.filter(p=>!p.done&&p.y<PH);
  petPose(x,P,40,272,3,t,G.caught%5===4?'jump':'idle',(t*2)%1);
  rect(x,G.bowl-14,266,28,8,'#c0303a'); rect(x,G.bowl-12,264,24,3,'#e0e0e0'); rect(x,G.bowl-10,265,20,1,col[0]);
  G.pops=G.pops.filter(p=>(p.t+=dt)<.6); for(const p of G.pops) ptext(x,'+',p.x,p.y-p.t*40,'#3ad08a');
  ptext(x,'CATCH! '+G.caught,8,60,'#ffd84a'); timeBar(x,1-G.t/G.dur);
  if(G.t>=G.dur&&!G.pieces.length) endCare(G,G.total?G.caught/G.total:1,'NOM NOM!');
}

/* ---------- Grooming: scrub the mud off ---------- */
function startScrub(it){ const spots=[]; for(let i=0;i<7;i++) spots.push({x:56+Math.random()*80,y:190+Math.random()*44,r:7+Math.random()*4,d:1});
  KEN.game={kind:'scrub',it,t:0,dur:10,spots,bubbles:[],spa:it[0]==='spa'}; }
function scrubStep(x,G,t,dt){ const P=S.pet; G.t+=dt; petPose(x,P,96,250,8,t,'idle');
  for(const s of G.spots) if(s.d>0){ x.globalAlpha=s.d*.9; for(let yy=-s.r;yy<=s.r;yy+=2) for(let xx=-s.r;xx<=s.r;xx+=2) if(xx*xx+yy*yy<=s.r*s.r&&((xx+yy)&2)) rect(x,s.x+xx,s.y+yy,2,2,'#5a3a1a'); x.globalAlpha=1; }
  if(PGT.down&&PGT.ptr){ const [px,py]=PGT.ptr; for(const s of G.spots) if(s.d>0&&Math.hypot(px-s.x,py-s.y)<s.r+6){ s.d=Math.max(0,s.d-dt*2.4); if(Math.random()<.4) G.bubbles.push({x:px+(Math.random()-.5)*14,y:py,t:0,r:1+Math.random()*2}); if(s.d===0) tone(1046,.06,'square',.04); } }
  G.bubbles=G.bubbles.filter(b=>(b.t+=dt)<1); for(const b of G.bubbles){ const r=b.r+b.t*2; x.globalAlpha=1-b.t; rect(x,b.x-r,b.y-b.t*30-r,r*2,r*2,'#dff4ff'); rect(x,b.x-r+1,b.y-b.t*30-r+1,1,1,'#ffffff'); x.globalAlpha=1; }
  if(PGT.ptr){ const [px,py]=PGT.ptr; rect(x,px-2,py-14,4,10,'#8a5a2a'); rect(x,px-6,py-4,12,4,'#c8a45c'); for(let i=0;i<6;i++) rect(x,px-5+i*2,py,1,3,'#f3ead8'); }
  const left=G.spots.filter(s=>s.d>0).length; ptext(x,left?'SCRUB! '+left+' LEFT':'SPARKLING!',8,60,'#ffd84a'); timeBar(x,1-G.t/G.dur);
  if(!left&&!G.doneAt) G.doneAt=G.t; if(G.doneAt&&G.spa){ const k=Math.min(1,(G.t-G.doneAt)/1); rect(x,112,196-k*0,8,6,'#3a7aff'); rect(x,114,202,4,6,'#3a7aff'); }
  if((G.doneAt&&G.t-G.doneAt>(G.spa?1.2:.5))||G.t>=G.dur) endCare(G,1-G.spots.reduce((s,p)=>s+p.d,0)/G.spots.length,'SQUEAKY CLEAN!');
}

/* ---------- Play: tug of war ---------- */
PK_ACT.play=()=>{ const P=S.pet; petTick(); if(Date.now()-(P.playAt||0)<20*60e3){ toast(P.name+' is tired — play again in a bit','loss'); return; }
  P.playAt=Date.now(); save(); kenCard(null); KEN.mode='game'; KEN.game={kind:'tug',t:0,dur:8,pos:0,taps:0}; kenHud(); };
PK_ACT.tug=()=>{ const G=KEN.game; if(!G||G.kind!=='tug'||G.over) return; G.pos=Math.min(1,G.pos+.075); G.taps++; tone(500+G.pos*400,.03,'square',.03); };
function tugStep(x,G,t,dt){ const P=S.pet; G.t+=dt; if(!G.over){ G.pos-=dt*(.32+.004*petLv('agility')); G.pos=Math.max(-1,G.pos); if(G.pos>=1||G.pos<=-1||G.t>=G.dur){ G.over=G.pos>=1?'win':G.pos<=-1?'lose':G.pos>0?'win':'lose'; G.endT=G.t; } }
  const cx=96+G.pos*40; rect(x,0,238,cx-14,2,'#c8a45c'); rect(x,cx-14,236,6,6,'#e0203a');   // rope + knot
  rect(x,6,226,8,16,'#e0b48a'); petPose(x,P,cx+22,256,4,t,G.over==='lose'?'jump':'run',(t*2)%1);
  rect(x,70,80,52,10,'#120a06'); rect(x,96-1,78,2,14,'#ffd84a'); rect(x,96+G.pos*25-2,80,4,10,'#3ad08a');
  ptext(x,G.over?(G.over==='win'?'YOU WIN!':P.name.toUpperCase()+' WINS!'):'TAP TAP TAP!',50,60,'#ffd84a'); timeBar(x,1-Math.min(1,G.t/G.dur));
  if(G.over&&G.t-G.endT>1.2){ const P2=S.pet, gain=G.over==='win'?22:10; P2.happy=Math.min(100,P2.happy+gain); save(); KEN.game=null; KEN.mode='home'; for(let i=0;i<5;i++) setTimeout(()=>petFx('♥'),i*120);
    kenCard(`<div class="gf-k">${G.over==='win'?'🏆 YOU WON THE TUG!':'🐾 '+esc(P2.name.toUpperCase())+' WON!'}</div><div class="gf-big">+${gain} <small>😊</small></div><div class="gf-row"><button class="lg-btn" data-pk="home">YAY</button></div>`); kenHud(); } }

/* ---------- Obedience: Simon says, harder as it levels up ---------- */
const CMD_ICON={SIT:'⬇️',PAW:'🐾',ROLL:'🔄',SPEAK:'🗣️',SPIN:'🌀',BEG:'🙏'};
const cmdPool=()=>{ const L=petLv('obedience'); return ['SIT','PAW','ROLL','SPEAK'].concat(L>=15?['SPIN']:[],L>=30?['BEG']:[]); };
memNext=function(){ const G=KEN.game, L=petLv('obedience'), pool=cmdPool(); G.round++; G.maxRounds=5+Math.floor(L/10);
  G.seq=Array.from({length:2+Math.floor(L/10)+G.round},()=>pool[Math.floor(Math.random()*pool.length)]); G.pos=0; G.phase='show'; G.showT=0; G.step=Math.max(.38,.85-L*.009); G.pose=null; kenCard(null); kenHud(); };
memAnswer=function(cmd){ const G=KEN.game; if(!G||G.phase!=='input') return;
  if(cmd===G.seq[G.pos]){ G.pos++; G.pose={cmd,t:0}; tone(660+G.pos*60,.05,'square',.04);
    if(G.pos>=G.seq.length){ G.xp+=4*G.seq.length; tone(988,.1,'square',.05); G.phase='good'; G.goodT=0; kenHud(); } }
  else { tone(200,.2,'sawtooth',.04); G.phase='bad'; G.goodT=0; G.pose={cmd:'oops',t:0}; kenHud(); } };
function memStep(x,G,t,dt){ const P=S.pet;
  if(G.phase==='show'){ G.showT+=dt; const i=Math.floor(G.showT/G.step), k=(G.showT%G.step)/G.step;
    if(i>=G.seq.length){ G.phase='input'; kenHud(); }
    else { const c=G.seq[i]; petPose(x,P,96,250,5,t,c.toLowerCase(),Math.min(1,k*1.6)); const lbl=CMD_ICON[c]?c:c; rect(x,96-ptextW(lbl)-6,120,ptextW(lbl)*2+12,20,'#1a1006'); ptext(x,lbl,96-ptextW(lbl),126,'#ffd84a',2); ptext(x,(i+1)+' OF '+G.seq.length,74,150,'#f3ead8'); } }
  else { if(G.pose) G.pose.t+=dt; const pk=G.pose?Math.min(1,G.pose.t/.5):0;
    petPose(x,P,96,250,5,t,G.pose&&G.pose.cmd!=='oops'&&pk<1?G.pose.cmd.toLowerCase():'idle',pk);
    if(G.phase==='input') ptext(x,G.pos+' OF '+G.seq.length,80,126,'#f3ead8');
    if(G.phase==='good'||G.phase==='bad'){ G.goodT+=dt; ptext(x,G.phase==='good'?'GOOD '+(P.species==='cat'?'KITTY':'BOY')+'!':'OOPS!',62,126,G.phase==='good'?'#3ad08a':'#e0203a');
      if(G.goodT>1){ if(G.phase==='bad'||G.round>=G.maxRounds) trainEnd(); else memNext(); } } }
  ptext(x,'ROUND '+G.round,8,60,'#ffd84a');
}
// Agility and tricks: the meter speeds up as your pet levels up.
const _trainStartG=trainStart;
trainStart=function(k){ _trainStartG(k); const G=KEN.game; if(!G||G.kind!=='meter') return; const s=(petLv(k)-1)/49; G.per=.8*(1-.4*s); G.perfect=.09; G.good=.38;
  const z=KEN.el.querySelectorAll('.pk-meter i'), g=G.perfect*100, y=(G.good-G.perfect)*50, r=50-g/2-y; let left=0; [r,y,g,y,r].forEach((w,i)=>{ z[i].style.left=left+'%'; z[i].style.width=w+'%'; left+=w; }); };

/* ---------- Shows: runway, judges, then results ---------- */
showEnter=async function(){ const P=S.pet, fee=showFee(); if(fee>S.bank){ toast('Not enough in the bankroll','loss'); return; }
  const score=petScore(); let r=null; try{ r=await srpc('fg_pet_show',{p_pet:{species:P.species,breed:P.breed,name:P.name,tier:P.tier||0},p_score:score}); }catch(e){}
  if(!r||r.error){ toast(r&&r.error==='entered'?'You’ve already entered today':'Couldn’t reach the show','loss'); if(r&&r.error==='entered'){ P.showDay=dayKey(); save(); } return; }
  setBank(-fee); S.spent=(S.spent||0)+fee; P.showDay=dayKey(); save();
  const all=(r.field||[]).map(x=>Object.assign({},x)).concat(showNpcs(P.species)).sort((a,b)=>b.score-a.score), place=all.findIndex(x=>x.me)+1, prize=Math.round(fee*({1:6,2:3,3:1.5}[place]||0));
  const top=Math.max(1,all[0].score), base=Math.max(3,Math.min(10,Math.round(score/top*10)));
  kenCard(null); KEN.mode='game'; KEN.game={kind:'show',t:0,place,prize,field:r.field||[],judges:[0,1,2].map(()=>Math.max(1,Math.min(10,base+Math.round((Math.random()-.5)*2))))}; kenHud(); };
function showStep(x,G,t,dt){ const P=S.pet; G.t+=dt;
  rect(x,0,0,PW,200,'#3a0a14'); for(let i=0;i<PW;i+=12) rect(x,i,0,6,200,'#5a1020'); rect(x,0,196,PW,6,'#c8a45c');
  x.globalAlpha=.18; for(let yy=40;yy<300;yy++){ const w=(yy-40)*.45; rect(x,96-w,yy,w*2,1,'#fff3b0'); } x.globalAlpha=1;
  const walk=Math.min(1,G.t/2.2), px=-20+walk*116; petPose(x,P,px,262,4,t,walk<1?'run':(G.t>4.2&&G.place<=3?'jump':'idle'),(t*1.5)%1);
  G.judges.forEach((s,i)=>{ const jx=30+i*56, flip=G.t-2.4-i*.45; rect(x,jx,212,26,22,'#2a1d15'); rect(x,jx+9,206,8,8,'#e0b48a');
    if(flip>0){ rect(x,jx+3,186,20,18,'#ffffff'); ptext(x,String(s),jx+(s>9?6:10),192,'#16161c'); if(flip<.1) tone(600+s*40,.05,'square',.04); } });
  if(G.t>4.2){ const txt=G.place===1?'BEST IN SHOW!':'#'+G.place+' PLACE'; ptext(x,txt,96-ptextW(txt),40,G.place<=3?'#ffd84a':'#f3ead8',2); if(!G.boom&&G.place<=3){ G.boom=1; try{ fx.confetti(G.place===1?160:60); }catch(e){} } }
  if(G.t>5.6){ const P2=S.pet; KEN.game=null; KEN.mode='home';
    if(G.prize){ setBank(G.prize); if(typeof gainXP==='function') gainXP({1:100,2:60,3:30}[G.place],'Pet show',false); }
    P2.shows=(P2.shows||0)+1; if(G.place===1) P2.wins=(P2.wins||0)+1; save(); kenShow().then(()=>showField(G.field));
    celebrate(G.place===1?'🏆 Best in Show!':G.place<=3?'🎀 Ribbon winner!':'🐾 Thanks for showing!',`${P2.name} placed #${G.place}.`,G.prize?'+'+fmt$(G.prize):'Train and try again tomorrow'); kenHud(); } }

/* ---------- Upgrades: a glow-up ---------- */
PK_ACT.upGo=()=>{ const P=S.pet, nx=PET_UP[(P.tier||0)+1]; if(!nx) return; const pr=nx.price(); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
  setBank(-pr); S.spent=(S.spent||0)+pr; kenCard(null); KEN.mode='game'; KEN.game={kind:'glow',t:0,to:(P.tier||0)+1}; kenHud(); };
function glowStep(x,G,t,dt){ const P=S.pet; G.t+=dt; const k=Math.min(1,G.t/2.4);
  for(let i=0;i<16;i++){ const a=i/16*Math.PI*2+t; x.globalAlpha=.25+.25*Math.sin(t*6+i); for(let r=10;r<90*k;r+=3) rect(x,96+Math.cos(a)*r,226+Math.sin(a)*r,2,2,`hsl(${(i*22+t*200)%360},100%,65%)`); } x.globalAlpha=1;
  const show=Object.assign({},P,{tier:G.t>1.6?G.to:P.tier}); petPose(x,show,96,250,5,t,'spin',(G.t*1.2)%1);
  if(G.t>1.6&&!G.flash){ G.flash=1; [523,659,784,1047,1319].forEach((f,i)=>tone(f,.12,'square',.05,i*.09)); try{ fx.confetti(200); fx.coins(80,2000); }catch(e){} }
  if(G.t>3){ P.tier=G.to; save(); KEN.game=null; KEN.mode='home'; kenHud(); celebrate('✨ '+PET_TIERS[P.tier]+' '+P.name+'!',P.tier>=2?'A rainbow on four legs.':'Glowing from nose to tail.','Show score ×'+[1,1.5,2.25][P.tier]); } }

/* ---------- Shared bits ---------- */
function timeBar(x,f){ rect(x,8,70,176,4,'#120a06'); rect(x,8,70,Math.max(0,176*f),4,f>.3?'#3ad08a':'#e0203a'); }
function endCare(G,rate,msg){ if(G.ended) return; G.ended=1; const P=S.pet, eff=G.it[3], k=.6+.4*Math.max(0,Math.min(1,rate));
  const got={}; for(const [s,v] of Object.entries(eff)){ const add=Math.round(v*k); P[s]=Math.min(100,P[s]+add); got[s]=add; } if(rate>=.9) P.happy=Math.min(100,P.happy+5);
  if(G.it[4]==='ribbon') P.ribbonUntil=Date.now()+864e5; save(); KEN.game=null; KEN.mode='home'; for(let i=0;i<4;i++) setTimeout(()=>petFx('♥'),i*120);
  kenCard(`<div class="gf-k">${msg}</div><div class="tchips">${Object.entries(got).map(([s,v],i)=>`<span style="--d:${i*80}ms">${{hunger:'🍖',clean:'🛁',happy:'😊'}[s]} +${v}</span>`).join('')}${rate>=.9?'<span>⭐ PERFECT +5 😊</span>':''}</div><div class="gf-row"><button class="lg-btn lg-gold" data-pk="home">YAY</button></div>`); kenHud(); }

const _kenDrawG=kenDraw;
kenDraw=function(t,dt){ const G=KEN.game; if(!G||!PG_KINDS.has(G.kind)) return _kenDrawG(t,dt);
  const x=KEN.ctx; kenBg(x); KEN.el.querySelector('.pk-meter').style.display='none';
  ({feed:feedStep,scrub:scrubStep,tug:tugStep,memory:memStep,show:showStep,glow:glowStep})[G.kind](x,G,t,dt);
  KEN.fx=KEN.fx.filter(f=>(f.t+=dt)<1.2); for(const f of KEN.fx) ptext(x,'+',f.x,f.y-f.t*50,'#ff6a8a'); };
const _kenHudG=kenHud;
kenHud=function(){ _kenHudG(); const G=KEN.game; if(!KEN.el||!G||!PG_KINDS.has(G.kind)) return; const g=KEN.el.querySelector('.pk-grid');
  g.innerHTML=G.kind==='tug'?'<button class="gf-swing pk-tug" data-pk="tug">💪 TUG!</button>':G.kind==='feed'?'<div class="pk-hint">👆 SLIDE THE BOWL</div>':G.kind==='scrub'?'<div class="pk-hint">👆 RUB THE MUD OFF</div>':G.kind==='memory'?(G.phase==='input'?`<div class="pk-cmds">${cmdPool().map(c=>`<button class="lg-btn lg-gold" data-pk="cmd" data-v="${c}">${CMD_ICON[c]} ${c}</button>`).join('')}</div>`:'<div class="pk-hint">👀 WATCH…</div>'):''; };
// Touch on the stage: slide the bowl, scrub, or tug.
const _openKennelG=openKennel;
openKennel=function(){ _openKennelG(); const c=KEN.c; if(!c||c._pg) return; c._pg=1;
  const at=e=>{ const r=c.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*PW,(e.clientY-r.top)/r.height*PH]; };
  c.addEventListener('pointerdown',e=>{ PGT.down=true; PGT.ptr=at(e); const G=KEN.game; if(G&&G.kind==='feed') G.tx=PGT.ptr[0]; if(G&&G.kind==='tug') PK_ACT.tug(); });
  c.addEventListener('pointermove',e=>{ PGT.ptr=at(e); const G=KEN.game; if(G&&G.kind==='feed') G.tx=PGT.ptr[0]; });
  addEventListener('pointerup',()=>{ PGT.down=false; }); c.style.touchAction='none'; };
