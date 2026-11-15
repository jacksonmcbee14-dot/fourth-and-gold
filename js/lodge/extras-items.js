// New things in Silas's shop: perk items (gear that does something), the weekly limited shelf, and the
// collections (sets) you can complete. The rules that make them work are in js/perks.js.

/* ---------- Perk items ---------- */
// Existing items that now have a perk, and one new one. The perk is added to the item's description.
const PERKS={
  acc_rabbitfoot:   'Daily bonus pays 50% more.',
  watch_smart:      '+10% XP from everything.',
  decor_hottub:     '+10% XP from everything.',
  decor_fridge:     'Drinks from Mack last 15 minutes instead of 10.',
  decor_grandfather:'Your daily bonus streak survives one missed day.',
  decor_tv:         'Today’s odds boost on the sportsbook pays a little more.',
};
(()=>{
  if(!ITEM.acc_rabbitfoot){ const it={id:'acc_rabbitfoot',cat:'carry',slot:'acc',name:'Lucky rabbit’s foot',price:150000,lvl:2,desc:'Rub it before every spin.',
    grid:['','','','','','','','','','','','','.........ww.','........www.','.........w..','.........p..'],pal:{w:'#f3ead8',p:'#e88aa8'}};
    ITEMS.push(it); ITEM[it.id]=it; }
  for(const id in PERKS){ const it=ITEM[id]; if(it&&!it.perk){ it.perk=PERKS[id]; it.desc=it.desc+' ✨ Perk: '+PERKS[id]; } }
})();

/* ---------- The weekly limited shelf ---------- */
// Exclusive versions that are only for sale in their week. Four come up every Monday (Eastern time).
const LIMITED=[
  {id:'lim_coat_aurora', cat:'clothes',sub:'body', slot:'body', name:'Aurora parka',      price:400000, desc:'Shimmers green and violet.',colors:{c:'#2a8a7a',C:'#6a3a9a',b:'#bff6ff',w:'#e6fbff'}},
  {id:'lim_coat_lava',   cat:'clothes',sub:'body', slot:'body', name:'Lava leather',      price:550000, desc:'Hot off the volcano.',colors:{c:'#2a0a0a',C:'#ff5a1a',b:'#ffb86a',w:'#ff5a1a'}},
  {id:'lim_coat_mint',   cat:'clothes',sub:'body', slot:'body', name:'Mint tuxedo',       price:500000, desc:'Fresh. Very fresh.',colors:{c:'#9ae0c0',C:'#5aa880',w:'#16161c',b:'#16161c',p:'#2a4a3a'}},
  {id:'lim_coat_neon',   cat:'clothes',sub:'body', slot:'body', name:'Neon tracksuit',    price:350000, desc:'Glows under the bar lights.',colors:{c:'#ff3ad0',C:'#3affd0',b:'#ffffff',p:'#3a1a5a'}},
  {id:'lim_coat_camo',   cat:'clothes',sub:'body', slot:'body', name:'Arctic camo',       price:380000, desc:'Invisible in a snowbank.',colors:{c:'#cfd9e0',C:'#8a9aa8',b:'#5a6a78',p:'#8a9aa8'}},
  {id:'lim_hat_galaxy',  cat:'clothes',sub:'hat',  slot:'hat',  name:'Galaxy beanie',     price:250000, desc:'Stars on your head.',grid:['......z.....','....xyxx....','...xxxxyx...','...xyxxxx...','...wwwwww...'],pal:{x:'#2a1a5a',y:'#ffe066',w:'#6a3a9a',z:'#ff8ad8'}},
  {id:'lim_hat_flame',   cat:'clothes',sub:'hat',  slot:'hat',  name:'Flame top hat',     price:600000, desc:'Hot streak, literally.',grid:['....xxxx....','....xxxx....','....yxyx....','....zzzz....','..xxxxxxxx..'],pal:{x:'#16161c',y:'#ff5a1a',z:'#ffb86a'}},
  {id:'lim_hat_cowpink', cat:'clothes',sub:'hat',  slot:'hat',  name:'Pink cowboy hat',   price:300000, desc:'Yeehaw, but make it pink.',grid:['............','....xxxx....','...xxxxxx...','x..yyyyyy..x','.xxxxxxxxxx.'],pal:{x:'#ff8ab8',y:'#ffffff'}},
  {id:'lim_watch_rainbow',cat:'clothes',sub:'watch',slot:'watch',name:'Rainbow watch',    price:450000, desc:'Changes colour depending on your mood.',dot:'#ff8ad8'},
  {id:'lim_watch_obsidian',cat:'clothes',sub:'watch',slot:'watch',name:'Obsidian watch',  price:450000, desc:'Volcanic glass on your wrist.',dot:'#3a2a4a'},
  {id:'lim_scarf_gold',  cat:'clothes',sub:'scarf',slot:'scarf',name:'Gold-thread scarf', price:280000, desc:'Hand-woven with real gold.',colors:{w:'#ffd84a'}},
  {id:'lim_scarf_ice',   cat:'clothes',sub:'scarf',slot:'scarf',name:'Glacier scarf',     price:220000, desc:'Cold as your poker face.',colors:{w:'#bff6ff'}},
];
for(const it of LIMITED){ Object.assign(it,{limited:1,lvl:1}); if(!ITEM[it.id]){ ITEMS.push(it); ITEM[it.id]=it; } }
// Which four are on the shelf this week, and when the week ends.
function weekNum(){ const p={}; new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);
  const d=Date.UTC(+p.year,+p.month-1,+p.day), monday=d-((new Date(d).getUTCDay()+6)%7)*864e5; return Math.round(monday/6048e5); }
function limitedNow(){ const r=prng(weekNum()*7919), L=LIMITED.slice(); for(let i=L.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [L[i],L[j]]=[L[j],L[i]]; } return L.slice(0,4); }

/* ---------- Collections ---------- */
const d_=s=>s.split(' ').map(x=>'decor_'+x);
const SETS=[
  {id:'golf',     name:'Club Champion',  icon:'⛳', items:d_('golf_bag golf_flag golf_balls golf_cart rug_fairway paint_golf clubs_wall scorecard')},
  {id:'neon',     name:'Neon Nights',    icon:'🌃', items:d_('neon_bar neon_777 neon_win neon_jackpot neon_open neon_lucky')},
  {id:'security', name:'Fort Knox',      icon:'🛡️', items:d_('guard_dog bouncer cameras laser_grid steel_safe vault_door')},
  {id:'pennants', name:'Pennant Wall',   icon:'🚩', items:d_('pen_mvp pen_td pen_go pen_win pen_4g pen_hut')},
  {id:'cabin',    name:'Mountain Man',   icon:'🦌', items:d_('antlers moose fish jackalope skis paddles rug_bear stove woodpile')},
  {id:'holiday',  name:'Holiday Spirit', icon:'🎄', items:d_('xmastree wreath stockings lights snowman presents nutcracker reindeer gingerbread sled')},
  {id:'arcade',   name:'Arcade King',    icon:'🕹️', items:d_('arcade pinball jukebox airhockey pingpong foosball')},
  {id:'art',      name:'Art Collector',  icon:'🖼️', items:null},   // every painting
  {id:'crowns',   name:'Royalty',        icon:'👑', items:['hat_crown','hat_crown_silver','hat_crown_emerald','hat_tiara']},
  {id:'watches',  name:'Watch Collector',icon:'⌚', items:null},   // every regular watch
];
