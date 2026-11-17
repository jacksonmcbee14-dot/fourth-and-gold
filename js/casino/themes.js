// 🎨 Table themes and card decks — 100 of each.
//  • Themes: 10 from completed sets, 70 to buy (cheap → very expensive), 12 for reaching each VIP table tier,
//    8 for prestige stars. A theme colours the felt, rim, roulette board and wheel, craps and the CHIPS.
//  • Decks: 15 classics/set decks, 65 to buy, 12 VIP, 8 prestige. A deck sets the card faces and backs, the deal
//    animation and the win burst (and the chips if your table theme is the plain Lodge).
// Everything is applied as CSS variables on <body> (css/15-themes.css reads them). Slots keeps its seasonal look.

const hsl=(h,s,l)=>`hsl(${((h%360)+360)%360},${s}%,${l}%)`;
const SET_T={golf:['#3aa860','#1c6a3a','#0c3a1e','#ffffff','#c8a45c',150],neon:['#4a1a7a','#240c44','#10041e','#ff3ad0','#3affd0',270],security:['#4a5664','#2a323c','#14181e','#7fd0ff','#8a929e',210],
  pennants:['#1e3a7a','#12244a','#08122a','#ffffff','#e0203a',225],cabin:['#6a3a1a','#4a2410','#2a1408','#c06a2a','#f3ead8',25],holiday:['#a81a2a','#6a0e18','#3a060c','#3ad08a','#ffd84a',355],
  arcade:['#0e5a6a','#08343e','#041a20','#ff3ad0','#ffd84a',190],art:['#6a1a3a','#3a0e22','#1e0610','#ffd84a','#c8962a',330],crowns:['#4a1a8a','#2a0e52','#14062a','#ffd84a','#fff3b0',275],watches:['#1a2a4a','#0e182e','#060c18','#cfd9e0','#8a929e',220]};
const T_ADJ=['Emerald','Ruby','Sapphire','Midnight','Sunset','Arctic','Volcano','Ocean','Desert','Jungle','Cherry','Mint','Lavender','Copper','Obsidian','Ivory','Cosmic','Aurora','Golden','Velvet','Crimson','Teal','Amber','Rose','Slate','Plum','Olive','Coral','Indigo','Saffron','Jade','Onyx','Pearl','Bronze','Cobalt'];
const T_ICON=['💚','❤️','💙','🌙','🌅','🧊','🌋','🌊','🏜️','🌴','🍒','🌿','💜','🥉','🖤','🤍','🌌','🌈','🏆','🎩','🔴','🦚','🍯','🌹','🪨','🍇','🫒','🪸','🔷','🌼','🍀','⚫','🦪','🥇','🔵'];
const STAR_N=['Rising Star','Twin Stars','Triple Crown','Four Seasons','High Five','Six Pack','Lucky Seven','Infinity'];
function tVars(h,sat,rimH,rimL,z){ sat=sat||58; return {t1:hsl(h,sat,30),t2:hsl(h,sat+4,17),t3:hsl(h,sat+10,7),r1:hsl(rimH,85,rimL||70),r2:hsl(rimH,60,38),re1:hsl(352,72,50),re2:hsl(352,72,24),bk1:hsl(h,18,22),bk2:hsl(h,24,7),z1:hsl(z==null?h+120:z,60,40),z2:hsl(z==null?h+120:z,70,18),wh:((h-150+360)%360)+'deg',
  k:[hsl(h,62,46),hsl(h+72,62,44),hsl(h+144,62,42),hsl(h+216,62,44),hsl(rimH,80,72)]}; }
const TTHEMES={lodge:{name:'Lodge',icon:'🌲',free:1}};
for(const [k,v] of Object.entries(SET_T)){ const set=SETS.find(s=>s.id===k); TTHEMES[k]={name:set?set.name:k,icon:set?set.icon:'🎨',set:k,cat:'set',
  v:{t1:v[0],t2:v[1],t3:v[2],r1:v[3],r2:v[4],re1:hsl(352,72,50),re2:hsl(352,72,24),bk1:hsl(v[5],18,22),bk2:hsl(v[5],24,7),z1:hsl(v[5]+120,60,40),z2:hsl(v[5]+120,70,18),wh:((v[5]-150+360)%360)+'deg',k:[v[3],v[4],v[0],v[1],hsl(v[5]+180,60,50)]}}; }
