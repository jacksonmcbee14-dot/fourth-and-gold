// Drink powers: whatever you're holding from Mack's bar changes how the money works while it lasts (10 minutes).
//   Hot cocoa     — every win, in every game, pays 1.5× the normal winnings.
//   Spiced cider  — half price on everything in Silas's shop.
//   Old fashioned — you're a little drunk: every bet you make is automatically doubled,
//                   but when you win you get 5× the winnings that bet would normally pay.
//   Eggnog        — puts you in a full Santa suit for 5 minutes.
// The games call betX() when taking a stake and boostRet() when paying out.

const POWERS={
  cocoa:  '1.5× winnings on every game',
  cider:  'Half price at Silas’s shop',
  eggnog: 'Santa suit for 5 minutes',
  oldfash:'Every bet doubled · wins pay 5×',
};
const SANTA_MS=5*60e3;
const drinkOn=id=>{ const d=heldDrink(); return !!d&&d.id===id; };
// How much each bet is multiplied when you place it.
const betX=()=>drinkOn('oldfash')?2:1;
// How much the winnings (profit) of a bet are multiplied.
const winX=()=>drinkOn('oldfash')?5:drinkOn('cocoa')?1.5:1;
// ret = the total paid back; stake = the part of that which is your own bet coming back.
// Only the profit is boosted, so a push or a refund pays the same as always.
function boostRet(ret,stake,x){ if(x==null) x=winX(); const profit=ret-stake; return profit>0&&x!==1?Math.round(stake+profit*x):ret; }
// Not enough money for a doubled bet gets its own message.
const noFunds=()=>toast(betX()>1?'Not enough for the doubled bet (old fashioned)':'Not enough in the bankroll','loss');

// Spiced cider: half price at the shop.
const shopPrice=it=>drinkOn('cider')?Math.round(it.price/2):it.price;

// Eggnog: the Santa suit, beard and hat, worn over your outfit for 5 minutes.
ITEMS.push(
  {id:'suit_santa', cat:'special',slot:'body',name:'Santa suit',price:0,lvl:999,desc:'Eggnog does strange things.',colors:{c:LP.cran2,C:LP.snow2,w:LP.snow2,b:'#16161c',p:LP.cran2,o:'#16161c',h:LP.snow2}},
  {id:'beard_santa',cat:'special',slot:'glasses',name:'Santa beard',price:0,lvl:999,desc:'Ho ho ho.',grid:['','','','','','','','...wwwwww...','...wwwwww...','....wwww....'],pal:{w:LP.snow2}},
);
ITEM.suit_santa=ITEMS[ITEMS.length-2]; ITEM.beard_santa=ITEMS[ITEMS.length-1];
const santaOn=()=>(S.lodge.santaUntil||0)>Date.now();
const _lodgeLook=lodgeLook;
lodgeLook=function(){ return santaOn()?outfitLook({body:'suit_santa',glasses:'beard_santa',hat:'hat_santa'}):_lodgeLook(); };

// Ordering eggnog starts the Santa timer.
const _orderDrink=orderDrink;
orderDrink=function(id){
  const before=S.lodge.drink; _orderDrink(id);
  if(S.lodge.drink===before) return;   // didn't go through
  if(id==='eggnog'){ S.lodge.santaUntil=Date.now()+SANTA_MS; save(); toast('Ho ho ho! Santa suit for 5 minutes','gold'); }
  else toast(DRINKS.find(d=>d.id===id).name+' · '+POWERS[id],'gold');
};

// The bar menu shows what each drink does, and the Lodge HUD shows the power you have.
const _openBar=openBar;
openBar=function(){ _openBar();
  document.querySelectorAll('.lg-drink[data-id]').forEach(b=>{ const p=POWERS[b.dataset.id]; if(p) b.insertAdjacentHTML('beforeend',`<em>${p}</em>`); });
};
function powerNow(){
  const d=heldDrink(), bits=[];
  if(d&&d.id!=='eggnog') bits.push(d.name+': '+POWERS[d.id]+' · '+Math.ceil((S.lodge.drink.until-Date.now())/60e3)+' min left');
  if(santaOn()) bits.push('Santa suit · '+Math.ceil((S.lodge.santaUntil-Date.now())/60e3)+' min left');
  return bits.join(' · ');
}
const _hudBank=hudBank;
hudBank=function(){ _hudBank(); const b=document.getElementById('lgBank'); const p=powerNow(); if(b&&p) b.textContent+=' · '+p; };
// The bankroll sheet (classic view) also shows your active power.
const _bankSheet3=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheet3(el); const p=powerNow();
  if(p) $('#sheet').insertAdjacentHTML('beforeend',`<p class="small gold" style="text-align:center">🍸 ${esc(p)}</p>`); };
