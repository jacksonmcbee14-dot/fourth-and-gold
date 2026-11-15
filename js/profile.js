// Profiles (name + 4-digit PIN), saving your game to your profile, and the shared leaderboard.

const PROFILE_KEY='fg_profile_v1', WELCOME_KEY='fg_welcome_seen';
const PROF={me:null, board:null, boardAt:0, saveT:null, writing:false, pending:false};
try{PROF.me=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');}catch(e){}
const cloudOn=()=>!!(SUPABASE_URL&&SUPABASE_KEY);

async function rpc(fn,args){
  const r=await fetch(SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/rpc/'+fn,{method:'POST',
    headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY},body:JSON.stringify(args||{})});
  if(!r.ok) throw new Error('rpc '+fn+' '+r.status);
  return r.json();
}
const cloudArgs=()=>({p_state:S,p_upd:S.upd||Date.now(),p_bank:scoreNow(),p_peak:S.peak,p_resets:S.resets||0,p_nfl:myN(),p_cfb:myC()});
function setMe(me){PROF.me=me;try{me?localStorage.setItem(PROFILE_KEY,JSON.stringify(me)):localStorage.removeItem(PROFILE_KEY);}catch(e){}}

// Called by save(): send the game to your profile a moment after it changes.
function cloudSave(){ if(!cloudOn()||!PROF.me)return; clearTimeout(PROF.saveT); PROF.saveT=setTimeout(cloudPush,1500); }
async function cloudPush(){
  if(!cloudOn()||!PROF.me)return;
  if(PROF.writing){PROF.pending=true;return;}
  PROF.writing=true;
  try{ const a=cloudArgs(); const r=await rpc('fg_save',{p_token:PROF.me.token,p_state:a.p_state,p_upd:a.p_upd,p_bank:a.p_bank,p_peak:a.p_peak,p_resets:a.p_resets,p_nfl:a.p_nfl,p_cfb:a.p_cfb});
    if(r&&r.error==='signed_out'){setMe(null);toast('Signed out of your profile','loss');}
    else if(r&&r.stale) cloudPull(true);
  }catch(e){}
  PROF.writing=false;
  if(PROF.pending){PROF.pending=false;cloudPush();}
}
// Take your profile's saved game when it's newer than this device's.
function adoptState(st){
  if(!st||typeof st!=='object')return;
  S=Object.assign(S,st); migrate();
  try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
  applyMyTeams(); baseModels(); NFLM_S=null; CFBM_S=null; settleBets(); render();
  loadMySchedules().then(()=>{applyMyTeams();baseModels();render();});
}
async function cloudPull(force){
  if(!cloudOn()||!PROF.me)return;
  try{ const r=await rpc('fg_load',{p_token:PROF.me.token});
    if(!r){setMe(null);return;}
    if(r.state&&(force||(r.upd||0)>(S.upd||0))) adoptState(r.state); else cloudPush();
  }catch(e){}
}
async function loadBoard(){
  if(!cloudOn())return;
  try{ PROF.board=await rpc('fg_leaderboard'); PROF.boardAt=Date.now(); }catch(e){}
}

