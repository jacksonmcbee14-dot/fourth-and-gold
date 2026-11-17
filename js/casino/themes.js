// 🎨 Table themes and card decks. Every collection (set) you complete for your house unlocks a matching table
// theme (felt, rim, roulette board and wheel, craps zones) and a matching deck of cards. You can also buy extra
// decks. Pick them from the 🎨 chip on any table game. Slots keeps its seasonal look. Styling: css/15-themes.css.

const TTHEMES={
  lodge:{name:'Lodge',icon:'🌲'},
  golf:{name:'Club Champion',icon:'⛳',set:'golf'}, neon:{name:'Neon Nights',icon:'🌃',set:'neon'}, security:{name:'Fort Knox',icon:'🛡️',set:'security'},
  pennants:{name:'Pennant Wall',icon:'🚩',set:'pennants'}, cabin:{name:'Mountain Man',icon:'🦌',set:'cabin'}, holiday:{name:'Holiday Spirit',icon:'🎄',set:'holiday'},
  arcade:{name:'Arcade King',icon:'🕹️',set:'arcade'}, art:{name:'Art Collector',icon:'🖼️',set:'art'}, crowns:{name:'Royalty',icon:'👑',set:'crowns'}, watches:{name:'Watch Collector',icon:'⌚',set:'watches'},
};
// Decks: one per set (unlocked with the set) plus decks you can buy.
const DECKS=Object.assign({classic:{name:'Classic',icon:'🂠'}},
  Object.fromEntries(Object.entries(TTHEMES).filter(([k,t])=>t.set).map(([k,t])=>[k,{name:t.name+' deck',icon:t.icon,set:t.set}])),
  {midnight:{name:'Midnight',icon:'🌑',price:250000},goldfoil:{name:'Gold Foil',icon:'✨',price:1e6},diamond:{name:'Diamond',icon:'💎',price:5e6},glow:{name:'Glow in the Dark',icon:'🟢',price:2e6},pixel:{name:'8-Bit',icon:'👾',price:500000}});
const themeOk=k=>{ const t=TTHEMES[k]; return !!t&&(!t.set||!!(S.lodge.sets&&S.lodge.sets[t.set])); };
const deckOk=k=>{ const d=DECKS[k]; return !!d&&(d.set?!!(S.lodge.sets&&S.lodge.sets[d.set]):d.price?(S.decks||[]).includes(k):true); };
const deckPrice=k=>nice(DECKS[k].price*(typeof wealthX==='function'?Math.max(1,wealthX()/20):1));
const curTheme=()=>themeOk(S.ctheme)?S.ctheme:'lodge', curDeck=()=>deckOk(S.cdeck)?S.cdeck:'classic';
function themeApply(){ const on=S.mode==='casino'&&S.ctab!=='slots';
  if(on&&curTheme()!=='lodge') document.body.dataset.ttheme=curTheme(); else delete document.body.dataset.ttheme;
  if(on&&curDeck()!=='classic') document.body.dataset.cdeck=curDeck(); else delete document.body.dataset.cdeck; }
function themeChip(){ if(S.mode!=='casino'||S.ctab==='slots'||S.ctab==='ranks') return; const tbl=document.querySelector('#view .tblmin'); if(!tbl||document.getElementById('themeChip')) return;
  const T=TTHEMES[curTheme()], D=DECKS[curDeck()]; tbl.insertAdjacentHTML('afterend',`<button id="themeChip" data-a="themePick">🎨 ${T.icon} ${esc(T.name)} · ${D.icon} ${esc(D.name.replace(/ deck$/,''))}</button>`); }
