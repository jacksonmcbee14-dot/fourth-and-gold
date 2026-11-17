// 🎨 Table themes and card decks — 100 of each.
//  • Themes: 10 from completed sets, 70 to buy (cheap → very expensive), 12 for reaching each VIP table tier,
//    8 for prestige stars. A theme colours the felt, rim, roulette board and wheel, craps and the CHIPS.
//  • Decks: 15 classics/set decks, 65 to buy, 12 VIP, 8 prestige. A deck sets the card faces and backs, the deal
//    animation and the win burst (and the chips if your table theme is the plain Lodge).
// Everything is applied as CSS variables on <body> (css/15-themes.css reads them). Slots keeps its seasonal look.

const hsl=(h,s,l)=>`hsl(${((h%360)+360)%360},${s}%,${l}%)`;
const STAR_N=['Rising Star','Twin Stars','Triple Crown','Four Seasons','High Five','Six Pack','Lucky Seven','Infinity'];
// Win animations: how a theme's particles fly when you win (css/15-themes.css @keyframes th*).
const TH_ANIM={fountain:'Fountain',rain:'Rain',ring:'Shockwave',float:'Drift',spiral:'Spiral',zig:'Zigzag',pulse:'Pulse',comet:'Comets'};
const TH_GAMES={slots:'🎰 Slots',roulette:'🎡 Roulette',blackjack:'🃏 Blackjack',poker:'♠️ Poker',craps:'🎲 Craps',pinball:'🕹️ Pinball',all:'🌟 Every game'};
// Felt colours: [hue, saturation, lightness] for the top of the felt (it darkens downward); rim is the trim colour.
function tVars(h,s,l,rim,acc){ const k2=hsl(h+150,55,46), k3=hsl(h+210,55,42);
  return {t1:hsl(h,s,l),t2:hsl(h,Math.min(90,s+4),Math.max(5,l*.55)),t3:hsl(h,Math.min(95,s+8),Math.max(3,l*.22)),r1:rim,r2:`color-mix(in srgb,${rim} 45%,#000)`,re1:hsl(352,72,48),re2:hsl(352,72,24),
    bk1:hsl(h,14,20),bk2:hsl(h,20,7),z1:hsl(h+120,60,40),z2:hsl(h+120,70,18),wh:((h-150+360)%360)+'deg',k:[hsl(h,s,Math.min(52,l+14)),acc||k2,k3,`color-mix(in srgb,${rim} 70%,#000)`,rim]}; }
const TTHEMES={lodge:{name:'Lodge',icon:'🌲',free:1,fx:['🌲','✨','💰'],anim:'fountain'}};
// The ten set themes (finish the set to unlock): [felt1, felt2, felt3, rim, rim2, hue, particles, animation, bonus game]
const SET_T={golf:['#3aa860','#1c6a3a','#0c3a1e','#ffffff','#c8a45c',150,['⛳','🏌️','🟢'],'comet','pinball'],neon:['#4a1a7a','#240c44','#10041e','#ff3ad0','#3affd0',270,['💜','⚡','✨'],'pulse','slots'],
  security:['#4a5664','#2a323c','#14181e','#7fd0ff','#8a929e',210,['🔒','🛡️','💰'],'ring','blackjack'],pennants:['#1e3a7a','#12244a','#08122a','#ffffff','#e0203a',225,['🚩','🏆','⭐'],'zig','craps'],
  cabin:['#6a3a1a','#4a2410','#2a1408','#c06a2a','#f3ead8',25,['🦌','🌲','🔥'],'float','poker'],holiday:['#a81a2a','#6a0e18','#3a060c','#3ad08a','#ffd84a',355,['❄️','🎁','⭐'],'rain','slots'],
  arcade:['#0e5a6a','#08343e','#041a20','#ff3ad0','#ffd84a',190,['👾','🕹️','💥'],'zig','pinball'],art:['#6a1a3a','#3a0e22','#1e0610','#ffd84a','#c8962a',330,['🎨','🖼️','✨'],'spiral','roulette'],
  crowns:['#4a1a8a','#2a0e52','#14062a','#ffd84a','#fff3b0',275,['👑','💎','✨'],'fountain','blackjack'],watches:['#1a2a4a','#0e182e','#060c18','#cfd9e0','#8a929e',220,['⌚','⏱️','✨'],'spiral','roulette']};
for(const [k,v] of Object.entries(SET_T)){ const set=SETS.find(s=>s.id===k); TTHEMES[k]={name:set?set.name:k,icon:set?set.icon:'🎨',set:k,cat:'set',fx:v[6],anim:v[7],bonus:{g:v[8],p:2.5},
  v:{t1:v[0],t2:v[1],t3:v[2],r1:v[3],r2:v[4],re1:hsl(352,72,48),re2:hsl(352,72,24),bk1:hsl(v[5],18,22),bk2:hsl(v[5],24,7),z1:hsl(v[5]+120,60,40),z2:hsl(v[5]+120,70,18),wh:((v[5]-150+360)%360)+'deg',k:[v[3],v[4],v[0],v[1],hsl(v[5]+180,60,50)]}}; }
