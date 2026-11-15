// Reasons to bet on sports (supabase/update-8-sports.sql):
//  • Weekly league pick'em: free picks on this week's slate; best record wins the week (+2,000 XP).
//  • Tail a friend: bets you place are posted to your leagues with a Tail button that copies them.
//  • Daily odds boost: one game a day pays 25% more profit on its moneyline (40% with a TV in your room),
//    one boosted bet a day.
//  • Sportsbook-only rewards: win streaks unlock the Sharp title and gear you can't buy, and bets won on game
//    days (Thursday, Saturday, Sunday, Monday) count double toward your league's weekly winnings.

/* ---------- Sportsbook-only gear ---------- */
const SPORTS_ITEMS=[
  {id:'decor_foam_finger',cat:'decor',sub:'treasure',name:'Giant foam finger',desc:'Won with a 3-bet win streak.',w:12,h:22,need:'3 wins in a row'},
  {id:'coat_jersey_sharp',cat:'clothes',sub:'body',slot:'body',name:'Sharp’s gold jersey',desc:'Won with a 5-bet win streak.',colors:{c:'#ffd84a',C:'#16161c',b:'#16161c',w:'#16161c',p:'#16161c'},need:'5 wins in a row'},
  {id:'decor_stadium_lights',cat:'decor',sub:'wall',name:'Stadium lights',desc:'Won with an 8-bet win streak.',w:26,h:14,wall:1,need:'8 wins in a row'},
  {id:'decor_ticket_frame',cat:'decor',sub:'wall',name:'Framed winning ticket',desc:'Won with 25 winning bets.',w:16,h:18,wall:1,need:'25 winning bets'},
];
DECOR_ART.decor_foam_finger=(c,x,y)=>{ rect(c,x+3,y,4,10,'#2b6cb0'); rect(c,x+1,y+8,10,8,'#2b6cb0'); rect(c,x+3,y+2,2,1,'#ffffff'); ptext(c,'1',x+4,y+10,'#ffffff'); rect(c,x+4,y+16,4,6,LP.wal5); };
DECOR_ART.decor_stadium_lights=(c,x,y,t)=>{ rect(c,x+12,y+6,2,8,'#5a5a64'); rect(c,x,y,26,7,'#3a3a44'); for(let i=0;i<6;i++) rect(c,x+1+i*4,y+1,3,5,Math.sin((t||0)*2+i)>-.6?'#fff3b0':'#c8a45c'); };
DECOR_ART.decor_ticket_frame=(c,x,y)=>{ rect(c,x,y,16,18,LP.brass1); rect(c,x+2,y+2,12,14,'#f6f3ec'); rect(c,x+3,y+4,10,1,'#3a8a3a'); rect(c,x+3,y+7,8,1,'#9fa4ac'); rect(c,x+3,y+9,9,1,'#9fa4ac'); ptext(c,'W',x+6,y+11,'#3a8a3a'); };
for(const it of SPORTS_ITEMS){ Object.assign(it,{sports:1,price:0,lvl:1}); if(!ITEM[it.id]){ ITEMS.push(it); ITEM[it.id]=it; } }
const _shopListS=shopList; shopList=function(){ return _shopListS().filter(i=>!i.sports); };

