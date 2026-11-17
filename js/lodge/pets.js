// 🐶🐱 Pets and the Kennel Club (the Pets button in the lodge).
//  • Adopt a puppy or a kitty (four breeds each) and name it. It follows you around the lodge and your rooms,
//    and visitors see it in your room.
//  • Take care of it: hunger, cleanliness and happiness drop over real time. Buy food at the grocery, take it to the
//    groomer, play with it. All of that costs money, and it scales with your net worth.
//  • Train it with mini games: Agility (jump the hurdles), Tricks (catch the frisbee), Obedience (repeat the commands).
//  • Enter the daily dog or cat show against other players' pets and the lodge regulars (supabase/update-21-pets.sql).
//    Show score = training levels × condition × upgrade tier.
//  • Upgrade to Neon (glows) and Mega Neon (rainbow): expensive, and they need training first.

/* ---------- Breeds and art ---------- */
const PET_BREEDS={
  dog:{golden:{name:'Golden retriever',b:'#d9a24a',d:'#a8742a'},husky:{name:'Husky',b:'#cfd6dc',d:'#4a5560'},pug:{name:'Pug',b:'#e0c79a',d:'#3a2a20'},
       dalmatian:{name:'Dalmatian',b:'#f3efe6',d:'#16161c',s:'#16161c',spots:[[3,4],[6,5],[8,4],[2,6],[5,6],[9,1]]}},
  cat:{tabby:{name:'Tabby',b:'#d98a3a',d:'#8a4a1a',s:'#8a4a1a',spots:[[3,4],[3,5],[5,4],[5,5],[7,4],[7,5]]},siamese:{name:'Siamese',b:'#efe2c8',d:'#5a3a2a'},
       black:{name:'Black cat',b:'#2a2a30',d:'#16161c',e:'#ffd84a'},calico:{name:'Calico',b:'#f3efe6',d:'#d98a3a',s:'#2a2a30',spots:[[3,4],[4,4],[7,5],[8,5],[2,6]]}},
};
const PET_ART={
  dog:{top:['........dd..','.......dbbb.','.......bbebn','b......bbbb.','.bbbbbbbbb..','.bbbbbbbbb..','.bbbbbbbbb..'],legs:[['.b.b...b.b..','.b.b...b.b..'],['..b.b...b.b.','.b...b.b...b']]},
  cat:{top:['.......d..d.','.......bbbb.','.......bebe.','b......bbnb.','b.bbbbbbbb..','.bbbbbbbbb..','..bbbbbbbb..'],legs:[['..b.b..b.b..','..b.b..b.b..'],['...b.b.b..b.','..b...bb.b..']]},
};
const PET_TIERS=['','Neon','Mega Neon'];
function petGrid(sp,frame){ const A=PET_ART[sp]||PET_ART.dog; return A.top.concat(A.legs[frame?1:0]); }
const PET_SPR={};
function petSprite(pet,frame){
  const key=pet.species+pet.breed+frame; if(PET_SPR[key]) return PET_SPR[key];
  const B=(PET_BREEDS[pet.species]||PET_BREEDS.dog)[pet.breed]||{b:'#d9a24a',d:'#a8742a'}, pal={b:B.b,d:B.d,e:B.e||'#16161c',n:'#3a2a2a'};
  const g=petGrid(pet.species,frame), c=document.createElement('canvas'); c.width=12; c.height=g.length; const x=c.getContext('2d');
  g.forEach((r,y)=>[...r].forEach((ch,xx)=>{ if(ch!=='.'){ x.fillStyle=pal[ch]||pal.b; x.fillRect(xx,y,1,1); } }));
  if(B.spots){ x.fillStyle=B.s; for(const [sx,sy] of B.spots) if(g[sy]&&g[sy][sx]==='b') x.fillRect(sx,sy,1,1); }
  const outline=[]; g.forEach((r,y)=>[...r].forEach((ch,xx)=>{ if(ch!=='.') return; const on=(a,b)=>g[b]&&g[b][a]&&g[b][a]!=='.'; if(on(xx-1,y)||on(xx+1,y)||on(xx,y-1)||on(xx,y+1)) outline.push([xx,y]); }));
  c.outline=outline; return PET_SPR[key]=c;
}
// Draw a pet with its feet at (x, y), facing right (1) or left (-1), at a whole-pixel scale.
function drawPet(ctx,pet,x,y,face,t,frame,sc){
  if(!pet) return; sc=sc||1; const spr=petSprite(pet,frame||0), W=12*sc, H=spr.height*sc, X=Math.round(x-W/2), Y=Math.round(y-H);
  ctx.save(); if(face<0){ ctx.translate(X+W,Y); ctx.scale(-1,1); } else ctx.translate(X,Y);
  if(pet.tier){ const pulse=.55+.45*Math.sin(t*4);
    spr.outline.forEach(([px,py],i)=>{ const hue=pet.tier>=2?((px+py)*24+t*160)%360:(pet.species==='cat'?290:180);
      ctx.fillStyle=`hsla(${hue},100%,${pet.tier>=2?60:62}%,${pulse})`; ctx.fillRect(px*sc,py*sc,sc,sc); }); }
  ctx.imageSmoothingEnabled=false; ctx.drawImage(spr,0,0,W,H);
  if(pet.tier>=2&&Math.sin(t*7)>.6){ ctx.fillStyle='#ffffff'; ctx.fillRect(((t*13|0)%12)*sc,0,sc,sc); }
  ctx.restore();
}

