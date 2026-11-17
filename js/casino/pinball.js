// 🕹️ Pinball (casino tab). A real physics table: flippers, pop bumpers, slingshots, drop targets, top lanes, an
// orbit, a lock saucer for MULTIBALL, skill shots, ball save and an end-of-ball bonus count-up.
//  • Bet a stake, play 3 balls; your score pays out on a ladder (10K pays 0.5× … 800K pays 30×).
//  • Your completed sets light up as glowing targets on the playfield — hit them all for a COLLECTION super jackpot.
//  • The table is drawn in your chosen table theme (js/casino/themes.js), and you can buy new machines, each with
//    its own layout and feature: Neon Nights (4 bumpers + Neon Frenzy), Gridiron (Touchdown gate), Royale (2-lock
//    multiball, double set targets).
// Controls: one button (or tap the table). With a ball in the launch lane: hold and let go to fire. Otherwise: both flippers.

const PB_W=360, PB_H=640, PB_G=980, PB_R=7;
const PB_MACH={
  classic:{name:'Lodge Classic',icon:'🌲',price:0,bumpers:[[120,240],[220,240],[170,310]],locks:3},
  neon:{name:'Neon Nights',icon:'🌃',price:2e6,bumpers:[[110,230],[230,230],[170,300],[170,180]],locks:3,frenzy:1},
  gridiron:{name:'Gridiron',icon:'🏈',price:5e6,bumpers:[[118,250],[222,250],[170,320]],locks:3,td:1},
  royale:{name:'Royale',icon:'👑',price:2e7,bumpers:[[110,240],[230,240],[140,310],[200,310]],locks:2,royal:1},
};
const PB_MPAL={neon:['#1a0636','#05010e','#ff3ad0','#3affd0'],gridiron:['#2a7a3a','#0c3a18','#ffffff','#ffd84a'],royale:['#3a0e5a','#12041e','#ffd84a','#ff5a8a']};
// 96 more machines: 76 to buy (cheap → very expensive), 12 for VIP table tiers, 8 for prestige stars.
const PB_LAY=[[[120,240],[220,240],[170,310]],[[118,250],[222,250],[170,320]],[[110,230],[230,230],[170,300],[170,180]],[[110,240],[230,240],[140,310],[200,310]],[[105,230],[235,230],[170,190],[135,300],[205,300]]];
const PB_BASE=[['Galaxy Quest','🚀','space',230],['Pirate Cove','🏴‍☠️','ocean',200],['Jungle Rumble','🦍','jungle',110],['Candy Land','🍭','candy',320],['Volcano Vault','🌋','volcano',12],['Arctic Blast','❄️','arctic',195],['Metro Nights','🌆','city',250],['Pixel Arcade','👾','retro',280],
  ['Dragon Lair','🐉','volcano',0],['Deep Sea','🐙','ocean',215],['Safari','🦁','jungle',40],['Sugar Rush','🧁','candy',340],['Moon Base','🌙','space',250],['Ice Castle','🏰','arctic',205],['Vegas Strip','🎰','city',45],['Retro Racer','🏎️','retro',0],
  ['Wild West','🤠','desert',30],['Pharaoh','🐫','desert',45],['Ninja Dojo','🥷','royale',0],['Haunted Manor','👻','space',270],['Disco Fever','🪩','neon',300],['Rock Legend','🎸','neon',350],['Robot Wars','🤖','retro',200],['Dino Park','🦖','jungle',100],
  ['Treasure Island','💰','ocean',185],['Snow Lodge','🎿','arctic',210],['Circus','🎪','candy',0],['Samurai','⛩️','royale',350],['Alien Invasion','👽','space',120],['Lava Lamp','🫧','neon',20],['Gold Rush','⛏️','desert',42],['Thunder Road','⚡','city',55],
  ['Fairy Garden','🧚','jungle',300],['Hockey Night','🏒','arctic',220],['Slam Dunk','🏀','gridiron',25],['Home Run','⚾','gridiron',130],['Hole in One','⛳','gridiron',120],['Monster Truck','🛻','volcano',15]];
const PB_GATE={space:'WARP',ocean:'TREASURE',jungle:'VINE SWING',candy:'SUGAR RUSH',volcano:'ERUPTION',arctic:'AVALANCHE',city:'JACKPOT ALLEY',retro:'1UP',desert:'GOLD STRIKE',royale:'SHOGUN',neon:'ENCORE',gridiron:'SCORE!'};
function pbGen(i,deluxe,extra){ const [nm,ic,art,h]=PB_BASE[i%PB_BASE.length], d=deluxe?1:0;
  return Object.assign({name:nm+(deluxe?' Deluxe':''),icon:ic,art,pal:[`hsl(${h},55%,${d?24:28}%)`,`hsl(${h},65%,6%)`,`hsl(${(h+40)%360},90%,66%)`,`hsl(${(h+200)%360},90%,70%)`],
    bumpers:PB_LAY[(i+d*2)%PB_LAY.length],locks:d?2:3,save:8+d*4,bp:100+(i%3)*50+d*100,frenzy:(i%2||d)?15-d*5:0,gate:(i%3===0||d)?PB_GATE[art]:null,royal:d&&i%4===0,xball:i%5===0||(d&&i%3===0),m0:d&&i%6===0?2:1},extra); }
