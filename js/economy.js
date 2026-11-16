// The economy.
//  • VIP tables: you choose your table, and its minimum bet stays put until you change it.
//      Lodge $1K · Silver $100K (2× XP) · Gold $10M (3× XP) · Diamond $1B (5× XP, 💎 badge, Diamond-only items)
//      · Emerald $100B · Ruby $10T · Sapphire … and on forever (each 100× the last, +2× XP each, its own badge).
//      Each needs 20× its minimum in net worth.
//    Payouts are the same at every table, so no table can be farmed for free money. If your net worth drops
//    below what a table needs, you're moved down to the best table you can afford.
//  • Silas's prices: the original price × (net worth ÷ $1M)^0.8, never below the original.
//  • Drinks are a share of net worth (never below the old price): old fashioned 10%, hot cocoa 2%,
//    spiced cider 1%, eggnog 0.5%. Hot cocoa is still free while you're in debt.
// Friend challenges and duels aren't affected: that money is between players.

const worth=()=>Math.max(0,scoreNow());
const nice=n=>{ if(n<1000) return Math.round(n); const p=Math.pow(10,Math.floor(Math.log10(n))-1); return Math.round(n/p)*p; };
// Prices grow a little slower than wealth (power 0.8), so pricey items come within reach as you get richer.
const wealthX=()=>Math.max(1,Math.pow(worth()/1e6,.8));

/* ---------- VIP tables (endless) ---------- */
// Each table's minimum is 100× the one before, and it needs 20× its minimum in net worth.
// You see every table you can sit at plus the next 5 above it, so reaching the top always reveals 5 more.
const VIP_NAMES=[['lodge','Lodge','🪵','#c8a45c'],['silver','Silver','🥈','#cfd9e0'],['gold','Gold','🥇','#ffd84a'],['diamond','Diamond','💎','#bff6ff'],
  ['emerald','Emerald','🟢','#3ad08a'],['ruby','Ruby','🔴','#ff4a5a'],['sapphire','Sapphire','🔵','#6a9aff'],['amethyst','Amethyst','🟣','#b06ae0'],
  ['obsidian','Obsidian','⚫','#a8a4b4'],['platinum','Platinum','🏆','#e5e4e2'],['royal','Royal','👑','#ffcf4a'],['cosmic','Cosmic','🌌','#8a6aff'],
  ['galaxy','Galaxy','🌠','#ff8ad8'],['nebula','Nebula','✨','#6ad0ff'],['quasar','Quasar','☄️','#ffb86a'],['infinity','Infinity','♾️','#ffffff']];
const ROMAN=n=>{ const r=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]; let o=''; for(const [v,l] of r) while(n>=v){ o+=l; n-=v; } return o; };
const VIP_CACHE=[];
function vipAt(i){
  if(VIP_CACHE[i]) return VIP_CACHE[i];
  const L=VIP_NAMES.length, base=VIP_NAMES[Math.min(i,L-1)], extra=i-(L-1);
  const min=1e3*Math.pow(100,i), xp=i<3?i+1:5+2*(i-3);
  const perks=i===0?'The regular tables':i===1?'2× XP':i===2?'3× XP · gold tables and chips':
    `${xp}× XP · ${base[1].toLowerCase()} tables · ${base[2]} on the leaderboard · Diamond-only shop items`;
  return VIP_CACHE[i]={i,id:extra>0?'infinity'+(extra+1):base[0],name:extra>0?'Infinity '+ROMAN(extra+1):base[1],icon:base[2],color:base[3],min,need:i?min*20:0,xp,perks};
}
const vipIndex=id=>{ if(!id) return 0; const k=VIP_NAMES.findIndex(v=>v[0]===id); if(k>=0) return k; const m=/^infinity(\d+)$/.exec(id); return m?VIP_NAMES.length-2+(+m[1]):0; };
const vipAfford=()=>{ const w=worth(); let i=0; while(w>=vipAt(i+1).need) i++; return i; };
let vipNoted='';
function vipTier(){
  const want=vipIndex(S.vip), top=vipAfford(), i=Math.min(want,top);
  if(want>i&&vipNoted!==S.vip){ vipNoted=S.vip; setTimeout(()=>toast(`Moved to the ${vipAt(i).name} table — ${vipAt(want).name} needs ${k$(vipAt(want).need)}`,'gold'),600); }
  return vipAt(i);
}
// The badge shown next to a player's name (Diamond and up), from the best table they've sat at.
const vipBadge=id=>{ const i=vipIndex(id); return i>=3?` <span title="${esc(vipAt(i).name)} table">${vipAt(i).icon}</span>`:''; };
const tableMin=()=>vipTier().min;
const slotMin=()=>vipTier().min;
function vipLook(){ const t=vipTier(); document.body.classList.remove('vip-silver','vip-gold','vip-diamond','vip-high');
  if(t.i===1) document.body.classList.add('vip-silver'); else if(t.i===2) document.body.classList.add('vip-gold'); else if(t.i===3) document.body.classList.add('vip-diamond');
  else if(t.i>3){ document.body.classList.add('vip-high'); document.body.style.setProperty('--vipc',t.color); } }
