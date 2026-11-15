// The merchant (Silas) and your closet: clothes, things to carry and room decor, bought with your bankroll.
// Bought items are yours until you reset your bankroll. Decor is placed in My Room (js/lodge/myroom.js).

const ITEMS=[
  // Coats, suits and tuxedos (recolour your coat, shirt and trousers)
  {id:'coat_lodge',  cat:'clothes',slot:'body',name:'Lodge coat',            price:0,      lvl:1, free:1,desc:'The cranberry coat you walked in with.',colors:{}},
  {id:'coat_pine',   cat:'clothes',slot:'body',name:'Pine hunting coat',     price:50000,  lvl:1, desc:'Warm, green and built for snow.',colors:{c:LP.pine4,C:LP.pine2,b:LP.brass1}},
  {id:'suit_tweed',  cat:'clothes',slot:'body',name:'Walnut tweed suit',     price:150000, lvl:3, desc:'Smells faintly of pipe smoke and old books.',colors:{c:LP.wal5,C:LP.wal4,w:LP.brass2,b:LP.wal1,p:LP.wal4}},
  {id:'suit_navy',   cat:'clothes',slot:'body',name:'Navy pinstripe suit',   price:300000, lvl:5, desc:'For people who read the odds board in ink.',colors:{c:'#1f2d4a',C:'#141d31',w:'#f3ead8',b:'#c0c8d8',p:'#141d31'}},
  {id:'coat_ember',  cat:'clothes',slot:'body',name:'Ember overcoat',        price:450000, lvl:7, desc:'The colour of the fire at two in the morning.',colors:{c:LP.emb0,C:'#8a4a1a',b:LP.brass2}},
  {id:'tux_midnight',cat:'clothes',slot:'body',name:'Midnight tuxedo',       price:750000, lvl:10,desc:'Black tie. The dealer stands up straighter.',colors:{c:'#16161c',C:'#0a0a0e',w:'#f3ead8',b:'#f3ead8',p:'#0a0a0e'}},
  {id:'jacket_velvet',cat:'clothes',slot:'body',name:'Velvet smoking jacket',price:1500000,lvl:15,desc:'Plum velvet with brass frogging.',colors:{c:'#5a0f2a',C:'#3a0818',w:LP.brass1,b:LP.brass2,p:'#16161c'}},
  {id:'tux_gold',    cat:'clothes',slot:'body',name:'Gold-lamé tuxedo',      price:3000000,lvl:20,desc:'You will be seen from orbit.',colors:{c:LP.brass1,C:LP.brass0,w:'#16161c',b:'#16161c',p:'#16161c'}},
  {id:'coat_legend', cat:'clothes',slot:'body',name:'Legend’s fur-trim coat',price:6000000,lvl:35,desc:'Only Legends of the Lodge may wear it.',colors:{c:'#2a1036',C:'#170820',w:'#f3ead8',b:LP.brass2}},
  // Scarves
  {id:'scarf_cream', cat:'clothes',slot:'scarf',name:'Cream scarf',     price:0,     lvl:1,free:1,desc:'Knitted by somebody’s grandmother.',colors:{w:LP.brass2}},
  {id:'scarf_tartan',cat:'clothes',slot:'scarf',name:'Tartan scarf',    price:25000, lvl:1,desc:'Red, festive, slightly itchy.',colors:{w:LP.cran2}},
  {id:'scarf_pine',  cat:'clothes',slot:'scarf',name:'Pine scarf',      price:25000, lvl:2,desc:'Matches the tree. Deliberately.',colors:{w:LP.pine5}},
  {id:'scarf_gold',  cat:'clothes',slot:'scarf',name:'Gold silk scarf', price:200000,lvl:8,desc:'Catches the firelight.',colors:{w:LP.brass1}},
  // Hats
  {id:'hat_beanie',cat:'clothes',slot:'hat',name:'Beanie',      price:20000,  lvl:1, desc:'With a pom-pom. Obviously.',grid:['......z.....','....xxxx....','...xxxxxx...','...xxxxxx...','...yyyyyy...'],pal:{x:LP.cran1,y:LP.cran0,z:LP.snow2}},
  {id:'hat_santa', cat:'clothes',slot:'hat',name:'Santa hat',   price:60000,  lvl:2, desc:'Ho ho ho.',grid:['.......w....','......xx....','.....xxxx...','....xxxxx...','...wwwwww...'],pal:{x:LP.cran2,w:LP.snow2}},
  {id:'hat_flat',  cat:'clothes',slot:'hat',name:'Flat cap',    price:80000,  lvl:3, desc:'Tweed. Tilted just so.',grid:['............','............','...xxxxxx...','...xxxxxx...','...yyyyyyyy.'],pal:{x:LP.wal5,y:LP.wal3}},
  {id:'hat_fedora',cat:'clothes',slot:'hat',name:'Fedora',      price:200000, lvl:6, desc:'Charcoal felt, cranberry band.',grid:['............','....xxxx....','....xxxx....','...yyyyyy...','.xxxxxxxxxx.'],pal:{x:'#2a2a30',y:LP.cran1}},
  {id:'hat_top',   cat:'clothes',slot:'hat',name:'Top hat',     price:500000, lvl:10,desc:'Adds two inches and a great deal of dignity.',grid:['....xxxx....','....xxxx....','....xxxx....','....yyyy....','..xxxxxxxx..'],pal:{x:'#121216',y:LP.cran1}},
  {id:'hat_crown', cat:'clothes',slot:'hat',name:'Lodge crown', price:5000000,lvl:35,desc:'Gold, with a ruby and a sapphire.',grid:['............','............','...y.y.y.y..','...yyyyyy...','...yrybyr...'],pal:{y:LP.brass1,r:LP.cran3,b:'#4a7fd0'}},
  // Watches and sunglasses
  {id:'watch_brass',  cat:'clothes',slot:'watch',name:'Brass watch',  price:60000,  lvl:2, desc:'Keeps lodge time.',dot:LP.brass1},
  {id:'watch_gold',   cat:'clothes',slot:'watch',name:'Gold watch',   price:400000, lvl:9, desc:'Heavy. Ticks loudly.',dot:LP.brass3},
  {id:'watch_diamond',cat:'clothes',slot:'watch',name:'Diamond watch',price:2000000,lvl:20,desc:'It sparkles. Constantly.',dot:'#dff4ff'},
  {id:'glasses_aviator',cat:'clothes',slot:'glasses',name:'Aviators',price:90000, lvl:4,desc:'Gold rims, amber lenses.',grid:['','','','','','','...aagaa....'],pal:{a:LP.emb0,g:LP.brass1}},
  {id:'glasses_shades', cat:'clothes',slot:'glasses',name:'Night shades',price:150000,lvl:7,desc:'Indoors. At night. Bold.',grid:['','','','','','','...dddddd...'],pal:{d:'#121216'}},
  // Things to carry (one at a time)
  {id:'acc_glass',cat:'carry',slot:'acc',name:'Crystal tumbler',price:30000, lvl:1, desc:'Always half full.'},
  {id:'acc_cane', cat:'carry',slot:'acc',name:'Brass-top cane', price:250000,lvl:6, desc:'For pointing at things dramatically.'},
  {id:'acc_cigar',cat:'carry',slot:'acc',name:'Cigar',          price:120000,lvl:8, desc:'Unlit. The fire marshal insists.'},
  {id:'acc_golf', cat:'carry',slot:'acc',name:'Golf clubs',     price:400000,lvl:12,desc:'Full bag. Pairs well with a putting green.'},
  // Room decor (placed in My Room)
  {id:'decor_antlers',  cat:'decor',name:'Mounted antlers',  price:150000, lvl:2, desc:'Shed naturally, found on a hike. Promise.',w:20,h:14,wall:1},
  {id:'decor_sofa',     cat:'decor',name:'Leather sofa',     price:300000, lvl:3, desc:'Cracked in all the right places.',w:30,h:14},
  {id:'decor_paint_mtn',cat:'decor',name:'Mountain painting',price:180000, lvl:3, desc:'Peaks at dusk, in a brass frame.',w:22,h:16,wall:1},
  {id:'decor_rug',      cat:'decor',name:'Patterned rug',    price:220000, lvl:4, desc:'Hand-knotted, deep red and gold.',w:34,h:14,floor:1},
  {id:'decor_barcart',  cat:'decor',name:'Bar cart',         price:260000, lvl:5, desc:'Brass wheels, crystal decanters.',w:16,h:16},
  {id:'decor_pool',     cat:'decor',name:'Pool table',       price:750000, lvl:8, desc:'Green felt, walnut rails, racked and ready.',w:36,h:20},
  {id:'decor_paint_gold',cat:'decor',name:'Gold rush painting',price:450000,lvl:9,desc:'Prospectors, a river, a glint of gold.',w:26,h:18,wall:1},
  {id:'decor_trophy',   cat:'decor',name:'Trophy case',      price:500000, lvl:10,desc:'Glass doors. Room for every milestone.',w:20,h:26},
  {id:'decor_green',    cat:'decor',name:'Putting green',    price:900000, lvl:12,desc:'Indoor turf with a flag. Bring clubs.',w:40,h:14,floor:1},
  {id:'decor_fireplace',cat:'decor',name:'Grand fireplace',  price:1200000,lvl:15,desc:'Floor-to-ceiling river stone.',w:34,h:34,wall:1},
];
const ITEM={}; ITEMS.forEach(i=>ITEM[i.id]=i);
const owns=id=>!!(ITEM[id]&&(ITEM[id].free||(S.lodge.owned||[]).includes(id)));
const myLevel=()=>levelOf(S.lodge.xp).L;