/* ---------- Care: stats fall over real time ---------- */
const PET_DECAY={hunger:4,clean:2.5,happy:3};   // points per hour
function petTick(){ const P=S.pet; if(!P) return; const now=Date.now(), h=Math.max(0,(now-(P.t||now))/36e5); P.t=now;
  for(const k in PET_DECAY) P[k]=Math.max(0,Math.min(100,(P[k]??80)-PET_DECAY[k]*h)); }
const petCond=()=>{ const P=S.pet; return P?(P.hunger+P.clean+P.happy)/300:0; };
const petUnit=()=>nice(Math.max(2000,cashNow()*.002*starOff()));
const PET_FOOD=[['kibble','🥣 Kibble',1,{hunger:35}],['chicken','🍗 Chicken',3,{hunger:70,happy:10}],['steak','🥩 Steak dinner',8,{hunger:100,happy:25}],['treats','🦴 Treats',2,{happy:25,hunger:5}]];
const PET_GROOM=[['bath','🛁 Bath',2,{clean:60}],['spa','✨ Full spa day',6,{clean:100,happy:20},'ribbon']];
const petNeed=L=>20+10*(L-1);
function petLvOf(xp){ let L=1,left=xp||0; while(L<50&&left>=petNeed(L)){ left-=petNeed(L); L++; } return {L,into:left,need:L<50?petNeed(L):0}; }
const petLv=k=>petLvOf(S.pet&&S.pet.skills&&S.pet.skills[k]).L;
const PET_SKILLS={agility:'🏃 Agility',tricks:'🥏 Tricks',obedience:'🐾 Obedience'};
const petRibbon=()=>S.pet&&(S.pet.ribbonUntil||0)>Date.now();
function petScore(){ const P=S.pet; if(!P) return 0; petTick();
  return Math.round((petLv('agility')+petLv('tricks')+petLv('obedience'))*10*(.5+.5*petCond())*[1,1.5,2.25][P.tier||0]*(petRibbon()?1.1:1)); }
const petAdoptPrice=()=>nice(Math.max(50000,cashNow()*.02*starOff()));
const PET_UP=[null,{need:10,price:()=>nice(Math.max(1e6,cashNow()*.2*starOff()))},{need:30,price:()=>nice(Math.max(1e7,cashNow()*.5*starOff()))}];

