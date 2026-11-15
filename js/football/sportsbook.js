// Sportsbook: prices, bet slip, settling bets
/* ---------- Bets (sportsbook) ---------- */
function gameProb(g){ // probability the HOME team wins, before kickoff
  if(g.p!=null) return g.p;
  if(g.lg==='nfl'&&NFL[g.a.ab]&&NFL[g.h.ab]){const adj=g.neutral?0:40;return pVs(NFL[g.h.ab].elo+adj,NFL[g.a.ab].elo);}
  return .5;
}
const SIG={nfl:13.5,cfb:16};
function Phi(x){const t=1/(1+.2316419*Math.abs(x)),d=.3989423*Math.exp(-x*x/2);const p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return x>0?1-p:p;}
function probit(p){let lo=-6,hi=6;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(Phi(m)<p)lo=m;else hi=m;}return (lo+hi)/2;}
function liveFrac(g){
  if(g.s!=='live')return 1;
  const qm=(g.clock||'').match(/(\d)(st|nd|rd|th)/i), q=g.q||(qm?+qm[1]:/half/i.test(g.clock||'')?2:1);
  const cm=(g.clock||'').match(/(\d{1,2}):(\d{2})/), rem=cm?(+cm[1]+ +cm[2]/60):(/half/i.test(g.clock||'')?0:7.5);
  return clamp(((4-Math.min(q,4))*15+rem)/60,.01,1);
}
function market(g){
  const sig=SIG[g.lg]||14, m0=sig*probit(clamp(gameProb(g),.02,.98)), tot0=g.total||(g.lg==='nfl'?44.5:52.5);
  let mu=m0,sd=sig,tot=tot0;
  if(g.s==='live'){const f=liveFrac(g),d=(g.hs||0)-(g.as||0);mu=d+m0*f;sd=Math.max(1.5,sig*Math.sqrt(f));tot=(g.as||0)+(g.hs||0)+tot0*f;}
  const ph=clamp(Phi(mu/sd),.02,.98), [mlH,mlA]=withVig(ph);
  const spH=Math.floor(-mu)+.5;
  return {ph,mlH,mlA,spH,spA:-spH,tot:Math.floor(tot)+.5};
}
const decOf=o=>o>0?1+o/100:1+100/(-o);
const amOf=d=>d>=2?Math.round((d-1)*100):-Math.round(100/(d-1));
const sgn=x=>(x>0?'+':x<0?'−':'')+Math.abs(x);
const betable=g=>g.s==='pre'||(g.s==='live'&&g.as!=null&&g.hs!=null);
function bookCard(g){
  const M=market(g), live=g.s==='live';
  const cell=(m,s,top,o)=>{const k=g.id+':'+m+':'+s, on=S.slip.some(l=>l.k===k);return `<button class="cell ${on?'on':''}" data-a="pick" data-g="${g.id}" data-m="${m}" data-s="${s}">${top?`<span>${top}</span>`:''}<b>${oddsTxt(o)}</b></button>`;};
  const rk=t=>t.rank?`<i>${t.rank}</i>`:'';
  return `<div class="book ${g.mine?'mine':''}"><div class="bk-h">${live?`<span><span class="livebadge">LIVE</span>&nbsp; ${esc(g.clock||'')}</span>`:`<span>${esc(when(g.t,g.tba))}</span>`}<span>${esc((g.neutral?g.neutral+' · ':'')+(g.tv||''))}</span></div>
  <div class="bk-g"><span></span><span class="bk-c">${term('spread','Spread')}</span><span class="bk-c">Total</span><span class="bk-c">${term('moneyline','Money')}</span>
  <div class="bk-t">${dotHTML(g.a)}<span class="nm">${rk(g.a)}${esc(g.a.name)}</span>${live?`<b class="mono">${g.as}</b>`:''}</div>${cell('sp','a',sgn(M.spA),-110)}${cell('tot','o','O '+M.tot,-110)}${cell('ml','a','',M.mlA)}
  <div class="bk-t">${dotHTML(g.h)}<span class="nm">${rk(g.h)}${esc(g.h.name)}</span>${live?`<b class="mono">${g.hs}</b>`:''}</div>${cell('sp','h',sgn(M.spH),-110)}${cell('tot','u','U '+M.tot,-110)}${cell('ml','h','',M.mlH)}
  </div>${g.mine?whyHTML(g):''}</div>`;
}
// Simple mode: just "who wins?", with the payout in plain dollars at your current bet amount.
function simpleCard(g){
  const M=market(g), live=g.s==='live', st=Math.max(1000,S.stake|0);
  const side=(t,s,o,sc)=>{const k=g.id+':ml:'+s,on=S.slip.some(l=>l.k===k);
    return `<button class="pickbtn ${on?'on':''}" data-a="pick" data-g="${g.id}" data-m="ml" data-s="${s}"><span class="pk-top">${dotHTML(t)}<span class="pk-nm">${t.rank?t.rank+' ':''}${esc(t.name)}</span>${live?`<b class="mono" style="margin-left:auto">${sc}</b>`:''}</span><span class="pk-pay">Bet ${fmt$(st)} to win ${fmt$(payoutFor(st,o)-st)}</span></button>`;};
  return `<div class="book simple ${g.mine?'mine':''}"><div class="bk-h">${live?`<span><span class="livebadge">LIVE</span>&nbsp; ${esc(g.clock||'')}</span>`:`<span>${esc(when(g.t,g.tba))}</span>`}<span>${esc((g.neutral?g.neutral+' · ':'')+(g.tv||''))}</span></div>
  <div class="pickrow">${side(g.a,'a',M.mlA,g.as)}${side(g.h,'h',M.mlH,g.hs)}</div>${g.mine?whyHTML(g):''}</div>`;
}
function futuresList(lg){
  const K=myN(), kk=K.toLowerCase(), N=NFL[K].n, me=meC(), cc=me.ab.toLowerCase().replace(/[^a-z]/g,'');
  // The 49ers and BYU keep their original bet ids; other teams get their own.
  const nid=x=>K==='SF'?'f_sf_'+x:'f_'+kk+'_'+x, cid=x=>me.ab==='BYU'?'f_byu_'+x:'f_'+cc+'_'+x;
  return lg==='nfl'?FUTURES_NFL.map(f=>({...f,mine:f.id==='f_sb_'+kk?1:undefined})).concat([{id:nid('po'),label:N+' make the playoffs',odds:american(Math.min(.97,nflP(K)+.02)),mine:1},{id:nid('1'),label:N+' clinch the #1 seed',odds:american(NFLM.t[K].s1/NFLM.n+.03),mine:1}]):
    [{id:cid('cfp'),label:me.n+' makes the College Football Playoff',odds:american(cfbP(me.n)+.03),mine:1}].concat(hasTitleGame()?[{id:cid(me.cf==='Big 12'?'b12':'conf'),label:me.n+' wins the '+me.cf,odds:american(CFBM.t[me.n].b12w/CFBM.n+.03),mine:1}]:[]).concat(me.n==='Utah'?[]:[{id:'f_utah_cfp',label:'Utah makes the College Football Playoff',odds:american(Math.min(.97,cfbP('Utah')+.02))}],me.n==='Georgia'?[]:[{id:'f_uga_1',label:'Georgia earns a top-4 seed',odds:american(Math.min(.97,CFBM.t.Georgia.bye/CFBM.n+.03))}]);
}
function viewBets(){
  const simple=uiState().book!=='full', open=S.bets.filter(b=>b.st==='open'), blg=S.blg||'all';
  const sub=simple&&S.btab==='futures'?'games':S.btab, CARD=simple?simpleCard:bookCard;
  let body='';
  if(sub==='games'){
    const gs=allGames(blg==='all'?null:blg);
    const live=gs.filter(g=>g.s==='live'&&betable(g)), pre=gs.filter(g=>g.s==='pre'), wait=gs.filter(g=>g.s==='inprog'||(g.s==='live'&&!betable(g)));
    const days={}; pre.forEach(g=>{const d=new Date(g.t).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});(days[d]=days[d]||[]).push(g);});
    body=`<div class="seg" style="margin-bottom:12px">${[['all','All'],['nfl','NFL'],['cfb','College']].map(([v,l])=>`<button data-a="blg" data-v="${v}" class="${blg===v?'on':''}">${l}</button>`).join('')}</div>
    ${simple?`<div class="hint">Tap the team you think will win — a ${term('moneyline','moneyline')} bet. Switch to Full for spreads, totals, parlays and futures.</div>`:`<div class="hint">Tap any price to add it to your slip. <b class="gold">${term('spread','Spread')}</b>: the team has to win by more than the number (or lose by less). <b class="gold">Total</b>: both scores added together, over or under. <b class="gold">${term('moneyline','Money')}</b>: just pick the winner. Prices are ${term('odds','American odds')}.</div>`}`+
    (live.length?`<div class="sechead" style="margin-top:6px"><h2><span class="livebadge" style="font-family:var(--sans);font-size:12px;vertical-align:middle">LIVE</span> In play</h2><span class="aside">${syncChip()}</span></div><div class="games">${live.map(CARD).join('')}</div>`:'')+
    (wait.length?`<div class="small muted" style="margin:10px 2px">${wait.map(g=>esc(g.a.name+' @ '+g.h.name)).join(', ')} — live odds open once the score syncs.</div>`:'')+
    Object.entries(days).map(([d,list])=>`<div class="sechead"><h2>${d.split(',')[0]}</h2><span class="aside">${d.split(',').slice(1).join(',')}</span></div><div class="games">${list.map(CARD).join('')}</div>`).join('')+
    (!live.length&&!pre.length?`<div class="empty">No open games right now. New lines post as the schedule fills in.</div>`:'');
  } else if(sub==='futures'){
    const list=futuresList('nfl').map(f=>({...f,lg:'NFL'})).concat(futuresList('cfb').map(f=>({...f,lg:'College'})));
    body=`<div class="hint">Futures pay when the season answers the question. Bigger plus number = bigger long shot.</div><div class="games">${list.map(f=>{const on=S.slip.some(l=>l.k==='F:'+f.id);return `<button class="fut ${f.mine?'mine':''} ${on?'on':''}" data-a="pickF" data-id="${f.id}" data-l="${esc(f.label)}" data-o="${f.odds}"><span><span class="eyebrow" style="font-size:9.5px">${f.lg}</span><br><span style="font-weight:600">${esc(f.label)}</span></span><span class="mono gold" style="font-weight:700">${oddsTxt(f.odds)}</span></button>`}).join('')}</div>`;
  } else {
    const all=S.bets.slice().reverse();
    const net=S.bets.reduce((s,b)=>s+(b.st==='won'?b.pay-b.stake:b.st==='lost'?-b.stake:0),0);
    body=card('',`<span style="color:${net>=0?'var(--win)':'var(--loss-hi)'}">${net>=0?'+':'-'}${fmt$(Math.abs(net))}</span>`,`Your record on settled bets is ${S.picks.w}–${S.picks.l}, with ${open.length} bet${open.length===1?'':'s'} still open.`,'',{top:'<div class="eyebrow">Net from football bets</div>',style:'margin-bottom:14px'})+
    (all.length?`<div class="games">${all.map(b=>`<div class="mybet"><div style="font-weight:600">${b.legs.length>1?b.legs.length+'-leg parlay':esc(b.legs[0].label)}</div><div class="st ${b.st}">${b.st}</div>
      <div class="small muted" style="grid-column:1/-1">${b.legs.map(l=>`${l.r==='won'?'<span style="color:var(--win)">✓</span> ':l.r==='lost'?'<span style="color:var(--loss)">✕</span> ':''}${b.legs.length>1?esc(l.label)+' · ':''}${esc(l.sub||'')}`).join('<br>')}</div>
      <div class="small muted">${fmt$(b.stake)} at ${oddsTxt(amOf(b.dec))}</div><div class="small mono" style="text-align:right">${b.st==='won'?'+'+fmt$(b.pay-b.stake):b.st==='lost'?'-'+fmt$(b.stake):b.st==='push'?'Refunded':'To win '+fmt$(b.pay-b.stake)}</div></div>`).join('')}</div>`:`<div class="empty">No bets yet. Every game on the board is open — go find one.</div>`);
  }
  const atStake=open.reduce((s,b)=>s+b.stake,0);
  return `<div class="between" style="margin-bottom:18px"><div class="seg"><button data-a="bookMode" data-v="simple" class="${simple?'on':''}">Simple</button><button data-a="bookMode" data-v="full" class="${simple?'':'on'}">Full</button></div></div>
  ${card('',fmt$(S.bank),open.length?`You have ${fmt$(atStake)} riding on ${open.length} open bet${open.length===1?'':'s'}.`:'Play money only — pick a game below to place a bet.','',{top:'<div class="eyebrow">Sportsbook · play money</div>',style:'margin-bottom:18px'})}
  <div class="seg subtabs" style="display:grid;grid-template-columns:repeat(${simple?2:3},1fr)"><button data-a="btab" data-v="games" class="${sub==='games'?'on':''}">Games</button>${simple?'':`<button data-a="btab" data-v="futures" class="${sub==='futures'?'on':''}">Futures</button>`}<button data-a="btab" data-v="mine" class="${sub==='mine'?'on':''}">My bets${open.length?' · '+open.length:''}</button></div>
  ${body}`;
}
let SLIP=null;
function slipCalc(){
  const legs=S.slip, gl=legs.filter(l=>l.gid), canPar=legs.length>=2&&!legs.some(l=>l.fid)&&new Set(gl.map(l=>l.gid)).size===gl.length;
  if(!canPar&&S.slipMode==='parlay')S.slipMode='single';
  const par=S.slipMode==='parlay'&&canPar, dec=legs.reduce((p,l)=>p*decOf(l.odds),1), stake=Math.max(0,S.stake|0);
  const risk=par?stake:stake*legs.length, pay=par?stake*dec:legs.reduce((s,l)=>s+stake*decOf(l.odds),0);
  return {legs,canPar,par,dec,stake,risk,pay};
}
function openSlip(){ if(!S.slip.length)return; SLIP=true; renderSlip(); $('#scrim').classList.add('on'); $('#sheet').classList.add('on'); }
function renderSlip(){
  const c=slipCalc(); if(!c.legs.length){closeSheet();return;}
  const amts=[1000,10000,50000,100000,250000];
  $('#sheet').innerHTML=`<div class="grab"></div><div class="between"><div class="eyebrow">Bet slip · ${c.legs.length} ${c.legs.length===1?'pick':'picks'}</div><button class="btn sm" data-a="slipClear">Clear all</button></div>
  <div class="legs">${c.legs.map((l,i)=>`<div class="leg"><div style="min-width:0"><div class="lt">${esc(l.label)}${l.live?' <span class="livebadge" style="font-size:9px">LIVE</span>':''}</div><div class="small muted">${esc(l.sub||'')}</div></div><div class="mono gold" style="font-weight:700">${oddsTxt(l.odds)}</div><button class="x" data-a="legX" data-i="${i}" aria-label="Remove">×</button></div>`).join('')}</div>
  ${c.legs.length>1&&uiState().book==='full'?`<div class="seg" style="display:grid;grid-template-columns:1fr 1fr;margin-top:12px"><button data-a="slipMode" data-v="single" class="${!c.par?'on':''}">Singles</button><button data-a="slipMode" data-v="parlay" class="${c.par?'on':''}" ${c.canPar?'':'disabled style="opacity:.4"'}>Parlay ${c.canPar?oddsTxt(amOf(c.dec)):'· one pick per game'}</button></div><div class="small muted" style="margin-top:8px">${term('parlay','What’s a parlay?')}</div>`:''}
  <div class="amts">${amts.map(v=>`<button class="${c.stake===v?'on':''}" data-a="stake" data-v="${v}">${k$(v)}</button>`).join('')}</div>
  <input class="input" id="amtIn" inputmode="numeric" value="${c.stake.toLocaleString()}" aria-label="${c.par||c.legs.length===1?'Stake':'Stake per bet'}">
  <div class="between" style="margin:12px 2px 2px"><span class="muted">${c.par||c.legs.length===1?'Stake':'Total risk ('+c.legs.length+' bets)'}</span><span class="mono" id="riskV">${fmt$(c.risk)}</span></div>
  <div class="between" style="margin:4px 2px 14px"><span class="muted">Potential payout</span><span class="mono" style="font-size:18px;font-weight:700;color:var(--win)" id="payout">${fmt$(c.pay)}</span></div>
  <button class="btn gold" style="width:100%;padding:15px" data-a="placeSlip" ${c.risk<=0||c.risk>S.bank?'disabled':''}>${c.risk>S.bank?'Not enough in bankroll':'Place '+(c.par?'parlay':c.legs.length>1?c.legs.length+' bets':'bet')+' · '+fmt$(c.risk)}</button>`;
  const inp=$('#amtIn');
  inp.oninput=()=>{S.stake=parseInt(inp.value.replace(/\D/g,''))||0;const d=slipCalc();$('#riskV').textContent=fmt$(d.risk);$('#payout').textContent=fmt$(d.pay);const b=$('[data-a=placeSlip]');b.disabled=d.risk<=0||d.risk>S.bank;b.textContent=d.risk>S.bank?'Not enough in bankroll':'Place '+(d.par?'parlay':d.legs.length>1?d.legs.length+' bets':'bet')+' · '+fmt$(d.risk);};
  inp.onblur=save;
}
function closeSheet(){$('#scrim').classList.remove('on');$('#sheet').classList.remove('on');SLIP=null;}
function slipBar(){
  const el=$('#slipbar'); if(!el)return;
  const show=S.mode==='football'&&S.slip.length>0&&!SLIP;
  el.classList.toggle('on',show);
  if(show){const c=slipCalc();el.innerHTML=`<span><b>${S.slip.length}</b> ${S.slip.length===1?'pick':'picks'} on your slip</span><span class="mono">${c.canPar&&S.slip.length>1?'Parlay '+oddsTxt(amOf(c.dec)):'Open slip'} ›</span>`;}
}
function legRes(l,gs){
  if(l.fid){const r=LIVE.futures&&LIVE.futures[l.fid];return r==='won'||r==='lost'||r==='push'?r:null;}
  const g=gs[l.gid]; if(!g||g.s!=='final'||g.as==null||g.hs==null)return null;
  const d=g.hs-g.as;
  if(l.m==='sp'){const v=(l.s==='h'?d:-d)+l.line;return v===0?'push':v>0?'won':'lost';}
  if(l.m==='tot'){const t=g.hs+g.as;return t===l.line?'push':((t>l.line)===(l.s==='o')?'won':'lost');}
  return d===0?'push':((d>0)===(l.s==='h')?'won':'lost');
}
function settleBets(){
  const gs={};allGames().forEach(g=>gs[g.id]=g);
  let net=0,changed=false;
  for(const b of S.bets){
    if(b.st!=='open')continue;
    const rs=b.legs.map(l=>legRes(l,gs)); b.legs.forEach((l,i)=>{if(rs[i])l.r=rs[i];});
    if(rs.includes('lost')) b.st='lost';
    else if(rs.every(r=>r)){ if(rs.every(r=>r==='push')){b.st='push';b.pay=b.stake;} else {b.st='won';b.pay=boostRet(Math.round(b.stake*b.legs.reduce((p,l,i)=>p*(rs[i]==='won'?decOf(l.odds):1),1)),b.stake,b.wx||1);} }
    else continue;
    changed=true;
    if(b.st==='won'){S.bank+=b.pay;net+=b.pay-b.stake;S.picks.w++;}
    else if(b.st==='push'){S.bank+=b.stake;}
    else {net-=b.stake;S.picks.l++;}
  }
  if(changed){ if(S.bank>S.peak)S.peak=S.bank; save(); $('#bankVal').textContent=fmt$(S.bank); toast(net>=0?`Bets settled · +${fmt$(net)}`:`Bets settled · -${fmt$(-net)}`, net>=0?'win':'loss'); }
}

