// The League screens: a third mode next to Football and Casino.
// Tabs: League (standings, feed, prize) · Challenge (play friends) · Golf · Invite.

Object.assign(IC,{
  golf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 21V3l9 4-9 4"/><ellipse cx="12" cy="21" rx="8" ry="1.6"/></svg>',
  gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="9" width="17" height="11.5" rx="1.5"/><path d="M2.5 9h19v-3h-19zM12 6v14.5M12 6c-2-4-6-3-5 0M12 6c2-4 6-3 5 0"/></svg>',
  vs:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4l9 9M4 4h4M4 4v4M20 4l-9 9M20 4h-4M20 4v4M6 15l3 3M15 18l3-3M5 19l2-2M19 19l-2-2"/></svg>',
});
const LTABS=[['league','League','rank'],['challenge','Challenge','vs'],['golf','Golf','golf'],['invite','Invite','gift']];
S.ltab=S.ltab||'league';
const LG_ICONS=['🏈','🏀','⛳','🎰','🃏','🎲','🦌','🔥','👑','💰','🦅','🐻','🐺','🦈','🚀','🍀'];
const TAUNTS=['🔥 I’m on fire','Come get some','That was lucky.','Rematch?','GG','Who’s next?','Too easy','Bank’s open 💰'];
const REACTS=['🔥','👏','😂','😱','💰'];
const LV={view:{},viewAt:{},loading:{},av:[]};

/* ---------- Render hook: the app's render() learns about the League mode ---------- */
const _renderL=render;
render=function(){
  if(S.mode!=='league'){ _renderL(); $('#mode').classList.remove('league'); socBadge(); return; }
  document.body.classList.add('calm');
  $('#bankVal').textContent=bank$(S.bank);
  const m=$('#mode'); m.classList.remove('casino'); m.classList.add('league');
  m.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v==='league'));
  $('#tabbar').style.gridTemplateColumns=`repeat(${LTABS.length},1fr)`;
  $('#tabbar').innerHTML=LTABS.map(([k,l,ic])=>`<button class="${k===S.ltab?'on':''}" data-a="tab" data-v="${k}">${IC[ic]}${l}${k==='challenge'&&SOC.todo?'<i class="tb-dot"></i>':''}</button>`).join('');
  LV.av=[];
  const html={league:viewLeague,challenge:viewChallenges,golf:viewGolf,invite:viewInvite}[S.ltab]();
  const key='league'+S.ltab, v=$('#view');
  v.innerHTML=`<div class="${key!==lastViewKey?'view':''}">${html}</div>`; lastViewKey=key;
  slipBar(); paintAvatars(); socBadge();
};
const _tabL=ACT.tab;
ACT.tab=el=>{ if(S.mode==='league'){ S.ltab=el.dataset.v; save(); scrollTo(0,0); render(); return; } _tabL(el); };

/* ---------- Little pieces ---------- */
// Load your leagues once (not on every draw), then draw again.
function needMe(){ if(SOC.busy||Date.now()-(SOC.triedAt||0)<4000) return; SOC.triedAt=Date.now(); socRefresh(true).then(()=>{ if(S.mode==='league') render(); }); }
function lookFor(o){ if(!o) return null; const col={},gear={};
  for(const s of ['body','scarf']){ const it=ITEM[o[s]]; if(it&&it.colors) Object.assign(col,it.colors); }
  if(o.scarf==='none') col.w=col.c||PEOPLE.player.c;
  for(const s of ['hat','glasses','watch','acc']) if(o[s]&&ITEM[o[s]]) gear[s]=o[s];
  if(Object.keys(gear).length) col._gear=gear; return Object.keys(col).length?col:null; }
function avatar(look){ LV.av.push(look); return `<span class="av" data-av="${LV.av.length-1}"></span>`; }
function paintAvatars(){ document.querySelectorAll('#view [data-av],#fgModal [data-av]').forEach(s=>{ if(s.firstChild) return; const look=LV.av[+s.dataset.av];
  const c=document.createElement('canvas'); c.width=12; c.height=21; c.className='px'; c.getContext('2d').drawImage(personSprite('player','idle0',look),0,0); s.appendChild(c); }); }