/* ---------- Screens ---------- */
function openSheetHTML(html){$('#sheet').innerHTML=`<div class="grab"></div>`+html;$('#scrim').classList.add('on');$('#sheet').classList.add('on');}
const inputStyle='font-family:var(--sans);font-size:16px;margin:6px 0 12px';
function profileForm(mode,msg){
  const up=mode==='up';
  return `<div class="eyebrow">${up?'Create your profile':'Sign in'}</div>
  <p class="small muted" style="margin:6px 0 14px">${up?'Pick a name for the leaderboard and a 4-digit PIN so nobody else can play as you. Your current bankroll comes with you.':'Use the same name and PIN on any device. Your profile’s bankroll replaces the one on this device.'}</p>
  <label class="small muted">Name</label><input class="input" id="pfName" maxlength="20" autocomplete="off" autocapitalize="words" style="${inputStyle}" value="${esc((PROF.me&&PROF.me.name)||'')}">
  <label class="small muted">4-digit PIN</label><input class="input" id="pfPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" style="${inputStyle}">
  ${up?`<label class="small muted">PIN again</label><input class="input" id="pfPin2" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" style="${inputStyle}">`:''}
  <div class="small" id="pfMsg" style="min-height:18px;color:var(--loss-hi)">${msg?esc(msg):''}</div>
  <button class="btn gold" style="width:100%;padding:14px;margin-top:6px" data-a="${up?'pfSignup':'pfLogin'}">${up?'Create profile':'Sign in'}</button>
  <button class="btn ghost" style="width:100%;margin-top:8px" data-a="${up?'pfShowLogin':'pfShowSignup'}">${up?'I already have a profile':'Create a new profile instead'}</button>
  <button class="btn ghost" style="width:100%;margin-top:8px" data-a="pfLater">Not now — play as a guest</button>`;
}
function boardRows(list,limit){
  if(!list) return `<div class="empty">Loading the leaderboard…</div>`;
  if(!list.length) return `<div class="empty">No players yet. Create a profile to be first.</div>`;
  const meKey=PROF.me&&PROF.me.name.trim().toLowerCase();
  const tm=p=>[p.nfl_team&&NFL[p.nfl_team]?NFL[p.nfl_team].n:'',p.cfb_team?((CFB.find(t=>t.ab===p.cfb_team)||CFB_DIR[p.cfb_team]||{n:p.cfb_team}).n):''].filter(Boolean).join(' · ');
  let rows=list.map((p,i)=>({p,i}));
  if(limit&&rows.length>limit){const mine=rows.find(r=>r.p.name.trim().toLowerCase()===meKey);rows=rows.slice(0,limit);if(mine&&mine.i>=limit)rows.push(mine);}
  return rows.map(({p,i})=>`<div class="rank ${p.name.trim().toLowerCase()===meKey?'me':''}"><span class="no">${i+1}</span><span style="font-size:20px;text-align:center">${i===0?'🔥':''}</span><div><div style="font-weight:600">${esc(p.name)}${p.xp!=null&&typeof levelOf==='function'?` <span class="gold small">· Lv ${levelOf(p.xp).L} ${titleOf(levelOf(p.xp).L)}</span>`:''}</div><div class="small muted">${p.casino!=null?`Casino ${signed$(p.casino)} · Football ${signed$(p.football)}`:esc(tm(p))} · ${p.resets} reset${p.resets===1?'':'s'}${p.debt>0?` · <span style="color:var(--loss-hi)">owes ${k$(p.debt)}</span>`:''}</div></div><span class="score">${k$(p.bank)}</span></div>`).join('');
}
function boardSection(limit){
  if(!cloudOn()) return '';
  if(!PROF.board||Date.now()-PROF.boardAt>60e3) loadBoard().then(()=>{ if(((S.mode==='football'&&S.ftab==='ranks')||(S.mode==='casino'&&S.ctab==='ranks'))&&!SLIP) render(); });
  return `<div class="sechead"><h2>Leaderboard</h2><span class="aside">Most money · fewest resets</span></div>
  <div class="panel" style="padding:4px 8px">${boardRows(PROF.board,limit)}</div>
  ${PROF.me?'':`<button class="btn gold" style="width:100%;margin-top:8px" data-a="pfShowSignup">Create a profile to join</button>`}`;
}
function profileStart(){
  if(!cloudOn()) return;
  if(PROF.me) cloudPull(false);
  else if(!(typeof lodgeActive==='function'&&lodgeActive())) setTimeout(profileWelcome,600);   // with the lodge, it waits until you pick Lodge or app
  loadBoard();
}
function profileWelcome(){ if(!cloudOn()||PROF.me) return; let seen=false; try{seen=!!localStorage.getItem(WELCOME_KEY);}catch(e){} if(!seen) openSheetHTML(profileForm('up')); }
const pfMsg=t=>{const m=$('#pfMsg');if(m)m.textContent=t;};
const pfVals=()=>({name:($('#pfName')||{}).value||'',pin:($('#pfPin')||{}).value||'',pin2:($('#pfPin2')||{}).value||''});
Object.assign(ACT,{
  pfShowSignup:()=>openSheetHTML(profileForm('up')),
  pfShowLogin:()=>openSheetHTML(profileForm('in')),
  pfLater:()=>{try{localStorage.setItem(WELCOME_KEY,'1');}catch(e){}closeSheet();},
  pfSignup:async el=>{const v=pfVals(),name=v.name.trim();
    if(name.length<2)return pfMsg('Names need at least 2 characters.');
    if(!/^\d{4}$/.test(v.pin))return pfMsg('The PIN must be exactly 4 digits.');
    if(v.pin!==v.pin2)return pfMsg('The two PINs don’t match.');
    el.disabled=true;
    try{ const a=cloudArgs(); const r=await rpc('fg_signup',{p_name:name,p_pin:v.pin,...a});
      if(r.error){el.disabled=false;return pfMsg(r.error==='name_taken'?'That name is taken — try another, or sign in.':r.error==='bad_name'?'Names need 2–20 characters.':'The PIN must be exactly 4 digits.');}
      setMe({token:r.token,name:r.name});try{localStorage.setItem(WELCOME_KEY,'1');}catch(e){}
      closeSheet();loadBoard().then(render);toast('Welcome, '+r.name+'!','gold');
    }catch(e){el.disabled=false;pfMsg('Couldn’t reach the server. Check your connection.');}},
  pfLogin:async el=>{const v=pfVals();
    if(!/^\d{4}$/.test(v.pin))return pfMsg('The PIN must be exactly 4 digits.');
    el.disabled=true;
    try{ const r=await rpc('fg_login',{p_name:v.name,p_pin:v.pin});
      if(r.error){el.disabled=false;return pfMsg(r.error==='no_player'?'No profile with that name.':r.error==='locked'?'Too many wrong PINs. Try again in 15 minutes.':'Wrong PIN.');}
      setMe({token:r.token,name:r.name});try{localStorage.setItem(WELCOME_KEY,'1');}catch(e){}
      closeSheet(); if(r.state) adoptState(r.state); else cloudPush(); loadBoard().then(render); toast('Signed in as '+r.name,'gold');
    }catch(e){el.disabled=false;pfMsg('Couldn’t reach the server. Check your connection.');}},
  pfSignOut:()=>{ if(!confirm('Sign out? This device will start fresh at $1,000,000. Your profile keeps its own bankroll.'))return;
    setMe(null); try{localStorage.removeItem(KEY);localStorage.removeItem(WELCOME_KEY);}catch(e){} location.reload(); },
  board:()=>{closeSheet();if(S.mode==='casino'){SL.auto=0;S.ctab='ranks';}else S.ftab='ranks';save();scrollTo(0,0);render();},
});
// The bankroll sheet gains your profile, teams and leaderboard (the original contents stay as they were).
const _bankSheet=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheet(el);
  const extra=`${cloudOn()&&PROF.me?`<p class="small muted" style="text-align:center;margin-top:-6px">Resets show on the leaderboard (you have ${S.resets||0}).</p>`:''}<div class="divider" style="margin:16px 0"></div>
  ${cloudOn()?(PROF.me?`<div class="between"><span class="small muted">Signed in as <b style="color:var(--text)">${esc(PROF.me.name)}</b></span><button class="btn sm ghost" data-a="pfSignOut">Sign out</button></div>`:`<button class="btn gold" style="width:100%" data-a="pfShowSignup">Create a profile · join the leaderboard</button><button class="btn ghost" style="width:100%;margin-top:8px" data-a="pfShowLogin">Sign in</button>`):''}
  <div class="row" style="margin-top:10px">${cloudOn()?'<button class="btn" style="flex:1" data-a="board">Leaderboard</button>':''}<button class="btn" style="flex:1" data-a="teamSheet">Your teams</button></div>`;
  $('#sheet').insertAdjacentHTML('beforeend',extra);
};
