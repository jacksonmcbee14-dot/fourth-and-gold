// The economy.
//  • VIP tables: you choose your table, and its minimum bet stays put until you change it.
//      Lodge    $1K min · normal
//      Silver   $100K min · 2× XP                                      (needs $2M net worth)
//      Gold     $10M min · 3× XP, gold table look                      (needs $200M)
//      Diamond  $1B min · 5× XP, diamond look, 💎 on the leaderboard,   (needs $20B)
//               and Diamond-only items at Silas's shop
//    Payouts are the same at every table, so no table can be farmed for free money. If your net worth drops
//    below what a table needs, you're moved down to the best table you can afford.
//  • Silas's prices: the original price × (net worth ÷ $1M), never below the original.
//  • Drinks are a share of net worth (never below the old price): old fashioned 10%, hot cocoa 2%,
//    spiced cider 1%, eggnog 0.5%. Hot cocoa is still free while you're in debt.
// Friend challenges and duels aren't affected: that money is between players.

const worth=()=>Math.max(0,scoreNow());
const nice=n=>{ if(n<1000) return Math.round(n); const p=Math.pow(10,Math.floor(Math.log10(n))-1); return Math.round(n/p)*p; };
const wealthX=()=>Math.max(1,worth()/1e6);

/* ---------- VIP tables ---------- */
const VIP=[
  {id:'lodge',  name:'Lodge',  icon:'🪵',min:1e3,need:0,   xp:1,perks:'The regular tables'},
  {id:'silver', name:'Silver', icon:'🥈',min:1e5,need:2e6, xp:2,perks:'2× XP'},
  {id:'gold',   name:'Gold',   icon:'🥇',min:1e7,need:2e8, xp:3,perks:'3× XP · gold tables and chips'},
  {id:'diamond',name:'Diamond',icon:'💎',min:1e9,need:2e10,xp:5,perks:'5× XP · diamond tables · 💎 on the leaderboard · Diamond-only shop items'},
];
let vipNoted='';
function vipTier(){
  const want=VIP.findIndex(v=>v.id===S.vip), w=worth(); let i=want<0?0:want;
  while(i>0&&w<VIP[i].need) i--;
  if(want>0&&i<want&&vipNoted!==S.vip){ vipNoted=S.vip; setTimeout(()=>toast(`Moved to the ${VIP[i].name} table — ${VIP[want].name} needs ${k$(VIP[want].need)}`,'gold'),600); }
  return VIP[i];
}
const tableMin=()=>vipTier().min;
const slotMin=()=>vipTier().min;
function vipLook(){ const t=vipTier().id; document.body.classList.remove('vip-silver','vip-gold','vip-diamond'); if(t!=='lodge') document.body.classList.add('vip-'+t); }
function vipOpen(){
  const cur=vipTier().id, w=worth();
  modal(`<div class="fgm-k">Choose your table</div><p class="small muted" style="margin:-4px 0 12px">Your minimum bet stays put until you change it. Payouts are the same everywhere — higher tables earn XP faster and bring VIP perks.</p>
    <div class="vipx">${VIP.map(v=>{ const ok=w>=v.need, on=v.id===cur;
      return `<button class="vipx-t t-${v.id} ${on?'on':''}" data-a="vipPick" data-v="${v.id}" ${ok?'':'disabled'}><span class="vipx-ic">${v.icon}</span>
        <div><b>${v.name}</b><span>Min bet ${k$(v.min)}</span><small>${esc(v.perks)}</small></div>
        <i>${on?'Your table':ok?'Sit here':'Needs '+k$(v.need)}</i></button>`; }).join('')}</div>`);
}
Object.assign(ACT,{
  vipOpen:()=>vipOpen(),
  vipPick:el=>{ const v=VIP.find(x=>x.id===el.dataset.v); if(!v||worth()<v.need) return; S.vip=v.id; vipNoted='';
    if(VIP.indexOf(v)>VIP.findIndex(x=>x.id===S.vipBest)) S.vipBest=v.id;
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
const diamondOk=()=>S.vipBest==='diamond';
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
  return _gameHeadE(key,title)+`<button class="tblmin t-${t.id}" data-a="vipOpen" title="Choose your table"><i>${t.icon}</i>${t.name} table · min <b class="mono">${cmp$(t.min)}</b><span class="tblmin-c">Change ▾</span></button>`; };
const _renderV=render; render=function(){ _renderV(); if(S.mode!=='casino') document.body.classList.remove('vip-silver','vip-gold','vip-diamond'); };
const _renderSlipE=renderSlip;
renderSlip=function(){ _renderSlipE(); const m=tableMin(); if(m>1000&&$('#sheet').classList.contains('on')){ const a=$('#sheet .amts'); if(a) a.insertAdjacentHTML('beforebegin',`<div class="small muted" style="margin:10px 0 -4px">${vipTier().name} table minimum: <b class="gold">${fmt$(m)}</b></div>`); } };
const _bankSheetE=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheetE(el); const t=vipTier();
  $('#sheet').insertAdjacentHTML('beforeend',`<button class="btn wide" style="margin-top:12px" data-a="vipOpen">${t.icon} ${t.name} table · min ${k$(t.min)} · change</button>`); };