function prizeIcon(id,scale){ const it=ITEM[id]; if(!it) return ''; return `<span class="pz" data-pz="${id}" data-sc="${scale||2}"></span>`; }
function paintPrizes(root){ (root||document).querySelectorAll('[data-pz]').forEach(s=>{ if(s.firstChild) return; const it=ITEM[s.dataset.pz]; if(it) s.appendChild(iconCanvas(it,+s.dataset.sc||2)); }); }
const _paintAv=paintAvatars; paintAvatars=function(){ _paintAv(); paintPrizes(); };
function ago(t){ const s=(Date.now()-new Date(t))/1000; return s<60?'now':s<3600?Math.floor(s/60)+'m':s<86400?Math.floor(s/3600)+'h':Math.floor(s/86400)+'d'; }
function weekLeft(){
  const p={}; new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);
  const iso={Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:7}[p.weekday]||1, left=(8-iso)*86400-(+p.hour*3600+ +p.minute*60);
  const d=Math.floor(left/86400), h=Math.floor(left%86400/3600), m=Math.floor(left%3600/60); return d?`${d}d ${h}h`:h?`${h}h ${m}m`:`${m}m`;
}
const gameName=g=>({golf:'golf',roulette:'roulette',pick:'a pick’em',slots:'slots',blackjack:'blackjack',poker:'video poker',craps:'craps',sports:'the sportsbook',duel:'a casino duel'}[g]||g||'');
const signedK=n=>(n>=0?'+':'−')+k$(Math.abs(n));
function needProfile(what){
  if(!cloudOn()) return `<div class="lgx-hero"><div class="lgx-emoji">🏆</div><h2 class="serif">Leagues are offline</h2><p class="muted">This copy of the app isn’t connected to the profile server.</p></div>`;
  return `<div class="lgx-hero"><div class="lgx-emoji">🏆</div><h2 class="serif">Play your friends</h2>
    <ol class="lgx-steps"><li><b>Make a profile</b> — a name and a 4-digit PIN.</li><li><b>Start a league</b> or join one with a code.</li><li><b>Win the week.</b> Most winnings by Sunday night takes the prize.</li></ol>
    <button class="btn gold wide" data-a="pfShowSignup">Create a profile ${what?'· '+what:''}</button><button class="btn ghost wide" style="margin-top:8px" data-a="pfShowLogin">I already have one</button></div>`;
}
function dailyCard(){ if(!dailyReady()) return ''; const st=dailyState(); return `<button class="lgx-daily" data-a="dailyOpen"><span>🎁</span><div><b>Daily bonus ready</b><small>Day ${st.streak} · ${fmt$(DAILY[st.streak-1])}</small></div><i>Collect</i></button>`; }
ACT.dailyOpen=()=>dailyShow();

