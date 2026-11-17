// 🦆 Dawn Flight — 8-bit bird hunting at the marshes scattered over the Grounds (from your first prestige star).
// Every marsh has its own birds and difficulty (tier 1–10): more birds in the air at once (3–6), more waves (5–8),
// faster and twitchier flyers. You get a few shells per wave; tap to shoot. Hit 70% of the birds to BEAT the marsh —
// the first time you do, you win its prize (an exclusive gun, clothes or a trophy). Payouts climb with your hit rate
// (50% gets something back, 100% pays ×6) times your gun and the marsh's difficulty. Golden birds pay 2× the stake.
// 31 guns: 12 at the gunsmith, 7 hidden in treasure chests, 12 won only from marshes.

const HUNT={el:null,c:null,ctx:null,loop:null,bg:null,VW:192,VH:340,sc:2,g:null,m:0};
// Species: colours, size (1 or 2), speed, twitchiness, shape
const HU_SP={
  mallard:{n:'Mallard',b:'#8a7a6a',h:'#1a7a3a',c:'#6a3a2a',y:'#b0a090',w:'#7a8a9a',l:'#3a5ab0',k:'#ffb02a',col:'#ffffff',t:'#2a2a2a',spd:1,err:.6},
  teal:{n:'Green-winged Teal',b:'#9a8a7a',h:'#7a3a1a',c:'#c0a080',y:'#d0c0a0',w:'#8a8a8a',l:'#2aa05a',k:'#3a3a3a',t:'#3a3a3a',spd:1.3,err:.9},
  wood:{n:'Wood Duck',b:'#5a4a3a',h:'#1a6a5a',c:'#8a3a2a',y:'#d8c8a0',w:'#3a3a5a',l:'#4a8ad0',k:'#e04a2a',col:'#ffffff',t:'#1a1a2a',spd:1.15,err:.8},
  pintail:{n:'Pintail',b:'#c0c0c8',h:'#5a3a2a',c:'#f0f0f0',y:'#f0f0f0',w:'#8a8a90',l:'#2a6a4a',k:'#5a6a7a',t:'#2a2a2a',spd:1.35,err:.5,tail:1},
  goose:{n:'Canada Goose',b:'#8a8070',h:'#1a1a1a',c:'#c0b8a8',y:'#e0d8c8',w:'#6a6050',l:'#4a4030',k:'#1a1a1a',col:'#ffffff',t:'#1a1a1a',spd:.8,err:.3,sz:2,neck:1},
  snowgoose:{n:'Snow Goose',b:'#f4f4f4',h:'#f4f4f4',c:'#e8e8e8',y:'#ffffff',w:'#e8e8e8',l:'#1a1a1a',k:'#ff8aa0',t:'#e0e0e0',spd:.95,err:.35,sz:2,neck:1},
  swan:{n:'Trumpeter Swan',b:'#ffffff',h:'#ffffff',c:'#f4f4f4',y:'#ffffff',w:'#f0f0f0',l:'#e0e0e0',k:'#1a1a1a',t:'#f0f0f0',spd:.75,err:.25,sz:2,neck:2},
  quail:{n:'Bobwhite Quail',b:'#8a5a3a',h:'#3a2a1a',c:'#c08a5a',y:'#e0c8a0',w:'#6a4a2a',l:'#b08a5a',k:'#3a3a3a',col:'#ffffff',t:'#5a3a2a',spd:1.65,err:1.4},
  pheasant:{n:'Ring-necked Pheasant',b:'#b06a2a',h:'#2a5a3a',c:'#c8783a',y:'#d8a060',w:'#8a5a2a',l:'#e0c080',k:'#e0d0a0',col:'#ffffff',t:'#8a5a2a',spd:1.3,err:.9,tail:2,eye:'#e02a2a'},
  grouse:{n:'Ruffed Grouse',b:'#7a6040',h:'#6a5038',c:'#a08060',y:'#c8b090',w:'#5a4430',l:'#2a1a10',k:'#3a3a3a',t:'#3a2a1a',spd:1.25,err:1.2},
  ptarmigan:{n:'Ptarmigan',b:'#f0f0f4',h:'#f0f0f4',c:'#ffffff',y:'#ffffff',w:'#ffffff',l:'#e0e0e8',k:'#1a1a1a',t:'#1a1a1a',spd:1.45,err:1.1,eye:'#e02a2a'},
  puffin:{n:'Puffin',b:'#1a1a22',h:'#1a1a22',c:'#ffffff',y:'#ffffff',w:'#1a1a22',l:'#3a3a44',k:'#ff6a1a',t:'#1a1a22',spd:1.55,err:.9,face:'#ffffff'},
  gull:{n:'Herring Gull',b:'#f4f4f4',h:'#f4f4f4',c:'#ffffff',y:'#ffffff',w:'#a8b0b8',l:'#1a1a1a',k:'#ffd84a',t:'#f0f0f0',spd:1.2,err:.6},
  parrot:{n:'Macaw',b:'#e02a2a',h:'#e02a2a',c:'#ff4a3a',y:'#ff6a4a',w:'#2a6ae0',l:'#ffd84a',k:'#2a2a2a',t:'#2a6ae0',spd:1.45,err:1.1,tail:2,face:'#ffffff'},
  flamingo:{n:'Flamingo',b:'#ff8ab0',h:'#ff8ab0',c:'#ffa0c0',y:'#ffb8d0',w:'#ff6a9a',l:'#1a1a1a',k:'#1a1a1a',t:'#ff8ab0',spd:1,err:.45,sz:2,neck:2},
  heron:{n:'Great Blue Heron',b:'#6a7a9a',h:'#e0e0e8',c:'#8a9ab8',y:'#a0aac0',w:'#5a6a8a',l:'#2a3a5a',k:'#e0b02a',t:'#5a6a8a',spd:.9,err:.4,sz:2,neck:2},
  bat:{n:'Cave Bat',b:'#3a2a4a',h:'#3a2a4a',c:'#4a3a5a',y:'#4a3a5a',w:'#2a1a3a',l:'#5a4a6a',k:'#3a2a4a',t:'#3a2a4a',spd:1.75,err:2.2,bat:1,eye:'#ff4a4a'},
  owl:{n:'Snowy Owl',b:'#ece8e0',h:'#ece8e0',c:'#ffffff',y:'#ffffff',w:'#d8d0c0',l:'#3a3a3a',k:'#3a3a3a',t:'#d8d0c0',spd:1.1,err:1.3,eye:'#ffd84a',owl:1},
  crow:{n:'Raven',b:'#1a1a24',h:'#1a1a24',c:'#24243a',y:'#2a2a3a',w:'#14141e',l:'#3a3a5a',k:'#2a2a2a',t:'#14141e',spd:1.4,err:1.3},
  falcon:{n:'Peregrine Falcon',b:'#5a6a7a',h:'#2a2a3a',c:'#e8e0d0',y:'#f0e8d8',w:'#4a5a6a',l:'#2a3a4a',k:'#ffd84a',t:'#3a4a5a',spd:2.05,err:.9,face:'#ffffff'},
  phoenix:{n:'Phoenix',b:'#ff5a1a',h:'#ffd84a',c:'#ff8a2a',y:'#ffb04a',w:'#ff3a1a',l:'#ffe080',k:'#ffffff',t:'#ffd84a',spd:2.15,err:1.4,tail:2,fire:1},
  golden:{n:'Golden Bird',b:'#e8b42c',h:'#fff3a0',c:'#ffd84a',y:'#fff0a0',w:'#fff6c0',l:'#ffffff',k:'#ffb02a',t:'#c89a2a',spd:1.6,err:1,gold:1},
};
// Marshes (same order as they're placed on the map in js/lodge/grounds.js): name, birds, tier 1–10, prize.
const HU_MARSH=[
  ['Lily Pond',['mallard','teal'],1,{kind:'item',id:'prize_duckcap',ic:'🧢',name:'Duck-bill Cap'}],
  ['Pinewood Slough',['wood','mallard'],2,{kind:'gun',gun:'pinecone'}],
  ['Mirror Shallows',['pintail','mallard','goose'],2,{kind:'trophy',ic:'🪞',name:'Glass Decoy'}],
  ['Goose Cove',['goose','snowgoose'],3,{kind:'gun',gun:'honker'}],
  ['Cattail Flats',['mallard','teal','pintail'],3,{kind:'item',id:'prize_fieldjacket',ic:'🧥',name:'Waxed Field Jacket'}],
  ['The Reedbed',['teal','wood'],4,{kind:'gun',gun:'reedwhistle'}],
  ['Old Decoy Pond',['quail','mallard'],4,{kind:'trophy',ic:'🦆',name:'Antique Decoy'}],
  ['Sunrise Bog',['pheasant','grouse'],5,{kind:'gun',gun:'dawnbreaker'}],
  ['Frozen Tarn',['ptarmigan','snowgoose'],5,{kind:'gun',gun:'frostbite'}],
  ['Steam Hollow',['swan','heron'],5,{kind:'item',id:'prize_steamscarf',ic:'🧣',name:'Steam-knit Scarf'}],
  ['Rainbow Pool',['parrot','heron'],6,{kind:'gun',gun:'prism'}],
  ['Canopy Lagoon',['parrot','falcon'],7,{kind:'item',id:'prize_pith',ic:'⛑️',name:'Explorer’s Pith Helmet'}],
  ['Echo Grotto',['bat','owl'],7,{kind:'gun',gun:'echo'}],
  ['Petal Pond',['flamingo','quail'],6,{kind:'gun',gun:'sakura'}],
  ['Puffin Rocks',['puffin','gull'],7,{kind:'trophy',ic:'🐧',name:'Puffin Figurine'}],
  ['Shipwreck Lagoon',['gull','falcon'],8,{kind:'gun',gun:'corsair'}],
  ['Starfall Tarn',['phoenix','falcon'],10,{kind:'gun',gun:'phoenixfire'}],
  ['Willow Bend',['crow','wood'],5,{kind:'item',id:'prize_boonie',ic:'👒',name:'Bayou Boonie Hat'}],
  ['Gator Slough',['heron','crow'],6,{kind:'gun',gun:'gator'}],
  ['Moonlit Bayou',['owl','bat'],7,{kind:'gun',gun:'nightowl'}],
  ['Spanish Moss Marsh',['grouse','pheasant','quail'],6,{kind:'item',id:'prize_ghillie',ic:'🌿',name:'Ghillie Suit'}],
].map(([name,birds,tier,reward])=>({name,birds,tier,reward}));
// Guns: ex = extra shells per wave, r = shot spread (pixels), pay = payout ×, slow = birds fly 20% slower.
const HU_GUNS={
  field:{name:'Field Shotgun',icon:'🔫',price:0,ex:0,r:9,pay:1},
  pump:{name:'Pump Action',icon:'🎯',price:5e6,ex:1,r:9,pay:1},
  double:{name:'Double Barrel',icon:'💥',price:2e7,ex:0,r:13,pay:1.05},
  lever:{name:'Lever Rifle',icon:'🤠',price:6e7,ex:1,r:7,pay:1.25},
  semi:{name:'Semi-Auto',icon:'⚡',price:1.5e8,ex:2,r:8,pay:1.1},
  auto:{name:'Auto-Loader',icon:'🔁',price:4e8,ex:3,r:8,pay:1.1},
  rifle:{name:'Marksman Rifle',icon:'🔭',price:8e8,ex:0,r:5,pay:1.7},
  scatter:{name:'Scattergun',icon:'🌪️',price:1.5e9,ex:1,r:14,pay:1.05},
  gold:{name:'Gilded Over-Under',icon:'🏆',price:3e9,ex:2,r:12,pay:1.3,stars:2},
  royal:{name:'Royal Express',icon:'👑',price:8e9,ex:2,r:10,pay:1.45,stars:3},
  star:{name:'Starfire',icon:'🌟',price:2e10,ex:3,r:13,pay:1.5,stars:4},
  cosmic:{name:'Cosmic Cannon',icon:'🪐',price:6e10,ex:4,r:14,pay:1.7,stars:6},
  tracker:{name:'Tracker’s Carbine',icon:'🐾',src:'chest',ex:1,r:10,pay:1.15,slow:1},
  bramble:{name:'Bramble Bore',icon:'🌿',src:'chest',ex:2,r:11,pay:1.1},
  sunbeam:{name:'Sunbeam',icon:'☀️',src:'chest',ex:1,r:12,pay:1.2},
  reefer:{name:'Reef Runner',icon:'🐠',src:'chest',ex:2,r:9,pay:1.25},
  moonlit:{name:'Moonlit Repeater',icon:'🌙',src:'chest',ex:1,r:10,pay:1.3,slow:1},
  geode:{name:'Geode Gun',icon:'💎',src:'chest',ex:3,r:9,pay:1.2},
  gale:{name:'Gale Force',icon:'🌬️',src:'chest',ex:2,r:13,pay:1.15},
  pinecone:{name:'Pinecone Pump',icon:'🌲',src:'marsh',ex:2,r:10,pay:1.15},
  honker:{name:'Honker 10-Gauge',icon:'📯',src:'marsh',ex:1,r:15,pay:1.1},
  reedwhistle:{name:'Reed Whistle',icon:'🎐',src:'marsh',ex:2,r:11,pay:1.2},
  dawnbreaker:{name:'Dawnbreaker',icon:'🌅',src:'marsh',ex:2,r:12,pay:1.3},
  frostbite:{name:'Frostbite',icon:'❄️',src:'marsh',ex:2,r:11,pay:1.3,slow:1},
  prism:{name:'Prism Blaster',icon:'🌈',src:'marsh',ex:3,r:12,pay:1.35},
  echo:{name:'Echo Chamber',icon:'🦇',src:'marsh',ex:3,r:10,pay:1.4,slow:1},
  sakura:{name:'Sakura Twin',icon:'🌸',src:'marsh',ex:2,r:13,pay:1.35},
  corsair:{name:'Corsair Blunderbuss',icon:'🏴‍☠️',src:'marsh',ex:2,r:16,pay:1.3},
  gator:{name:'Gator Jaw',icon:'🐊',src:'marsh',ex:3,r:12,pay:1.4},
  nightowl:{name:'Night Owl',icon:'🦉',src:'marsh',ex:3,r:11,pay:1.45,slow:1},
  phoenixfire:{name:'Phoenix Fire',icon:'🔥',src:'marsh',ex:4,r:14,pay:1.8,slow:1},
};
const HU_LADDER=[[1,6],[.9,3],[.8,2],[.7,1.4],[.6,.9],[.5,.5]];
const huMine=()=>{ S.hunt=Object.assign({guns:['field'],gun:'field',best:{},stake:0,rounds:0},S.hunt||{}); if(typeof S.hunt.best!=='object') S.hunt.best={}; return S.hunt; };
const huHas=k=>huMine().guns.includes(k);
const huGun=()=>HU_GUNS[huHas(huMine().gun)&&HU_GUNS[huMine().gun]?huMine().gun:'field'];
const huPrice=k=>nice(HU_GUNS[k].price*Math.max(starOff(),wealthX()/6000));
const huStakes=()=>{ const c=Math.max(1e5,cashNow()); return [...new Set([.001,.005,.01,.02,.05].map(f=>nice(Math.max(10000,c*f))))]; };
const huTier=M=>({per:Math.min(6,2+Math.ceil(M.tier/2)),waves:5+Math.floor(M.tier/3),spd:76+M.tier*7,err:1.3+M.tier*.1,time:Math.max(4.2,7-M.tier*.25)});