PB_BASE.forEach((b,i)=>{ PB_MACH['m'+i]=pbGen(i,0,{cat:'shop',price:Math.round(250000*Math.pow(1.22,i*2))}); PB_MACH['md'+i]=pbGen(i,1,{cat:'shop',price:Math.round(250000*Math.pow(1.22,i*2+1))}); });
for(let j=1;j<=12;j++) PB_MACH['mvip'+j]=Object.assign(pbGen(j*3,1,{cat:'vip',tier:j}),{name:'VIP Table '+j,icon:'🎟️',bp:200+j*20,gate:'VIP JACKPOT',xball:true});
for(let s=1;s<=8;s++) PB_MACH['mstar'+s]=Object.assign(pbGen(s*5,1,{cat:'star',stars:s}),{name:'⭐ '+(typeof STAR_N!=='undefined'?STAR_N[s-1]:'Star '+s),icon:'⭐',bumpers:PB_LAY[4],locks:2,save:14,bp:300+s*25,frenzy:10,gate:'SUPERNOVA',royal:true,xball:true,m0:2});
Object.assign(PB_MACH.classic,{cat:'free',free:1}); ['neon','gridiron','royale'].forEach(k=>PB_MACH[k].cat='shop');
Object.assign(PB_MACH.neon,{bp:100,frenzy:15}); Object.assign(PB_MACH.gridiron,{gate:'TOUCHDOWN'}); Object.assign(PB_MACH.royale,{royal:1});
const pbHas=k=>{ const M=PB_MACH[k]; if(!M) return false; if(M.free) return true; if(M.tier) return myTier()>=M.tier; if(M.stars) return myStars()>=M.stars; return pbMine().owned.includes(k); };
const pbBonuses=M=>[M.bumpers.length+' bumpers',M.locks===2?'🔒 2-lock multiball':'',M.frenzy?'⚡ Frenzy':'',M.gate?'🚪 '+M.gate:'',M.royal?'🧩 2× sets':'',M.xball?'➕ Extra ball':'',M.m0>1?'✖️ Start ×'+M.m0:'',(M.save||8)>8?'🛟 '+(M.save)+'s save':'',(M.bp||100)>100?'💥 '+M.bp+'/bump':''].filter(Boolean);
const PB_PAL={lodge:['#1f6a4a','#06180f','#ffd84a'],golf:['#3aa860','#0c3a1e','#ffffff'],neon:['#4a1a7a','#10041e','#ff3ad0'],security:['#4a5664','#14181e','#7fd0ff'],pennants:['#1e3a7a','#08122a','#e0203a'],
  cabin:['#6a3a1a','#2a1408','#f3ead8'],holiday:['#a81a2a','#3a060c','#3ad08a'],arcade:['#0e5a6a','#041a20','#ff3ad0'],art:['#6a1a3a','#1e0610','#ffd84a'],crowns:['#4a1a8a','#14062a','#ffd84a'],watches:['#1a2a4a','#060c18','#cfd9e0']};
const PB_LADDER=[[10000,.5],[25000,1],[50000,2],[100000,4],[200000,8],[400000,15],[800000,30]];
const pbMult=sc=>{ let m=0; for(const [s,x] of PB_LADDER) if(sc>=s) m=x; return m; };
const PB={st:null,raf:0,cv:null,ctx:null,stake:0,launch:0,hold:0};
const pbMine=()=>Object.assign({owned:['classic'],m:'classic',best:{}},S.pinball||{});
const pbMachine=()=>{ const P=pbMine(); return PB_MACH[pbHas(P.m)?P.m:'classic']; };
const pbPrice=k=>nice((PB_MACH[k].price||0)*(typeof wealthX==='function'?Math.max(1,wealthX()/20):1));
const pbStakeMax=()=>Math.floor(Math.min(S.bank,typeof tableMax==='function'?tableMax():Infinity)), pbStakeMin=()=>typeof tableMin==='function'?tableMin():1000;

/* ---------- Building a table ---------- */
function pbTable(M){
  const walls=[], arc=[];
  for(let i=0;i<=24;i++){ const a=Math.PI+Math.PI*i/24; arc.push([170+156*Math.cos(a)+0*1,190+156*Math.sin(a)]); }
  walls.push([14,620,14,190]); for(let i=0;i<arc.length-1;i++) walls.push([arc[i][0],arc[i][1],arc[i+1][0],arc[i+1][1]]);
  walls.push([326,190,346,190]); walls.push([346,190,346,640]); walls.push([326,640,326,236]); walls.push([326,612,346,612]);   // launch lane + its floor
  walls.push([14,470,98,548]); walls.push([326,470,242,548]);                      // inlane guides
  walls.push([40,410,40,470]); walls.push([40,470,82,500]); walls.push([300,410,300,470]); walls.push([300,470,258,500]);   // sling bodies
  walls.push([142,62,142,92]); walls.push([198,62,198,92]);                         // top lane pegs
  const st={M,walls,gate:[326,236,346,206],slings:[[40,410,82,500,1],[300,410,258,500,-1]],
    bumpers:M.bumpers.map(([x,y])=>({x,y,r:18,hit:0})),
    lanes:[{x:114,lit:0},{x:170,lit:0},{x:226,lit:0}],
    targets:[{x:252,y:150,up:1},{x:274,y:166,up:1},{x:296,y:182,up:1}],
    saucer:{x:62,y:300,r:11},
    flips:[{px:98,py:552,dir:1,a:.52,av:0,len:58,tip:null},{px:242,py:552,dir:-1,a:.52,av:0,len:58,tip:null}],
    sets:(typeof setsDone==='function'?setsDone():[]).slice(0,6).map((s,i,arr)=>({icon:s.icon,x:170+(i-(arr.length-1)/2)*36,y:404,lit:0,hit:0})),
    balls:[],score:0,ballN:1,mult:1,locks:0,saveT:0,bonus:{lanes:0,targets:0,bumps:0},combo:0,comboT:0,frenzyT:0,tdT:0,mb:0,pops:[],shake:0,flash:null,phase:'ready',over:false,feed:[],tilt:0};
  return st; }
function pbBallInLane(st){ st.balls.push({x:336,y:600,vx:0,vy:0,lane:1,lock:0}); st.saveT=st.M.save||8; st.mult=Math.max(st.mult,st.M.m0||1); }

/* ---------- Physics ---------- */
function pbSeg(b,ax,ay,bx,by,rad,e,vs,kick){ const dx=bx-ax, dy=by-ay, L=dx*dx+dy*dy||1, t=Math.max(0,Math.min(1,((b.x-ax)*dx+(b.y-ay)*dy)/L)), px=ax+dx*t, py=ay+dy*t;
  let nx=b.x-px, ny=b.y-py; const d=Math.hypot(nx,ny), min=PB_R+rad; if(d>=min||d===0) return false; nx/=d; ny/=d; b.x=px+nx*min; b.y=py+ny*min;
  const sx=vs?vs[0]*t:0, sy=vs?vs[1]*t:0, rvx=b.vx-sx, rvy=b.vy-sy, vn=rvx*nx+rvy*ny;
  if(vn<0){ b.vx-=(1+e)*vn*nx; b.vy-=(1+e)*vn*ny; if(kick){ b.vx+=nx*kick; b.vy+=ny*kick; } } return true; }