// 70 themes to buy, cheapest first. Every name matches its colours, particles and animation.
// [name, icon, hue, sat, light, rim, particles, animation, bonus game]
const SHOP_T=[
 ['Pine Cabin','🌲',130,35,26,'#c8a45c',['🌲','🍂','🪵'],'float','poker'],
 ['Backyard BBQ','🍖',0,10,18,'#ff5a2a',['🔥','🌭','🍖'],'fountain','craps'],
 ['Diner Booth','🍔',355,55,34,'#f4f4f4',['🍔','🍟','🥤'],'fountain','slots'],
 ['Bowling Alley','🎳',230,50,30,'#ff5a5a',['🎳','💥','⭐'],'ring','pinball'],
 ['Denim','👖',215,45,32,'#e0a040',['👖','🧵','⭐'],'zig','blackjack'],
 ['Lemonade Stand','🍋',55,70,36,'#fff3a0',['🍋','💛','🧊'],'rain','roulette'],
 ['Bubblegum','🫧',325,60,42,'#ffd0ee',['🫧','🍬','💗'],'float','slots'],
 ['Mint Chip','🍨',150,45,36,'#7a4a2a',['🍨','🍃','🍫'],'rain','poker'],
 ['Rainy Day','☔',210,25,30,'#9fd0e8',['💧','☔','🌧️'],'rain','craps'],
 ['Campfire','🔥',20,65,26,'#ffb03a',['🔥','✨','🪵'],'float','blackjack'],
 ['Sunflower Field','🌻',48,70,34,'#5aa03a',['🌻','🐝','🌼'],'spiral','roulette'],
 ['Lavender Farm','🪻',270,35,38,'#e8d0ff',['🪻','🦋','💜'],'float','slots'],
 ['Cherry Blossom','🌸',340,45,40,'#ffe0ea',['🌸','🌸','🍃'],'rain','poker'],
 ['Pumpkin Patch','🎃',28,75,32,'#5a8a2a',['🎃','🍂','🌽'],'fountain','pinball'],
 ['Sandy Beach','🏖️',42,50,42,'#3ac0d0',['🐚','🌴','☀️'],'ring','roulette'],
 ['Tropical Lagoon','🏝️',178,65,32,'#ffe08a',['🐠','🌴','🌺'],'spiral','slots'],
 ['Coral Reef','🪸',8,70,44,'#3ad0d0',['🪸','🐠','🫧'],'float','craps'],
 ['Deep Sea','🐋',205,70,22,'#3affd0',['🐋','🫧','🐙'],'float','blackjack'],
 ['Arctic Ice','🧊',195,55,44,'#ffffff',['❄️','🧊','🐧'],'rain','poker'],
 ['Northern Lights','🌌',165,70,20,'#ff6ad0',['🌌','✨','💚'],'comet','roulette'],
 ['Desert Sunset','🌵',22,70,38,'#7a3a7a',['🌵','☀️','🦂'],'ring','craps'],
 ['Red Canyon','🏜️',12,55,32,'#8ad0f0',['🪨','🦅','🌵'],'zig','pinball'],
 ['Rainforest','🦜',135,65,24,'#ff6a2a',['🦜','🌿','🐸'],'spiral','slots'],
 ['Bamboo Garden','🎋',95,45,30,'#f0e6c0',['🎋','🐼','🍃'],'rain','blackjack'],
 ['Zen Garden','☯️',40,12,36,'#7a9a7a',['☯️','🪨','🍵'],'pulse','poker'],
 ['Tea House','🍵',85,35,26,'#d04a3a',['🍵','🏮','🌸'],'float','roulette'],
 ['Lantern Festival','🏮',10,80,30,'#ffd84a',['🏮','✨','🧧'],'float','craps'],
 ['Coffee House','☕',25,40,22,'#f0e0c8',['☕','🥐','🤎'],'float','slots'],
 ['Chocolate Shop','🍫',20,45,20,'#ff8ab0',['🍫','🍓','💝'],'fountain','blackjack'],
 ['Candy Shop','🍭',300,60,40,'#7af0ff',['🍭','🍬','🧁'],'spiral','pinball'],
 ['Laser Tag','🔦',280,70,18,'#3aff6a',['⚡','💥','🔦'],'zig','pinball'],
 ['Rock Concert','🎸',0,0,10,'#ff3a3a',['🎸','🤘','⚡'],'comet','slots'],
 ['Jazz Club','🎷',230,45,18,'#e0b040',['🎷','🎺','🎶'],'float','poker'],
 ['Disco Floor','🪩',285,65,28,'#c8c8ff',['🪩','✨','🕺'],'ring','roulette'],
 ['Street Graffiti','🎨',80,60,30,'#ff3ad0',['🎨','💥','🎤'],'zig','craps'],
 ['Movie Premiere','🎬',345,60,18,'#f6f6f6',['🎬','🍿','⭐'],'comet','blackjack'],
 ['Circus Tent','🎪',0,75,36,'#fff3e0',['🎪','🤡','🎈'],'fountain','roulette'],
 ['Carnival Night','🎡',200,60,22,'#ffb03a',['🎡','🎠','🎈'],'spiral','slots'],
 ['Fireworks Show','🎆',240,50,14,'#ff5aa0',['🎆','🎇','✨'],'ring','craps'],
 ['Haunted House','👻',270,40,14,'#7aff6a',['👻','🦇','🕸️'],'float','poker'],
 ['Witching Hour','🧙',285,55,18,'#ff8a2a',['🧙','🔮','🌙'],'spiral','roulette'],
 ['Vampire Castle','🧛',350,70,16,'#d8d8d8',['🦇','🩸','🌙'],'comet','blackjack'],
 ['Dragon Den','🐉',140,60,16,'#ffb03a',['🐉','🔥','💎'],'fountain','pinball'],
 ['Wizard Tower','🔮',250,55,24,'#7ad0ff',['🔮','✨','📜'],'spiral','slots'],
 ['Pirate Ship','🏴‍☠️',25,45,20,'#e0c050',['🏴‍☠️','⚓','🪙'],'rain','craps'],
 ['Treasure Cave','💰',35,40,16,'#ffd84a',['💰','🪙','💎'],'fountain','slots'],
 ['Wild West Saloon','🤠',35,45,36,'#7a2a1a',['🤠','🌵','🐎'],'zig','poker'],
 ['Prospector Mine','⛏️',25,20,24,'#b0b8c0',['⛏️','🪙','🪨'],'rain','roulette'],
 ['Speedway','🏁',0,0,22,'#e0203a',['🏁','🏎️','💨'],'comet','pinball'],
 ['Stadium Lights','🏟️',125,55,28,'#ffffff',['🏟️','🏈','📣'],'ring','craps'],
 ['Ski Chalet','⛷️',210,30,40,'#e03a3a',['⛷️','❄️','☕'],'rain','blackjack'],
 ['Safari Lodge','🦁',38,50,30,'#5a7a3a',['🦁','🦒','🌾'],'zig','roulette'],
 ['Steampunk Works','⚙️',30,40,22,'#c88a3a',['⚙️','🔩','💨'],'spiral','pinball'],
 ['Art Deco','🍸',45,20,12,'#e8c060',['🍸','🎷','✨'],'pulse','poker'],
 ['Riviera','🛥️',200,60,34,'#f6ebcb',['🛥️','🌊','🍾'],'float','slots'],
 ['Paris Cafe','🗼',210,30,30,'#f0b0c0',['🗼','🥐','🌹'],'float','roulette'],
 ['Tokyo Neon','🗾',330,80,22,'#3affff',['🏮','🍣','⚡'],'comet','slots'],
 ['Vegas Strip','🎰',50,85,28,'#ff3ad0',['🎰','💵','✨'],'fountain','craps'],
 ['Havana Nights','🌺',15,60,28,'#3ad0a0',['🌴','🎺','🌺'],'zig','poker'],
 ['Masquerade','🎭',300,40,16,'#e0e0ff',['🎭','🪶','✨'],'spiral','blackjack'],
 ['Pharaoh Tomb','🏺',42,50,28,'#3a9ae0',['🏺','🪲','☀️'],'pulse','roulette'],
 ['Greek Marble','🏛️',40,10,44,'#c8a45c',['🏛️','🫒','⚡'],'pulse','craps'],
 ['Moon Base','🌙',250,25,16,'#f0f0a0',['🌙','🚀','⭐'],'float','pinball'],
 ['Mars Colony','🪐',15,70,28,'#ffd0a0',['🚀','🪐','🔴'],'comet','slots'],
 ['Supernova','💥',330,80,18,'#ffe08a',['💥','☄️','✨'],'ring','blackjack'],
 ['Black Hole','🕳️',260,40,6,'#a07aff',['🕳️','🌀','✨'],'spiral','poker'],
 ['Crystal Cavern','🔷',190,70,28,'#e0ffff',['💠','🔷','✨'],'pulse','roulette'],
 ['Pearl Lagoon','🦪',180,25,40,'#ffffff',['🦪','🫧','✨'],'float','slots'],
 ['Champagne Room','🍾',45,35,28,'#fff0b0',['🍾','🥂','✨'],'fountain','craps'],
 ['Billionaire Yacht','🛳️',230,75,22,'#ffd84a',['🛳️','💵','🍾'],'ring','all']];
