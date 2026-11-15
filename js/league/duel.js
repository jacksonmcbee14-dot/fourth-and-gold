// Casino duels: quick head-to-head rounds for challenges. Everyone starts with 1,000 chips;
// most chips at the end wins. Chips here aren't bankroll money.
//   Roulette 5 spins · Blackjack 5 hands · Video poker 5 hands · Slots 10 spins · Craps 5 rounds
// Uses the real wheel and payouts (roulette.js), card values (blackjack.js) and hand ranks (poker.js).

const DUEL_GAMES={
  roulette:{name:'Roulette duel',rounds:5,unit:'spin'},
  blackjack:{name:'Blackjack duel',rounds:5,unit:'hand'},
  poker:{name:'Video poker duel',rounds:5,unit:'hand'},
  slots:{name:'Slots duel',rounds:10,unit:'spin'},
  craps:{name:'Craps duel',rounds:5,unit:'round'},
};
const DUEL={game:'roulette',round:0,chips:1000,amt:100,busy:false,o:{},sent:false,msg:'',st:{}};
function openDuel(o){
  o=o||{}; Object.assign(DUEL,{game:DUEL_GAMES[o.game]?o.game:'roulette',round:0,chips:1000,amt:100,busy:false,o,sent:false,msg:'',st:{}});
  DUEL_PLAY[DUEL.game].init(DUEL.st); duelDraw();
}
const duelDone=()=>DUEL.round>=DUEL_GAMES[DUEL.game].rounds||DUEL.chips<=0;
// Shared frame: title, round counter, chips, the game's own table, the bet amount, and the end screen.
function duelDraw(){
  const G=DUEL_GAMES[DUEL.game], P=DUEL_PLAY[DUEL.game], mid=P.mid(DUEL.st), done=duelDone()&&!mid;
  if(DUEL.amt>DUEL.chips) DUEL.amt=DUEL.chips;
  const amts=[50,100,250,DUEL.chips], betting=!mid&&!DUEL.busy;
  modal(`<div class="duel">
    <div class="fgm-k">${G.name}${DUEL.o.vs?' · '+esc(DUEL.o.vs):''}</div>
    <div class="duel-top"><span>${G.unit[0].toUpperCase()+G.unit.slice(1)} <b>${Math.min(DUEL.round+(done?0:1),G.rounds)}</b> of ${G.rounds}</span><span>Chips <b class="gold mono">${DUEL.chips.toLocaleString()}</b></span></div>
    <div class="duel-table">${P.table(DUEL.st)}</div>
    <div class="duel-msg">${esc(DUEL.msg||'')}</div>
    ${done?`<div class="duel-end"><div class="cel-t">${DUEL.chips.toLocaleString()} chips</div><p class="small muted" id="duelNote">${DUEL.o.onFinish?'Sending your score…':'Practice round'}</p>
      <div class="fgm-row"><button class="btn gold" data-a="duelShare">Share</button><button class="btn" data-a="duelClose">Done</button></div></div>`
    :`${P.picks?P.picks(DUEL.st,betting):''}
      ${betting?`<div class="duel-amts">${amts.map((v,i)=>`<button class="${DUEL.amt===v?'on':''}" data-a="duelAmt" data-v="${v}" ${v>DUEL.chips||v<=0?'disabled':''}>${i===3?'All in':v}</button>`).join('')}</div>`:''}
      <div class="duel-acts">${P.actions(DUEL.st,betting)}</div>`}
  </div>`,'duelbox stay');
  if(done&&!DUEL.sent){ DUEL.sent=true; duelFinish(); }
}
async function duelFinish(){
  if(!DUEL.o.onFinish) return; const msg=await DUEL.o.onFinish(DUEL.chips).catch(()=>'Couldn’t send your score.');
  const n=document.getElementById('duelNote'); if(n) n.textContent=msg||'';
}
// One round is over: move the chips and say what happened.
function duelSettle(delta,msg){
  DUEL.chips=Math.max(0,DUEL.chips+delta); DUEL.round++; DUEL.busy=false;
  DUEL.msg=msg+(delta>0?` · +${delta.toLocaleString()}`:delta<0?` · −${(-delta).toLocaleString()}`:' · push');
  if(delta>0) [784,988,1319].forEach((f,i)=>tone(f,.1,'square',.05,i*.07)); else if(delta<0) tone(180,.2,'sawtooth',.03);
  duelDraw();
}
const dbtn=(a,label,cls,dis,v)=>`<button class="btn ${cls||''}" data-a="${a}" ${v?`data-v="${v}"`:''} ${dis?'disabled':''}>${label}</button>`;
const cardsRow=(cs,hideSecond)=>`<div class="duel-cards">${cs.map((c,i)=>cardHTML(c,{back:hideSecond&&i===1})).join('')}</div>`;

