// Visit and rob friends' lodges (supabase/update-7-heists.sql), and the defence items that stop you.
//  • Tap 🏠 next to anyone in your league, or tap anyone on the leaderboard, to look around their room: character,
//    decor, table and defences. You can rob any player, 10 tries a day.
//  • Tap "Rob them" for the safe-cracking game: a row of dials, each with a spinning needle — stop it in the gold
//    zone. More dials, faster needles and smaller zones the higher their VIP table is above yours (cameras shrink
//    the zone, a laser grid adds a dial). Miss one and the alarm goes off.
//  • The server rolls their guard dog / bouncer / cameras / laser grid, and works out the take (5% of their net
//    worth, cut by a steel safe or vault door). Get caught and you pay them a fine. 3 tries a day.

/* ---------- Defence items (Silas's shop → Decor → Security) ---------- */
(()=>{
const R=rect;
const DEF=[
  ['guard_dog','Guard dog',300000,3,'',16,14,'A big, loyal boy. 12% chance a thief gets caught.',(c,x,y)=>{ R(c,x+2,y+6,10,5,'#6b4a2a'); R(c,x+10,y+2,5,6,'#6b4a2a'); R(c,x+13,y+4,3,2,'#4a3220'); R(c,x+11,y+3,1,1,'#121216'); R(c,x+10,y+1,2,2,'#4a3220'); R(c,x+3,y+11,2,3,'#4a3220'); R(c,x+9,y+11,2,3,'#4a3220'); R(c,x,y+6,3,1,'#6b4a2a'); R(c,x+10,y+8,4,1,'#d0303a'); }],
  ['bouncer','Bouncer',800000,6,'',12,26,'Arms crossed. 20% chance a thief gets caught.',(c,x,y)=>{ R(c,x+3,y,6,6,'#c99872'); R(c,x+3,y,6,2,'#16161c'); R(c,x+4,y+3,4,1,'#121216'); R(c,x+1,y+6,10,11,'#16161c'); R(c,x+2,y+10,8,2,'#2a2a30'); R(c,x+5,y+6,2,6,'#f3ead8'); R(c,x+2,y+17,3,8,'#16161c'); R(c,x+7,y+17,3,8,'#16161c'); R(c,x+1,y+25,4,1,'#05070a'); R(c,x+7,y+25,4,1,'#05070a'); }],
  ['cameras','Security cameras',400000,4,'W',20,10,'10% catch chance, and the safe dials get tighter.',(c,x,y)=>{ for(const dx of [0,12]){ R(c,x+dx+3,y,2,3,'#5a5a64'); R(c,x+dx,y+3,8,4,'#cfd9e0'); R(c,x+dx+7,y+4,2,2,'#2a2a30'); } },
    (c,x,y,t)=>{ if(Math.sin(t*4)>0){ R(c,x+1,y+4,1,1,'#ff3a3a'); R(c,x+13,y+4,1,1,'#ff3a3a'); } }],
  ['laser_grid','Laser grid',1200000,8,'F',34,10,'Adds a dial to the safe, plus a 5% catch chance.',(c,x,y)=>{ R(c,x,y+8,34,2,'#2a2a30'); R(c,x,y,2,10,'#3a3a44'); R(c,x+32,y,2,10,'#3a3a44'); },
    (c,x,y,t)=>{ for(let i=0;i<4;i++){ if(Math.sin(t*3+i)>-.4) R(c,x+2,y+1+i*2,30,1,'rgba(255,40,60,.75)'); } }],
  ['steel_safe','Steel safe',600000,5,'',14,16,'Thieves get away with 30% less.',(c,x,y)=>{ R(c,x,y,14,16,'#4a4a52'); R(c,x+1,y+1,12,13,'#6a6a74'); for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++) if(xx*xx+yy*yy<=4) R(c,x+7+xx,y+7+yy,1,1,'#9fa4ac'); R(c,x+7,y+5,1,2,'#2a2a30'); R(c,x+11,y+5,1,4,LP.brass1); R(c,x+1,y+14,3,2,'#2a2a30'); R(c,x+10,y+14,3,2,'#2a2a30'); }],
  ['vault_door','Vault door',2000000,10,'W',28,28,'Thieves get away with half as much.',(c,x,y)=>{ R(c,x,y,28,28,'#3a3a44'); for(let yy=-12;yy<=12;yy++)for(let xx=-12;xx<=12;xx++){ const d=xx*xx+yy*yy; if(d<=144) R(c,x+14+xx,y+14+yy,1,1,d>110?'#8a929e':'#6a6a74'); } for(let a=0;a<6;a++){ const an=a/6*6.283; R(c,x+14+Math.cos(an)*7,y+14+Math.sin(an)*7,2,2,'#cfd9e0'); } R(c,x+12,y+12,4,4,LP.brass1); }],
];
for(const [id,name,price,lvl,place,w,h,desc,base,anim] of DEF){ const full='decor_'+id; if(ITEM[full]) continue;
  const it={id:full,cat:'decor',sub:'security',name,price,lvl,desc,w,h,defense:1}; if(place==='W') it.wall=1; if(place==='F') it.floor=1;
  let cv=null; DECOR_ART[full]=(c,x,y,t)=>{ if(!cv){ cv=document.createElement('canvas'); cv.width=w+8; cv.height=h+8; const g=cv.getContext('2d'); g.imageSmoothingEnabled=false; base(g,4,4); } c.drawImage(cv,x-4,y-4); if(anim) anim(c,x,y,t||0); };
  ITEMS.push(it); ITEM[full]=it; }
if(SHOP_SUBS.decor&&!SHOP_SUBS.decor.some(s=>s[0]==='security')) SHOP_SUBS.decor.push(['security','Security']);
})();