SHOP_T.forEach(([name,icon,h,s,l,rim,fx,anim,g],i)=>{ TTHEMES['t'+i]={name,icon,cat:'shop',price:Math.round(10000*Math.pow(1.25,i)),fx,anim,bonus:{g,p:g==='all'?3:Math.round((1+i*3/69)*2)/2},v:tVars(h,s,l,rim)}; });
// VIP rooms match their table: Silver, Gold, Diamond … Galaxy.
const VIP_T=[[0,0,40,['🥈','✨','🪙'],'pulse'],[45,60,26,['🥇','💰','✨'],'fountain'],[190,50,30,['💎','✨','🤍'],'ring'],[150,65,24,['💚','🟢','✨'],'spiral'],[352,70,24,['❤️','🔴','✨'],'comet'],
  [220,70,26,['💙','🔵','✨'],'rain'],[280,55,26,['💜','🟣','✨'],'float'],[260,10,9,['🖤','⚫','✨'],'pulse'],[210,20,34,['🏆','🤍','✨'],'ring'],[280,55,20,['👑','💎','🪙'],'fountain'],[255,60,16,['🌌','🪐','✨'],'spiral'],[320,60,18,['🌠','💫','✨'],'comet']];
VIP_T.forEach(([h,s,l,fx,anim],i)=>{ const j=i+1, V=vipAt(j); TTHEMES['vip'+j]={name:V.name+' Suite',icon:V.icon,cat:'vip',tier:j,fx,anim,bonus:{g:'all',p:1+j*.25},v:tVars(h,s,l,V.color)}; });
// Prestige-star themes.
const STAR_T=[[28,80,34,'#ffe08a',['🌅','⭐','✨'],'fountain'],[210,50,26,'#e0f0ff',['⭐','⭐','💫'],'spiral'],[25,55,22,'#ffffff',['🏇','🏆','🌹'],'ring'],[120,45,26,'#ffb0d0',['🌸','☀️','🍂','❄️'],'float'],
  [0,75,30,'#ffffff',['🖐️','⭐','💥'],'zig'],[200,70,30,'#ffd84a',['💪','🔥','⭐'],'comet'],[140,70,22,'#ffd84a',['🍀','7️⃣','🪙'],'rain'],[260,50,8,'#ffffff',['♾️','🌌','💫'],'spiral']];