/* ---------- The Kennel Club screen ---------- */
const KEN={el:null,c:null,ctx:null,loop:null,mode:'home',game:null,fx:[]};
function kenDom(){
  if(KEN.el) return;
  const el=document.createElement('div'); el.id='kennel'; el.className='golf';
  el.innerHTML=`<div class="gf-col">
    <div class="gf-top"><button class="lg-btn lg-round" data-pk="quit" aria-label="Leave the Kennel Club">X</button><span class="gf-hole pk-title">KENNEL CLUB</span><span class="gf-tot pk-bank"></span></div>
    <div class="gf-stage"><div class="gf-card pk-card"></div></div>
    <div class="gf-bot"><div class="pk-bars"></div>
      <div class="gf-meter pk-meter" data-pk="hit" style="display:none"><i class="r"></i><i class="y"></i><i class="g"></i><i class="y"></i><i class="r"></i><b class="gf-mark"></b></div>
      <div class="pk-grid"></div></div></div>`;
  document.body.appendChild(el); KEN.el=el;
  const {c,ctx}=makeCanvas(el.querySelector('.gf-stage')); KEN.c=c; KEN.ctx=ctx; KEN.loop=makeLoop(kenDraw);
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-pk]'); if(!b||b.disabled) return; e.stopPropagation(); PK_ACT[b.dataset.pk]&&PK_ACT[b.dataset.pk](b); });
}
function kenCard(html){ const c=KEN.el.querySelector('.pk-card'); if(html==null){ c.classList.remove('on'); return; } c.innerHTML=`<div class="gf-card-in pk-in">${html}</div>`; c.classList.add('on'); }
function kenHud(){
  const P=S.pet; KEN.el.querySelector('.pk-bank').textContent=k$(S.bank);
  KEN.el.querySelector('.pk-title').textContent=P?(PET_TIERS[P.tier||0]+' '+P.name).trim().toUpperCase():'KENNEL CLUB';
  const bar=(icon,v)=>`<span><b>${icon}</b><i><u style="width:${Math.round(v)}%;background:${v<25?'#e0203a':v<55?'#d0a020':'#3ad08a'}"></u></i></span>`;
  KEN.el.querySelector('.pk-bars').innerHTML=P?`${bar('🍖',P.hunger)}${bar('🛁',P.clean)}${bar('😊',P.happy)}<span class="pk-score">🏆 ${petScore()}</span>`:'';
  const g=KEN.el.querySelector('.pk-grid'), inGame=KEN.mode==='game';
  g.innerHTML=!P?'':inGame?`<button class="gf-swing" data-pk="hit">${KEN.game&&KEN.game.kind==='memory'?'WATCH…':'GO!'}</button>`
    :[['grocery','🛒 GROCERY'],['groomer','✂️ GROOMER'],['play','🎾 PLAY'],['train','🏋️ TRAIN'],['show','🏆 SHOW'],['upgrade','✨ UPGRADE']].map(([k,t])=>`<button class="lg-btn" data-pk="${k}">${t}</button>`).join('');
  KEN.el.querySelector('.pk-meter').style.display=inGame&&KEN.game&&KEN.game.kind==='meter'?'':'none';
}
function openKennel(){ kenDom(); petTick(); KEN.mode='home'; KEN.game=null; KEN.el.classList.add('on'); document.body.classList.add('in-golf');
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop();
  if(!S.pet) kenAdopt(); else kenCard(null); kenHud(); KEN.loop.start(); }
function closeKennel(){ if(!KEN.el) return; KEN.loop.stop(); KEN.el.classList.remove('on'); document.body.classList.remove('in-golf'); KEN.game=null; save();
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start(); else render(); }

// Adopting
let ADOPT={species:'dog',breed:'golden'};
function kenAdopt(){
  const sp=ADOPT.species, list=PET_BREEDS[sp];
  kenCard(`<div class="gf-k">ADOPT A ${sp==='dog'?'PUPPY':'KITTY'}</div>
    <div class="gf-row"><button class="lg-btn ${sp==='dog'?'lg-gold':''}" data-pk="adoptSp" data-v="dog">🐶 PUPPY</button><button class="lg-btn ${sp==='cat'?'lg-gold':''}" data-pk="adoptSp" data-v="cat">🐱 KITTY</button></div>
    <div class="pk-breeds">${Object.entries(list).map(([k,b])=>`<button class="pk-breed ${k===ADOPT.breed?'on':''}" data-pk="adoptBr" data-v="${k}"><i style="background:${b.b};box-shadow:inset -6px 0 0 ${b.d}"></i>${esc(b.name.toUpperCase())}</button>`).join('')}</div>
    <input class="pk-name" id="pkName" maxlength="14" placeholder="NAME" value="${esc(ADOPT.name||'')}">
    <button class="lg-btn lg-gold" data-pk="adoptGo">ADOPT · ${k$(petAdoptPrice())}</button>
    <div class="tchips"><span style="--d:0ms">🍖 Feed</span><span style="--d:70ms">🛁 Bathe</span><span style="--d:140ms">🎾 Play</span><span style="--d:210ms">🏆 Show</span></div>`);
}