function vipOpen(){
  const cur=vipTier().i, top=Math.max(vipAfford(),vipIndex(S.vipBest)), last=Math.min(top+5,vipMaxTier()), list=[];
  for(let i=0;i<=last;i++) list.push(vipAt(i));
  modal(`<div class="fgm-k">Choose your table</div><p class="small muted" style="margin:-4px 0 12px">Your minimum bet stays put until you change it. Payouts are the same everywhere — higher tables earn XP faster and bring VIP perks. Past the top table, Prestige (⭐) keeps you climbing.</p>
    <div class="vipx">${list.slice().reverse().map(v=>{ const ok=worth()>=v.need, on=v.i===cur;
      return `<button class="vipx-t ${on?'on':''}" style="--vc:${v.color}" data-a="vipPick" data-v="${v.i}" ${ok?'':'disabled'}><span class="vipx-ic">${v.icon}</span>
        <div><b>${esc(v.name)}</b><span>Min bet ${k$(v.min)}</span><small>${esc(v.perks)}</small></div>
        <i>${on?'Your table':ok?'Sit here':'Needs '+k$(v.need)}</i></button>`; }).join('')}</div>`);
  const on=document.querySelector('#fgModal .vipx-t.on'); if(on) on.scrollIntoView({block:'center'});
}
Object.assign(ACT,{
  vipOpen:()=>vipOpen(),
  vipPick:el=>{ const v=vipAt(+el.dataset.v); if(!v||worth()<v.need) return; S.vip=v.id; vipNoted='';
    if(v.i>vipIndex(S.vipBest)) S.vipBest=v.id;
    save(); closeModal(); render(); toast(`${v.icon} ${v.name} table · min bet ${k$(v.min)}`,'gold'); [523,659,784].forEach((f,i)=>tone(f,.08,'square',.04,i*.06)); },
});
// XP: higher tables earn more, and their daily XP limit grows to match.
const _gainXPV=gainXP;
gainXP=function(n,why,capped=true){
  const m=vipTier().xp; if(m===1||!(n>0)) return _gainXPV(n,why,capped);
  if(!capped) return _gainXPV(n*m,why,false);
  const day=dayKey(); if(!S.lodge.xpToday||S.lodge.xpToday.day!==day) S.lodge.xpToday={day,n:0};
  const k=Math.min(n*m,Math.max(0,XP_CAP*m-S.lodge.xpToday.n)); if(!k) return _gainXPV(n,why,true);   // shows the "limit reached" note
  S.lodge.xpToday.n+=k; return _gainXPV(k,why,false);
};