STAR_T.forEach(([h,s,l,rim,fx,anim],i)=>{ const n=i+1; TTHEMES['star'+n]={name:STAR_N[i],icon:'⭐'.repeat(Math.min(n,3)),cat:'star',stars:n,fx,anim,bonus:{g:'all',p:1+n*.5},v:tVars(h,s,l,rim)}; });

// Decks
const DANIM=['deal','dkArc','dkFlicker','dkSlide','dkFlip','dkDrop','dkSpin','dkPaint','dkShine','dkTick','dkFade','dkPixel'];
const DANIM_N={deal:'Classic deal',dkArc:'Arc toss',dkFlicker:'Neon flicker',dkSlide:'Slide in',dkFlip:'Flip over',dkDrop:'Drop in',dkSpin:'Spin in',dkPaint:'Paint on',dkShine:'Shine',dkTick:'Tick in',dkFade:'Fade in',dkPixel:'Pixel step'};
// Card backs: two colours in a pattern.
function backCSS(type,a,b){ return {radial:`radial-gradient(circle,${a},${b})`,stripes:`repeating-linear-gradient(45deg,${a} 0 6px,${b} 6px 12px)`,vstripes:`repeating-linear-gradient(90deg,${a} 0 5px,${b} 5px 10px)`,
  checker:`repeating-conic-gradient(${a} 0 25%,${b} 0 50%) 0 0/10px 10px`,conic:`conic-gradient(from 0deg,${a},${b},${a})`,dots:`radial-gradient(${a} 2px,transparent 2.5px) 0 0/9px 9px,${b}`,diag:`linear-gradient(135deg,${a},${b})`,
  plaid:`repeating-linear-gradient(0deg,${a} 0 4px,transparent 4px 10px),repeating-linear-gradient(90deg,${a} 0 4px,transparent 4px 10px),${b}`,
  waves:`radial-gradient(circle at 50% 0,transparent 5px,${a} 6px,${a} 7px,transparent 8px) 0 0/14px 8px,${b}`,sunburst:`repeating-conic-gradient(from 0deg at 50% 50%,${a} 0 15deg,${b} 15deg 30deg)`}[type]; }
// A deck: face tinted toward its colour (light or dark), suits in its ink, its own back, mark and deal.
function dVars(a,b,line,dark,back,mark,anim){ return {cf1:dark?`color-mix(in srgb,${b} 80%,#000)`:`color-mix(in srgb,${a} 8%,#fbf7ee)`,cf2:dark?`color-mix(in srgb,${b} 60%,#000)`:`color-mix(in srgb,${a} 18%,#e8dcc4)`,
  ci:dark?line:`color-mix(in srgb,${b} 40%,#141008)`,cr:dark?`color-mix(in srgb,${a} 40%,#ff5a6a)`:'#b81e2c',cb:backCSS(back,a,b),cl:line,cm:`'${mark}'`,da:anim,k:[a,b,line,`color-mix(in srgb,${a} 50%,${b})`,line]}; }
const DECKS={classic:{name:'Classic',icon:'🂠',free:1}};
const SET_D={golf:['#f6fbf2','#dcebd2','#1a3a1e','#b02a2a','repeating-linear-gradient(45deg,#1c6a3a 0 6px,#2a8a4a 6px 12px)','#ffffff','⛳','dkArc'],
  neon:['#1a0c2a','#2a124a','#3affd0','#ff3ad0','radial-gradient(circle,#4a1a7a,#10041e)','#ff3ad0','777','dkFlicker'],
  security:['#eef2f6','#cfd9e0','#1a2a3a','#3a5aaa','repeating-linear-gradient(90deg,#4a5664 0 4px,#3a444e 4px 8px)','#7fd0ff','🛡️','dkSlide'],
  pennants:['#fbf6ee','#ece0cc','#12244a','#e0203a','repeating-linear-gradient(0deg,#e0203a 0 6px,#ffffff 6px 12px)','#12244a','🚩','dkFlip'],
  cabin:['#f3e6cc','#e0c8a0','#3a2010','#a02a1a','repeating-linear-gradient(0deg,#a0302a 0 5px,#3a1a10 5px 7px,#a0302a 7px 12px)','#f3ead8','🦌','dkDrop'],
  holiday:['#fff8f0','#f3e2d0','#1a4a22','#c81a2a','repeating-linear-gradient(45deg,#c81a2a 0 6px,#ffffff 6px 12px)','#1a7a3a','🎄','dkSpin'],
  arcade:['#101820','#1a2a3a','#3affd0','#ff8a3a','repeating-linear-gradient(90deg,#ff3ad0 0 4px,#ffd84a 4px 8px,#3affd0 8px 12px)','#ffffff','🕹️','dkPixel'],
  art:['#fbf3e6','#ecdcc0','#2a1a24','#8a1a3a','radial-gradient(circle,#6a1a3a,#1e0610)','#ffd84a','🖼️','dkPaint'],
  crowns:['#fff8e6','#f0dfb0','#2a0e52','#a01a4a','radial-gradient(circle,#4a1a8a,#14062a)','#ffd84a','👑','dkShine'],
  watches:['#eef2f8','#cfd6e0','#0e182e','#5a3a8a','conic-gradient(from 0deg,#1a2a4a,#3a4a6a,#1a2a4a)','#cfd9e0','⌚','dkTick']};
