// Arrange for me: pick a vibe (golf, casino night, sports den, cozy cabin, game room, high roller, holiday)
// and My Room is laid out as a designed room — a hero piece over the middle of the wall, matching pairs either
// side, a rug with a table or game on it, chairs either side, tall pieces in the corners — using only the
// pieces you own that fit the vibe. Anything else goes back in storage. Press the vibe again for another take.
// Also: a set of golf decor so a golf room has enough to work with.

/* ---------- Golf decor ---------- */
(()=>{
const R=rect;
const G=[
  ['golf_bag','Golf bag',120000,3,'furniture','',12,26,'A full set, ready for Saturday.',(c,x,y)=>{ R(c,x+2,y+8,8,16,'#2b3a5c'); R(c,x+2,y+12,8,2,LP.brass1); R(c,x+3,y+16,2,6,'#1f2d4a'); R(c,x+2,y+24,8,2,'#1c1c22');
    R(c,x+3,y+1,1,8,'#cfd9e0'); R(c,x+6,y,1,9,'#cfd9e0'); R(c,x+8,y+2,1,7,'#cfd9e0'); R(c,x+2,y,3,2,'#8a929e'); R(c,x+5,y-1,3,2,'#1c1c22'); R(c,x+8,y+1,3,2,'#8a929e'); R(c,x+10,y+10,2,8,LP.wal5); }],
  ['golf_flag','Flagstick',60000,2,'furniture','',12,30,'The 18th hole, indoors.',(c,x,y)=>{ for(let yy=0;yy<4;yy++){ const w=Math.round(6*Math.sqrt(1-((yy-2)/2.2)**2)); R(c,x+6-w,y+26+yy,w*2,1,'#5aa850'); } R(c,x+5,y+28,2,1,'#121216');
    for(let i=0;i<28;i++) R(c,x+5,y+i,1,1,(i>>1)%2?'#f3ead8':'#d0303a'); },
    (c,x,y,t)=>{ const w=Math.sin(t*4)>0?1:0; R(c,x+6,y,5,4,'#d0303a'); R(c,x+10+w,y+1,1,2,'#d0303a'); }],
  ['golf_balls','Golf ball pyramid',40000,1,'furniture','',14,8,'Range balls. Shiny new.',(c,x,y)=>{ R(c,x,y+7,14,1,LP.wal5); for(const [a,b] of [[1,4],[4,4],[7,4],[10,4],[2.5,1.5],[5.5,1.5],[8.5,1.5],[4,-1],[7,-1]]){ R(c,x+a,y+b+1,3,3,'#f6f3ec'); R(c,x+a+2,y+b+3,1,1,'#cfd9e0'); } }],
  ['golf_cart','Golf cart',900000,10,'furniture','',34,22,'Parked by the fire. Keys in it.',(c,x,y)=>{ R(c,x+3,y,28,2,'#f3ead8'); R(c,x+4,y+2,1,9,'#9fa4ac'); R(c,x+29,y+2,1,9,'#9fa4ac'); R(c,x+2,y+10,30,7,'#f3ead8'); R(c,x+2,y+10,30,1,'#ffffff'); R(c,x+6,y+8,10,3,'#2b3a5c'); R(c,x+24,y+6,6,5,'#2b3a5c'); R(c,x+26,y+3,2,4,'#cfd9e0');
    for(const wx of [5,25]){ R(c,x+wx,y+16,5,5,'#1c1c22'); R(c,x+wx+1,y+17,3,3,'#8a929e'); } R(c,x+30,y+12,2,2,'#f2d24b'); }],
  ['rug_fairway','Fairway rug',200000,4,'rugs','F',40,14,'Mown stripes. Don’t take a divot.',(c,x,y)=>{ R(c,x,y,40,14,'#f3ead8'); for(let i=0;i<38;i+=4) R(c,x+1+i,y+1,4,12,(i/4)%2?'#4f8c4e':'#5a9a58'); R(c,x+30,y+5,5,4,'#72c86c'); R(c,x+32,y+7,1,1,'#121216'); }],
  ['paint_golf','Clubhouse painting',180000,3,'wall','W',22,16,'The 18th green at dusk.',(c,x,y)=>{ R(c,x,y,22,16,LP.brass1); R(c,x+2,y+2,18,12,'#e8963c'); R(c,x+2,y+2,18,5,'#f2b26b'); R(c,x+2,y+9,18,5,'#3a8a3a'); for(let i=0;i<18;i++) R(c,x+2+i,y+8+Math.round(Math.sin(i/3)),1,1,'#2a6a2a'); R(c,x+14,y+5,1,5,'#f3ead8'); R(c,x+15,y+5,3,2,'#d0303a'); R(c,x+5,y+11,1,1,'#f3ead8'); }],
  ['clubs_wall','Club rack',150000,4,'wall','W',26,14,'Every club has a story.',(c,x,y)=>{ R(c,x,y+2,26,3,LP.wal5); R(c,x,y+2,26,1,LP.wal6); for(let i=0;i<5;i++){ const cx=x+3+i*5; R(c,cx,y,1,12,'#cfd9e0'); R(c,cx-1,y+11,3,2,i%2?'#8a929e':'#1c1c22'); R(c,cx-1,y,3,2,'#121216'); } }],
  ['scorecard','Framed scorecard',50000,2,'wall','W',16,18,'Your best round. Signed and dated.',(c,x,y)=>{ R(c,x,y,16,18,LP.wal4); R(c,x+2,y+2,12,14,'#f6f3ec'); R(c,x+3,y+3,10,2,'#3a8a3a'); for(let r=0;r<4;r++) for(let k=0;k<4;k++) R(c,x+3+k*3,y+7+r*2,2,1,r===3&&k===3?'#d0303a':'#9fa4ac'); }],
];
for(const [id,name,price,lvl,sub,place,w,h,desc,base,anim] of G){ const full='decor_'+id; if(ITEM[full]) continue;
  const it={id:full,cat:'decor',sub,name,price,lvl,desc,w,h}; if(place==='W') it.wall=1; if(place==='F') it.floor=1;
  let cv=null; DECOR_ART[full]=(c,x,y,t)=>{ if(!cv){ cv=document.createElement('canvas'); cv.width=w+8; cv.height=h+8; const g=cv.getContext('2d'); g.imageSmoothingEnabled=false; base(g,4,4); } c.drawImage(cv,x-4,y-4); if(anim) anim(c,x,y,t||0); };
  ITEMS.push(it); ITEM[full]=it; }
})();