/* ---------- Diamond-only gear (sold by Silas to anyone who has sat at the Diamond table) ---------- */
const DIAMOND_ITEMS=[
  {id:'coat_diamond',cat:'clothes',sub:'body',slot:'body',name:'Diamond-studded tux',price:500000,lvl:1,desc:'Every stud is real. Allegedly.',colors:{c:'#16161c',C:'#bff6ff',w:'#bff6ff',b:'#e6fbff',p:'#16161c'}},
  {id:'hat_diamond',cat:'clothes',sub:'hat',slot:'hat',name:'Diamond fedora',price:300000,lvl:1,desc:'The band sparkles from across the room.',grid:['............','....xxxx....','....xxxx....','...dddddd...','.xxxxxxxxxx.'],pal:{x:'#16161c',d:'#bff6ff'}},
  {id:'face_grill',cat:'clothes',sub:'glasses',slot:'glasses',name:'Diamond grill',price:200000,lvl:1,desc:'Smile for the cameras.',grid:['','','','','','','','....dddd....'],pal:{d:'#e6fbff'}},
  {id:'watch_diamondface',cat:'clothes',sub:'watch',slot:'watch',name:'Diamond-face watch',price:400000,lvl:1,desc:'You stopped checking the time. It checks you.',dot:'#e6fbff'},
  {id:'decor_chandelier',cat:'decor',sub:'treasure',name:'Diamond chandelier',price:600000,lvl:1,desc:'Throws rainbows on every wall.',w:24,h:18,wall:1},
  {id:'decor_diamond_slot',cat:'decor',sub:'games',name:'Diamond slot machine',price:450000,lvl:1,desc:'Only pays in sparkle.',w:14,h:24},
];
DECOR_ART.decor_chandelier=(c,x,y,t)=>{ rect(c,x+11,y,2,4,LP.brass1); rect(c,x+3,y+4,18,2,LP.brass1); rect(c,x+6,y+8,12,2,LP.brass1);
  for(let i=0;i<6;i++){ rect(c,x+3+i*3.4,y+6,1,5+(i%2)*3,'#bff6ff'); rect(c,x+3+i*3.4,y+11+(i%2)*3,2,2,'#e6fbff'); }
  for(let i=0;i<3;i++) rect(c,x+8+i*3,y+10,1,6,'#bff6ff');
  const k=(t||0)*3; if(Math.sin(k)>.5) rect(c,x+4+((k*4|0)%16),y+13,1,1,'#ffffff'); if(Math.cos(k*1.3)>.6) rect(c,x+18,y+7,1,1,'#ffe0ff'); };
DECOR_ART.decor_diamond_slot=(c,x,y,t)=>{ rect(c,x,y+3,14,21,'#2a3a4a'); rect(c,x+1,y+4,12,19,'#3a5068'); rect(c,x,y,14,4,'#bff6ff'); rect(c,x+2,y+8,10,6,'#05070a');
  const s=Math.floor((t||0)*2)%3; for(let i=0;i<3;i++) rect(c,x+3+i*3,y+10,2,2,(i+s)%3?'#bff6ff':'#e6fbff'); rect(c,x+3,y+17,8,2,'#bff6ff'); rect(c,x+13,y+8,1,6,'#9fb0bf'); };
for(const it of DIAMOND_ITEMS){ it.diamond=1; if(!ITEM[it.id]){ ITEMS.push(it); ITEM[it.id]=it; } }
const diamondOk=()=>vipIndex(S.vipBest)>=3;
const _buyItemV=buyItem;
buyItem=function(id){ const it=ITEM[id]; if(it&&it.diamond&&!diamondOk()){ toast('Diamond-only — sit at the Diamond table first','loss'); return; } return _buyItemV(id); };
const _renderShopV=renderShop;
renderShop=function(){ _renderShopV(); if(diamondOk()) return; const box=LODGE.el&&LODGE.el.querySelector('.lg-shop'); if(!box) return;
  box.querySelectorAll('[data-lg=shopSel][data-id]').forEach(b=>{ const it=ITEM[b.dataset.id]; if(it&&it.diamond){ b.classList.add('locked'); const p=b.querySelector('.lg-ip'); if(p) p.textContent='💎 DIAMOND'; } });
  const ask=box.querySelector('[data-lg=shopAsk]'); if(ask&&SHOP.sel&&ITEM[SHOP.sel]&&ITEM[SHOP.sel].diamond){ ask.disabled=true; ask.textContent='Diamond table only'; } };

/* ---------- Prices follow your net worth ---------- */
for(const it of ITEMS){ if(it.free||it.league||!(it.price>0)||it._base) continue; const base=it.price; it._base=base;
  Object.defineProperty(it,'price',{get(){ return nice(base*wealthX()); },configurable:true}); }
const DRINK_PCT={oldfash:.10,cocoa:.02,cider:.01,eggnog:.005};
const _drinkPriceE=drinkPrice;
drinkPrice=function(d){ const base=_drinkPriceE(d); if(base===0) return 0; return Math.max(base,nice(worth()*(DRINK_PCT[d.id]||0))); };

