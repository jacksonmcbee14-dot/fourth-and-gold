// App shell: tab bar, drawing the current screen, every button action
/* =========================================================
   SHELL
   ========================================================= */
const IC={
  slot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="16" height="14" rx="2.5"/><path d="M8 5v14M14 5v14"/><path d="M19 9h1.5a1 1 0 0 1 1 1v3"/><circle cx="21.5" cy="14.5" r="1.3" fill="currentColor"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>',
  pred:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  bets:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10" stroke-dasharray="2 2"/></svg>',
  rank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/></svg>',
  roul:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21"/></svg>',
  bj:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="11" height="15" rx="2"/><path d="M10 5V4a1 1 0 0 1 1-1h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/></svg>',
  pk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3c3 4 7 6 7 10a4 4 0 0 1-7 2.5A4 4 0 0 1 5 13c0-4 4-6 7-10z"/><path d="M12 15.5 10 21h4z"/></svg>',
  dice:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/></svg>',
};
const FTABS=[['today','Today','home'],['home','Season','cal'],['predict','Predict','pred'],['bets','Bets','bets'],['ranks','Ranks','rank']];
const CTABS=[['slots','Slots','slot'],['roulette','Roulette','roul'],['blackjack','Blackjack','bj'],['poker','Poker','pk'],['craps','Craps','dice'],['ranks','Ranks','rank']];
let lastViewKey='';
function render(){
  document.body.classList.toggle('calm',S.mode==='football'||S.ctab==='ranks');   // calmer look for the football screens (css/09-calm.css)
  $('#bankVal').textContent=fmt$(S.bank);
  const m=$('#mode'); m.classList.toggle('casino',S.mode==='casino');
  m.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.mode));
  const tabs=S.mode==='football'?FTABS:CTABS, cur=S.mode==='football'?S.ftab:S.ctab;
  $('#tabbar').style.gridTemplateColumns=`repeat(${tabs.length},1fr)`;
  $('#tabbar').innerHTML=tabs.map(([k,l,ic])=>`<button class="${k===cur?'on':''}" data-a="tab" data-v="${k}">${IC[ic]}${l}</button>`).join('');
  let html='';
  if(S.mode==='football') html={today:viewToday,home:viewHome,predict:viewPredict,bets:viewBets,ranks:viewRanks}[S.ftab]();
  else if(S.ctab==='ranks') html=viewRanks();
  else { const V={slots:['Jingle Jackpot',viewSlots],roulette:['Roulette',viewRoulette],blackjack:['Blackjack',viewBlackjack],poker:['Video Poker',viewPoker],craps:['Craps',viewCraps]}[S.ctab]; html=gameHead(S.ctab,V[0])+(S.howto[S.ctab]?TIPS[S.ctab]():V[1]()); }
  const key=S.mode+(S.mode==='football'?S.ftab+S.lg:S.ctab);
  const v=$('#view');
  v.innerHTML=`<div class="${key!==lastViewKey?'view':''}">${html}</div>`;
  lastViewKey=key;
  animateRings(); slipBar(); if(S.mode==='casino'&&S.ctab==='slots'&&!S.howto.slots) slUI();
}
const ACT={
  mode:el=>{SL.auto=0;S.mode=el.dataset.v;save();scrollTo(0,0);render();},
  tab:el=>{if(S.mode==='football')S.ftab=el.dataset.v;else{if(el.dataset.v!=='slots')SL.auto=0;S.ctab=el.dataset.v;}save();scrollTo(0,0);render();},
  lg:el=>{S.lg=el.dataset.v;save();render();},
  conf:el=>{S.conf=el.dataset.v;save();render();},
  goBet:el=>{S.ftab='bets';S.btab='games';save();render();scrollTo(0,0);},
  sfF:el=>{nflForced()[+el.dataset.i]=el.dataset.v;save();quickResim();render();},
  sfAll:el=>{const F=nflForced();F.forEach((x,i)=>F[i]=el.dataset.v);save();quickResim();render();},
  byuF:el=>{cfbForced()[+el.dataset.i]=el.dataset.v;save();quickResim();render();},
  byuAll:el=>{const F=cfbForced();F.forEach((x,i)=>F[i]=el.dataset.v);if(el.dataset.v==='A'){S.b12='auto';S.utahL=false;S.ttuL=false;}save();quickResim();render();},
  b12:el=>{S.b12=el.dataset.v;save();quickResim();render();},
  tog:el=>{S[el.dataset.v]=!S[el.dataset.v];save();quickResim();render();},
  runSim:()=>runSim(),
  allScores:()=>{S.allScores=!S.allScores;save();render();},
  btab:el=>{S.btab=el.dataset.v;save();render();},
  pick:el=>{const g=allGames().find(x=>x.id===el.dataset.g);if(!g||!betable(g))return;const M=market(g),m=el.dataset.m,sd=el.dataset.s,k=g.id+':'+m+':'+sd;
    const i=S.slip.findIndex(l=>l.k===k);
    if(i>=0)S.slip.splice(i,1);
    else{S.slip=S.slip.filter(l=>!(l.gid===g.id&&l.m===m));const t=sd==='a'?g.a:g.h;let line=null,odds=-110,label;
      if(m==='ml'){odds=sd==='a'?M.mlA:M.mlH;label=t.name+' to win';}
      else if(m==='sp'){line=sd==='a'?M.spA:M.spH;label=t.name+' '+sgn(line);}
      else{line=M.tot;label=(sd==='o'?'Over ':'Under ')+M.tot;}
      S.slip.push({k,gid:g.id,m,s:sd,line,odds,label,sub:g.a.name+' @ '+g.h.name,live:g.s==='live'});}
    save();render();},
  pickF:el=>{const k='F:'+el.dataset.id,i=S.slip.findIndex(l=>l.k===k);if(i>=0)S.slip.splice(i,1);else S.slip.push({k,fid:el.dataset.id,odds:+el.dataset.o,label:el.dataset.l,sub:'Futures'});save();render();},
  openSlip:()=>openSlip(),
  slipClear:()=>{S.slip=[];save();closeSheet();render();},
  legX:el=>{S.slip.splice(+el.dataset.i,1);save();if(!S.slip.length){closeSheet();render();}else renderSlip();},
  slipMode:el=>{S.slipMode=el.dataset.v;save();renderSlip();},
  stake:el=>{S.stake=+el.dataset.v;save();renderSlip();},
  placeSlip:()=>{const c=slipCalc();if(!c.legs.length||c.risk<=0||c.risk>S.bank)return;setBank(-c.risk);
    const mk=ls=>{const dec=ls.reduce((p,l)=>p*decOf(l.odds),1);return{id:Date.now()+rng(),legs:ls.map(l=>({...l})),stake:c.stake,dec,pay:Math.round(c.stake*dec),st:'open'};};
    if(c.par)S.bets.push(mk(c.legs));else c.legs.forEach(l=>S.bets.push(mk([l])));
    S.slip=[];save();closeSheet();toast((c.par?'Parlay placed · ':c.legs.length>1?c.legs.length+' bets placed · ':'Bet placed · ')+fmt$(c.risk),'gold');render();},
  blg:el=>{S.blg=el.dataset.v;save();render();},
  howto:el=>{S.howto[el.dataset.k]=el.dataset.v==='1';if(el.dataset.k==='slots')SL.auto=0;save();render();},
  bjhint:()=>{const h=BJ.hands[BJ.act];if(!h||BJ.phase!=='play')return;toast('Basic strategy says: '+bjAdvice(h,BJ.dealer[0]),'gold');},
  slSpin:()=>slotSpin(),
  slBet:el=>{if(SL.spinning||SL.fs>0)return;const i=SLOT_BETS.indexOf(S.slotBet),j=clamp((i<0?2:i)+(+el.dataset.v),0,SLOT_BETS.length-1);S.slotBet=SLOT_BETS[j];save();slUI();tone(500+j*80,.06,'square',.04);},
  slAuto:()=>{if(SL.auto>0){SL.auto=0;slUI();return;}SL.auto=25;if(!SL.spinning){SL.auto--;slotSpin();}slUI();},
  slTurbo:el=>{S.turbo=!S.turbo;save();el.classList.toggle('on',S.turbo);},
  slSound:el=>{S.sound=!S.sound;save();el.classList.toggle('on',S.sound);el.textContent=S.sound?'SOUND':'MUTED';if(S.sound)SND.win();},
  closeSheet:()=>closeSheet(),
  teamSheet:()=>openTeamSheet(),
  bankSheet:()=>{$('#sheet').innerHTML=`<div class="grab"></div><div class="eyebrow">Bankroll</div><div class="mono" style="font-size:34px;font-weight:700;color:var(--gold2);margin:6px 0">${fmt$(S.bank)}</div><div class="small muted">Play money only. Peak: <span class="mono">${fmt$(S.peak)}</span> · Status: <span class="gold">${STATUS[statusFor(S.bank)][1]}</span></div><div class="divider" style="margin:16px 0"></div><button class="btn" style="width:100%" data-a="reset">Reset to $1,000,000</button><p class="small muted" style="text-align:center">Clears your bets, debt and lodge gear, and starts fresh.</p>`;$('#scrim').classList.add('on');$('#sheet').classList.add('on');},
  reset:()=>{S.resets=(S.resets||0)+1;S.bank=START_BANK;S.bets=[];S.picks={w:0,l:0};S.peak=START_BANK;save();closeSheet();render();toast('Fresh $1,000,000','gold');},
  chip:el=>{S.chip=+el.dataset.v;save();if(RL.spinning&&S.ctab==='roulette'){document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',+c.dataset.v===S.chip));return;}render();},
  rbet:el=>{if(RL.spinning)return;const k=el.dataset.k;if(rTotal()+S.chip>S.bank){toast('Not enough in the bankroll','loss');return;}if(RL.res!=null&&!Object.keys(RL.bets).length){RL.res=null;}RL.bets[k]=(RL.bets[k]||0)+S.chip;RL.msg='Spin when ready.';RL.mcls='';render();},
  rclear:()=>{RL.bets={};render();},
  rrebet:()=>{const t=Object.values(RL.last).reduce((a,b)=>a+b,0);if(t>S.bank){toast('Not enough in the bankroll','loss');return;}RL.bets={...RL.last};RL.res=null;render();},
  rspin:()=>rSpin(),
  bjadd:()=>{if(BJ.bet+S.chip>S.bank){toast('Not enough in the bankroll','loss');return;}if(BJ.phase==='done'){BJ.phase='bet';BJ.hands=[];BJ.dealer=[];}BJ.bet+=S.chip;render();},
  bjclear:()=>{BJ.bet=0;if(BJ.phase==='done'){BJ.phase='bet';BJ.hands=[];BJ.dealer=[];BJ.msg='Choose a chip, add to your bet, then deal.';BJ.mcls='';}render();},
  bjsame:()=>{BJ.bet=Math.min(BJ.lastBet,S.bank);bjDeal();},
  bjdeal:()=>bjDeal(),
  bjhit:()=>{const h=BJ.hands[BJ.act];h.cards.push(draw());const v=hv(h.cards).t;if(v>21){h.res='Bust';BJ.msg='Bust.';render();setTimeout(bjNext,500);}else if(v===21){render();setTimeout(bjNext,400);}else render();},
  bjstand:()=>bjNext(),
  bjdouble:()=>{const h=BJ.hands[BJ.act];setBank(-h.bet);h.bet*=2;h.cards.push(draw());render();setTimeout(bjNext,500);},
  bjsplit:()=>{const h=BJ.hands[0];setBank(-h.bet);BJ.hands=[{cards:[h.cards[0],draw()],bet:h.bet},{cards:[h.cards[1]],bet:h.bet}];BJ.msg='Playing hand 1 of 2.';render();},
  vpunit:el=>{VP.unit=+el.dataset.v;render();},
  vpcoins:el=>{VP.coins=+el.dataset.v;render();},
  vpdeal:()=>vpDeal(),
  vpdraw:()=>vpDraw(),
  vphold:el=>{if(VP.phase!=='draw')return;const i=+el.dataset.i;VP.held[i]=!VP.held[i];el.classList.toggle('h',VP.held[i]);el.parentNode.querySelector('.held').textContent=VP.held[i]?'HELD':'';},
  crbet:el=>{if(CR.rolling)return;const k=el.dataset.k;if((k==='pass'||k==='dp')&&CR.point!=null){toast('Line bets go down on the come-out roll','loss');return;}const tot=Object.values(CR.bets).reduce((a,b)=>a+b,0);if(S.chip>S.bank){toast('Not enough in the bankroll','loss');return;}setBank(-S.chip);CR.bets[k]=(CR.bets[k]||0)+S.chip;CR.flash={};render();},
  crclear:()=>{let back=0;for(const k of Object.keys(CR.bets)){if((k==='pass')&&CR.point!=null)continue;back+=CR.bets[k];delete CR.bets[k];}if(back)setBank(back);render();},
  crroll:()=>crRoll(),
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const f=ACT[el.dataset.a];if(f){f(el,e);}});