/* ---------- Your look ---------- */
function outfitLook(over){
  const o=Object.assign({},S.lodge.outfit||{},over||{}), col={}, gear={};
  for(const slot of ['body','scarf']){ const it=ITEM[o[slot]]; if(it&&(owns(it.id)||over&&over[slot]===it.id)) Object.assign(col,it.colors); }
  for(const slot of ['hat','glasses','watch','acc']){ const id=o[slot]; if(id&&ITEM[id]&&(owns(id)||over&&over[slot]===id)) gear[slot]=id; }
  if(Object.keys(gear).length) col._gear=gear;
  return Object.keys(col).length?col:null;
}
// Draw hats, glasses, a watch and a carried item onto a 12×21 character sprite.
function drawGear(x,gear,frame){
  const grid=(g,pal)=>g.forEach((row,y)=>[...row].forEach((ch,xx)=>{ if(ch!=='.'&&pal[ch]){ x.fillStyle=pal[ch]; x.fillRect(xx,y,1,1); } }));
  const hat=ITEM[gear.hat], gl=ITEM[gear.glasses], w=ITEM[gear.watch], acc=gear.acc;
  if(hat) grid(hat.grid,hat.pal);
  if(gl) grid(gl.grid,gl.pal);
  if(w){ x.fillStyle=w.dot; x.fillRect(10,13,1,1); }
  const px=(c,X,Y,W=1,H=1)=>{x.fillStyle=c;x.fillRect(X,Y,W,H);};
  if(acc==='acc_cane'){ px(LP.wal0,11,14,1,7); px(LP.brass1,10,13,2,1); }
  if(acc==='acc_glass'){ px(LP.snow2,11,12); px(LP.emb0,11,13,1,2); }
  if(acc==='acc_cigar'){ px('#6b3a1f',8,8,2,1); px(LP.emb2,10,8); }
  if(acc==='acc_golf'){ px(LP.pine4,0,10,2,8); px(LP.brass1,0,12,2,1); px(LP.st3,0,8,1,2); px(LP.snow1,1,9,1,1); }
}

