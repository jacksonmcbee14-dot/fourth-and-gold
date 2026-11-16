// Money rules: a daily top-up to $1,000,000, borrowing (debt — any amount up to $250,000 a loan), and what a reset wipes.
// Your score (leaderboard, status) = cash + money riding on open bets − debt.

const LOAN=250000, MAX_DEBT=5000000;
const dayKey=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const openStakes=()=>S.bets.filter(b=>b.st==='open').reduce((s,b)=>s+b.stake,0);
const scoreNow=()=>Math.round(S.bank+(S.safe||0)+openStakes()-(S.debt||0)+(typeof assetValue==='function'?assetValue():0));   // + what your stuff is worth (js/perks.js)

// Each new day, anyone below $1,000,000 cash is topped back up to $1,000,000. (Debt stays until repaid.)
function dailyTopUp(){
  const k=dayKey(); if(S.topDay===k) return;
  S.topDay=k;
  if(S.bank<START_BANK){ const add=START_BANK-Math.round(S.bank); S.topups=(S.topups||0)+add; S.bank=START_BANK;
    setTimeout(()=>toast('New day — bankroll topped up to $1,000,000','gold'),900); }
  save();
}
setInterval(()=>{ if(S.topDay!==dayKey()){ dailyTopUp(); render(); } },60e3);

// Winnings pay back debt first.
function repay(amount){ if(!(amount>0)||!(S.debt>0)) return 0; const r=Math.min(S.debt,amount); S.debt-=r; if(!S.debt) setTimeout(()=>toast('Debt paid off!','win'),300); return r; }
const _setBank=setBank;
setBank=function(delta){ if(delta>0) delta-=repay(delta); _setBank(delta); };
const _settleBets=settleBets;
settleBets=function(){ const before=S.bank; _settleBets(); const gain=S.bank-before; if(gain>0&&S.debt>0){ S.bank-=repay(gain); save(); const el=$('#bankVal'); if(el) el.textContent=bank$(S.bank); } };

// A reset starts completely fresh: bets, debt and all lodge gear are wiped. (Levels and XP stay.)
function wipeForReset(){
  S.debt=0; S.topups=0;
  if(S.lodge){ S.lodge.owned=[]; S.lodge.outfit={}; S.lodge.room=[]; }
}

Object.assign(ACT,{
  // Borrow any amount you like, up to $250,000 at a time.
  borrow:()=>{ const inp=$('#borrowAmt'), amt=Math.round(+((inp&&inp.value)||'').replace(/\D/g,''));
    if(!(amt>0)){toast('Enter how much to borrow','loss');return;}
    if(amt>LOAN){toast('You can borrow up to '+fmt$(LOAN)+' at a time','loss');return;}
    if((S.debt||0)+amt>MAX_DEBT){toast('You can owe at most '+k$(MAX_DEBT),'loss');return;}
    S.debt=(S.debt||0)+amt; S.bank+=amt; save(); closeSheet(); render(); toast('Borrowed '+fmt$(amt)+' — winnings pay it back','gold'); },
  borrowPick:el=>{ const i=$('#borrowAmt'); if(i) i.value=(+el.dataset.v).toLocaleString('en-US'); },
});
const _reset=ACT.reset;
ACT.reset=el=>{ if(!confirm('Reset to $1,000,000? This wipes your bets, your debt and ALL your lodge gear (clothes, accessories and room decor). Your level stays. It also counts as a reset on the leaderboard.')) return; wipeForReset(); _reset(el); };
// The bankroll sheet gains your debt and the Borrow button.
const _bankSheet2=ACT.bankSheet;
ACT.bankSheet=el=>{ _bankSheet2(el);
  const d=S.debt||0;
  $('#sheet').insertAdjacentHTML('beforeend',`<div class="divider" style="margin:16px 0"></div>
  <div class="between"><span class="small muted">${d?`You owe <b style="color:var(--loss-hi)">${fmt$(d)}</b>. Winnings pay it back first.`:'Low on money but don’t want to reset? Borrow instead — your gear stays.'}</span></div>
  <div class="small muted" style="margin:10px 0 6px">Borrow any amount, up to $250,000 at a time</div>
  <div style="display:flex;gap:8px;margin-bottom:8px">${[10000,50000,100000,250000].map(v=>`<button class="btn" style="flex:1;padding:8px 0" data-a="borrowPick" data-v="${v}">${k$(v)}</button>`).join('')}</div>
  <input class="input" id="borrowAmt" inputmode="numeric" value="250,000" aria-label="Amount to borrow" style="margin-bottom:8px">
  <button class="btn wide" data-a="borrow">Borrow</button>
  <p class="small muted" style="text-align:center">What you owe counts against your leaderboard score. Each new day, cash below $1,000,000 is topped back up.</p>`);
};