function pbFlipTip(f,a){ return [f.px+Math.cos(a)*f.len*f.dir, f.py+Math.sin(a)*f.len]; }
function pbStep(st,h){ const M=st.M;
  for(const f of st.flips){ const up=f.dir>0?PB.l:PB.r, target=up?-.5:.52, prev=f.a; f.a+= Math.sign(target-f.a)*Math.min(Math.abs(target-f.a),(up?20:11)*h); f.av=(f.a-prev)/h;
    const t0=pbFlipTip(f,prev), t1=pbFlipTip(f,f.a); f.vs=[(t1[0]-t0[0])/h,(t1[1]-t0[1])/h]; f.tip=t1; }
  for(const b of st.balls){ if(b.out) continue;
    if(b.lock>0){ b.lock-=h; if(b.lock<=0){ b.vx=180+Math.random()*80; b.vy=-320; b.x=st.saucer.x+14; } continue; }
    if(b.lane&&b.vx===0&&b.vy===0) continue;
    b.vy+=PB_G*h; b.x+=b.vx*h; b.y+=b.vy*h;
    for(const w of st.walls) pbSeg(b,w[0],w[1],w[2],w[3],0,.4);
    if(b.vy>0||b.x<326) pbSeg(b,...st.gate,0,.3);
    if(b.lane&&b.y<230){ b.lane=0; }
    for(const [ax,ay,bx,by,d] of st.slings) if(pbSeg(b,ax,ay,bx,by,3,.6,null,280)){ pbScore(st,50,b.x,b.y,'#ffd84a',.6); PB.sfx(520); }
    for(const u of st.bumpers){ const dx=b.x-u.x, dy=b.y-u.y, d=Math.hypot(dx,dy); if(d<u.r+PB_R&&d>0){ const nx=dx/d, ny=dy/d; b.x=u.x+nx*(u.r+PB_R); b.y=u.y+ny*(u.r+PB_R);
        const vn=b.vx*nx+b.vy*ny; if(vn<0){ b.vx-=1.9*vn*nx; b.vy-=1.9*vn*ny; } b.vx+=nx*330; b.vy+=ny*330; u.hit=.25; st.bonus.bumps++; st.shake=Math.max(st.shake,2);
        pbScore(st,(st.M.bp||100)*(st.frenzyT>0?5:1),u.x,u.y-24,st.acc||'#ffd84a',.8); PB.sfx(880+Math.random()*200);
        if(M.frenzy&&st.bonus.bumps%M.frenzy===0&&st.frenzyT<=0){ st.frenzyT=15; pbBanner(st,'⚡ FRENZY!','#ff3ad0'); st.flash='#ff3ad0'; } } }
    for(const t of st.targets) if(t.up&&Math.hypot(b.x-t.x,b.y-t.y)<PB_R+9){ t.up=0; const n=-(b.vx*.6+b.vy*.8); b.vx=-b.vx*.6; b.vy=Math.abs(b.vy)*.6+40; pbScore(st,750,t.x,t.y-14,'#3affd0',.8); PB.sfx(660);
        if(st.targets.every(x=>!x.up)){ st.bonus.targets++; pbScore(st,10000,170,200,'#3affd0',1.4); pbBanner(st,'TARGETS DOWN! ×'+(st.mult+1),'#3affd0'); st.mult=Math.min(6,st.mult+1); setTimeout(()=>st.targets.forEach(x=>x.up=1),1500); } }
    for(const l of st.lanes) if(!l.lit&&Math.abs(b.x-l.x)<12&&b.y<94&&b.y>58){ l.lit=1; pbScore(st,500,l.x,100,'#ffd84a',.7); PB.sfx(990);
        if(st.lanes.every(x=>x.lit)){ st.bonus.lanes++; if(M.xball&&st.bonus.lanes===2&&!st.xb){ st.xb=1; st.ballN--; pbBanner(st,'➕ EXTRA BALL!','#3ad08a'); st.flash='#3ad08a'; try{ fx.confetti(80); }catch(e){} } st.mult=Math.min(6,st.mult+1); pbBanner(st,'LANES! BONUS ×'+st.mult,'#ffd84a'); setTimeout(()=>st.lanes.forEach(x=>x.lit=0),900); } }
    if(b.vy<-300&&b.x<34&&b.y>220&&b.y<260&&!b.orb){ b.orb=1; st.combo=st.comboT>0?st.combo+1:1; st.comboT=3; pbScore(st,2500*st.combo,40,230,'#ff8a3a',1); pbBanner(st,st.combo>1?'COMBO ×'+st.combo+'!':'ORBIT!','#ff8a3a'); PB.sfx(740); }
    if(b.y>300) b.orb=0;
    if((M.gate||M.td)&&st.tdT<=0&&Math.abs(b.x-170)<20&&b.y<140&&b.y>120&&b.vy<0){ st.tdT=8; pbScore(st,20000*st.mult,170,130,'#3ad08a',1.5); pbBanner(st,(M.gate||'TOUCHDOWN')+'!','#3ad08a'); st.shake=5; try{ fx.confetti(60); }catch(e){} }
    const sc=st.saucer; if(Math.hypot(b.x-sc.x,b.y-sc.y)<sc.r&&!b.lock){ b.lock=1.1; b.x=sc.x; b.y=sc.y; b.vx=b.vy=0;
        if(st.mb){ pbScore(st,25000*st.mult,sc.x,sc.y-20,'#ff3ad0',1.6); pbBanner(st,'JACKPOT!','#ff3ad0'); st.shake=6; PB.sfx(1320); try{ fx.confetti(90); }catch(e){} }
        else { st.locks++; pbBanner(st,'BALL '+st.locks+' LOCKED','#bff6ff'); PB.sfx(600);
          if(st.locks>=M.locks){ st.locks=0; st.mb=1; pbBanner(st,'MULTIBALL!','#ff3ad0'); st.flash='#ff3ad0'; st.shake=8; for(let i=0;i<2;i++) setTimeout(()=>{ if(!st.over){ st.balls.push({x:336,y:400,vx:0,vy:-1300,lane:1,lock:0}); } },300+i*500); st.saveT=10; try{ fx.confetti(120); }catch(e){} } } }
    for(const s of st.sets) if(Math.hypot(b.x-s.x,b.y-s.y)<PB_R+11&&s.hit<=0){ s.hit=.4; s.lit=1; const v=(M.royal?2:1)*1500; pbScore(st,v,s.x,s.y-18,'#ffd84a',1); PB.sfx(1100); const n=-((b.x-s.x)*b.vx+(b.y-s.y)*b.vy); b.vy=-Math.abs(b.vy)*.7-120;
        if(st.sets.every(x=>x.lit)){ pbScore(st,(M.royal?100000:50000)*st.mult,170,380,'#ffd84a',2); pbBanner(st,'COLLECTION!','#ffd84a'); st.flash='#ffd84a'; st.shake=8; try{ fx.confetti(160); }catch(e){} setTimeout(()=>st.sets.forEach(x=>x.lit=0),1200); } }
    for(const f of st.flips) if(f.tip) pbSeg(b,f.px,f.py,f.tip[0],f.tip[1],6,.3,f.vs);
    const sp=Math.hypot(b.vx,b.vy); if(sp>1600){ b.vx*=1600/sp; b.vy*=1600/sp; }
    if(b.y>PB_H+20){ b.out=1; } } }