for(let i=0;i<70;i++){ const h=(i*47+13)%360, nm=T_ADJ[i%35]+' '+(i<35?'Lounge':'Salon'); TTHEMES['t'+i]={name:nm,icon:T_ICON[i%35],cat:'shop',price:Math.round(10000*Math.pow(1.25,i)),v:tVars(h,50+(i%4)*6,i%3?h+40:48,i%3?72:62)}; }
for(let j=1;j<=12;j++){ const h=[45,200,280,160,330,20,190,300,55,240,120,0][j-1]; TTHEMES['vip'+j]={name:'VIP Room '+j,icon:'🎟️',cat:'vip',tier:j,v:tVars(h,62,48,74)}; }
for(let s=1;s<=8;s++){ const h=[50,270,320,190,30,130,350,240][s-1]; TTHEMES['star'+s]={name:STAR_N[s-1],icon:'⭐'.repeat(Math.min(s,3)),cat:'star',stars:s,v:tVars(h,70,50,78,50)}; }

// Decks
const BACKS=['radial','stripes','checker','conic','dots','diag'];
const DANIM=['deal','dkArc','dkFlicker','dkSlide','dkFlip','dkDrop','dkSpin','dkPaint','dkShine','dkTick','dkFade','dkPixel'];
const D_NAMES=['Royal','Vintage','Casino','Riverboat','Monte Carlo','Saloon','Speakeasy','Jazz','Velvet','Lucky','Midnight','Vegas','Havana','Tokyo','Paris','Nordic','Safari','Pirate','Space','Ocean','Candy','Retro','Gothic','Botanical','Desert','Arctic','Cherry Blossom','Neon','Steampunk','Art Deco','Comic','Graffiti','Marble','Wood Grain','Crystal','Lava','Galaxy','Pixel Pop','Golden Age','Silver Screen','Rainbow','Zebra','Tiger','Leopard','Peacock','Dragon','Phoenix','Unicorn','Mermaid','Wizard','Knight','Samurai','Viking','Cowboy','Surfer','Skater','Rockstar','Disco','Arcade','Circus','Carnival','Moonlight','Sunrise','Thunder','Diamond Dust'];
const D_MARK=['♛','♠','♣','♦','♥','✦','☾','☀','⚓','✈','❄','✿','⚡','★','♞','⚜','☘','♫','☯','✪'];
function backCSS(type,h){ return {radial:`radial-gradient(circle,${hsl(h,60,36)},${hsl(h,70,10)})`,stripes:`repeating-linear-gradient(45deg,${hsl(h,60,36)} 0 6px,${hsl(h,60,20)} 6px 12px)`,checker:`repeating-conic-gradient(${hsl(h,60,32)} 0 25%,${hsl(h,60,18)} 0 50%) 0 0/10px 10px`,
  conic:`conic-gradient(from 0deg,${hsl(h,70,42)},${hsl(h+60,70,28)},${hsl(h,70,42)})`,dots:`radial-gradient(${hsl(h,70,62)} 1.5px,transparent 2px) 0 0/8px 8px,${hsl(h,60,20)}`,diag:`linear-gradient(135deg,${hsl(h,70,46)},${hsl(h+40,70,18)})`}[type]; }
function dVars(h,i,mark,dark){ return {cf1:dark?hsl(h,30,12):hsl(h,45,95),cf2:dark?hsl(h,30,20):hsl(h,35,84),ci:dark?hsl(h,80,70):hsl(h,55,14),cr:dark?hsl(h+170,90,65):hsl(352,70,40),cb:backCSS(BACKS[i%6],h),cl:hsl(h+30,80,70),cm:`'${mark}'`,da:DANIM[i%DANIM.length],
  k:[hsl(h,62,44),hsl(h+60,62,40),hsl(h+120,62,42),hsl(h+200,62,40),hsl(h+30,80,72)],fx:[mark,'✨','💰']}; }
