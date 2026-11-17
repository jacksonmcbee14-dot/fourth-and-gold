// 🐾 Walkies: take your pet out to the park on the golf grounds (out the back of the lodge).
// Tap to walk — your pet trots behind on the leash. 60 seconds to collect bones (golden bones are worth 5) and
// chase squirrels (3 each). Other players and their pets wander the park with you, and the best walks of the day
// make the board (supabase/update-27-walks.sql). Every walk cheers your pet up and earns XP and a little cash.

const WK={el:null,c:null,ctx:null,loop:null,bg:null,g:null,park:null};
const WK_DUR=60;
function wkBg(){ if(WK.bg) return WK.bg; const c=document.createElement('canvas'); c.width=PW; c.height=PH; const x=c.getContext('2d');
  for(let y=0;y<PH;y+=8) rect(x,0,y,PW,8,(y/8)%2?'#4a9a42':'#52a64a');
  const path=[[0,300],[40,270],[70,230],[60,180],[100,150],[150,130],[170,90],[140,50],[96,20],[60,0]];
  for(let i=0;i<path.length-1;i++){ const [x1,y1]=path[i],[x2,y2]=path[i+1]; for(let k=0;k<=1;k+=.02){ const px=x1+(x2-x1)*k, py=y1+(y2-y1)*k; rect(x,px-7,py-7,14,14,'#d9c48a'); } }
  for(let yy=-16;yy<=16;yy++){ const w=Math.round(30*Math.sqrt(1-(yy/16.5)**2)); rect(x,40-w,90+yy,w*2,1,(yy&1)?'#3a90c8':'#3ab0d0'); }
  for(let yy=-12;yy<=12;yy++){ const w=Math.round(22*Math.sqrt(1-(yy/12.5)**2)); rect(x,150-w,210+yy,w*2,1,(yy+12)%3?'#72c86c':'#66bc62'); } rect(x,150,196,1,14,'#f3ead8'); rect(x,151,196,6,4,'#e0203a');
  for(const [tx,ty] of [[20,30],[170,20],[12,150],[178,160],[30,220],[120,280],[178,270],[100,90]]){ rect(x,tx-1,ty,3,8,'#6b3a1f'); for(let yy=-8;yy<=0;yy++){ const w=Math.round(8*Math.sqrt(1-((yy+4)/8.5)**2)); rect(x,tx-w,ty-4+yy,w*2,1,(yy&1)?'#2a6a2a':'#2e7a30'); } }
  rect(x,120,170,18,3,'#8a5a2a'); rect(x,121,173,2,4,'#6b3a1f'); rect(x,135,173,2,4,'#6b3a1f');
  return WK.bg=c; }
const wkOk=(x,y)=>x>6&&x<PW-6&&y>40&&y<PH-6&&!(((x-40)/30)**2+((y-90)/16)**2<1);
function wkDom(){ if(WK.el) return;
  const el=document.createElement('div'); el.id='walks'; el.className='golf';
  el.innerHTML=`<div class="gf-col"><div class="gf-top"><button class="lg-btn lg-round" data-wk="quit" aria-label="Leave the park">X</button><span class="gf-hole wk-title">🐾 THE PARK</span><span class="gf-tot wk-score">0</span></div>
    <div class="gf-stage"><div class="gf-card wk-card"></div></div><div class="gf-bot"><div class="wk-bar"></div></div></div>`;
  document.body.appendChild(el); WK.el=el; const {c,ctx}=makeCanvas(el.querySelector('.gf-stage')); WK.c=c; WK.ctx=ctx; WK.loop=makeLoop(wkDraw);
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-wk]'); if(!b||b.disabled) return; e.stopPropagation(); WK_ACT[b.dataset.wk]&&WK_ACT[b.dataset.wk](b); });
  c.addEventListener('pointerdown',e=>{ const G=WK.g; if(!G||G.phase!=='play') return; const r=c.getBoundingClientRect(), px=(e.clientX-r.left)/r.width*PW, py=(e.clientY-r.top)/r.height*PH; G.me.tx=Math.max(8,Math.min(PW-8,px)); G.me.ty=Math.max(44,Math.min(PH-8,py)); tone(700,.02,'square',.02); });
}
function wkCard(h){ const c=WK.el.querySelector('.wk-card'); if(h==null){ c.classList.remove('on'); return; } c.innerHTML=`<div class="gf-card-in">${h}</div>`; c.classList.add('on'); }
function wkBones(G,n){ for(let i=0;i<n;i++){ let x,y,k=0; do{ x=10+Math.random()*(PW-20); y=48+Math.random()*(PH-60); }while(!wkOk(x,y)&&++k<30); G.bones.push({x,y,gold:Math.random()<.1,b:Math.random()*6}); } }
function wkMenu(){ WK.g={phase:'menu'}; const P=S.pet, top=(WK.park&&WK.park.top)||[];
  wkCard(`<div class="gf-k">🐾 WALKIES · ${esc((P&&P.name||'').toUpperCase())}</div>
    <div class="tchips"><span>🦴 = 1</span><span>✨🦴 = 5</span><span>🐿️ = 3</span><span>⏱️ 60s</span></div>
    <button class="lg-btn lg-gold" data-wk="go">🐕 GO FOR A WALK</button>
    <div class="gf-k">🏆 TODAY’S BEST WALKS</div><div class="pk-field">${top.map((t,i)=>`<div class="${t.me?'me':''}"><b>${i+1}.</b> ${esc(t.name)} <small>${esc(t.pet&&t.pet.name||'')}</small><span>${t.score}</span></div>`).join('')||'<div><small>No walks yet today — be first!</small></div>'}</div>`);
  WK.el.querySelector('.wk-bar').innerHTML=''; }
