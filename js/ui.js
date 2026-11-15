// Simpler screens: "More" sections, tappable betting terms, "Why it matters", shorter score lists, Simple/Full betting.
// Your choices (open sections, Simple/Full, Show all) are kept in S.ui, so they're remembered between visits.

function uiState(){ S.ui=Object.assign({book:'simple',more:{},all:{}},S.ui||{}); S.ui.more=S.ui.more||{}; S.ui.all=S.ui.all||{}; return S.ui; }
uiState();
if(!S.ui.v2){ S.ui.v2=1; if(S.ftab==='home') S.ftab='today'; }

/* ---------- More ---------- */
function more(key,html,label){
  const open=!!uiState().more[key];
  return `<button class="morebtn" data-a="more" data-k="${key}">${open?'Less':(label||'More')} <span>${open?'▴':'▾'}</span></button>${open?`<div class="morebox">${html}</div>`:''}`;
}
// A card: one headline number, one plain sentence, everything else behind "More".
function card(key,head,line,moreHTML,opts={}){
  return `<section class="card ${opts.cls||''}" ${opts.style?`style="${opts.style}"`:''}>${opts.top||''}<div class="headline">${head}</div><p class="line">${line}</p>${opts.after||''}${moreHTML?more(key,moreHTML,opts.label):''}</section>`;
}
function playoffLine(p,team,what){
  what=what||'the playoffs';
  if(p>=.95) return `Basically a lock — ${team} would have to collapse to miss ${what}.`;
  if(p>=.75) return `In great shape — keep winning and ${team} are in ${what}.`;
  if(p>=.5) return `Better than a coin flip to make ${what}, but every game matters.`;
  if(p>=.25) return `On the bubble — ${team} need wins and a little help to make ${what}.`;
  return `A long shot — ${team} need to win out and get lucky to make ${what}.`;
}
const poss=n=>/s$/i.test(n)?n+'’':n+'’s';

/* ---------- Tappable terms ---------- */
function term(k,label){return `<button class="term" data-a="term" data-k="${k}">${label}</button>`;}
function exampleGames(){const gs=allGames().filter(betable);return [gs.find(g=>g.mine)||gs[0],gs.find(g=>g!==(gs.find(x=>x.mine)||gs[0]))].filter(Boolean);}
const TERMS={
  spread:()=>{const [g]=exampleGames(); if(!g) return ['Spread','The spread evens out a mismatch: the favorite has to win by more than the number for a spread bet on them to pay.',''];
    const M=market(g), fav=M.spH<0?g.h:g.a, dog=fav===g.h?g.a:g.h, L=Math.abs(M.spH);
    return ['Spread','The spread evens out a mismatch: the favorite has to win by more than the number for a spread bet on them to pay.',`${fav.name} −${L}: they must win by ${Math.ceil(L)} or more. ${dog.name} +${L} pays if they win or lose by ${Math.floor(L)} or less.`];},
  moneyline:()=>{const [g]=exampleGames(); const d='A moneyline bet is simply picking who wins; the payout depends on how likely that team is to win.'; if(!g) return ['Moneyline',d,''];
    const M=market(g), w=o=>fmt$(payoutFor(100,o)-100);
    return ['Moneyline',d,`$100 on ${g.a.name} (${oddsTxt(M.mlA)}) wins ${w(M.mlA)}; $100 on ${g.h.name} (${oddsTxt(M.mlH)}) wins ${w(M.mlH)}.`];},
  parlay:()=>{const gs=exampleGames(); const d='A parlay joins several picks into one bet: every pick has to win, but the payouts multiply together.'; if(gs.length<2) return ['Parlay',d,''];
    const fav=g=>{const M=market(g);return M.ph>=.5?[g.h.name,M.mlH]:[g.a.name,M.mlA];}, [a,oa]=fav(gs[0]), [b,ob]=fav(gs[1]);
    return ['Parlay',d,`${a} to win plus ${b} to win: $10,000 pays ${fmt$(10000*decOf(oa)*decOf(ob))} back if both win (vs ${fmt$(10000*decOf(oa))} for ${a} alone).`];},
  seed:()=>{const K=myN(),t=NFL[K],s=SEEDS[t.conf].indexOf(K)+1;
    return ['Seed','Seeds rank the 7 playoff teams in each conference from 1 to 7; better seeds play at home.',s?`If the season ended today, the ${t.n} would be the #${s} seed in the ${t.conf}.`:`If the season ended today, the ${t.n} would miss the top 7 in the ${t.conf}.`];},
  wildcard:()=>{const c=S.conf||'NFC', w=SEEDS[c].slice(4,7).map(k=>NFL[k].n);
    return ['Wild card','Wild cards are the three playoff teams (seeds 5–7) that make it without winning their division.',`In the ${c} today: ${w.join(', ')}.`];},
  bye:()=>{const n=k=>NFL[k].n;
    return ['Bye','A bye lets a team skip the first playoff round: only the #1 seed in each NFL conference, and the top 4 seeds in the college playoff, get one.',`Today that’s the ${n(SEEDS.NFC[0])} in the NFC and the ${n(SEEDS.AFC[0])} in the AFC.`];},
  odds:()=>{const [g]=exampleGames(); const d='American odds show the payout: a minus number is what you risk to win $100, a plus number is what $100 wins.'; if(!g) return ['American odds',d,''];
    const M=market(g), f=(t,o)=>o<0?`${t.name} ${o} means risk $${-o} to win $100`:`${t.name} +${o} means $100 wins $${o}`;
    return ['American odds',d,`${f(g.a,M.mlA)}; ${f(g.h,M.mlH)}.`];},
};
let TERMPOP=null;
function closeTerm(){ if(TERMPOP){TERMPOP.remove();TERMPOP=null;} }
document.addEventListener('click',()=>closeTerm(),true);   // any tap closes an open explanation