// Prize clothes (shown in the closet once won; never sold)
(()=>{ const add=o=>{ ITEMS.push(o); ITEM[o.id]=o; };
  add({id:'prize_duckcap',cat:'prize',sub:'hat',slot:'hat',lvl:1,price:0,name:'Duck-bill Cap',desc:'Won at Lily Pond.',grid:['............','............','....xxxx....','...xxzxxx...','...xxxxxxyy.'],pal:{x:'#2a6a3a',z:'#ffd84a',y:'#ffb02a'}});
  add({id:'prize_pith',cat:'prize',sub:'hat',slot:'hat',lvl:1,price:0,name:'Explorer’s Pith Helmet',desc:'Won at Canopy Lagoon.',grid:['............','....xxxx....','...xxxxxx...','..xxxxxxxx..','.yyyyyyyyyy.'],pal:{x:'#d8c8a0',y:'#b8a880'}});
  add({id:'prize_boonie',cat:'prize',sub:'hat',slot:'hat',lvl:1,price:0,name:'Bayou Boonie Hat',desc:'Won at Willow Bend.',grid:['............','....xxxx....','...xxxxxx...','..yyyyyyyy..','............'],pal:{x:'#5a6a3a',y:'#4a5a2a'}});
  add({id:'prize_fieldjacket',cat:'prize',sub:'body',slot:'body',lvl:1,price:0,name:'Waxed Field Jacket',desc:'Won at Cattail Flats.',colors:{c:'#6a5a3a',C:'#4a3e28',b:'#2a2418'}});
  add({id:'prize_ghillie',cat:'prize',sub:'body',slot:'body',lvl:1,price:0,name:'Ghillie Suit',desc:'Won at Spanish Moss Marsh.',colors:{c:'#4a6a2a',C:'#3a5420',b:'#6a8a3a'}});
  add({id:'prize_steamscarf',cat:'prize',sub:'scarf',slot:'scarf',lvl:1,price:0,name:'Steam-knit Scarf',desc:'Won at Steam Hollow.',colors:{w:'#e8e0f0'}}); })();

