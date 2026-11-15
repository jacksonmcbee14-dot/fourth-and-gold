// Video poker (Jacks or Better 9/6)
/* ---------- Video Poker (Jacks or Better 9/6) ---------- */
const PAY=[['Royal Flush',250],['Straight Flush',50],['Four of a Kind',25],['Full House',9],['Flush',6],['Straight',4],['Three of a Kind',3],['Two Pair',2],['Jacks or Better',1]];
const VP={deck:[],hand:[],held:[false,false,false,false,false],phase:'bet',coins:5,unit:5000,res:null,msg:'Pick a coin size, then deal.',mcls:''};
function evalHand(h){
  const rs=h.map(c=>c.r).sort((a,b)=>a-b), flush=h.every(c=>c.s===h[0].s);
  const cnt={};rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);const vals=Object.values(cnt).sort((a,b)=>b-a);
  const uniq=Object.keys(cnt).length===5;
  const wheel=rs.join()==='2,3,4,5,14';
  const straight=uniq&&(rs[4]-rs[0]===4||wheel);
  if(straight&&flush&&rs[0]===10)return 0;
  if(straight&&flush)return 1;
  if(vals[0]===4)return 2;
  if(vals[0]===3&&vals[1]===2)return 3;
  if(flush)return 4;
  if(straight)return 5;
  if(vals[0]===3)return 6;
  if(vals[0]===2&&vals[1]===2)return 7;
  if(vals[0]===2){const pr=+Object.keys(cnt).find(k=>cnt[k]===2);if(pr>=11)return 8;}
  return -1;
}
function vpMult(i){return i===0&&VP.coins===5?800:PAY[i][1];}
function viewPoker(){
  const units=[1000,5000,25000,100000];
  return `<div class="felt">
    <div class="label">Jacks or Better · full-pay 9/6</div>
    <div class="paytable" style="margin-top:12px">${PAY.map((p,i)=>`<span class="hn ${VP.res===i&&VP.phase==='bet'?'hit':''}">${p[0]}</span>${[1,2,3,4,5].map(c=>`<span class="${c===VP.coins?'col':''} ${VP.res===i&&c===VP.coins&&VP.phase==='bet'?'hit':''}">${i===0&&c===5?800*5:p[1]*c}</span>`).join('')}`).join('')}</div>
    <div class="vp">${(VP.hand.length?VP.hand:[null,null,null,null,null]).map((c,i)=>`<div class="slot"><div class="held">${VP.held[i]?'HELD':''}</div>${c?cardHTML(c,{cls:VP.held[i]?'h':'',d:i*70,attr:`data-a="vphold" data-i="${i}"`}):cardHTML(null,{d:i*70})}</div>`).join('')}</div>
    <div class="cmsg ${VP.mcls}" style="margin-top:10px">${VP.msg}</div>
    <div class="betinfo" style="margin-bottom:10px"><span>Coin <b>${k$(VP.unit)}</b></span><span>Bet <b>${fmt$(VP.unit*VP.coins)}</b></span></div>
    ${VP.phase==='bet'?`<div class="coins" style="margin-bottom:8px">${units.map(u=>`<button style="width:auto;padding:0 10px" class="${VP.unit===u?'on':''}" data-a="vpunit" data-v="${u}">${k$(u)}</button>`).join('')}</div>
    <div class="coins">${[1,2,3,4,5].map(c=>`<button class="${VP.coins===c?'on':''}" data-a="vpcoins" data-v="${c}">${c}</button>`).join('')}</div>`:''}
    <div class="cactions"><button class="btn gold" style="min-width:160px" data-a="${VP.phase==='bet'?'vpdeal':'vpdraw'}">${VP.phase==='bet'?'Deal':'Draw'}</button></div>
  </div>`;
}
function vpDeal(){
  const cost=VP.unit*VP.coins; if(cost>S.bank){toast('Not enough in the bankroll','loss');return;}
  setBank(-cost); VP.deck=newDeck(1); VP.hand=[0,1,2,3,4].map(()=>VP.deck.pop()); VP.held=[false,false,false,false,false]; VP.phase='draw'; VP.res=null;
  const e=evalHand(VP.hand); VP.msg=e>=0?`You're holding ${PAY[e][0]} — keep it?`:'Tap the cards you want to keep.'; VP.mcls=e>=0?'gold':'';
  render();
}
function vpDraw(){
  VP.hand=VP.hand.map((c,i)=>VP.held[i]?c:VP.deck.pop()); VP.phase='bet';
  const e=evalHand(VP.hand); VP.res=e;
  if(e>=0){const w=vpMult(e)*VP.unit*VP.coins; setBank(w); VP.msg=`${PAY[e][0]}! Pays ${fmt$(w)}`; VP.mcls='win'; toast('+'+fmt$(w),'win');}
  else {VP.msg='No win. Deal again.'; VP.mcls='loss';}
  render();
}
