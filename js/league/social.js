// Leagues, invites, challenges and the daily bonus: the connection to the server (supabase/update-4-leagues.sql)
// and everything that happens in the background. The screens are in js/league/view.js.
//
// League score: leagues race on how much you've WON this week, so the app tracks what isn't winnings:
//   S.gifts  free money (daily bonus, invite rewards, refunds of nothing)   S.spent  money spent at the shop
//   S.ladj   keeps a bankroll reset from changing your league score          (S.topups already existed)

const SOC={me:null,at:0,busy:false,leagues:{},cur:null,err:'',pendingInvite:null,pendingLeague:null};
const socOn=()=>typeof cloudOn==='function'&&cloudOn()&&!!PROF.me;
const socInLeague=()=>!!(SOC.me&&SOC.me.leagues&&SOC.me.leagues.length);
const socLeague=()=>SOC.me&&SOC.me.leagues&&(SOC.me.leagues.find(l=>l.id===SOC.cur)||SOC.me.leagues[0]);
const socLeagueCode=()=>{ const l=socLeague(); return l?l.code:''; };
async function srpc(fn,args){ const r=await rpc(fn,Object.assign({p_token:PROF.me.token},args||{})); if(r&&r.error==='signed_out'){ setMe(null); SOC.me=null; } return r; }

/* ---------- Money that isn't winnings ---------- */
function addGift(n){ if(!(n>0)) return; S.gifts=(S.gifts||0)+n; S.bank=Math.round(S.bank+n); if(S.bank>S.peak) S.peak=S.bank; save(); const el=$('#bankVal'); if(el) el.textContent=bank$(S.bank); if(typeof hudBank==='function') hudBank(); }
const _buyItem=buyItem;
buyItem=function(id){ const before=S.bank; _buyItem(id); const spent=before-S.bank; if(spent>0){ S.spent=(S.spent||0)+spent; save(); } };
const leagueScoreRaw=()=>scoreNow()-(S.topups||0)-(S.gifts||0)+(S.spent||0);
const _resetL=ACT.reset;
ACT.reset=el=>{ const before=leagueScoreRaw()+(S.ladj||0), n=S.resets||0; _resetL(el); if((S.resets||0)!==n){ S.ladj=before-leagueScoreRaw(); save(); } };

/* ---------- Invite links: ?invite=CODE&league=CODE ---------- */
(()=>{ try{ const q=new URLSearchParams(location.search), inv=q.get('invite'), lg=q.get('league');
  if(inv) localStorage.setItem('fg_invite',inv.toUpperCase().slice(0,8)); if(lg) localStorage.setItem('fg_join',lg.toUpperCase().slice(0,8));
  if(inv||lg){ q.delete('invite'); q.delete('league'); history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash); }
  SOC.pendingInvite=localStorage.getItem('fg_invite'); SOC.pendingLeague=localStorage.getItem('fg_join'); }catch(e){} })();
// Right after signing up (or signing in), use a saved invite / league code.
async function socUsePending(){
  if(!socOn()) return;
  if(SOC.pendingInvite){ const code=SOC.pendingInvite; SOC.pendingInvite=null; try{ localStorage.removeItem('fg_invite'); }catch(e){}
    try{ const r=await srpc('fg_use_invite',{p_code:code}); if(r&&r.ok) toast('You joined with '+r.inviter+'’s invite','gold'); }catch(e){} }
  if(SOC.pendingLeague){ const code=SOC.pendingLeague; SOC.pendingLeague=null; try{ localStorage.removeItem('fg_join'); }catch(e){}
    try{ const r=await srpc('fg_league_join',{p_code:code}); if(r&&r.ok){ SOC.cur=r.id; toast('You’re in '+r.name+'!','gold'); } }catch(e){} }
  await socRefresh(true);
}
// The sign-up and sign-in buttons: afterwards, use any invite and load leagues.
for(const k of ['pfSignup','pfLogin']){ const f=ACT[k]; ACT[k]=async el=>{ await f(el); if(PROF.me) socUsePending(); }; }
// Invites need a profile: people who arrived with a link see an invite version of the sign-up.
const _profileWelcome=profileWelcome;
profileWelcome=function(){ if((SOC.pendingInvite||SOC.pendingLeague)&&!PROF.me&&cloudOn()) return socWelcomeInvite(); _profileWelcome(); };
function socWelcomeInvite(){
  if(!(SOC.pendingInvite||SOC.pendingLeague)||PROF.me||!cloudOn()) return;
  openSheetHTML(`<div class="eyebrow">You were invited</div><p class="small" style="margin:6px 0 14px">Make a profile to join your friend${SOC.pendingLeague?'’s league':''}. It takes 10 seconds.</p>`+profileForm('up').replace(/^<div class="eyebrow">[^<]*<\/div>/,''));
}