/* ---------- League tab ---------- */
function loadLeague(id,force){
  if(!id||LV.loading[id]) return; if(!force&&(LV.viewAt[id]||0)&&Date.now()-LV.viewAt[id]<(LV.view[id]?30e3:5e3)) return;
  LV.loading[id]=true;
  srpc('fg_league_view',{p_league:id}).then(r=>{ LV.loading[id]=false; LV.viewAt[id]=Date.now(); if(r&&!r.error){ LV.view[id]=r; } else if(r&&r.error==='not_member'){ socRefresh(true); } if(S.mode==='league') render(); }).catch(()=>{ LV.loading[id]=false; LV.viewAt[id]=Date.now(); });
}
function viewLeague(){
  if(!socOn()) return needProfile('· start a league');
  if(!SOC.me){ needMe(); return dailyCard()+`<div class="empty">${SOC.err==='setup'?'Leagues are almost ready — the server needs its league update (supabase/update-4-leagues.sql).':SOC.err?'Can’t reach the league server. Check your connection.':'Loading your leagues…'}</div>`; }
  const L=SOC.me.leagues||[];
  if(!L.length) return dailyCard()+`<div class="lgx-hero"><div class="lgx-emoji">🏆</div><h2 class="serif">Start a league</h2>
      <p class="muted">Name it, pick an icon and a prize you can’t buy anywhere else. Whoever wins the most each week takes the prize. Resets every Monday.</p>
      <button class="btn gold wide" data-a="lgCreate">Create a league</button><button class="btn wide" style="margin-top:8px" data-a="lgJoin">Join with a code</button></div>
      <div class="lgx-how"><div><b>💸</b><span>Every win in the casino and sportsbook counts</span></div><div><b>⚔️</b><span>Challenge friends to golf, roulette or a pick’em</span></div><div><b>🎁</b><span>Invite friends: your debt is wiped + $1M</span></div></div>`;
  const cur=socLeague(), V=LV.view[cur.id]; loadLeague(cur.id);
  const chips=`<div class="lgx-chips">${L.map(l=>`<button class="${l.id===cur.id?'on':''}" data-a="lgPick" data-v="${l.id}">${esc(l.icon)} ${esc(l.name)}</button>`).join('')}<button data-a="lgMore">＋</button></div>`;
  const prize=ITEM[cur.prize];
  let html=dailyCard()+chips+`<div class="lgx-card">
    <div class="lgx-top"><span class="lgx-icon">${esc(cur.icon)}</span><div><h2 class="serif">${esc(cur.name)}</h2><span class="small muted">${cur.members} member${cur.members===1?'':'s'} · code <b class="mono gold">${esc(cur.code)}</b></span></div></div>
    <div class="lgx-prize">${prizeIcon(cur.prize,3)}<div><span class="eyebrow">This week’s prize · #1 wins</span><b>${esc(prize?prize.name:'A league prize')}</b><small class="muted">Week ends in ${weekLeft()} · resets Monday</small></div></div>
    <div class="lgx-you"><span>You’re <b>#${cur.rank}</b></span><span class="${cur.profit>=0?'up':'down'} mono">${signedK(cur.profit)} this week</span></div>
  </div>
  <div class="row" style="gap:8px;margin:10px 0 4px"><button class="btn gold" style="flex:1" data-a="lgInvite">Invite friends</button><button class="btn" style="flex:1" data-a="chNew">Challenge</button></div>`;
  if(!V) return html+`<div class="empty">Loading standings…</div>`;
  const champ=V.champs&&V.champs[0];
  html+=`<div class="sechead"><h2>This week</h2><span class="aside">Winnings since Monday</span></div><div class="panel lgx-table">${V.members.map((p,i)=>`
    <div class="lgx-row ${p.me?'me':''}"><span class="no">${i+1}</span>${avatar(lookFor(p.outfit))}<div class="nm"><b>${esc(p.name)}</b>${typeof vipBadge==='function'?vipBadge(p.vip):''}${champ&&champ.name===p.name?' <span title="Last week’s champion">👑</span>':''}<small class="muted">Lv ${levelOf(p.xp).L}${p.titles?` · ${p.titles}× champ`:''}</small></div>
    <span class="pf ${p.profit>=0?'up':'down'} mono">${signedK(p.profit)}</span><button class="btn sm" data-a="visitLodge" data-v="${esc(p.name)}" aria-label="Visit ${esc(p.name)}’s lodge">🏠</button>${p.me?'':`<button class="btn sm" data-a="chNew" data-to="${esc(p.name)}">⚔️</button>`}</div>`).join('')}</div>`;
  html+=`<div class="sechead"><h2>League feed</h2><span class="aside">Tap to talk trash</span></div><div class="lgx-taunts">${TAUNTS.map((t,i)=>`<button data-a="lgTaunt" data-n="${i}">${esc(t)}</button>`).join('')}</div>
    <div class="lgx-feed">${(V.feed||[]).map(feedItem).join('')||'<div class="empty">Nothing yet. Win something.</div>'}</div>`;
  if(V.champs&&V.champs.length) html+=`<div class="sechead"><h2>Past champions</h2></div><div class="panel" style="padding:6px 12px">${V.champs.map(c=>`<div class="between lgx-champ"><span>👑 <b>${esc(c.name)}</b> <small class="muted">${esc(c.week.replace('-W',' · week '))}</small></span><span class="mono up">${signedK(c.profit)}</span></div>`).join('')}</div>`;
  html+=`<div class="row" style="gap:8px;margin-top:14px">${V.mine?'<button class="btn sm ghost" style="flex:1" data-a="lgEdit">Edit league</button>':''}<button class="btn sm ghost" style="flex:1" data-a="lgLeave">Leave league</button></div>
    <p class="foot">Weekly winnings = what you’ve won in the casino, sportsbook and challenges since Monday. Daily top-ups, bonuses, shop spending and resets don’t count.</p>`;
  return html;
}
function feedItem(f){
  const n=`<b>${esc(f.name)}</b>`, amt=f.amount!=null?`<b class="up">${k$(f.amount)}</b>`:'';
  const course=GOLF_COURSES[f.game]?courseName(f.game):SEASONS[f.game]?SEASONS[f.game].course:'the links';
  const txt={win:`🎰 ${n} won ${amt} on ${gameName(f.game)}`,share:`📣 ${n} hit ${amt} on ${gameName(f.game)}`,
    golf:`⛳ ${n} shot <b>${f.amount}</b> (${f.n===0?'even':f.n>0?'+'+f.n:f.n}) at ${esc(course)}`,
    taunt:`💬 ${n}: “${esc(TAUNTS[f.n]||'…')}”`,level:`⭐ ${n} reached level <b>${f.n}</b>`,join:`👋 ${n} joined the league`,
    champion:`👑 ${n} won ${esc((f.other||'').replace(/^.*-W/,'week '))} with ${amt}`,challenge:`⚔️ ${n} beat <b>${esc(f.other||'')}</b> at ${gameName(f.game)} and took ${amt}`,
    bet:`🎟️ ${n} bet <b>${k$(f.amount||0)}</b> on ${esc(((f.data&&f.data.legs)||[]).map(l=>l.label).join(' + ')||'a game')} <button class="btn sm gold tailb" data-a="tailBet" data-id="${f.id}">Tail</button>`,
    pickem:`🏈 ${n} won the weekly pick’em with <b>${f.n}</b> right`,
    heist:f.n===1?`💰 ${n} robbed <b>${esc(f.other||'')}</b> for ${amt}`:f.n===0?`🚨 ${n} got caught robbing <b>${esc(f.other||'')}</b> and paid ${k$(f.amount||0)}`:`🚨 ${n} set off <b>${esc(f.other||'')}</b>’s alarm and paid ${k$(f.amount||0)}`}[f.kind]||`${n}`;
  const R=f.reacts||{}, mine=f.mine||[];
  return `<div class="lgx-post"><div class="tx">${txt}<small class="muted"> · ${ago(f.created_at)}</small></div><div class="rx">${REACTS.map(e=>`<button class="${mine.includes(e)?'on':''}" data-a="lgReact" data-id="${f.id}" data-e="${e}">${e}${R[e]?`<i>${R[e]}</i>`:''}</button>`).join('')}</div></div>`;
}

