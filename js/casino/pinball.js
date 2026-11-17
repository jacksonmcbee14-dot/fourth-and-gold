// 🕹️ Pinball (casino tab). A real physics table: flippers, pop bumpers, slingshots, drop targets, top lanes, an
// orbit, a lock saucer for MULTIBALL, skill shots, ball save and an end-of-ball bonus count-up.
//  • Bet a stake, play 3 balls; your score pays out on a ladder (10K pays 0.5× … 800K pays 30×).
//  • Your completed sets light up as glowing targets on the playfield — hit them all for a COLLECTION super jackpot.
//  • The table is drawn in your chosen table theme (js/casino/themes.js), and you can buy new machines, each with
//    its own layout and feature: Neon Nights (4 bumpers + Neon Frenzy), Gridiron (Touchdown gate), Royale (2-lock
//    multiball, double set targets).
// Controls: tap the left/right half of the table (or the buttons) to flip; hold LAUNCH and let go to fire.

const PB_W=360, PB_H=640, PB_G=980, PB_R=7;
const PB_MACH={
  classic:{name:'Lodge Classic',icon:'🌲',price:0,bumpers:[[120,240],[220,240],[170,310]],locks:3},
  neon:{name:'Neon Nights',icon:'🌃',price:2e6,bumpers:[[110,230],[230,230],[170,300],[170,180]],locks:3,frenzy:1},
  gridiron:{name:'Gridiron',icon:'🏈',price:5e6,bumpers:[[118,250],[222,250],[170,320]],locks:3,td:1},
  royale:{name:'Royale',icon:'👑',price:2e7,bumpers:[[110,240],[230,240],[140,310],[200,310]],locks:2,royal:1},
};
const PB_PAL={lodge:['#1f6a4a','#06180f','#ffd84a'],golf:['#3aa860','#0c3a1e','#ffffff'],neon:['#4a1a7a','#10041e','#ff3ad0'],security:['#4a5664','#14181e','#7fd0ff'],pennants:['#1e3a7a','#08122a','#e0203a'],
  cabin:['#6a3a1a','#2a1408','#f3ead8'],holiday:['#a81a2a','#3a060c','#3ad08a'],arcade:['#0e5a6a','#041a20','#ff3ad0'],art:['#6a1a3a','#1e0610','#ffd84a'],crowns:['#4a1a8a','#14062a','#ffd84a'],watches:['#1a2a4a','#060c18','#cfd9e0']};
