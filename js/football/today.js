// Today: your teams' next games, one suggested bet, your bankroll and your open bets. Nothing else.

function nextMyGame(lg){
  const gs=allGames(lg).filter(g=>g.mine&&g.s!=='final'&&g.s!=='await');
  return gs.find(g=>g.s==='live'||g.s==='inprog')||gs[0]||null;
}
function suggestion(){
  const gs=allGames().filter(betable); if(!gs.length) return null;
  const g=gs.find(x=>x.mine)||gs.slice().sort((a,b)=>importance(b)-importance(a))[0];
  const M=market(g), me=g.mine?(g.lg==='nfl'?myN():myC()):null;
  const s=me?(g.h.ab===me?'h':'a'):(M.ph>=.5?'h':'a');
  const o=s==='h'?M.mlH:M.mlA, t=s==='h'?g.h:g.a, op=s==='h'?g.a:g.h;
  const stake=Math.max(1000,Math.min(250000,Math.round(S.bank*.02/1000)*1000));
  return {g,s,o,t,op,stake,win:Math.round(payoutFor(stake,o)-stake)};
}
function todayGame(lg){
  const g=nextMyGame(lg), K=lg==='nfl'?myN():myC(), team=lg==='nfl'?NFL[K].n:meC().n;
  const top=`<button class="eyebrow" data-a="teamSheet">${esc(lg==='nfl'?NFL[K].c+' '+NFL[K].n:meC().n)} · next game ›</button>`;
  if(!g) return card('',`—`,`No upcoming ${esc(team)} game on the schedule yet.`,'',{top});
  const meA=g.a.ab===K, me=meA?g.a:g.h, op=meA?g.h:g.a, the=lg==='nfl'?'the ':'', The=lg==='nfl'?'The ':'';
  if(g.s==='live'&&g.as!=null){
    const ms=meA?g.as:g.hs, os=meA?g.hs:g.as;
    return card('',`${ms}–${os}`,`${The}${esc(me.name)} ${ms>os?'lead':ms<os?'trail':'are tied with'} ${the}${esc(op.name)}${g.clock?' · '+esc(g.clock):''}.`,'',{top,after:whyHTML(g)});
  }
  const M=market(g), p=meA?1-M.ph:M.ph;
  return card('',pct(p),`${The}${esc(poss(me.name))} chance to beat ${the}${esc(op.name)} — ${esc(when(g.t,g.tba))}${g.tv?' on '+esc(g.tv):''}.`,'',{top,after:whyHTML(g)});
}
function viewToday(){
  const sg=suggestion(), open=S.bets.filter(b=>b.st==='open');
  const net=S.bank+open.reduce((s,b)=>s+b.stake,0), si=statusFor(net), nx=STATUS[si+1];
  const board=typeof PROF!=='undefined'&&PROF.me&&PROF.board?PROF.board.findIndex(p=>p.name.trim().toLowerCase()===PROF.me.name.trim().toLowerCase()):-1;
  const sugCard=!sg?card('','—','No games are open for betting right now.',''):
    card('',`+${fmt$(sg.win)}`,`Bet ${fmt$(sg.stake)} on ${sg.g.lg==='nfl'?'the ':''}${esc(sg.t.name)} to beat ${sg.g.lg==='nfl'?'the ':''}${esc(sg.op.name)} and win ${fmt$(sg.win)}.`,'',
      {top:`<div class="eyebrow">Suggested bet · ${term('moneyline','moneyline')}</div>`,after:`<button class="btn gold wide" data-a="suggest" ${sg.stake>S.bank?'disabled':''}>${sg.stake>S.bank?'Not enough in bankroll':'Add to bet slip'}</button>`});
  const bankCard=card('',fmt$(S.bank),`You’re ${/^[AEIOU]/.test(STATUS[si][1])?'an':'a'} ${STATUS[si][1]}${nx?` — ${fmt$(nx[0]-net)} more to reach ${nx[1]}`:''}${board>=0?`, and #${board+1} on the leaderboard`:''}.`,'',
    {top:`<div class="eyebrow">Bankroll</div>`});
  const toWin=open.reduce((s,b)=>s+b.pay-b.stake,0);
  const betsCard=card('',String(open.length),open.length?`Open bet${open.length>1?'s':''} with ${fmt$(open.reduce((s,b)=>s+b.stake,0))} at stake that could win ${fmt$(toWin)}.`:'No open bets — the suggested bet above is an easy place to start.','',
    {top:`<div class="eyebrow">Open bets</div>`,after:open.length?`<div class="tlist">${open.slice(-3).reverse().map(b=>`<div class="between"><span>${b.legs.length>1?b.legs.length+'-leg parlay':esc(b.legs[0].label)}</span><span class="mono gold">+${fmt$(b.pay-b.stake)}</span></div>`).join('')}</div><button class="btn ghost wide" data-a="myBets">See all your bets</button>`:''});
  return `<div class="todaygrid">${todayGame('nfl')}${todayGame('cfb')}${sugCard}${bankCard}${betsCard}</div>`;
}
Object.assign(ACT,{ myBets:()=>{S.ftab='bets';S.btab='mine';save();scrollTo(0,0);render();} });