/* ---------- Characters as little pictures (leaderboard, visits) ---------- */
const AVATAR_CACHE={};
function avatarImg(outfit,crown){
  const key=JSON.stringify(outfit||{})+(crown?1:0);
  if(!AVATAR_CACHE[key]){ const c=document.createElement('canvas'); c.width=12; c.height=21; const x=c.getContext('2d'); x.drawImage(personSprite('player','idle0',typeof lookFor==='function'?lookFor(outfit):null),0,0); AVATAR_CACHE[key]=c.toDataURL(); }
  return `<span class="lbav">${crown?'<i>👑</i>':''}<img src="${AVATAR_CACHE[key]}" alt=""></span>`;
}

/* ---------- Visiting ---------- */
const HV={data:null,name:null};
function drawFriendRoom(cv,d){
  const x=cv.getContext('2d'); x.imageSmoothingEnabled=false; x.drawImage(drawRoomStatic(),0,0);
  rect(x,68,32,32,48,LP.night1);
  const room=(Array.isArray(d.room)?d.room:[]).filter(p=>ITEM[p.id]&&DECOR_ART[p.id]);
  room.sort((a,b)=>(ITEM[a.id].floor?0:1)-(ITEM[b.id].floor?0:1)||(ITEM[a.id].wall?0:1)-(ITEM[b.id].wall?0:1)||(a.y+ITEM[a.id].h)-(b.y+ITEM[b.id].h));
  for(const p of room) DECOR_ART[p.id](x,p.x,p.y,0);
  drawPerson(x,'player','idle0',typeof lookFor==='function'?lookFor(d.outfit):null,140,262,-1);
}
async function visitLodge(name){
  if(!socOn()){ ACT.pfShowSignup(); return; }
  HV.name=name; modal(`<div class="fgm-k">${esc(name)}’s lodge</div><div class="empty">Walking over…</div>`);
  let d=null; try{ d=await srpc('fg_lodge_view',{p_name:name}); }catch(e){}
  if(!d||d.error){ modal(`<div class="fgm-k">${esc(name)}’s lodge</div><p>${{no_player:'No player by that name.'}[d&&d.error]||(SOC.err==='setup'||!d?'Visits need the latest server update (supabase/update-7-heists.sql).':'Couldn’t get there. Check your connection.')}</p>`); return; }
  HV.data=d; visitDraw();
}
// Tabs for every room of their home except the vault room.
function visitRooms(d){ const H=typeof HOMES!=='undefined'&&HOMES[d.home||0]; return (H?H.rooms:['main']).filter(r=>r!=='vault'); }
function visitTabs(d){ const rs=visitRooms(d); if(rs.length<2) return ''; const cur=d.viewRoom||'main';
  return `<div class="hv-rooms">${rs.map(r=>`<button class="${r===cur?'on':''}" data-a="visitRoom" data-v="${r}">${esc((H=>(H&&H.names&&H.names[r])||ROOM_NAMES[r]||r)(HOMES[d.home||0]))}</button>`).join('')}</div>`; }
