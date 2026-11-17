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