/* ---------- Refreshing: leagues, inbox, challenges ---------- */
async function socRefresh(force){
  if(!socOn()||SOC.busy) return SOC.me;
  if(!force&&SOC.me&&Date.now()-SOC.at<30e3) return SOC.me;
  SOC.busy=true;
  try{ const r=await srpc('fg_me'); if(r&&!r.error){ SOC.me=r; SOC.at=Date.now(); SOC.err=''; if(!SOC.cur&&r.leagues[0]) SOC.cur=r.leagues[0].id; await socInbox(r.inbox||[]); chSettlePicks(); } }
  catch(e){ SOC.err=/ 404/.test(e&&e.message||'')?'setup':'offline'; }
  SOC.busy=false; socBadge(); return SOC.me;
}
// Apply money and prizes waiting on the server, then tell the server they arrived.
const INBOX_KINDS=['invite','champion','challenge_win','robbed','heist_fine','home_gift','xp_set','butler_trial','palace','tub_guest','tub_party','money_gift','item_stolen','room_winner','market_sold','tourney_win','pickem_champ','challenge_refund'];
async function socInbox(items){
  if(!items.length) return;
  S.inboxDone=S.inboxDone||[]; const done=[];
  for(const it of items){
    // Leave anything this version doesn't understand on the server, so a newer version can still deliver it.
    if(!INBOX_KINDS.includes(it.kind)) continue;
    done.push(it.id); if(S.inboxDone.includes(it.id)) continue; S.inboxDone.push(it.id);
    if(it.kind==='invite'){ const d=S.debt||0; if(it.clear_debt) S.debt=0; addGift(it.amount); celebrate('Your friend joined!',`${it.label} signed up with your invite.`,(d?'Debt of '+fmt$(d)+' wiped + ':'')+fmt$(it.amount)); }
    else if(it.kind==='champion'){ grantPrize(it.item); celebrate('League champion!',`You finished #1 in ${it.label} last week.`,'You won: '+((ITEM[it.item]||{}).name||'a prize'),it.item); }
    else if(it.kind==='challenge_win'){ setBank(it.amount); toast('Challenge won! +'+fmt$(it.amount),'win'); }
    else if((it.kind==='robbed'||it.kind==='heist_fine')&&typeof heistInbox==='function'){ heistInbox(it); }
    else if(it.kind==='xp_set'){ const L0=levelOf(S.lodge.xp).L; if(it.amount>(S.lodge.xp||0)){ S.lodge.xp=it.amount; save(); xpHud(); const L1=levelOf(S.lodge.xp).L; let hn=''; if(typeof homeTier==='function'){ const h0=S.lodge.home||0, h1=homeTier(); if(h1>h0) hn=' · New home: '+HOMES[h1].name; S.lodge.home=h1; homeSync(); } celebrate('Level '+L1+'!',(it.label||'Your level was upgraded.')+hn,'Level '+L0+' → '+L1); } }
    else if(it.kind==='butler_trial'&&typeof butlerTrialInbox==='function'){ butlerTrialInbox(it); }
    else if(it.kind==='palace'&&typeof homeGiftInbox==='function'&&typeof PALACE!=='undefined'){ homeGiftInbox(Object.assign({},it,{amount:PALACE})); }
    else if((it.kind==='tub_guest'||it.kind==='tub_party')&&typeof tubInbox==='function'){ tubInbox(it); }
    else if(it.kind==='money_gift'&&typeof moneyInbox==='function'){ moneyInbox(it); }
    else if(it.kind==='item_stolen'&&typeof stealInbox==='function'){ stealInbox(it); }
    else if(it.kind==='room_winner'&&typeof homeWinInbox==='function'){ homeWinInbox(it); }
    else if(it.kind==='market_sold'&&typeof marketInbox==='function'){ marketInbox(it); }
    else if(it.kind==='tourney_win'&&typeof tourneyInbox==='function'){ tourneyInbox(it); }
    else if(it.kind==='home_gift'&&typeof homeGiftInbox==='function'){ homeGiftInbox(it); }
    else if(it.kind==='pickem_champ'&&typeof pickemInbox==='function'){ pickemInbox(it); }
    else if(it.kind==='challenge_refund'){ S.bank=Math.round(S.bank+it.amount); save(); toast('Challenge stake returned · '+fmt$(it.amount),'gold'); }
  }
  S.inboxDone=S.inboxDone.slice(-200); save(); render();
  inboxKeep(items.filter(it=>INBOX_KINDS.includes(it.kind)));
  try{ await srpc('fg_ack',{p_ids:done}); }catch(e){}
}
function celebrate(title,line,big,item){
  modal(`<div class="cel">${item?'<div class="cel-ic"></div>':'<div class="cel-emoji">🎉</div>'}<div class="cel-t">${esc(title)}</div><p>${esc(line)}</p><div class="cel-big">${esc(big)}</div>
    <div class="fgm-row"><button class="btn gold" data-a="closeModal">Awesome</button><button class="btn" data-a="celShare">Share it</button></div></div>`);
  const ic=document.querySelector('#fgModal .cel-ic'); if(ic&&item&&ITEM[item]) ic.appendChild(iconCanvas(ITEM[item],5));
  SOC.celebrated={title,big};
  try{ fx.confetti(180); [523,659,784,1047,1319].forEach((f,i)=>tone(f,.14,'square',.05,i*.09)); }catch(e){}
}
ACT.celShare=()=>{ const c=SOC.celebrated||{}; shareCard({game:'league',title:c.title,big:c.big}); };