function visitDraw(){
  const d=HV.data, tier=typeof vipAt==='function'?vipAt(d.vipIdx||0):null, def=d.defense||{items:[]};
  const shield=d.shield_until&&new Date(d.shield_until)>new Date();
  const left=shield?Math.ceil((new Date(d.shield_until)-Date.now())/6e4):0;   // minutes
  modal(`<div class="hv">
    <div class="fgm-k">${esc(d.name)}’s lodge ${tier?tier.icon:''}</div>
    <canvas class="px hv-room" width="${PW}" height="${PH}"></canvas>${visitTabs(d)}
    <div class="hv-stats"><span>Worth <b class="mono">${k$(d.bank||0)}</b></span><span>${tier?esc(tier.name)+' table':''}</span><span>Lv ${levelOf(d.xp||0).L}</span></div>
    <div class="hv-def">${def.items.length?def.items.map(id=>`<span>${esc(ITEM[id]?ITEM[id].name:id)}</span>`).join(''):'<span class="none">No security. Wide open.</span>'}</div>
    ${d.me?'<p class="small muted">This is how your lodge looks to friends.</p>':`
    ${typeof robChoices==='function'?robChoices(d,shield,left):''}
    <p class="small muted" style="text-align:center;margin:8px 0 0">Crack the safe to take up to 5% of what they’re worth (never more than you’re worth). Get caught and you pay them 2% of yours.</p>`}
    ${(d.recent||[]).length?`<div class="hv-recent">${d.recent.map(r=>`<div>${r.result==='stole'?'💰':'🚨'} <b>${esc(r.thief)}</b> ${r.result==='stole'?'stole '+k$(r.amount):r.result==='caught'?'got caught':'set off the alarm'} <small class="muted">· ${ago(r.at)}</small></div>`).join('')}</div>`:''}
  </div>`);
  const cv=document.querySelector('#fgModal .hv-room'); if(cv) drawFriendRoom(cv,d);
}

/* ---------- The safe-cracking game ---------- */
const HG={};
function heistStart(entry){
  const d=HV.data; if(!d) return; HG.entry=entry||0;
  const gap=Math.max(0,(d.vipIdx||0)-(d.myVipIdx||0)), items=(d.defense||{}).items||[];
  // The way in changes the safe: the front door is harder with a bouncer; a window with a camera on it is
  // tighter and has an extra dial; an uncovered window is the easy way in.
  const covered=HG.entry>0&&HG.entry<=(d.cams||0), open=HG.entry>0&&!covered;
  const dials=Math.min(9,3+gap+(items.includes('decor_laser_grid')?1:0)+(covered?1:0)+(HG.entry===0&&items.includes('decor_bouncer')?1:0));
  const zone=Math.max(14,42-6*gap-(covered?10:0)+(open?6:0));   // degrees of the gold zone
  Object.assign(HG,{dials,zone,i:0,spd:200+60*gap,ang:0,last:0,raf:0,targets:Array.from({length:dials},()=>Math.random()*360),done:false,timeLeft:6+dials*3,start:performance.now()});
  modal(`<div class="hg"><div class="fgm-k">Crack ${esc(d.name)}’s safe</div>
    <p class="small muted" style="margin:-4px 0 10px">Tap <b>Crack</b> when the needle is in the gold. ${dials} dials${gap?` · their table is ${gap} above yours, so it’s harder`:''}${items.includes('decor_cameras')?' · cameras tighten the zone':''}${items.includes('decor_laser_grid')?' · laser grid adds a dial':''}.</p>
    <div class="hg-pips">${Array.from({length:dials},(_,i)=>`<i data-p="${i}"></i>`).join('')}</div>
    <svg class="hg-dial" viewBox="-60 -60 120 120"><circle r="52" class="rim"/><path class="zone"/><line class="needle" x1="0" y1="0" x2="0" y2="-46"/><circle r="6" class="hub"/></svg>
    <div class="hg-time"><b></b></div>
    <button class="btn gold wide hg-go" data-a="heistTap">Crack</button></div>`,'stay');
  heistZone(); HG.raf=requestAnimationFrame(heistTick);
}
function heistZone(){ const t=HG.targets[HG.i]*Math.PI/180, z=HG.zone*Math.PI/360, r=52;
  const p=(a)=>[Math.sin(a)*r,-Math.cos(a)*r], [x1,y1]=p(t-z), [x2,y2]=p(t+z);
  const el=document.querySelector('.hg-dial .zone'); if(el) el.setAttribute('d',`M0 0 L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`); }