/* ---------- Creating, joining, editing ---------- */
function leagueForm(edit){
  const L=edit||{}; LV.form={icon:L.icon||LG_ICONS[0],prize:L.prize||LEAGUE_PRIZES[0].id};
  return `<div class="fgm-k">${edit?'Edit your league':'Create a league'}</div>
    <label class="small muted">League name</label><input class="input" id="lgName" maxlength="24" value="${esc(L.name||'')}" placeholder="e.g. Sunday Sharks" autocomplete="off" style="font-size:16px;margin:6px 0 12px">
    <label class="small muted">Icon</label><div class="lgx-icons">${LG_ICONS.map(i=>`<button class="${i===LV.form.icon?'on':''}" data-a="lgIcon" data-v="${i}">${i}</button>`).join('')}</div>
    <label class="small muted">Weekly prize for #1 — only winners can get these</label><div class="lgx-prizes">${LEAGUE_PRIZES.map(p=>`<button class="${p.id===LV.form.prize?'on':''}" data-a="lgPrize" data-v="${p.id}">${prizeIcon(p.id,2)}<span>${esc(p.name)}</span></button>`).join('')}</div>
    <div class="small" id="lgMsg" style="min-height:18px;color:var(--loss-hi)"></div>
    <button class="btn gold wide" data-a="${edit?'lgSave':'lgMake'}">${edit?'Save':'Create league'}</button>`;
}
function openForm(edit){ modal(leagueForm(edit)); paintPrizes(document.getElementById('fgModal')); }
const lgMsg=t=>{ const m=$('#lgMsg'); if(m) m.textContent=t; };
const LG_ERR={bad_name:'Names need 2–24 characters.',too_many:'You can be in up to 10 leagues.',no_league:'No league with that code.',full:'That league is full (50 players).',not_owner:'Only the league’s creator can edit it.'};
Object.assign(ACT,{
  lgPick:el=>{ SOC.cur=el.dataset.v; render(); },
  lgMore:()=>modal(`<div class="fgm-k">Another league</div><button class="btn gold wide" data-a="lgCreate">Create a league</button><button class="btn wide" style="margin-top:8px" data-a="lgJoin">Join with a code</button>`),
  lgCreate:()=>{ if(!socOn()){ ACT.pfShowSignup(); return; } openForm(null); },
  lgEdit:()=>{ const V=LV.view[socLeague().id]; if(V) openForm(V); },
  lgIcon:el=>{ LV.form.icon=el.dataset.v; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el)); },
  lgPrize:el=>{ LV.form.prize=el.dataset.v; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el)); },
  lgMake:async el=>{ const name=($('#lgName').value||'').trim(); if(name.length<2) return lgMsg(LG_ERR.bad_name); el.disabled=true;
    try{ const r=await srpc('fg_league_create',{p_name:name,p_icon:LV.form.icon,p_prize:LV.form.prize}); if(!r.ok){ el.disabled=false; return lgMsg(LG_ERR[r.error]||'Something went wrong.'); }
      SOC.cur=r.id; await socRefresh(true); S.mode='league'; S.ltab='league'; save(); render();
      modal(`<div class="cel"><div class="cel-emoji">${esc(LV.form.icon)}</div><div class="cel-t">${esc(name)} is live!</div><p>Now get your friends in. They join with this code:</p><div class="cel-big mono">${esc(r.code)}</div>
        <button class="btn gold wide" data-a="lgInvite">Send the invite</button></div>`);
    }catch(e){ el.disabled=false; lgMsg('Couldn’t reach the server.'); } },
  lgSave:async el=>{ const name=($('#lgName').value||'').trim(), id=socLeague().id; el.disabled=true;
    try{ const r=await srpc('fg_league_edit',{p_league:id,p_name:name,p_icon:LV.form.icon,p_prize:LV.form.prize}); if(!r.ok){ el.disabled=false; return lgMsg(LG_ERR[r.error]||'Something went wrong.'); }
      closeModal(); await socRefresh(true); loadLeague(id,true); toast('League updated','gold'); }catch(e){ el.disabled=false; lgMsg('Couldn’t reach the server.'); } },
  lgJoin:()=>{ if(!socOn()){ ACT.pfShowSignup(); return; } modal(`<div class="fgm-k">Join a league</div><p class="small muted">Ask a friend for their league’s 5-letter code.</p><input class="input mono" id="lgCode" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="CODE" style="font-size:22px;text-align:center;letter-spacing:.2em;margin:8px 0"><div class="small" id="lgMsg" style="min-height:18px;color:var(--loss-hi)"></div><button class="btn gold wide" data-a="lgJoinGo">Join</button>`); },
  lgJoinGo:async el=>{ const code=($('#lgCode').value||'').trim(); if(!code) return; el.disabled=true;
    try{ const r=await srpc('fg_league_join',{p_code:code}); if(!r.ok){ el.disabled=false; return lgMsg(LG_ERR[r.error]||'Something went wrong.'); }
      SOC.cur=r.id; closeModal(); await socRefresh(true); S.mode='league'; S.ltab='league'; save(); render(); toast('Welcome to '+r.name+'!','gold'); }catch(e){ el.disabled=false; lgMsg('Couldn’t reach the server.'); } },
  lgLeave:async()=>{ const l=socLeague(); if(!l||!confirm('Leave '+l.name+'?'+(l.mine?' You made it — the next member becomes the owner.':''))) return;
    await srpc('fg_league_leave',{p_league:l.id}); SOC.cur=null; delete LV.view[l.id]; await socRefresh(true); render(); },
  lgInvite:()=>{ const l=socLeague(); closeModal(); shareLink(`Join my league${l?' “'+l.name+'”':''} on Fourth & Gold — casino, sportsbook and golf with friends. Code ${l?l.code:''}`,inviteUrl(l&&l.code)); },
  lgTaunt:async el=>{ const l=socLeague(); if(!l) return; el.disabled=true; socLastPost=0; socPost('taunt',null,null,+el.dataset.n); toast('Sent to your league','gold'); setTimeout(()=>{ loadLeague(l.id,true); },700); },
  lgReact:async el=>{ const id=+el.dataset.id, e=el.dataset.e, l=socLeague(), V=LV.view[l.id], f=V&&V.feed.find(x=>x.id===id); if(!f) return;
    const on=(f.mine||[]).includes(e); f.mine=on?f.mine.filter(x=>x!==e):(f.mine||[]).concat(e); f.reacts=Object.assign({},f.reacts); f.reacts[e]=(f.reacts[e]||0)+(on?-1:1); if(!f.reacts[e]) delete f.reacts[e];
    render(); srpc('fg_react',{p_feed:id,p_emoji:e}).catch(()=>{}); },
});