for(const [k,v] of Object.entries(SET_D)){ const T=TTHEMES[k]; DECKS[k]={name:T.name+' Deck',icon:T.icon,set:k,cat:'set',v:{cf1:v[0],cf2:v[1],ci:v[2],cr:v[3],cb:v[4],cl:v[5],cm:`'${v[6]}'`,da:v[7],k:T.v.k}}; }
// [name, mark, colour A, colour B, line, dark face?, back pattern, deal animation]
const BUY_D={midnight:['Midnight','🌑','#2a2a5a','#07071a','#9aa0ff',1,'radial','dkFade',250000],goldfoil:['Gold Foil','✨','#ffe27a','#a07a1a','#fff6c0',0,'diag','dkShine',1e6],
  diamond:['Diamond Cut','💎','#bff6ff','#5aa0c8','#ffffff',0,'checker','dkSpin',5e6],glow:['Glow in the Dark','🟢','#3aff6a','#061206','#3aff6a',1,'dots','dkFlicker',2e6],pixel:['8-Bit','👾','#ff3ad0','#2a1a6a','#ffd84a',1,'checker','dkPixel',500000]};
Object.entries(BUY_D).forEach(([k,[n,mk,a,b,l,dk,bk,an,p]])=>{ DECKS[k]={name:n,icon:mk,cat:'shop',price:p,v:dVars(a,b,l,dk,bk,mk,an)}; });
const SHOP_D=[
 ['Picnic Plaid','🧺','#c0302a','#f6f0e0','#ffffff',0,'plaid','deal'],['Lumberjack','🪓','#b0201a','#1a1a1a','#f0e0c0',0,'plaid','dkDrop'],['Cow Spots','🐄','#1a1a1a','#f6f6f6','#e0a040',0,'dots','dkSlide'],
 ['Sea Breeze','⚓','#1e4a8a','#f6f6f6','#e0203a',0,'stripes','dkSlide'],['Lemon Drop','🍋','#fff6a0','#f0c020','#ffffff',0,'dots','dkDrop'],['Watermelon','🍉','#e04a5a','#2a8a3a','#1a1a1a',0,'vstripes','dkFlip'],
 ['Blueberry','🫐','#6a7aff','#1a1a5a','#c0c8ff',1,'dots','dkFade'],['Peppermint','🍬','#e0202a','#ffffff','#e0202a',0,'sunburst','dkSpin'],['Cotton Candy','🍭','#ffb0d8','#a0d8ff','#ffffff',0,'diag','dkShine'],
 ['Autumn Leaf','🍁','#e0701a','#6a1a0a','#ffc04a',0,'radial','dkDrop'],['Spring Meadow','🌼','#fff0a0','#3a8a2a','#fff0a0',0,'dots','dkArc'],['Ocean Wave','🌊','#bff0ff','#0a4a7a','#bff0ff',0,'waves','dkSlide'],
 ['Night Owl','🦉','#ffd84a','#0e0e24','#ffd84a',1,'dots','dkFade'],['Starry Night','⭐','#f0d040','#1a3a8a','#f0e070',1,'conic','dkSpin'],['Sunrise','🌅','#ff8a3a','#ffd04a','#ffffff',0,'sunburst','dkShine'],
 ['Thunderstorm','⚡','#4a4a5a','#10101a','#ffe04a',1,'diag','dkFlicker'],['Snowfall','❄️','#ffffff','#6a9ad0','#ffffff',0,'dots','dkDrop'],['Bamboo','🎋','#7aaa3a','#3a5a1a','#f0f0c0',0,'vstripes','dkSlide'],
 ['Koi Pond','🐟','#ff8a3a','#1a5a8a','#ffffff',0,'waves','dkArc'],['Lotus','🪷','#f6b0cc','#8a3a6a','#fff0f6',0,'radial','dkShine'],['Desert Dunes','🏜️','#f0c080','#a06a3a','#6a3a1a',0,'waves','dkSlide'],
 ['Cactus Bloom','🌵','#4a9a4a','#2a5a2a','#ff8ab0',0,'checker','dkPixel'],['Giraffe','🦒','#e0a040','#5a3010','#f6e0b0',0,'dots','dkArc'],['Zebra','🦓','#f6f6f6','#111111','#f6f6f6',0,'stripes','dkSlide'],
 ['Leopard','🐆','#3a2010','#d09a40','#2a1a0a',0,'dots','dkArc'],['Peacock','🦚','#3ad0a0','#0a2a5a','#3ad0a0',1,'radial','dkShine'],['Flamingo','🦩','#ff7aa0','#ffc8d8','#ffffff',0,'diag','dkArc'],
 ['Treasure Map','🗺️','#d0a870','#6a4a2a','#3a1a0a',0,'radial','dkDrop'],['Lighthouse','🗼','#e0202a','#f6f6f6','#1a2a4a',0,'stripes','dkTick'],['Bowling Night','🎳','#e0202a','#1a1a1a','#ffffff',1,'checker','dkSpin'],
 ['Soda Fountain','🥤','#3ad0d0','#e02a3a','#ffffff',0,'checker','dkFlip'],['Jukebox','🎵','#ff3a8a','#ffd84a','#3affff',1,'sunburst','dkFlicker'],['Jazz Age','🎷','#c8962a','#141414','#f0d080',1,'vstripes','dkFade'],
 ['Disco Ball','🪩','#e0e0f0','#6a6a80','#ffffff',0,'checker','dkShine'],['Rockstar','🎸','#d0202a','#121212','#ffffff',1,'diag','dkFlicker'],['Graffiti','🎨','#ff3ad0','#3ad0ff','#ffff4a',0,'dots','dkPaint'],
 ['Comic Book','💥','#e0202a','#ffe04a','#1a1a1a',0,'dots','dkPaint'],['Big Top','🎪','#e0202a','#ffe04a','#ffffff',0,'sunburst','dkSpin'],['Magician','🎩','#6a2a9a','#10041e','#e0c050',1,'radial','dkFade'],
 ['Haunted','👻','#a0ffa0','#120a1a','#a0ffa0',1,'waves','dkFlicker'],["Witch's Brew",'🧪','#9aff4a','#1a2a10','#c0ff6a',1,'dots','dkFlicker'],['Vampire','🦇','#8a0a1a','#10060a','#e0e0e0',1,'diag','dkFade'],
 ['Dragon Scale','🐉','#2a8a4a','#0a2a1a','#e0c050',1,'waves','dkArc'],["Knight's Crest",'⚔️','#2a3a8a','#c0c0c0','#ffd84a',0,'checker','dkFlip'],['Castle Stone','🏰','#7a7a7a','#4a4a4a','#e0d0a0',0,'checker','dkDrop'],
 ['Samurai','⛩️','#c0202a','#f6f0e0','#1a1a1a',0,'sunburst','dkSlide'],['Viking','🛡️','#3a5a7a','#8a6a3a','#f0e0c0',0,'vstripes','dkDrop'],['Pharaoh','☥','#2a6ab0','#c8a03a','#ffd84a',0,'radial','dkShine'],
 ['Aztec Sun','🌞','#d07a2a','#2a8a8a','#ffd84a',0,'sunburst','dkPixel'],['Art Nouveau','❦','#7a9a6a','#2a3a2a','#e0c890',0,'radial','dkPaint'],['Steampunk','⚙️','#a06a2a','#2a1a10','#e0a050',1,'conic','dkTick'],
 ['Explorer','🧭','#c8a46a','#3a5a3a','#f0e0c0',0,'radial','dkArc'],['Retro Wave','🌆','#ff3a8a','#2a1a7a','#3affff',1,'diag','dkSlide'],['Checkered Flag','🏁','#111111','#f6f6f6','#e0202a',0,'checker','dkSlide'],
 ['Rocket Launch','🚀','#e0e0e0','#3a5a8a','#e0202a',0,'diag','dkArc'],['Alien','👽','#6aff8a','#0a1a14','#6aff8a',1,'radial','dkSpin'],['Nebula','🌌','#c06ae0','#2a1a6a','#ff8ad8',1,'conic','dkShine'],
 ['Black Ice','🧊','#9fe0ff','#0a0e16','#9fe0ff',1,'diag','dkSlide'],['Rose Gold','🌹','#f0b0a0','#a0605a','#fff0e0',0,'radial','dkShine'],['Champagne','🥂','#fff0c0','#c8a050','#ffffff',0,'dots','dkFade'],
 ['Velvet Rope','🎟️','#a0102a','#2a0410','#e0c050',1,'radial','dkFade'],['Marble','🏛️','#f6f6f6','#a8a8b4','#5a5a66',0,'diag','dkPaint'],['Jade Empire','🀄','#3ab07a','#0a3a2a','#f0e0a0',0,'checker','dkArc'],
 ['Carbon Fiber','◼️','#3a3a3a','#161616','#a0a0a8',1,'checker','dkSlide'],['Billionaire','💵','#3a8a4a','#0a2a14','#ffd84a',1,'vstripes','dkShine']];