const PB_LADDER=[[10000,.5],[25000,1],[50000,2],[100000,4],[200000,8],[400000,15],[800000,30]];
const pbMult=sc=>{ let m=0; for(const [s,x] of PB_LADDER) if(sc>=s) m=x; return m; };
const PB={st:null,raf:0,cv:null,ctx:null,stake:0,launch:0,hold:0};
const pbMine=()=>Object.assign({owned:['classic'],m:'classic',best:{}},S.pinball||{});
const pbMachine=()=>{ const P=pbMine(); return PB_MACH[P.owned.includes(P.m)?P.m:'classic']; };
const pbPrice=k=>nice(PB_MACH[k].price*(typeof wealthX==='function'?Math.max(1,wealthX()/20):1));
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
function pbBallInLane(st){ st.balls.push({x:336,y:600,vx:0,vy:0,lane:1,lock:0}); st.saveT=8; }

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
        pbScore(st,st.frenzyT>0?500:100,u.x,u.y-24,PB_PAL[curTheme()][2],.8); PB.sfx(880+Math.random()*200);
        if(M.frenzy&&st.bonus.bumps%15===0&&st.frenzyT<=0){ st.frenzyT=15; pbBanner(st,'NEON FRENZY!','#ff3ad0'); } } }
    for(const t of st.targets) if(t.up&&Math.hypot(b.x-t.x,b.y-t.y)<PB_R+9){ t.up=0; const n=-(b.vx*.6+b.vy*.8); b.vx=-b.vx*.6; b.vy=Math.abs(b.vy)*.6+40; pbScore(st,750,t.x,t.y-14,'#3affd0',.8); PB.sfx(660);
        if(st.targets.every(x=>!x.up)){ st.bonus.targets++; pbScore(st,10000,170,200,'#3affd0',1.4); pbBanner(st,'TARGETS DOWN! ×'+(st.mult+1),'#3affd0'); st.mult=Math.min(6,st.mult+1); setTimeout(()=>st.targets.forEach(x=>x.up=1),1500); } }
    for(const l of st.lanes) if(!l.lit&&Math.abs(b.x-l.x)<12&&b.y<94&&b.y>58){ l.lit=1; pbScore(st,500,l.x,100,'#ffd84a',.7); PB.sfx(990);
        if(st.lanes.every(x=>x.lit)){ st.bonus.lanes++; st.mult=Math.min(6,st.mult+1); pbBanner(st,'LANES! BONUS ×'+st.mult,'#ffd84a'); setTimeout(()=>st.lanes.forEach(x=>x.lit=0),900); } }
    if(b.vy<-300&&b.x<34&&b.y>220&&b.y<260&&!b.orb){ b.orb=1; st.combo=st.comboT>0?st.combo+1:1; st.comboT=3; pbScore(st,2500*st.combo,40,230,'#ff8a3a',1); pbBanner(st,st.combo>1?'COMBO ×'+st.combo+'!':'ORBIT!','#ff8a3a'); PB.sfx(740); }
    if(b.y>300) b.orb=0;
    if(M.td&&st.tdT<=0&&Math.abs(b.x-170)<20&&b.y<140&&b.y>120&&b.vy<0){ st.tdT=8; pbScore(st,20000,170,130,'#3ad08a',1.5); pbBanner(st,'🏈 TOUCHDOWN!','#3ad08a'); try{ fx.confetti(60); }catch(e){} }
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
function pbDraw(st,t){ const x=PB.ctx, pal=PB_PAL[curTheme()]||PB_PAL.lodge, acc=pal[2]; x.save();
  if(st.shake>0){ x.translate((Math.random()-.5)*st.shake,(Math.random()-.5)*st.shake); st.shake*=.88; if(st.shake<.3) st.shake=0; }
  const g=x.createLinearGradient(0,0,0,PB_H); g.addColorStop(0,pal[0]); g.addColorStop(1,pal[1]); x.fillStyle=g; x.fillRect(-10,-10,PB_W+20,PB_H+20);
  x.globalAlpha=.07; x.font='170px serif'; x.textAlign='center'; x.fillText(TTHEMES[curTheme()].icon,170,420); x.globalAlpha=1;
  for(let i=0;i<14;i++){ const lx=30+(i*23)%300, ly=120+(i*61)%380; x.fillStyle=`rgba(255,255,255,${.08+.08*Math.sin(t*3+i)})`; x.beginPath(); x.arc(lx,ly,2,0,7); x.fill(); }
  // inlane arrows
  for(const [ax,ay,d] of [[60,505,1],[280,505,-1]]){ x.fillStyle=`rgba(255,255,255,${.25+.25*Math.sin(t*6)})`; x.beginPath(); x.moveTo(ax,ay); x.lineTo(ax+10*d,ay+10); x.lineTo(ax,ay+20); x.fill(); }
  x.shadowColor=acc; x.shadowBlur=10; x.strokeStyle=acc; x.lineWidth=4; x.lineCap='round';
  for(const w of st.walls){ x.beginPath(); x.moveTo(w[0],w[1]); x.lineTo(w[2],w[3]); x.stroke(); }
  x.lineWidth=2; x.beginPath(); x.moveTo(st.gate[0],st.gate[1]); x.lineTo(st.gate[2],st.gate[3]); x.stroke(); x.shadowBlur=0;
  for(const [ax,ay,bx,by] of st.slings){ x.strokeStyle='#ffffff'; x.lineWidth=5; x.beginPath(); x.moveTo(ax,ay); x.lineTo(bx,by); x.stroke(); }
  st.lanes.forEach(l=>{ x.fillStyle=l.lit?'#ffd84a':'rgba(255,255,255,.15)'; x.shadowColor='#ffd84a'; x.shadowBlur=l.lit?14:0; x.beginPath(); x.arc(l.x,78,6,0,7); x.fill(); x.shadowBlur=0; });
  st.targets.forEach(tg=>{ x.fillStyle=tg.up?'#3affd0':'rgba(58,255,208,.15)'; x.save(); x.translate(tg.x,tg.y); x.rotate(.6); x.fillRect(-10,-4,20,8); x.restore(); });
  const sc=st.saucer; x.fillStyle='#000'; x.beginPath(); x.arc(sc.x,sc.y,sc.r+2,0,7); x.fill(); x.strokeStyle=st.mb?'#ff3ad0':'#bff6ff'; x.lineWidth=2; x.stroke();
  x.fillStyle='#bff6ff'; x.font='bold 9px sans-serif'; x.textAlign='center'; x.fillText(st.mb?'JACKPOT':'LOCK '+st.locks+'/'+st.M.locks,sc.x,sc.y+24);
  if(st.M.td){ x.fillStyle=st.tdT>0?'#3ad08a':'rgba(58,208,138,.3)'; x.fillRect(150,118,40,4); x.font='bold 9px sans-serif'; x.fillText('TD',170,114); }
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
  // HUD
  x.fillStyle='rgba(0,0,0,.55)'; x.fillRect(0,0,PB_W,44); x.fillStyle='#ffffff'; x.font='900 22px ui-monospace,monospace'; x.textAlign='left'; x.fillText(st.score.toLocaleString(),12,30);
  x.font='bold 11px sans-serif'; x.textAlign='right'; x.fillStyle='#ffd84a'; x.fillText('BALL '+Math.min(3,st.ballN)+'/3 · ×'+st.mult+(st.frenzyT>0?' · FRENZY':''),PB_W-12,18); x.fillStyle='#7be08a'; x.fillText('PAYS ×'+pbMult(st.score),PB_W-12,34);
  st.feed=st.feed.filter(f=>(f.t+=1/60)<2.2); st.feed.forEach((f,i)=>{ const k=Math.min(1,f.t*4), s=1+.3*(1-k); x.save(); x.translate(170,250+i*34); x.scale(s,s); x.globalAlpha=f.t>1.8?(2.2-f.t)/.4:1;
    x.font='900 24px sans-serif'; x.textAlign='center'; x.lineWidth=5; x.strokeStyle='#000'; x.strokeText(f.txt,0,0); x.fillStyle=f.col; x.shadowColor=f.col; x.shadowBlur=18; x.fillText(f.txt,0,0); x.restore(); });
  if(st.phase==='bonus'){ x.fillStyle='rgba(0,0,0,.6)'; x.fillRect(40,220,280,120); x.textAlign='center'; x.fillStyle='#ffd84a'; x.font='900 20px sans-serif'; x.fillText('END OF BALL BONUS',170,256); x.fillStyle='#fff'; x.font='900 30px ui-monospace,monospace'; x.fillText(Math.round(st.bonusShown).toLocaleString(),170,300); x.font='bold 12px sans-serif'; x.fillStyle='#7be08a'; x.fillText('× '+st.mult+' MULTIPLIER',170,326); }
  if(st.saveT>0&&st.phase==='play'){ x.fillStyle=`rgba(58,208,138,${.4+.4*Math.sin(t*8)})`; x.font='bold 10px sans-serif'; x.textAlign='center'; x.fillText('BALL SAVE',170,600); }
  x.restore(); }

