// ✨ Upgrades: anything you own can go Gold → Diamond → Neon (Silas's shop: open something you own).
//  • Each step costs 3×, then 10×, then 30× the item's price. 60% of what you pay counts toward net worth, like buying.
//  • Clothes: your best upgraded piece gives your character an effect everyone sees — gold sparkles, diamond
//    twinkles, or a rainbow neon outline.
//  • Decor: upgraded pieces sparkle, twinkle or glow neon in your rooms (visitors see it too).

const GEAR_TIERS=['','Gold','Diamond','Neon'], GEAR_X=[0,3,10,30];
function gearTier(id,tiers){ const t=(tiers||S.lodge.tiers||{})[id]||0; return tiers?t:(owns(id)?t:0); }
const gearUpPrice=(it,next)=>nice(shopPrice(it)*GEAR_X[next]);

// The shop: an upgrade row on anything you own.
const _renderShopU=renderShop;
renderShop=function(){ _renderShopU(); const it=SHOP.sel&&ITEM[SHOP.sel]; if(!it||SHOP.confirm||!owns(it.id)||it.free||it.league) return;
  const row=LODGE.el&&LODGE.el.querySelector('.lg-shop .lg-prev .lg-row'); if(!row) return; const t=gearTier(it.id), nx=t+1;
  row.insertAdjacentHTML('beforebegin',`<div class="tchips">${[1,2,3].map(k=>`<span class="${k<=t?'on':''}" style="--d:${k*70}ms">${['','🥇 Gold','💎 Diamond','🌈 Neon'][k]}</span>`).join('')}</div>
    ${nx<=3?`<div class="lg-row"><button class="lg-btn lg-gold" data-lg="gearUp" ${gearUpPrice(it,nx)>S.bank?'disabled':''}>✨ ${GEAR_TIERS[nx]} · ${k$(gearUpPrice(it,nx))}</button></div>`:''}`); };
Object.assign(LG_ACT,{ gearUp:()=>{ const it=ITEM[SHOP.sel]; if(!it||!owns(it.id)) return; const nx=gearTier(it.id)+1; if(nx>3) return;
  const pr=gearUpPrice(it,nx); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
  setBank(-pr); S.lodge.tiers=Object.assign({},S.lodge.tiers,{[it.id]:nx}); notePaid([it.id],[(S.lodge.paid&&S.lodge.paid[it.id]||paidFor(it.id))+pr]);
  S.spent=(S.spent||0)+pr*(1-RESALE); save(); try{ fx.confetti(nx===3?160:80); }catch(e){} [659,784,988,1319].slice(0,nx+1).forEach((f,i)=>tone(f,.1,'square',.05,i*.08));
  toast(`✨ ${it.name} is now ${GEAR_TIERS[nx]}!`,'gold'); renderShop(); } });
const _sellItemU=sellItem; sellItem=function(id){ _sellItemU(id); if(!owns(id)&&S.lodge.tiers&&S.lodge.tiers[id]){ delete S.lodge.tiers[id]; save(); } };

/* ---------- Effects ---------- */
const AURA_OUT=new WeakMap();
function spriteOutline(spr){ let o=AURA_OUT.get(spr); if(o) return o; const W=spr.width,H=spr.height, d=spr.getContext('2d').getImageData(0,0,W,H).data, on=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>0;
  o=[]; for(let y=-1;y<=H;y++) for(let x=-1;x<=W;x++) if(!on(x,y)&&(on(x-1,y)||on(x+1,y)||on(x,y-1)||on(x,y+1))) o.push([x,y]); AURA_OUT.set(spr,o); return o; }
