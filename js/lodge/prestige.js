// ⭐ Prestige perks for the lodge itself:
//  • The great room gets grander with every star: a gold star banner (1), a velvet carpet (2), glowing sconces (3),
//    crystal chandelier drops (4), a marble floor (5), a starry painted ceiling (6), gold trim (7), a star mosaic (8).
//  • Silas sells a star-only coat, scarf and crown for each star (24 pieces), locked until you've prestiged that far.
//  • Out the back, every star also opens a new area of the Grounds (js/lodge/grounds.js).

/* ---------- the great room ---------- */
let HUB_STARS=-1, HUB_STAR_BG=null;
const _drawHubStaticPS=drawHubStatic;
drawHubStatic=function(){ const n=Math.min(8,S.prestige||0); if(n===HUB_STARS&&HUB_STAR_BG) return HUB_STAR_BG; const base=_drawHubStaticPS(); HUB_STARS=n; if(!n) return HUB_STAR_BG=base;
  const c=document.createElement('canvas'); c.width=PW; c.height=PH; const x=c.getContext('2d'); x.drawImage(base,0,0); const R=(a,b,w,h,col)=>rect(x,a,b,w,h,col), r=prng(808);
  const star=(cx,cy,col)=>{ R(cx,cy-2,1,5,col); R(cx-2,cy,5,1,col); R(cx-1,cy-1,3,3,col); };
  if(n>=6){ for(const [a,b] of [[8,46],[54,92],[100,138],[146,184]]){ R(a,0,b-a,14,'#141a3a'); for(let i=0;i<6;i++) R(a+2+r()*(b-a-4),1+r()*11,1,1,i%3?'#ffd84a':'#ffffff'); } }
  if(n>=5){ for(let y=182;y<PH;y+=10) for(let xx=0;xx<PW;xx+=10){ R(xx,y,10,10,((xx+y)/10)%2?'#a89478':'#8a7860'); R(xx,y,10,1,'rgba(255,240,210,.25)'); if(r()<.3) R(xx+r()*8,y+r()*8,3,1,'#6a5a46'); } }
  if(n>=2){ R(70,186,52,PH-186,'#7a1020'); R(70,186,2,PH-186,'#c8a45c'); R(120,186,2,PH-186,'#c8a45c'); for(let y=192;y<PH;y+=14) R(78,y,36,1,'#9a1a2c'); }
  if(n>=8){ const cx=96,cy=238; for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; for(let d=2;d<14;d++) R(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.6,1,1,k%2?'#ffd84a':'#fff3b0'); } R(cx-2,cy-1,5,3,'#ffffff'); }
  if(n>=7){ R(0,150,PW,2,'#ffd84a'); R(0,180,PW,1,'#ffd84a'); for(const bx of [0,46,92,138,184]) R(bx,14,8,2,'#ffd84a'); }
  if(n>=1){ R(8,20,176,7,'#5a0f1e'); R(8,20,176,1,'#ffd84a'); R(8,26,176,1,'#ffd84a'); const w=n*10; for(let k=0;k<n;k++) star(96-w/2+5+k*10,23,'#ffd84a');
    for(const bx of [0,46,92,138,184]) R(bx,0,8,3,'#ffd84a'); }
  if(n>=3){ for(const sx of [62,128]){ R(sx,112,4,6,'#c8a45c'); R(sx+1,108,2,4,'#ffe9b0'); x.globalAlpha=.25; R(sx-6,100,16,20,'#ffcf7a'); x.globalAlpha=1; } }
  if(n>=4){ for(const cx of [84,90,96,102,108]) { R(cx,24,1,3+((cx/6)%3),'#bff6ff'); R(cx,27+((cx/6)%3),1,1,'#ffffff'); } }
  return HUB_STAR_BG=c; };