// A dot on the League button when something needs you (a challenge to answer).
function socBadge(){
  const n=socOn()&&SOC.me?(SOC.me.challenges||[]).filter(c=>(!c.mine&&c.status==='open')||(!c.mine&&c.status==='accepted'&&c.game!=='pick'&&c.to_score==null)).length:0;
  SOC.todo=n; document.querySelectorAll('.mode button[data-v=league]').forEach(b=>b.classList.toggle('hasdot',n>0||dailyReady()));
}

/* ---------- The feed: big moments get posted to your leagues automatically ---------- */
let socLastPost=0;
function socPost(kind,game,amount,n){
  if(!socOn()||!socInLeague()) return;
  const now=Date.now(); if(now-socLastPost<6000) return; socLastPost=now;
  srpc('fg_post',{p_kind:kind,p_game:game||null,p_amount:amount==null?null:Math.round(amount),p_n:n==null?null:Math.round(n)}).catch(()=>{});
}
// Slots: big wins.
const _bigWin=bigWin;
bigWin=function(win,tier,title){ const p=_bigWin(win,tier,title);
  if(win>=1e6) socPost('win','slots',win);
  try{ const el=$('#bigwin'); if(el&&!el.querySelector('.bw-share')){ const b=document.createElement('button'); b.className='btn sm gold bw-share'; b.textContent='Share this win'; b.onclick=e=>{ e.stopPropagation(); shareCard({game:'slots',title:title||({big:'Big win',mega:'Mega win',epic:'Sleigh ride win',jackpot:'Grand jackpot'}[tier]||'Big win'),amount:win}); }; el.querySelector('.bw-in').appendChild(b); } }catch(e){}
  return p; };
// Roulette: a win of 5× the stake or $500K+ gets a share card (and $1M+ posts to the league).
const _rSpinS=rSpin;
rSpin=function(){ const was=RL.spinning, bank0=S.bank; _rSpinS(); if(was||!RL.spinning) return; const stake=bank0-S.bank;
  setTimeout(()=>{ const m=/pays \$([\d,]+)/.exec(RL.msg||''); if(!m) return; const pay=+m[1].replace(/,/g,''), net=pay-stake;
    if(net>=500000||pay>=stake*5){ shareMoment({game:'roulette',title:RL.res+' '+(colOf(RL.res)==='R'?'Red':colOf(RL.res)==='Z'?'Zero':'Black')+' hits',amount:net}); if(net>=1e6) socPost('win','roulette',net); } },5600); };
// Blackjack, poker, craps: a single result of $500K+ profit.
for(const [fn,game] of [['bjSettle','blackjack'],['vpDraw','poker'],['crRoll','craps']]){
  if(typeof window[fn]!=='function') continue; const orig=window[fn];
  window[fn]=function(){ const b0=S.bank; const r=orig.apply(this,arguments); const chk=()=>{ const net=S.bank-b0; if(net>=500000){ shareMoment({game,title:'Big '+SHARE_GAMES[game].toLowerCase()+' win',amount:net}); if(net>=1e6) socPost('win',game,net); } }; setTimeout(chk,game==='craps'?2600:600); return r; };
}
// Sportsbook: winning bets.
const _settleS=settleBets;
settleBets=function(){ const open=new Set(S.bets.filter(b=>b.st==='open').map(b=>b.id)); _settleS();
  const won=S.bets.filter(b=>open.has(b.id)&&b.st==='won'); if(!won.length) return;
  const best=won.reduce((a,b)=>b.pay-b.stake>a.pay-a.stake?b:a), net=best.pay-best.stake;
  if(net>=100000) setTimeout(()=>shareMoment({game:'sports',title:best.legs.length>1?best.legs.length+'-leg parlay hits':best.legs[0].label,amount:net,sub:best.legs.map(l=>l.label).join(' · ')}),1200);
  if(net>=250000) socPost('win','sports',net); };
