// Ranks tab and club status
/* ---------- Ranks ---------- */
const TIERS=[['Crown','t0'],['Contender','t1'],['Bubble','t2'],['Long shot','t3']];
const STATUS=[[0,'Walk-on'],[750000,'Rookie'],[1000000,'Starter'],[2000000,'Pro Bowl'],[5000000,'All-Pro'],[10000000,'Hall of Fame'],[25000000,'Owner’s Box']];
function statusFor(n){let i=0;for(let j=0;j<STATUS.length;j++)if(n>=STATUS[j][0])i=j;return i;}
function viewRanks(){
  const net=S.bank+S.bets.filter(b=>b.st==='open').reduce((s,b)=>s+b.stake,0);
  const si=statusFor(net), nx=STATUS[si+1];
  const prog=nx?clamp((net-STATUS[si][0])/(nx[0]-STATUS[si][0]),0,1):1;
  const statusCard=`<div class="status"><div class="eyebrow" style="color:var(--goldd)">Your club status</div><h3>${STATUS[si][1]}</h3><div class="between small"><span class="muted">Net worth <span class="mono" style="color:var(--text)">${fmt$(net)}</span></span><span class="muted">Picks <span class="mono" style="color:var(--text)">${S.picks.w}–${S.picks.l}</span></span></div><div class="bar" style="margin-top:12px;height:6px"><i style="width:${prog*100}%"></i></div><div class="small muted" style="margin-top:6px">${nx?`${fmt$(nx[0]-net)} to <span class="gold">${nx[1]}</span>`:'Top of the house.'}</div></div>`;
  let list='';
  if(S.lg==='nfl'){
    const elos=KEYS.map(k=>NFL[k].elo), lo=Math.min(...elos), hi=Math.max(...elos);
    const arr=KEYS.map(k=>({k,t:NFL[k],sc:Math.round(40+59*(NFL[k].elo-lo)/(hi-lo)),p:nflP(k)})).sort((a,b)=>b.sc-a.sc||b.p-a.p);
    list=arr.map((o,i)=>{const ti=o.sc>=94?0:o.sc>=80?1:o.sc>=62?2:3;return `<div class="rank ${o.k===myN()?'me':''}"><span class="no">${i+1}</span>${dotHTML({ab:o.k,col:o.t.col})}<div><div style="font-weight:600">${o.t.c} ${o.t.n}</div><div class="small muted"><span class="tier ${TIERS[ti][1]}">${TIERS[ti][0]}</span> &nbsp;${rec(o.t)} · ${pct(o.p)} playoffs</div></div><span class="score">${o.sc}</span></div>`}).join('');
  } else {
    list=CFB.map(t=>{const a=CFBM.t[t.n];const pr=a.rank/CFBM.n;const mv=Math.round(t.r-pr);const p=a.po/CFBM.n;const ti=p>=.85?0:p>=.45?1:p>=.12?2:3;
      return `<div class="rank ${t.me?'me':''}"><span class="no">${t.unr?'NR':t.r}</span>${dotHTML({ab:t.ab,col:t.col})}<div><div style="font-weight:600">${t.n} <span class="mv ${mv>0?'up':mv<0?'dn':''}">${mv>0?'▲'+mv:mv<0?'▼'+(-mv):''}</span></div><div class="small muted"><span class="tier ${TIERS[ti][1]}">${TIERS[ti][0]}</span> &nbsp;${rec(t)} · ${t.cf}</div></div><span class="score">${pct(p)}</span></div>`}).join('');
  }
  return `<div class="between" style="margin-bottom:14px">${leagueSeg()}<span class="eyebrow">Club ratings</span></div>
  ${statusCard}
  ${typeof boardSection==='function'?boardSection(10):''}
  <div class="sechead"><h2>${S.lg==='nfl'?'Power ratings':'CFP Top 25'}</h2><span class="aside">${S.lg==='nfl'?'Rating out of 99':'Playoff chance'}</span></div>
  <div class="panel" style="padding:4px 8px">${list}</div>
  <p class="foot">${S.lg==='nfl'?'Crown 94+ · Contender 80+ · Bubble 62+ · Long shot below. Rating blends record with the betting market.':'Arrows show where the model expects each team to finish versus today. Crown = 85%+ playoff chance.'}<br>Status climbs as your bankroll grows — Hall of Fame starts at $10M.</p>`;
}