const DUEL_PLAY={
  /* ---- Roulette: one spin, one bet ---- */
  roulette:{
    BETS:[['red','Red',2],['black','Black',2],['odd','Odd',2],['even','Even',2],['low','1–18',2],['high','19–36',2],['d1','1st 12',3],['d2','2nd 12',3],['d3','3rd 12',3],['n0','Green 0',36]],
    init:s=>Object.assign(s,{bet:'red',last:null,hist:[]}), mid:()=>false,
    table:s=>{ const col=n=>colOf(n)==='R'?'r':colOf(n)==='Z'?'z':'b';
      return `<div class="duel-wheel ${s.last!=null?col(s.last):''}" id="duelNum">${s.last!=null?s.last:'?'}</div><div class="duel-hist">${s.hist.map(h=>`<span class="${col(h.n)} ${h.win?'w':''}">${h.n}</span>`).join('')}</div>`; },
    picks:(s,on)=>on?`<div class="duel-bets">${DUEL_PLAY.roulette.BETS.map(([k,l,m])=>`<button class="${s.bet===k?'on':''} ${k==='red'?'r':k==='black'?'b':k==='n0'?'z':''}" data-a="duelPick" data-v="${k}">${l}<small>${m===36?'35:1':m===3?'2:1':'1:1'}</small></button>`).join('')}</div>`:'',
    actions:(s,on)=>dbtn('duelGo',`Spin · ${DUEL.amt.toLocaleString()} on ${DUEL_PLAY.roulette.BETS.find(b=>b[0]===s.bet)[1]}`,'gold wide',!on),
    go:async s=>{ const n=WHEEL[rint(37)], el=()=>document.getElementById('duelNum');
      for(let i=0;i<14;i++){ const k=WHEEL[rint(37)], e=el(); if(e){ e.textContent=k; e.className='duel-wheel spin '+(colOf(k)==='R'?'r':colOf(k)==='Z'?'z':'b'); } tone(700+i*20,.02,'square',.02); await sleep(30+i*i*1.2); }
      const win=rWins(s.bet,n), m=s.bet==='n0'?36:/^d\d/.test(s.bet)?3:2; s.last=n; s.hist.push({n,win});
      duelSettle(win?DUEL.amt*(m-1):-DUEL.amt,`${n} ${colOf(n)==='R'?'Red':colOf(n)==='Z'?'Green':'Black'}`); },
  },
  /* ---- Blackjack: hit, stand or double against the dealer (dealer stands on 17, blackjack pays 3:2) ---- */
  blackjack:{
    init:s=>Object.assign(s,{shoe:newDeck(6),me:[],dl:[],phase:'bet',bet:0}), mid:s=>s.phase==='play',
    table:s=>s.me.length?`<div class="small muted">Dealer${s.phase==='play'?'':' · '+hv(s.dl).t}</div>${cardsRow(s.dl,s.phase==='play')}<div class="small muted">You · ${hv(s.me).t}${s.bet?' · bet '+s.bet.toLocaleString():''}</div>${cardsRow(s.me)}`:'<div class="duel-empty">🃏 Beat the dealer. Blackjack pays 3:2. Dealer stands on 17.</div>',
    actions:(s,on)=>s.phase==='play'?dbtn('duelBj','Hit','',false,'hit')+dbtn('duelBj','Stand','gold',false,'stand')+(s.me.length===2&&DUEL.chips>=s.bet*2?dbtn('duelBj','Double','',false,'double'):'')
      :dbtn('duelGo',`Deal · ${DUEL.amt.toLocaleString()}`,'gold wide',!on),
    draw:s=>{ if(s.shoe.length<20) s.shoe=newDeck(6); return s.shoe.pop(); },
    go:s=>{ const P=DUEL_PLAY.blackjack; s.bet=DUEL.amt; s.me=[P.draw(s),P.draw(s)]; s.dl=[P.draw(s),P.draw(s)];
      if(isBJ(s.me)||isBJ(s.dl)){ s.phase='done'; const both=isBJ(s.me)&&isBJ(s.dl); return duelSettle(both?0:isBJ(s.me)?Math.floor(s.bet*1.5):-s.bet,both?'Both blackjack':isBJ(s.me)?'Blackjack!':'Dealer blackjack'); }
      s.phase='play'; DUEL.msg='Hit, stand or double?'; },
    act:(s,a)=>{ if(s.phase!=='play') return; const P=DUEL_PLAY.blackjack;
      if(a==='double'){ s.bet*=2; s.me.push(P.draw(s)); }
      else if(a==='hit'){ s.me.push(P.draw(s)); if(hv(s.me).t<21){ duelDraw(); return; } }
      const me=hv(s.me).t; s.phase='done';
      if(me>21) return duelSettle(-s.bet,'Bust with '+me);
      while(hv(s.dl).t<17) s.dl.push(P.draw(s));
      const d=hv(s.dl).t; duelSettle(d>21||me>d?s.bet:me<d?-s.bet:0,d>21?'Dealer busts with '+d:`${me} vs dealer ${d}`); },
  },
  /* ---- Video poker: Jacks or Better, hold and draw ---- */
  poker:{
    init:s=>Object.assign(s,{hand:[],held:[],deck:[],phase:'bet'}), mid:s=>s.phase==='draw',
    table:s=>s.hand.length?`<div class="duel-cards">${s.hand.map((c,i)=>`<button class="duel-hold ${s.held[i]?'h':''}" data-a="duelHold" data-i="${i}" ${s.phase!=='draw'?'disabled':''}>${cardHTML(c)}<span>${s.held[i]?'HELD':s.phase==='draw'?'tap':''}</span></button>`).join('')}</div>`
      :`<div class="duel-empty">🂡 Jacks or Better · ${PAY.slice(0,6).map(p=>p[0]+' '+p[1]+'×').join(' · ')}</div>`,
    actions:(s,on)=>s.phase==='draw'?dbtn('duelGo','Draw','gold wide'):dbtn('duelGo',`Deal · ${DUEL.amt.toLocaleString()}`,'gold wide',!on),
    go:s=>{ if(s.phase==='draw'){ s.hand=s.hand.map((c,i)=>s.held[i]?c:s.deck.pop()); s.phase='done';
        const r=evalHand(s.hand); return duelSettle(r<0?-DUEL.amt:DUEL.amt*(PAY[r][1]-1),r<0?'No pair':PAY[r][0]); }
      s.deck=newDeck(1); s.hand=[0,1,2,3,4].map(()=>s.deck.pop()); s.held=[false,false,false,false,false]; s.phase='draw'; DUEL.msg='Tap cards to hold, then draw.'; },
  },
  /* ---- Slots: three reels ---- */
  slots:{
    SYM:[['🍒',30,5],['🍋',25,8],['🔔',18,15],['⭐',12,30],['7️⃣',8,75],['💎',4,250]],
    pick(){ const L=this.SYM, tot=L.reduce((a,b)=>a+b[1],0); let r=rng()*tot; for(const s of L){ if((r-=s[1])<0) return s; } return L[0]; },
    init:s=>Object.assign(s,{reels:['❔','❔','❔']}), mid:()=>false,
    table:s=>`<div class="duel-reels" id="duelReels">${s.reels.map(r=>`<span>${r}</span>`).join('')}</div><div class="duel-empty small">3 in a row: 🍒5× 🍋8× 🔔15× ⭐30× 7️⃣75× 💎250× · two 🍒 pays 2×</div>`,
    actions:(s,on)=>dbtn('duelGo',`Spin · ${DUEL.amt.toLocaleString()}`,'gold wide',!on),
    go:async s=>{ const P=DUEL_PLAY.slots, res=[P.pick(),P.pick(),P.pick()], box=()=>document.getElementById('duelReels');
      for(let i=0;i<16;i++){ const b=box(); if(b) b.innerHTML=[0,1,2].map(k=>`<span>${i>=6+k*4?res[k][0]:P.SYM[rint(6)][0]}</span>`).join(''); tone(500+i*25,.02,'square',.02); await sleep(55); }
      s.reels=res.map(r=>r[0]); const three=res[0]===res[1]&&res[1]===res[2], cher=res.filter(r=>r[0]==='🍒').length;
      const mult=three?res[0][2]:cher===2?2:0; duelSettle(mult?DUEL.amt*(mult-1):-DUEL.amt,three?'Three '+res[0][0]+'!':cher===2?'Two cherries':'No win'); },
  },
  /* ---- Craps: pass line, don't pass, or a one-roll field bet ---- */
  craps:{
    BETS:[['pass','Pass line','7 or 11 wins'],['dp','Don’t pass','2 or 3 wins'],['field','Field','one roll']],
    init:s=>Object.assign(s,{bet:'pass',point:null,dice:[3,4],phase:'bet'}), mid:s=>s.phase==='point',
    table:s=>`<div class="duel-dice" id="duelDice">${dieHTML(s.dice[0])}${dieHTML(s.dice[1])}</div><div class="duel-empty small">${s.point?`Point is <b>${s.point}</b> — roll it again before a 7`:s.bet==='field'?'Field wins on 2, 3, 4, 9, 10, 11, 12 (2 and 12 pay double)':'Come-out: 7 or 11 wins Pass, 2, 3 or 12 loses. Anything else sets a point.'}</div>`,
    picks:(s,on)=>on?`<div class="duel-bets three">${DUEL_PLAY.craps.BETS.map(([k,l,sub])=>`<button class="${s.bet===k?'on':''}" data-a="duelPick" data-v="${k}">${l}<small>${sub}</small></button>`).join('')}</div>`:'',
    actions:(s,on)=>s.phase==='point'?dbtn('duelGo',`Roll for ${s.point}`,'gold wide',DUEL.busy):dbtn('duelGo',`Roll · ${DUEL.amt.toLocaleString()} on ${DUEL_PLAY.craps.BETS.find(b=>b[0]===s.bet)[1]}`,'gold wide',!on),
    go:async s=>{ const box=()=>document.getElementById('duelDice');
      for(let i=0;i<10;i++){ const b=box(); if(b) b.innerHTML=dieHTML(1+rint(6),'roll')+dieHTML(1+rint(6),'roll'); tone(300+i*30,.02,'square',.02); await sleep(60); }
      s.dice=[1+rint(6),1+rint(6)]; const t=s.dice[0]+s.dice[1], A=DUEL.amt;
      if(s.bet==='field') return duelSettle([2,3,4,9,10,11,12].includes(t)?A*(t===2||t===12?2:1):-A,'Rolled '+t);
      if(s.phase!=='point'){
        if(t===7||t===11) return duelSettle(s.bet==='pass'?A:-A,'Rolled '+t);
        if(t===2||t===3) return duelSettle(s.bet==='pass'?-A:A,'Craps '+t);
        if(t===12) return duelSettle(s.bet==='pass'?-A:0,'Craps 12');
        s.point=t; s.phase='point'; DUEL.msg='Point is '+t+'. Keep rolling.'; return; }
      if(t===s.point){ s.point=null; s.phase='bet'; return duelSettle(s.bet==='pass'?A:-A,'Hit the point '+t); }
      if(t===7){ const p=s.point; s.point=null; s.phase='bet'; return duelSettle(s.bet==='pass'?-A:A,'Seven out (point '+p+')'); }
      DUEL.msg='Rolled '+t+'. Still looking for '+s.point+'.'; },
  },
};
Object.assign(ACT,{
  duelPick:el=>{ if(DUEL.busy) return; DUEL.st.bet=el.dataset.v; duelDraw(); },
  duelAmt:el=>{ if(DUEL.busy) return; DUEL.amt=+el.dataset.v; duelDraw(); },
  // A round that's still going (blackjack hand, poker draw, craps point) redraws itself; a finished one settles.
  duelGo:el=>{ const P=DUEL_PLAY[DUEL.game]; if(DUEL.busy||(duelDone()&&!P.mid(DUEL.st))||DUEL.amt<=0) return; DUEL.busy=true; el.disabled=true; DUEL.msg='';
    const r0=DUEL.round; Promise.resolve(P.go(DUEL.st)).then(()=>{ if(DUEL.round===r0){ DUEL.busy=false; duelDraw(); } }); },
  duelBj:el=>DUEL_PLAY.blackjack.act(DUEL.st,el.dataset.v),
  duelHold:el=>{ const s=DUEL.st; if(s.phase!=='draw') return; const i=+el.dataset.i; s.held[i]=!s.held[i]; duelDraw(); },
  duelShare:()=>shareCard({game:'duel',title:DUEL_GAMES[DUEL.game].name,big:DUEL.chips.toLocaleString()+' CHIPS',sub:'Started with 1,000'}),
  duelClose:()=>{ closeModal(); if(S.mode==='league') render(); },
});
