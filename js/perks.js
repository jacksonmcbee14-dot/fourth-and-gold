// What makes spending worth it (items are defined in js/lodge/extras-items.js):
//  • Your stuff counts toward your net worth at 60% of what you paid, and Silas buys it back for that.
//  • Perk items: rabbit's foot (+50% daily bonus), smart watch and hot tub (+10% XP each), mini fridge
//    (drinks last 15 minutes), grandfather clock (the daily streak survives a missed day), TV (bigger odds boost).
//  • Collections: finish a set for a one-time +1,000 XP and +5% XP for good, per set.
//  • The limited shelf: four exclusive pieces a week, gone on Monday.

/* ---------- Net worth includes what you own ---------- */
const RESALE=.6;
function paidFor(id){ const it=ITEM[id]; if(!it||it.free||it.league) return 0; const p=(S.lodge.paid||{})[id]; return p!=null?p:(it._base||0); }
function assetValue(){ return Math.round((S.lodge&&S.lodge.owned||[]).reduce((s,id)=>s+paidFor(id)*RESALE,0)); }
function notePaid(ids,prices){ S.lodge.paid=S.lodge.paid||{}; ids.forEach((id,i)=>S.lodge.paid[id]=prices[i]); }
// Buying keeps 60% of the price as value, so only the other 40% counts as "spent" for league scores.
const _buyItemP=buyItem;
buyItem=function(id){ const it=ITEM[id];
  if(it&&it.limited&&!limitedNow().some(x=>x.id===id)&&!owns(id)){ toast('That one’s off the shelf this week','loss'); return; }
  const before=S.bank, had=owns(id); _buyItemP(id); const paid=before-S.bank;
  if(!had&&owns(id)&&paid>0){ notePaid([id],[paid]); S.spent=(S.spent||0)-paid*RESALE; save(); checkSets(); } };
function sellItem(id){
  const it=ITEM[id]; if(!it||!owns(id)||it.free||it.league) return;
  const v=Math.round(paidFor(id)*RESALE);
  S.lodge.owned=(S.lodge.owned||[]).filter(x=>x!==id); if(S.lodge.paid) delete S.lodge.paid[id];
  for(const k in (S.lodge.outfit||{})) if(S.lodge.outfit[k]===id) delete S.lodge.outfit[k];
  S.lodge.room=(S.lodge.room||[]).filter(p=>p.id!==id);
  S.bank=Math.round(S.bank+v); save(); if(typeof hudBank==='function') hudBank(); const el=$('#bankVal'); if(el) el.textContent=bank$(S.bank);
  tone(660,.08,'square',.04); toast(`Sold ${it.name} to Silas for ${fmt$(v)}`,'gold');
}
// The bankroll sheet shows the split.
const _bankSheetP=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheetP(el); const a=assetValue(); if(!a) return;
  const big=$('#sheet .mono'); if(big) big.insertAdjacentHTML('afterend',`<div class="small muted" style="margin:-2px 0 8px">Cash ${fmt$(S.bank)} · your stuff ${fmt$(a)} · net worth <b class="gold">${fmt$(scoreNow())}</b></div>`); };

/* ---------- Perks ---------- */
const has=id=>owns(id);
const _gainXPP=gainXP;
gainXP=function(n,why,capped){ if(n>0){ let k=1; if(has('watch_smart')) k+=.1; if(has('decor_hottub')) k+=.1; k+=.05*setsDone().length; n=Math.round(n*k); } return _gainXPP(n,why,capped); };
const _dailyClaimP=ACT.dailyClaim;
ACT.dailyClaim=el=>{ const st=dailyState(); const amt=st.ready?DAILY[st.streak-1]:0; _dailyClaimP(el); if(amt&&has('acc_rabbitfoot')){ const extra=Math.round(amt*.5); addGift(extra); setTimeout(()=>toast('🐇 Rabbit’s foot: +'+fmt$(extra),'gold'),900); } };
const _dailyStateP=dailyState;
dailyState=function(){ const r=_dailyStateP(); const d=S.daily||{};
  if(r.ready&&r.streak===1&&has('decor_grandfather')&&d.day){ const two=new Date(); two.setDate(two.getDate()-2); const k=two.getFullYear()+'-'+(two.getMonth()+1)+'-'+two.getDate();
    if(d.day===k) return Object.assign(r,{streak:(d.streak||0)%7+1}); }
  return r; };
const _orderDrinkP=orderDrink;
orderDrink=function(id){ const before=S.lodge.drink&&S.lodge.drink.until; _orderDrinkP(id); const d=S.lodge.drink; if(has('decor_fridge')&&d&&d.until!==before){ d.until+=5*60e3; save(); } };

