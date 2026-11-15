// Jingle Jackpot slot machine: screen, spinning, free games, jackpot bonus
/* ---------- Slot machine: Jingle Jackpot ---------- */
const SLOT_BETS=[2000,5000,10000,25000,50000,100000,250000];
const MAXBET=SLOT_BETS[SLOT_BETS.length-1];
const SL={stops:STRIPS.map(s=>rint(s.length)),spinning:false,quick:false,fs:0,fsTotal:0,auto:0,lineTimer:null,anims:[],lastWin:0};
const jpVal=t=>t.m*S.slotBet+(t.k==='grand'&&S.slotBet>=MAXBET?S.jp:0);
const cellHTML=(s,cls='')=>`<div class="cell ${cls}"><svg viewBox="0 0 100 100"><use href="#s-${s}"/></svg></div>`;
function reelHTML(r){const L=STRIPS[r].length,i=SL.stops[r];return `<div class="strip">${[0,1,2].map(k=>cellHTML(STRIPS[r][(i+k)%L])).join('')}</div>`;}
function ladderHTML(){
  const pl=t=>`<div class="jpl ${t.k}" data-k="${t.k}"><span>${t.n}</span><b class="mono" data-j="${t.k}">${cmp$(jpVal(t))}</b></div>`;
  return `<div class="ladder" id="ladder">${pl(JPT[0])}${pl(JPT[1])}<div class="jrow">${pl(JPT[2])}${pl(JPT[3])}${pl(JPT[4])}</div></div>`;
}
function viewSlots(){
  const bulbs=Array.from({length:16},(_,i)=>`<i style="--d:${(i*.09).toFixed(2)}s"></i>`).join('');
  const flakes=Array.from({length:24},()=>`<b style="left:${(rng()*100).toFixed(1)}%;--s:${(.5+rng()).toFixed(2)};--t:${(6+rng()*7).toFixed(1)}s;--dl:${(-rng()*12).toFixed(1)}s;--x:${((rng()-.5)*50).toFixed(0)}px"></b>`).join('');
  return `<div class="cab" id="cab">
    <div class="snow">${flakes}</div>
    <div class="marq">${bulbs}</div>
    
    ${ladderHTML()}
    <div class="reelwin"><div class="reels" id="reels">${[0,1,2,3,4].map(r=>`<div class="reel">${reelHTML(r)}</div>`).join('')}</div><div class="fsb" id="fsb"></div><div class="flash" id="flash"></div></div>
    <div class="meters"><div><span>Credit</span><b class="mono" id="slBal">${cmp$(S.bank)}</b></div><div class="wm"><span>Win</span><b class="mono" id="slWin">${SL.lastWin?fmt$(SL.lastWin):'—'}</b></div><div><span>Bet</span><b class="mono" id="slBet">${cmp$(S.slotBet)}</b></div></div>
    <div class="slmsg" id="slMsg">${SL.fs>0?SL.fs+' free games waiting — tap Spin':'Any spin can light the Golden Star'}</div>
    <div class="ctrl">
      <div class="betc"><button data-a="slBet" data-v="-1" aria-label="Lower bet">−</button><button data-a="slCustom" class="betcust" aria-label="Type a custom bet"><span>Bet · tap to type</span><b class="mono" id="slBet2">${cmp$(S.slotBet)}</b></button><button data-a="slBet" data-v="1" aria-label="Raise bet">+</button></div>
      <button class="spin" id="spinBtn" data-a="slSpin"><span>SPIN</span></button>
      <div class="side"><button class="pillb" id="autoBtn" data-a="slAuto">AUTO</button><button class="pillb ${S.turbo?'on':''}" id="turboBtn" data-a="slTurbo">TURBO</button><button class="pillb ${S.sound?'on':''}" id="sndBtn" data-a="slSound">${S.sound?'SOUND':'MUTED'}</button></div>
    </div>
  </div>`;
}
function slUI(){
  setText('#slBal',cmp$(S.bank));setText('#slBet',cmp$(S.slotBet));setText('#slBet2',cmp$(S.slotBet)+(S.slotBet>=MAXBET?' MAX':''));
  JPT.forEach(t=>setText(`[data-j=${t.k}]`,cmp$(jpVal(t))));
  const b=$('#spinBtn');if(b){b.classList.toggle('free',SL.fs>0&&!SL.spinning);b.classList.toggle('going',SL.spinning);b.firstChild.textContent=SL.spinning?'STOP':SL.fs>0?'FREE':'SPIN';}
  const a=$('#autoBtn');if(a){a.classList.toggle('on',SL.auto>0);a.textContent=SL.auto>0?'STOP '+SL.auto:'AUTO';}
  const on=SL.fs>0||SL.fsTotal>0, f=$('#fsb');if(f){f.classList.toggle('on',on);f.textContent=`Free games · ${SL.fs} left · wins ×${FS_MULT} · ${cmp$(SL.fsTotal)}`;}
  const c=$('#cab');if(c)c.classList.toggle('fsmode',on);
  document.querySelectorAll('[data-a=slBet],[data-a=slCustom]').forEach(x=>x.disabled=SL.spinning||SL.fs>0);
}
const cellsOf=r=>{const reel=document.querySelectorAll('#reels .reel')[r];return reel?[...reel.querySelectorAll('.cell')]:[];};
function clearLines(){clearInterval(SL.lineTimer);SL.lineTimer=null;document.querySelectorAll('#reels .cell').forEach(c=>c.classList.remove('hit','dim'));}
function showWins(wins,res){
  const all=[0,1,2,3,4].map(cellsOf);
  const mark=list=>{all.flat().forEach(c=>{c.classList.remove('hit');c.classList.add('dim');});list.forEach(([r,row])=>{const c=all[r]&&all[r][row];if(c){c.classList.remove('dim');c.classList.add('hit');}});};
  mark(wins.flatMap(w=>w.pos).concat(res.scat?res.scPos:[]));
  const seq=wins.map(w=>({pos:w.pos,w})).concat(res.scat?[{pos:res.scPos,w:null}]:[]);
  if(seq.length>1){let i=0;SL.lineTimer=setInterval(()=>{const s=seq[i++%seq.length];mark(s.pos);setText('#slMsg',s.w?`${s.w.n}× ${SYMNAME[s.w.sym]} · ${s.w.ways} way${s.w.ways>1?'s':''} · ${fmt$(s.w.amt)}`:`${res.sc} gift boxes · free games!`);},1500);}
}
function overlay(html,cls){const el=$('#bigwin');el.className='bw on '+cls;el.innerHTML=`<div class="rays"></div><div class="bw-in">${html}</div>`;return el;}
function bigWin(win,tier,title){
  return new Promise(res=>{
    const T={big:['Big Win',3000,70],mega:['Mega Win',4300,130],epic:['Sleigh Ride Win',5600,200],jackpot:['Grand Jackpot',7000,320]}[tier];
    const el=overlay(`<div class="bw-k">${title?'Golden Star':'Ho ho ho'}</div><div class="bw-t">${title||T[0]}</div><div class="bw-amt mono" id="bwAmt">$0</div><div class="bw-sub">Tap to collect</div>`,'t-'+tier);
    document.body.classList.remove('shake');void document.body.offsetWidth;document.body.classList.add('shake');
    const cab=$('#cab');if(cab)cab.classList.add('party');
    SND.gong();setTimeout(SND.jingle,350);fx.coins(T[2],T[1]);
    if(tier!=='big'){fx.snow(180);setTimeout(sleigh,500);}
    if(tier==='epic'||tier==='jackpot')fireworks(tier==='jackpot'?10:6);
    let closed=false,counted=false;
    const close=()=>{if(closed)return;closed=true;el.classList.remove('on');if(cab)cab.classList.remove('party');setText('#slWin',fmt$(win));res();};
    const cu=countUp('#bwAmt',win,T[1]-800,()=>{counted=true;fx.burst(innerWidth/2,innerHeight*.48,70,'#ecd9a8');setTimeout(close,1800);});
    el.onclick=()=>{if(!counted)cu.finish();else close();};
  });
}
function fsIntro(n,re){
  return new Promise(res=>{
    const el=overlay(`<svg class="giftbig" viewBox="0 0 100 100" width="150" height="150">${giftArt('lid')}</svg><div class="bw-t">${re?'+'+n+' Free Games':n+' Free Games'}</div><div class="bw-sub">Every win pays ×${FS_MULT} · tap to start</div>`,'t-fs');
    SND.gong();setTimeout(SND.jingle,300);setTimeout(()=>{fx.confetti(160);fx.burst(innerWidth/2,innerHeight*.38,60,'#ecd9a8');},650);setTimeout(()=>fx.snow(140),900);
    const t=setTimeout(close,4200);function close(){clearTimeout(t);el.classList.remove('on');res();}
    el.onclick=close;slUI();
  });
}
function fsOutro(total){
  return new Promise(res=>{
    const el=overlay(`<div class="bw-k">Free games complete</div><div class="bw-t" style="font-size:44px">You won</div><div class="bw-amt mono">${fmt$(total)}</div><div class="bw-sub">Tap to continue</div>`,'t-fs');
    if(total>0){fx.coins(90,2000);SND.win();}
    const t=setTimeout(close,3500);function close(){clearTimeout(t);el.classList.remove('on');res();}
    el.onclick=close;
  });
}
/* Golden Star: the random jackpot trigger (like the Fu Bat / golden drum) */
async function starTrigger(){
  const rw=document.querySelector('.reelwin');
  const r=rw?rw.getBoundingClientRect():{left:innerWidth/2-100,top:innerHeight/2-100,width:200,height:200};
  const st=document.createElement('div');st.className='gstar';
  st.innerHTML=`<svg viewBox="0 0 100 100" width="120" height="120"><polygon points="${star(50,50,46,19)}" fill="url(#gGold)" stroke="#5e4520" stroke-width="2"/><polygon points="${star(50,50,30,12)}" fill="#f6ebcb" opacity=".55"/></svg>`;
  st.style.left=(r.left+r.width/2-60)+'px';st.style.top=(r.top+r.height/2-60)+'px';
  document.body.appendChild(st);
  const fl=$('#flash');if(fl){fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');}
  document.querySelectorAll('#reels .cell').forEach(c=>c.classList.add('shimmer'));
  SND.drumroll();
  await sleep(1500);
  fx.burst(r.left+r.width/2,r.top+r.height/2,90,'#ecd9a8');SND.gong();
  st.remove();document.querySelectorAll('#reels .cell').forEach(c=>c.classList.remove('shimmer'));
  await sleep(250);
}
const BPOS=[[50,17],[38,32],[62,32],[30,47],[50,47],[70,47],[22,62],[40,62],[60,62],[78,62],[34,78],[66,78]];
function pickBonus(){
  return new Promise(resolve=>{
    // The winning tier is decided now, before you pick — just like the real machines.
    let x=rng(),acc=0,W=JPT[JPT.length-1];for(const t of JPT){acc+=t.p;if(x<acc){W=t;break;}}
    const pool=[W.k,W.k];JPT.forEach(t=>{if(t!==W){const c=rint(3);for(let i=0;i<c;i++)pool.push(t.k);}});
    for(let i=pool.length-1;i>0;i--){const j=rint(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
    const lastW=pool.lastIndexOf(W.k), k=lastW+1+rint(pool.length-lastW);
    pool.splice(k,0,W.k);
    const seq=pool.slice(0,k+1), rest=pool.slice(k+1);
    const cnt={};JPT.forEach(t=>cnt[t.k]=0);seq.concat(rest).forEach(v=>cnt[v]++);
    JPT.forEach(t=>{if(t!==W)while(cnt[t.k]<2&&rest.length+seq.length<12){rest.push(t.k);cnt[t.k]++;}});
    while(rest.length+seq.length<12)rest.push('none');
    for(let i=rest.length-1;i>0;i--){const j=rint(i+1);[rest[i],rest[j]]=[rest[j],rest[i]];}
    const got={};JPT.forEach(t=>got[t.k]=0);let n=0,done=false;
    const el=document.createElement('div');el.className='pick';
    const lad=()=>JPT.map(t=>`<div class="pk-row ${t.k}" data-pk="${t.k}"><span>${t.n}</span><b class="mono">${cmp$(jpVal(t))}</b><i>${[0,1,2].map(i=>`<em class="${i<got[t.k]?'on':''}"></em>`).join('')}</i></div>`).join('');
    el.innerHTML=`<div class="pk-in"><div class="bw-k">Golden Star bonus</div><div class="pk-t">Pick the ornaments</div><div class="pk-s">Match 3 to win that jackpot · one is guaranteed</div>
      <div class="pk-lad" id="pkLad">${lad()}</div>
      <div class="pk-tree"><svg viewBox="0 0 100 100" preserveAspectRatio="none" class="pk-tsvg"><path d="M50 4 L94 92 H6Z" fill="url(#gGreen)" opacity=".85"/><path d="M28 40 Q50 50 72 38 M18 62 Q50 74 82 60 M12 82 Q50 94 88 80" stroke="url(#gGold)" stroke-width="1.2" fill="none"/></svg>
      ${BPOS.map((p,i)=>`<button class="bauble c${i%3}" data-i="${i}" style="left:${p[0]}%;top:${p[1]}%"><span class="cap"></span></button>`).join('')}</div></div>`;
    document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
    SND.jingle();fx.snow(80);
    const badge=k=>{const t=JPT.find(j=>j.k===k);return t?`<span class="badge ${k}">${t.n}</span>`:`<span class="badge none">✻</span>`;};
    el.addEventListener('click',e=>{
      const b=e.target.closest('.bauble');if(!b||b.classList.contains('open')||done)return;
      const v=seq[n++];got[v]++;
      b.classList.add('open');b.innerHTML=badge(v);
      const rr=b.getBoundingClientRect();fx.burst(rr.left+rr.width/2,rr.top+rr.height/2,24,'#ecd9a8');
      tone(880+got[v]*220,.3,'triangle',.12);tone(1760+got[v]*440,.25,'sine',.05,.05);
      $('#pkLad').innerHTML=lad();
      const row=el.querySelector(`[data-pk=${v}]`);if(row){row.classList.add(got[v]>=2?'hot':'ping');}
      if(n===seq.length){
        done=true;
        el.querySelectorAll('.bauble.open').forEach(o=>{if(o.querySelector('.badge.'+W.k))o.classList.add('win');});
        const wr=el.querySelector(`[data-pk=${W.k}]`);if(wr)wr.classList.add('won');
        SND.gong();fx.confetti(120);
        setTimeout(()=>{let ri=0;el.querySelectorAll('.bauble:not(.open)').forEach(o=>{o.classList.add('open','ghost');o.innerHTML=badge(rest[ri++]);});},900);
        setTimeout(()=>{el.classList.remove('on');setTimeout(()=>el.remove(),400);resolve(W);},2600);
      }
    });
  });
}
// Reel motion: the same path as before — scroll t symbols with the cubic-bezier(.18,.12,.22,1.07) ease and its
// little bounce at the end — but drawn with 5 cells whose symbols are swapped as they pass, instead of a strip of
// up to ~150 blurred symbols. Time-based, so a slow frame never slows the spin down. Speeds up 8× on STOP.
const spinEase=(()=>{const x1=.18,y1=.12,x2=.22,y2=1.07,cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
  const X=s=>((ax*s+bx)*s+cx)*s,Y=s=>((ay*s+by)*s+cy)*s;
  return x=>{if(x<=0)return 0;if(x>=1)return 1;let lo=0,hi=1,s=x;for(let i=0;i<24;i++){if(X(s)<x)lo=s;else hi=s;s=(lo+hi)/2;}return Y(s);};})();
function reelSpin(st,strip,nw,t,h,dur){
  const L=strip.length,uses=[...st.querySelectorAll('use')];let el=0,last=performance.now(),rate=1,base=null,raf=0,resolve;
  const o={playState:'running',finished:new Promise(r=>resolve=r),updatePlaybackRate(r){rate=r;},stop(){cancelAnimationFrame(raf);o.playState='finished';}};
  const paint=q=>{const b=Math.floor(q);
    if(b!==base){base=b;for(let i=0;i<5;i++)uses[i].setAttribute('href','#s-'+strip[((nw+b-1+i)%L+L)%L]);}
    st.style.transform=`translate3d(0,${(-(q-b+1)*h).toFixed(2)}px,0)`;};
  const tick=now=>{el+=(now-last)*rate;last=now;const k=Math.min(1,el/dur);paint(t*(1-spinEase(k)));
    if(k<1&&o.playState==='running')raf=requestAnimationFrame(tick);else{o.playState='finished';resolve();}};
  paint(t);raf=requestAnimationFrame(tick);
  return o;
}
async function slotSpin(){
  if(SL.spinning){SL.quick=true;SL.anims.forEach(a=>{try{if(a.playState==='running')a.updatePlaybackRate(8);}catch(e){}});return;}
  if(S.mode!=='casino'||S.ctab!=='slots'||(S.howto&&S.howto.slots)||!$('#reels'))return;
  const free=SL.fs>0, bet=S.slotBet*(free?1:betX()), wx=winX();   // old fashioned: paid spins cost double
  if(!free){ if(bet>S.bank){noFunds();SL.auto=0;slUI();return;} setBank(-bet); S.jp=Math.round(S.jp+bet*.015); save(); }
  else SL.fs--;
  ac();
  SL.spinning=true;SL.quick=false;clearLines();SL.lastWin=0;setText('#slWin','—');setText('#slMsg',free?`Free game · ${SL.fs} left after this`:'Spinning…');slUI();
  // Every outcome is decided here, before any animation: one secure random stop per reel, plus the star roll.
  const stops=STRIPS.map(s=>rint(s.length)), grid=windowAt(stops), res=evalGrid(grid), starHit=!free&&rng()<JP_ODDS;
  const scR=grid.map(c=>c.filter(x=>x==='BONUS').length), antic=[];let acc=0;
  for(let r=0;r<5;r++){antic[r]=acc>=2&&r<4;acc+=scR[r];}
  const reels=[...document.querySelectorAll('#reels .reel')], h=reels[0]?reels[0].clientWidth:60, T=S.turbo?.5:1;
  SND.spin();SL.anims=[];
  const proms=reels.map((el,r)=>{
    const L=STRIPS[r].length, cur=SL.stops[r], nw=stops[r];
    const t=((cur-nw)%L+L)%L+L*(1+(antic[r]?1:0));
    // Only 5 symbol cells per reel; they're recycled as the reel scrolls (see reelSpin) so it stays smooth.
    el.innerHTML=`<div class="strip blur">${[0,1,2,3,4].map(()=>cellHTML(STRIPS[r][nw])).join('')}</div>`;
    const st=el.firstChild, dur=(820+r*240+(antic[r]?1600:0))*T;
    const a=reelSpin(st,STRIPS[r],nw,t,h,dur);SL.anims.push(a);
    setTimeout(()=>st.classList.remove('blur'),dur*.8);
    if(antic[r])setTimeout(()=>{if(!SL.quick&&el.isConnected){el.classList.add('antic');SND.antic();}},(820+(r-1)*240)*T);
    return Promise.race([a.finished,sleep(dur+500)]).then(()=>{a.stop();
      el.classList.remove('antic');
      el.innerHTML=`<div class="strip">${[0,1,2].map(k=>cellHTML(grid[r][k],grid[r][k]==='BONUS'?'land':'')).join('')}</div>`;
      SND.stop();if(scR[r])SND.scatter();
    });
  });
  await Promise.all(proms);
  SL.stops=stops;
  const mult=free?FS_MULT:1;
  const wins=res.wins.map(w=>({...w,amt:Math.round(w.mult*bet*PAY_UNIT*mult)}));
  let win=wins.reduce((s,w)=>s+w.amt,0);
  if(res.scat)win+=res.scat[0]*bet*mult;
  if(wx!==1&&win>0){ win=Math.round(win*wx); wins.forEach(w=>w.amt=Math.round(w.amt*wx)); }   // drink power on the winnings
  SL.spinning=false;
  if(free)SL.fsTotal+=win;
  if(win>0)setBank(win);
  SL.lastWin=win;slUI();
  if(wins.length||res.scat)showWins(wins,res);
  const x=win/bet;
  if(x>=50)await bigWin(win,'epic');
  else if(x>=25)await bigWin(win,'mega');
  else if(x>=10)await bigWin(win,'big');
  else if(win>0){countUp('#slWin',win,Math.min(1500,450+x*260));SND.win();fx.fountain(Math.min(45,10+Math.round(x*7)));
    const top=wins.slice().sort((a,b)=>b.amt-a.amt)[0];setText('#slMsg',top?`${top.n}× ${SYMNAME[top.sym]}${wins.length>1?' + '+(wins.length-1)+' more':''} · ${fmt$(win)}`:`Gift boxes · ${fmt$(win)}`);}
  else setText('#slMsg',free?`${SL.fs} free games left`:'No win this time');
  if(starHit){
    SL.auto=0;slUI();
    await starTrigger();
    const W=await pickBonus();
    const amt=Math.round(jpVal(W)*wx);
    if(W.k==='grand'&&S.slotBet>=MAXBET)S.jp=2500000;
    setBank(amt);SL.lastWin+=amt;
    const lp=document.querySelector(`.jpl.${W.k}`);if(lp){lp.classList.add('hitjp');setTimeout(()=>lp.classList.remove('hitjp'),6000);}
    await bigWin(amt,W.k==='grand'?'jackpot':W.k==='major'?'epic':W.k==='maxi'?'mega':'big',W.n+' Jackpot');
    setText('#slMsg',`${W.n} Jackpot · ${fmt$(amt)}`);
  }
  if(res.scat){SL.fs+=res.scat[1];await fsIntro(res.scat[1],free);}
  if(free&&SL.fs===0){await fsOutro(SL.fsTotal);SL.fsTotal=0;}
  save();slUI();
  if(S.mode==='casino'&&S.ctab==='slots'&&!(S.howto&&S.howto.slots)&&$('#reels')){
    if(SL.fs>0)setTimeout(slotSpin,950);
    else if(SL.auto>0){SL.auto--;slUI();setTimeout(slotSpin,win>0?1400:550);}
  } else SL.auto=0;
}