// Training games
function kenTrain(){
  kenCard(`<div class="gf-k">TRAINING · costs a little hunger and a bath</div>${Object.entries(PET_SKILLS).map(([k,t])=>{ const L=petLvOf(S.pet.skills&&S.pet.skills[k]);
    return `<button class="rg-game" data-pk="trainGo" data-v="${k}"><b>${t.toUpperCase()} · LV ${L.L}</b><small>${k==='agility'?'Tap GO as it lines up to jump each hurdle.':k==='tricks'?'Tap GO to catch the frisbee in the green.':'Watch the commands, then repeat them in order.'}</small><small class="gold">${L.L<50?L.into+' / '+L.need+' XP':'MAX'}</small></button>`; }).join('')}
    <div class="tchips"><span style="--d:0ms">🍖 Fed</span><span style="--d:70ms">🛁 Clean</span><span style="--d:140ms">😊 Happy</span><span style="--d:210ms">= ⚡ faster</span></div><div class="gf-row"><button class="lg-btn" data-pk="home">BACK</button></div>`);
}
function trainStart(k){
  const P=S.pet; if(P.hunger<10){ toast(P.name+' is too hungry to train','loss'); return; }
  kenCard(null); KEN.mode='game';
  if(k==='obedience'){ KEN.game={kind:'memory',skill:k,round:0,seq:[],pos:0,phase:'show',showT:0,xp:0}; memNext(); }
  else { const L=petLv(k), s=(L-1)/49; KEN.game={kind:'meter',skill:k,round:0,max:5,xp:0,t:0,p:0,perfect:.08+.08*s,good:.36+.16*s,per:.75*(1+.4*s),anim:null};
    const z=KEN.el.querySelectorAll('.pk-meter i'), g=KEN.game.perfect*100, y=(KEN.game.good-KEN.game.perfect)*50, r=50-g/2-y; let left=0; [r,y,g,y,r].forEach((w,i)=>{ z[i].style.left=left+'%'; z[i].style.width=w+'%'; left+=w; }); }
  kenHud();
}
const MEM_CMDS=['SIT','PAW','ROLL','SPEAK'];
function memNext(){ const G=KEN.game; G.round++; G.seq=Array.from({length:2+G.round},()=>MEM_CMDS[Math.floor(Math.random()*4)]); G.pos=0; G.phase='show'; G.showT=0; kenHud(); }
function memAnswer(cmd){ const G=KEN.game; if(!G||G.phase!=='input') return;
  if(cmd===G.seq[G.pos]){ G.pos++; tone(660+G.pos*60,.05,'square',.04); petFx('♥');
    if(G.pos>=G.seq.length){ G.xp+=4*G.seq.length; tone(988,.1,'square',.05); if(G.round>=6) return trainEnd(); memNext(); } }
  else { tone(200,.2,'sawtooth',.04); trainEnd(); } }
function meterHit(){ const G=KEN.game; if(!G||G.kind!=='meter'||G.anim) return;
  const d=Math.abs(G.p-.5)*2, q=d<G.perfect?'perfect':d<G.good?'good':'miss'; G.xp+=q==='perfect'?12:q==='good'?6:1;
  G.anim={q,t:0}; tone(q==='miss'?200:q==='good'?660:988,.08,'square',.05); if(q!=='miss') petFx(q==='perfect'?'★':'♥'); }
function trainEnd(){ const G=KEN.game, P=S.pet; KEN.mode='home'; KEN.game=null;
  const xp=Math.max(1,Math.round(G.xp*(.4+.6*petCond()))); P.skills=P.skills||{}; const before=petLv(G.skill);
  P.skills[G.skill]=(P.skills[G.skill]||0)+xp; P.hunger=Math.max(0,P.hunger-6); P.clean=Math.max(0,P.clean-4); P.happy=Math.min(100,P.happy+5); save();
  if(typeof gainXP==='function') gainXP(5,'Pet training');
  const after=petLv(G.skill);
  kenCard(`<div class="gf-k">${PET_SKILLS[G.skill].toUpperCase()}</div><div class="gf-big">+${xp} <small>XP</small></div>${after>before?`<div class="gf-k gold">LEVEL ${after}!</div>`:`<div class="gf-k">LEVEL ${after}</div>`}
    <div class="gf-row"><button class="lg-btn lg-gold" data-pk="trainGo" data-v="${G.skill}">AGAIN</button><button class="lg-btn" data-pk="train">OTHER TRAINING</button><button class="lg-btn" data-pk="home">DONE</button></div>`); kenHud(); }