// tier 1 gold sparkles, 2 diamond twinkles, 3 rainbow outline (plus twinkles). X,Y = top-left, sc = scale.
function auraFx(ctx,spr,X,Y,sc,tier,t,face){
  if(!tier) return; const W=spr.width,H=spr.height;
  if(tier>=3){ const pulse=sc>1?.55+.45*Math.sin(t*4):.85+.15*Math.sin(t*4); for(const [px,py] of spriteOutline(spr)){ const fx2=face<0?W-1-px:px;
      ctx.fillStyle=`hsla(${((px+py)*22+t*160)%360},100%,60%,${pulse})`; ctx.fillRect(X+fx2*sc,Y+py*sc,sc,sc); } }
  const n=tier>=2?3:2, col=tier===1?'#ffd84a':tier===2?'#bff6ff':'#ffffff';
  for(let i=0;i<n;i++){ const ph=(t*(.7+i*.13)+i*.31)%1; if(ph>.35) continue; const k=1-Math.abs(ph-.17)/.17, sx=((i*7+Math.floor(t*(.7+i*.13)))*5)%(W+4)-2, sy=((i*11+Math.floor(t*(.7+i*.13)))*7)%H;
    ctx.globalAlpha=Math.max(0,k); ctx.fillStyle=col; ctx.fillRect(X+sx*sc,Y+sy*sc,sc,sc); if(k>.6){ ctx.fillRect(X+(sx-1)*sc,Y+sy*sc,sc*3,Math.max(1,sc/2)); ctx.fillRect(X+sx*sc,Y+(sy-1)*sc,Math.max(1,sc/2),sc*3); } ctx.globalAlpha=1; }
}
const wornTier=(outfit,tiers)=>Math.max(0,...Object.values(outfit||{}).filter(Boolean).map(id=>gearTier(id,tiers)));
let WEAR_FOR;   // {outfit,tiers} while drawing someone else
const _drawPersonU=drawPerson;
drawPerson=function(ctx,who,frame,look,x,y,face){ _drawPersonU(ctx,who,frame,look,x,y,face);
  if(who!=='player') return; const W=WEAR_FOR||{outfit:S.lodge.outfit,tiers:null}, tier=wornTier(W.outfit,W.tiers); if(!tier) return;
  auraFx(ctx,personSprite(who,frame,look),Math.round(x-6),Math.round(y-PERSON_H),1,tier,performance.now()/1000,face); };
// Decor: wrap every piece's art with its tier effect.
let DECOR_TIERS;   // someone else's tiers while drawing their room
for(const id of Object.keys(DECOR_ART)){ const f=DECOR_ART[id], it=ITEM[id];
  DECOR_ART[id]=function(c,x,y,t){ f(c,x,y,t); if(!it||(!t&&!DECOR_TIERS)) return; const tier=DECOR_TIERS?(DECOR_TIERS[id]||0):gearTier(id); if(!tier) return;
    const w=it.w||12,h=it.h||12, T=performance.now()/1000;
    if(tier>=3){ const a=.85+.15*Math.sin(T*4); for(let i=0;i<w+2;i++){ c.fillStyle=`hsla(${(i*14+T*160)%360},100%,60%,${a})`; c.fillRect(x-1+i,y-1,1,1); c.fillRect(x-1+i,y+h,1,1); }
      for(let j=0;j<h;j++){ c.fillStyle=`hsla(${(j*14+T*160+180)%360},100%,60%,${a})`; c.fillRect(x-1,y+j,1,1); c.fillRect(x+w,y+j,1,1); } }
    const col=tier===1?'#ffd84a':tier===2?'#bff6ff':'#ffffff';
    if(tier<3){ c.fillStyle=col; for(const [cx,cy] of [[x-1,y-1],[x+w,y-1],[x-1,y+h],[x+w,y+h]]){ c.fillRect(cx,cy,1,1); } c.fillRect(x-1,y,1,1); c.fillRect(x+w,y,1,1); c.fillRect(x,y-1,1,1); c.fillRect(x+w-1,y-1,1,1); }
    for(let i=0;i<(tier>=2?3:2);i++){ const ph=(T*.6+i*.37+(x+y)*.01)%1; if(ph>.4) continue; const k=1-Math.abs(ph-.2)/.2, px=x+((i*13+(x|0))%w), py=y+((i*7+(y|0))%h);
      c.globalAlpha=Math.max(0,k); c.fillStyle=col; c.fillRect(px,py,1,1); if(k>.5){ c.fillRect(px-1,py,3,1); c.fillRect(px,py-1,1,3); } c.globalAlpha=1; } }; }
// Someone else's room: their outfit and decor tiers.
const _drawFriendRoomU=drawFriendRoom;
drawFriendRoom=function(cv,d){ WEAR_FOR={outfit:d&&d.outfit,tiers:(d&&d.tiers)||{}}; DECOR_TIERS=(d&&d.tiers)||{}; try{ _drawFriendRoomU(cv,d); }finally{ WEAR_FOR=undefined; DECOR_TIERS=undefined; } };

