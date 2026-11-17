// 🏆 The weekly slots tournament (supabase/update-26-tournaments.sql). On the slots screen: buy in once a week.
// Your score is the sum of your 10 best slot wins in multiples of your bet (a 25× win counts 25 whether you bet
// $1K or $1B). When the week ends, the top 3 split the pot 50/30/20, plus a $1M house bonus.

const TR={board:null,at:0,sendT:0};
const tourneyFee=()=>nice(Math.max(100000,worth()*.02));
const tourneyIn=()=>!!(S.tourney&&TR.board&&S.tourney.week===TR.board.week&&S.tourney.in);
const tourneyScore=()=>Math.round(((S.tourney&&S.tourney.best)||[]).reduce((s,x)=>s+x,0)*10)/10;
function tourneyLoad(force){ if(!(typeof socOn==='function'&&socOn())) return; if(!force&&Date.now()-TR.at<30e3) return; TR.at=Date.now();
  srpc('fg_tourney_board').then(r=>{ if(r&&!r.error){ TR.board=r; if(S.tourney&&S.tourney.week!==r.week){ S.tourney=null; save(); }
    const me=(r.players||[]).find(p=>p.me); if(me&&!(S.tourney&&S.tourney.in)){ S.tourney={week:r.week,in:true,best:[]}; save(); } tourneyChip(); } }).catch(()=>{}); }

// Every slots win counts toward your best 10.
const _slotHeatT=slotHeat;
slotHeat=function(win,bet){ if(win>0&&bet>0&&tourneyIn()){ const T=S.tourney, m=Math.round(win/bet*10)/10; T.best=(T.best||[]).concat(m).sort((a,b)=>b-a).slice(0,10);
    save(); clearTimeout(TR.sendT); TR.sendT=setTimeout(()=>srpc('fg_tourney_score',{p_score:tourneyScore()}).catch(()=>{}),2500); setTimeout(tourneyChip,50); }
  return _slotHeatT(win,bet); };

// The chip under the table limits on the slots screen.
function tourneyChip(){
  let el=document.getElementById('tourneyChip'); const on=S.mode==='casino'&&S.ctab==='slots'&&!(typeof lodgeActive==='function'&&lodgeActive())&&typeof socOn==='function'&&socOn();
  const anchor=on&&(document.getElementById('hotRow')||document.querySelector('#view .tblmin'));
  if(!anchor){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement('button'); el.id='tourneyChip'; el.onclick=tourneyOpen; }
  if(el.previousElementSibling!==anchor) anchor.after(el);
  const B=TR.board, rank=B&&tourneyIn()?(B.players||[]).findIndex(p=>p.me)+1:0;
  el.innerHTML=!B?'🏆 Weekly slots tournament':tourneyIn()?`🏆 Tournament · you <b>${tourneyScore()}</b>${rank?' · #'+rank+' of '+B.players.length:''} · pot ${k$(B.pot)}`:`🏆 Weekly tournament · pot ${k$(B.pot)} · <b>enter ${k$(tourneyFee())}</b>`;
  tourneyLoad(); }
const _renderT=render; render=function(){ _renderT(); tourneyChip(); };

function tourneyOpen(){ const B=TR.board; tourneyLoad(true);
  const rows=(B&&B.players||[]).map((p,i)=>`<div class="tn-row ${p.me?'me':''}"><b>${i+1}</b><span>${esc(p.name)}</span><em>${p.score}</em></div>`).join('');
  modal(`<div class="fgm-k">🏆 Weekly slots tournament</div>
    <div class="tchips"><span style="--d:0ms">🎰 Best 10 wins × bet</span><span style="--d:70ms">🥇 50%</span><span style="--d:140ms">🥈 30%</span><span style="--d:210ms">🥉 20%</span></div>
    <div class="tn-pot">Pot <b>${B?fmt$(B.pot):'…'}</b></div>
    ${tourneyIn()?`<p class="small">Your best wins: ${(S.tourney.best||[]).map(x=>x+'×').join(' · ')||'none yet — spin!'}</p>`:`<button class="btn gold wide" data-a="tourneyJoin" ${tourneyFee()>S.bank?'disabled':''}>Buy in · ${fmt$(tourneyFee())}</button>`}
    <div class="tn-list">${rows||'<p class="small muted">No one has entered yet this week.</p>'}</div>
    ${B&&B.last&&B.last.length?`<p class="small muted">Last week: ${B.last.map((p,i)=>['🥇','🥈','🥉'][i]+' '+esc(p.name)).join(' · ')}</p>`:''}
    <div class="fgm-row"><button class="btn" data-a="closeModal">Close</button></div>`); }
ACT.tourneyJoin=async el=>{ const fee=tourneyFee(); if(fee>S.bank){ toast('Not enough in the bankroll','loss'); return; } el.disabled=true;
  let r=null; try{ if(typeof cloudPush==='function') await cloudPush(); r=await srpc('fg_tourney_join',{p_fee:fee}); }catch(e){}
  if(!r||r.error){ toast({entered:'You’re already in this week',too_much:'Not enough saved yet — try again in a moment'}[r&&r.error]||'Couldn’t reach the server','loss'); el.disabled=false; return; }
  setBank(-fee); S.spent=(S.spent||0)+fee; TR.at=0; await new Promise(res=>{ srpc('fg_tourney_board').then(b=>{ if(b&&!b.error) TR.board=b; res(); }).catch(res); });
  S.tourney={week:TR.board&&TR.board.week,in:true,best:[]}; save(); toast('🏆 You’re in! Every slots win counts now','gold'); tourneyOpen(); tourneyChip(); };

// Prize money.
function tourneyInbox(it){ setBank(it.amount); try{ fx.confetti(180); fx.coins(100,2400); }catch(e){}
  celebrate('🏆 Tournament prize!',`You placed ${String(it.label||'').split(' ·')[0]} in last week’s slots tournament.`,'+'+fmt$(it.amount)); }