// Shows
const SHOW_NPC={dog:['Duchess','Sir Woofs','Maple','Captain','Biscotti','Juniper','Rocket','Lady Fluff','Bear'],cat:['Duchess','Whiskers','Mittens','Velvet','Shadow','Marmalade','Pickles','Sir Purr','Luna']};
const SHOW_LADDER=[60,140,300,550,900,1400,2100,3000,4200];
function showNpcs(sp){ const day=Math.floor(Date.now()/864e5), r=prng(day*7+(sp==='cat'?3:1)), br=Object.keys(PET_BREEDS[sp]), names=SHOW_NPC[sp].slice();
  return SHOW_LADDER.filter(()=>r()<.8).map(v=>({owner:'Lodge regular',pet:{name:names.splice(Math.floor(r()*names.length),1)[0],breed:br[Math.floor(r()*br.length)],species:sp,tier:v>2000?2:v>900?1:0},score:Math.round(v*(.85+r()*.3)),npc:true})); }
const showFee=()=>nice(Math.max(10000,cashNow()*.01));
async function kenShow(){
  const P=S.pet, today=dayKey(), entered=P.showDay===today;
  kenCard(`<div class="gf-k">TODAY’S ${P.species.toUpperCase()} SHOW</div><div class="gf-big">${petScore()} <small>pts</small></div>
    <div class="tchips"><span style="--d:0ms">🏋️ Training</span><span style="--d:70ms">😊 Condition</span><span style="--d:140ms">✨ ${PET_TIERS[P.tier||0]||'Normal'}</span><span style="--d:210ms">${petRibbon()?'🎀 Spa':''}</span></div>
    ${entered?'<div class="gf-k">YOU’VE ENTERED TODAY</div>':`<button class="lg-btn lg-gold" data-pk="showGo">ENTER · ${k$(showFee())}</button><div class="tchips"><span style="--d:0ms">🥇 6×</span><span style="--d:70ms">🥈 3×</span><span style="--d:140ms">🥉 1.5×</span><span style="--d:210ms">1 / day</span></div>`}
    <div class="pk-field">Loading the field…</div><div class="gf-row"><button class="lg-btn" data-pk="home">BACK</button></div>`);
  let f=[]; try{ f=await srpc('fg_pet_field',{p_species:P.species})||[]; }catch(e){}
  showField(Array.isArray(f)?f:[]);
}
function showField(field){ const box=KEN.el.querySelector('.pk-field'); if(!box) return null;
  const all=field.map(x=>Object.assign({},x)).concat(showNpcs(S.pet.species)).sort((a,b)=>b.score-a.score);
  box.innerHTML=all.slice(0,12).map((x,i)=>`<div class="${x.me?'me':''}"><b>${i+1}.</b> ${esc(x.pet.name)} <small>${esc(x.npc?'regular':x.owner)}${x.pet.tier?' · '+PET_TIERS[x.pet.tier]:''}</small><span>${x.score}</span></div>`).join('');
  return all; }
async function showEnter(){ const P=S.pet, fee=showFee(); if(fee>S.bank){ toast('Not enough in the bankroll','loss'); return; }
  const score=petScore(); let r=null; try{ r=await srpc('fg_pet_show',{p_pet:{species:P.species,breed:P.breed,name:P.name,tier:P.tier||0},p_score:score}); }catch(e){}
  if(!r||r.error){ toast(r&&r.error==='entered'?'You’ve already entered today':'Couldn’t reach the show','loss'); if(r&&r.error==='entered'){ P.showDay=dayKey(); save(); } return; }
  setBank(-fee); S.spent=(S.spent||0)+fee; P.showDay=dayKey(); save(); await kenShow();
  const all=showField(r.field||[]), place=all?all.findIndex(x=>x.me)+1:0, prize=Math.round(fee*({1:6,2:3,3:1.5}[place]||0));
  if(prize){ setBank(prize); try{ fx.confetti(place===1?160:60); }catch(e){} if(typeof gainXP==='function') gainXP({1:100,2:60,3:30}[place],'Pet show',false); }
  P.shows=(P.shows||0)+1; if(place===1) P.wins=(P.wins||0)+1; save();
  celebrate(place===1?'🏆 Best in Show!':place<=3?'🎀 Ribbon winner!':'🐾 Thanks for showing!',`${P.name} placed #${place} in today’s ${P.species} show.`,prize?'+'+fmt$(prize):'Train more and try again tomorrow'); kenHud(); }

