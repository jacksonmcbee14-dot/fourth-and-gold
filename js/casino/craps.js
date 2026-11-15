// Craps
/* ---------- Craps ---------- */
const CR={point:null,bets:{},dice:[3,4],rolling:false,msg:'Come-out roll. Bet the Pass Line to start.',mcls:'',flash:{}};
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const dieHTML=(v,cls='')=>`<div class="die ${cls}">${[...Array(9)].map((_,i)=>`<i class="${PIPS[v].includes(i)?'on':''}"></i>`).join('')}</div>`;
function crZone(k,title,sub,extra=''){const v=CR.bets[k];const off=(k==='pass'||k==='dp')&&CR.point!=null&&!v;return `<button class="zone ${extra} ${off?'off':''} ${CR.flash[k]?'flash':''}" data-a="crbet" data-k="${k}"><b>${title}</b><span>${sub}</span>${v?`<span class="stack">${k$(v).replace('$','')}</span>`:''}</button>`;}
function viewCraps(){
  const tot=Object.values(CR.bets).reduce((a,b)=>a+b,0);
  return `<div class="felt">
    <div class="puck ${CR.point?'on':'off'}">${CR.point?'ON '+CR.point:'OFF'}</div>
    <div class="label" style="margin-right:40px">Craps · ${CR.point?'Point is '+CR.point:'Come-out roll'}</div>
    <div class="dice">${dieHTML(CR.dice[0],CR.rolling?'roll':'')}${dieHTML(CR.dice[1],'red'+(CR.rolling?' roll':''))}</div>
    <div class="cmsg ${CR.mcls}">${CR.msg}</div>
    <div class="cboard">
      ${crZone('pass','Pass Line','7 or 11 wins now · then hit the point','wide')}
      ${crZone('dp',"Don't Pass",'Bet against the shooter')}
      ${crZone('field','Field','2·3·4·9·10·11·12 · one roll')}
      ${crZone('p6','Place 6','Pays 7 to 6 · works when point is on')}
      ${crZone('p8','Place 8','Pays 7 to 6 · works when point is on')}
    </div>
    ${chipsHTML()}
    <div class="betinfo"><span>On table <b>${fmt$(tot)}</b></span></div>
    <div class="cactions"><button class="btn sm ghost" data-a="crclear" ${CR.rolling?'disabled':''}>Take down</button><button class="btn gold" style="min-width:150px" data-a="crroll" ${CR.rolling||!tot?'disabled':''}>Roll the dice</button></div>
  </div>`;
}
function crRoll(){
  if(CR.rolling)return; CR.rolling=true; CR.msg='Dice are up…'; CR.mcls=''; CR.flash={}; render();
  let n=0; const iv=setInterval(()=>{CR.dice=[1+rint(6),1+rint(6)];document.querySelectorAll('.die').forEach((d,i)=>d.outerHTML=dieHTML(CR.dice[i],i?'red roll':'roll'));if(++n>9){clearInterval(iv);crResolve();}},80);
}
function crResolve(){
  const [a,b]=[1+rint(6),1+rint(6)]; CR.dice=[a,b]; const s=a+b; CR.rolling=false;
  let ret=0, lost=0, notes=[]; const B=CR.bets;
  const win=(k,mult)=>{ret+=B[k]*mult;CR.flash[k]=1;};
  if(B.field){ if(s===2)win('field',3); else if(s===12)win('field',4); else if([3,4,9,10,11].includes(s))win('field',2); else lost+=B.field; delete B.field; }
  if(CR.point!=null){
    if(B.p6&&s===6){ret+=Math.floor(B.p6*7/6);CR.flash.p6=1;notes.push('Place 6 hits');}
    if(B.p8&&s===8){ret+=Math.floor(B.p8*7/6);CR.flash.p8=1;notes.push('Place 8 hits');}
  }
  if(CR.point==null){
    if([7,11].includes(s)){ if(B.pass){win('pass',2);delete B.pass;} if(B.dp){lost+=B.dp;delete B.dp;} notes.push(s+' — natural! Pass wins'); }
    else if([2,3,12].includes(s)){ if(B.pass){lost+=B.pass;delete B.pass;} if(B.dp){ if(s===12){ret+=B.dp;notes.push('12 — Don’t Pass pushes');} else {win('dp',2);} delete B.dp;} notes.push(s+' — craps'); }
    else { CR.point=s; notes.push('Point is '+s); }
  } else {
    if(s===CR.point){ if(B.pass){win('pass',2);delete B.pass;} if(B.dp){lost+=B.dp;delete B.dp;} notes.push('Hit the point! '+s); CR.point=null; }
    else if(s===7){ ['pass','p6','p8'].forEach(k=>{if(B[k]){lost+=B[k];delete B[k];}}); if(B.dp){win('dp',2);delete B.dp;} notes.push('Seven out'); CR.point=null; }
    else notes.push('Rolled '+s);
  }
  if(ret){setBank(ret);toast('+'+fmt$(ret),'win');}
  CR.msg=notes.join(' · ')+(ret?` · paid ${fmt$(ret)}`:lost?` · lost ${fmt$(lost)}`:''); CR.mcls=ret?'win':lost?'loss':'gold';
  render();
}

