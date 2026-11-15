// Shared helpers: money formatting, odds maths, toast, secure random numbers
/* =========================================================
   HELPERS
   ========================================================= */
const $=s=>document.querySelector(s);
const fmt$=n=>(n<0?'-$':'$')+Math.abs(Math.round(n)).toLocaleString('en-US');
const k$=n=>n>=1e6?('$'+(n/1e6).toFixed(n%1e6?1:0)+'M'):n>=1e3?('$'+Math.round(n/1e3)+'K'):'$'+n;
const pct=p=>(p>=.995?'>99':p<.005?'<1':Math.round(p*100))+'%';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function when(iso,tba){
  const d=new Date(iso);
  const day=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  if(tba) return day+' · Time TBA';
  return day+' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}
function american(p){
  p=clamp(p,.01,.99);
  const v= p>=.5 ? -Math.round(100*p/(1-p)/5)*5 : Math.round(100*(1-p)/p/5)*5;
  return v;
}
const oddsTxt=o=>o>0?'+'+o:String(o);
const payoutFor=(stake,o)=>o>0?stake*(1+o/100):stake*(1+100/(-o));
function withVig(p){ // book's price on each side: shade toward the house
  const v=.025; return [american(clamp(p+v,.01,.995)), american(clamp(1-p+v,.01,.995))];
}
function dotHTML(t){return `<span class="dot" style="--c:${t.col||'#3a2b1f'}">${esc(t.ab.slice(0,4))}</span>`}
function ring(p,label,size=104,stroke=8,col='url(#gg)'){
  const r=(size-stroke)/2, c=2*Math.PI*r;
  const id='g'+Math.random().toString(36).slice(2,7);
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ecd9a8"/><stop offset="1" stop-color="#a8843f"/></linearGradient></defs><circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="rgba(255,255,255,.12)" stroke-width="${stroke}" fill="none"/><circle class="arc" cx="${size/2}" cy="${size/2}" r="${r}" stroke="url(#${id})" stroke-width="${stroke}" stroke-linecap="round" fill="none" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c*(1-p)}"/></svg><div class="val"><div><b>${pct(p)}</b><span>${label}</span></div></div></div>`;
}
function animateRings(){requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll('circle.arc[data-off]').forEach(c=>c.style.strokeDashoffset=c.dataset.off)));}
function toast(msg,cls=''){const t=$('#toast');t.textContent=msg;t.className='on '+cls;clearTimeout(t._t);t._t=setTimeout(()=>t.className=cls,2400);}
function setBank(delta){
  S.bank=Math.round(S.bank+delta); if(S.bank>S.peak)S.peak=S.bank; save();
  const el=$('#bankVal'); el.textContent=fmt$(S.bank);
  if(delta>0){const b=$('#bankChip');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');}
}
function rec(t){return t.w+'–'+t.l+(t.t?'–'+t.t:'')}
const gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)*2;

/* =========================================================
   SECURE RANDOMNESS — every casino outcome comes from the
   browser's cryptographic random generator (crypto.getRandomValues)
   ========================================================= */
const _rb=new Uint32Array(256); let _ri=256;
function rng(){ if(_ri>=256){ crypto.getRandomValues(_rb); _ri=0; } return _rb[_ri++]/4294967296; }
const rint=n=>Math.floor(rng()*n);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const setText=(s,t)=>{const e=document.querySelector(s);if(e)e.textContent=t;};
const cmp$=n=>n>=1e6?'$'+(n/1e6).toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1')+'M':n>=1e3?'$'+(n/1e3).toFixed(n%1e3?1:0).replace(/\.0$/,'')+'K':'$'+Math.round(n);

