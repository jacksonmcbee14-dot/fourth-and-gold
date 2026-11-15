// The economy scales with your net worth (cash + open bets − debt), so nobody can break the game.
//  • Table minimum: the smallest bet you can make grows faster than your money does —
//      net worth² ÷ $20B, never under $1,000 and never over 10% of your net worth.
//      $10M → $5K · $50M → $130K · $100M → $500K · $500M → $13M · $1B → $50M · $2B and up → 10%.
//    Rich players have to swing big every time, and the house edge does the rest. Wins are never capped.
//  • Silas's prices: the original price × (net worth ÷ $1M), never below the original.
//    Something that's 2% of $1M is 2% of $1B too.
//  • Drinks are a share of net worth (never below the old price): old fashioned 10%, hot cocoa 2%,
//    spiced cider 1%, eggnog 0.5%. Hot cocoa is still free while you're in debt.
// Friend challenges and duels aren't affected: that money is between players.

const worth=()=>Math.max(0,scoreNow());
const nice=n=>{ if(n<1000) return Math.round(n); const p=Math.pow(10,Math.floor(Math.log10(n))-1); return Math.round(n/p)*p; };
function tableMin(){ const w=worth(); return Math.max(1000,nice(Math.min(w*w/2e10,w*.10))); }
const wealthX=()=>Math.max(1,worth()/1e6);

// Prices follow your net worth. Each item keeps its original price as a base.
for(const it of ITEMS){ if(it.free||it.league||!(it.price>0)||it._base) continue; const base=it.price; it._base=base;
  Object.defineProperty(it,'price',{get(){ return nice(base*wealthX()); },configurable:true}); }
const DRINK_PCT={oldfash:.10,cocoa:.02,cider:.01,eggnog:.005};
const _drinkPriceE=drinkPrice;
drinkPrice=function(d){ const base=_drinkPriceE(d); if(base===0) return 0; return Math.max(base,nice(worth()*(DRINK_PCT[d.id]||0))); };

/* ---------- Enforcing the table minimum ---------- */
const belowMin=amt=>{ const m=tableMin(); if(amt>=m) return false; toast('Table minimum at your bankroll: '+fmt$(m),'loss'); return true; };
const _rSpinE=rSpin; rSpin=function(){ if(!RL.spinning&&rTotal()>0&&belowMin(rTotal())) return; return _rSpinE.apply(this,arguments); };
const _bjDealE=bjDeal; bjDeal=function(){ if(BJ.bet>0&&belowMin(BJ.bet)) return; return _bjDealE.apply(this,arguments); };
const _vpDealE=vpDeal; vpDeal=function(){ if(VP.phase==='bet'&&belowMin(VP.unit*VP.coins)) return; return _vpDealE.apply(this,arguments); };
const _crbetE=ACT.crbet; ACT.crbet=el=>{ if(!CR.rolling&&belowMin(S.chip)) return; _crbetE(el); };
const _slotSpinE=slotSpin;
slotSpin=function(){ if(!SL.spinning&&!(SL.fs>0)&&S.slotBet<tableMin()){ S.slotBet=tableMin(); save(); slUI(); toast('Bet raised to the table minimum: '+fmt$(S.slotBet),'gold'); }
  return _slotSpinE.apply(this,arguments); };
const _placeE=ACT.placeSlip; ACT.placeSlip=el=>{ const c=slipCalc(); if(c.legs.length&&c.stake>0&&belowMin(c.stake)) return; _placeE(el); };

// Slots: the − / + buttons step through bets at or above the minimum, and a bet below it is raised.
function slotLadder(){ const m=tableMin(), L=SLOT_BETS.filter(v=>v>=m); for(const k of [1,2.5,5,10,25,50,100]){ const v=nice(m*k); if(!L.includes(v)&&v>=m) L.push(v); } return L.sort((a,b)=>a-b).filter(v=>v<=Math.max(S.bank,m)).slice(0,10); }
ACT.slBet=el=>{ if(SL.spinning||SL.fs>0) return; const L=slotLadder(), d=+el.dataset.v; let i=L.findIndex(v=>v>=S.slotBet);
  if(i<0) i=d>0?L.length-1:L.length-2; else if(L[i]===S.slotBet) i+=d; else if(d<0) i--;
  i=clamp(i,0,L.length-1); S.slotBet=L[i]; save(); slUI(); tone(500+i*60,.06,'square',.04); };
const _slUIE=slUI; slUI=function(){ if(!SL.spinning&&!(SL.fs>0)&&S.slotBet<tableMin()){ S.slotBet=tableMin(); save(); } return _slUIE.apply(this,arguments); };

/* ---------- Showing it ---------- */
const _gameHeadE=gameHead;
gameHead=function(key,title){ const h=_gameHeadE(key,title), m=tableMin(); return m>1000?h+`<div class="tblmin" title="The minimum bet grows with your bankroll"><i></i>Min bet <b class="mono">${cmp$(m)}</b></div>`:h; };
const _renderSlipE=renderSlip;
renderSlip=function(){ _renderSlipE(); const m=tableMin(); if(m>1000&&$('#sheet').classList.contains('on')){ const a=$('#sheet .amts'); if(a) a.insertAdjacentHTML('beforebegin',`<div class="small muted" style="margin:10px 0 -4px">Minimum bet at your bankroll: <b class="gold">${fmt$(m)}</b></div>`); } };
const _bankSheetE=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheetE(el);
  $('#sheet').insertAdjacentHTML('beforeend',`<p class="small muted" style="text-align:center;margin-top:10px">Your table minimum is <b class="gold">${fmt$(tableMin())}</b>. The richer you are, the bigger every bet has to be — and the more things cost.</p>`); };
