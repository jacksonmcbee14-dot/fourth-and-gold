// 🤵 Butlers: send one off to play for you. He gets house money (5% of your net worth, at least $1M), every win he makes pays double,
// and you keep whatever he ends up ahead (his losses are on the house). Each butler works once a day.
// The first comes with the Mansion (gifted or earned), the second at level 75. Opened from the Home panel.

const BUTLERS=[{name:'Hollis',need:()=>homeTier()>=4,why:'Comes with the Mansion'},{name:'Pemberton',need:()=>myLevel()>=75,why:'Joins at level 75'}];
const butlerStake=()=>nice(Math.max(1e6,worth()*.05));
const butlersHave=()=>BUTLERS.filter(b=>b.need());
function butlerUsed(name){ const d=S.lodge.butlers; return !!(d&&d.day===dayKey()&&(d.used||[]).includes(name)); }
function butlerMark(name){ const day=dayKey(); if(!S.lodge.butlers||S.lodge.butlers.day!==day) S.lodge.butlers={day,used:[]}; S.lodge.butlers.used.push(name); }

// Each job: a list of rounds the butler plays. Every round returns [line, change]; wins are already doubled.
const pick=a=>a[Math.floor(Math.random()*a.length)];
const BJOBS={
  slots:{label:'🎰 Slots',rounds:K=>Array.from({length:20},(_,i)=>{ const bet=K*50000, r=Math.random();
    const sym=['🍒','🍋','🔔','⭐','💎','7️⃣'], m=r<.004?50:r<.019?10:r<.049?5:r<.109?3:r<.179?2:0;
    const reel=m?Array(3).fill({2:'🍒',3:'🔔',5:'⭐',10:'💎',50:'7️⃣'}[m]).join(''):[pick(sym),pick(sym),pick(sym)].join('');
    return m?[`Spin ${i+1}: ${reel} — ${m}× ×2`,bet*m*2-bet]:[`Spin ${i+1}: ${reel}`,-bet]; })},
  blackjack:{label:'🃏 Blackjack',rounds:K=>Array.from({length:20},(_,i)=>{ const bet=K*50000, r=Math.random();
    if(r<.045) return [`Hand ${i+1}: Blackjack! ×2`,bet*1.5*2];
    if(r<.47) return [`Hand ${i+1}: ${17+Math.floor(Math.random()*4)} beats the dealer ×2`,bet*2];
    if(r<.56) return [`Hand ${i+1}: Push`,0];
    return [`Hand ${i+1}: ${Math.random()<.4?'Bust':'Dealer wins'}`,-bet]; })},
  roulette:{label:'🎡 Roulette',rounds:K=>Array.from({length:20},(_,i)=>{ const bet=K*50000, n=Math.floor(Math.random()*37), red=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n);
    return red?[`Spin ${i+1}: ${n} red — win ×2`,bet*2]:[`Spin ${i+1}: ${n} ${n?'black':'green'}`,-bet]; })},
  golf:{label:'⛳ Golf',rounds:K=>Array.from({length:9},(_,i)=>{ const bet=K*100000, r=Math.random(), par=pick([3,4,4,5]);
    if(r<.04) return [`Hole ${i+1} (par ${par}): Eagle! ×2`,bet*4*2];
    if(r<.25) return [`Hole ${i+1} (par ${par}): Birdie ×2`,bet*2];
    if(r<.72) return [`Hole ${i+1} (par ${par}): Par`,0];
    return [`Hole ${i+1} (par ${par}): Bogey`,-bet]; })},
};

function butlerSection(){
  const have=butlersHave();
  const rows=BUTLERS.map(b=>{ const ok=b.need(), used=ok&&butlerUsed(b.name);
    return `<div class="lg-home-row ${ok?(used?'done':'on'):''}"><span>🤵</span><b>${esc(b.name)}</b><small>${ok?(used?'Back tomorrow':'Ready'):esc(b.why)}</small></div>`; }).join('');
  const ready=have.find(b=>!butlerUsed(b.name));
  return `<div class="lg-home-h">BUTLERS</div>
    <div class="lg-prev-desc">${have.length?`Send a butler to play for you. He gets <b>${k$(butlerStake())}</b> of house money (5% of your net worth) and <b>every win pays double</b>. You keep everything he wins; his losses are on the house. Each butler works once a day.`:'Your first butler comes with the Mansion. He plays for you with house money, and every win pays double.'}</div>
    ${rows}
    ${ready?`<div class="lg-rooms">${Object.entries(BJOBS).map(([k,j])=>`<button class="lg-btn lg-gold" data-lg="butlerGo" data-v="${k}">${j.label}</button>`).join('')}</div>`:''}`;
}
const _homeOpenB=homeOpen;
homeOpen=function(){ _homeOpenB(); const body=LODGE.el&&LODGE.el.querySelector('.lg-home .lg-shop-body'); if(!body) return;
  const all=[...body.querySelectorAll('.lg-home-h')].find(h=>h.textContent==='ALL HOMES'); const wrap=document.createElement('div'); wrap.innerHTML=butlerSection();
  [...wrap.childNodes].forEach(n=>body.insertBefore(n,all||null)); };