const DECKS={classic:{name:'Classic',icon:'🂠',free:1}};
const SET_D={golf:['#f6fbf2','#dcebd2','#1a3a1e','#b02a2a','repeating-linear-gradient(45deg,#1c6a3a 0 6px,#2a8a4a 6px 12px)','#ffffff','⛳','dkArc',['⛳','🏌️','🟢']],
  neon:['#1a0c2a','#2a124a','#3affd0','#ff3ad0','radial-gradient(circle,#4a1a7a,#10041e)','#ff3ad0','777','dkFlicker',['✨','💜','⚡']],
  security:['#eef2f6','#cfd9e0','#1a2a3a','#3a5aaa','repeating-linear-gradient(90deg,#4a5664 0 4px,#3a444e 4px 8px)','#7fd0ff','🛡️','dkSlide',['🔒','💰','🛡️']],
  pennants:['#fbf6ee','#ece0cc','#12244a','#e0203a','repeating-linear-gradient(0deg,#e0203a 0 6px,#ffffff 6px 12px)','#12244a','🚩','dkFlip',['🚩','🏆','⭐']],
  cabin:['#f3e6cc','#e0c8a0','#3a2010','#a02a1a','repeating-linear-gradient(0deg,#a0302a 0 5px,#3a1a10 5px 7px,#a0302a 7px 12px)','#f3ead8','🦌','dkDrop',['🦌','🌲','🔥']],
  holiday:['#fff8f0','#f3e2d0','#1a4a22','#c81a2a','repeating-linear-gradient(45deg,#c81a2a 0 6px,#ffffff 6px 12px)','#1a7a3a','🎄','dkSpin',['❄️','🎁','⭐']],
  arcade:['#101820','#1a2a3a','#3affd0','#ff8a3a','repeating-linear-gradient(90deg,#ff3ad0 0 4px,#ffd84a 4px 8px,#3affd0 8px 12px)','#ffffff','🕹️','dkPixel',['👾','🕹️','💥']],
  art:['#fbf3e6','#ecdcc0','#2a1a24','#8a1a3a','radial-gradient(circle,#6a1a3a,#1e0610)','#ffd84a','🖼️','dkPaint',['🎨','🖼️','✨']],
  crowns:['#fff8e6','#f0dfb0','#2a0e52','#a01a4a','radial-gradient(circle,#4a1a8a,#14062a)','#ffd84a','👑','dkShine',['👑','💎','✨']],
  watches:['#eef2f8','#cfd6e0','#0e182e','#5a3a8a','conic-gradient(from 0deg,#1a2a4a,#3a4a6a,#1a2a4a)','#cfd9e0','⌚','dkTick',['⌚','⏱️','✨']]};
for(const [k,v] of Object.entries(SET_D)){ const T=TTHEMES[k]; DECKS[k]={name:T.name,icon:T.icon,set:k,cat:'set',v:{cf1:v[0],cf2:v[1],ci:v[2],cr:v[3],cb:v[4],cl:v[5],cm:`'${v[6]}'`,da:v[7],fx:v[8],k:T.v.k}}; }
const BUY_D={midnight:['Midnight','🌑',250000,240,1],goldfoil:['Gold Foil','✨',1e6,45,0],diamond:['Diamond','💎',5e6,190,0],glow:['Glow in the Dark','🟢',2e6,120,1],pixel:['8-Bit','👾',500000,140,0]};
Object.entries(BUY_D).forEach(([k,[n,ic,p,h,dark]],i)=>{ DECKS[k]={name:n,icon:ic,cat:'shop',price:p,v:dVars(h,i+3,ic,dark)}; });
for(let i=0;i<65;i++){ const h=(i*61+29)%360, mk=D_MARK[i%D_MARK.length]; DECKS['d'+i]={name:D_NAMES[i],icon:mk,cat:'shop',price:Math.round(15000*Math.pow(1.24,i)),v:dVars(h,i,mk,i%5===3)}; }
for(let j=1;j<=12;j++){ const h=[45,200,280,160,330,20,190,300,55,240,120,0][j-1]; DECKS['vipd'+j]={name:'VIP Deck '+j,icon:'🎟️',cat:'vip',tier:j,v:dVars(h,j+2,'🎟️',j%2===0)}; }
for(let s=1;s<=8;s++){ const h=[50,270,320,190,30,130,350,240][s-1]; DECKS['stard'+s]={name:STAR_N[s-1]+' Deck',icon:'⭐',cat:'star',stars:s,v:dVars(h,s+5,'⭐',s%2===1)}; }