/* ---------- 8-bit birds ---------- */
const HU_SPR={};
function hu8Sprite(k,f,dead){ const key=k+f+(dead?'d':''); if(HU_SPR[key]) return HU_SPR[key]; const P=HU_SP[k], c=document.createElement('canvas'); c.width=20; c.height=14; const x=c.getContext('2d'), R=(a,b,w,h,col)=>{ x.fillStyle=col; x.fillRect(a,b,w,h); };
  if(P.bat){ R(7,5,6,4,P.b); R(8,4,4,1,P.b); R(8,3,1,1,P.b); R(11,3,1,1,P.b); R(9,6,1,1,P.eye); R(11,6,1,1,P.eye);
    const up=f===0, mid=f===1; for(const s of [-1,1]){ const ox=s<0?7:13; if(up){ R(s<0?2:13,1,5,2,P.w); R(s<0?1:17,0,2,2,P.w); R(s<0?4:13,3,3,2,P.w); } else if(mid){ R(s<0?0:13,5,7,2,P.w); R(s<0?1:13,7,4,1,P.w); } else { R(s<0?2:13,8,5,2,P.w); R(s<0?1:17,10,2,2,P.w); } } }
  else { const nk=P.neck||0;
    if(P.tail===2){ R(0,6,5,1,P.t); R(1,7,3,1,P.t); } else if(P.tail){ R(1,6,4,1,P.t); } else R(2,5,3,2,P.t);
    R(4,5,9,4,P.b); R(5,4,7,1,P.b); R(5,9,7,1,P.y); R(11,5,2,4,P.c);
    if(nk){ R(13,4-nk,2,3+nk,P.h); R(14,2-nk*2,3,3,P.h); R(17,3-nk*2,2,1,P.k); R(15,3-nk*2,1,1,P.eye||'#111'); if(P.col) R(13,6,2,1,P.col); }
    else { R(13,3,4,4,P.h); R(14,2,2,1,P.h); R(17,4,2,2,P.k); if(P.face) R(15,4,2,2,P.face); R(15,4,1,1,P.eye||'#111'); if(P.col) R(13,7,2,1,P.col); if(P.owl){ R(13,2,1,1,P.h); R(16,2,1,1,P.h); R(15,4,1,1,P.eye); R(14,4,1,1,'#111'); } }
    if(f===0){ R(6,0,4,5,P.w); R(7,0,2,1,P.l); R(5,1,1,3,P.w); } else if(f===1){ R(4,5,7,2,P.w); R(5,5,3,1,P.l); } else { R(6,8,4,5,P.w); R(7,12,2,1,P.l); }
    if(P.fire){ R(1,4,1,1,'#ffd84a'); R(0,8,1,1,'#ff8a2a'); } }
  if(dead){ x.globalCompositeOperation='source-atop'; x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(0,0,20,14); }
  return HU_SPR[key]=c; }