/* ---------- Decor art (also used in My Room) ---------- */
const DECOR_ART={
  decor_antlers:(c,x,y)=>{ rect(c,x+7,y+6,6,8,LP.wal5); rect(c,x+8,y+7,4,6,LP.wal4); for(const s of [-1,1]){ const bx=x+10+s*3; for(let i=0;i<7;i++) rect(c,bx+s*i,y+6-Math.round(i*.6),1,1,'#e8dcc0'); rect(c,bx+s*3,y+1,1,3,'#e8dcc0'); rect(c,bx+s*6,y,1,3,'#e8dcc0'); } },
  decor_sofa:(c,x,y)=>{ rect(c,x,y+2,30,8,'#4a2618'); rect(c,x+2,y,26,5,'#5e3220'); rect(c,x,y+4,4,9,'#3a1d12'); rect(c,x+26,y+4,4,9,'#3a1d12'); rect(c,x+4,y+7,11,3,'#6b3a24'); rect(c,x+15,y+7,11,3,'#6b3a24'); rect(c,x+2,y+12,2,2,LP.wal0); rect(c,x+26,y+12,2,2,LP.wal0); },
  decor_paint_mtn:(c,x,y)=>{ rect(c,x,y,22,16,LP.brass1); rect(c,x+2,y+2,18,12,'#3a2a4a'); rect(c,x+2,y+2,18,4,'#c9782c'); for(let i=0;i<8;i++){ rect(c,x+4+i,y+13-i,1,i+1,LP.st1); rect(c,x+18-i,y+13-i,1,i+1,LP.st2);} rect(c,x+11,y+6,2,1,LP.snow2); rect(c,x+6,y+9,2,1,LP.snow2); },
  decor_rug:(c,x,y)=>{ rect(c,x,y,34,14,LP.cran1); rect(c,x+2,y+2,30,10,LP.brass0); rect(c,x+3,y+3,28,8,LP.cran2); for(let i=0;i<6;i++) rect(c,x+6+i*4,y+6,2,2,LP.brass1); for(let i=0;i<34;i+=2){ rect(c,x+i,y-1,1,1,LP.brass2); rect(c,x+i,y+14,1,1,LP.brass2);} },
  decor_barcart:(c,x,y)=>{ rect(c,x+1,y+6,14,1,LP.brass1); rect(c,x+1,y+12,14,1,LP.brass1); rect(c,x+1,y+4,1,10,LP.brass1); rect(c,x+14,y+4,1,10,LP.brass1); rect(c,x+3,y+1,3,5,'#8a4a1a'); rect(c,x+4,y,1,1,LP.snow2); rect(c,x+8,y+2,2,4,LP.snow1); rect(c,x+11,y+3,2,3,LP.emb0); rect(c,x+2,y+14,2,2,LP.ink); rect(c,x+12,y+14,2,2,LP.ink); },
  decor_pool:(c,x,y)=>{ rect(c,x,y+2,36,12,LP.wal4); rect(c,x+2,y+3,32,9,'#1f6b3e'); for(const [px,py] of [[2,3],[17,3],[32,3],[2,10],[17,10],[32,10]]) rect(c,x+px,y+py,2,2,LP.ink); for(const [px,py,col] of [[24,6,LP.cran3],[26,5,LP.brass1],[26,7,'#4a7fd0'],[28,6,LP.ink],[10,7,LP.snow2]]) rect(c,x+px,y+py,1,1,col); rect(c,x+3,y+14,3,6,LP.wal3); rect(c,x+30,y+14,3,6,LP.wal3); rect(c,x+12,y+8,10,1,LP.wal6); },
  decor_paint_gold:(c,x,y)=>{ rect(c,x,y,26,18,LP.brass1); rect(c,x+2,y+2,22,14,'#5a7a8a'); rect(c,x+2,y+10,22,6,'#3a6a4a'); rect(c,x+2,y+8,22,2,'#7fa8c0'); rect(c,x+8,y+9,2,3,LP.wal1); rect(c,x+8,y+7,2,2,'#e0b48a'); rect(c,x+14,y+12,1,1,LP.brass3); rect(c,x+18,y+4,3,3,LP.brass2); },
  decor_trophy:(c,x,y)=>{ rect(c,x,y,20,26,LP.wal4); rect(c,x+2,y+2,16,22,'#1a2a30'); rect(c,x+2,y+12,16,1,LP.wal5); rect(c,x+5,y+5,3,4,LP.brass1); rect(c,x+6,y+9,1,2,LP.brass1); rect(c,x+11,y+6,4,3,LP.st3); rect(c,x+12,y+9,2,2,LP.st3); rect(c,x+6,y+16,4,4,LP.brass2); rect(c,x+12,y+17,3,3,LP.cran3); rect(c,x+10,y+3,1,8,'#cfd9e0'); },
  decor_green:(c,x,y)=>{ for(let yy=0;yy<14;yy++){ const k=(yy-7)/7, w=Math.round(20*Math.sqrt(Math.max(0,1-k*k))); rect(c,x+20-w,y+yy,w*2,1,yy%3?'#2f8a4e':'#2a7a45'); } rect(c,x+28,y+7,3,2,LP.ink); rect(c,x+29,y,1,8,LP.snow2); rect(c,x+30,y,4,3,LP.cran3); rect(c,x+10,y+8,1,1,LP.snow2); },
  decor_fireplace:(c,x,y,t)=>{ rect(c,x,y,34,34,LP.st0); for(let yy=0;yy<34;yy+=5) for(let xx=(yy/5)%2?0:4;xx<34;xx+=8) rect(c,x+xx,y+yy,Math.min(7,34-xx),4,(xx+yy)%3?LP.st1:LP.st2); rect(c,x-2,y+12,38,3,LP.wal5); rect(c,x+8,y+18,18,16,LP.ink);
    const tt=t||0; for(let i=0;i<16;i++){ const h=4+Math.round(5*Math.abs(Math.sin(tt*6+i*.8))); for(let k=0;k<h;k++) rect(c,x+9+i,y+33-k,1,1,k<h*.4?LP.emb3:k<h*.75?LP.emb1:LP.emb0); } },
};