/* ---------- Enforcing the table minimum ---------- */
const belowMin=amt=>{ const m=tableMin(); if(amt>=m) return false; toast(`${vipTier().name} table minimum: ${fmt$(m)}`,'loss'); return true; };
const _rSpinE=rSpin; rSpin=function(){ if(!RL.spinning&&rTotal()>0&&belowMin(rTotal())) return; return _rSpinE.apply(this,arguments); };
const _bjDealE=bjDeal; bjDeal=function(){ if(BJ.bet>0&&belowMin(BJ.bet)) return; return _bjDealE.apply(this,arguments); };
const _vpDealE=vpDeal; vpDeal=function(){ if(VP.phase==='bet'&&belowMin(VP.unit*VP.coins)) return; return _vpDealE.apply(this,arguments); };
const _crbetE=ACT.crbet; ACT.crbet=el=>{ if(!CR.rolling&&belowMin(S.chip)) return; _crbetE(el); };
const _slotSpinE=slotSpin;
slotSpin=function(){ if(!SL.spinning&&!(SL.fs>0)&&S.slotBet<slotMin()){ S.slotBet=slotMin(); save(); slUI(); toast('Bet raised to the table minimum: '+fmt$(S.slotBet),'gold'); }
  return _slotSpinE.apply(this,arguments); };
const _placeE=ACT.placeSlip; ACT.placeSlip=el=>{ const c=slipCalc(); if(c.legs.length&&c.stake>0&&belowMin(c.stake)) return; _placeE(el); };

// Slots: the − / + buttons step through bets at or above the minimum, and a bet below it is raised.
function slotLadder(){ const m=slotMin(), L=SLOT_BETS.filter(v=>v>=m); for(const k of [1,2.5,5,10,25,50,100]){ const v=nice(m*k); if(!L.includes(v)&&v>=m) L.push(v); } return L.sort((a,b)=>a-b).filter(v=>v<=Math.max(S.bank,m)).slice(0,10); }
ACT.slBet=el=>{ if(SL.spinning||SL.fs>0) return; const L=slotLadder(), d=+el.dataset.v; let i=L.findIndex(v=>v>=S.slotBet);
  if(i<0) i=d>0?L.length-1:L.length-2; else if(L[i]===S.slotBet) i+=d; else if(d<0) i--;
  i=clamp(i,0,L.length-1); S.slotBet=L[i]; save(); slUI(); tone(500+i*60,.06,'square',.04); };
const _slUIE=slUI; slUI=function(){ if(!SL.spinning&&!(SL.fs>0)&&S.slotBet<slotMin()){ S.slotBet=slotMin(); save(); } return _slUIE.apply(this,arguments); };

/* ---------- Showing it ---------- */
const _gameHeadE=gameHead;
gameHead=function(key,title){ const t=vipTier(); vipLook();
  return _gameHeadE(key,title)+`<button class="tblmin t-${t.id}" style="--vc:${t.color}" data-a="vipOpen" title="Choose your table"><i>${t.icon}</i>${t.name} table · min <b class="mono">${cmp$(t.min)}</b><span class="tblmin-c">Change ▾</span></button>`; };
const _renderV=render; render=function(){ _renderV(); if(S.mode!=='casino') document.body.classList.remove('vip-silver','vip-gold','vip-diamond'); };
const _renderSlipE=renderSlip;
renderSlip=function(){ _renderSlipE(); const m=tableMin(); if(m>1000&&$('#sheet').classList.contains('on')){ const a=$('#sheet .amts'); if(a) a.insertAdjacentHTML('beforebegin',`<div class="small muted" style="margin:10px 0 -4px">${vipTier().name} table minimum: <b class="gold">${fmt$(m)}</b></div>`); } };
const _bankSheetE=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheetE(el); const t=vipTier();
  $('#sheet').insertAdjacentHTML('beforeend',`<button class="btn wide" style="margin-top:12px" data-a="vipOpen">${t.icon} ${t.name} table · min ${k$(t.min)} · change</button>`); };