/* ---------- Owning and applying ---------- */
const myTier=()=>typeof vipIndex==='function'?vipIndex(S.vipBest):0, myStars=()=>S.prestige||0;
const tierName=j=>typeof vipAt==='function'?vipAt(j).name:'Tier '+j;
function ownOk(it,k,list){ if(!it) return false; if(it.free) return true; if(it.set) return !!(S.lodge.sets&&S.lodge.sets[it.set]); if(it.tier) return myTier()>=it.tier; if(it.stars) return myStars()>=it.stars; return (list||[]).includes(k); }
function themeOk(k){ return ownOk(TTHEMES[k],k,S.themes); }
function deckOk(k){ return ownOk(DECKS[k],k,S.decks); }
function curTheme(){ return themeOk(S.ctheme)?S.ctheme:'lodge'; }
function curDeck(){ return deckOk(S.cdeck)?S.cdeck:'classic'; }
const itemPrice=it=>nice(it.price*(typeof wealthX==='function'?Math.max(1,wealthX()/20):1));
function deckPrice(k){ return itemPrice(DECKS[k]); }
const lockWhy=it=>it.set?'🧩 '+(TTHEMES[it.set]||{}).name:it.tier?'🎟️ '+tierName(it.tier):it.stars?'⭐'.repeat(Math.min(3,it.stars))+(it.stars>3?' ×'+it.stars:''):'';
const BODY_VARS=['t1','t2','t3','r1','r2','re1','re2','bk1','bk2','z1','z2','wh','cf1','cf2','ci','cr','cb','cl','cm','da','k1','k2','k3','k4','k5'];
function themeApply(){ const on=S.mode==='casino'&&S.ctab!=='slots', b=document.body, T=TTHEMES[curTheme()], D=DECKS[curDeck()];
  BODY_VARS.forEach(v=>b.style.removeProperty('--'+v));
  if(on&&T.v){ b.dataset.ttheme=curTheme(); for(const [k,v] of Object.entries(T.v)) if(k!=='k') b.style.setProperty('--'+k,v); } else delete b.dataset.ttheme;
  if(on&&D.v){ b.dataset.cdeck=curDeck(); for(const [k,v] of Object.entries(D.v)) if(k!=='k'&&k!=='fx') b.style.setProperty('--'+k,v); } else delete b.dataset.cdeck;
  const chips=on?(T.v?T.v.k:D.v?D.v.k:null):null;   // the table theme colours the chips; otherwise the deck does
  if(chips){ b.dataset.chips='1'; chips.forEach((c,i)=>b.style.setProperty('--k'+(i+1),c)); } else delete b.dataset.chips; }
function themeChip(){ if(S.mode!=='casino'||S.ctab==='slots'||S.ctab==='ranks') return; const tbl=document.querySelector('#view .tblmin'); if(!tbl||document.getElementById('themeChip')) return;
  const T=TTHEMES[curTheme()], D=DECKS[curDeck()]; tbl.insertAdjacentHTML('afterend',`<button id="themeChip" data-a="themePick">🎨 ${T.icon} ${esc(T.name)} · ${D.icon} ${esc(D.name)}</button>`); }
const _renderTh=render; render=function(){ _renderTh(); themeApply(); themeChip(); };