function pbScore(st,v,x,y,col,size){ v=Math.round(v*(st.frenzyT>0?2:1)); st.score+=v; st.pops.push({txt:'+'+v.toLocaleString(),x,y,t:0,col,size:size||1}); }
function pbBanner(st,txt,col){ st.feed.push({txt,col,t:0}); if(st.feed.length>3) st.feed.shift(); }
function pbDrain(st){ const live=st.balls.filter(b=>!b.out); st.balls=live; if(live.length) { if(live.length===1&&st.mb){ st.mb=0; pbBanner(st,'MULTIBALL OVER','#bff6ff'); } return; }
  if(st.saveT>0){ pbBanner(st,'BALL SAVED!','#3ad08a'); pbBallInLane(st); st.saveT=0; return; }
  const B=st.bonus, bonus=(B.lanes*5000+B.targets*3000+B.bumps*100)*st.mult; st.phase='bonus'; st.bonusLeft=bonus; st.bonusShown=0; st.bonusT=0; }

/* ---------- Drawing ---------- */
function pbPal(st){ if(st.pal) return st.pal; const mk=Object.keys(PB_MACH).find(k=>PB_MACH[k]===st.M)||'classic', T=TTHEMES[curTheme()];
  const pal=st.M.pal||PB_MPAL[mk]||(T&&T.v?[T.v.t1,T.v.t3,T.v.r1,T.v.r2]:PB_PAL.lodge); st.pal=pal; st.art=st.M.art||mk; st.acc=pal[2]; return pal; }
const PB_BG={};
function pbBg(st,acc,acc2){ const dpr=Math.min(2,devicePixelRatio||1), key=st.M.name+'|'+curTheme()+'|'+dpr; if(PB_BG[key]) return PB_BG[key];
  const c=document.createElement('canvas'); c.width=PB_W*dpr; c.height=PB_H*dpr; const x=c.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); const pal=st.pal;
  const g=x.createLinearGradient(0,0,0,PB_H); g.addColorStop(0,pal[0]); g.addColorStop(1,pal[1]); x.fillStyle=g; x.fillRect(0,0,PB_W,PB_H);
  pbArt(x,st.art,0,acc,acc2); x.globalAlpha=.07; x.font='170px serif'; x.textAlign='center'; x.fillText(st.art==='classic'?TTHEMES[curTheme()].icon:st.M.icon,170,420); x.globalAlpha=1;
  x.shadowColor=acc; x.shadowBlur=10; x.strokeStyle=acc; x.lineWidth=4; x.lineCap='round'; for(const w of st.walls){ x.beginPath(); x.moveTo(w[0],w[1]); x.lineTo(w[2],w[3]); x.stroke(); }
  x.lineWidth=2; x.beginPath(); x.moveTo(st.gate[0],st.gate[1]); x.lineTo(st.gate[2],st.gate[3]); x.stroke(); x.shadowBlur=0;
  for(const [ax,ay,bx,by] of st.slings){ x.strokeStyle='#ffffff'; x.lineWidth=5; x.beginPath(); x.moveTo(ax,ay); x.lineTo(bx,by); x.stroke(); }
  const keys=Object.keys(PB_BG); if(keys.length>8) delete PB_BG[keys[0]]; return PB_BG[key]=c; }