// Upgrades
function kenUpgrade(){ const P=S.pet, t=P.tier||0, nx=PET_UP[t+1];
  if(!nx){ kenCard(`<div class="gf-k">MEGA NEON</div><div class="gf-note">${esc(P.name)} is as dazzling as a pet can get.</div><div class="gf-row"><button class="lg-btn" data-pk="home">BACK</button></div>`); return; }
  const ok=Object.keys(PET_SKILLS).every(k=>petLv(k)>=nx.need);
  kenCard(`<div class="gf-k">UPGRADE TO ${PET_TIERS[t+1].toUpperCase()}</div><div class="tchips"><span style="--d:0ms">${t+1===1?'✨ Glow':'🌈 Rainbow'}</span><span style="--d:70ms">🏆 ×${t+1===1?'1.5':'2.25'} score</span></div>
    ${Object.entries(PET_SKILLS).map(([k,n])=>`<div class="gf-k ${petLv(k)>=nx.need?'gold':''}">${n.toUpperCase()} LV ${petLv(k)} / ${nx.need}</div>`).join('')}
    <button class="lg-btn lg-gold" data-pk="upGo" ${ok?'':'disabled'}>${ok?'UPGRADE · '+k$(nx.price()):'TRAIN EVERY SKILL TO LV '+nx.need}</button><div class="gf-row"><button class="lg-btn" data-pk="home">BACK</button></div>`); }

// Shops
function kenShop(list,title){ const u=petUnit();
  kenCard(`<div class="gf-k">${title}</div>${list.map(([id,n,m,eff])=>`<button class="rg-game" data-pk="buy" data-v="${id}"><b>${n.toUpperCase()} · ${k$(u*m)}</b><small>${Object.entries(eff).map(([k,v])=>({hunger:'🍖',clean:'🛁',happy:'😊'}[k])+' +'+v).join('  ')}</small></button>`).join('')}
    <div class="gf-row"><button class="lg-btn" data-pk="home">BACK</button></div>`); }
function petBuy(id){ const it=PET_FOOD.concat(PET_GROOM).find(x=>x[0]===id); if(!it) return; const pr=petUnit()*it[2];
  if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; } petTick(); setBank(-pr); S.spent=(S.spent||0)+pr;
  for(const [k,v] of Object.entries(it[3])) S.pet[k]=Math.min(100,S.pet[k]+v); if(it[4]==='ribbon') S.pet.ribbonUntil=Date.now()+864e5;
  save(); petFx(id==='bath'||id==='spa'?'✦':'♥'); tone(784,.06,'square',.04); toast(it[1]+' for '+S.pet.name+' · '+k$(pr),'gold'); kenHud(); }

const PK_ACT={
  quit:()=>closeKennel(), home:()=>{ KEN.mode='home'; kenCard(null); kenHud(); },
  adoptSp:b=>{ ADOPT.species=b.dataset.v; ADOPT.breed=Object.keys(PET_BREEDS[b.dataset.v])[0]; ADOPT.name=(KEN.el.querySelector('#pkName')||{}).value; kenAdopt(); },
  adoptBr:b=>{ ADOPT.breed=b.dataset.v; ADOPT.name=(KEN.el.querySelector('#pkName')||{}).value; kenAdopt(); },
  adoptGo:()=>{ const name=((KEN.el.querySelector('#pkName')||{}).value||'').trim().slice(0,14); if(!name){ toast('Give your pet a name','loss'); return; }
    const pr=petAdoptPrice(); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    setBank(-pr); S.spent=(S.spent||0)+pr; S.pet={species:ADOPT.species,breed:ADOPT.breed,name,tier:0,born:Date.now(),t:Date.now(),hunger:80,clean:80,happy:90,skills:{}}; save();
    kenCard(null); kenHud(); try{ fx.confetti(120); }catch(e){} celebrate('🐾 Welcome home, '+name+'!',`Your new ${PET_BREEDS[ADOPT.species][ADOPT.breed].name.toLowerCase()} will follow you around the lodge.`,'Feed, groom, play, train, show'); },
  grocery:()=>kenShop(PET_FOOD,'🛒 GROCERY STORE'), groomer:()=>kenShop(PET_GROOM,'✂️ THE GROOMER'), buy:b=>petBuy(b.dataset.v),
  play:()=>{ const P=S.pet; petTick(); if(Date.now()-(P.playAt||0)<20*60e3){ toast(P.name+' is tired — play again in a bit','loss'); return; }
    P.playAt=Date.now(); P.happy=Math.min(100,P.happy+15); save(); for(let i=0;i<5;i++) setTimeout(()=>petFx('♥'),i*120); tone(988,.06,'square',.04); kenHud(); },
  train:()=>kenTrain(), trainGo:b=>trainStart(b.dataset.v), show:()=>kenShow(), showGo:()=>showEnter(), upgrade:()=>kenUpgrade(),
  upGo:()=>{ const P=S.pet, nx=PET_UP[(P.tier||0)+1]; if(!nx) return; const pr=nx.price(); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    setBank(-pr); S.spent=(S.spent||0)+pr; P.tier=(P.tier||0)+1; save(); try{ fx.confetti(200); fx.coins(80,2000); }catch(e){} [523,659,784,1047,1319].forEach((f,i)=>tone(f,.12,'square',.05,i*.09));
    kenCard(null); kenHud(); celebrate('✨ '+PET_TIERS[P.tier]+' '+P.name+'!',P.tier>=2?'A rainbow on four legs.':'Glowing from nose to tail.','Show score ×'+[1,1.5,2.25][P.tier]); },
  hit:()=>{ const G=KEN.game; if(!G) return; if(G.kind==='meter') meterHit(); },
  cmd:b=>memAnswer(b.dataset.v),
};

