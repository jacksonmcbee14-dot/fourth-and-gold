// The economy scales with your net worth (cash + open bets − debt), so nobody can break the game.
//  • Table minimum: the smallest bet you can make grows faster than your money does —
//      (net worth ÷ $100,000)² dollars, never under $1,000 and never over 25% of your net worth.
//      $5M → $2,500 · $10M → $10K · $50M → $250K · $100M → $1M · $500M → $25M · $1B → $100M · $2.5B+ → 25%.
//    Rich players have to swing big every time, and the house edge does the rest. Wins are never capped.
//  • Silas's prices: the original price × (net worth ÷ $1M), never below the original.
//    Something that's 2% of $1M is 2% of $1B too.
//  • Drinks are a share of net worth (never below the old price): old fashioned 10%, hot cocoa 2%,
//    spiced cider 1%, eggnog 0.5%. Hot cocoa is still free while you're in debt.
// Friend challenges and duels aren't affected: that money is between players.

const worth=()=>Math.max(0,scoreNow());
const nice=n=>{ if(n<1000) return Math.round(n); const p=Math.pow(10,Math.floor(Math.log10(n))-1); return Math.round(n/p)*p; };
function tableMin(){ const w=worth(); return Math.max(1000,nice(Math.min((w/1e5)**2,w*.25))); }
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

/* ---------- Showing it ---------- */
const _gameHeadE=gameHead;
gameHead=function(key,title){ const h=_gameHeadE(key,title), m=tableMin(); return m>1000?h+`<div class="tblmin">Table minimum <b class="mono">${fmt$(m)}</b> <span>· grows with your bankroll</span></div>`:h; };
const _renderSlipE=renderSlip;
renderSlip=function(){ _renderSlipE(); const m=tableMin(); if(m>1000&&$('#sheet').classList.contains('on')){ const a=$('#sheet .amts'); if(a) a.insertAdjacentHTML('beforebegin',`<div class="small muted" style="margin:10px 0 -4px">Minimum bet at your bankroll: <b class="gold">${fmt$(m)}</b></div>`); } };
const _bankSheetE=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheetE(el);
  $('#sheet').insertAdjacentHTML('beforeend',`<p class="small muted" style="text-align:center;margin-top:10px">Your table minimum is <b class="gold">${fmt$(tableMin())}</b>. The richer you are, the bigger every bet has to be — and the more things cost.</p>`); };