// Level-ups.
const _levelUp=levelUp; levelUp=function(a,b){ _levelUp(a,b); if(titleOf(b)!==titleOf(a)||b%5===0) socPost('level',null,null,b); };

/* ---------- Daily bonus: come back every day, the streak grows ---------- */
const DAILY=[50000,75000,100000,150000,200000,300000,1000000];
function dailyState(){ const d=S.daily||{}; const today=dayKey(); const y=new Date(); y.setDate(y.getDate()-1); const yk=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();
  const streak=d.day===today?d.streak:(d.day===yk?d.streak%7+1:1); return {ready:d.day!==today,streak,today}; }
const dailyReady=()=>dailyState().ready;
function dailyShow(){
  const st=dailyState(); if(!st.ready) return;
  modal(`<div class="dly"><div class="fgm-k">Daily bonus</div><div class="dly-t">Day ${st.streak} ${st.streak>1?'streak 🔥':''}</div>
    <div class="dly-row">${DAILY.map((v,i)=>`<div class="dly-d ${i+1<st.streak?'got':''} ${i+1===st.streak?'now':''}"><span>Day ${i+1}</span><b>${k$(v)}</b></div>`).join('')}</div>
    <p class="small muted" style="text-align:center;margin:10px 0">Come back tomorrow to keep the streak. Day 7 pays $1,000,000.</p>
    <button class="btn gold wide" data-a="dailyClaim">Collect ${fmt$(DAILY[st.streak-1])}</button></div>`);
}
ACT.dailyClaim=()=>{ const st=dailyState(); if(!st.ready){ closeModal(); return; } const amt=DAILY[st.streak-1]; S.daily={day:st.today,streak:st.streak}; addGift(amt); closeModal(); render();
  try{ fx.coins(60,1800); [659,784,988,1319].forEach((f,i)=>tone(f,.1,'square',.05,i*.07)); }catch(e){} toast('Daily bonus +'+fmt$(amt),'gold'); socBadge(); };

/* ---------- Start-up ---------- */
function socStart(){
  setTimeout(()=>{ if(!(typeof lodgeActive==='function'&&lodgeActive())) socWelcomeInvite(); },1800);
  if(socOn()){ socUsePending().catch(()=>{}); }
  // the daily bonus pops up once you're in (after the lodge welcome)
  const tryDaily=()=>{ if(!dailyReady()) return; if(document.querySelector('.lvlup')||document.body.classList.contains('in-golf')||document.querySelector('#fgModal.on')||$('#sheet').classList.contains('on')||(LODGE.el&&LODGE.el.dataset.mode==='welcome')||(LODGE.el&&LODGE.el.dataset.mode==='choice')){ setTimeout(tryDaily,2500); return; } dailyShow(); };
  setTimeout(tryDaily,4000);
  setInterval(()=>{ if(socOn()&&!document.hidden) socRefresh(false).then(()=>{ if(S.mode==='league'&&!SLIP&&!document.querySelector('#fgModal.on')) render(); }); },60e3);
  socBadge();
}

// Gifts are applied on this device and then saved. If a newer copy from another device replaces this one
// before that save lands, the gift would be lost — so remember recent ones here (outside the game state)
// and apply again any that the loaded copy doesn't have.
const INBOX_KEEP='fg_inbox_keep';
function inboxKeep(items){ if(!items.length) return; try{ const now=Date.now(), old=JSON.parse(localStorage.getItem(INBOX_KEEP)||'[]').filter(x=>now-x.at<3*864e5);
  for(const it of items) if(!old.some(x=>x.it.id===it.id)) old.push({at:now,it}); localStorage.setItem(INBOX_KEEP,JSON.stringify(old.slice(-50))); }catch(e){} }
let INBOX_QUIET=0;   // until when pop-ups are skipped (re-applied gifts were already celebrated)
const _celebrateK=celebrate; celebrate=function(...a){ if(Date.now()>INBOX_QUIET) return _celebrateK(...a); };
const _adoptStateK=adoptState;
adoptState=function(st){ _adoptStateK(st);
  let keep=[]; try{ keep=JSON.parse(localStorage.getItem(INBOX_KEEP)||'[]'); }catch(e){}
  const done=S.inboxDone||[], miss=keep.map(x=>x.it).filter(it=>!done.includes(it.id));
  if(miss.length){ INBOX_QUIET=Date.now()+3000; socInbox(miss); toast('Restored '+miss.length+' gift'+(miss.length>1?'s':'')+' from your inbox','gold'); } };