function pbDraw(st,t){ const x=PB.ctx, pal=pbPal(st), acc=pal[2], acc2=pal[3]||'#ffffff'; x.save();
  if(st.shake>0){ x.translate((Math.random()-.5)*st.shake,(Math.random()-.5)*st.shake); st.shake*=.88; if(st.shake<.3) st.shake=0; }
  x.fillStyle=pal[1]; x.fillRect(-10,-10,PB_W+20,PB_H+20); x.drawImage(pbBg(st,acc,acc2),0,0,PB_W,PB_H);
  for(let i=0;i<14;i++){ const lx=30+(i*23)%300, ly=120+(i*61)%380; x.fillStyle=`rgba(255,255,255,${.08+.08*Math.sin(t*3+i)})`; x.fillRect(lx-2,ly-2,4,4); }
  for(const [ax,ay,d] of [[60,505,1],[280,505,-1]]){ x.fillStyle=`rgba(255,255,255,${.25+.25*Math.sin(t*6)})`; x.beginPath(); x.moveTo(ax,ay); x.lineTo(ax+10*d,ay+10); x.lineTo(ax,ay+20); x.fill(); }
  x.textAlign='center';
  st.lanes.forEach(l=>{ x.fillStyle=l.lit?'#ffd84a':'rgba(255,255,255,.15)'; x.shadowColor='#ffd84a'; x.shadowBlur=l.lit?14:0; x.beginPath(); x.arc(l.x,78,6,0,7); x.fill(); x.shadowBlur=0; });
  st.targets.forEach(tg=>{ x.fillStyle=tg.up?'#3affd0':'rgba(58,255,208,.15)'; x.save(); x.translate(tg.x,tg.y); x.rotate(.6); x.fillRect(-10,-4,20,8); x.restore(); });
  const sc=st.saucer; x.fillStyle='#000'; x.beginPath(); x.arc(sc.x,sc.y,sc.r+2,0,7); x.fill(); x.strokeStyle=st.mb?'#ff3ad0':'#bff6ff'; x.lineWidth=2; x.stroke();
  x.fillStyle='#bff6ff'; x.font='bold 9px sans-serif'; x.textAlign='center'; x.fillText(st.mb?'JACKPOT':'LOCK '+st.locks+'/'+st.M.locks,sc.x,sc.y+24);
  if(st.M.gate||st.M.td){ x.fillStyle=st.tdT>0?'#3ad08a':'rgba(58,208,138,.35)'; x.fillRect(150,118,40,4); x.font='bold 8px sans-serif'; x.fillText(st.M.gate||'TD',170,114); }
  for(const u of st.bumpers){ const h=u.hit>0; u.hit=Math.max(0,u.hit-1/60); const rg=x.createRadialGradient(u.x-5,u.y-5,2,u.x,u.y,u.r);
    rg.addColorStop(0,'#ffffff'); rg.addColorStop(.35,h?'#ffffff':acc); rg.addColorStop(1,h?acc:'#1a1006'); x.fillStyle=rg; x.shadowColor=acc; x.shadowBlur=h?30:12;
    x.beginPath(); x.arc(u.x,u.y,u.r+(h?3:0),0,7); x.fill(); x.shadowBlur=0; x.strokeStyle='#ffffff'; x.lineWidth=2; x.stroke(); }
  for(const s of st.sets){ s.hit=Math.max(0,s.hit-1/60); x.fillStyle=s.lit?'rgba(255,216,74,.9)':'rgba(255,255,255,.12)'; x.shadowColor='#ffd84a'; x.shadowBlur=s.lit?16:0;
    x.beginPath(); x.arc(s.x,s.y,12+(s.hit>0?3:0),0,7); x.fill(); x.shadowBlur=0; x.font='14px serif'; x.fillText(s.icon,s.x,s.y+5); }
  for(const f of st.flips){ const tip=f.tip||pbFlipTip(f,f.a); x.strokeStyle='#ffffff'; x.lineWidth=13; x.beginPath(); x.moveTo(f.px,f.py); x.lineTo(tip[0],tip[1]); x.stroke(); x.strokeStyle=acc; x.lineWidth=7; x.stroke(); }
  for(const b of st.balls){ if(b.out) continue; const rg=x.createRadialGradient(b.x-2,b.y-3,1,b.x,b.y,PB_R); rg.addColorStop(0,'#ffffff'); rg.addColorStop(.5,'#cfd9e0'); rg.addColorStop(1,'#5a646c'); x.fillStyle=rg; x.beginPath(); x.arc(b.x,b.y,PB_R,0,7); x.fill(); }
  // plunger
  const pw=PB.hold?Math.min(1,(performance.now()-PB.hold)/1000):0; x.fillStyle='#8a929e'; x.fillRect(330,606+pw*24,12,30); x.fillStyle=pw>.82&&pw<.93?'#3ad08a':'#e0203a'; x.fillRect(330,600-pw*60,12,pw*60);
  st.pops=st.pops.filter(p=>(p.t+=1/60)<1); for(const p of st.pops){ x.globalAlpha=1-p.t; x.fillStyle=p.col; x.font=`900 ${Math.round(13*p.size)}px sans-serif`; x.fillText(p.txt,p.x,p.y-p.t*40); } x.globalAlpha=1;
  if(st.flash){ x.fillStyle=st.flash; x.globalAlpha=.25; x.fillRect(0,0,PB_W,PB_H); x.globalAlpha=1; st.flashN=(st.flashN||0)+1; if(st.flashN>20){ st.flash=null; st.flashN=0; } }
  pbMarquee(x,st,t,acc,acc2);
  // HUD
  x.fillStyle='rgba(0,0,0,.55)'; x.fillRect(0,0,PB_W,44); x.fillStyle='#ffffff'; x.font='900 22px ui-monospace,monospace'; x.textAlign='left'; x.fillText(st.score.toLocaleString(),12,30);
  x.font='bold 11px sans-serif'; x.textAlign='right'; x.fillStyle='#ffd84a'; x.fillText('BALL '+Math.min(3,st.ballN)+'/3 · ×'+st.mult+(st.frenzyT>0?' · FRENZY':''),PB_W-12,18); x.fillStyle='#7be08a'; x.fillText('PAYS ×'+pbMult(st.score),PB_W-12,34);
  st.feed=st.feed.filter(f=>(f.t+=1/60)<2.2); st.feed.forEach((f,i)=>{ const k=Math.min(1,f.t*4), s=1+.3*(1-k); x.save(); x.translate(170,250+i*34); x.scale(s,s); x.globalAlpha=f.t>1.8?(2.2-f.t)/.4:1;
    x.font='900 24px sans-serif'; x.textAlign='center'; x.lineWidth=5; x.strokeStyle='#000'; x.strokeText(f.txt,0,0); x.fillStyle=f.col; x.shadowColor=f.col; x.shadowBlur=18; x.fillText(f.txt,0,0); x.restore(); });
  if(st.phase==='bonus'){ x.fillStyle='rgba(0,0,0,.6)'; x.fillRect(40,220,280,120); x.textAlign='center'; x.fillStyle='#ffd84a'; x.font='900 20px sans-serif'; x.fillText('END OF BALL BONUS',170,256); x.fillStyle='#fff'; x.font='900 30px ui-monospace,monospace'; x.fillText(Math.round(st.bonusShown).toLocaleString(),170,300); x.font='bold 12px sans-serif'; x.fillStyle='#7be08a'; x.fillText('× '+st.mult+' MULTIPLIER',170,326); }
  if(st.saveT>0&&st.phase==='play'){ x.fillStyle=`rgba(58,208,138,${.4+.4*Math.sin(t*8)})`; x.font='bold 10px sans-serif'; x.textAlign='center'; x.fillText('BALL SAVE',170,600); }
  x.restore(); }