/* ---------- Challenge tab ---------- */
const CH_GAMES={golf:['⛳','Golf','Same course, same wind. Lowest score wins.'],pick:['🏈','Pick’em','Pick a real game. They get the other side.'],
  slots:['🎰','Slots duel','10 spins, 1,000 chips. Most chips wins.'],roulette:['🎡','Roulette duel','5 spins, 1,000 chips. Most chips wins.'],
  blackjack:['🃏','Blackjack duel','5 hands vs the dealer. Most chips wins.'],poker:['🂡','Video poker duel','5 hands of Jacks or Better.'],craps:['🎲','Craps duel','5 rounds at the dice table.']};
function viewChallenges(){
  if(!socOn()) return needProfile('· challenge friends');
  if(!SOC.me){ needMe(); return `<div class="empty">Loading…</div>`; }
  const C=SOC.me.challenges||[];
  const yourTurn=C.filter(c=>!c.mine&&(c.status==='open'||(c.status==='accepted'&&c.game!=='pick'&&c.to_score==null)));
  const waiting=C.filter(c=>c.mine&&c.status==='open');
  const live=C.filter(c=>c.status==='accepted'&&(c.game==='pick'||(c.mine&&c.to_score==null)));
  const done=C.filter(c=>!['open','accepted'].includes(c.status));
  const card=(c,btns)=>{ const g=CH_GAMES[c.game], other=c.mine?c.to_name:c.from_name;
    const detail=(c.game==='golf'&&c.data&&c.data.course?esc(courseName(c.data.course))+' · '+(c.data.holes||6)+' holes · ':'')+(c.game==='pick'?esc(c.data.title||'')+' · '+(c.mine?'you have ':'they have ')+esc(c.data.label||'')
      :c.from_score!=null&&!c.mine&&c.status!=='done'?`Score to beat: <b>${c.from_score}${c.game==='golf'?' strokes':' chips'}</b>`:c.from_score!=null?`${c.mine?'You':esc(c.from_name)}: ${c.from_score}${c.to_score!=null?` · ${c.mine?esc(c.to_name):'You'}: ${c.to_score}`:''}`:'');
    return `<div class="chx"><span class="chx-ic">${g[0]}</span><div class="chx-tx"><b>${g[1]} ${c.mine?'vs':'from'} ${esc(other)}</b><small class="muted">${detail}${c.stake?` · ${k$(c.stake)} each`:''}</small></div><div class="chx-b">${btns}</div></div>`; };
  const resTxt=c=>c.status==='done'?(c.result==='me'?`<span class="up">Won ${k$(c.stake*2)}</span>`:c.result==='them'?'<span class="down">Lost</span>':'Tie'):c.status==='declined'?'Declined':c.status==='cancelled'?'Cancelled':'Expired';
  return `<button class="btn gold wide" data-a="chNew" style="margin-bottom:6px">⚔️ New challenge</button>
    <div class="chx-menu">${Object.entries(CH_GAMES).map(([k,g])=>`<button data-a="chNew" data-game="${k}"><b>${g[0]}</b><span>${g[1]}</span></button>`).join('')}</div>
    ${yourTurn.length?`<div class="sechead"><h2>Your turn</h2></div><div class="panel chx-list">${yourTurn.map(c=>card(c,c.status==='open'?`<button class="btn sm gold" data-a="chAccept" data-id="${c.id}">${c.game==='pick'?'Accept':'Play'}</button><button class="btn sm ghost" data-a="chDecline" data-id="${c.id}">✕</button>`:`<button class="btn sm gold" data-a="chPlay" data-id="${c.id}">Play</button>`)).join('')}</div>`:''}
    ${live.length?`<div class="sechead"><h2>In play</h2></div><div class="panel chx-list">${live.map(c=>card(c,`<span class="small muted">${c.game==='pick'?'Waiting on the game':'They’re playing'}</span>`)).join('')}</div>`:''}
    ${waiting.length?`<div class="sechead"><h2>Waiting on them</h2></div><div class="panel chx-list">${waiting.map(c=>card(c,`<button class="btn sm ghost" data-a="chCancel" data-id="${c.id}">Cancel</button>`)).join('')}</div>`:''}
    ${done.length?`<div class="sechead"><h2>Results</h2></div><div class="panel chx-list">${done.map(c=>card(c,`<span class="small">${resTxt(c)}</span>${c.status==='done'&&c.result==='me'?`<button class="btn sm ghost" data-a="chShare" data-id="${c.id}">Share</button>`:''}`)).join('')}</div>`:''}
    ${!C.length?'<div class="empty">No challenges yet. Start one — your friends get a notice in their League tab.</div>':''}`;
}
// New challenge: game → friend → stake → play (golf/roulette) or pick a side (pick'em).
const CHN={};
function friendsList(){ const seen=new Set(), out=[]; for(const id in LV.view){ for(const p of LV.view[id].members||[]) if(!p.me&&!seen.has(p.name)){ seen.add(p.name); out.push(p); } } return out; }
function challengeStart(pre){
  if(!socOn()){ ACT.pfShowSignup(); return; }
  Object.keys(CHN).forEach(k=>delete CHN[k]); Object.assign(CHN,{game:null,to:null,stake:0,staked:false,pick:null,golf:null},pre||{});
  (SOC.me&&SOC.me.leagues||[]).forEach(l=>loadLeague(l.id)); chStep();
}
function chStep(){
  if(!CHN.game) return modal(`<div class="fgm-k">Challenge · pick a game</div><div class="chx-grid">${Object.entries(CH_GAMES).map(([k,g])=>`<button class="chx-pick" data-a="chGame" data-v="${k}"><span>${g[0]}</span><div><b>${g[1]}</b><small>${g[2]}</small></div></button>`).join('')}</div>`);
  if(!CHN.to){ const F=friendsList(); LV.av=[];
    const m=modal(`<div class="fgm-k">${CH_GAMES[CHN.game][0]} ${CH_GAMES[CHN.game][1]} · who?</div>${F.length?`<div class="chx-friends">${F.map(p=>`<button data-a="chTo" data-v="${esc(p.name)}">${avatar(lookFor(p.outfit))}<span>${esc(p.name)}</span></button>`).join('')}</div>`:'<p class="small muted">Your league-mates show up here. You can also type any player’s name:</p>'}
      <div class="row" style="gap:8px;margin-top:10px"><input class="input" id="chName" maxlength="20" placeholder="Player name" autocomplete="off" style="font-size:16px;flex:1"><button class="btn" data-a="chToName">Next</button></div><div class="small" id="lgMsg" style="min-height:18px;color:var(--loss-hi)"></div>`);
    paintAvatars(); return m; }
  if(!CHN.staked){
    return modal(`<div class="fgm-k">${CH_GAMES[CHN.game][0]} vs ${esc(CHN.to)} · stake</div><p class="small muted">You both put this up. Winner takes it all. Ties get it back.</p>
      <div class="chx-stakes">${[0,100000,250000,1000000,5000000].map(v=>`<button data-a="chStake" data-v="${v}" ${v>S.bank?'disabled':''}>${v?k$(v):'Just for fun'}</button>`).join('')}<button data-a="chStakeCustom">Custom amount</button></div>`); }
  if(CHN.game==='golf'&&!CHN.golf){
    return modal(`<div class="fgm-k">⛳ Which course?</div><div class="gx-pick col">${Object.keys(GOLF_COURSES).map(k=>`<button class="${k===(S.golfCourse||'links')?'on':''}" data-a="chCourse" data-v="${k}"><b>${esc(courseName(k))}</b><small>${esc(GOLF_COURSES[k].blurb)}</small></button>`).join('')}</div>
      <div class="gx-pick holes" style="margin-top:10px">${[3,6,9].map(h=>`<button class="${h===(S.golfHoles||6)?'on':''}" data-a="chHoles" data-v="${h}">${h} holes</button>`).join('')}</div>
      <button class="btn gold wide" style="margin-top:12px" data-a="chGolfGo">Tee off</button>`); }
  if(CHN.game==='pick'&&!CHN.pick){
    const G=allGames().filter(g=>betable(g)&&g.s!=='live'&&g.s!=='final').sort((a,b)=>new Date(a.t)-new Date(b.t)).slice(0,24);
    return modal(`<div class="fgm-k">🏈 Pick a game and a side</div><p class="small muted">${esc(CHN.to)} gets the other team. Whoever’s team wins takes the pot.</p>
      ${G.length?G.map(g=>`<div class="chx-game"><small class="muted">${esc(g.lg.toUpperCase())} · ${esc(when(g.t,g.tba))}</small><div class="row" style="gap:6px"><button class="btn sm" style="flex:1" data-a="chSide" data-g="${g.id}" data-s="a">${esc(g.a.name)}</button><span class="small muted">@</span><button class="btn sm" style="flex:1" data-a="chSide" data-g="${g.id}" data-s="h">${esc(g.h.name)}</button></div></div>`).join(''):'<div class="empty">No upcoming games to pick right now.</div>'}`);
  }
  // go
  if(CHN.game==='pick') return chSend();
  closeModal();
  const seed=1+Math.floor(Math.random()*99999), vs=`Challenge vs ${CHN.to} · set the score to beat`;
  const onFinish=score=>chSend(seed,score);
  if(CHN.game==='golf'){ CHN.pick=CHN.golf; openGolf({seed,vs,onFinish,course:CHN.golf.course,holes:CHN.golf.holes,noCash:true}); }
  else openDuel({game:CHN.game,vs,onFinish});
}
async function chSend(seed,score){
  if(CHN.stake>S.bank){ toast('Not enough in the bankroll for that stake','loss'); return 'Not enough money for the stake — challenge not sent.'; }
  const r=await srpc('fg_ch_create',{p_to:CHN.to,p_game:CHN.game,p_stake:CHN.stake,p_seed:seed||0,p_score:score==null?null:score,p_data:CHN.pick||{}});
  if(!r||!r.ok){ const msg={no_player:'No player called '+CHN.to+'.',too_many:'You have too many open challenges.'}[r&&r.error]||'Couldn’t send the challenge.'; if(CHN.game==='pick') toast(msg,'loss'); return msg; }
  if(CHN.stake) setBank(-CHN.stake);
  needMe();
  const msg=`Challenge sent to ${CHN.to}${CHN.stake?' · '+k$(CHN.stake)+' on the line':''}. They’ve got 3 days to answer.`;
  if(CHN.game==='pick'){ closeModal(); S.mode='league'; S.ltab='challenge'; save(); render(); toast('Challenge sent','gold'); }
  return msg;
}
Object.assign(ACT,{
  chNew:el=>{ const d=el&&el.dataset||{}, pre={}; if(d.to) pre.to=d.to; if(d.game) pre.game=d.game; challengeStart(pre); },
  chGame:el=>{ CHN.game=el.dataset.v; chStep(); },
  chCourse:el=>{ S.golfCourse=el.dataset.v; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el)); },
  chHoles:el=>{ S.golfHoles=+el.dataset.v; el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el)); },
  chGolfGo:()=>{ save(); CHN.golf={course:S.golfCourse||'links',holes:S.golfHoles||6}; chStep(); },
  chTo:el=>{ CHN.to=el.dataset.v; chStep(); },
  chToName:()=>{ const n=($('#chName').value||'').trim(); if(n.length<2) return lgMsg('Type their profile name.'); if(PROF.me&&n.toLowerCase()===PROF.me.name.toLowerCase()) return lgMsg('That’s you!'); CHN.to=n; chStep(); },
  chStake:el=>{ CHN.stake=+el.dataset.v; CHN.staked=true; chStep(); },
  chSide:el=>{ const g=allGames().find(x=>x.id===el.dataset.g); if(!g) return; const s=el.dataset.s, me=s==='a'?g.a:g.h, them=s==='a'?g.h:g.a;
    CHN.pick={gid:g.id,side:s,label:me.name,other:them.name,title:g.a.name+' @ '+g.h.name,t:g.t}; chStep(); },
  chAccept:async el=>{ const c=(SOC.me.challenges||[]).find(x=>x.id===+el.dataset.id); if(!c) return;
    if(c.stake>S.bank){ toast('You need '+k$(c.stake)+' to accept','loss'); return; }
    el.disabled=true; const r=await srpc('fg_ch_answer',{p_id:c.id,p_answer:'accept'}).catch(()=>null);
    if(!r||!r.ok){ toast('That challenge is gone','loss'); socRefresh(true).then(render); return; }
    if(c.stake) setBank(-c.stake); c.status='accepted';
    if(c.game==='pick'){ toast('You’ve got '+(c.data.other||'the other side')+'. Good luck!','gold'); socRefresh(true).then(render); return; }
    chPlay(c); },
  chPlay:el=>{ const c=(SOC.me.challenges||[]).find(x=>x.id===+el.dataset.id); if(c) chPlay(c); },
  chDecline:async el=>{ if(!confirm('Decline this challenge?')) return; await srpc('fg_ch_answer',{p_id:+el.dataset.id,p_answer:'decline'}).catch(()=>{}); socRefresh(true).then(render); },
  chCancel:async el=>{ await srpc('fg_ch_answer',{p_id:+el.dataset.id,p_answer:'cancel'}).catch(()=>{}); socRefresh(true).then(render); },
  chShare:el=>{ const c=(SOC.me.challenges||[]).find(x=>x.id===+el.dataset.id); if(!c) return; const other=c.mine?c.to_name:c.from_name;
    shareCard({game:c.game==='pick'?'sports':c.game==='golf'?'golf':'duel',title:'Beat '+other+' at '+gameName(c.game),amount:c.stake*2||null,big:c.stake?null:'WINNER',sub:c.from_score!=null?c.from_score+' to '+c.to_score:(c.data.title||'')}); },
});
function chPlay(c){
  const vs=`vs ${c.from_name} · beat ${c.from_score}${c.game==='golf'?' strokes':' chips'}`;
  const onFinish=async score=>{ const r=await srpc('fg_ch_score',{p_id:c.id,p_score:score}); needMe();
    if(!r||!r.ok) return 'That challenge already ended.';
    return r.result==='me'?`You beat ${c.from_name} (${r.their_score})!${c.stake?' +'+k$(c.stake*2)+' is on its way.':''}`:r.result==='tie'?`Tied with ${c.from_name}. Stakes returned.`:`${c.from_name} wins with ${r.their_score}. Rematch?`; };
  if(c.game==='golf') openGolf({seed:c.seed,vs,onFinish,noCash:true,course:(c.data&&c.data.course)||'links',holes:(c.data&&c.data.holes)||6}); else openDuel({game:c.game,vs,onFinish});
}
// Pick'ems settle themselves once the real game is final.
function chSettlePicks(){
  if(!SOC.me) return; const gs={}; allGames().forEach(g=>gs[g.id]=g);
  for(const c of SOC.me.challenges||[]){ if(c.game!=='pick'||c.status!=='accepted') continue; const g=gs[c.data.gid]; if(!g||g.s!=='final'||g.as==null) continue;
    const side=g.hs>g.as?'h':g.as>g.hs?'a':'push'; c.status='settling'; srpc('fg_ch_pick',{p_id:c.id,p_side:side}).then(()=>setTimeout(()=>socRefresh(true),400)).catch(()=>{}); }
}