SHOP_D.forEach(([n,mk,a,b,l,dk,bk,an],i)=>{ DECKS['d'+i]={name:n,icon:mk,cat:'shop',price:Math.round(15000*Math.pow(1.24,i)),v:dVars(a,b,l,dk,bk,mk,an)}; });
VIP_T.forEach((x,i)=>{ const j=i+1, V=vipAt(j), T=TTHEMES['vip'+j]; DECKS['vipd'+j]={name:V.name+' Deck',icon:V.icon,cat:'vip',tier:j,v:dVars(V.color,T.v.t3,V.color,j%2===0||j>=8,['radial','diag','checker','conic'][j%4],V.icon,DANIM[(j*5)%DANIM.length])}; });
STAR_T.forEach((x,i)=>{ const n=i+1, T=TTHEMES['star'+n]; DECKS['stard'+n]={name:STAR_N[i]+' Deck',icon:'⭐',cat:'star',stars:n,v:dVars(x[3],T.v.t3,x[3],1,['sunburst','dots','radial','conic'][i%4],T.fx[0],['dkShine','dkSpin','dkFlip','dkPaint','dkArc','dkFlicker','dkDrop','dkFade'][i])}; });

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
function themeApply(){ const on=S.mode==='casino'&&S.ctab!=='ranks', b=document.body, T=TTHEMES[curTheme()], D=DECKS[curDeck()];
  BODY_VARS.forEach(v=>b.style.removeProperty('--'+v));
  if(on&&T.v){ b.dataset.ttheme=curTheme(); for(const [k,v] of Object.entries(T.v)) if(k!=='k') b.style.setProperty('--'+k,v); } else delete b.dataset.ttheme;
  if(on&&D.v){ b.dataset.cdeck=curDeck(); for(const [k,v] of Object.entries(D.v)) if(k!=='k'&&k!=='fx') b.style.setProperty('--'+k,v); } else delete b.dataset.cdeck;
  const chips=on?(T.v?T.v.k:D.v?D.v.k:null):null;   // the table theme colours the chips; otherwise the deck does
  if(chips){ b.dataset.chips='1'; chips.forEach((c,i)=>b.style.setProperty('--k'+(i+1),c)); } else delete b.dataset.chips; }