/* ---------- Vibes: which pieces belong to which look ---------- */
const VIBES={
  golf:   {name:'Golf club',  icon:'⛳', items:'golf_bag golf_flag golf_balls golf_cart rug_fairway paint_golf clubs_wall scorecard green trophy league_trophy league_banner arm_green arm_leather sofa_green coffee bookcase fern palm monstera floorlamp paint_mtn paint_sunset pen_go clock'},
  casino: {name:'Casino night',icon:'🎰',items:'slotmachine roulette cardtable rug_poker neon_777 neon_jackpot neon_win neon_lucky neon_bar barcart stools vault goldstack pool paint_gold arm_red loveseat tiffany candelabra lavalamp jukebox'},
  sports: {name:'Sports den', icon:'🏈', items:'tv rug_field paint_stadium jersey pen_mvp pen_td pen_hut pen_win pen_4g recliner bean_red bean_blue sofa_gray popcorn fridge foosball punchbag weights trophy league_trophy league_banner coffee dartboard'},
  cabin:  {name:'Cozy cabin', icon:'🔥', items:'fireplace antlers moose fish jackalope paint_mtn paint_forest paint_aurora cuckoo skis paddles rug_bear rug_braided sofa rocker arm_red stove woodpile trunk hatstand bookcase bearstatue fern sidelamp coffee'},
  arcade: {name:'Game room',  icon:'🕹️',items:'arcade pinball jukebox airhockey pingpong foosball drums amp turntable radio neon_open goldrecord dartboard lavalamp bean_red bean_blue rug_check vending gumball tv sofa_gray'},
  luxury: {name:'High roller',icon:'👑', items:'paint_gold mirror lion vault goldstack chest grandfather armor piano sofa_green loveseat tiffany candelabra rug_persian globe telescope aquarium hottub league_banner league_trophy arm_green paint_night'},
  holiday:{name:'Holiday',    icon:'🎄', items:'xmastree wreath stockings lights snowman presents nutcracker reindeer gingerbread sled rug_snow fireplace rocker arm_red stove woodpile paint_night'},
};
// Plants and lamps can round out any vibe's corners.
const VIBE_FILL='fern palm fiddle monstera floorlamp sidelamp bonsai vase'.split(' ');
const vibeIds=k=>VIBES[k].items.split(' ').map(s=>'decor_'+s);
const vibeOwned=k=>vibeIds(k).filter(id=>ITEM[id]&&owns(id));
const vibeList=()=>Object.keys(VIBES).filter(k=>k!=='holiday'||SEASON.xmas);

