// 💎 Monthly rares and the player market (Silas's shop: the Rares and Market tabs). supabase/update-25-rares-market.sql
//  • Rares: three pieces a month, only 10 of each ever made, numbered #1–#10. When the month ends they're retired
//    for good — the only way to get one after that is to buy it from another player.
//  • Market: list anything you own at your own price (open it in the shop → "Sell to players"). Other players buy it;
//    the money lands in your bankroll and the piece (and its serial number) moves to them.

/* ---------- The rare pieces ---------- */
const RARE_ART={
  globe:{name:'Frost globe',w:14,h:16,base:(c,x,y)=>{ rect(c,x+1,y+12,12,4,'#6b3a1f'); rect(c,x+1,y+12,12,1,'#c8a45c'); for(let yy=0;yy<12;yy++){ const w=Math.round(6*Math.sqrt(1-((yy-5.5)/6)**2)); rect(c,x+7-w,y+yy,w*2,1,'#bff6ff'); } rect(c,x+6,y+6,2,5,'#2a6a3a'); rect(c,x+5,y+8,4,2,'#2a6a3a'); rect(c,x+3,y+2,2,1,'#ffffff'); },
    anim:(c,x,y,t)=>{ for(let i=0;i<5;i++){ const k=(t*.4+i*.2)%1; rect(c,x+3+((i*3)%8),y+1+Math.round(k*9),1,1,'#ffffff'); } }},
  swan:{name:'Ice swan',w:18,h:16,base:(c,x,y)=>{ rect(c,x+2,y+9,14,6,'#bff6ff'); rect(c,x+4,y+8,10,2,'#dffbff'); rect(c,x+12,y+2,3,8,'#bff6ff'); rect(c,x+13,y+1,4,3,'#dffbff'); rect(c,x+16,y+2,2,1,'#7fd0ff'); rect(c,x,y+15,18,1,'#7fd0ff'); } ,anim:(c,x,y,t)=>{ if(Math.sin(t*3)>.7) rect(c,x+5,y+10,1,1,'#ffffff'); }},
  aurora:{name:'Aurora lamp',w:10,h:22,base:(c,x,y)=>{ rect(c,x+3,y+18,4,4,'#3a3a44'); rect(c,x+4,y+10,2,8,'#5a5a64'); },
    anim:(c,x,y,t)=>{ for(let i=0;i<10;i++) rect(c,x+1+(i%8),y+1+Math.floor(i/8)*2,1,8-(i%3),`hsl(${(i*30+t*90)%360},90%,65%)`); }},
  champagne:{name:'Champagne tower',w:18,h:18,base:(c,x,y)=>{ rect(c,x,y+16,18,2,'#c8a45c'); for(let r=0;r<4;r++) for(let k=0;k<4-r;k++){ const gx=x+1+k*4+r*2, gy=y+12-r*4; rect(c,gx,gy,4,1,'#ffe9a8'); rect(c,gx+1,gy+1,2,2,'#ffd84a'); rect(c,gx+1.5,gy+3,1,1,'#cfd9e0'); } },
    anim:(c,x,y,t)=>{ for(let i=0;i<3;i++){ const k=(t*.8+i*.33)%1; rect(c,x+8+i,y+2+Math.round(k*12),1,1,'#fff3b0'); } }},
  disco:{name:'Disco ball',w:14,h:22,base:(c,x,y)=>{ rect(c,x+6,y,2,6,'#8a929e'); for(let yy=-6;yy<=6;yy++)for(let xx=-6;xx<=6;xx++) if(xx*xx+yy*yy<=36) rect(c,x+7+xx,y+13+yy,1,1,((xx+yy)&1)?'#cfd9e0':'#8a929e'); },
    anim:(c,x,y,t)=>{ for(let i=0;i<4;i++){ const a=t*2+i*1.6; rect(c,x+7+Math.round(Math.cos(a)*5),y+13+Math.round(Math.sin(a)*5),1,1,`hsl(${(i*90+t*120)%360},100%,70%)`); } }},
  clock:{name:'Diamond clock',w:12,h:24,base:(c,x,y)=>{ rect(c,x+1,y+2,10,22,'#2a1a3a'); rect(c,x,y,12,3,'#c8a45c'); rect(c,x+3,y+5,6,6,'#bff6ff'); rect(c,x+5,y+6,1,3,'#16161c'); rect(c,x+5,y+8,3,1,'#16161c'); rect(c,x+4,y+14,4,8,'#3a2a4a'); },
    anim:(c,x,y,t)=>{ rect(c,x+5+Math.round(Math.sin(t*3)*1.5),y+20,2,2,'#ffd84a'); }},
  cornucopia:{name:'Golden cornucopia',w:18,h:12,base:(c,x,y)=>{ for(let i=0;i<14;i++) rect(c,x+i,y+4+Math.round(i/5),1,8-Math.round(i/3),'#c8a45c'); rect(c,x+12,y+3,3,3,'#e0203a'); rect(c,x+14,y+5,3,3,'#ffd84a'); rect(c,x+11,y+6,3,3,'#3a8a3a'); rect(c,x+15,y+8,3,3,'#b03aff'); } },
  crown:{name:'Crown on a pillow',w:16,h:14,base:(c,x,y)=>{ rect(c,x,y+9,16,5,'#9a2a35'); rect(c,x+1,y+8,14,2,'#b0102a'); rect(c,x+3,y+4,10,4,'#ffd84a'); for(const k of [3,7,11]) rect(c,x+k,y+1,2,3,'#ffd84a'); rect(c,x+7,y+5,2,2,'#3a7aff'); rect(c,x+4,y+5,1,1,'#e0203a'); rect(c,x+11,y+5,1,1,'#e0203a'); },
    anim:(c,x,y,t)=>{ if(Math.sin(t*2.5)>.8) rect(c,x+8,y+5,1,1,'#ffffff'); }},
  dragon:{name:'Jade dragon',w:20,h:14,base:(c,x,y)=>{ rect(c,x,y+12,20,2,'#5a3a2a'); for(let i=0;i<16;i++) rect(c,x+2+i,y+6+Math.round(Math.sin(i*.8)*2),2,3,'#3ac08a'); rect(c,x+16,y+2,4,4,'#3ac08a'); rect(c,x+18,y+3,1,1,'#ffd84a'); rect(c,x+15,y+1,2,1,'#2a8a5a'); } },
};
const RARE_KEYS=Object.keys(RARE_ART), RARE_COPIES=10;
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function rareMonth(d){ const p={}; new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric'}).formatToParts(d||new Date()).forEach(x=>p[x.type]=x.value); return p.year+String(p.month).padStart(2,'0'); }
function rareSet(ym){ const n=+ym.slice(0,4)*12+(+ym.slice(4)-1), start=(n*3)%RARE_KEYS.length; return [0,1,2].map(k=>RARE_KEYS[(start+k)%RARE_KEYS.length]); }
// Static art drawn once onto its own canvas, then stamped (same as the catalog's pieces).
function rareBake(it){ const base=it.base, anim=it.anim; let cv=null; delete it.base; delete it.anim;
  DECOR_ART[it.id]=(c,x,y,t)=>{ if(!cv){ cv=document.createElement('canvas'); cv.width=it.w+8; cv.height=it.h+8; const g=cv.getContext('2d'); g.imageSmoothingEnabled=false; base(g,4,4); } c.drawImage(cv,x-4,y-4); if(anim) anim(c,x,y,t||0); }; }
function ensureRare(id){
  if(ITEM[id]) return ITEM[id]; const m=/^decor_rare_([a-z]+)_(\d{6})$/.exec(id||''); if(!m||!RARE_ART[m[1]]) return null;
  const A=RARE_ART[m[1]], ym=m[2], rank=rareSet(ym).indexOf(m[1]), mult=[1,1.4,2][Math.max(0,rank)];
  const it={id,cat:'decor',sub:'treasure',rare:1,name:`${A.name} · ${MONTHS[+ym.slice(4)-1]} ’${ym.slice(2,4)}`,lvl:1,w:A.w,h:A.h,desc:`One of only ${RARE_COPIES} ever made. Retired when the month ends.`,base:A.base,anim:A.anim};
  const base=Math.round(1e6*mult); it._base=base; Object.defineProperty(it,'price',{get(){ return nice(base*(typeof wealthX==='function'?wealthX():1)); },configurable:true});
  rareBake(it); ITEMS.push(it); ITEM[id]=it;
  return it;
}
const rareNow=()=>{ const ym=rareMonth(); return rareSet(ym).map(k=>ensureRare('decor_rare_'+k+'_'+ym)); };
const scanRares=list=>(Array.isArray(list)?list:[]).forEach(x=>ensureRare(typeof x==='string'?x:x&&x.id));
function rareBoot(){ rareNow(); scanRares(S.lodge.owned); scanRares(S.lodge.room); Object.values(S.lodge.rooms||{}).forEach(scanRares); }
rareBoot();
const _adoptStateR=adoptState; adoptState=function(st){ _adoptStateR(st); rareBoot(); };
const _drawFriendRoomR=drawFriendRoom; drawFriendRoom=function(cv,d){ if(d){ scanRares(d.room); Object.values(d.rooms||{}).forEach(scanRares); } return _drawFriendRoomR(cv,d); };
const _shopListR=shopList; shopList=function(){ return _shopListR().filter(i=>!i.rare); };
const serialOf=id=>S.lodge.serials&&S.lodge.serials[id];
function monthLeft(){ const now=new Date(), p={}; new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now).forEach(x=>p[x.type]=x.value);
  const dim=new Date(+p.year,+p.month,0).getDate(), d=dim-(+p.day)+1; return d>1?d+' days':'today'; }

