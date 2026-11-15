// Buy all: one button in Silas's shop that buys every item you've unlocked (your level is high enough)
// and don't own yet, in the tab and filter you're looking at. Cheapest first, until the money runs out.
// Nothing is put on; find the clothes in your Closet and the decor in My Room.

const shopUnowned=()=>{ const lv=myLevel(); return shopList().filter(i=>!owns(i.id)&&i.lvl<=lv&&(!i.diamond||(typeof diamondOk==='function'&&diamondOk()))).sort((a,b)=>shopPrice(a)-shopPrice(b)); };
const _renderShopBA=renderShop;
renderShop=function(){
  _renderShopBA();
  const box=LODGE.el&&LODGE.el.querySelector('.lg-shop'), cnt=box&&box.querySelector('.lg-count');
  if(!cnt||SHOP.sel||SHOP.tab==='closet') return;
  const L=shopUnowned(); if(!L.length){ SHOP.allAsk=false; return; }
  const total=L.reduce((s,i)=>s+shopPrice(i),0);
  let n=0,sum=0; for(const i of L){ if(sum+shopPrice(i)>S.bank) break; sum+=shopPrice(i); n++; }
  const label=SHOP.allAsk?(n===L.length?`Tap again · buy ${n} for ${k$(total)}`:n?`Tap again · buy ${n} of ${L.length} for ${k$(sum)}`:'Not enough money'):`Buy all unlocked · ${L.length} for ${k$(total)}`;
  cnt.insertAdjacentHTML('beforeend',`<button class="lg-btn ${SHOP.allAsk?'lg-gold':''} lg-buyall" data-lg="shopBuyAll" ${SHOP.allAsk&&!n?'disabled':''}>${label}</button>`);
};
Object.assign(LG_ACT,{
  shopBuyAll:()=>{
    if(!SHOP.allAsk){ SHOP.allAsk=true; renderShop(); setTimeout(()=>{ if(SHOP.allAsk){ SHOP.allAsk=false; if(LODGE.el&&LODGE.el.querySelector('.lg-shop')) renderShop(); } },6000); return; }
    SHOP.allAsk=false; const L=shopUnowned(); let sum=0; const got=[];
    for(const i of L){ const pr=shopPrice(i); if(sum+pr>S.bank) break; sum+=pr; got.push(i.id); }
    if(!got.length){ toast('Not enough in the bankroll','loss'); renderShop(); return; }
    setBank(-sum); S.spent=(S.spent||0)+sum; S.lodge.owned=(S.lodge.owned||[]).concat(got); save(); hudBank();
    [784,988,1175,1568,2093].forEach((f,i)=>tone(f,.12,'square',.05,i*.07));
    try{ const b=LODGE.el.querySelector('.lg-stage').getBoundingClientRect(); fx.burst(b.left+b.width/2,b.top+b.height*.35,90,'#ecd9a8'); fx.confetti(120); }catch(e){}
    toast(`Bought ${got.length} item${got.length>1?'s':''} for ${fmt$(sum)}`+(got.length<L.length?` · ${L.length-got.length} left (not enough money)`:''),'gold');
    renderShop(); const s2=document.getElementById('lgSilas'); if(s2) typeLine(s2,'The whole lot? Now that’s a customer.');
  },
});
// switching tabs or filters cancels a half-confirmed "buy all"
for(const k of ['shopTab','shopSub']){ const f=LG_ACT[k]; LG_ACT[k]=b=>{ SHOP.allAsk=false; f(b); }; }