/* ---------- Shop screen ---------- */
const SHOP={tab:'clothes',sel:null,confirm:false};
const SILAS=['Fine evening for a new look.','Everything here is one of a kind. Mostly.','Coin first, compliments after.','You look like someone who appreciates craftsmanship.','The good stuff is in the back. For regulars.'];
function openShop(tab){ SHOP.tab=tab||SHOP.tab; SHOP.sel=null; SHOP.confirm=false; renderShop(); const s=document.getElementById('lgSilas'); if(s) typeLine(s,SILAS[Math.random()*SILAS.length|0]); }
function closeShop(){ const b=LODGE.el&&LODGE.el.querySelector('.lg-shop'); if(b) b.remove(); }
function typeLine(el,txt){ let i=0; clearInterval(el._t); el._t=setInterval(()=>{ i+=2; el.textContent=txt.slice(0,i); if(i>=txt.length) clearInterval(el._t); },28); }
function iconCanvas(it,scale){
  const c=document.createElement('canvas'), deco=it.cat==='decor';
  c.width=deco?42:16; c.height=deco?36:24; const x=c.getContext('2d'); x.imageSmoothingEnabled=false;
  if(deco){ const a=DECOR_ART[it.id]; if(a) a(x,Math.round((42-it.w)/2),Math.round((36-it.h)/2),0); }
  else x.drawImage(personSprite('player','idle0',outfitLook({[it.slot]:it.id})),2,1);
  c.className='px'; c.style.width=(c.width*scale)+'px'; c.style.height=(c.height*scale)+'px'; return c;
}
function renderShop(){
  closeShop();
  const lv=myLevel(), box=document.createElement('div'); box.className='lg-shop';
  const tabs=[['clothes','Clothes'],['carry','Carry'],['decor','Decor'],['closet','Closet']];
  let body='';
  const it=SHOP.sel&&ITEM[SHOP.sel];
  if(it&&SHOP.confirm){
    body=`<div class="lg-prev"><div class="lg-prev-art"></div><div class="lg-prev-name">${esc(it.name)}</div>
      <div class="lg-prev-desc">Buy it for ${fmt$(it.price)}? It’s yours until you reset your bankroll.</div>
      <div class="lg-row"><button class="lg-btn lg-gold" data-lg="shopBuy">Yes, buy it</button><button class="lg-btn" data-lg="shopNo">No</button></div></div>`;
  } else if(it){
    const mine=owns(it.id), wearing=it.slot&&(S.lodge.outfit||{})[it.slot]===it.id, locked=lv<it.lvl;
    body=`<div class="lg-prev"><div class="lg-prev-art"></div><div class="lg-prev-name">${esc(it.name)}</div><div class="lg-prev-desc">${esc(it.desc)}</div>
      <div class="lg-prev-desc gold">${it.free?'Free':fmt$(it.price)} · ${locked?`Needs level ${it.lvl}`:it.cat==='decor'?'Goes in My Room':`Level ${it.lvl}+`}</div>
      <div class="lg-row">${mine?(it.slot?`<button class="lg-btn lg-gold" data-lg="shopWear">${wearing?'Take it off':'Wear it'}</button>`:`<span class="lg-owned">Yours — place it in My Room</span>`)
        :locked?`<span class="lg-owned">Reach level ${it.lvl} to buy</span>`:`<button class="lg-btn lg-gold" data-lg="shopAsk" ${it.price>S.bank?'disabled':''}>${it.price>S.bank?'Not enough money':'Buy · '+k$(it.price)}</button>`}
      <button class="lg-btn" data-lg="shopBack">Back</button></div></div>`;
  } else {
    const list=SHOP.tab==='closet'?ITEMS.filter(i=>i.slot&&owns(i.id)):ITEMS.filter(i=>i.cat===SHOP.tab&&!i.free);
    body=`${SHOP.tab==='closet'?`<div class="lg-closet-me"></div><div class="lg-prev-desc">Tap something you own to wear it or take it off.</div>`:''}
      <div class="lg-grid">${list.map(i=>{const mine=owns(i.id),wearing=i.slot&&(S.lodge.outfit||{})[i.slot]===i.id,locked=lv<i.lvl;
        return `<button class="lg-item ${locked?'locked':''} ${wearing?'wearing':''}" data-lg="shopSel" data-id="${i.id}"><span class="lg-ic" data-ic="${i.id}"></span><span class="lg-in">${esc(i.name)}</span><span class="lg-ip">${SHOP.tab==='closet'?(wearing?'WEARING':'TAP TO WEAR'):mine?'OWNED':locked?'LV '+i.lvl:k$(i.price)}</span></button>`;}).join('')||'<div class="lg-prev-desc">Nothing here yet.</div>'}</div>`;
  }
  box.innerHTML=`<div class="lg-shop-head"><span class="lg-dlg-who">SILAS · MERCHANT</span><span class="lg-bank-s">${fmt$(S.bank)} · LV ${lv}</span><button class="lg-btn lg-round" data-lg="shopClose" aria-label="Close">X</button></div>
    <div class="lg-dlg-text" id="lgSilas"></div>
    <div class="lg-tabs">${tabs.map(([k,l])=>`<button class="lg-tab ${SHOP.tab===k?'on':''}" data-lg="shopTab" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="lg-shop-body">${body}</div>`;
  LODGE.el.querySelector('.lg-stage').appendChild(box);
  box.querySelectorAll('[data-ic]').forEach(s=>s.appendChild(iconCanvas(ITEM[s.dataset.ic],2)));
  const art=box.querySelector('.lg-prev-art'); if(art&&it){ art.appendChild(iconCanvas(it,it.cat==='decor'?4:6)); }
  const me=box.querySelector('.lg-closet-me'); if(me){ const c=document.createElement('canvas'); c.width=16; c.height=24; c.className='px'; c.style.width='64px'; c.style.height='96px'; const x=c.getContext('2d'); x.drawImage(personSprite('player','idle0',outfitLook()),2,1); me.appendChild(c); }
}
function buyItem(id){
  const it=ITEM[id]; if(!it||owns(id)) return;
  if(myLevel()<it.lvl){ toast('Reach level '+it.lvl+' first','loss'); return; }
  if(it.price>S.bank){ toast('Not enough in the bankroll','loss'); return; }
  setBank(-it.price); S.lodge.owned=(S.lodge.owned||[]).concat(id);
  if(it.slot){ S.lodge.outfit=Object.assign({},S.lodge.outfit,{[it.slot]:id}); }
  save(); hudBank();
  [784,988,1175,1568].forEach((f,i)=>tone(f,.12,'square',.05,i*.07));
  try{ const b=LODGE.el.querySelector('.lg-stage').getBoundingClientRect(); fx.burst(b.left+b.width/2,b.top+b.height*.35,50,'#ecd9a8'); }catch(e){}
  toast(it.name+(it.slot?' — you’re wearing it':' — find it in My Room'),'gold');
}
function wearToggle(id){
  const it=ITEM[id]; if(!it||!it.slot||!owns(id)) return;
  const o=Object.assign({},S.lodge.outfit||{});
  if(o[it.slot]===id){ if(it.slot==='body'||it.slot==='scarf') o[it.slot]=it.slot==='body'?'coat_lodge':'scarf_cream'; else delete o[it.slot]; }
  else o[it.slot]=id;
  S.lodge.outfit=o; save(); tone(700,.06,'square',.03);
}
function unlocksBetween(a,b){ return ITEMS.filter(i=>!i.free&&i.lvl>a&&i.lvl<=b).map(i=>i.name); }
Object.assign(LG_ACT,{
  shopTab:b=>{ SHOP.tab=b.dataset.v; SHOP.sel=null; SHOP.confirm=false; renderShop(); },
  shopSel:b=>{ const id=b.dataset.id; if(SHOP.tab==='closet'){ wearToggle(id); renderShop(); return; } SHOP.sel=id; SHOP.confirm=false; renderShop(); },
  shopBack:()=>{ SHOP.sel=null; SHOP.confirm=false; renderShop(); },
  shopAsk:()=>{ SHOP.confirm=true; renderShop(); },
  shopNo:()=>{ SHOP.confirm=false; renderShop(); },
  shopBuy:()=>{ const id=SHOP.sel; buyItem(id); SHOP.confirm=false; renderShop(); const s=document.getElementById('lgSilas'); if(s) typeLine(s,owns(id)?'Pleasure doing business. Wear it well.':'Hm. Come back when the numbers work.'); },
  shopWear:()=>{ wearToggle(SHOP.sel); renderShop(); },
  shopClose:()=>closeShop(),
});
