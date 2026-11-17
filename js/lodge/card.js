// 👤 Character card: a big view of someone's character with every piece of their outfit named, and their pet.
// Tap the room picture when visiting someone, or tap your level badge in the lodge, to see it.
// Also: watches are drawn as a 2-pixel band, and gear glints now and then so small pieces catch the eye.

const SLOT_NAMES={hat:'Hat',glasses:'Glasses',body:'Coat',scarf:'Scarf',watch:'Watch',acc:'Carrying'};
function charCard(o){
  const out=o.outfit||{}, items=Object.keys(SLOT_NAMES).filter(s=>out[s]&&ITEM[out[s]]).map(s=>`<div class="cc-it"><small>${SLOT_NAMES[s]}</small><b>${esc(ITEM[out[s]].name)}</b>${typeof gearTier==='function'&&gearTier(out[s],o.tiers)?`<span class="cc-tier t${gearTier(out[s],o.tiers)}">${['','Gold','Diamond','Neon'][gearTier(out[s],o.tiers)]}</span>`:''}</div>`).join('');
  const pet=o.pet&&o.pet.species?o.pet:null;
  modal(`<div class="cc"><div class="fgm-k">${esc(o.name||'You')}</div>
    <div class="cc-stage"><canvas class="cc-cv" width="${PW}" height="200"></canvas></div>
    ${o.sub?`<p class="small muted" style="text-align:center;margin:4px 0 8px">${esc(o.sub)}</p>`:''}
    <div class="cc-items">${items||'<p class="small muted">Nothing special on yet.</p>'}</div>
    ${pet?`<div class="cc-pet">${pet.species==='cat'?'🐱':'🐶'} <b>${esc((['','Neon ','Mega Neon '][pet.tier||0])+pet.name)}</b> <small>${esc(((PET_BREEDS[pet.species]||{})[pet.breed]||{}).name||'')}</small></div>`:''}
    <div class="fgm-row">${o.back?'<button class="btn" data-a="ccBack">Back</button>':''}<button class="btn gold" data-a="closeModal">Close</button></div></div>`);
  const cv=document.querySelector('#fgModal .cc-cv'); if(!cv) return; const x=cv.getContext('2d'); x.imageSmoothingEnabled=false;
  const look=o.me&&typeof lodgeLook==='function'?lodgeLook():(typeof lookFor==='function'?lookFor(out):null);
  CC.o=o; CC.look=look; CC.pet=pet; cancelAnimationFrame(CC.raf);
  const draw=()=>{ if(!document.body.contains(cv)) return; const t=performance.now()/1000;
    x.fillStyle='#1a1006'; x.fillRect(0,0,PW,200); for(let i=0;i<PW;i+=12) x.fillStyle=(i/12)%2?'#221408':'#1e1207', x.fillRect(i,0,12,150);
    x.fillStyle='#c8a45c'; x.fillRect(30,176,132,6); x.fillStyle='#7a5a2a'; x.fillRect(36,182,120,10);
    const spr=personSprite('player',Math.sin(t*.8)>.97?'idle1':'idle0',look); x.drawImage(spr,pet?22:54,176-21*7,12*7,21*7);
    gearGlint(x,look,pet?22:54,176-21*7,7,t);
    if(pet) drawPet(x,pet,152,176,-1,t,0,5);
    CC.raf=requestAnimationFrame(draw); };
  draw();
}
const CC={o:null,raf:0};
ACT.ccBack=()=>{ cancelAnimationFrame(CC.raf); const b=CC.o&&CC.o.back; closeModal(); if(b) b(); };
ACT.ccMe=()=>charCard({me:true,name:(PROF.me&&PROF.me.name)||'You',outfit:S.lodge.outfit,pet:S.pet,tiers:S.lodge.tiers,sub:'Level '+myLevel()});

// A glint on gear every few seconds (at any scale). sc = pixels per sprite pixel.
function gearGlint(ctx,look,X,Y,sc,t){
  const g=look&&look._gear; if(!g) return;
  const spots=[]; if(g.watch) spots.push([10.5,13]); if(g.hat) spots.push([5,1]); if(g.glasses) spots.push([8,6]);
  spots.forEach(([sx,sy],i)=>{ const ph=(t*.45+i*.37)%1; if(ph>.12) return; const k=1-Math.abs(ph-.06)/.06, px=X+sx*sc, py=Y+sy*sc, a=Math.max(1,sc*.6);
    ctx.fillStyle=`rgba(255,255,255,${.9*k})`; ctx.fillRect(px-a/2,py-a/2,a,a); ctx.fillRect(px-a*1.5,py-a/6,a*3,a/3); ctx.fillRect(px-a/6,py-a*1.5,a/3,a*3); });
}
// Watches: a 2-pixel band instead of a single dot.
const _drawGearC=drawGear;
drawGear=function(x,gear,frame){ _drawGearC(x,gear,frame); const w=ITEM[gear.watch]; if(w){ x.fillStyle=w.dot; x.fillRect(10,13,2,1); x.fillStyle='rgba(255,255,255,.55)'; x.fillRect(11,13,1,1); } };
// Glints on the character in the lodge and rooms.
const _drawPersonC=drawPerson;
drawPerson=function(ctx,who,frame,look,x,y,face){ _drawPersonC(ctx,who,frame,look,x,y,face);
  if(who==='player'&&look&&look._gear){ const X=Math.round(x-6), Y=Math.round(y-PERSON_H), t=performance.now()/1000;
    if(face<0){ ctx.save(); ctx.translate(X+12,Y); ctx.scale(-1,1); gearGlint(ctx,look,0,0,1,t); ctx.restore(); } else gearGlint(ctx,look,X,Y,1,t); } };

// Tap the room picture on a visit to see their character.
const _visitDrawC=visitDraw;
visitDraw=function(){ _visitDrawC(); const d=HV.data, cv=document.querySelector('#fgModal .hv-room'); if(!d||!cv) return;
  cv.style.cursor='pointer'; cv.title='See their outfit';
  cv.insertAdjacentHTML('afterend',`<button class="cc-open" data-a="ccThem">👤 See ${d.me?'your':esc(d.name)+'’s'} outfit${d.pet&&d.pet.species?' & pet':''}</button>`);
  cv.onclick=()=>ACT.ccThem(); };
ACT.ccThem=()=>{ const d=HV.data; if(!d) return; charCard({name:d.name,outfit:d.outfit,pet:d.pet,tiers:d.tiers,sub:'Level '+levelOf(d.xp||0).L,back:()=>visitDraw()}); };
// Tap your level badge in the lodge.
document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#lgLvl')) ACT.ccMe(); });
