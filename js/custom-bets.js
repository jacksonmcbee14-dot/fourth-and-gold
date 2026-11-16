// Custom bets: type any amount instead of picking a preset. One pop-up, used by the casino chips
// (roulette, blackjack, craps), video poker, slots, the casino duels and challenge stakes.
// (The sportsbook slip already has a box to type any stake.)

const AMT={o:null};
// o: {title, value, max, min, note, onSet(v), onCancel()}
function askAmount(o){
  AMT.o=o; const max=Math.max(0,Math.floor(o.max)), v=Math.min(o.value||0,max);
  modal(`<div class="fgm-k">${esc(o.title||'Custom amount')}</div>
    <input class="input mono cust-in" id="custAmt" inputmode="numeric" autocomplete="off" value="${v?v.toLocaleString('en-US'):''}" placeholder="0" aria-label="Amount">
    <div class="cust-quick">${[['half','½'],['double','2×'],['10000','+10K'],['100000','+100K'],['1000000','+1M'],['max','Max']].map(([k,l])=>`<button data-a="amtQuick" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="small muted" style="text-align:center;margin:8px 0">${esc(o.note||'')}${o.note?' · ':''}Up to ${fmt$(max)}</div>
    <div class="small" id="lgMsg" style="min-height:18px;color:var(--loss-hi);text-align:center"></div>
    <div class="fgm-row"><button class="btn" data-a="amtCancel">Cancel</button><button class="btn gold" data-a="amtSet">Set amount</button></div>`,'stay');
  const inp=document.getElementById('custAmt');
  inp.addEventListener('input',()=>{ const n=+inp.value.replace(/\D/g,''); inp.value=n?n.toLocaleString('en-US'):''; });
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter') ACT.amtSet(); });
  setTimeout(()=>{ inp.focus(); inp.select(); },60);
}
const custVal=()=>{ const i=document.getElementById('custAmt'); return i?+i.value.replace(/\D/g,''):0; };
Object.assign(ACT,{
  amtQuick:el=>{ const o=AMT.o; if(!o) return; const i=document.getElementById('custAmt'); let n=custVal(), k=el.dataset.v;
    n=k==='half'?Math.floor(n/2):k==='double'?n*2:k==='max'?Math.floor(o.max):n+(+k); n=Math.min(n,Math.floor(o.max)); i.value=n?n.toLocaleString('en-US'):''; },
  amtSet:()=>{ const o=AMT.o; if(!o) return; const n=custVal(), min=o.min||1;
    if(n<min){ const m=$('#lgMsg'); if(m) m.textContent='Enter at least '+fmt$(min)+'.'; return; }
    if(n>o.max){ const m=$('#lgMsg'); if(m) m.textContent='That’s more than '+fmt$(o.max)+'.'; return; }
    AMT.o=null; closeModal(); o.onSet(n); },
  amtCancel:()=>{ const o=AMT.o; AMT.o=null; closeModal(); if(o&&o.onCancel) o.onCancel(); },
  // casino chips: roulette, blackjack and craps add this amount per tap
  chipCustom:()=>askAmount({title:'Custom chip',value:S.chip,min:typeof tableMin==='function'?tableMin():1,max:Math.max(1000,Math.min(S.bank,typeof tableMax==='function'?tableMax():Infinity)),note:'Each tap on the table adds this much',onSet:v=>{ S.chip=v; save(); render(); }}),
  vpCustom:()=>{ if(VP.phase!=='bet') return; askAmount({title:'Custom coin size',value:VP.unit,min:typeof tableMin==='function'?Math.ceil(tableMin()/VP.coins):1,max:Math.max(1000,Math.floor(Math.min(S.bank,typeof tableMax==='function'?tableMax():Infinity)/VP.coins)),note:'Your bet is coin × coins ('+VP.coins+')',onSet:v=>{ VP.unit=v; render(); }}); },
  slCustom:()=>{ if(SL.spinning||SL.fs>0) return; askAmount({title:'Custom slot bet',value:S.slotBet,max:Math.max(2000,Math.min(S.bank,typeof tableMax==='function'?tableMax():Infinity)),min:typeof slotMin==='function'?slotMin():1000,note:'$250K or more plays for the progressive Grand',onSet:v=>{ S.slotBet=v; save(); slUI(); }}); },
  duelCustom:()=>{ if(DUEL.busy) return; askAmount({title:'Custom chips',value:DUEL.amt,max:DUEL.chips,note:'Duel chips',onSet:v=>{ DUEL.amt=v; duelDraw(); },onCancel:()=>duelDraw()}); },
  chStakeCustom:()=>askAmount({title:'Custom stake',value:CHN.stake||500000,max:S.bank,note:'You both put this up; winner takes it all',onSet:v=>{ CHN.stake=v; CHN.staked=true; chStep(); },onCancel:()=>chStep()}),
});