const _renderTh=render; render=function(){ _renderTh(); themeApply(); themeChip(); };
function themePick(){ const done=Object.keys(S.lodge.sets||{}).length;
  modal(`<div class="fgm-k">🎨 Your table</div><div class="tchips"><span>🧩 ${done} sets done</span><span>✨ Each set unlocks a theme + deck</span></div>
    <div class="th-h">Table</div><div class="th-grid">${Object.entries(TTHEMES).map(([k,t],i)=>{ const ok=themeOk(k); return `<button class="th-tile tt-${k} ${curTheme()===k?'on':''} ${ok?'':'lock'}" style="--d:${i*30}ms" data-a="${ok?'themeSet':'themeLocked'}" data-v="${k}"><i></i><span>${ok?t.icon:'🔒'}</span><small>${esc(t.name)}</small></button>`; }).join('')}</div>
    <div class="th-h">Cards</div><div class="th-grid">${Object.entries(DECKS).map(([k,d],i)=>{ const ok=deckOk(k); return `<button class="th-tile dk-${k} ${curDeck()===k?'on':''} ${ok?'':'lock'}" style="--d:${i*30}ms" data-a="${ok?'deckSet':d.price?'deckBuy':'themeLocked'}" data-v="${k}"><b class="th-card"></b><small>${esc(d.name.replace(/ deck$/,''))}</small>${!ok&&d.price?`<em>${k$(deckPrice(k))}</em>`:!ok?'<em>🔒</em>':''}</button>`; }).join('')}</div>`); }
Object.assign(ACT,{
  themePick:()=>themePick(),
  themeSet:el=>{ S.ctheme=el.dataset.v; save(); tone(700,.04,'square',.03); render(); themePick(); },
  deckSet:el=>{ S.cdeck=el.dataset.v; save(); tone(800,.04,'square',.03); render(); themePick(); },
  deckBuy:el=>{ const k=el.dataset.v, pr=deckPrice(k); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    setBank(-pr); S.spent=(S.spent||0)+pr; S.decks=(S.decks||[]).concat(k); S.cdeck=k; save(); try{ fx.confetti(80); }catch(e){} toast(`${DECKS[k].icon} ${DECKS[k].name} deck — yours!`,'gold'); render(); themePick(); },
  themeLocked:el=>{ const k=el.dataset.v, s=(TTHEMES[k]||DECKS[k]||{}).set, set=SETS.find(x=>x.id===s); toast(set?`🧩 Finish the ${set.name} set to unlock`:'Locked','gold'); },
});

// Decks theme the win too: a burst of the deck's icons from the table when you win.
const DECK_FX={golf:['⛳','🏌️','🟢'],neon:['✨','💜','⚡'],security:['🔒','💰','🛡️'],pennants:['🚩','🏆','⭐'],cabin:['🦌','🌲','🔥'],holiday:['❄️','🎁','⭐'],arcade:['👾','🕹️','💥'],
  art:['🎨','🖼️','✨'],crowns:['👑','💎','✨'],watches:['⌚','⏱️','✨'],midnight:['🌙','⭐','✨'],goldfoil:['💰','✨','🪙'],diamond:['💎','✨','❄️'],glow:['🟢','✨','⚡'],pixel:['👾','⭐','💥']};
function deckWinFx(big){ const k=curDeck(), I=DECK_FX[k]; if(!I) return; const host=document.querySelector('#view .felt,#view .pb-stage'); if(!host) return; const r=host.getBoundingClientRect();
  const n=big?22:12; for(let i=0;i<n;i++){ const e=document.createElement('span'); e.className='dk-burst'; e.textContent=I[i%I.length];
    e.style.left=(r.left+r.width/2-13+(Math.random()-.5)*r.width*.3)+'px'; e.style.top=(r.top+r.height*.45)+'px';
    e.style.setProperty('--dx',((Math.random()-.5)*r.width*1.1)+'px'); e.style.setProperty('--dy',(-80-Math.random()*r.height*.6)+'px'); e.style.setProperty('--rot',((Math.random()-.5)*540)+'deg');
    e.style.animationDelay=(i*25)+'ms'; document.body.appendChild(e); setTimeout(()=>e.remove(),1600+i*25); } }
const _setBankDk=setBank;
setBank=function(delta){ const r=_setBankDk.apply(this,arguments);
  if(delta>0&&S.mode==='casino'&&['roulette','blackjack','poker','craps','pinball'].includes(S.ctab)) deckWinFx(delta>=(S.chip||1000)*5);
  return r; };