function heistTick(now){
  if(HG.done) return; if(!HG.last) HG.last=now; const dt=(now-HG.last)/1000; HG.last=now;
  HG.ang=(HG.ang+HG.spd*dt)%360; const n=document.querySelector('.hg-dial .needle'); if(n) n.setAttribute('transform',`rotate(${HG.ang})`);
  const left=HG.timeLeft-(now-HG.start)/1000, bar=document.querySelector('.hg-time b'); if(bar) bar.style.width=Math.max(0,left/HG.timeLeft*100)+'%';
  if(left<=0){ heistEnd(false,'Out of time'); return; }
  HG.raf=requestAnimationFrame(heistTick);
}
function heistTapNow(){
  if(HG.done) return; const diff=Math.abs(((HG.ang-HG.targets[HG.i])%360+540)%360-180);
  if(diff<=HG.zone/2){ const pip=document.querySelector(`.hg-pips [data-p="${HG.i}"]`); if(pip) pip.className='ok'; tone(880+HG.i*90,.07,'square',.05);
    HG.i++; if(HG.i>=HG.dials){ heistEnd(true); return; } HG.spd*=1.12; heistZone(); }
  else heistEnd(false,'You missed — alarm!');
}
async function heistEnd(cracked,why){
  HG.done=true; cancelAnimationFrame(HG.raf);
  if(!cracked){ tone(220,.4,'sawtooth',.06); tone(180,.4,'sawtooth',.06,.25); }
  modal(`<div class="hg"><div class="fgm-k">${cracked?'Cracked it…':'🚨 '+esc(why)}</div><div class="empty">${cracked?'Sneaking out with the cash…':'Security is on the way…'}</div></div>`,'stay');
  let r=null; try{ r=await srpc('fg_heist2',{p_name:HV.data.name,p_cracked:cracked,p_entry:HG.entry||0}); }catch(e){ try{ r=await srpc('fg_heist',{p_name:HV.data.name,p_cracked:cracked}); }catch(e2){} }
  if(!r||r.error){ modal(`<div class="fgm-k">Heist called off</div><p>${{shielded:'They were just robbed — they’re shielded for an hour.',no_tries:'You’re out of tries for today.'}[r&&r.error]||'Couldn’t reach the server.'}</p>`); return; }
  HV.data.tries_left=r.tries_left;
  if(r.result==='stole'){ setBank(r.amount); try{ fx.coins(80,2200); fx.confetti(140); }catch(e){} [523,659,784,1047,1319].forEach((f,i)=>tone(f,.12,'square',.05,i*.08));
    modal(`<div class="cel"><div class="cel-emoji">💰</div><div class="cel-t">You robbed ${esc(HV.data.name)}!</div><div class="cel-big">+${fmt$(r.amount)}</div>
      <div class="fgm-row" style="flex-wrap:wrap">${typeof stealButton==='function'?stealButton():''}<button class="btn" data-a="heistShare">Share it</button><button class="btn" data-a="closeModal">Get out of here</button></div></div>`); }
  else { setBank(-Math.min(r.fine,Math.max(0,S.bank)));
    modal(`<div class="cel"><div class="cel-emoji">🚨</div><div class="cel-t">${r.result==='caught'?'Caught by their security!':'The alarm went off!'}</div><p>You paid ${esc(HV.data.name)} a fine.</p><div class="cel-big" style="color:var(--loss-hi)">−${fmt$(r.fine)}</div>
      <div class="fgm-row"><button class="btn" data-a="closeModal">Run</button></div></div>`); }
  SOC.at=0; socRefresh(true);
}
Object.assign(ACT,{
  visitLodge:el=>visitLodge(el.dataset.v),
  visitRoom:el=>{ const d=HV.data; if(!d||el.dataset.v==='vault') return; d.viewRoom=el.dataset.v; const cv=document.querySelector('#fgModal .hv-room'); if(cv) drawFriendRoom(cv,d);
    document.querySelectorAll('#fgModal .hv-rooms button').forEach(b=>b.classList.toggle('on',b===el)); tone(700,.03,'square',.02); },
  heistStart:el=>heistStart(el&&el.dataset&&el.dataset.v!=null?+el.dataset.v:0),
  heistTap:()=>heistTapNow(),
  heistShare:()=>shareCard({game:'league',title:'Robbed '+HV.data.name,amount:null,big:'💰 HEIST',sub:'Cracked the safe at '+HV.data.name+'’s lodge'}),
  heistRevenge:el=>visitLodge(el.dataset.v),
});

/* ---------- Inbox: getting robbed, and catching thieves (called from socInbox in js/league/social.js) ---------- */
function heistInbox(it){
  if(it.kind==='robbed'){ const amt=Math.min(it.amount,Math.max(0,S.bank)); S.bank=Math.round(S.bank-amt); save();
    modal(`<div class="cel"><div class="cel-emoji">🕵️</div><div class="cel-t">You got robbed!</div><p>${esc(it.label)} cracked your safe.</p><div class="cel-big" style="color:var(--loss-hi)">−${fmt$(amt)}</div>
      <p class="small muted">You’re shielded for 1 hour. Buy security from Silas (Decor → Security) so it doesn’t happen again.</p>
      <div class="fgm-row"><button class="btn gold" data-a="heistRevenge" data-v="${esc(it.label)}">Get revenge</button><button class="btn" data-a="closeModal">OK</button></div></div>`); }
  else { setBank(it.amount); toast(`🚨 You caught ${it.label} trying to rob you · +${fmt$(it.amount)}`,'win'); }
}

/* ---------- Save your table so friends' safes know how hard yours is ---------- */
setInterval(()=>{ if(typeof vipTier==='function'){ const i=vipTier().i; if(S.vipIdx!==i){ S.vipIdx=i; save(); } } },5000);