/* ---------- Golf tab ---------- */
function viewGolf(){
  const G=S.golf||{}, cid=S.golfCourse||'links', n=S.golfHoles||6, best=G.best&&typeof G.best==='object'?G.best[cid+'-'+n]:null;
  return `<div class="lgx-hero golf-hero"><div class="lgx-emoji">⛳</div><h2 class="serif">${esc(courseName(cid))}</h2><p class="muted">${esc(GOLF_COURSES[cid].blurb)} ${n} holes · par ${coursePar(cid,n)}.</p>
    <div class="gx-pick">${Object.keys(GOLF_COURSES).map(k=>`<button class="${k===cid?'on':''}" data-a="golfCourse" data-v="${k}">${esc(courseName(k))}</button>`).join('')}</div>
    <div class="gx-pick holes">${[3,6,9].map(h=>`<button class="${h===n?'on':''}" data-a="golfHoles" data-v="${h}">${h} holes</button>`).join('')}</div>
    ${typeof golfSkillCard==='function'?golfSkillCard():''}<button class="btn gold wide" data-a="golfPlay">Play ${n} holes</button><button class="btn wide" style="margin-top:8px" data-a="rangeOpen">🎯 Driving range</button><button class="btn wide" style="margin-top:8px" data-a="golfCh">Challenge a friend</button>
    ${best!=null?`<p class="small muted" style="margin:10px 0 0">Your best here <b class="gold">${best}</b> (${vsPar(best-coursePar(cid,n))})${G.rounds?' · '+G.rounds+' rounds played':''}</p>`:''}</div>
    <div class="sechead"><h2>How to play</h2></div>
    <div class="panel lgx-rules"><div><b>1</b><span><b>Tap the course</b> where you want the ball to land. The club is picked for you — change it with ‹ ›.</span></div>
    <div><b>2</b><span><b>Tap SWING</b>, then tap again when the marker is in the <b class="up">green</b>. Yellow is a bit off; red is a big miss.</span></div>
    <div><b>3</b><span><b>Watch the wind</b> (top right) and aim into it. Water and out of bounds cost a stroke. Sand and rough cost distance.</span></div>
    <div><b>⛳</b><span><b>Read the green.</b> Every green slopes — the arrows by the cup point downhill and putts curl that way, so aim off the hole.</span></div>
    <div><b>💰</b><span>Green fee ${k$(golfHoleFee())} a hole · Eagle +${k$(Math.round(golfHoleFee()*20*golfLvX()))} · Hole in one +${k$(Math.round(golfHoleFee()*100*golfLvX()))} · nothing else pays (grows with your golf level)</span></div></div>
    <p class="foot">The courses change with the seasons. You can also walk out the lodge’s back window to the links.</p>`;
}
Object.assign(ACT,{ golfCourse:el=>{ S.golfCourse=el.dataset.v; save(); render(); }, golfHoles:el=>{ S.golfHoles=+el.dataset.v; save(); render(); } });
Object.assign(ACT,{ golfPlay:()=>openGolf({}), golfCh:()=>challengeStart({game:'golf'}) });