/* ---------- the scene (painted once per marsh) ---------- */
const HU_SKY={lawn:['#1c2350','#4a3a7a','#b06a8a','#f0a070','#ffe0a0'],pines:['#0e1230','#1c2050','#3a3070','#6a4a8a','#a87aa0'],lake:['#3a6ab8','#5a8ad0','#8ab4e8','#c0dcf4','#f0f6ff'],marsh:['#2a2a5a','#5a3a7a','#c86a8a','#f0a070','#ffd890'],
  ridge:['#04081a','#0a1a3a','#123058','#1a4a6a','#2a6a7a'],springs:['#1a1a3a','#3a2a5a','#7a4a7a','#c86a7a','#f0a08a'],falls:['#2a7ad0','#4a9ae8','#7ac0f4','#b0e0ff','#e0f6ff'],caves:['#06040e','#100a1e','#1a1030','#24143e','#30184a'],
  orchard:['#4a3a90','#8a5ab0','#e08ab0','#ffb0a8','#ffe4c0'],cove:['#04081e','#0a1638','#142a5a','#1e3e7a','#2a5090'],summit:['#020108','#0a0620','#160c34','#22124a','#30185a'],bayou:['#0e1a14','#1a2a1e','#2a3a2a','#4a5a3a','#7a7a4a']};
