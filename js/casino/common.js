// Shared casino pieces: chips, deck of cards, card drawing
/* =========================================================
   CASINO
   ========================================================= */
const CHIPS=[[1000,'1K','#2b3a5c'],[5000,'5K','#7d1f2a'],[25000,'25K','#24533e'],[100000,'100K','#4a2440'],[500000,'500K','#e9dcc0']];
// Chips below the table minimum (js/economy.js) are hidden; a "Min" chip bets exactly the minimum.
const chipsHTML=()=>{ const m=typeof tableMin==='function'?tableMin():0, list=CHIPS.filter(([v])=>v>=m&&(typeof tableMax!=='function'||v<=tableMax())); if(m>1000&&!CHIPS.some(([v])=>v===m)) list.unshift([m,'MIN '+cmp$(m).replace('$',''),'#7d6534']); if(m>1000&&list.length<4){ const cols=['#2b3a5c','#24533e','#4a2440']; [2.5,5,10].forEach((k,i)=>{ const v=typeof nice==='function'?nice(m*k):m*k; if(!list.some(c=>c[0]===v)) list.push([v,cmp$(v).replace('$',''),cols[i]]); }); } if(S.chip<m) S.chip=m; return chipsRow(list); };
const chipsRow=list=>`<div class="chips">${list.map(([v,l,c])=>`<button class="chip ${S.chip===v?'on':''}" style="--cc:${c};--ct:${v===500000?'#2a1d15':'#f3ead8'}" data-a="chip" data-v="${v}"><span>${l}</span></button>`).join('')}<button class="chip custom ${list.some(c=>c[0]===S.chip)?'':'on'}" style="--cc:#121216;--ct:#ecd9a8" data-a="chipCustom" aria-label="Custom chip amount"><span>${list.some(c=>c[0]===S.chip)?'Custom':cmp$(S.chip).replace('$','')}</span></button></div>`;
const SUITS=['♠','♥','♦','♣'], RN={11:'J',12:'Q',13:'K',14:'A'};
function newDeck(n=1){const d=[];for(let k=0;k<n;k++)for(let s=0;s<4;s++)for(let r=2;r<=14;r++)d.push({r,s});for(let i=d.length-1;i>0;i--){const j=rint(i+1);[d[i],d[j]]=[d[j],d[i]];}return d;}
function cardHTML(c,opts={}){
  if(!c||opts.back) return `<div class="pcard back" style="animation-delay:${opts.d||0}ms"></div>`;
  const red=c.s===1||c.s===2, r=RN[c.r]||c.r;
  const fresh=!c._shown; c._shown=true;
  return `<div class="pcard ${red?'red':''} ${opts.cls||''}" style="${fresh?`animation-delay:${opts.d||0}ms`:'animation:none'}" ${opts.attr||''}><div class="c1">${r}<small>${SUITS[c.s]}</small></div><div class="pip">${SUITS[c.s]}</div><div class="c2">${r}<small>${SUITS[c.s]}</small></div></div>`;
}
