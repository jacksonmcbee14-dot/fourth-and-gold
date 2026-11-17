// 🏠 House score and the weekly Best Home vote (supabase/update-24-best-home.sql).
//  • Your house score counts every piece you've placed (pricier pieces score more; Gold/Diamond/Neon multiply it),
//    finished sets, limited and stolen pieces, the size of your home, and every room with 5+ pieces in it.
//  • Visitors can give your home one ❤️ a week. Most hearts at the end of the week (then the higher score) wins a
//    cash prize and a Best Home trophy. See the board from the Home panel or any visit.

const HOME_PTS=[0,100,250,500,900,1500,3000];
function houseScore(){
  const rooms=Object.assign({},S.lodge.rooms||{}); if(typeof curRoom==='function') rooms[curRoom()]=S.lodge.room||[];
  const seen=new Set(); let pieces=0, roomsFull=0, lim=0, stolen=0;
  for(const [r,list] of Object.entries(rooms)){ const arr=(Array.isArray(list)?list:[]).filter(p=>p&&ITEM[p.id]&&owns(p.id)); if(arr.length>=5) roomsFull++;
    for(const p of arr){ if(seen.has(p.id)) continue; seen.add(p.id); const it=ITEM[p.id], tier=typeof gearTier==='function'?gearTier(p.id):0;
      pieces+=Math.round((10+Math.round(Math.log10(Math.max(1000,it.price||1000))*8))*[1,1.5,2.25,3.5][tier]); if(it.limited) lim++; if(S.lodge.stolen&&S.lodge.stolen[p.id]) stolen++; } }
  const sets=typeof setsDone==='function'?setsDone().length:0, home=HOME_PTS[typeof homeTier==='function'?homeTier():0]||0;
  const parts=[['Furniture ('+seen.size+' pieces)',pieces],['Your home',home],['Finished sets ('+sets+')',sets*150],['Decorated rooms ('+roomsFull+')',roomsFull*100],['Limited pieces ('+lim+')',lim*50],['Stolen trophies ('+stolen+')',stolen*25]];
  return {total:parts.reduce((s,p)=>s+p[1],0),parts};
}
function scoreSync(){ const t=houseScore().total; if(S.lodge.score!==t){ S.lodge.score=t; save(); } }
setInterval(scoreSync,10e3); setTimeout(scoreSync,2000);

// Home panel: your score and the board.
const _homeOpenH=homeOpen;
homeOpen=function(){ _homeOpenH(); const body=LODGE.el&&LODGE.el.querySelector('.lg-home .lg-shop-body'); if(!body) return; const H=houseScore();
  const first=body.querySelector('.lg-home-h'); const wrap=document.createElement('div');
  wrap.innerHTML=`<div class="lg-home-h">HOUSE SCORE · ${H.total.toLocaleString()}</div><div class="lg-prev-desc">${H.parts.filter(p=>p[1]).map(([n,v])=>`${esc(n)} <b>+${v.toLocaleString()}</b>`).join(' · ')||'Place furniture to start scoring.'}<br>Gold, Diamond and Neon pieces score up to 3.5×.</div>
    <div class="lg-rooms"><button class="lg-btn lg-gold" data-lg="bestHome">🏆 Best Home this week</button></div>`;
  [...wrap.childNodes].forEach(n=>body.insertBefore(n,first)); };
Object.assign(LG_ACT,{ bestHome:()=>bestHomeBoard() });
ACT.bestHome=()=>bestHomeBoard();
async function bestHomeBoard(){
  modal(`<div class="fgm-k">🏆 Best Home this week</div><div class="bh-list"><p class="small muted">Loading…</p></div>`);
  let r=null; try{ r=await srpc('fg_room_board'); }catch(e){}
  const box=document.querySelector('#fgModal .bh-list'); if(!box) return;
  if(!r||r.error){ box.innerHTML='<p class="small muted">Couldn’t reach the server.</p>'; return; }
  box.innerHTML=`${r.last&&r.last.name?`<p class="small" style="margin:0 0 8px">👑 Last week: <b>${esc(r.last.name)}</b> with ${r.last.hearts} ❤️</p>`:''}
    ${(r.top||[]).map((x,i)=>`<button class="bh-row" data-a="visitLodge" data-v="${esc(x.name)}"><b>${i+1}</b><span>${esc(x.name)}</span><small>🏠 ${x.score.toLocaleString()}</small><em>${x.hearts} ❤️</em></button>`).join('')||'<p class="small muted">No homes scored yet.</p>'}
    <p class="small muted" style="margin:10px 0 0">Visit a home and tap ❤️ to vote (once a week per home). Most hearts on Sunday night wins ${k$(bestHomePrize())} and a trophy.</p>`;
}
const bestHomePrize=()=>nice(Math.max(5e6,worth()*.05));

// Visits: their score, hearts and the ❤️ button.
const _visitDrawH=visitDraw;
visitDraw=function(){ _visitDrawH(); const d=HV.data, at=document.querySelector('#fgModal .hv-stats'); if(!d||!at||d.house_score==null) return;
  at.insertAdjacentHTML('afterend',`<div class="hv-home"><span>🏠 House score <b>${(d.house_score||0).toLocaleString()}</b> · ${d.hearts||0} ❤️ this week</span>
    ${d.me?'':d.hearted?'<span class="small muted">You ❤️ this home</span>':'<button class="btn sm" data-a="homeHeart">❤️ Love this home</button>'}<button class="btn sm" data-a="bestHome">🏆</button></div>`); };
ACT.homeHeart=async el=>{ const d=HV.data; if(!d) return; el.disabled=true; let r=null; try{ r=await srpc('fg_room_vote',{p_name:d.name}); }catch(e){}
  if(!r||r.error){ toast(r&&r.error==='already'?'You already ❤️ this home this week':'Couldn’t reach the server','loss'); return; }
  d.hearted=true; d.hearts=r.hearts; tone(988,.08,'square',.04); try{ fx.burst(innerWidth/2,innerHeight/2,40,'#ff6a8a'); }catch(e){} visitDraw(); };

// Winning the week.
function homeWinInbox(it){ const prize=bestHomePrize(); setBank(prize); S.lodge.homeWins=(S.lodge.homeWins||0)+1; save();
  try{ fx.confetti(200); fx.coins(100,2400); }catch(e){} celebrate('🏆 Best Home of the week!',`Your home got the most hearts (${it.amount} ❤️).`,'+'+fmt$(prize)); }