/* ---------- The loop ---------- */
function pbTick(now){ const st=PB.st; if(!PB.cv||!document.body.contains(PB.cv)){ PB.raf=0; return; } const t=now/1000; pbBtnLabel();
  if(st&&st.phase==='play'){ const dt=Math.min(.033,(now-(PB.last||now))/1000); const n=8; for(let i=0;i<n;i++) pbStep(st,dt/n);
    st.saveT=Math.max(0,st.saveT-dt); st.comboT=Math.max(0,st.comboT-dt); st.frenzyT=Math.max(0,st.frenzyT-dt); st.tdT=Math.max(0,st.tdT-dt); if(st.balls.some(b=>b.out)) pbDrain(st); }
  if(st&&st.phase==='bonus'){ st.bonusT+=1/60; st.bonusShown=Math.min(st.bonusLeft,st.bonusShown+st.bonusLeft/50+1); if(Math.random()<.3) PB.sfx(400+st.bonusShown/st.bonusLeft*800);
    if(st.bonusT>1.6){ st.score+=st.bonusLeft; st.ballN++; st.bonus={lanes:0,targets:0,bumps:0}; st.mult=1; if(st.ballN>3) pbOver(st); else { st.phase='play'; pbBallInLane(st); } } }
  PB.last=now; if(st) pbDraw(st,t); else pbIdle(t); PB.raf=requestAnimationFrame(pbTick); }
function pbIdle(t){ const st=pbTable(pbMachine()); st.balls=[{x:170+Math.sin(t)*80,y:300+Math.cos(t*1.3)*120,vx:0,vy:0}]; st.bumpers.forEach((u,i)=>u.hit=Math.sin(t*3+i)>.7?.2:0); st.sets.forEach((s,i)=>s.lit=Math.sin(t*2+i)>0?1:0); pbDraw(st,t); }
PB.sfx=f=>{ try{ tone(f,.04,'square',.025); }catch(e){} };
function pbOver(st){ st.phase='over'; st.over=true; const P=pbMine(), pay=Math.round(PB.stake*pbMult(st.score)); if(pay) setBank(pay);
  P.best=P.best||{}; const k=P.m; const pb=st.score>(P.best[k]||0); if(pb) P.best[k]=st.score; S.pinball=P; save(); if(typeof gainXP==='function') gainXP(10+Math.floor(st.score/20000),'Pinball');
  if(pay>PB.stake){ try{ fx.confetti(140); fx.coins(60,1800); }catch(e){} }
  const box=document.querySelector('#pbOver'); if(box){ box.innerHTML=`<b>${pay>=PB.stake?'🎉':'🕹️'} ${st.score.toLocaleString()}</b><span>${pay?'×'+pbMult(st.score)+' · +'+fmt$(pay):'No payout'}${pb?' · ⭐ NEW BEST':''}</span><button class="pb-go" data-a="pbAgain">▶ PLAY AGAIN</button>`; box.classList.add('on'); } }

/* ---------- The screen ---------- */
function viewPinball(){ const P=pbMine(), M=pbMachine(), st=PB.st, playing=st&&!st.over;
  if(!PB.stake) PB.stake=Math.max(pbStakeMin(),Math.min(pbStakeMax(),Math.round(S.bank*.02/1000)*1000));
  return `<div class="pbx"><div class="pb-top"><button class="pb-mach" data-a="pbMachines">${M.icon} ${esc(M.name)} ▾</button><span class="pb-best">⭐ ${(P.best[P.m]||0).toLocaleString()}</span></div>
    <div class="pb-stage"><canvas id="pbCanvas" width="${PB_W}" height="${PB_H}"></canvas><div id="pbOver" class="pb-over"></div>
      ${playing?'':`<div class="pb-start"><div class="pb-ladder">${PB_LADDER.map(([s,m],i)=>`<span style="--d:${i*50}ms">${s>=1000?Math.round(s/1000)+'K':s} → ×${m}</span>`).join('')}</div>
        <div class="qb-chips">${QB_CHIPS.map(([v,c])=>`<button class="qb-chip" style="--c:${c}" data-a="pbChip" data-v="${v}">${k$(v)}</button>`).join('')}</div>
        <div class="qb-amt"><button data-a="pbClear">↺</button><b>${fmt$(PB.stake)}</b><button data-a="pbMaxB">MAX</button></div><button class="pb-go" data-a="pbPlay" ${PB.stake>S.bank||PB.stake<=0?'disabled':''}>🕹️ PLAY · 3 BALLS</button></div>`}</div>
    <div class="pb-ctrl"><button class="pb-launch pb-one" id="pbOne">LAUNCH</button></div></div>`; }
function pbMount(){ const cv=document.getElementById('pbCanvas'); if(!cv) return; PB.cv=cv; PB.ctx=cv.getContext('2d');
  const dpr=Math.min(2,devicePixelRatio||1); cv.width=PB_W*dpr; cv.height=PB_H*dpr; PB.ctx.setTransform(dpr,0,0,dpr,0,0);
  const set=(side,v)=>{ PB[side]=v; if(v) PB.sfx(side==='l'?300:320); };
  const press=e=>{ e.preventDefault(); if(pbWaiting()) PB.hold=performance.now(); else { PB.l=PB.r=1; PB.sfx(310); } };
  cv.addEventListener('pointerdown',press);
  if(!PB.upHook){ PB.upHook=1; addEventListener('pointerup',()=>{ PB.l=0; PB.r=0; if(PB.hold) pbFire(); }); addEventListener('pointercancel',()=>{ PB.l=0; PB.r=0; if(PB.hold) pbFire(); }); }
  const O=document.getElementById('pbOne'); if(O){ O.addEventListener('pointerdown',press); O.addEventListener('contextmenu',e=>e.preventDefault()); }
  if(!PB.raf) PB.raf=requestAnimationFrame(pbTick); }
// One button: if a ball is sitting in the launch lane it charges + launches, otherwise it flips both flippers.
function pbWaiting(){ const st=PB.st; return !!(st&&st.phase==='play'&&st.balls.some(x=>!x.out&&x.x>326&&x.y>540&&Math.hypot(x.vx,x.vy)<60)); }
function pbBtnLabel(){ const O=PB.oneEl&&document.body.contains(PB.oneEl)?PB.oneEl:(PB.oneEl=document.getElementById('pbOne')); if(!O) return; const w=pbWaiting()?1:0; if(O._w===w) return; O._w=w; O.textContent=w?'HOLD TO LAUNCH':'FLIP'; O.classList.toggle('flip',!w); }
function pbFire(){ const st=PB.st; if(!PB.hold) return; const pw=Math.min(1,(performance.now()-PB.hold)/1000); PB.hold=0; if(!st||st.phase!=='play') return;
  const b=st.balls.find(x=>!x.out&&x.x>326&&x.y>540&&Math.hypot(x.vx,x.vy)<60); if(!b) return; b.lane=1; b.vy=-(700+800*pw); PB.sfx(220);
  if(pw>.82&&pw<.93){ setTimeout(()=>{ if(!st.over){ pbScore(st,10000,170,90,'#3ad08a',1.4); pbBanner(st,'SKILL SHOT!','#3ad08a'); } },700); } }