function huPaint(){ const M=HU_MARSH[HUNT.m], Wd=wdGen(), o=Wd.L.find(L=>L.k==='marsh'&&L.m===HUNT.m), R=REG[o?o.reg:0], sky=HU_SKY[R.id]||HU_SKY.marsh, VW=HUNT.VW, VH=HUNT.VH;
  const c=document.createElement('canvas'); c.width=VW; c.height=VH; const x=c.getContext('2d'), r=prng(HUNT.m*77+5), R_=(a,b,w,h,col)=>{ x.fillStyle=col; x.fillRect(a,b,w,h); };
  const H0=Math.round(VH*.62), bandH=H0/sky.length;
  sky.forEach((col,i)=>{ R_(0,Math.round(i*bandH),VW,Math.ceil(bandH)+1,col); if(i<sky.length-1){ const y=Math.round((i+1)*bandH)-3; x.fillStyle=sky[i+1]; for(let yy=0;yy<3;yy++) for(let xx=(yy%2);xx<VW;xx+=2) if((xx+yy)%(yy+2)===0) x.fillRect(xx,y+yy,1,1); } });
  const night=/pines|ridge|caves|cove|summit|bayou/.test(R.id);
  if(night||R.id==='springs') for(let k=0;k<70;k++) R_(Math.floor(r()*VW),Math.floor(r()*H0*.6),1,1,r()>.8?'#ffffff':'#a8b0d8');
  if(R.id==='ridge'||R.id==='summit') for(const [col,base] of [['#2aff9a',30],['#7a6aff',46]]) for(let xx=0;xx<VW;xx++){ const y=base+Math.round(Math.sin(xx*.05+base)*8); x.globalAlpha=.35; R_(xx,y,1,14+Math.round(Math.sin(xx*.13)*4),col); x.globalAlpha=1; }
  const sx=Math.round(VW*.68), sy=Math.round(H0*.72), sr=night?9:14, scol=night?'#f4f0e0':'#fff4c8';
  if(R.id!=='caves'){ for(let yy=-sr-6;yy<=sr+6;yy++) for(let xx=-sr-6;xx<=sr+6;xx++){ const d=xx*xx+yy*yy; if(d<=sr*sr) R_(sx+xx,sy+yy,1,1,scol); else if(d<=(sr+5)**2&&(xx+yy)%2===0){ x.globalAlpha=.35; R_(sx+xx,sy+yy,1,1,scol); x.globalAlpha=1; } } }
  const mtn=(base,amp,col,seed)=>{ for(let xx=0;xx<VW;xx+=2){ const h=Math.round(base-Math.abs(Math.sin(xx*.021+seed))*amp-Math.sin(xx*.07+seed*3)*amp*.25); R_(xx,h,2,H0-h+1,col); } };
  const mc=R.id==='caves'?['#1a1030','#120a24']:R.id==='falls'?['#5a8a9a','#3a6a6a']:['#3a3060','#251f44']; mtn(H0-8,40,mc[0],1.3); mtn(H0,22,mc[1],4.1);
  if(R.id==='ridge'||R.id==='springs'){ for(let xx=0;xx<VW;xx+=2){ const h=Math.round(H0-8-Math.abs(Math.sin(xx*.021+1.3))*40-Math.sin(xx*.07+3.9)*10); R_(xx,h,2,3,'#e8f0ff'); } }
  if(R.id==='caves') for(let k=0;k<16;k++){ const xx=Math.floor(r()*VW), h=10+Math.floor(r()*50); for(let yy=0;yy<h;yy++) R_(xx-Math.floor((h-yy)/8),yy,1+Math.floor((h-yy)/4),1,'#1a1030'); }
  const tree=R.tree==='palm'?'palm':R.tree==='blossom'?'blossom':R.tree==='jungle'?'jungle':R.tree==='crystal'?'crystal':R.tree==='willow'?'willow':R.tree==='oak'?'oak':R.tree==='deadpine'?'deadpine':R.tree==='snowpine'?'snowpine':'pine';
  for(let xx=-8;xx<VW;xx+=10+Math.floor(r()*6)){ x.save(); x.globalAlpha=.9; wdTree(x,xx,H0-12+Math.floor(r()*4),tree,Math.floor(r()*255)); x.restore(); }
  const wc=R.id==='bayou'?['#2a3a2a','#3a4a32']:R.id==='springs'?['#2a9a9a','#5ad0c8']:R.id==='caves'?['#14183a','#20285a']:['#2a3a6a','#3a5a8a']; R_(0,H0+4,VW,VH-H0-4,wc[0]);
  for(let yy=H0+6;yy<VH;yy+=3){ x.fillStyle=wc[1]; for(let xx=(yy*7)%11;xx<VW;xx+=11+((yy*3)%9)) x.fillRect(xx,yy,4+((xx+yy)%5),1); }
  if(R.id!=='caves'){ for(let yy=0;yy<14;yy++) R_(sx-10+yy%3,H0+6+yy*3,20-yy,1,scol); }
  for(let k=0;k<VW*.55;k++){ const xx=Math.floor(r()*VW), h=14+Math.floor(r()*30), base=VH; x.fillStyle=k%3?'#3a4a22':'#4a5a2a'; x.fillRect(xx,base-h,1,h); if(k%4===0){ R_(xx,base-h-4,2,5,'#5a3a1a'); R_(xx,base-h-5,1,1,'#7a5a3a'); } }
  return c; }

/* ---------- play ---------- */
function huSpawn(g){ const M=HU_MARSH[HUNT.m], D=huTier(M), list=[]; for(let i=0;i<D.per;i++){ const gold=Math.random()<.05, k=gold?'golden':M.birds[Math.floor(Math.random()*M.birds.length)], P=HU_SP[k], sp=D.spd*P.spd*(huGun().slow?.8:1);
    list.push({k,P,x:12+Math.random()*(HUNT.VW-24),y:HUNT.VH*.8,vx:(Math.random()<.5?-1:1)*sp*(.55+Math.random()*.5),vy:-sp*(.75+Math.random()*.3),delay:i*.38,sz:P.sz||1,dead:false,gone:false,fall:0}); }
  g.birds=list; g.shells=D.per+1+huGun().ex; g.waveT=0; g.total+=D.per; g.banner={t:0,txt:'WAVE '+(g.wave+1)}; tone(523,.05,'square',.03); }
