// Shared casino pieces: chips, deck of cards, card drawing
/* =========================================================
   CASINO
   ========================================================= */
const CHIPS=[[1000,'1K','#2b3a5c'],[5000,'5K','#7d1f2a'],[25000,'25K','#24533e'],[100000,'100K','#4a2440'],[500000,'500K','#e9dcc0']];
const chipsHTML=()=>`<div class="chips">${CHIPS.map(([v,l,c])=>`<button class="chip ${S.chip===v?'on':''}" style="--cc:${c};--ct:${v===500000?'#2a1d15':'#f3ead8'}" data-a="chip" data-v="${v}"><span>${l}</span></button>`).join('')}<button class="chip custom ${CHIPS.some(c=>c[0]===S.chip)?'':'on'}" style="--cc:#121216;--ct:#ecd9a8" data-a="chipCustom" aria-label="Custom chip amount"><span>${CHIPS.some(c=>c[0]===S.chip)?'Custom':cmp$(S.chip).replace('$','')}</span></button></div>`;
const SUITS=['♠','♥','♦','♣'], RN={11:'J',12:'Q',13:'K',14:'A'};
function newDeck(n=1){const d=[];for(let k=0;k<n;k++)for(let s=0;s<4;s++)for(let r=2;r<=14;r++)d.push({r,s});for(let i=d.length-1;i>0;i--){const j=rint(i+1);[d[i],d[j]]=[d[j],d[i]];}return d;}
function cardHTML(c,opts={}){
  if(!c||opts.back) return `<div class="pcard back" style="animation-delay:${opts.d||0}ms"></div>`;
  const red=c.s===1||c.s===2, r=RN[c.r]||c.r;
  const fresh=!c._shown; c._shown=true;
  return `<div class="pcard ${red?'red':''} ${opts.cls||''}" style="${fresh?`animation-delay:${opts.d||0}ms`:'animation:none'}" ${opts.attr||''}><div class="c1">${r}<small>${SUITS[c.s]}</small></div><div class="pip">${SUITS[c.s]}</div><div class="c2">${r}<small>${SUITS[c.s]}</small></div></div>`;
}