/* ---------- The layout: designed spots in My Room ---------- */
// cx/cy = centre point; bot = feet on the floor at this y; mw/mh = the biggest piece that fits; want = what looks right there.
const SPOTS_ROOM=[
  {k:'wall', cx:117,cy:120,mw:40,mh:36,want:'hero'},
  {k:'wall', cx:72, cy:124,mw:26,mh:22,want:'big',pair:'w1'},{k:'wall',cx:162,cy:124,mw:26,mh:22,want:'big',pair:'w1'},
  {k:'wall', cx:72, cy:100,mw:30,mh:12,want:'strip',pair:'w2'},{k:'wall',cx:162,cy:100,mw:30,mh:12,want:'strip',pair:'w2'},
  {k:'rug',  cx:117,cy:240,mw:40,mh:16,want:'hero'},
  {k:'floor',cx:117,bot:200,mw:36,mh:26,want:'wide'},
  {k:'floor',cx:117,cy:240,mw:36,mh:20,want:'wide'},
  {k:'floor',cx:54, bot:198,mw:20,mh:34,want:'tall',pair:'f1'},{k:'floor',cx:181,bot:198,mw:20,mh:34,want:'tall',pair:'f1'},
  {k:'floor',cx:76, cy:244,mw:18,mh:18,want:'seat',pair:'f2'},{k:'floor',cx:158,cy:244,mw:18,mh:18,want:'seat',pair:'f2'},
  {k:'floor',cx:85, bot:200,mw:18,mh:26,want:'tall',pair:'f3'},{k:'floor',cx:149,bot:200,mw:18,mh:26,want:'tall',pair:'f3'},
  {k:'floor',cx:57, bot:296,mw:24,mh:28,want:'any',pair:'f4'},{k:'floor',cx:178,bot:296,mw:24,mh:28,want:'any',pair:'f4'},
];
const SEATS=/arm_|bean_|stools|rocker|recliner|loveseat|chair/;
function spotScore(it,s){ const area=it.w*it.h;
  if(s.want==='hero') return area;
  if(s.want==='big') return area+(it.h>=14?200:0);
  if(s.want==='strip') return it.h<=12?it.w*10:-1;
  if(s.want==='wide') return it.w>=22&&!SEATS.test(it.id)?it.w*20-it.h:-1;
  if(s.want==='tall') return it.h>=it.w*1.2?it.h*10:-1;
  if(s.want==='seat') return SEATS.test(it.id)?100+area:(it.w<=18&&it.h<=18&&it.h>=10?area/4:-1);
  return area/2; }