/* ---------- The picker: tabs for themes / cards, filters for owned / shop / VIP / stars ---------- */
const TP={kind:'theme',cat:'mine'};
const TP_CATS=[['mine','✅ Mine'],['shop','🛒 Shop'],['set','🧩 Sets'],['vip','🎟️ VIP'],['star','⭐ Stars']];
function themePick(){ const isT=TP.kind==='theme', LIST=isT?TTHEMES:DECKS, ok=isT?themeOk:deckOk, cur=isT?curTheme():curDeck();
  const items=Object.entries(LIST).filter(([k,it])=>TP.cat==='mine'?ok(k):(it.cat||'')===TP.cat).sort((a,b)=>(a[1].price||0)-(b[1].price||0));
  const own=Object.keys(LIST).filter(ok).length;
  modal(`<div class="fgm-k">🎨 Your table</div>
    <div class="th-tabs"><button class="${isT?'on':''}" data-a="tpKind" data-v="theme">🟩 Tables</button><button class="${isT?'':'on'}" data-a="tpKind" data-v="deck">🃏 Cards</button></div>
    <div class="th-cats">${TP_CATS.map(([k,l])=>`<button class="${TP.cat===k?'on':''}" data-a="tpCat" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="tchips"><span>${own} / ${Object.keys(LIST).length} unlocked</span><span>🎟️ ${esc(tierName(myTier()))}</span><span>⭐ ${myStars()}</span></div>
    <div class="th-grid">${items.map(([k,it],i)=>{ const have=ok(k), buy=!have&&it.price; return `<button class="th-tile ${cur===k?'on':''} ${have?'':'lock'}" style="--d:${Math.min(i,24)*20}ms;${isT&&it.v?`--a:${it.v.t1};--b:${it.v.t3};--c:${it.v.r1}`:''}${!isT&&it.v?`--bk:${it.v.cb};--bl:${it.v.cl};--mk:${it.v.cm}`:''}" data-a="${have?(isT?'themeSet':'deckSet'):buy?(isT?'themeBuy':'deckBuy'):'themeLocked'}" data-v="${k}">
      ${isT?`<i></i><span>${have?it.icon:'🔒'}</span>`:`<b class="th-card"></b>`}<small>${esc(it.name)}</small>${have?'':buy?`<em>${k$(itemPrice(it))}</em>`:`<em>${lockWhy(it)}</em>`}</button>`; }).join('')||'<div class="gd-empty">Nothing here yet</div>'}</div>`); }
Object.assign(ACT,{
  themePick:()=>themePick(), tpKind:el=>{ TP.kind=el.dataset.v; themePick(); }, tpCat:el=>{ TP.cat=el.dataset.v; themePick(); },
  themeSet:el=>{ S.ctheme=el.dataset.v; save(); tone(700,.04,'square',.03); render(); themePick(); },
  deckSet:el=>{ S.cdeck=el.dataset.v; save(); tone(800,.04,'square',.03); render(); themePick(); },
  themeBuy:el=>{ const k=el.dataset.v, it=TTHEMES[k], pr=itemPrice(it); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    setBank(-pr); S.spent=(S.spent||0)+pr; S.themes=(S.themes||[]).concat(k); S.ctheme=k; save(); try{ fx.confetti(80); }catch(e){} toast(`${it.icon} ${it.name} — yours!`,'gold'); render(); themePick(); },
  deckBuy:el=>{ const k=el.dataset.v, it=DECKS[k], pr=itemPrice(it); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    setBank(-pr); S.spent=(S.spent||0)+pr; S.decks=(S.decks||[]).concat(k); S.cdeck=k; save(); try{ fx.confetti(80); }catch(e){} toast(`${it.icon} ${it.name} — yours!`,'gold'); render(); themePick(); },
  themeLocked:el=>{ const it=TTHEMES[el.dataset.v]||DECKS[el.dataset.v]; toast(it&&it.set?`🧩 Finish the ${TTHEMES[it.set].name} set`:it&&it.tier?`🎟️ Reach the ${tierName(it.tier)} table`:it&&it.stars?`⭐ Prestige ${it.stars}× to unlock`:'Locked','gold'); },
});

/* ---------- Win burst in the deck's icons ---------- */
function deckWinFx(big){ const D=DECKS[curDeck()], I=D.v&&D.v.fx; if(!I) return; const host=document.querySelector('#view .felt,#view .pb-stage'); if(!host) return; const r=host.getBoundingClientRect();
  const n=big?22:12; for(let i=0;i<n;i++){ const e=document.createElement('span'); e.className='dk-burst'; e.textContent=I[i%I.length];
    e.style.left=(r.left+r.width/2-13+(Math.random()-.5)*r.width*.3)+'px'; e.style.top=(r.top+r.height*.45)+'px';
    e.style.setProperty('--dx',((Math.random()-.5)*r.width*1.1)+'px'); e.style.setProperty('--dy',(-80-Math.random()*r.height*.6)+'px'); e.style.setProperty('--rot',((Math.random()-.5)*540)+'deg');
    e.style.animationDelay=(i*25)+'ms'; document.body.appendChild(e); setTimeout(()=>e.remove(),1600+i*25); } }
const _setBankDk=setBank;
setBank=function(delta){ const r=_setBankDk.apply(this,arguments);
  if(delta>0&&S.mode==='casino'&&['roulette','blackjack','poker','craps','pinball'].includes(S.ctab)) deckWinFx(delta>=(S.chip||1000)*5);
  return r; };