/* ---------- The loop ---------- */
function pbTick(now){ const st=PB.st; if(!PB.cv||!document.body.contains(PB.cv)){ PB.raf=0; return; } const t=now/1000;
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
    <div class="pb-ctrl"><button class="pb-flip" id="pbL">◀</button><button class="pb-launch" id="pbLaunch">LAUNCH</button><button class="pb-flip" id="pbR">▶</button></div></div>`; }
function pbMount(){ const cv=document.getElementById('pbCanvas'); if(!cv) return; PB.cv=cv; PB.ctx=cv.getContext('2d');
  const dpr=Math.min(2,devicePixelRatio||1); cv.width=PB_W*dpr; cv.height=PB_H*dpr; PB.ctx.setTransform(dpr,0,0,dpr,0,0);
  const set=(side,v)=>{ PB[side]=v; if(v) PB.sfx(side==='l'?300:320); };
  cv.addEventListener('pointerdown',e=>{ const r=cv.getBoundingClientRect(); set((e.clientX-r.left)<r.width/2?'l':'r',1); });
  if(!PB.upHook){ PB.upHook=1; addEventListener('pointerup',()=>{ PB.l=0; PB.r=0; }); }
  const hold=(id,side)=>{ const b=document.getElementById(id); if(!b) return; b.addEventListener('pointerdown',e=>{ e.preventDefault(); set(side,1); }); b.addEventListener('pointerup',()=>set(side,0)); b.addEventListener('pointerleave',()=>set(side,0)); };
  hold('pbL','l'); hold('pbR','r');
  const L=document.getElementById('pbLaunch'); if(L){ L.addEventListener('pointerdown',e=>{ e.preventDefault(); PB.hold=performance.now(); }); L.addEventListener('pointerup',pbFire); L.addEventListener('pointerleave',()=>{ if(PB.hold) pbFire(); }); }
  if(!PB.raf) PB.raf=requestAnimationFrame(pbTick); }
function pbFire(){ const st=PB.st; if(!PB.hold) return; const pw=Math.min(1,(performance.now()-PB.hold)/1000); PB.hold=0; if(!st||st.phase!=='play') return;
  const b=st.balls.find(x=>!x.out&&x.x>326&&x.y>540&&Math.hypot(x.vx,x.vy)<60); if(!b) return; b.lane=1; b.vy=-(700+800*pw); PB.sfx(220);
  if(pw>.82&&pw<.93){ setTimeout(()=>{ if(!st.over){ pbScore(st,10000,170,90,'#3ad08a',1.4); pbBanner(st,'SKILL SHOT!','#3ad08a'); } },700); } }
addEventListener('keydown',e=>{ if(S.mode!=='casino'||S.ctab!=='pinball') return; if(e.key==='ArrowLeft'||e.key==='z') PB.l=1; if(e.key==='ArrowRight'||e.key==='/') PB.r=1; if(e.key===' '&&!PB.hold) PB.hold=performance.now(); });
addEventListener('keyup',e=>{ if(e.key==='ArrowLeft'||e.key==='z') PB.l=0; if(e.key==='ArrowRight'||e.key==='/') PB.r=0; if(e.key===' ') pbFire(); });
const _renderPB=render; render=function(){ _renderPB(); if(S.mode==='casino'&&S.ctab==='pinball') pbMount(); };
Object.assign(ACT,{
  pbChip:el=>{ PB.stake=Math.min(pbStakeMax(),(PB.stake||0)+(+el.dataset.v)); render(); },
  pbClear:()=>{ PB.stake=Math.min(pbStakeMin(),pbStakeMax()); render(); }, pbMaxB:()=>{ PB.stake=pbStakeMax(); render(); },
  pbPlay:()=>{ if(PB.stake>S.bank||PB.stake<=0) return; if(typeof belowMin==='function'&&belowMin(PB.stake)) return; setBank(-PB.stake); save();
    PB.st=pbTable(pbMachine()); PB.st.phase='play'; pbBallInLane(PB.st); pbBanner(PB.st,'HOLD LAUNCH!','#ffffff'); render(); const el=document.querySelector('.pb-top'); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); },
  pbAgain:()=>{ PB.st=null; render(); },
  pbMachines:()=>{ const P=pbMine(); modal(`<div class="fgm-k">🕹️ Machines</div><div class="pb-machs">${Object.entries(PB_MACH).map(([k,M],i)=>{ const own=P.owned.includes(k);
      return `<button class="pb-m ${P.m===k?'on':''}" style="--d:${i*60}ms" data-a="${own?'pbUse':'pbBuy'}" data-v="${k}"><span>${M.icon}</span><b>${esc(M.name)}</b><small>${M.bumpers.length} bumpers${M.frenzy?' · Frenzy':''}${M.td?' · Touchdown':''}${M.royal?' · 2-lock multiball':''}</small><em>${own?(P.m===k?'PLAYING':'USE'):k$(pbPrice(k))}</em></button>`; }).join('')}</div>`); },
  pbUse:el=>{ const P=pbMine(); P.m=el.dataset.v; S.pinball=P; save(); closeModal(); PB.st=null; render(); },
  pbBuy:el=>{ const k=el.dataset.v, pr=pbPrice(k); if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; } const P=pbMine(); setBank(-pr); S.spent=(S.spent||0)+pr; P.owned.push(k); P.m=k; S.pinball=P; save(); try{ fx.confetti(140); }catch(e){} closeModal(); PB.st=null; render(); toast(PB_MACH[k].icon+' '+PB_MACH[k].name+' installed!','gold'); },
});