function wkLoad(){ if(!(typeof socOn==='function'&&socOn())) return Promise.resolve(); return srpc('fg_walk_park').then(r=>{ if(r&&!r.error) WK.park=r; }).catch(()=>{}); }
function wkStart(){ const others=((WK.park&&WK.park.walkers)||[]).filter(w=>w.pet&&w.pet.species).slice(0,5).map(w=>({name:w.name,pet:w.pet,look:typeof lookFor==='function'?lookFor(w.outfit):null,x:30+Math.random()*130,y:60+Math.random()*220,tx:96,ty:160,face:1,px:0,py:0,wait:0}));
  WK.g={phase:'play',t:0,score:0,me:{x:30,y:280,tx:30,ty:280,face:1},pet:{x:20,y:286},bones:[],sq:null,sqT:6,pops:[],others,bark:0}; wkBones(WK.g,9); wkCard(null); }
function wkEnd(){ const G=WK.g; G.phase='end'; const P=S.pet, cash=G.score*nice(Math.max(500,worth()*.0002));
  if(P){ petTick(); P.happy=Math.min(100,P.happy+15+Math.min(20,G.score)); P.skills=P.skills||{}; P.skills.agility=(P.skills.agility||0)+G.score*2; }
  if(cash) setBank(cash); if(typeof gainXP==='function') gainXP(10+G.score,'Walkies'); save();
  wkCard(`<div class="gf-k">WALK OVER!</div><div class="gf-big">${G.score} <small>🦴</small></div><div class="tchips"><span>😊 +${15+Math.min(20,G.score)}</span><span>🏃 +${G.score*2} agility</span><span>💰 +${k$(cash)}</span></div><div class="gf-k wk-rank">…</div>
    <div class="gf-row"><button class="lg-btn lg-gold" data-wk="go">AGAIN</button><button class="lg-btn" data-wk="menu">BOARD</button></div>`);
  if(typeof socOn==='function'&&socOn()) srpc('fg_walk_submit',{p_score:G.score}).then(r=>{ const el=WK.el.querySelector('.wk-rank'); if(el&&r&&r.rank) el.textContent='#'+r.rank+' TODAY'; return wkLoad(); }).catch(()=>{}); }