function butlerGo(job){
  const b=butlersHave().find(x=>!butlerUsed(x.name)), J=BJOBS[job]; if(!b||!J) return;
  butlerMark(b.name); save();
  const stake=butlerStake(), rounds=J.rounds(stake/1e6); let bal=stake, wins=0;
  closeShop(); const box=document.createElement('div'); box.className='lg-shop lg-home lg-butler';
  box.innerHTML=`<div class="lg-shop-head"><span class="lg-dlg-who">🤵 ${esc(b.name.toUpperCase())} · ${esc(J.label.toUpperCase())}</span><button class="lg-btn lg-round" data-lg="shopClose" aria-label="Close">X</button></div>
    <div class="lg-shop-body"><div class="lg-prev-desc">“Very good. I’ll take the house’s ${k$(stake)} and see what I can do.”</div><div class="bt-log"></div><div class="bt-bal">Balance: ${k$(bal)}</div><div class="bt-end"></div></div>`;
  LODGE.el.querySelector('.lg-stage').appendChild(box);
  const log=box.querySelector('.bt-log'), balEl=box.querySelector('.bt-bal');
  let i=0; const step=()=>{ if(!document.body.contains(box)){ finish(true); return; }
    if(i>=rounds.length){ finish(false); return; }
    const [line,ch]=rounds[i++]; bal=Math.max(0,bal+ch); if(ch>0) wins++;
    const el=document.createElement('div'); el.className='bt-line '+(ch>0?'win':ch<0?'loss':''); el.textContent=line+(ch?` (${ch>0?'+':'−'}${k$(Math.abs(ch))})`:''); log.appendChild(el); log.scrollTop=log.scrollHeight;
    balEl.textContent='Balance: '+k$(bal); if(ch>0) tone(660+Math.min(600,ch/5000),.06,'square',.03);
    setTimeout(step,bal<=0?10:260); };
  let done=false;
  function finish(silent){ if(done) return; done=true;
    // play out whatever was left if the panel was closed early
    while(i<rounds.length&&bal>0){ const [,ch]=rounds[i++]; bal=Math.max(0,bal+ch); if(ch>0) wins++; }
    const profit=Math.max(0,Math.round(bal-stake));
    if(profit>0) setBank(profit);
    S.lodge.butlerLog=[{at:Date.now(),name:b.name,job,profit}].concat(S.lodge.butlerLog||[]).slice(0,10); save();
    const msg=profit>0?`${b.name} turned the house’s ${k$(stake)} into ${k$(bal)}. You keep ${fmt$(profit)}.`:`${b.name} came back with ${k$(bal)} — no profit today, but it cost you nothing.`;
    if(silent){ toast('🤵 '+(profit>0?`${b.name} won you ${k$(profit)}`:`${b.name} broke even — nothing lost`),profit>0?'win':'gold'); return; }
    box.querySelector('.bt-end').innerHTML=`<div class="lg-prev-desc"><b>${esc(msg)}</b></div><button class="lg-btn lg-gold" data-lg="homeOpen">Back home</button>`;
    if(profit>0) tone(988,.15,'square',.05); }
  setTimeout(step,500);
}
Object.assign(LG_ACT,{ butlerGo:b=>butlerGo(b.dataset.v) });

// A butler's still-unused today? Put a little bell on the Home button.
setInterval(()=>{ const btn=document.getElementById('lgHome'); if(!btn) return; const n=butlersHave().filter(b=>!butlerUsed(b.name)).length; const t=n?'Home 🤵':'Home'; if(btn.textContent!==t) btn.textContent=t; },2000);
