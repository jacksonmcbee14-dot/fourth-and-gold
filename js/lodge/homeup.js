// ⬆️ Home panel → Upgrades tab: every home and its level, the great-room upgrades per prestige star, and the
// Grounds regions per star — what you have now and what you need for the rest.
/* ---------- Home panel tab: what you have and what's next ---------- */
// Every home and the level that unlocks it, the great-room upgrades per prestige star, and the Grounds regions per star.
const STAR_ROOM=['Gold star banner','Velvet carpet','Glowing sconces','Crystal chandelier','Marble floor','Starry ceiling','Gold trim','Star mosaic'];
HP_TABS.push(['up','⬆️','Upgrades']);
function hpUp(cur){ const L=myLevel(), st=S.prestige||0, money=n=>n>=1e12?'$'+n/1e12+'T':n>=1e9?'$'+n/1e9+'B':'$'+n/1e6+'M';
  const homes=HOMES.map((H,i)=>{ const have=i<=cur, now=i===cur, lock=H.owner?'Gifted only':`Lv ${H.lv}${L<H.lv?' · '+(H.lv-L)+' to go':''}`;
    return `<div class="up-row ${now?'now':have?'have':'lock'}"><span>${now?'🏠':have?'✅':'🔒'}</span><b>${esc(H.name)}<small>${H.rooms.length} room${H.rooms.length>1?'s':''} · ${H.windows} windows${H.safe?' · safe '+money(H.safe):''}</small></b><em>${now?'YOU LIVE HERE':have?'':lock}</em></div>`; }).join('');
  const room=STAR_ROOM.map((n,k)=>`<div class="up-row ${st>k?'have':'lock'}"><span>${st>k?'✅':'⭐'+(k+1)}</span><b>${n}</b><em>${st>k?'':'Prestige '+(k+1)}</em></div>`).join('');
  const regs=typeof REG!=='undefined'?REG.filter(R=>R.stars>0).sort((a,b)=>a.stars-b.stars).map(R=>`<div class="up-row ${st>=R.stars?'have':'lock'}"><span>${st>=R.stars?'✅':'⭐'+R.stars}</span><b>${esc(R.name)}</b><em>${st>=R.stars?'OPEN':'Prestige '+R.stars}</em></div>`).join(''):'';
  return `<div class="up-sum"><span>🏠 ${esc(HOMES[cur].name)}</span><span>LV ${L}</span><span>⭐ ${st}</span></div>
    <div class="gd-h">🏠 Homes <small>level up to move</small></div>${homes}
    <div class="gd-h">⭐ The great room <small>one upgrade per prestige</small></div>${room}
    <div class="gd-h">🗺️ The Grounds <small>out the back</small></div>${regs}
    <div class="up-note">Prestige when your bankroll hits the $1T vault — tap your bankroll in the app.</div>`; }
const _hpBodyUp=hpBody; hpBody=function(tab,H,i){ return tab==='up'?hpUp(i):_hpBodyUp(tab,H,i); };

/* ---------- Your lodge: a name for every prestige level, shown on the lodge screen ---------- */
// Each star upgrades the lodge itself: a new look for the great room, a new region of the Grounds, and star-only clothes.
const LODGE_TIERS=[
  ['🌲','Timber Lodge','The original log lodge',['The Front Lawn, Whispering Pines and Mirror Lake']],
  ['🏅','Gilded Lodge','Gold star banner in the great room',['Duck Marsh opens','Dawn Flight hunting and the gunsmith','Rising Star coat, scarf and crown']],
  ['🍷','Velvet Lodge','Red velvet carpet',['Aurora Ridge opens','Gilded Over-Under gun','Twin Stars clothes']],
  ['🕯️','Lantern Lodge','Glowing wall sconces',['Hot Springs and Willow Bayou open','Royal Express gun','Triple Crown clothes']],
  ['💎','Crystal Lodge','Crystal chandelier',['Thunder Falls opens','Starfire gun','Four Seasons clothes']],
  ['🏛️','Marble Lodge','Marble floor',['Crystal Caverns opens','High Five clothes']],
  ['🌌','Starlit Lodge','Starry painted ceiling',['Blossom Orchard opens','Cosmic Cannon gun','Six Pack clothes']],
  ['👑','Golden Lodge','Gold trim everywhere',['Lighthouse Cove opens','Lucky Seven clothes']],
  ['✨','Celestial Lodge','Star mosaic on the floor',['Starfall Summit opens','Infinity clothes']],
];
const lodgeTier=()=>Math.min(LODGE_TIERS.length-1,S.prestige||0);
function lodgeChip(){ const el=LODGE.el&&LODGE.el.querySelector('.lg-top'); if(!el) return; let b=el.querySelector('#lgTier'); const [ic,name]=LODGE_TIERS[lodgeTier()];
  if(!b){ b=document.createElement('button'); b.id='lgTier'; b.className='lg-btn lg-tier'; b.dataset.lg='lodgeTiers'; el.querySelector('[data-lg=classic]').after(b); }
  const t=`${ic} ${name}`; if(b.textContent!==t) b.textContent=t; }
function lodgeTiersOpen(){ const cur=lodgeTier();
  modal(`<div class="fgm-k">🏔️ Your lodge</div><div class="lt-now"><span>${LODGE_TIERS[cur][0]}</span><b>${esc(LODGE_TIERS[cur][1])}</b><small>⭐ ${S.prestige||0} prestige</small></div>
    ${LODGE_TIERS.map(([ic,name,look,adds],k)=>`<div class="lt-row ${k===cur?'now':k<cur?'have':'lock'}"><span>${k<=cur?ic:'🔒'}</span><b>${esc(name)}<small>${esc(look)} · ${adds.map(esc).join(' · ')}</small></b><em>${k===cur?'YOU HAVE':k<cur?'✅':'⭐ Prestige '+k}</em></div>`).join('')}
    <div class="up-note">Prestige when your bankroll fills the $1T vault (tap your bankroll in the app). You start again at $1M, keep everything, and your lodge moves up.</div>`); }
LG_ACT.lodgeTiers=()=>lodgeTiersOpen();
const _lodgeHubT=lodgeHub; lodgeHub=function(){ const r=_lodgeHubT.apply(this,arguments); lodgeChip(); return r; };
const _lodgeShowT=lodgeShow; lodgeShow=function(){ const r=_lodgeShowT.apply(this,arguments); lodgeChip(); return r; };
// Home panel → Upgrades also leads with your lodge.
const _hpUpT=hpUp; hpUp=function(cur){ const k=lodgeTier(); return `<button class="lt-banner" data-lg="lodgeTiers">${LODGE_TIERS[k][0]} <b>${esc(LODGE_TIERS[k][1])}</b><small>${k<8?'Next: '+esc(LODGE_TIERS[k+1][1])+' at ⭐'+(k+1):'Top lodge'} ›</small></button>`+_hpUpT(cur); };
