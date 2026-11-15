// Blackjack (including the basic-strategy Hint)
/* ---------- Blackjack ---------- */
const BJ={shoe:newDeck(6),bet:0,hands:[],act:0,dealer:[],phase:'bet',msg:'Choose a chip, add to your bet, then deal.',mcls:'',lastBet:0};
function draw(){if(BJ.shoe.length<60)BJ.shoe=newDeck(6);return BJ.shoe.pop();}
const cv=c=>c.r>=11&&c.r<=13?10:c.r===14?11:c.r;
function hv(cards){let t=0,a=0;for(const c of cards){t+=cv(c);if(c.r===14)a++;}while(t>21&&a){t-=10;a--;}return {t,soft:a>0};}
const isBJ=cs=>cs.length===2&&hv(cs).t===21;
function viewBlackjack(){
  const showD=BJ.phase==='done'||BJ.phase==='dealer';
  const dv=BJ.dealer.length?(showD?hv(BJ.dealer).t:cv(BJ.dealer[0])):'';
  const h=BJ.hands[BJ.act];
  const canDouble=BJ.phase==='play'&&h&&h.cards.length===2&&S.bank>=h.bet;
  const canSplit=BJ.phase==='play'&&BJ.hands.length===1&&h&&h.cards.length===2&&cv(h.cards[0])===cv(h.cards[1])&&S.bank>=h.bet;
  return `<div class="felt">
    <div class="label">Blackjack pays 3 to 2 · Dealer stands on all 17s</div>
    <div style="text-align:center;margin-top:12px"><div class="eyebrow" style="color:rgba(255,255,255,.55)">Dealer</div>
    <div class="hand" style="margin-top:8px">${BJ.dealer.map((c,i)=>cardHTML(c,{back:i===1&&!showD,d:i*120})).join('')||'<div style="height:88px"></div>'}</div>
    ${BJ.dealer.length?`<span class="htot">${dv}</span>`:''}</div>
    <div class="cmsg ${BJ.mcls}" style="margin:14px 0">${BJ.msg}</div>
    <div class="bjhands">${BJ.hands.length?BJ.hands.map((hd,i)=>`<div class="bjhand ${BJ.phase==='play'&&i===BJ.act&&BJ.hands.length>1?'act':''}"><div class="hand">${hd.cards.map((c,j)=>cardHTML(c,{d:j*120})).join('')}</div><span class="htot">${hv(hd.cards).t}${hd.res?' · '+hd.res:''}</span><div class="small" style="margin-top:4px;color:rgba(255,255,255,.6)">${fmt$(hd.bet)}</div></div>`).join(''):'<div style="height:110px;display:grid;place-items:center;color:rgba(255,255,255,.4)">Your hand</div>'}</div>
    ${BJ.phase==='bet'||BJ.phase==='done'?`${chipsHTML()}<div class="betinfo"><span>Bet <b>${fmt$(BJ.bet)}</b></span></div>
      <div class="cactions"><button class="btn sm ghost" data-a="bjclear">Clear</button><button class="btn sm ghost" data-a="bjadd">+ Add chip</button>${BJ.lastBet?`<button class="btn sm ghost" data-a="bjsame">Same bet</button>`:''}<button class="btn gold" data-a="bjdeal" ${!BJ.bet?'disabled':''}>Deal</button></div>`:
    `<div class="cactions" style="margin-top:16px"><button class="btn" data-a="bjhit" ${BJ.phase!=='play'?'disabled':''}>Hit</button><button class="btn gold" data-a="bjstand" ${BJ.phase!=='play'?'disabled':''}>Stand</button><button class="btn" data-a="bjdouble" ${canDouble?'':'disabled'}>Double</button><button class="btn" data-a="bjsplit" ${canSplit?'':'disabled'}>Split</button><button class="btn ghost" data-a="bjhint" ${BJ.phase!=='play'?'disabled':''}>Hint</button></div>`}
  </div>`;
}
function bjDeal(){
  const x=betX(), stake=BJ.bet*x;   // old fashioned: the bet is doubled
  if(!BJ.bet)return; if(stake>S.bank){noFunds();return;}
  setBank(-stake); BJ.lastBet=BJ.bet; BJ.wx=winX();
  BJ.hands=[{cards:[draw(),],bet:stake}]; BJ.dealer=[draw()]; BJ.hands[0].cards.push(draw()); BJ.dealer.push(draw());
  BJ.act=0; BJ.phase='play'; BJ.msg='Your move.'; BJ.mcls='';
  const p=isBJ(BJ.hands[0].cards), d=isBJ(BJ.dealer);
  if(p||d){ BJ.phase='dealer'; bjSettle(); return; }
  render();
}
function bjNext(){
  BJ.act++;
  if(BJ.act<BJ.hands.length){ if(BJ.hands[BJ.act].cards.length<2)BJ.hands[BJ.act].cards.push(draw()); BJ.msg='Next hand.'; render(); return; }
  BJ.phase='dealer'; BJ.act=BJ.hands.length-1;
  if(BJ.hands.every(h=>hv(h.cards).t>21)){bjSettle();return;}
  render();
  const step=()=>{ if(hv(BJ.dealer).t<17){BJ.dealer.push(draw());render();setTimeout(step,550);} else bjSettle(); };
  setTimeout(step,600);
}
function bjSettle(){
  const d=hv(BJ.dealer).t, dBJ=isBJ(BJ.dealer); let ret=0, staked=0;
  for(const h of BJ.hands){
    staked+=h.bet; const p=hv(h.cards).t, pBJ=isBJ(h.cards)&&BJ.hands.length===1; let r=0;
    if(pBJ&&!dBJ){h.res='Blackjack';r=h.bet*2.5;}
    else if(dBJ&&!pBJ){h.res='Dealer BJ';}
    else if(pBJ&&dBJ){h.res='Push';r=h.bet;}
    else if(p>21){h.res='Bust';}
    else if(d>21||p>d){h.res='Win';r=h.bet*2;}
    else if(p===d){h.res='Push';r=h.bet;}
    else h.res='Lose';
    ret+=boostRet(r,h.bet,BJ.wx);   // drink power on the winnings
  }
  if(ret)setBank(ret);
  const net=ret-staked;
  BJ.msg=net>0?`You win ${fmt$(net)}`:net===0?'Push — bet returned':`Dealer wins · ${d>21?'':'dealer has '+d}`; BJ.mcls=net>0?'win':net<0?'loss':'gold';
  if(net>0)toast('+'+fmt$(net),'win');
  BJ.phase='done'; BJ.bet=Math.min(BJ.lastBet,S.bank); render();
}
function bjAdvice(h,upCard){
  const c=h.cards, v=hv(c), two=c.length===2, canD=two&&S.bank>=h.bet, u=cv(upCard);
  const canS=two&&BJ.hands.length===1&&cv(c[0])===cv(c[1])&&S.bank>=h.bet;
  if(canS){const p=cv(c[0]);if(p===11||p===8)return'Split';if(p===9&&![7,10,11].includes(u))return'Split';if((p===2||p===3||p===7)&&u<=7)return'Split';if(p===6&&u<=6)return'Split';if(p===4&&(u===5||u===6))return'Split';}
  if(v.soft&&two){const o=v.t-11;if(o>=8)return'Stand';if(o===7)return(u>=3&&u<=6&&canD)?'Double':u<=8?'Stand':'Hit';if(u>=5&&u<=6&&canD)return'Double';if(o>=4&&u===4&&canD)return'Double';return'Hit';}
  if(v.soft){if(v.t>=19)return'Stand';if(v.t===18)return u<=8?'Stand':'Hit';return'Hit';}
  const t=v.t;
  if(t>=17)return'Stand';if(t>=13)return u<=6?'Stand':'Hit';if(t===12)return(u>=4&&u<=6)?'Stand':'Hit';
  if(t===11)return canD?'Double':'Hit';if(t===10)return(u<=9&&canD)?'Double':'Hit';if(t===9)return(u>=3&&u<=6&&canD)?'Double':'Hit';return'Hit';
}