function huStep(g,dt){ const D=huTier(HU_MARSH[HUNT.m]); g.waveT+=dt; const VW=HUNT.VW, top=14, low=HUNT.VH*.6;
  for(const b of g.birds){ if(b.gone) continue; if(b.delay>0){ b.delay-=dt; continue; }
    if(b.dead){ b.fall+=dt; b.y+=60*dt+b.fall*240*dt; if(b.y>HUNT.VH+10) b.gone=true; continue; }
    const leave=g.waveT>D.time||(g.shells<=0&&g.waveT>.5); if(leave){ b.vy=-Math.abs(b.vy)-200*dt; } else { if(b.x<6&&b.vx<0||b.x>VW-6&&b.vx>0) b.vx*=-1; if(b.y<top) b.vy=Math.abs(b.vy); if(b.y>low&&g.waveT>1.2) b.vy=-Math.abs(b.vy); if(Math.random()<dt*b.P.err*D.err){ if(Math.random()<.6) b.vx*=-1; else b.vy*=-1; } }
    b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y<-20){ b.gone=true; b.esc=true; } }
  if(g.birds.every(b=>b.gone)){ g.row.push(...g.birds.map(b=>b.esc?0:1)); g.wave++; if(g.wave>=D.waves) huEnd(g); else huSpawn(g); } }
function huShoot(px,py){ const g=HUNT.g; if(!g||g.phase!=='play'||g.shells<=0) return; g.shells--; g.flash={x:px,y:py,t:0}; g.shake=3; tone(150,.07,'sawtooth',.07); tone(90,.12,'square',.05,.02);
  const G=huGun(); let hit=false; for(const b of g.birds){ if(b.dead||b.gone||b.delay>0) continue; if(Math.hypot(b.x-px,b.y-py)<G.r+5*b.sz){ b.dead=true; hit=true; g.hits++; if(b.k==='golden'){ g.gold++; g.banner={t:0,txt:'GOLDEN BIRD!'}; }
    for(let k=0;k<10;k++) g.fx.push({x:b.x,y:b.y,vx:(Math.random()-.5)*90,vy:(Math.random()-.9)*80,t:0,c:[b.P.b,b.P.w,b.P.h,'#ffffff'][k%4]}); tone(880,.05,'square',.04,.05); } }
  if(!hit&&g.shells===0) g.banner={t:0,txt:'OUT OF SHELLS'}; }
function huEnd(g){ g.phase='over'; const P=huMine(), M=HU_MARSH[HUNT.m], G=huGun(), W=wdState(), ratio=g.total?g.hits/g.total:0, rung=HU_LADDER.find(([r])=>ratio>=r-1e-9), mult=rung?rung[1]*G.pay*(1+M.tier*.08):0;
  const pay=Math.round(g.stake*mult)+g.gold*g.stake*2; if(pay) setBank(pay); const best=(P.best[HUNT.m]||0); if(g.hits>best) P.best[HUNT.m]=g.hits; P.rounds++;
  const rec=W.marsh[HUNT.m]=W.marsh[HUNT.m]||{}; let prize=''; if(ratio>=.7&&!rec.beat){ rec.beat=1; prize=huGivePrize(M.reward); } rec.best=Math.max(rec.best||0,Math.round(ratio*100));
  save(); if(typeof gainXP==='function') gainXP(15+g.hits*2+M.tier*3,'Dawn Flight'); if(pay>g.stake||prize){ try{ fx.confetti(prize?220:100); fx.coins(60,1800); }catch(e){} }
  const card=HUNT.el.querySelector('.hu-card'); card.innerHTML=`<div class="gf-card-in"><div class="gf-k">${esc(M.name.toUpperCase())} · ${esc(G.name.toUpperCase())}</div><div class="gf-big">${g.hits} <small>/ ${g.total}</small></div>
    <div class="gf-k">${Math.round(ratio*100)}% · ${ratio>=.7?'MARSH BEATEN':'BEAT IT WITH 70%'}</div>${prize?`<div class="hu-prize">🏆 ${prize}</div>`:''}${g.gold?`<div class="gf-k gold">🌟 ${g.gold} golden · +${k$(g.gold*g.stake*2)}</div>`:''}
    <div class="gf-k ${pay?'gold':''}">${pay?'+'+fmt$(pay)+(mult?' · ×'+(+mult.toFixed(2)):''):'No payout — hit half to get paid'}</div>
    <div class="fgm-row" style="justify-content:center;gap:8px;margin-top:10px"><button class="btn gold" data-hu="again">Again · ${k$(g.stake)}</button><button class="btn" data-hu="menu">Guns & stake</button></div></div>`; card.classList.add('on'); }
function huGivePrize(R){ if(R.kind==='gun'){ const P=huMine(); if(!P.guns.includes(R.gun)) P.guns.push(R.gun); const G=HU_GUNS[R.gun]; return `${G.icon} ${esc(G.name)} — a new gun!`; }
  if(R.kind==='item'){ S.lodge.owned=(S.lodge.owned||[]).concat(R.id); return `${R.ic} ${esc(R.name)} — in your closet`; }
  const W=wdState(); if(!W.items.includes(R.ic+' '+R.name)) W.items.push(R.ic+' '+R.name); return `${R.ic} ${esc(R.name)} — a trophy for your pack`; }