/* ---------- Streaks, the Sharp title, game-day double ---------- */
const GAME_DAYS=[0,1,4,6];   // Sun, Mon, Thu, Sat
const _settleSp=settleBets;
settleBets=function(){
  const open=new Set(S.bets.filter(b=>b.st==='open').map(b=>b.id)); _settleSp();
  const done=S.bets.filter(b=>open.has(b.id)&&b.st!=='open'); if(!done.length) return;
  S.sb=Object.assign({streak:0,best:0,wins:0},S.sb||{});
  for(const b of done){
    if(b.st==='won'){ S.sb.streak++; S.sb.wins++; S.sb.best=Math.max(S.sb.best,S.sb.streak);
      if(GAME_DAYS.includes(new Date().getDay())){ S.ladj=(S.ladj||0)+(b.pay-b.stake); } }
    else if(b.st==='lost') S.sb.streak=0;
  }
  const grant=(id,why)=>{ if(!owns(id)&&grantPrize(id)) setTimeout(()=>celebrate('Sportsbook reward!',why,ITEM[id].name,id),1500); };
  if(S.sb.best>=3) grant('decor_foam_finger','3 winning bets in a row — you’re a Sharp now.');
  if(S.sb.best>=5) grant('coat_jersey_sharp','5 winning bets in a row.');
  if(S.sb.best>=8) grant('decor_stadium_lights','8 winning bets in a row.');
  if(S.sb.wins>=25) grant('decor_ticket_frame','25 winning bets.');
  save();
};
const sharp=()=>S.sb&&S.sb.best>=3;

/* ---------- Daily odds boost ---------- */
function boostGame(){
  const now=Date.now(), L=allGames().filter(g=>g.s==='pre'&&new Date(g.t)>now&&new Date(g.t)-now<4*864e5).sort((a,b)=>a.id<b.id?-1:1);
  if(!L.length) return null; const r=prng([...dayKey()].reduce((s,ch)=>s*31+ch.charCodeAt(0),7)); const g=L[Math.floor(r()*L.length)];
  const M=market(g), side=M.ph>=.5?'a':'h';   // boost the underdog
  const base=side==='a'?M.mlA:M.mlH, k=owns('decor_tv')?1.4:1.25, dec=1+(decOf(base)-1)*k;
  return {g,side,base,odds:amOf(dec),team:side==='a'?g.a:g.h};
}
const boostUsed=()=>S.boostDay===dayKey();
function boostCard(){
  const B=boostGame(); if(!B) return '';
  return `<div class="boost"><div class="boost-k">🚀 Today’s odds boost${owns('decor_tv')?' · TV bonus':''}</div>
    <div class="boost-b"><div><b>${esc(B.team.name)} to win</b><small>${esc(B.g.a.name)} @ ${esc(B.g.h.name)} · ${esc(when(B.g.t,B.g.tba))}</small></div>
    <div class="boost-o"><s class="mono">${oddsTxt(B.base)}</s><b class="mono">${oddsTxt(B.odds)}</b></div></div>
    <button class="btn ${boostUsed()?'':'gold'} wide" data-a="boostAdd" ${boostUsed()?'disabled':''}>${boostUsed()?'Used today — new boost tomorrow':'Add to bet slip'}</button></div>`;
}
const _viewBetsS=viewBets; viewBets=function(){ return sportsHead()+boostCard()+_viewBetsS(); };
const _viewTodayS=viewToday; viewToday=function(){ return sportsHead()+_viewTodayS(); };
function sportsHead(){ const sb=S.sb||{}; if(!sb.wins) return ''; return `<div class="sharp">${sharp()?'🎯 <b>Sharp</b> · ':''}Win streak <b>${sb.streak||0}</b> · best ${sb.best||0} · ${sb.wins} winning bets${GAME_DAYS.includes(new Date().getDay())?' · <span class="up">Game day: wins count double in your league</span>':''}</div>`; }
ACT.boostAdd=()=>{ if(boostUsed()) return; const B=boostGame(); if(!B) return; const k='B:'+B.g.id;
  S.slip=S.slip.filter(l=>!(l.gid===B.g.id&&l.m==='ml'));
  if(!S.slip.some(l=>l.k===k)) S.slip.push({k,gid:B.g.id,m:'ml',s:B.side,line:null,odds:B.odds,label:'🚀 '+B.team.name+' to win (boosted)',sub:B.g.a.name+' @ '+B.g.h.name,boost:true});
  save(); render(); openSlip(); };