/* ---------- The Rares and Market tabs ---------- */
const MK={list:null,at:0,stock:{}};
const _renderShopR=renderShop;
renderShop=function(){ _renderShopR(); const box=LODGE.el&&LODGE.el.querySelector('.lg-shop'); if(!box) return;
  const tabs=box.querySelector('.lg-tabs'); if(tabs&&!tabs.querySelector('[data-v=rares]')) tabs.insertAdjacentHTML('beforeend',[['rares','Rares'],['market','Market']].map(([k,l])=>`<button class="lg-tab ${SHOP.tab===k?'on':''}" data-lg="shopTab" data-v="${k}">${l}</button>`).join(''));
  const it=SHOP.sel&&ITEM[SHOP.sel], body=box.querySelector('.lg-shop-body');
  if(it&&!SHOP.confirm){ const name=box.querySelector('.lg-prev .lg-prev-name');
    if(it.rare&&name){ const s=serialOf(it.id), left=RARE_COPIES-(MK.stock[it.id]||0); name.insertAdjacentHTML('afterend',`<div class="lg-prev-desc gold">💎 ${s?'Yours is #'+s+' of '+RARE_COPIES:it.id.endsWith(rareMonth())?left+' of '+RARE_COPIES+' left · retires in '+monthLeft():'Retired — only on the market now'}</div>`); }
    if(owns(it.id)&&!it.free&&!it.league){ const row=box.querySelector('.lg-prev .lg-row'); if(row) row.insertAdjacentHTML('beforeend',`<button class="lg-btn" data-lg="mkSell">Sell to players</button>`); }
    if(it.rare&&!owns(it.id)){ const ask=box.querySelector('[data-lg=shopAsk]'); if(ask){ const live=it.id.endsWith(rareMonth())&&(MK.stock[it.id]||0)<RARE_COPIES; ask.dataset.lg=live?'rareBuy':''; ask.disabled=!live||shopPrice(it)>S.bank; if(!live) ask.textContent=it.id.endsWith(rareMonth())?'Sold out':'Retired'; } }
    return; }
  if(SHOP.sel||!body) return;
  if(SHOP.tab==='rares'){ const L=rareNow();
    body.innerHTML=`<div class="tchips"><span style="--d:0ms">💎 ${RARE_COPIES} ever</span><span style="--d:70ms">⏳ ${monthLeft()} left</span><span style="--d:140ms">🏷️ Then market only</span></div>
      <div class="lg-grid">${L.map(i=>{ const sold=MK.stock[i.id]||0, mine=owns(i.id); return `<button class="lg-item ${mine?'wearing':''}" data-lg="shopSel" data-id="${i.id}"><span class="lg-ic" data-ic="${i.id}"></span><span class="lg-in">${esc(i.name)}</span><span class="lg-ip">${mine?'#'+(serialOf(i.id)||'?'):sold>=RARE_COPIES?'SOLD OUT':(RARE_COPIES-sold)+' LEFT · '+k$(shopPrice(i))}</span></button>`; }).join('')}</div>`;
    srpc('fg_rare_stock',{p_items:L.map(i=>i.id)}).then(r=>{ if(r&&!r.error){ const ch=JSON.stringify(r)!==JSON.stringify(MK.stock); MK.stock=Object.assign(MK.stock,r); if(ch&&SHOP.tab==='rares'&&!SHOP.sel) renderShop(); } }).catch(()=>{}); }
  else if(SHOP.tab==='market'){ const L=MK.list;
    body.innerHTML=`<div class="tchips"><span style="--d:0ms">🛒 Buy from players</span><span style="--d:70ms">🏷️ Sell: open an item</span></div>
      ${L?(L.length?`<div class="mk-list">${L.map(m=>{ const it=ensureRare(m.item)||ITEM[m.item]; if(!it) return ''; return `<div class="mk-row"><span class="lg-ic" data-ic="${it.id}"></span><div><b>${esc(it.name)}${m.serial?' #'+m.serial:''}</b><small>${m.mine?'Your listing':'from '+esc(m.seller)}</small></div>
        ${m.mine?`<button class="lg-btn" data-lg="mkCancel" data-id="${m.id}">Cancel</button>`:`<button class="lg-btn lg-gold" data-lg="mkBuy" data-id="${m.id}" ${m.price>S.bank?'disabled':''}>${k$(m.price)}</button>`}</div>`; }).join('')}</div>`:'<div class="lg-prev-desc">Nothing for sale right now.</div>'):'<div class="lg-prev-desc">Loading the market…</div>'}`;
    if(!L||Date.now()-MK.at>15e3){ MK.at=Date.now(); srpc('fg_market_browse').then(r=>{ MK.list=Array.isArray(r)?r:[]; if(SHOP.tab==='market'&&!SHOP.sel) renderShop(); }).catch(()=>{ MK.list=[]; }); } }
  else return;
  body.querySelectorAll('[data-ic]').forEach(s=>{ if(!s.firstChild&&ITEM[s.dataset.ic]) s.appendChild(iconCanvas(ITEM[s.dataset.ic],2)); });
};
function shopGain(id,price,serial){ S.lodge.owned=(S.lodge.owned||[]).concat(id); if(serial) S.lodge.serials=Object.assign({},S.lodge.serials,{[id]:serial}); notePaid([id],[price]); S.spent=(S.spent||0)+price*(1-RESALE); }
Object.assign(LG_ACT,{
  rareBuy:async b=>{ const it=ITEM[SHOP.sel]; if(!it) return; const pr=shopPrice(it); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; } b.disabled=true;
    let r=null; try{ r=await srpc('fg_rare_buy',{p_item:it.id}); }catch(e){}
    if(!r||r.error){ toast({sold_out:'Sold out — all 10 are gone',retired:'That one has retired',have:'You already have one'}[r&&r.error]||'Couldn’t reach the server','loss'); renderShop(); return; }
    setBank(-pr); shopGain(it.id,pr,r.serial); MK.stock[it.id]=Math.max(MK.stock[it.id]||0,r.serial); save(); try{ fx.confetti(140); }catch(e){} [659,784,988,1319].forEach((f,i)=>tone(f,.1,'square',.05,i*.08));
    celebrate('💎 Rare #'+r.serial+' of '+RARE_COPIES,`You got the ${it.name}. Only ${RARE_COPIES} will ever exist.`,it.name,it.id); renderShop(); },
  mkSell:()=>{ const it=ITEM[SHOP.sel]; if(!it) return; const sug=nice(Math.max(1000,shopPrice(it)*(it.rare&&!it.id.endsWith(rareMonth())?2:1)));
    askAmount({title:'Sell '+it.name+' to players',value:sug,max:1e15,note:'Other players can buy it at this price',onSet:async v=>{ let r=null; try{ r=await srpc('fg_market_list',{p_item:it.id,p_price:Math.floor(v)}); }catch(e){}
      if(!r||r.error) toast({listed:'It’s already for sale',too_many:'You can list 10 things at a time',not_owned:'Save first — try again in a moment'}[r&&r.error]||'Couldn’t reach the server','loss'); else { toast('🏷️ Listed for '+k$(v),'gold'); MK.at=0; MK.list=null; }
      renderShop(); },onCancel:()=>renderShop()}); },
  mkCancel:async b=>{ try{ await srpc('fg_market_cancel',{p_id:+b.dataset.id}); }catch(e){} MK.at=0; MK.list=null; renderShop(); },
  mkBuy:async b=>{ const m=(MK.list||[]).find(x=>x.id===+b.dataset.id); if(!m) return; if(m.price>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    if(owns(m.item)){ toast('You already own one','loss'); return; } b.disabled=true;
    let r=null; try{ if(typeof cloudPush==='function') await cloudPush(); r=await srpc('fg_market_buy',{p_id:m.id}); }catch(e){}
    if(!r||r.error){ toast({gone:'Someone beat you to it',too_much:'Not enough saved yet — try again in a moment'}[r&&r.error]||'Couldn’t reach the server','loss'); MK.at=0; MK.list=null; renderShop(); return; }
    const it=ensureRare(r.item)||ITEM[r.item]; setBank(-r.price); shopGain(r.item,r.price,r.serial); save(); tone(784,.08,'square',.05);
    celebrate('🏷️ Bought it!',`${it?it.name:'It'}${r.serial?' #'+r.serial:''} from ${r.seller}.`,'-'+fmt$(r.price),r.item); MK.at=0; MK.list=null; },
});
// Your listing sold.
function marketInbox(it){ const id=it.item; ensureRare(id); setBank(it.amount);
  S.lodge.owned=(S.lodge.owned||[]).filter(x=>x!==id); const strip=a=>Array.isArray(a)?a.filter(p=>p.id!==id):a; S.lodge.room=strip(S.lodge.room); if(S.lodge.rooms) for(const k in S.lodge.rooms) S.lodge.rooms[k]=strip(S.lodge.rooms[k]);
  for(const m of ['tiers','paid','stolen','serials']) if(S.lodge[m]) delete S.lodge[m][id]; save();
  celebrate('🏷️ Sold!',`${it.label} bought your ${ITEM[id]?ITEM[id].name:'piece'}.`,'+'+fmt$(it.amount),id); }