function huDraw(t,dt){ const x=HUNT.ctx, g=HUNT.g, VW=HUNT.VW, VH=HUNT.VH; x.setTransform(1,0,0,1,0,0);
  if(g&&g.shake){ x.translate(Math.round((Math.random()-.5)*g.shake),Math.round((Math.random()-.5)*g.shake)); g.shake*=.8; if(g.shake<.5) g.shake=0; }
  x.drawImage(HUNT.bg,0,0); const H0=Math.round(VH*.62);
  for(let k=0;k<10;k++){ if(Math.sin(t*2+k*1.7)>.4){ x.fillStyle='rgba(255,250,220,.6)'; x.fillRect((k*37+Math.floor(t*6))%VW,H0+10+(k*13)%Math.max(10,VH-H0-30),5,1); } }
  if(g){ if(g.phase==='play') huStep(g,dt);
    for(const b of g.birds){ if(b.gone||b.delay>0) continue; const f=b.dead?1:Math.floor(t*(10+b.P.spd*4)+b.x)%3, sp=hu8Sprite(b.k,f,b.dead), w=20*b.sz, h=14*b.sz;
      x.save(); x.translate(Math.round(b.x),Math.round(b.y)); if(b.vx<0) x.scale(-1,1); if(b.dead) x.scale(1,-1); if(b.P.gold&&!b.dead&&Math.floor(t*8)%2){ x.fillStyle='rgba(255,240,150,.5)'; x.fillRect(-w/2-2,-h/2-2,w+4,h+4); } x.drawImage(sp,-w/2,-h/2,w,h); x.restore(); }
    g.fx=g.fx.filter(p=>(p.t+=dt)<1); for(const p of g.fx){ p.vy+=120*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; x.fillStyle=p.c; x.fillRect(Math.round(p.x),Math.round(p.y),p.t<.5?2:1,1); }
    if(g.flash){ g.flash.t+=dt; const k=g.flash.t/.2; if(k>=1) g.flash=null; else { const r=Math.round(huGun().r*(.7+k*.5)); x.fillStyle=k<.4?'#fff6c0':'#ffb04a'; for(let a=0;a<24;a++){ const an=a/24*Math.PI*2; x.fillRect(Math.round(g.flash.x+Math.cos(an)*r),Math.round(g.flash.y+Math.sin(an)*r),1,1); } if(k<.3){ x.fillRect(Math.round(g.flash.x)-1,Math.round(g.flash.y)-1,3,3); } } }
    if(g.banner){ g.banner.t+=dt; if(g.banner.t>1.3) g.banner=null; else if(Math.floor(g.banner.t*8)%2===0||g.banner.t>.4){ const s=2, w=ptextW(g.banner.txt,s); x.fillStyle='rgba(10,8,20,.7)'; x.fillRect(Math.round(VW/2-w/2-4),Math.round(VH*.3-4),w+8,10*s+4); ptext(x,g.banner.txt,Math.round(VW/2-w/2),Math.round(VH*.3),'#fff6dc',s); } }
    if(g.phase==='play'){ const D=huTier(HU_MARSH[HUNT.m]); x.fillStyle='rgba(10,8,20,.75)'; x.fillRect(0,VH-16,VW,16); const wl='WAVE '+(g.wave+1)+' OF '+D.waves, sx0=8+ptextW(wl); ptext(x,wl,4,VH-11,'#ffe9b0');
      const n=D.per+1+huGun().ex; for(let k=0;k<n;k++){ x.fillStyle=k<g.shells?'#e0203a':'#3a3a4a'; x.fillRect(sx0+k*5,VH-13,3,7); x.fillStyle=k<g.shells?'#ffd84a':'#2a2a34'; x.fillRect(sx0+k*5,VH-7,3,2); }
      const s='HIT '+g.hits+' OF '+g.total; ptext(x,s,VW-ptextW(s)-4,VH-11,'#7be08a'); const left=Math.max(0,D.time-g.waveT); x.fillStyle='#ffd84a'; x.fillRect(0,VH-17,Math.round(VW*left/D.time),1); } } }

/* ---------- menus ---------- */
function huBirdImg(k){ const c=document.createElement('canvas'), s=hu8Sprite(k,0); c.width=40; c.height=28; const x=c.getContext('2d'); x.imageSmoothingEnabled=false; x.drawImage(s,0,0,40,28); return c.toDataURL(); }
function huMenu(){ const P=huMine(), M=HU_MARSH[HUNT.m], D=huTier(M), W=wdState(), rec=W.marsh[HUNT.m]||{}, st=huStakes(); if(!P.stake||!st.includes(P.stake)) P.stake=st[2]||st[0];
  const R=M.reward, prize=R.kind==='gun'?`${HU_GUNS[R.gun].icon} ${HU_GUNS[R.gun].name}`:`${R.ic} ${R.name}`;
  const card=HUNT.el.querySelector('.hu-card'); card.innerHTML=`<div class="gf-card-in hu-menu"><div class="gf-k">🦆 ${esc(M.name.toUpperCase())}</div><div class="hu-tier">${'★'.repeat(Math.ceil(M.tier/2))}${'☆'.repeat(5-Math.ceil(M.tier/2))} · tier ${M.tier}</div>
    <div class="hu-birds">${M.birds.map(k=>`<span><img src="${huBirdImg(k)}" alt=""><small>${esc(HU_SP[k].n)}</small></span>`).join('')}</div>
    <div class="hu-sub">${D.per} birds at once · ${D.waves} waves · ${D.waves*D.per} birds · ${D.time.toFixed(1)}s a wave<br>Hit 70% to beat it · 50% pays ½ · 70% ×1.4 · 90% ×3 · 100% ×6</div>
    <div class="hu-prizeline">${rec.beat?'✅ Beaten':'🏆 Prize: '+esc(prize)}${rec.best?` · best ${rec.best}%`:''}</div>
    <div class="hu-guns">${P.guns.filter(k=>HU_GUNS[k]).map(k=>{ const G=HU_GUNS[k]; return `<button class="hu-gun ${P.gun===k?'on':''}" data-hu="use" data-v="${k}"><span>${G.icon}</span><b>${esc(G.name)}</b><small>+${G.ex} shells · spread ${G.r} · ×${G.pay}${G.slow?' · slows birds':''}</small></button>`; }).join('')}</div>
    <div class="hu-stakes">${st.map(v=>`<button class="${P.stake===v?'on':''}" data-hu="stake" data-v="${v}">${k$(v)}</button>`).join('')}</div>
    <button class="btn gold wide" data-hu="play" ${P.stake>S.bank?'disabled':''}>Hunt · ${k$(P.stake)}</button><div class="hu-note">More guns at the Gunsmith on the Front Lawn — and hidden in chests</div></div>`; card.classList.add('on'); }