// One boosted bet a day, and the boost only applies up to 5% of your net worth (at least $250K).
const _placeSp=ACT.placeSlip;
ACT.placeSlip=el=>{
  const legs=S.slip.map(l=>({...l})), n0=S.bets.length, c=slipCalc();
  if(legs.some(l=>l.boost)){ if(boostUsed()){ toast('You’ve used today’s boost','loss'); return; }
    const cap=Math.max(250000,Math.round(scoreNow()*.05)); if(c.stake>cap){ toast('Boosted bets are limited to '+k$(cap),'loss'); return; } }
  _placeSp(el);
  if(S.bets.length>n0){ if(legs.some(l=>l.boost)){ S.boostDay=dayKey(); save(); } postBet(c.risk,legs); }
};

/* ---------- Tail a friend ---------- */
function postBet(amount,legs){
  if(!socOn()||!socInLeague()) return;
  const data={legs:legs.slice(0,8).map(l=>({gid:l.gid||null,fid:l.fid||null,m:l.m||null,s:l.s||null,line:l.line==null?null:l.line,odds:l.odds,label:String(l.label||'').slice(0,60),sub:String(l.sub||'').slice(0,60)}))};
  srpc('fg_post_bet',{p_amount:Math.round(amount),p_data:data}).catch(()=>{});
}
ACT.tailBet=el=>{
  const l=SOC.me&&socLeague(), V=l&&LV.view[l.id], f=V&&V.feed.find(x=>x.id===+el.dataset.id); if(!f||!f.data) return;
  let added=0, gone=0;
  for(const g0 of f.data.legs||[]){
    if(g0.fid){ if(!S.slip.some(x=>x.k==='F:'+g0.fid)){ S.slip.push({k:'F:'+g0.fid,fid:g0.fid,odds:g0.odds,label:g0.label,sub:'Futures'}); added++; } continue; }
    const g=allGames().find(x=>x.id===g0.gid); if(!g||!betable(g)||g.s!=='pre'){ gone++; continue; }
    const k=g.id+':'+g0.m+':'+g0.s; if(S.slip.some(x=>x.k===k)) continue;
    ACT.pick({dataset:{g:g.id,m:g0.m,s:g0.s}}); added++;
  }
  if(!added){ toast(gone?'Those games already started':'Already on your slip','loss'); return; }
  S.mode='football'; save(); render(); openSlip(); toast(`Tailing ${f.name}${gone?` · ${gone} already started`:''}`,'gold');
};

/* ---------- Weekly league pick'em ---------- */
LV.pk=LV.pk||{}; LV.pkAt=LV.pkAt||{};
function slate(){
  const now=Date.now(), end=now+(()=>{ const s=weekLeft(); const d=+(s.match(/(\d+)d/)||[0,0])[1], h=+(s.match(/(\d+)h/)||[0,0])[1]; return (d*24+h+1)*36e5; })();
  let L=allGames().filter(g=>g.s==='pre'&&new Date(g.t)>now&&new Date(g.t)<end);
  if(!L.length) L=allGames().filter(g=>g.s==='pre'&&new Date(g.t)>now);
  return L.sort((a,b)=>new Date(a.t)-new Date(b.t)||(a.id<b.id?-1:1)).slice(0,10);
}
function loadPickem(id,force){
  if(!id||(!force&&LV.pkAt[id]&&Date.now()-LV.pkAt[id]<30e3)) return; LV.pkAt[id]=Date.now();
  srpc('fg_pickem',{p_league:id}).then(r=>{ if(r&&!r.error){ LV.pk[id]=r; settlePicks(r); if(S.mode==='league') render(); if(document.querySelector('#fgModal .pk')) pickemOpen(); } }).catch(()=>{});
}
function settlePicks(r){ const gs={}; allGames().forEach(g=>gs[g.id]=g); const ids=new Set(Object.keys(r.mine||{}).filter(k=>!r.mine[k].result).concat((r.others||[]).filter(o=>!o.result).map(o=>o.gid)));
  for(const id of ids){ const g=gs[id]; if(!g||g.s!=='final'||g.as==null) continue; srpc('fg_pick_settle',{p_gid:id,p_side:g.hs>g.as?'h':g.as>g.hs?'a':'push'}).catch(()=>{}); } }