/* ---------- Why it matters (from the existing playoff model) ---------- */
const WHY=new WeakMap();
function whyText(g){
  if(!g||!g.mine||g.s==='final'||g.s==='await') return '';
  const lg=g.lg, near2=(a,b)=>Math.abs(new Date(a)-new Date(b))<4*864e5;
  const sched=lg==='nfl'?MY_NSCHED:MY_CSCHED, me=lg==='nfl'?myN():myC(), opp=g.a.ab===me?g.h.ab:g.a.ab;
  const i=sched.findIndex(x=>!x.done&&(lg==='nfl'?x.o:x.ab)===opp&&near2(x.t,g.t)); if(i<0) return '';
  const base=lg==='nfl'?NFLM:CFBM; let c=WHY.get(base); if(!c){c={};WHY.set(base,c);}
  const key=me+':'+i;
  if(!c[key]){
    const f=v=>sched.map((x,j)=>j===i?v:'A');
    if(lg==='nfl'){const w=nflRun(nflAgg(),2000,f('W')),l=nflRun(nflAgg(),2000,f('L'));c[key]=[w.t[me].po/w.n,l.t[me].po/l.n,base.t[me].po/base.n];}
    else{const n=meC().n,o=v=>({g:f(v),b12:'auto',utahL:false,ttuL:false}),w=cfbRun(cfbAgg(),2000,o('W')),l=cfbRun(cfbAgg(),2000,o('L'));c[key]=[w.t[n].po/w.n,l.t[n].po/l.n,base.t[n].po/base.n];}
  }
  const [w,l,now]=c[key], name=lg==='nfl'?'the '+NFL[me].n:meC().n;
  return `Why it matters: a win puts ${poss(name)} playoff chances at ${pct(w)}, a loss at ${pct(l)} (${pct(now)} now).`;
}
const whyHTML=g=>{const t=whyText(g);return t?`<div class="why">${t}</div>`:'';};

/* ---------- Score lists: your teams + the 3 biggest games ---------- */
function importance(g){
  const pq=p=>p*(1-p);
  if(g.lg==='nfl') return (NFL[g.a.ab]?pq(nflP(g.a.ab)):0)+(NFL[g.h.ab]?pq(nflP(g.h.ab)):0)+(g.s==='live'?.1:0);
  const c=t=>{const x=CFB.find(z=>z.ab===t.ab);return x?pq(cfbP(x.n))+(26-x.r)/200:0;};
  return c(g.a)+c(g.h)+(g.s==='live'?.1:0);
}
function gamesList(key,games){
  if(!games.length) return `<div class="empty">No games this week yet.</div>`;
  const all=!!uiState().all[key];
  const top=games.filter(g=>!g.mine).sort((a,b)=>importance(b)-importance(a)).slice(0,3);
  const shown=all?games:games.filter(g=>g.mine||top.includes(g));
  return `<div class="games">${shown.map(gameRow).join('')}</div>${games.length>shown.length||all?`<button class="btn ghost wide" data-a="showAll" data-k="${key}">${all?'Show fewer':'Show all '+games.length+' games'}</button>`:''}`;
}

/* ---------- Actions ---------- */
Object.assign(ACT,{
  more:el=>{const u=uiState();u.more[el.dataset.k]=!u.more[el.dataset.k];save();render();},
  showAll:el=>{const u=uiState();u.all[el.dataset.k]=!u.all[el.dataset.k];save();render();},
  bookMode:el=>{const u=uiState();u.book=el.dataset.v;if(u.book==='simple'){S.slipMode='single';if(S.btab==='futures')S.btab='games';}save();render();},
  term:el=>{const f=TERMS[el.dataset.k];if(!f)return;const [t,d,ex]=f();
    setTimeout(()=>{closeTerm();TERMPOP=document.createElement('div');TERMPOP.className='termpop';TERMPOP.innerHTML=`<b>${esc(t)}</b><p>${esc(d)}</p>${ex?`<p class="muted">${esc(ex)}</p>`:''}`;document.body.appendChild(TERMPOP);},0);},
  suggest:()=>{const s=suggestion();if(!s)return;S.stake=s.stake;const k=s.g.id+':ml:'+s.s;if(!S.slip.some(l=>l.k===k))ACT.pick({dataset:{g:s.g.id,m:'ml',s:s.s}});openSlip();},
});
