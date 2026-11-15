// The economy: making big money hard.
//  • High-roller limit: once you're worth $100M or more, any win pays back at most 1.2× your bet
//    (so the most a single bet can earn is 20% profit). Below $100M everything pays as normal.
//  • The old fashioned (2× bets, 5× wins) costs $25M or 10% of what you're worth, whichever is more.
//    Hot cocoa and spiced cider cost more too.
//  • Everything Silas sells costs 25× what it used to. (League prizes are still won, never bought.)
// The challenge pot between friends isn't limited: that money comes from another player, not the house.

const HR_LIMIT=100_000_000, HR_MAX=1.2, SHOP_MARKUP=25;
const highRoller=()=>scoreNow()>=HR_LIMIT;
let hrNoted=false;
// ret = everything paid back for a bet; stake = that bet. Over the limit, cap ret at 1.2× the stake.
function capWin(ret,stake){
  if(!(ret>0)||!(stake>0)||!highRoller()) return ret;
  const max=Math.round(stake*HR_MAX); if(ret<=max) return ret;
  if(!hrNoted){ hrNoted=true; setTimeout(()=>toast('High-roller limit: over $100M, wins pay at most 1.2× your bet','gold'),900); }
  return max;
}
// Every game's payout goes through boostRet (drink powers); slots call capWin directly.
const _boostRetE=boostRet;
boostRet=function(ret,stake,x){ return capWin(_boostRetE(ret,stake,x),stake); };

// Drinks.
for(const d of DRINKS){ if(d.id==='cocoa') d.price=1_000_000; if(d.id==='cider') d.price=500_000; if(d.id==='eggnog') d.price=50_000; }
const _drinkPriceE=drinkPrice;
drinkPrice=function(d){ if(d.id==='oldfash') return Math.max(25_000_000,Math.round(scoreNow()*.1/1e5)*1e5); return _drinkPriceE(d); };

// The shop.
for(const it of ITEMS){ if(!it.free&&!it.league&&it.price>0&&!it._marked){ it.price*=SHOP_MARKUP; it._marked=1; } }

// The bankroll sheet explains the limit.
const _bankSheetE=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheetE(el);
  $('#sheet').insertAdjacentHTML('beforeend',`<p class="small muted" style="text-align:center;margin-top:10px">${highRoller()?'<b class="gold">High-roller limit is on.</b> ':''}Once you’re worth $100M or more, a win pays at most 1.2× your bet.</p>`); };