const bonusTxt=it=>it&&it.bonus?`+${it.bonus.p}% ${TH_GAMES[it.bonus.g]}`:'';
function themeChipHTML(){ const T=TTHEMES[curTheme()], D=DECKS[curDeck()], slots=S.ctab==='slots';
  return `🎨 ${T.icon} ${esc(T.name)}${slots?'':` · ${D.icon} ${esc(D.name)}`}${T.bonus?` <b class="th-bonus-tag">${bonusTxt(T)}</b>`:''}`; }
function themeChip(){ if(S.mode!=='casino'||S.ctab==='ranks') return; const old=document.getElementById('themeChip'); if(old){ old.innerHTML=themeChipHTML(); return; }
  const tbl=S.ctab==='slots'?document.querySelector('#view .cab'):document.querySelector('#view .tblmin'); if(!tbl) return;
  tbl.insertAdjacentHTML(S.ctab==='slots'?'beforebegin':'afterend',`<button id="themeChip" data-a="themePick">${themeChipHTML()}</button>`); }
// Slots: the falling flakes become the theme's particles.
function thSlots(){ const sn=document.querySelector('#view .cab .snow'); if(!sn) return; const T=TTHEMES[curTheme()], fx=curTheme()==='lodge'?null:T.fx;
  sn.querySelectorAll('b').forEach((e,i)=>{ if(fx&&i%2===0){ e.textContent=fx[(i/2)%fx.length]; e.className='e'; } else { e.textContent=''; e.className=''; } }); }
// Change the look without redrawing the screen (no mid-spin or mid-hand glitches).
function themeRefresh(){ themeApply(); themeChip(); thSlots(); if(typeof PB!=='undefined'&&PB.st) PB.st.pal=null; }
const _renderTh=render; render=function(){ _renderTh(); themeApply(); themeChip(); thSlots(); };

/* ---------- The picker: tabs for themes / cards, filters for owned / shop / VIP / stars ---------- */
const TP={kind:'theme',cat:'mine'};
const TP_CATS=[['mine','✅ Mine'],['shop','🛒 Shop'],['set','🧩 Sets'],['vip','🎟️ VIP'],['star','⭐ Stars']];
function themePick(){ const isT=TP.kind==='theme', LIST=isT?TTHEMES:DECKS, ok=isT?themeOk:deckOk, cur=isT?curTheme():curDeck();
  const items=Object.entries(LIST).filter(([k,it])=>TP.cat==='mine'?ok(k):(it.cat||'')===TP.cat).sort((a,b)=>(a[1].price||0)-(b[1].price||0));
  const own=Object.keys(LIST).filter(ok).length;
  modal(`<div class="fgm-k">🎨 Your table</div>
    <div class="th-tabs"><button class="${isT?'on':''}" data-a="tpKind" data-v="theme">🟩 Tables</button><button class="${isT?'':'on'}" data-a="tpKind" data-v="deck">🃏 Cards</button></div>
    <div class="th-cats">${TP_CATS.map(([k,l])=>`<button class="${TP.cat===k?'on':''}" data-a="tpCat" data-v="${k}">${l}</button>`).join('')}</div>
    ${(()=>{ const it=LIST[cur]; return isT?`<div class="th-now"><b>${it.icon} ${esc(it.name)}</b><span>${(it.fx||[]).join(' ')} ${TH_ANIM[it.anim]||''}</span><em>${it.bonus?bonusTxt(it)+' wins':'No bonus'}</em></div>`
      :`<div class="th-now"><b>${it.icon} ${esc(it.name)}</b><span>${it.v?DANIM_N[it.v.da]||'':'Classic deal'}</span><em>Chips follow your table</em></div>`; })()}
    <div class="tchips"><span>${own} / ${Object.keys(LIST).length} unlocked</span><span>🎟️ ${esc(tierName(myTier()))}</span><span>⭐ ${myStars()}</span></div>
    <div class="th-grid">${items.map(([k,it],i)=>{ const have=ok(k), buy=!have&&it.price; return `<button class="th-tile ${cur===k?'on':''} ${have?'':'lock'}" style="--d:${Math.min(i,24)*20}ms;${isT&&it.v?`--a:${it.v.t1};--b:${it.v.t3};--c:${it.v.r1}`:''}${!isT&&it.v?`--bk:${it.v.cb};--bl:${it.v.cl};--mk:${it.v.cm}`:''}" data-a="${have?(isT?'themeSet':'deckSet'):buy?(isT?'themeBuy':'deckBuy'):'themeLocked'}" data-v="${k}">
      ${isT?`<i></i><span>${have?it.icon:'🔒'}</span>`:`<b class="th-card"></b>`}<small>${esc(it.name)}</small>${isT&&it.bonus?`<u>+${it.bonus.p}% ${TH_GAMES[it.bonus.g].split(' ')[0]}</u>`:''}${have?'':buy?`<em>${k$(itemPrice(it))}</em>`:`<em>${lockWhy(it)}</em>`}</button>`; }).join('')||'<div class="gd-empty">Nothing here yet</div>'}</div>`); }