/* ---------- Collections ---------- */
function setItems(s){
  if(s.items) return s.items.filter(id=>ITEM[id]);
  if(s.id==='art') return ITEMS.filter(i=>/^decor_paint_/.test(i.id)).map(i=>i.id);
  if(s.id==='watches') return ITEMS.filter(i=>i.slot==='watch'&&!i.league&&!i.diamond&&!i.limited).map(i=>i.id);
  return [];
}
const setsDone=()=>SETS.filter(s=>S.lodge.sets&&S.lodge.sets[s.id]);
function checkSets(){
  S.lodge.sets=S.lodge.sets||{}; let any=null;
  for(const s of SETS){ if(S.lodge.sets[s.id]) continue; const L=setItems(s); if(L.length&&L.every(id=>owns(id))){ S.lodge.sets[s.id]=Date.now(); any=s; } }
  if(any){ save(); gainXP(1000,'Set complete',false); celebrate('Collection complete!',`${any.icon} ${any.name}`,'+1,000 XP · +5% XP for good'); }
}
setInterval(checkSets,4000);

/* ---------- The shop: Limited and Sets tabs, and selling things back ---------- */
shopList=function(){
  const subs=SHOP_SUBS[SHOP.tab], sub=subs&&SHOP.sub!=='all'?SHOP.sub:null;
  return ITEMS.filter(i=>i.cat===SHOP.tab&&!i.free&&!i.league&&!i.limited&&(!sub||i.sub===sub)).sort((a,b)=>a.lvl-b.lvl||a.price-b.price);
};
const shopTile=i=>{ const mine=owns(i.id); return `<button class="lg-item ${i.perk?'perk':''}" data-lg="shopSel" data-id="${i.id}"><span class="lg-ic" data-ic="${i.id}"></span><span class="lg-in">${esc(i.name)}</span><span class="lg-ip">${mine?'OWNED':k$(shopPrice(i))}</span></button>`; };
const _renderShopP=renderShop;
renderShop=function(){
  _renderShopP();
  const box=LODGE.el&&LODGE.el.querySelector('.lg-shop'); if(!box) return;
  const it=SHOP.sel&&ITEM[SHOP.sel];
  if(it&&!SHOP.confirm&&owns(it.id)&&!it.free&&!it.league){
    const row=box.querySelector('.lg-prev .lg-row'); if(row) row.insertAdjacentHTML('afterbegin',`<button class="lg-btn" data-lg="shopSell">Sell · ${k$(Math.round(paidFor(it.id)*RESALE))}</button>`);
  }
  if(it&&it.perk){ const d=box.querySelector('.lg-prev-desc'); if(d) d.classList.add('has-perk'); }
  if(SHOP.sel) return;
  const body=box.querySelector('.lg-shop-body'); if(!body) return;
  if(SHOP.tab==='limited'){
    const L=limitedNow(), left=weekLeft();
    body.innerHTML=`<div class="lg-prev-desc">This week only. New pieces every Monday — <b>${left}</b> left. Once they’re gone, they’re gone.</div><div class="lg-grid">${L.map(shopTile).join('')}</div>`;
  } else if(SHOP.tab==='sets'){
    body.innerHTML=`<div class="lg-prev-desc">Finish a collection for +1,000 XP and +5% XP for good. ${setsDone().length} of ${SETS.length} done.</div>`+SETS.map(s=>{ const L=setItems(s), n=L.filter(owns).length, done=S.lodge.sets&&S.lodge.sets[s.id];
      return `<div class="lg-set ${done?'done':''}"><div class="lg-set-h"><span>${s.icon} ${esc(s.name)}</span><span>${done?'COMPLETE':n+' / '+L.length}</span></div><i><b style="width:${L.length?n/L.length*100:0}%"></b></i>
        <div class="lg-set-items">${L.map(id=>`<button class="lg-set-it ${owns(id)?'own':''}" data-lg="shopSetSel" data-id="${id}"><span class="lg-ic" data-ic="${id}"></span></button>`).join('')}</div></div>`; }).join('');
  } else return;
  body.querySelectorAll('[data-ic]').forEach(s=>{ if(!s.firstChild&&ITEM[s.dataset.ic]) s.appendChild(iconCanvas(ITEM[s.dataset.ic],SHOP.tab==='sets'?1:2)); });
};
Object.assign(LG_ACT,{
  shopSell:()=>{ const id=SHOP.sel; if(!id) return; sellItem(id); SHOP.sel=null; renderShop(); },
  shopSetSel:b=>{ const it=ITEM[b.dataset.id]; if(!it) return; SHOP.tab=it.cat==='decor'?'decor':it.cat; SHOP.sub='all'; SHOP.sel=it.id; renderShop(); },
});