/* ---------- Drawing the Kennel Club ---------- */
function petFx(ch){ KEN.fx.push({ch,x:96+(Math.random()-.5)*40,y:170,t:0}); }
function kenDraw(t,dt){
  const x=KEN.ctx, P=S.pet;
  for(let y=0;y<200;y+=8) rect(x,0,y,PW,8,(y/8)%2?'#5a3a28':'#553624'); rect(x,0,196,PW,4,'#c8a45c');
  for(let y=200;y<PH;y+=10) for(let xx=0;xx<PW;xx+=20) rect(x,xx+((y/10)%2)*10,y,20,10,((xx/20+y/10)|0)%2?'#c9b48a':'#bba57a');
  // signs: grocery and groomer on the wall, a ribbon board
  rect(x,10,30,54,30,'#2a6a3a'); ptext(x,'GROCERY',14,40,'#f3ead8'); rect(x,128,30,54,30,'#3a7aa0'); ptext(x,'GROOMER',132,40,'#f3ead8');
  rect(x,72,22,48,40,'#1a1006'); rect(x,72,22,48,2,'#ffd84a'); ptext(x,'SHOWS',82,28,'#ffd84a'); if(P) ptext(x,(P.wins||0)+' WINS',78,42,'#f3ead8');
  if(!P){ return; }
  const G=KEN.game;
  if(!G){ const bounce=Math.abs(Math.sin(t*2))*(P.happy>40?3:0); drawPet(x,P,96,250-bounce,1,t,(t*2|0)%2&&P.happy>40?1:0,5);
    if(petRibbon()){ rect(x,118,212,8,6,'#3a7aff'); rect(x,120,218,4,6,'#3a7aff'); }
    if(P.hunger<25) ptext(x,'HUNGRY!',74,266,'#e0203a'); else if(P.clean<25) ptext(x,'NEEDS A BATH',60,266,'#d0a020'); }
  else if(G.kind==='meter'){ G.t+=dt; const ph=(G.t/G.per)%2; G.p=ph<1?ph:2-ph; const mk=KEN.el.querySelector('.pk-meter .gf-mark'); if(mk&&!G.anim) mk.style.left=(G.p*100)+'%';
    KEN.el.querySelector('.pk-meter').classList.add('on');
    if(G.skill==='agility'){ rect(x,120,226,4,24,'#f3ead8'); rect(x,110,234,24,3,'#e0203a'); }
    let px=70, py=250;
    if(G.anim){ G.anim.t+=dt; const k=Math.min(1,G.anim.t/.8), ok=G.anim.q!=='miss';
      if(G.skill==='agility'){ px=70+k*90; py=250-(ok?Math.sin(k*Math.PI)*34:Math.sin(Math.min(k,.5)*Math.PI)*8); }
      else { py=250-(ok?Math.sin(k*Math.PI)*40:0); const fx2=170-k*90; rect(x,fx2,200-Math.sin(k*Math.PI)*20,8,3,'#ff3a6a'); }
      ptext(x,G.anim.q.toUpperCase()+'!',80,140,G.anim.q==='perfect'?'#ffd84a':G.anim.q==='good'?'#3ad08a':'#e0203a');
      if(k>=1){ G.anim=null; G.round++; if(G.round>=G.max) trainEnd(); } }
    else if(G.skill==='tricks'){ rect(x,160,190,8,3,'#ff3a6a'); }
    drawPet(x,P,px,py,1,t,(t*6|0)%2,4); ptext(x,'ROUND '+Math.min(G.max,G.round+1)+' OF '+G.max,64,100,'#f3ead8'); }
  else if(G.kind==='memory'){ drawPet(x,P,96,250,1,t,0,5);
    if(G.phase==='show'){ G.showT+=dt; const i=Math.floor(G.showT/.8); if(i>=G.seq.length){ G.phase='input'; kenCard(`<div class="gf-k">YOUR TURN · ${G.seq.length} COMMANDS</div><div class="pk-cmds">${MEM_CMDS.map(c=>`<button class="lg-btn lg-gold" data-pk="cmd" data-v="${c}">${c}</button>`).join('')}</div>`); kenHud(); }
      else if(G.showT%.8<.6){ const s=G.seq[i]; rect(x,96-ptextW(s)-6,126,ptextW(s)*2+12,20,'#1a1006'); ptext(x,s,96-ptextW(s),132,'#ffd84a',2); } }
    else ptext(x,G.pos+' OF '+G.seq.length,84,140,'#f3ead8'); }
  KEN.fx=KEN.fx.filter(f=>(f.t+=dt)<1.2); for(const f of KEN.fx){ ptext(x,'+',f.x,f.y-f.t*50,f.ch==='★'?'#ffd84a':'#ff6a8a'); }
}