addEventListener('keydown',e=>{ if(S.mode!=='casino'||S.ctab!=='pinball') return; if(e.key===' '&&!pbWaiting()&&!e.repeat){ PB.l=PB.r=1; e.preventDefault(); return; } if(e.key==='ArrowLeft'||e.key==='z') PB.l=1; if(e.key==='ArrowRight'||e.key==='/') PB.r=1; if(e.key===' '&&!PB.hold) PB.hold=performance.now(); });
addEventListener('keyup',e=>{ if(e.key==='ArrowLeft'||e.key==='z') PB.l=0; if(e.key==='ArrowRight'||e.key==='/') PB.r=0; if(e.key===' '){ if(PB.hold) pbFire(); else PB.l=PB.r=0; } });
const _renderPB=render; render=function(){ _renderPB(); if(S.mode==='casino'&&S.ctab==='pinball') pbMount(); };
Object.assign(ACT,{
  pbChip:el=>{ PB.stake=Math.min(pbStakeMax(),(PB.stake||0)+(+el.dataset.v)); render(); },
  pbClear:()=>{ PB.stake=Math.min(pbStakeMin(),pbStakeMax()); render(); }, pbMaxB:()=>{ PB.stake=pbStakeMax(); render(); },
  pbPlay:()=>{ if(PB.stake>S.bank||PB.stake<=0) return; if(typeof belowMin==='function'&&belowMin(PB.stake)) return; setBank(-PB.stake); save();
    PB.st=pbTable(pbMachine()); PB.st.phase='play'; pbBallInLane(PB.st); pbBanner(PB.st,'HOLD LAUNCH!','#ffffff'); render(); const el=document.querySelector('.pb-top'); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); },
  pbAgain:()=>{ PB.st=null; render(); },
  pbMachines:()=>pbPicker(),
  pbCat:el=>{ PB.cat=el.dataset.v; pbPicker(); },
  pbUse:el=>{ const P=pbMine(); if(!pbHas(el.dataset.v)) return; P.m=el.dataset.v; S.pinball=P; save(); closeModal(); PB.st=null; render(); },
  pbBuy:el=>{ const k=el.dataset.v, pr=pbPrice(k); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; } const P=pbMine(); setBank(-pr); S.spent=(S.spent||0)+pr; P.owned.push(k); P.m=k; S.pinball=P; save(); try{ fx.confetti(140); }catch(e){} closeModal(); PB.st=null; render(); toast(PB_MACH[k].icon+' '+PB_MACH[k].name+' installed!','gold'); },
});

