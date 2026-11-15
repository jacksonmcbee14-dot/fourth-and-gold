// Roulette duel: a quick head-to-head round for challenges. 5 spins, 1,000 chips, most chips at the end wins.
// Uses the real wheel numbers and payouts from js/casino/roulette.js. Chips here aren't bankroll money.

const DUEL={on:false,spin:0,chips:1000,bet:'red',amt:100,hist:[],spinning:false,o:null};
const DUEL_BETS=[['red','Red',2],['black','Black',2],['odd','Odd',2],['even','Even',2],['low','1–18',2],['high','19–36',2],['d1','1st 12',3],['d2','2nd 12',3],['d3','3rd 12',3],['n0','Green 0',36]];
const DUEL_SPINS=5;
function openDuel(o){ Object.assign(DUEL,{on:true,spin:0,chips:1000,bet:'red',amt:100,hist:[],spinning:false,o:o||{},last:null,sent:false}); duelDraw(); }
function duelDraw(res){
  const done=DUEL.spin>=DUEL_SPINS||DUEL.chips<=0, amts=[100,250,500,DUEL.chips];
  if(DUEL.amt>DUEL.chips) DUEL.amt=DUEL.chips;
  const col=n=>colOf(n)==='R'?'r':colOf(n)==='Z'?'z':'b';
  modal(`<div class="duel">
    <div class="fgm-k">Roulette duel${DUEL.o.vs?' · '+esc(DUEL.o.vs):''}</div>
    <div class="duel-top"><span>Spin <b>${Math.min(DUEL.spin+1,DUEL_SPINS)}</b> of ${DUEL_SPINS}</span><span>Chips <b class="gold mono" id="duelChips">${DUEL.chips.toLocaleString()}</b></span></div>
    <div class="duel-wheel ${DUEL.last!=null?col(DUEL.last):''}" id="duelNum">${DUEL.last!=null?DUEL.last:'?'}</div>
    <div class="duel-msg" id="duelMsg">${res||(done?'':'Pick a bet and an amount, then spin.')}</div>
    <div class="duel-hist">${DUEL.hist.map(h=>`<span class="${col(h.n)} ${h.win?'w':''}">${h.n}</span>`).join('')}</div>
    ${done?`<div class="duel-end"><div class="cel-t">${DUEL.chips.toLocaleString()} chips</div><p class="small muted" id="duelNote">${DUEL.o.onFinish?'Sending your score…':''}</p>
      <div class="fgm-row"><button class="btn gold" data-a="duelShare">Share</button><button class="btn" data-a="duelClose">Done</button></div></div>`
    :`<div class="duel-bets">${DUEL_BETS.map(([k,l,m])=>`<button class="${DUEL.bet===k?'on':''} ${k==='red'?'r':k==='black'?'b':k==='n0'?'z':''}" data-a="duelBet" data-v="${k}">${l}<small>${m===36?'35:1':m===3?'2:1':'1:1'}</small></button>`).join('')}</div>
      <div class="duel-amts">${amts.map((v,i)=>`<button class="${DUEL.amt===v?'on':''}" data-a="duelAmt" data-v="${v}" ${v>DUEL.chips||v<=0?'disabled':''}>${i===3?'All in':v}</button>`).join('')}</div>
      <button class="btn gold wide" data-a="duelSpin" ${DUEL.spinning?'disabled':''}>Spin · ${DUEL.amt.toLocaleString()} on ${DUEL_BETS.find(b=>b[0]===DUEL.bet)[1]}</button>`}
  </div>`,'duelbox stay');
  if(done&&!DUEL.sent){ DUEL.sent=true; duelFinish(); }
}
async function duelFinish(){
  if(!DUEL.o.onFinish) return; const msg=await DUEL.o.onFinish(DUEL.chips).catch(()=>'Couldn’t send your score.');
  const n=document.getElementById('duelNote'); if(n) n.textContent=msg||'';
}
Object.assign(ACT,{
  duelBet:el=>{ if(DUEL.spinning) return; DUEL.bet=el.dataset.v; duelDraw(); },
  duelAmt:el=>{ if(DUEL.spinning) return; DUEL.amt=+el.dataset.v; duelDraw(); },
  duelSpin:async el=>{
    if(DUEL.spinning||DUEL.amt<=0) return; DUEL.spinning=true; el.disabled=true;
    const n=WHEEL[rint(37)], numEl=document.getElementById('duelNum'), msg=document.getElementById('duelMsg');
    if(msg) msg.textContent='No more bets…';
    for(let i=0;i<14;i++){ const k=WHEEL[rint(37)]; if(numEl){ numEl.textContent=k; numEl.className='duel-wheel spin '+(colOf(k)==='R'?'r':colOf(k)==='Z'?'z':'b'); } tone(700+i*20,.02,'square',.02); await sleep(30+i*i*1.2); }
    const key=DUEL.bet, win=rWins(key,n), mult=key==='n0'?36:/^d\d/.test(key)?3:2;
    const delta=win?DUEL.amt*(mult-1):-DUEL.amt;
    DUEL.chips+=delta; DUEL.spin++; DUEL.last=n; DUEL.hist.push({n,win}); DUEL.spinning=false;
    if(win){ [784,988,1319].forEach((f,i)=>tone(f,.1,'square',.05,i*.07)); } else tone(180,.2,'sawtooth',.03);
    duelDraw(`${n} ${colOf(n)==='R'?'Red':colOf(n)==='Z'?'Green':'Black'} — ${win?'you win '+(DUEL.amt*(mult-1)).toLocaleString()+' chips':'you lose '+DUEL.amt.toLocaleString()}`);
  },
  duelShare:()=>shareCard({game:'duel',title:'Roulette duel',big:DUEL.chips.toLocaleString()+' CHIPS',sub:'Spins: '+DUEL.hist.map(h=>h.n).join(' · ')}),
  duelClose:()=>{ DUEL.on=false; closeModal(); if(S.mode==='league') render(); },
});