/* ---------- star-only clothes at Silas's ---------- */
const STAR_FITS=[ // [coat colours, scarf colour, crown gold, crown gem]
  [{c:'#e8763a',C:'#b0521e',b:'#ffd84a'},'#ffe08a','#ffd84a','#ff5a3a'],[{c:'#9ab0d8',C:'#6a80a8',b:'#ffffff'},'#e0f0ff','#e8eef8','#6ab0ff'],
  [{c:'#5a2a9a',C:'#3a1a6a',b:'#ffd84a'},'#ffd84a','#ffd84a','#b06aff'],[{c:'#3a8a4a',C:'#24602e',b:'#ffb0d0'},'#ffb0d0','#ffd84a','#3ad08a'],
  [{c:'#c81e2e',C:'#8a101c',b:'#ffffff'},'#ffffff','#fff3b0','#ff3a5a'],[{c:'#1a8a9a',C:'#0e5a66',b:'#ffd84a'},'#7af0ff','#ffd84a','#3affff'],
  [{c:'#1a6a3a',C:'#0e4424',b:'#ffd84a'},'#ffd84a','#ffd84a','#3aff6a'],[{c:'#1a1030',C:'#0a0618',b:'#c0b0ff'},'#c0b0ff','#e8e0ff','#ff6ad8']];
const STAR_NAMES_P=['Rising Star','Twin Stars','Triple Crown','Four Seasons','High Five','Six Pack','Lucky Seven','Infinity'];   // same names as the star themes (js/casino/themes.js loads later)
const CROWN=['............','..x..x..x...','..xxxxxxx...','..xyxxxyx...','..xxxxxxx...'];
STAR_FITS.forEach(([coat,scarf,gold,gem],i)=>{ const n=i+1, nm=STAR_NAMES_P[i], base=2e5*Math.pow(1.6,i);
  const mk=(id,o)=>{ const it=Object.assign({id,cat:'clothes',lvl:1,stars:n},o); Object.defineProperty(it,'price',{get(){ return nice(base*(o.mul||1)*wealthX()); },configurable:true}); it._base=base; ITEMS.push(it); ITEM[id]=it; };
  mk('star_coat'+n,{sub:'body',slot:'body',name:nm+' coat',desc:`Prestige ${n} only. Cut for someone who's done it ${n===1?'once':n+' times'}.`,colors:coat,mul:1});
  mk('star_scarf'+n,{sub:'scarf',slot:'scarf',name:nm+' scarf',desc:`Prestige ${n} only. Woven with a thread of starlight.`,colors:{w:scarf},mul:.6});
  mk('star_crown'+n,{sub:'hat',slot:'hat',name:nm+' crown',desc:`Prestige ${n} only. Everyone at the lodge will know.`,grid:CROWN,pal:{x:gold,y:gem},mul:1.4}); });
const starLocked=it=>it&&it.stars&&(S.prestige||0)<it.stars;
const _buyItemPS=buyItem; buyItem=function(id){ const it=ITEM[id]; if(starLocked(it)){ toast(`⭐ Prestige ${it.stars}× to buy the ${it.name}`,'gold'); return; } return _buyItemPS(id); };
const _renderShopPS=renderShop; renderShop=function(){ _renderShopPS(); const box=LODGE.el&&LODGE.el.querySelector('.lg-shop'); if(!box) return;
  box.querySelectorAll('[data-lg=shopSel][data-id]').forEach(b=>{ const it=ITEM[b.dataset.id]; if(!it||!it.stars) return; b.classList.add('star-item'); if(starLocked(it)){ b.classList.add('locked'); const p=b.querySelector('.lg-ip'); if(p) p.textContent='⭐'.repeat(Math.min(3,it.stars))+(it.stars>3?'×'+it.stars:''); } });
  const ask=box.querySelector('[data-lg=shopAsk]'); if(ask&&SHOP.sel&&starLocked(ITEM[SHOP.sel])){ ask.disabled=true; ask.textContent=`Prestige ${ITEM[SHOP.sel].stars} only`; } };