// Each machine's own playfield art and a marquee across the top.
function pbArt(x,mk,t,acc,acc2){
  const R=(a,b)=>Math.abs(Math.sin(a*12.9898+b*78.233)*43758.5453)%1;
  if(mk==='space'){ for(let i=0;i<120;i++){ x.fillStyle=`rgba(255,255,255,${.3+.6*R(i,1)})`; x.fillRect(R(i,2)*PB_W,R(i,3)*PB_H,1.5,1.5); } x.fillStyle='rgba(255,255,255,.08)'; x.beginPath(); x.arc(250,170,40,0,7); x.fill(); x.strokeStyle=acc2; x.globalAlpha=.25; x.beginPath(); x.ellipse(250,170,62,12,-.3,0,7); x.stroke(); x.globalAlpha=1; return; }
  if(mk==='ocean'){ x.strokeStyle='rgba(255,255,255,.12)'; x.lineWidth=2; for(let y=160;y<560;y+=26){ x.beginPath(); for(let xx=14;xx<330;xx+=6) x.lineTo(xx,y+Math.sin(xx/18+y)*4); x.stroke(); } return; }
  if(mk==='jungle'){ for(let i=0;i<26;i++){ x.fillStyle=`rgba(${40+R(i,4)*40|0},${120+R(i,5)*80|0},60,.25)`; x.beginPath(); x.ellipse(R(i,6)*PB_W,140+R(i,7)*360,18,7,R(i,8)*3,0,7); x.fill(); } return; }
  if(mk==='candy'){ for(let i=-20;i<40;i++){ x.fillStyle=i%2?'rgba(255,255,255,.07)':'rgba(255,90,170,.08)'; x.beginPath(); x.moveTo(i*20,0); x.lineTo(i*20+14,0); x.lineTo(i*20+14-300,PB_H); x.lineTo(i*20-300,PB_H); x.fill(); } return; }
  if(mk==='volcano'){ const g=x.createRadialGradient(170,560,10,170,560,240); g.addColorStop(0,'rgba(255,120,30,.45)'); g.addColorStop(1,'rgba(255,60,0,0)'); x.fillStyle=g; x.fillRect(0,300,PB_W,340); x.strokeStyle='rgba(255,140,40,.25)'; for(let i=0;i<8;i++){ x.beginPath(); x.moveTo(40+i*40,600); x.lineTo(60+i*36,420+R(i,9)*60); x.stroke(); } return; }
  if(mk==='arctic'){ for(let i=0;i<70;i++){ x.fillStyle='rgba(255,255,255,.35)'; x.beginPath(); x.arc(R(i,10)*PB_W,R(i,11)*PB_H,1+R(i,12)*2,0,7); x.fill(); } x.fillStyle='rgba(220,240,255,.12)'; x.beginPath(); x.moveTo(14,560); x.lineTo(90,470); x.lineTo(170,540); x.lineTo(250,460); x.lineTo(326,560); x.fill(); return; }
  if(mk==='city'){ for(let i=0;i<16;i++){ const w=16+R(i,13)*14, h=60+R(i,14)*140, bx=14+i*20; x.fillStyle='rgba(0,0,0,.3)'; x.fillRect(bx,560-h,w,h); for(let k=0;k<6;k++){ x.fillStyle=R(i,k)>.5?'rgba(255,216,74,.4)':'rgba(255,255,255,.06)'; x.fillRect(bx+4,560-h+8+k*14,4,4); } } return; }
  if(mk==='retro'){ for(let yy=0;yy<PB_H;yy+=12) for(let xx=0;xx<PB_W;xx+=12) if(R(xx,yy)>.86){ x.fillStyle=`hsla(${R(yy,xx)*360},90%,60%,.18)`; x.fillRect(xx,yy,10,10); } return; }
  if(mk==='desert'){ x.fillStyle='rgba(255,200,90,.14)'; for(let k=0;k<3;k++){ x.beginPath(); x.moveTo(14,520-k*60); for(let xx=14;xx<=326;xx+=10) x.lineTo(xx,500-k*60+Math.sin(xx/40+k)*18); x.lineTo(326,640); x.lineTo(14,640); x.fill(); } x.fillStyle='rgba(255,230,140,.25)'; x.beginPath(); x.arc(250,160,30,0,7); x.fill(); return; }

  if(mk==='neon'){ x.strokeStyle='rgba(255,58,208,.18)'; x.lineWidth=1; for(let i=0;i<14;i++){ const y=300+i*i*2.2+((t*20)%10); x.beginPath(); x.moveTo(0,y); x.lineTo(PB_W,y); x.stroke(); }
    for(let i=-8;i<=8;i++){ x.beginPath(); x.moveTo(170+i*8,300); x.lineTo(170+i*60,PB_H); x.stroke(); }
    x.fillStyle='rgba(255,90,40,.25)'; x.beginPath(); x.arc(170,300,60,Math.PI,0); x.fill(); x.fillStyle='rgba(255,58,208,.10)'; for(let k=0;k<4;k++) x.fillRect(110,262+k*10,120,4); }
  else if(mk==='gridiron'){ x.strokeStyle='rgba(255,255,255,.22)'; x.lineWidth=2; for(let y=200;y<520;y+=40){ x.beginPath(); x.moveTo(20,y); x.lineTo(320,y); x.stroke(); }
    x.fillStyle='rgba(255,255,255,.18)'; x.font='bold 12px sans-serif'; x.textAlign='left'; [10,20,30,40,50,40,30,20].forEach((n,i)=>x.fillText(String(n),24,206+i*40));
    x.fillStyle='rgba(176,48,58,.35)'; x.fillRect(20,470,300,50); x.fillStyle='rgba(255,255,255,.35)'; x.font='900 22px sans-serif'; x.textAlign='center'; x.fillText('END ZONE',170,503);
    x.strokeStyle='#ffd84a'; x.lineWidth=3; x.beginPath(); x.moveTo(150,96); x.lineTo(150,130); x.moveTo(190,96); x.lineTo(190,130); x.moveTo(150,130); x.lineTo(190,130); x.moveTo(170,130); x.lineTo(170,150); x.stroke(); }
  else if(mk==='royale'){ for(let i=0;i<9;i++) for(let j=0;j<12;j++){ x.fillStyle=(i+j)%2?'rgba(255,216,74,.05)':'rgba(255,255,255,.02)'; x.fillRect(20+i*34,120+j*34,34,34); }
    x.globalAlpha=.16; x.font='22px serif'; x.textAlign='center'; for(let i=0;i<6;i++) x.fillText(i%2?'💎':'👑',50+i*50,470+Math.sin(t*2+i)*4); x.globalAlpha=1;
    x.strokeStyle='rgba(255,216,74,.4)'; x.lineWidth=2; x.strokeRect(24,124,292,330); }
}
function pbMarquee(x,st,t,acc,acc2){ const name=st.M.name.toUpperCase(); x.fillStyle='rgba(0,0,0,.6)'; x.fillRect(0,44,PB_W,24);
  for(let i=0;i<24;i++){ x.fillStyle=((i+Math.floor(t*8))%3===0)?acc:'rgba(255,255,255,.15)'; x.beginPath(); x.arc(8+i*15,48,2,0,7); x.fill(); x.beginPath(); x.arc(8+i*15,64,2,0,7); x.fill(); }
  x.font='900 13px sans-serif'; x.textAlign='center'; x.fillStyle=acc2; x.shadowColor=acc; x.shadowBlur=12; x.fillText(st.M.icon+'  '+name+'  '+st.M.icon,170,61); x.shadowBlur=0; }

function pbPicker(){ const P=pbMine(), cat=PB.cat||'mine', cats=[['mine','✅ Mine'],['shop','🛒 Shop'],['vip','🎟️ VIP'],['star','⭐ Stars']];
  const list=Object.entries(PB_MACH).filter(([k,M])=>cat==='mine'?pbHas(k):M.cat===cat).sort((a,b)=>(a[1].price||0)-(b[1].price||0));
  modal(`<div class="fgm-k">🕹️ Machines</div><div class="th-cats">${cats.map(([k,l])=>`<button class="${cat===k?'on':''}" data-a="pbCat" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="tchips"><span>${Object.keys(PB_MACH).filter(pbHas).length} / ${Object.keys(PB_MACH).length} unlocked</span><span>🎟️ ${esc(tierName(myTier()))}</span><span>⭐ ${myStars()}</span></div>
    <div class="pb-machs">${list.map(([k,M],i)=>{ const own=pbHas(k), pal=M.pal||PB_MPAL[k]||['#1f6a4a','#06180f','#ffd84a'];
      return `<button class="pb-m ${P.m===k?'on':''} ${own?'':'lock'}" style="--d:${Math.min(i,20)*25}ms;--p1:${pal[0]};--p2:${pal[2]}" data-a="${own?'pbUse':M.price?'pbBuy':'pbLockedM'}" data-v="${k}"><span>${M.icon}</span><b>${esc(M.name)}</b>
        <small>${pbBonuses(M).map(b=>`<i>${b}</i>`).join('')}</small><em>${own?(P.m===k?'PLAYING':'USE'):M.price?k$(pbPrice(k)):(M.tier?'🎟️ '+esc(tierName(M.tier)):'⭐×'+M.stars)}</em></button>`; }).join('')||'<div class="gd-empty">Nothing here yet</div>'}</div>`); }
ACT.pbLockedM=el=>{ const M=PB_MACH[el.dataset.v]; toast(M.tier?`🎟️ Reach the ${tierName(M.tier)} table`:`⭐ Prestige ${M.stars}× to unlock`,'gold'); };
