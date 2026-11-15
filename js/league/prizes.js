// League prizes: gear you can't buy. A league's owner picks one as the weekly prize, and whoever finishes
// the week at #1 gets it. League prizes are kept forever, even through a bankroll reset.

const LEAGUE_PRIZES=[
  {id:'league_crown',   cat:'clothes',sub:'hat',  slot:'hat',  name:'Champion’s crown',     desc:'Diamond-studded. Won, never bought.',
    grid:['............','...d.d.d.d..','...y.y.y.y..','...yyyyyy...','...ydyryd...'],pal:{y:'#ffd84a',d:'#bff6ff',r:'#ff4a5a'}},
  {id:'league_halo',    cat:'clothes',sub:'hat',  slot:'hat',  name:'Golden halo',          desc:'Floats over the best in the league.',
    grid:['...yyyyyy...','..y......y..','...yyyyyy...'],pal:{y:'#ffe066'}},
  {id:'league_cap',     cat:'clothes',sub:'hat',  slot:'hat',  name:'Champions snapback',   desc:'Flat brim. Gold logo. Locker-room fresh.',
    grid:['............','............','....xxxx....','...xxzzxx...','..xxxxxxxyyy'],pal:{x:'#16161c',z:'#ffd84a',y:'#ffd84a'}},
  {id:'league_shades',  cat:'clothes',sub:'glasses',slot:'glasses',name:'Diamond shades',   desc:'They sparkle when you win. So, always.',
    grid:['','','','','','','..dkkkkkkd..'],pal:{k:'#16161c',d:'#bff6ff'}},
  {id:'league_watch',   cat:'clothes',sub:'watch',slot:'watch',name:'Champion’s gold watch',desc:'Engraved on the back: #1.',dot:'#ffd84a'},
  {id:'league_icewatch',cat:'clothes',sub:'watch',slot:'watch',name:'Iced-out watch',       desc:'You can see it from the parking lot.',dot:'#bff6ff'},
  {id:'league_ring',    cat:'clothes',sub:'watch',slot:'watch',name:'Championship ring',    desc:'Heavy. Shiny. Earned.',dot:'#ff4a5a'},
  {id:'league_chain',   cat:'clothes',sub:'scarf',slot:'scarf',name:'Gold chain',           desc:'Cuban link. Catches the firelight.',colors:{w:'#ffd84a'}},
  {id:'league_jacket',  cat:'clothes',sub:'body', slot:'body', name:'Champions jacket',     desc:'Black satin, gold sleeves. League winners only.',
    colors:{c:'#16161c',C:'#ffd84a',b:'#ffd84a',w:'#ffd84a',p:'#16161c'}},
  {id:'league_suit',    cat:'clothes',sub:'body', slot:'body', name:'Commissioner’s suit',  desc:'White and gold. Runs the league.',
    colors:{c:'#f6f3ec',C:'#ffd84a',b:'#ffd84a',w:'#ffd84a',p:'#f6f3ec',o:'#ffd84a'}},
  {id:'league_belt',    cat:'carry',               slot:'acc', name:'Championship belt',    desc:'Over the shoulder. Undisputed.',
    grid:['','','','','','','','','','','.......yy...','......yy....','.....yry....','....yy......','...yy.......'],pal:{y:'#ffd84a',r:'#ff4a5a'}},
  {id:'league_cup',     cat:'carry',               slot:'acc', name:'League cup',           desc:'Lift it over your head. Daily.',
    grid:['','','','','','','','','.......y..y.','.......yyyy.','........yy..','........yy..','.......yyyy.','.......kkkk.'],pal:{y:'#ffd84a',k:'#3a2617'}},
  {id:'decor_league_banner',cat:'decor',sub:'treasure',name:'Champion banner',desc:'Hangs over your room. Says it all.',w:16,h:22,wall:1},
  {id:'decor_league_trophy',cat:'decor',sub:'treasure',name:'League trophy',  desc:'Taller than you. Shinier, too.',w:14,h:24},
];
DECOR_ART.decor_league_banner=(c,x,y,t)=>{ rect(c,x,y,16,2,LP.brass0); for(let yy=2;yy<20;yy++) rect(c,x+1,y+yy,14,1,'#7d1f2a'); for(let i=0;i<7;i++){ rect(c,x+1+i,y+20+i%2,1,2,'#7d1f2a'); rect(c,x+14-i,y+20+i%2,1,2,'#7d1f2a'); }
  rect(c,x+5,y+5,6,4,'#ffd84a'); rect(c,x+4,y+5,1,2,'#ffd84a'); rect(c,x+11,y+5,1,2,'#ffd84a'); rect(c,x+7,y+9,2,2,'#ffd84a'); rect(c,x+6,y+11,4,1,'#ffd84a'); ptext(c,'1',x+7,y+13,'#f3ead8');
  if(Math.sin((t||0)*3)>.7) rect(c,x+10,y+5,1,1,'#ffffff'); };
DECOR_ART.decor_league_trophy=(c,x,y,t)=>{ rect(c,x+1,y,12,2,'#ffd84a'); rect(c,x+2,y+2,10,7,'#ffd84a'); rect(c,x,y+2,2,4,'#ffd84a'); rect(c,x+12,y+2,2,4,'#ffd84a'); rect(c,x+4,y+3,2,4,'#fff3b0');
  rect(c,x+6,y+9,2,5,'#d8b030'); rect(c,x+3,y+14,8,2,'#ffd84a'); rect(c,x+2,y+16,10,8,'#3a2617'); rect(c,x+4,y+18,6,3,'#c8a45c');
  if(Math.sin((t||0)*2.4)>.6) rect(c,x+9,y+3,1,1,'#ffffff'); };
for(const it of LEAGUE_PRIZES){ Object.assign(it,{league:1,price:0,lvl:1}); if(!ITEM[it.id]){ ITEMS.push(it); ITEM[it.id]=it; } }

// The shop never sells them, and level-ups never list them.
shopList=function(){
  const subs=SHOP_SUBS[SHOP.tab], sub=subs&&SHOP.sub!=='all'?SHOP.sub:null;
  return ITEMS.filter(i=>i.cat===SHOP.tab&&!i.free&&!i.league&&(!sub||i.sub===sub)).sort((a,b)=>a.lvl-b.lvl||a.price-b.price);
};
unlocksBetween=function(a,b){ const n=ITEMS.filter(i=>!i.free&&!i.league&&i.lvl>a&&i.lvl<=b).map(i=>i.name); return n.length>4?n.slice(0,4).concat(['and '+(n.length-4)+' more']):n; };
// Resets keep league prizes.
const _wipeForReset=wipeForReset;
wipeForReset=function(){ const keep=(S.lodge&&S.lodge.owned||[]).filter(id=>ITEM[id]&&ITEM[id].league); _wipeForReset(); if(S.lodge) S.lodge.owned=keep; };
function grantPrize(id){ if(!ITEM[id]) return false; S.lodge.owned=S.lodge.owned||[]; if(!S.lodge.owned.includes(id)) S.lodge.owned.push(id); save(); return true; }