function wkDraw(t,dt){ const x=WK.ctx, G=WK.g; x.drawImage(wkBg(),0,0); if(!G||G.phase==='menu'){ return; } const P=S.pet;
  if(G.phase==='play'){ G.t+=dt; if(G.t>=WK_DUR){ wkEnd(); } }
  const me=G.me, dx=me.tx-me.x, dy=me.ty-me.y, d=Math.hypot(dx,dy), mv=d>1;
  if(G.phase==='play'&&mv){ const st=Math.min(d,48*dt); me.x+=dx/d*st; me.y+=dy/d*st; if(Math.abs(dx)>.5) me.face=dx<0?-1:1; }
  const lead=[me.x+me.face*10,me.y+4], pv=G.pet; pv.x+=(lead[0]-pv.x)*Math.min(1,dt*6); pv.y+=(lead[1]-pv.y)*Math.min(1,dt*6);
  // bones
  for(const b of G.bones){ const bob=Math.sin(t*3+b.b); rect(x,b.x-3,b.y-1+bob,7,2,b.gold?'#ffd84a':'#f3ead8'); rect(x,b.x-4,b.y-2+bob,2,4,b.gold?'#ffd84a':'#f3ead8'); rect(x,b.x+3,b.y-2+bob,2,4,b.gold?'#ffd84a':'#f3ead8'); if(b.gold&&Math.sin(t*6+b.b)>.6) rect(x,b.x,b.y-5,1,1,'#ffffff'); }
  if(G.phase==='play') G.bones=G.bones.filter(b=>{ if(Math.hypot(b.x-pv.x,b.y-(pv.y-3))<8){ G.score+=b.gold?5:1; G.pops.push({x:b.x,y:b.y,t:0,s:b.gold?'+5':'+1'}); tone(b.gold?1319:880,.05,'square',.04); setTimeout(()=>WK.g===G&&wkBones(G,1),400); return false; } return true; });
  // a squirrel now and then
  G.sqT-=dt; if(!G.sq&&G.sqT<=0&&G.phase==='play'){ const left=Math.random()<.5; G.sq={x:left?-6:PW+6,y:60+Math.random()*220,v:left?38:-38}; }
  if(G.sq){ const s=G.sq; s.x+=s.v*dt; s.y+=Math.sin(t*8)*.4; rect(x,s.x-3,s.y-3,6,4,'#9a5a2a'); rect(x,s.x+(s.v>0?-5:3),s.y-6,3,5,'#b06a3a'); rect(x,s.x+(s.v>0?2:-3),s.y-4,1,1,'#16161c');
    if(Math.hypot(s.x-pv.x,s.y-pv.y)<10&&G.phase==='play'){ G.score+=3; G.pops.push({x:s.x,y:s.y,t:0,s:'+3'}); G.bark=1; tone(500,.06,'square',.05); tone(700,.06,'square',.05,.08); G.sq=null; G.sqT=5+Math.random()*5; }
    else if(s.x<-10||s.x>PW+10){ G.sq=null; G.sqT=4+Math.random()*5; } }
  // other players wander with their pets
  for(const o of G.others){ const ddx=o.tx-o.x, ddy=o.ty-o.y, dd=Math.hypot(ddx,ddy); if(dd<2){ o.wait-=dt; if(o.wait<=0){ let k=0; do{ o.tx=12+Math.random()*(PW-24); o.ty=50+Math.random()*(PH-60); }while(!wkOk(o.tx,o.ty)&&++k<20); o.wait=1+Math.random()*3; } }
    else { const st=Math.min(dd,26*dt); o.x+=ddx/dd*st; o.y+=ddy/dd*st; if(Math.abs(ddx)>.5) o.face=ddx<0?-1:1; }
    o.px+=(o.x+o.face*10-o.px)*Math.min(1,dt*5); o.py+=(o.y+4-o.py)*Math.min(1,dt*5); }
  const people=G.others.map(o=>({y:o.y,f:()=>{ rect(x,o.x,o.y-12,o.px-o.x,1,'rgba(40,20,10,.5)'); drawPet(x,o.pet,o.px,o.py,o.face,t,dd2(o)?((t*8|0)%2):0,1); x.save(); x.translate(Math.round(o.x-6),Math.round(o.y-PERSON_H)); if(o.face<0){ x.translate(12,0); x.scale(-1,1); } x.drawImage(personSprite('player',dd2(o)?'walk'+((t*8|0)%4):'idle0',o.look),0,0); x.restore(); const n=o.name.slice(0,10).toUpperCase(); ptext(x,n,o.x-ptextW(n)/2,o.y-PERSON_H-7,'#ffffff'); }}));
  people.push({y:me.y,f:()=>{ rect(x,Math.min(me.x,pv.x),me.y-12,Math.abs(pv.x-me.x)||1,1,'#e0203a'); if(P) drawPet(x,P,pv.x,pv.y,pv.x>me.x?1:-1,t,mv?((t*10|0)%2):0,1); x.save(); x.translate(Math.round(me.x-6),Math.round(me.y-PERSON_H)); if(me.face<0){ x.translate(12,0); x.scale(-1,1); } x.drawImage(personSprite('player',mv?'walk'+((t*10|0)%4):'idle0',typeof lodgeLook==='function'?lodgeLook():null),0,0); x.restore(); }});
  people.sort((a,b)=>a.y-b.y).forEach(p=>p.f());
  if(G.bark){ G.bark+=dt; const w=ptextW(bark(P||{species:'dog'}))+6; rect(x,pv.x-w/2,pv.y-22,w,10,'#ffffff'); ptext(x,bark(P||{species:'dog'}),pv.x-w/2+3,pv.y-20,'#16161c'); if(G.bark>1) G.bark=0; }
  G.pops=G.pops.filter(p=>(p.t+=dt)<.8); for(const p of G.pops) ptext(x,p.s,p.x-4,p.y-8-p.t*30,'#ffd84a');
  if(G.phase==='play'){ rect(x,0,0,PW,12,'rgba(5,9,15,.6)'); rect(x,2,4,(PW-4)*(1-G.t/WK_DUR),4,G.t>WK_DUR-10?'#e0203a':'#3ad08a'); ptext(x,Math.ceil(WK_DUR-G.t)+'S',PW-22,2,'#ffffff'); }
  WK.el.querySelector('.wk-score').textContent=G.score;
}
const dd2=o=>Math.hypot(o.tx-o.x,o.ty-o.y)>=2;
const WK_ACT={ quit:()=>closeWalks(), go:()=>wkStart(), menu:()=>wkMenu() };
function openWalks(){ if(!S.pet){ toast('Adopt a pet at the Kennel Club first','loss'); if(typeof openKennel==='function') openKennel(); return; }
  if(typeof closeModal==='function') closeModal(); wkDom(); WK.el.classList.add('on'); document.body.classList.add('in-golf');
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.stop(); wkMenu(); WK.loop.start(); wkLoad().then(()=>{ if(WK.g&&WK.g.phase==='menu') wkMenu(); }); }
function closeWalks(){ if(!WK.el) return; WK.loop.stop(); WK.el.classList.remove('on'); document.body.classList.remove('in-golf'); WK.g=null; save();
  if(typeof lodgeActive==='function'&&lodgeActive()&&LODGE.hub) LODGE.hub.loop.start(); else render(); }
Object.assign(ACT,{ walksOpen:()=>openWalks() });