Object.assign(ACT,{
  themePick:()=>themePick(), tpKind:el=>{ TP.kind=el.dataset.v; themePick(); }, tpCat:el=>{ TP.cat=el.dataset.v; themePick(); },
  themeSet:el=>{ S.ctheme=el.dataset.v; save(); tone(700,.04,'square',.03); themeRefresh(); themePick(); },
  deckSet:el=>{ S.cdeck=el.dataset.v; save(); tone(800,.04,'square',.03); document.querySelectorAll('.pcard').forEach(c=>c.classList.add('nodeal')); themeRefresh(); themePick(); },
  themeBuy:el=>{ const k=el.dataset.v, it=TTHEMES[k], pr=itemPrice(it); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    setBank(-pr); S.spent=(S.spent||0)+pr; S.themes=(S.themes||[]).concat(k); S.ctheme=k; TB.stk=0; save(); try{ fx.confetti(80); }catch(e){} toast(`${it.icon} ${it.name} — yours!`,'gold'); themeRefresh(); themePick(); },
  deckBuy:el=>{ const k=el.dataset.v, it=DECKS[k], pr=itemPrice(it); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
    setBank(-pr); S.spent=(S.spent||0)+pr; S.decks=(S.decks||[]).concat(k); S.cdeck=k; TB.stk=0; save(); try{ fx.confetti(80); }catch(e){} toast(`${it.icon} ${it.name} — yours!`,'gold'); document.querySelectorAll('.pcard').forEach(c=>c.classList.add('nodeal')); themeRefresh(); themePick(); },
  themeLocked:el=>{ const it=TTHEMES[el.dataset.v]||DECKS[el.dataset.v]; toast(it&&it.set?`🧩 Finish the ${TTHEMES[it.set].name} set`:it&&it.tier?`🎟️ Reach the ${tierName(it.tier)} table`:it&&it.stars?`⭐ Prestige ${it.stars}× to unlock`:'Locked','gold'); },
});

/* ---------- Wins: the theme's particles fly in its own pattern, and its bonus pays a little extra ---------- */
function deckWinFx(big){ const T=TTHEMES[curTheme()], D=DECKS[curDeck()], I=(T.fx||['✨']).concat(D.v&&S.ctab!=='slots'?[D.icon]:[]), A=T.anim||'fountain';
  const host=document.querySelector('#view .felt,#view .pb-stage,#view .reelwin'); if(!host) return; const r=host.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height*.45;
  const n=big?22:12; for(let i=0;i<n;i++){ const e=document.createElement('span'); e.className='dk-burst a-'+A; e.textContent=I[i%I.length]; let x=cx, y=cy, dx=(Math.random()-.5)*r.width*1.1, dy=-80-Math.random()*r.height*.6;
    if(A==='rain'){ x=r.left+Math.random()*r.width; y=r.top-30; dx=(Math.random()-.5)*40; dy=r.height*.8+Math.random()*80; }
    else if(A==='ring'){ const a=i/n*Math.PI*2, R=r.width*.55; dx=Math.cos(a)*R; dy=Math.sin(a)*R*.8; }
    else if(A==='spiral'){ const a=i/n*Math.PI*4, R=40+i*(r.width*.45/n); dx=Math.cos(a)*R; dy=Math.sin(a)*R; }
    else if(A==='float'){ x=r.left+Math.random()*r.width; y=r.bottom-20; dx=(Math.random()-.5)*60; dy=-r.height*.7-Math.random()*60; }
    else if(A==='zig'){ x=r.left+(i%2?r.width*.15:r.width*.85); dx=(i%2?1:-1)*r.width*.7; dy=-40-i*12; }
    else if(A==='pulse'){ x=r.left+r.width*(.15+.7*Math.random()); y=r.top+r.height*(.15+.7*Math.random()); dx=0; dy=0; }
    else if(A==='comet'){ x=r.left-20; y=r.top+Math.random()*r.height*.6; dx=r.width+40; dy=r.height*.35; }
    e.style.left=(x-13)+'px'; e.style.top=y+'px'; e.style.setProperty('--dx',dx+'px'); e.style.setProperty('--dy',dy+'px'); e.style.setProperty('--rot',((Math.random()-.5)*540)+'deg');
    e.style.animationDelay=(i*(A==='rain'||A==='comet'?60:25))+'ms'; document.body.appendChild(e); setTimeout(()=>e.remove(),2200+i*60); } }
function thBonusPop(add){ const host=document.querySelector('#view .felt,#view .pb-stage,#view .reelwin'); const e=document.createElement('div'); e.className='th-bpop';
  e.textContent=`${TTHEMES[curTheme()].icon} +${fmt$(add)} theme bonus`; if(host){ const r=host.getBoundingClientRect(); e.style.left=(r.left+r.width/2)+'px'; e.style.top=(r.top+16)+'px'; } document.body.appendChild(e); setTimeout(()=>e.remove(),2200); }
const TB={stk:0,g:'',open:false,busy:false};
const _setBankDk=setBank;
setBank=function(delta){ const r=_setBankDk.apply(this,arguments); if(TB.busy) return r;
  const g=S.ctab, inGame=S.mode==='casino'&&['slots','roulette','blackjack','poker','craps','pinball'].includes(g); if(!inGame) return r;
  if(TB.g!==g){ TB.g=g; TB.stk=0; TB.open=false; }
  if(delta<0){ const more=TB.open&&g==='blackjack'&&typeof BJ!=='undefined'&&BJ.phase==='play'; TB.stk=(more||g==='craps'?TB.stk:0)-delta; TB.open=true; return r; }
  if(delta>0){ deckWinFx(delta>=(S.chip||1000)*5);
    const profit=g==='craps'?delta/2:delta-TB.stk; TB.stk=0; TB.open=false;
    const B=TTHEMES[curTheme()].bonus; if(B&&profit>0&&(B.g==='all'||B.g===g)){ const add=Math.round(profit*B.p/100); if(add>0){ TB.busy=true; try{ _setBankDk(add); }finally{ TB.busy=false; } S.thBonus=(S.thBonus||0)+add; thBonusPop(add); } } }
  return r; };