/* ---------- Invite tab ---------- */
function viewInvite(){
  if(!socOn()) return needProfile('· get your invite code');
  if(!SOC.me){ needMe(); return `<div class="empty">Loading…</div>`; }
  const l=socLeague();
  return `<div class="lgx-hero inv"><div class="lgx-emoji">🎁</div><h2 class="serif">Invite a friend, wipe your debt</h2>
    <p>When a friend makes a profile with your link, <b>your debt is cleared</b> and you get <b class="gold">$1,000,000</b>.</p>
    <div class="inv-code mono">${esc(SOC.me.ref||'—')}</div><span class="small muted">Your invite code${l?` · it also drops them into <b>${esc(l.name)}</b>`:''}</span>
    <div class="row" style="gap:8px;margin-top:12px"><button class="btn gold" style="flex:1" data-a="invShare">Share invite link</button><button class="btn" style="flex:1" data-a="invCopy">Copy link</button></div>
    <p class="small muted" style="margin:10px 0 0">Friends joined so far: <b class="gold">${SOC.me.invited||0}</b></p></div>
    <div class="sechead"><h2>Got a code?</h2></div>
    <div class="panel pad"><label class="small muted">League code</label><div class="row" style="gap:8px;margin:6px 0 12px"><input class="input mono" id="invLeague" maxlength="8" autocapitalize="characters" placeholder="ABCDE" style="flex:1;font-size:16px"><button class="btn" data-a="invJoin">Join</button></div>
    <label class="small muted">Friend’s invite code (within 2 days of making your profile)</label><div class="row" style="gap:8px;margin-top:6px"><input class="input mono" id="invRef" maxlength="8" autocapitalize="characters" placeholder="ABC123" style="flex:1;font-size:16px"><button class="btn" data-a="invUse">Use</button></div></div>`;
}
Object.assign(ACT,{
  invShare:()=>{ const l=socLeague(); shareLink(`Play me on Fourth & Gold — casino, sportsbook, golf and leagues with friends. Use my code ${SOC.me.ref}${l?' to join '+l.name:''}.`,inviteUrl(l&&l.code)); },
  invCopy:()=>{ const l=socLeague(); copyText(inviteUrl(l&&l.code)); },
  invJoin:async el=>{ const code=($('#invLeague').value||'').trim(); if(!code) return; el.disabled=true; const r=await srpc('fg_league_join',{p_code:code}).catch(()=>null); el.disabled=false;
    if(!r||!r.ok){ toast(LG_ERR[r&&r.error]||'Couldn’t join','loss'); return; } SOC.cur=r.id; await socRefresh(true); S.ltab='league'; save(); render(); toast('Welcome to '+r.name+'!','gold'); },
  invUse:async el=>{ const code=($('#invRef').value||'').trim(); if(!code) return; el.disabled=true; const r=await srpc('fg_use_invite',{p_code:code}).catch(()=>null); el.disabled=false;
    if(r&&r.ok){ toast('Thanks! '+r.inviter+' gets their reward','gold'); return; } toast({already:'You already used an invite code.',too_late:'Invite codes only work in your first 2 days.',bad_code:'That code doesn’t exist.'}[r&&r.error]||'Couldn’t use that code','loss'); },
});