/* ---------- The vault, Prestige and a sober old fashioned ---------- */
// Cash tops out at $1 quadrillion (the vault). Past that, Prestige: start again at $1M with a ⭐ that's
// yours forever — +20% XP per star, a star next to your name, and stars rank first on the leaderboard.
// Stars never run out, so the climb never ends, but the numbers always stay readable and exact.
const VAULT=1e15;
const vipMaxTier=()=>{ let i=0; while(vipAt(i+1).need<=VAULT) i++; return i; };
let vaultNoted=0;
const _saveV=save;
save=function(){
  if(S.bank>VAULT){ S.bank=VAULT; if(Date.now()-vaultNoted>60e3){ vaultNoted=Date.now(); setTimeout(vaultFull,400); } }
  if(S.peak>VAULT) S.peak=VAULT;
  return _saveV.apply(this,arguments);
};
function vaultFull(){
  modal(`<div class="cel"><div class="cel-emoji">🏦</div><div class="cel-t">Your vault is full</div><p>You’ve hit ${k$(VAULT)} — the most the lodge can hold. Winnings past this are lost until you Prestige.</p>
    <div class="cel-big">⭐ Prestige ${(S.prestige||0)+1}</div>
    <p class="small muted">Start again at $1,000,000. Keep every item, trophy and title. +20% XP per star, forever, and a star next to your name. Stars rank first on the leaderboard.</p>
    <div class="fgm-row"><button class="btn gold" data-a="prestigeGo">Prestige now</button><button class="btn" data-a="closeModal">Not yet</button></div></div>`);
}
ACT.prestigeGo=()=>{
  if(scoreNow()<VAULT*.99&&S.bank<VAULT*.99){ toast('Fill your vault ('+k$(VAULT)+') first','loss'); return; }
  const before=typeof leagueScoreRaw==='function'?leagueScoreRaw()+(S.ladj||0):0;
  S.prestige=(S.prestige||0)+1; S.bank=START_BANK; S.peak=START_BANK; S.debt=0; S.bets=[]; S.slip=[]; S.vip='lodge'; S.lodge.drink=null;
  if(typeof leagueScoreRaw==='function') S.ladj=before-leagueScoreRaw();
  save(); closeModal(); render(); try{ fx.confetti(220); fireworks(6); }catch(e){}
  celebrate('Prestige '+S.prestige+'!','You’re back at $1,000,000 with everything you own.','⭐'.repeat(Math.min(S.prestige,5))+' +'+S.prestige*20+'% XP forever');
};
const stars=n=>n>0?` <span class="pstar" title="Prestige ${n}">⭐${n>1?n:''}</span>`:'';
const _gainXPV2=gainXP;
gainXP=function(n,why,capped){ if(n>0&&S.prestige) n=Math.round(n*(1+.2*S.prestige)); return _gainXPV2(n,why,capped); };
const _bankSheetV2=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheetV2(el);
  $('#sheet').insertAdjacentHTML('beforeend',`<p class="small muted" style="text-align:center;margin-top:10px">${S.prestige?`⭐ Prestige ${S.prestige} · +${S.prestige*20}% XP. `:''}Your vault holds ${k$(VAULT)}. Fill it to Prestige.</p>${S.bank>=VAULT*.99?'<button class="btn gold wide" data-a="prestigeGo">⭐ Prestige now</button>':''}`); };

// The old fashioned: one a day, and its extra winnings are capped at 3× what you paid for it.
// Once that's used up, the drink wears off.
const OF_CAP=3;
function drinkBonus(base,boosted){
  if(!drinkOn('oldfash')||boosted<=base) return boosted;
  const d=S.lodge.drink, room=Math.max(0,(d.cap||0)-(d.used||0)), extra=Math.min(boosted-base,room);
  d.used=(d.used||0)+extra;
  if(room-extra<=0){ S.lodge.drink=null; setTimeout(()=>toast('🥃 The old fashioned wore off — its bonus is used up','gold'),800); }
  return base+extra;
}
const _boostRetV=boostRet;
boostRet=function(ret,stake,x){ const boosted=_boostRetV(ret,stake,x); return (x==null||x===winX())&&drinkOn('oldfash')?drinkBonus(ret,boosted):boosted; };
const _orderDrinkV=orderDrink;
orderDrink=function(id){
  if(id==='oldfash'&&S.ofDay===dayKey()){ toast('One old fashioned a day — Mack’s cutting you off','loss'); return; }
  const before=S.bank; _orderDrinkV(id);
  if(id==='oldfash'&&S.lodge.drink&&S.lodge.drink.id==='oldfash'&&S.bank<before){ S.ofDay=dayKey(); S.lodge.drink.cap=(before-S.bank)*OF_CAP; S.lodge.drink.used=0; save(); toast(`🥃 Bonus winnings up to ${k$(S.lodge.drink.cap)} — then it wears off`,'gold'); }
};
