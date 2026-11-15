// The bar: Mack the bartender greets you based on how you're doing and pours you a drink to carry around.

const DRINKS=[
  {id:'cocoa',  name:'Hot cocoa',     price:1000, cup:'#6b3a1f', top:'#f3ead8', glass:'#f3ead8', line:'Extra marshmallows. Warms you right up.'},
  {id:'cider',  name:'Spiced cider',  price:2000, cup:'#c9782c', top:'#e8963c', glass:'#f3ead8', line:'Fresh off the stove, cinnamon and all.'},
  {id:'eggnog', name:'Eggnog',        price:3000, cup:'#efe1b8', top:'#c8a45c', glass:'#cfd9e0', line:'Grandma’s recipe. Don’t ask what’s in it.'},
  {id:'oldfash',name:'Old fashioned', price:5000, cup:'#b8632a', top:'#e8963c', glass:'#cfd9e0', line:'Big cube, orange peel. A closer’s drink.'},
];
const DRINK_MS=10*60e3;   // you carry it around for ten minutes

function barGreeting(){
  const sc=scoreNow(), debt=S.debt||0, last=S.bets.filter(b=>b.st==='won'||b.st==='lost').slice(-3);
  const name=(typeof PROF!=='undefined'&&PROF.me&&PROF.me.name)?PROF.me.name.split(' ')[0]:'friend';
  if(debt>0) return `Running a tab with the house, ${name}? First cocoa’s on me.`;
  if(sc>=10e6) return `Well, if it isn’t ${name}. Hall of Famer drinks top shelf.`;
  if(sc>=5e6) return `Evening, high roller. The usual, ${name}?`;
  if(last.length===3&&last.every(b=>b.st==='won')) return `Three straight winners! ${name}, you’re on a heater.`;
  if(sc>=2e6) return `Look who’s doing just fine. What’ll it be, ${name}?`;
  if(sc>=START_BANK) return `Welcome back, ${name}. Fire’s warm, drinks are cold.`;
  if(sc>=500000) return `Rough night, ${name}? Something warm’ll help.`;
  return `Oof. Sit down, ${name}. Cards’ll turn — they always do.`;
}
function drinkPrice(d){ return (d.id==='cocoa'&&(S.debt||0)>0)?0:d.price; }

function openBar(){
  const box=LODGE.el.querySelector('.lg-dialog')||(()=>{const b=document.createElement('div');b.className='lg-dialog';LODGE.el.querySelector('.lg-stage').appendChild(b);return b;})();
  const held=heldDrink();
  box.innerHTML=`<div class="lg-dlg-who">MACK · BARTENDER</div><div class="lg-dlg-text" id="lgSay"></div>
    <div class="lg-drinks">${DRINKS.map(d=>{const pr=drinkPrice(d);return `<button class="lg-btn lg-drink" data-lg="drink" data-id="${d.id}" ${pr>S.bank?'disabled':''}><i style="--c:${d.cup};--t:${d.top}"></i>${esc(d.name)}<b>${pr?k$(pr):'FREE'}</b></button>`;}).join('')}</div>
    <button class="lg-btn" data-lg="barClose">${held?'Cheers — back to the room':'Maybe later'}</button>`;
  box.classList.add('on'); typeSay(barGreeting());
}
function typeSay(txt){ const el=document.getElementById('lgSay'); if(!el) return; let i=0; clearInterval(el._t);
  el._t=setInterval(()=>{ i+=2; el.textContent=txt.slice(0,i); if(i%6===0) tone(300+Math.random()*80,.03,'square',.015); if(i>=txt.length) clearInterval(el._t); },28); }
function closeBar(){ const b=LODGE.el&&LODGE.el.querySelector('.lg-dialog'); if(b) b.classList.remove('on'); }
function orderDrink(id){
  const d=DRINKS.find(x=>x.id===id); if(!d) return; const pr=drinkPrice(d);
  if(pr>S.bank){ toast('Not enough in the bankroll','loss'); return; }
  if(pr) setBank(-pr);
  S.lodge.drink={id,until:Date.now()+DRINK_MS}; save();
  LODGE.pour=performance.now();
  tone(880,.08,'triangle',.06); setTimeout(()=>tone(1320,.12,'triangle',.05),120);
  typeSay(`${d.name}, coming up. ${d.line}`);
  const box=LODGE.el.querySelector('.lg-dialog .lg-btn[data-lg=barClose]'); if(box) box.textContent='Cheers — back to the room';
  hudBank();
}
function heldDrink(){ const h=S.lodge.drink; if(!h||h.until<Date.now()) return null; return DRINKS.find(d=>d.id===h.id)||null; }
// Draw the drink in your hand (with steam if it's hot).
function drawHeld(ctx,x,y,face,t){
  const d=heldDrink(); if(!d) return;
  const hx=Math.round(x+(face<0?-8:5)), hy=Math.round(y-12);
  rect(ctx,hx,hy,3,4,d.glass); rect(ctx,hx,hy+1,3,3,d.cup); rect(ctx,hx,hy,3,1,d.top);
  if(d.id==='oldfash') rect(ctx,hx+1,hy+1,1,1,'#f3ead8');
  if(d.id==='cocoa'||d.id==='cider'){ for(let i=0;i<2;i++){ const k=((t*.8+i*.5)%1); if(k<.8) rect(ctx,hx+1+Math.round(Math.sin(t*3+i*2)),hy-2-Math.round(k*4),1,1,'#cfd9e0'); } }
}
Object.assign(LG_ACT,{
  drink:b=>orderDrink(b.dataset.id),
  barClose:()=>closeBar(),
});
