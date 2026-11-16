// Ranks tab and club status
/* ---------- Ranks ---------- */
const TIERS=[['Crown','t0'],['Contender','t1'],['Bubble','t2'],['Long shot','t3']];
const STATUS=[[0,'Walk-on'],[750000,'Rookie'],[1000000,'Starter'],[2000000,'Pro Bowl'],[5000000,'All-Pro'],[10000000,'Hall of Fame'],[25000000,'Owner’s Box']];
function statusFor(n){let i=0;for(let j=0;j<STATUS.length;j++)if(n>=STATUS[j][0])i=j;return i;}
// Where your money came from since your last reset. Football = settled bets; casino = everything else.
// (Net worth always equals $1,000,000 + football + casino, because a reset clears both.)
function plSplit(){
  // Score = cash + open bets − debt. Daily top-ups aren't winnings, so they're left out of the casino figure.
  const net=S.bank+S.bets.filter(b=>b.st==='open').reduce((s,b)=>s+b.stake,0)-(S.debt||0);
  const football=S.bets.reduce((s,b)=>s+(b.st==='won'?b.pay-b.stake:b.st==='lost'?-b.stake:0),0);
  return {net,football,casino:net-START_BANK-football-(S.topups||0)};
}
const signed$=n=>(n>=0?'+':'−')+bank$(Math.abs(n));
function viewRanks(){
  const {net,football,casino}=plSplit(), inCasino=S.mode==='casino';
  const si=statusFor(net), nx=STATUS[si+1];
  const prog=nx?clamp((net-STATUS[si][0])/(nx[0]-STATUS[si][0]),0,1):1;
  const statusCard=card('rankStatus',bank$(net),`You’re ${/^[AEIOU]/.test(STATUS[si][1])?'an':'a'} ${STATUS[si][1]}: ${signed$(casino)} from the casino and ${signed$(football)} from football bets since your last reset.`,
    `<div class="between"><span class="muted">Football picks</span><span class="mono">${S.picks.w}–${S.picks.l}</span></div>
    <div class="bar" style="height:6px"><i style="width:${prog*100}%"></i></div><div class="small muted">${nx?`${bank$(nx[0]-net)} to <span class="gold">${nx[1]}</span>`:'Top of the house.'}</div>`,
    {top:'<div class="eyebrow">Your club status · net worth</div>'});
  let list='';
  if(S.lg==='nfl'){
    const elos=KEYS.map(k=>NFL[k].elo), lo=Math.min(...elos), hi=Math.max(...elos);
    const arr=KEYS.map(k=>({k,t:NFL[k],sc:Math.round(40+59*(NFL[k].elo-lo)/(hi-lo)),p:nflP(k)})).sort((a,b)=>b.sc-a.sc||b.p-a.p);
    list=arr.map((o,i)=>{const ti=o.sc>=94?0:o.sc>=80?1:o.sc>=62?2:3;return `<div class="rank ${o.k===myN()?'me':''}"><span class="no">${i+1}</span>${dotHTML({ab:o.k,col:o.t.col})}<div><div style="font-weight:600">${o.t.c} ${o.t.n}</div><div class="small muted"><span class="tier ${TIERS[ti][1]}">${TIERS[ti][0]}</span> &nbsp;${rec(o.t)} · ${pct(o.p)} playoffs</div></div><span class="score">${o.sc}</span></div>`}).join('');
  } else {
    list=CFB.map(t=>{const a=CFBM.t[t.n];const pr=a.rank/CFBM.n;const mv=Math.round(t.r-pr);const p=a.po/CFBM.n;const ti=p>=.85?0:p>=.45?1:p>=.12?2:3;
      return `<div class="rank ${t.me?'me':''}"><span class="no">${t.unr?'NR':t.r}</span>${dotHTML({ab:t.ab,col:t.col})}<div><div style="font-weight:600">${t.n} <span class="mv ${mv>0?'up':mv<0?'dn':''}">${mv>0?'▲'+mv:mv<0?'▼'+(-mv):''}</span></div><div class="small muted"><span class="tier ${TIERS[ti][1]}">${TIERS[ti][0]}</span> &nbsp;${rec(t)} · ${t.cf}</div></div><span class="score">${pct(p)}</span></div>`}).join('');
  }
  return `${inCasino?'<div class="ghead"><h2 class="serif">Ranks</h2></div>':`<div class="between" style="margin-bottom:18px">${leagueSeg()}</div>`}
  ${statusCard}
  ${typeof boardSection==='function'?boardSection(10):''}
  ${inCasino?`<p class="foot">Casino and football share one bankroll, so the leaderboard counts both. Status climbs as your bankroll grows — Hall of Fame starts at $10M.</p>`:`<div class="sechead"><h2>${S.lg==='nfl'?'Power ratings':'CFP Top 25'}</h2><span class="aside">${S.lg==='nfl'?'Rating out of 99':'Playoff chance'}</span></div>
  <div class="panel" style="padding:4px 8px">${list}</div>
  <p class="foot">${S.lg==='nfl'?'Crown 94+ · Contender 80+ · Bubble 62+ · Long shot below. Rating blends record with the betting market.':'Arrows show where the model expects each team to finish versus today. Crown = 85%+ playoff chance.'}<br>Status climbs as your bankroll grows — Hall of Fame starts at $10M.</p>`}`;
}