/* ---------- Your pet follows you; visitors see theirs ---------- */
let PET_FOR;   // set while drawing someone else's room
const PET_TRAIL=new WeakMap();
const _drawPersonP=drawPerson;
drawPerson=function(ctx,who,frame,look,x,y,face){
  if(who==='player'){ const pet=PET_FOR!==undefined?PET_FOR:S.pet;
    if(pet&&pet.species){ const now=performance.now()/1000; let st=PET_TRAIL.get(ctx); const tx=x-face*12, ty=y;
      if(!st||PET_FOR!==undefined){ st={x:tx,y:ty,last:now}; PET_TRAIL.set(ctx,st); }
      const dt=Math.min(.1,now-st.last); st.last=now; const dx=tx-st.x, dy=ty-st.y, mv=Math.hypot(dx,dy)>1; st.x+=dx*Math.min(1,dt*5); st.y+=dy*Math.min(1,dt*5);
      const behind=st.y<y; if(behind) drawPet(ctx,pet,st.x,st.y,dx>.5?1:dx<-.5?-1:face,now,mv?((now*8|0)%2):0,1);
      _drawPersonP(ctx,who,frame,look,x,y,face);
      if(!behind) drawPet(ctx,pet,st.x,st.y,dx>.5?1:dx<-.5?-1:face,now,mv?((now*8|0)%2):0,1); return; } }
  return _drawPersonP(ctx,who,frame,look,x,y,face);
};
const _drawFriendRoomP=drawFriendRoom;
drawFriendRoom=function(cv,d){ PET_FOR=d&&d.pet&&d.pet.species?d.pet:null; try{ _drawFriendRoomP(cv,d); }finally{ PET_FOR=undefined; } };

/* ---------- The Pets button in the lodge ---------- */
const _setHudP=setHud;
setHud=function(mode){ _setHudP(mode); const bar=LODGE.el&&LODGE.el.querySelector('.lg-bottom'); if(!bar) return; let b=document.getElementById('lgPets');
  if(mode!=='room'){ if(!b){ b=document.createElement('button'); b.id='lgPets'; b.className='lg-btn'; b.dataset.lg='petsOpen'; bar.insertBefore(b,document.getElementById('lgLvl')); } petsBtn(); }
  else if(b) b.remove(); };
function petsBtn(){ const b=document.getElementById('lgPets'); if(!b) return; petTick(); const P=S.pet, sad=P&&(P.hunger<25||P.clean<25||P.happy<25);
  const t=P?(P.species==='cat'?'🐱':'🐶')+(sad?'!':''):'Pets'; if(b.textContent!==t) b.textContent=t; }
setInterval(petsBtn,30e3);
Object.assign(LG_ACT,{ petsOpen:()=>openKennel() });
Object.assign(ACT,{ petsOpen:()=>openKennel() });