function kindOf(it){ return it.wall?'wall':it.floor?'rug':'floor'; }
function vibeLayout(k){
  const core=new Set(vibeIds(k).slice(0,8)), pool=vibeOwned(k).map(id=>ITEM[id]), fill=VIBE_FILL.map(s=>ITEM['decor_'+s]).filter(it=>it&&owns(it.id)&&!pool.includes(it));
  const used=new Set(), out=[];
  // the best unused piece for a spot (a little randomness, so pressing again gives a different take)
  const pick=(s,list,twin)=>{ let best=null,bs=-1; for(const it of list){ if(used.has(it.id)||kindOf(it)!==s.k||it.w>s.mw||it.h>s.mh) continue;
      let sc=spotScore(it,s); if(sc<0) continue; sc*=(.75+Math.random()*.5)*(core.has(it.id)?2:1);   // the vibe's signature pieces get the best spots
      if(twin) sc+=5000-60*(Math.abs(it.w-twin.w)+Math.abs(it.h-twin.h));   // the other half of a pair should match
      if(sc>bs){ bs=sc; best=it; } } return best; };
  const from=(s,twin)=>{ for(const L of (s.want==='tall'||s.want==='any'?[pool,fill]:[pool])){ const it=pick(s,L,twin); if(it) return it; } return null; };
  const place=(s,it)=>{ used.add(it.id); let x=Math.round(s.cx-it.w/2), y=s.bot!=null?Math.max(174,s.bot-it.h):Math.round(s.cy-it.h/2); [x,y]=clampDecor(it,x,y); out.push({id:it.id,x,y}); };
  for(let i=0;i<SPOTS_ROOM.length;i++){
    const s=SPOTS_ROOM[i];
    if(s.pair){ const s2=SPOTS_ROOM[++i], a=from(s,null); if(!a) continue; used.add(a.id); const b=from(s2,a); used.delete(a.id);
      if(b){ place(s,a); place(s2,b); } continue; }                       // both halves or neither: keep it symmetrical
    const it=from(s,null); if(it) place(s,it);
  }
  return out;
}

/* ---------- The chooser ---------- */
function openVibes(){
  closeShop(); const box=document.createElement('div'); box.className='lg-shop lg-vibes';
  box.innerHTML=`<div class="lg-shop-head"><span class="lg-dlg-who">ARRANGE MY ROOM</span><button class="lg-btn lg-round" data-lg="shopClose" aria-label="Close">X</button></div>
    <div class="lg-prev-desc">Pick a vibe. I’ll lay out the pieces you own that fit it — everything else goes back in storage. Tap it again for a different take.</div>
    <div class="lg-shop-body"><div class="lg-vibe-grid">${vibeList().map(k=>{ const n=vibeOwned(k).length, ok=n>=3;
      return `<button class="lg-btn lg-vibe ${ok?'':'off'}" data-lg="vibeGo" data-v="${k}" ${ok?'':'disabled'}><span class="ic">${VIBES[k].icon}</span>${esc(VIBES[k].name)}<small>${ok?n+' pieces you own':'Own '+(3-n)+' more to unlock'}</small></button>`; }).join('')}</div>
    <div class="lg-prev-desc" style="margin-top:10px">Need more for a vibe? Silas sells golf, casino, sports and cabin pieces.</div></div>`;
  LODGE.el.querySelector('.lg-stage').appendChild(box);
}
Object.assign(LG_ACT,{
  decArrange:()=>openVibes(),
  vibeGo:b=>{ const k=b.dataset.v, L=vibeLayout(k); if(!L.length){ toast('Not enough '+VIBES[k].name.toLowerCase()+' pieces yet','loss'); return; }
    S.lodge.room=L; S.lodge.vibe=k; save(); closeShop(); if(LODGE.room){ LODGE.room.ED.sel=null; LODGE.room.tray(); }
    [523,659,784,1047].forEach((f,i)=>tone(f,.08,'square',.04,i*.06));
    toast(VIBES[k].icon+' '+VIBES[k].name+' · '+L.length+' pieces placed','gold'); },
});