// Upgrade from anywhere: the closet, decorate mode, or tapping a piece in your room.
function gearUpgrade(id){ const it=ITEM[id]; if(!it||!owns(id)||it.free||it.league) return false; const nx=gearTier(id)+1; if(nx>3) return false;
  const pr=gearUpPrice(it,nx); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return false; }
  setBank(-pr); S.lodge.tiers=Object.assign({},S.lodge.tiers,{[id]:nx}); notePaid([id],[(S.lodge.paid&&S.lodge.paid[id]||paidFor(id))+pr]);
  S.spent=(S.spent||0)+pr*(1-RESALE); save(); try{ fx.confetti(nx===3?160:80); }catch(e){} [659,784,988,1319].slice(0,nx+1).forEach((f,i)=>tone(f,.1,'square',.05,i*.08));
  toast(`✨ ${it.name} is now ${GEAR_TIERS[nx]}!`,'gold'); return true; }
const TIER_IC=['','🥇','💎','🌈'];
function gearUpBtn(id){ const it=ITEM[id]; if(!it||it.free||it.league) return ''; const t=gearTier(id), nx=t+1;
  return nx>3?`<span class="lg-btn gu-max">🌈 MAX</span>`:`<button class="lg-btn lg-gold gu-btn" data-lg="gearUpId" data-id="${id}">${TIER_IC[nx]} ${k$(gearUpPrice(it,nx))}</button>`; }
function itemUpPopup(id){ const it=ITEM[id]; if(!it) return; const t=gearTier(id), nx=t+1;
  modal(`<div class="gu-pop"><div class="gu-art"></div><div class="fgm-k">${esc(it.name)}</div>
    <div class="tchips">${[1,2,3].map(k=>`<span class="${k<=t?'on':''}" style="--d:${k*70}ms">${TIER_IC[k]} ${GEAR_TIERS[k]}</span>`).join('')}</div>
    ${S.lodge.stolen&&S.lodge.stolen[id]?`<div class="tchips"><span>🦝 from ${esc(S.lodge.stolen[id].from)}</span></div>`:''}
    <div class="fgm-row">${nx<=3?`<button class="btn gold" data-a="gearUpA" data-v="${id}" ${gearUpPrice(it,nx)>S.bank?'disabled':''}>${TIER_IC[nx]} ${GEAR_TIERS[nx]} · ${k$(gearUpPrice(it,nx))}</button>`:'<span class="btn">🌈 Maxed out</span>'}<button class="btn" data-a="closeModal">Close</button></div></div>`);
  const a=document.querySelector('#fgModal .gu-art'); if(a){ const c=iconCanvas(it,it.cat==='decor'?4:6); a.appendChild(c); } }
ACT.gearUpA=el=>{ const id=el.dataset.v; if(gearUpgrade(id)) itemUpPopup(id); };
Object.assign(LG_ACT,{ gearUpId:b=>{ if(gearUpgrade(b.dataset.id)){ if(LODGE.room&&LODGE.room.tray) LODGE.room.tray(); if(SHOP.tab==='closet'&&LODGE.el.querySelector('.lg-shop')) renderShop(); } } });
// The closet: an upgrade strip for everything you're wearing.
const _renderShopUC=renderShop;
renderShop=function(){ _renderShopUC(); if(SHOP.tab!=='closet'||SHOP.sel) return; const me=LODGE.el&&LODGE.el.querySelector('.lg-shop .lg-closet-me'); if(!me) return;
  const worn=Object.values(S.lodge.outfit||{}).filter(id=>id&&ITEM[id]&&owns(id)&&!ITEM[id].free&&!ITEM[id].league);
  if(!worn.length) return;
  me.insertAdjacentHTML('afterend',`<div class="gu-strip">${worn.map((id,i)=>`<div class="gu-row" style="--d:${i*60}ms"><span class="lg-ic" data-guic="${id}"></span><b>${TIER_IC[gearTier(id)]||''} ${esc(ITEM[id].name)}</b>${gearUpBtn(id)}</div>`).join('')}</div>`);
  LODGE.el.querySelectorAll('[data-guic]').forEach(s=>s.appendChild(iconCanvas(ITEM[s.dataset.guic],2))); };
