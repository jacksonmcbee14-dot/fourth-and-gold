// Roulette
/* ---------- Roulette ---------- */
const WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const colOf=n=>n===0?'Z':REDS.has(n)?'R':'B';
const RL={bets:{},last:{},hist:[],rot:0,brot:0,spinning:false,res:null,msg:'Place your chips, then spin.',mcls:''};
function wheelSVG(){
  const R=130,cx=130,cy=130,a=360/37;let p='';
  const pt=(ang,r)=>{const t=(ang-90)*Math.PI/180;return [cx+r*Math.cos(t),cy+r*Math.sin(t)];};
  WHEEL.forEach((n,i)=>{const a0=i*a-a/2,a1=i*a+a/2;const [x0,y0]=pt(a0,R),[x1,y1]=pt(a1,R),[x2,y2]=pt(a1,86),[x3,y3]=pt(a0,86);
    const fill=n===0?'#1f4a36':REDS.has(n)?'#6e1d24':'#231a15';
    p+=`<path d="M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} L${x2},${y2} A86,86 0 0 0 ${x3},${y3}Z" fill="${fill}" stroke="#c8a45c" stroke-width=".6"/>`;
    const [tx,ty]=pt(i*a,113);p+=`<text x="${tx}" y="${ty}" fill="#f3ead8" font-family="JetBrains Mono" font-size="10" font-weight="700" text-anchor="middle" dominant-baseline="central" transform="rotate(${i*a} ${tx} ${ty})">${n}</text>`;});
  return `<svg viewBox="0 0 260 260" width="260" height="260"><circle cx="130" cy="130" r="130" fill="#2a1a10"/>${p}<circle cx="130" cy="130" r="86" fill="#3a2617" stroke="#c8a45c" stroke-width="1"/>${[...Array(8)].map((_,i)=>{const t=i*45*Math.PI/180;return `<line x1="130" y1="130" x2="${130+70*Math.cos(t)}" y2="${130+70*Math.sin(t)}" stroke="#c8a45c" stroke-width="1.5" opacity=".55"/>`}).join('')}</svg>`;
}
const rTotal=()=>Object.values(RL.bets).reduce((a,b)=>a+b,0);
function rCell(key,label,cls,style=''){const v=RL.bets[key];const won=RL.res!=null&&rWins(key,RL.res)&&!RL.spinning;return `<button class="${cls} ${won?'won':''}" style="${style}" data-a="rbet" data-k="${key}">${label}${v?`<span class="stack">${k$(v).replace('$','')}</span>`:''}</button>`;}
function rWins(k,n){
  if(k[0]==='n') return +k.slice(1)===n;
  if(n===0) return false;
  return {red:REDS.has(n),black:!REDS.has(n),odd:n%2===1,even:n%2===0,low:n<=18,high:n>=19,d1:n<=12,d2:n>12&&n<=24,d3:n>24,c1:n%3===1,c2:n%3===2,c3:n%3===0}[k];
}
const rMult=k=>k[0]==='n'?36:/^[dc]\d/.test(k)?3:2;
function viewRoulette(){
  let cells='';
  cells+=rCell('n0','0','Z','grid-column:1;grid-row:1/4');
  for(let c=0;c<12;c++)for(let r=0;r<3;r++){const n=c*3+(3-r);cells+=rCell('n'+n,n,colOf(n),`grid-column:${c+2};grid-row:${r+1}`);}
  ['c3','c2','c1'].forEach((k,r)=>cells+=rCell(k,'2:1','o',`grid-column:14;grid-row:${r+1}`));
  [['d1','1st 12'],['d2','2nd 12'],['d3','3rd 12']].forEach(([k,l],i)=>cells+=rCell(k,l,'o',`grid-column:${2+i*4}/span 4;grid-row:4`));
  [['low','1–18'],['even','Even'],['red','<span style="color:#c0505a">●</span> Red'],['black','● Black'],['odd','Odd'],['high','19–36']].forEach(([k,l],i)=>cells+=rCell(k,l,'o',`grid-column:${2+i*2}/span 2;grid-row:5`));
  return `<div class="felt">
    <div class="label">European Roulette · single zero</div>
    <div class="wheelwrap"><div class="pointer"></div><div class="wheel" id="wheel" style="transform:rotate(${RL.rot}deg)">${wheelSVG()}</div><div class="balltrack" id="ball" style="transform:rotate(${RL.brot}deg)"><div class="ball"></div></div><div class="hub">${RL.res!=null&&!RL.spinning?`<div><b style="color:${colOf(RL.res)==='R'?'#e2858b':colOf(RL.res)==='Z'?'#7cc89c':'#f3ead8'}">${RL.res}</b><small>${colOf(RL.res)==='R'?'Red':colOf(RL.res)==='Z'?'Zero':'Black'}</small></div>`:`<div><small>${RL.spinning?'No more bets':'Place bets'}</small></div>`}</div></div>
    <div class="hist">${RL.hist.slice(0,10).map(n=>`<span style="background:${colOf(n)==='R'?'#6e1d24':colOf(n)==='Z'?'#1f4a36':'#2a1f18'}">${n}</span>`).join('')}</div>
    <div class="cmsg ${RL.mcls}">${RL.msg}</div>
    <div class="rboard">${cells}</div>
    ${chipsHTML()}
    <div class="betinfo"><span>On table <b>${fmt$(rTotal())}</b></span><span>Straight up pays <b>35:1</b></span></div>
    <div class="cactions"><button class="btn sm ghost" data-a="rclear" ${RL.spinning?'disabled':''}>Clear</button><button class="btn sm ghost" data-a="rrebet" ${RL.spinning||!Object.keys(RL.last).length?'disabled':''}>Rebet</button><button class="btn gold" data-a="rspin" style="min-width:140px" ${RL.spinning||!rTotal()?'disabled':''}>Spin</button></div>
  </div>`;
}
function rSpin(){
  const x=betX(), wx=winX(), tot=rTotal()*x; if(!tot||RL.spinning)return; if(tot>S.bank){noFunds();return;}
  RL.last={...RL.bets}; if(x>1) for(const k in RL.bets) RL.bets[k]*=x;   // old fashioned: every bet doubled
  setBank(-tot); RL.spinning=true; RL.msg='No more bets…'; RL.mcls='';
  const idx=rint(37), n=WHEEL[idx], a=360/37;
  const newRot=RL.rot-360*5-(((RL.rot+idx*a)%360)+360)%360;
  const newB=RL.brot+360*7+((360-(RL.brot%360))%360);
  render(); // paint at the old angle, then animate to the new one
  setTimeout(()=>{RL.rot=newRot;RL.brot=newB;const w=$('#wheel'),b=$('#ball');if(w)w.style.transform=`rotate(${RL.rot}deg)`;if(b)b.style.transform=`rotate(${RL.brot}deg)`;},40);
  setTimeout(()=>{
    RL.spinning=false; RL.res=n; RL.hist.unshift(n);
    let win=0, back=0; for(const k in RL.bets) if(rWins(k,n)){ win+=RL.bets[k]*rMult(k); back+=RL.bets[k]; }
    win=boostRet(win,back,wx);
    if(win){setBank(win); RL.msg=`${n} ${colOf(n)==='R'?'Red':colOf(n)==='Z'?'Zero':'Black'} — pays ${fmt$(win)}`; RL.mcls='win'; if(win>tot)toast('+'+fmt$(win-tot),'win');}
    else{RL.msg=`${n} ${colOf(n)==='R'?'Red':colOf(n)==='Z'?'Zero':'Black'} — house wins`; RL.mcls='loss';}
    RL.bets={}; render();
  },5400);
}
