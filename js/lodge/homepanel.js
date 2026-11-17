// 🏠 The Home panel, rebuilt to be tapped, not read: tabs (Butlers · Rooms · Security · Vault · Score), animated
// pictures, big icon tiles and short labels. Replaces the long-form panel from home.js / butler.js / besthome.js
// (their actions — homeRoom, homeCam, butlerGo, bestHome… — are reused as-is).

const HP={tab:null,raf:0};
const BUTLER_LOOK=suit=>({h:'#3a2a20',s:'#e0b48a',k:'#16161c',c:suit,C:'#0e0e12',b:'#f3ead8',w:'#f3ead8',p:'#16161c',o:'#0e0e12'});
const SUIT_COL={'Black tie':'#1a1a20','Silver tails':'#8a929e','Gold tails':'#c8a45c','Velvet smoking jacket':'#6a1a3a','Diamond tuxedo':'#bff6ff'};
const HP_TABS=[['butler','🤵','Butlers'],['rooms','🏠','Rooms'],['security','🛡️','Security'],['vault','🔐','Vault'],['score','🏆','Score']];

homeOpen=function(){
  closeShop(); homeSync(); cancelAnimationFrame(HP.raf);
  const i=homeTier(), H=HOMES[i], hasB=typeof butlersHave==='function'&&butlersHave().length;
  if(!HP.tab) HP.tab=hasB?'butler':'rooms';
  const box=document.createElement('div'); box.className='lg-shop lg-home hp';
  box.innerHTML=`<div class="lg-shop-head"><span class="lg-dlg-who">${esc(H.name.toUpperCase())}</span><span class="lg-bank-s">LV ${myLevel()}</span><button class="lg-btn lg-round" data-lg="shopClose" aria-label="Close">X</button></div>
    <div class="hp-tabs">${HP_TABS.map(([k,ic,l])=>`<button class="hp-tab ${HP.tab===k?'on':''}" data-lg="hpTab" data-v="${k}"><span>${ic}</span><small>${l}</small></button>`).join('')}</div>
    <div class="lg-shop-body hp-body" key="${HP.tab}">${hpBody(HP.tab,H,i)}</div>`;
  LODGE.el.querySelector('.lg-stage').appendChild(box);
  hpAfter(box,H,i);
};
function hpBody(tab,H,i){
  if(tab==='butler'){
    if(!butlersHave().length) return `<div class="hp-hero"><canvas class="hp-cv" width="96" height="60"></canvas></div><div class="hp-lock">🔒 <b>Mansion</b> · Lv 50</div>`;
    const suit=butlerSuit(), trial=(S.lodge.butlerTrial||[]).length;
    return `<div class="hp-hero"><canvas class="hp-cv" width="96" height="60"></canvas></div>
      <div class="hp-chips">${BUTLERS.map(b=>{ const ok=b.need(), used=ok&&butlerUsed(b.name); return `<span class="hp-chip ${ok?(used?'off':'ok'):'lock'}">${ok?(used?'💤':'✅'):'🔒'} ${esc(b.name)}</span>`; }).join('')}
        <span class="hp-chip">👔 ${esc(suit.name)} · ×${suit.x}</span><span class="hp-chip">💰 ${k$(butlerStake())}</span>${trial?`<span class="hp-chip gold">★ ${trial} free</span>`:''}${typeof guardOn==='function'&&guardOn()?'<span class="hp-chip ok">🛡 On guard</span>':''}</div>
      <div class="hp-tiles">${BACTS.map(([a,v,t,j],n)=>{ const ok=canDo(j), [ic,...rest]=t.split(' '); return `<button class="hp-tile ${ok?'':'off'}" style="--d:${n*40}ms" data-lg="${a}" data-v="${v}" ${ok?'':'disabled'}><span>${ic}</span><small>${trialHas(j)?'★ ':''}${esc(rest.join(' '))}</small></button>`; }).join('')}</div>`; }
  if(tab==='rooms'){ const next=HOMES[i+1]&&!HOMES[i+1].owner?HOMES[i+1]:null, L=myLevel();
    return `<div class="hp-rooms">${H.rooms.map((r,n)=>`<button class="hp-room ${r===curRoom()?'on':''}" style="--d:${n*50}ms" data-lg="homeRoom" data-v="${r}"><canvas data-room="${r}" width="${PW}" height="${PH}"></canvas><small>${esc(roomLabel(r))}</small></button>`).join('')}</div>
      ${H.rooms.includes('green')?'<button class="hp-big" data-lg="homeGolf">⛳ Practise · 2× XP</button>':''}
      ${next?`<div class="hp-next"><span>🏡 ${esc(next.name)}</span><i><u style="width:${Math.min(100,Math.round(L/next.lv*100))}%"></u></i><small>Lv ${L} / ${next.lv}</small></div>`:''}`; }
  if(tab==='security'){ const cams=Math.min(H.windows,camsOwned());
    return `<div class="hp-house"><span class="hp-door">🚪</span>${Array.from({length:H.windows},(_,w)=>`<span class="hp-win ${w<cams?'cov':'open'}" style="--d:${w*40}ms">${w<cams?'📹':'🪟'}</span>`).join('')}</div>
      <div class="hp-chips"><span class="hp-chip ok">📹 ${cams}</span><span class="hp-chip ${H.windows-cams?'bad':'ok'}">🪟 ${H.windows-cams} open</span>${typeof guardOn==='function'&&guardOn()?'<span class="hp-chip ok">🤵 On guard</span>':''}</div>
      ${cams<H.windows?`<button class="hp-big" data-lg="homeCam">+📹 ${k$(camPrice())}</button>`:'<div class="hp-done">✨ Every window covered</div>'}`; }
  if(tab==='vault'){ if(!H.safe) return `<div class="hp-hero"><span class="hp-emoji">🔐</span></div><div class="hp-lock">🔒 <b>Lodge house</b> · Lv 35</div>`;
    const pct=Math.min(100,(S.safe||0)/H.safe*100);
    return `<div class="hp-hero"><span class="hp-emoji hp-spin">🔐</span></div><div class="hp-amt">${fmt$(S.safe||0)}</div>
      <div class="hp-next"><i><u style="width:${pct}%"></u></i><small>of ${k$(H.safe)}</small></div>
      <div class="hp-row"><button class="hp-big" data-lg="homeDeposit">⬇️ Put in</button><button class="hp-big" data-lg="homeWithdraw" ${(S.safe||0)>0?'':'disabled'}>⬆️ Take out</button></div>
      <div class="hp-done">🚫🦝 Robbers can’t touch it</div>`; }
  if(tab==='score'){ const Hs=houseScore(), icons=['🛋️','🏡','🧩','🎨','💎','🦝'];
    return `<div class="hp-amt hp-count" data-to="${Hs.total}">0</div>
      <div class="hp-chips">${Hs.parts.map(([n,v],k)=>v?`<span class="hp-chip" style="--d:${k*60}ms">${icons[k]} +${v.toLocaleString()}</span>`:'').join('')}</div>
      <button class="hp-big" data-lg="bestHome">🏆 Best Home this week</button>`; }
  return '';
}
function hpAfter(box,H,i){
  // room thumbnails
  box.querySelectorAll('canvas[data-room]').forEach(cv=>{ const x=cv.getContext('2d'); x.imageSmoothingEnabled=false; x.drawImage(drawHomeBg(i,cv.dataset.room,H.windows,Math.min(H.windows,camsOwned())),0,0);
    const list=cv.dataset.room===curRoom()?S.lodge.room:(S.lodge.rooms||{})[cv.dataset.room]; (Array.isArray(list)?list:[]).forEach(p=>DECOR_ART[p.id]&&DECOR_ART[p.id](x,p.x,p.y,0)); });
  // score count-up
  const cnt=box.querySelector('.hp-count'); if(cnt){ const to=+cnt.dataset.to, t0=performance.now(); const step=n=>{ const k=Math.min(1,(n-t0)/900); cnt.textContent=Math.round(to*(1-Math.pow(1-k,3))).toLocaleString(); if(k<1&&document.body.contains(cnt)) requestAnimationFrame(step); }; requestAnimationFrame(step); }
  // the butler (or an empty doorway), bowing and blinking
  const cv=box.querySelector('.hp-cv'); if(cv){ const x=cv.getContext('2d'); x.imageSmoothingEnabled=false; const have=butlersHave(), suit=have.length?butlerSuit():null;
    const draw=()=>{ if(!document.body.contains(cv)) return; const t=performance.now()/1000; x.clearRect(0,0,96,60);
      x.fillStyle='#2a1d15'; x.fillRect(0,48,96,12); x.fillStyle='#3a2617'; for(let k=0;k<96;k+=8) x.fillRect(k,48,4,12);
      if(!suit){ x.fillStyle='#120a06'; x.fillRect(38,14,20,34); x.fillStyle='#c8a45c'; x.fillRect(36,12,24,2); }
      else have.forEach((b,n)=>{ const used=butlerUsed(b.name), bx=have.length>1?(n?62:22):40, bow=!used&&Math.sin(t*1.6+n)>.85?1:0;
        const spr=personSprite('player',Math.sin(t*.9+n*2)>.96?'idle1':'idle0',BUTLER_LOOK(SUIT_COL[suit.name]||'#1a1a20'));
        x.save(); x.translate(bx+6,48); if(bow){ x.rotate(.18); } x.drawImage(spr,-6,-21); x.restore();
        x.fillStyle='#cfd9e0'; x.fillRect(bx+11,30+(bow?2:0),6,1); x.fillStyle='#ffd84a'; x.fillRect(bx+13,28+(bow?2:0),2,2);   // tray
        if(used){ x.fillStyle='#f3ead8'; x.font='6px monospace'; x.fillText('z',bx+12,22-((t*8)%6)); }
        if(suit.name==='Diamond tuxedo'&&Math.sin(t*5+n)>.7){ x.fillStyle='#ffffff'; x.fillRect(bx+2+((t*7|0)%8),30+((t*5|0)%10),1,1); } });
      HP.raf=requestAnimationFrame(draw); };
    draw(); }
}
Object.assign(LG_ACT,{ hpTab:b=>{ HP.tab=b.dataset.v; tone(700,.03,'square',.02); homeOpen(); } });