function huShop(){ const P=huMine(); modal(`<div class="fgm-k">🔫 The Gunsmith</div><div class="tchips"><span>${P.guns.length} / ${Object.keys(HU_GUNS).length} guns</span><span>⭐ ${wdStars()}</span></div>
  <div class="hu-guns shop">${Object.entries(HU_GUNS).map(([k,G])=>{ const own=huHas(k), lock=G.stars&&wdStars()<G.stars, hidden=G.src&&!own; return `<button class="hu-gun ${P.gun===k?'on':''} ${own?'':'lock'}" data-a="${own?'huUse':hidden?'huWhere':lock?'huLock':'huBuy'}" data-v="${k}"><span>${hidden?'❔':G.icon}</span><b>${hidden?(G.src==='marsh'?'Won at a marsh':'Hidden in a chest'):esc(G.name)}</b>
    <small>${hidden?'Go find it':`+${G.ex} shells · spread ${G.r} · ×${G.pay}${G.slow?' · slows birds':''}`}</small><em>${own?(P.gun===k?'IN HAND':'USE'):hidden?'':lock?'⭐'+G.stars:k$(huPrice(k))}</em></button>`; }).join('')}</div>`); }
Object.assign(ACT,{ huUse:el=>{ huMine().gun=el.dataset.v; save(); huShop(); }, huLock:el=>toast(`⭐ Prestige ${HU_GUNS[el.dataset.v].stars}× to buy the ${HU_GUNS[el.dataset.v].name}`,'gold'),
  huWhere:el=>toast(HU_GUNS[el.dataset.v].src==='marsh'?'🦆 Beat the right marsh to win this one':'🧰 Somewhere out there, in a chest','gold'),
  huBuy:el=>{ const k=el.dataset.v, pr=huPrice(k), P=huMine(); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; } setBank(-pr); S.spent=(S.spent||0)+pr; P.guns.push(k); P.gun=k; save(); try{ fx.confetti(80); }catch(e){} toast(`${HU_GUNS[k].icon} ${HU_GUNS[k].name} — yours!`,'gold'); huShop(); } });
function huPlay(){ const P=huMine(); if(P.stake>S.bank){ toast('Not enough in the bankroll','loss'); return; } setBank(-P.stake); save();
  HUNT.el.querySelector('.hu-card').classList.remove('on'); HUNT.g={phase:'play',wave:0,hits:0,total:0,gold:0,stake:P.stake,birds:[],fx:[],row:[],shells:0}; huSpawn(HUNT.g); }
function huSize(){ const w=innerWidth, h=innerHeight, sc=Math.max(2,Math.round(Math.min(w,h*.62)/185)); HUNT.sc=sc; HUNT.VW=Math.ceil(w/sc); HUNT.VH=Math.ceil(h/sc); HUNT.c.width=HUNT.VW; HUNT.c.height=HUNT.VH; HUNT.c.style.width=HUNT.VW*sc+'px'; HUNT.c.style.height=HUNT.VH*sc+'px'; HUNT.ctx.imageSmoothingEnabled=false; HUNT.bg=huPaint(); }
function huDom(){ if(HUNT.el) return; const el=document.createElement('div'); el.id='hunt'; el.className='golf hunt'; el.innerHTML=`<canvas class="wd-c"></canvas><button class="gf-x" data-hu="close" aria-label="Back">←</button><div class="hu-card gf-card"></div>`;
  document.body.appendChild(el); HUNT.el=el; HUNT.c=el.querySelector('canvas'); HUNT.ctx=HUNT.c.getContext('2d'); HUNT.loop=makeLoop(huDraw);
  HUNT.c.addEventListener('pointerdown',e=>{ const r=HUNT.c.getBoundingClientRect(); huShoot((e.clientX-r.left)/HUNT.sc,(e.clientY-r.top)/HUNT.sc); });
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-hu]'); if(!b) return; const a=b.dataset.hu, k=b.dataset.v, P=huMine();
    if(a==='close') closeHunt(); else if(a==='play'||a==='again') huPlay(); else if(a==='menu') huMenu();
    else if(a==='stake'){ P.stake=+k; save(); huMenu(); } else if(a==='use'){ P.gun=k; save(); tone(700,.05,'square',.03); huMenu(); } });
  addEventListener('resize',()=>{ if(HUNT.el.classList.contains('on')) huSize(); }); }
function openHunt(m){ if(wdStars()<1){ toast('⭐ Hunting opens at your first prestige','gold'); if(typeof GR!=='undefined'&&GR.open) setTimeout(()=>grResume(),50); return; } if(typeof closeModal==='function') closeModal(); huDom(); HUNT.m=m||0; HUNT.el.classList.add('on'); document.body.classList.add('in-golf');
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop(); huSize(); HUNT.g=null; huMenu(); HUNT.loop.start(); }
function closeHunt(){ if(!HUNT.el) return; HUNT.loop.stop(); HUNT.el.classList.remove('on'); document.body.classList.remove('in-golf'); if(HUNT.g&&HUNT.g.phase==='play') toast('Hunt abandoned — stake lost','loss'); HUNT.g=null; save();
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start(); else if(!(typeof GR!=='undefined'&&GR.open)) render(); }
Object.assign(ACT,{ huntOpen:()=>openHunt(0) });