function pickemCard(l){
  const P=LV.pk[l.id]; loadPickem(l.id);
  const me=P&&P.standings.find(x=>x.me), open=slate().filter(g=>!(P&&P.mine[g.id])).length;
  return `<button class="pkc" data-a="pickemOpen"><span>🏈</span><div><b>Weekly pick’em</b><small>${P?`You’re ${me?me.wins+'–'+me.losses:'0–0'} · ${open?open+' game'+(open>1?'s':'')+' left to pick':'all picked'}`:'Free picks on this week’s games'}${P&&P.last?` · last week: ${esc(P.last.name)}`:''}</small></div><i>${open?'Pick':'View'}</i></button>`;
}
const _viewLeagueS=viewLeague;
viewLeague=function(){ const h=_viewLeagueS(); const l=socOn()&&SOC.me&&socLeague(); if(!l) return h;
  const at=h.indexOf('<div class="sechead"><h2>This week</h2>'); return at<0?h:h.slice(0,at)+pickemCard(l)+h.slice(at); };
function pickemOpen(){
  const l=socLeague(); if(!l) return; const P=LV.pk[l.id]; loadPickem(l.id);
  const G=slate(), mine=P?P.mine:{}, others=P?P.others:[];
  const row=g=>{ const m=mine[g.id], started=g.s!=='pre'||new Date(g.t)<=Date.now();
    const btn=s=>{ const t=s==='a'?g.a:g.h, on=m&&m.side===s; return `<button class="${on?'on':''} ${m&&m.result&&on?m.result:''}" data-a="pickemPick" data-g="${g.id}" data-s="${s}" ${started?'disabled':''}>${esc(t.name)}</button>`; };
    const theirs=others.filter(o=>o.gid===g.id).map(o=>`${esc(o.name)}: ${esc(o.side==='a'?g.a.name:g.h.name)}`).join(' · ');
    return `<div class="pk-g"><small class="muted">${esc(g.lg.toUpperCase())} · ${esc(when(g.t,g.tba))}</small><div class="pk-b">${btn('a')}<span>@</span>${btn('h')}</div>${theirs?`<small class="muted">${theirs}</small>`:''}</div>`; };
  modal(`<div class="pk"><div class="fgm-k">🏈 Weekly pick’em</div><p class="small muted" style="margin:-4px 0 10px">Free. Pick the winners — picks lock at kickoff. Best record when the week ends (Monday) wins +2,000 XP.</p>
    ${P?`<div class="pk-st">${P.standings.map((s,i)=>`<div class="${s.me?'me':''}"><span>${i+1}</span><b>${esc(s.name)}</b><span class="mono">${s.wins}–${s.losses}</span></div>`).join('')}</div>`:''}
    ${G.length?G.map(row).join(''):'<div class="empty">No games on the board this week.</div>'}</div>`);
}
Object.assign(ACT,{
  pickemOpen:()=>pickemOpen(),
  pickemPick:async el=>{ const l=socLeague(), g=allGames().find(x=>x.id===el.dataset.g); if(!l||!g) return; const s=el.dataset.s;
    el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));
    const r=await srpc('fg_pick',{p_league:l.id,p_gid:g.id,p_side:s,p_label:(s==='a'?g.a.name:g.h.name),p_starts:new Date(g.t).toISOString()}).catch(()=>null);
    if(!r||!r.ok){ toast(r&&r.error==='locked'?'That game has started':'Couldn’t save your pick','loss'); }
    else { const P=LV.pk[l.id]; if(P){ P.mine[g.id]={side:s,result:null}; } tone(700,.05,'square',.03); } },
});
// Last week's pick'em champion gets 2,000 XP (handled from socInbox in js/league/social.js).
function pickemInbox(it){ gainXP(it.amount||2000,'Pick’em champion',false); celebrate('Pick’em champion!',`Best record last week in ${it.label}.`,'+'+(it.amount||2000).toLocaleString()+' XP'); }
