// Sharing: turn a win into a 1080×1920 picture (Instagram story size) with your character, the win,
// and your invite code, then share it with the phone's share sheet (or save it).
// Also the pop-up layer used by the league screens (above the lodge and the golf course).

/* ---------- Pop-up layer ---------- */
function modal(html,cls){
  let m=document.getElementById('fgModal');
  if(!m){ m=document.createElement('div'); m.id='fgModal'; m.className='fgm'; document.body.appendChild(m);
    m.addEventListener('click',e=>{ if(e.target===m){ if(!m.querySelector('.stay')) closeModal(); return; } const b=e.target.closest('[data-a]'); if(b&&ACT[b.dataset.a]){ e.stopPropagation(); ACT[b.dataset.a](b,e); } }); }
  m.innerHTML=`<div class="fgm-box ${cls||''}"><button class="fgm-x" data-a="closeModal" aria-label="Close">✕</button>${html}</div>`;
  m.classList.add('on'); return m;
}
function closeModal(){ const m=document.getElementById('fgModal'); if(m){ m.classList.remove('on'); m.innerHTML=''; } }
ACT.closeModal=()=>closeModal();

/* ---------- Links ---------- */
function appUrl(){ return location.origin+location.pathname.replace(/index\.html$/,''); }
function inviteUrl(leagueCode){
  const p=new URLSearchParams(); if(typeof SOC!=='undefined'&&SOC.me&&SOC.me.ref) p.set('invite',SOC.me.ref); if(leagueCode) p.set('league',leagueCode);
  const q=p.toString(); return appUrl()+(q?'?'+q:'');
}
async function copyText(t){ try{ await navigator.clipboard.writeText(t); toast('Copied','gold'); return true; }catch(e){ prompt('Copy this:',t); return false; } }
async function shareLink(text,url){
  if(navigator.share){ try{ await navigator.share({text,url}); return; }catch(e){ if(e&&e.name==='AbortError') return; } }
  copyText(text+' '+url);
}

/* ---------- The picture ---------- */
const SHARE_GAMES={slots:'Slots',roulette:'Roulette',blackjack:'Blackjack',poker:'Video poker',craps:'Craps',sports:'Sportsbook',golf:'Golf',league:'League',duel:'Roulette duel'};
async function shareImage(o){
  try{ await document.fonts.load('40px "Press Start 2P"'); }catch(e){}
  const W=1080,H=1920,c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); x.imageSmoothingEnabled=false;
  const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#123024'); g.addColorStop(.55,'#0b1a14'); g.addColorStop(1,'#05090f'); x.fillStyle=g; x.fillRect(0,0,W,H);
  // rays behind the character
  x.save(); x.translate(W/2,820); for(let i=0;i<24;i++){ x.rotate(Math.PI/12); x.fillStyle=i%2?'rgba(236,217,168,.06)':'rgba(236,217,168,.02)'; x.beginPath(); x.moveTo(0,0); x.lineTo(-90,-1400); x.lineTo(90,-1400); x.fill(); } x.restore();
  // confetti pixels
  const r=prng(o.amount||o.big?String(o.amount||o.big).length*991:5); const cols=['#ecd9a8','#c8a45c','#e8963c','#c0505a','#3ad08a','#f3ead8'];
  for(let i=0;i<120;i++){ x.fillStyle=cols[i%6]; const s=8+(r()*3|0)*8, yy=(r()*820|0)+300, xx=r()*W|0; if(yy>660&&Math.abs(xx-W/2)<200) continue; x.fillRect(xx,yy,s,s); }
  // frame
  x.fillStyle='#c8a45c'; for(const [a,b,w,h] of [[40,40,W-80,12],[40,H-52,W-80,12],[40,40,12,H-80],[W-52,40,12,H-80]]) x.fillRect(a,b,w,h);
  x.fillStyle='#7d1f2a'; for(const [a,b,w,h] of [[64,64,W-128,6],[64,H-70,W-128,6],[64,64,6,H-128],[W-70,64,6,H-128]]) x.fillRect(a,b,w,h);
  const font=s=>`${s}px "Press Start 2P", monospace`;
  const center=(t,y,s,col,shadow)=>{ x.font=font(s); x.textAlign='center'; x.textBaseline='top'; if(shadow){ x.fillStyle=shadow; x.fillText(t,W/2+s/6,y+s/6); } x.fillStyle=col; x.fillText(t,W/2,y); };
  const fit=(t,max,start)=>{ let s=start; x.font=font(s); while(s>20&&x.measureText(t).width>max){ s-=4; x.font=font(s); } return s; };
  center('FOURTH & GOLD',140,52,'#ecd9a8','#7d1f2a');
  center((SHARE_GAMES[o.game]||o.game||'').toUpperCase(),230,30,'#c8a45c');
  // the player's character, big
  let spr=null; try{ spr=personSprite('player','idle0',typeof lodgeLook==='function'?lodgeLook():null); }catch(e){}
  x.fillStyle='rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(W/2,1150,230,40,0,0,7); x.fill();
  if(spr){ const sc=24; x.drawImage(spr,W/2-spr.width*sc/2,1150-spr.height*sc,spr.width*sc,spr.height*sc); }
  // the win
  const title=String(o.title||'').toUpperCase(); center(title,1220,fit(title,W-180,40),'#f3ead8');
  const big=o.big||(o.amount!=null?(o.amount>=0?'+':'')+fmt$(o.amount):''); center(big,1300,fit(big,W-160,110),'#ecd9a8','#7d1f2a');
  if(o.sub){ const s=String(o.sub).toUpperCase(); center(s,1460,fit(s,W-180,28),'#a89a80'); }
  // invite footer
  const me=(typeof PROF!=='undefined'&&PROF.me&&PROF.me.name)||'';
  x.fillStyle='rgba(5,9,15,.75)'; x.fillRect(110,1580,W-220,240); x.fillStyle='#c8a45c'; x.fillRect(110,1580,W-220,6);
  center(me?('PLAY ME · '+me.toUpperCase()).slice(0,30):'COME PLAY',1615,30,'#f3ead8');
  const code=(typeof SOC!=='undefined'&&SOC.me&&SOC.me.ref)||''; center(code?'INVITE CODE '+code:'FREE · NO REAL MONEY',1675,30,'#ecd9a8');
  const host=location.host||'fourth & gold'; center(host.toUpperCase(),1740,fit(host.toUpperCase(),W-260,24),'#a89a80');
  return await new Promise(res=>c.toBlob(b=>res({blob:b,url:c.toDataURL('image/png')}),'image/png'));
}
// o: {game, title, big or amount, sub}. Shows the picture with Share / Save / Post to league.
async function shareCard(o){
  const m=modal(`<div class="fgm-k">Share your ${esc((SHARE_GAMES[o.game]||'win').toLowerCase())}</div><div class="shr-prev"><div class="empty">Drawing…</div></div>`,'shr');
  const img=await shareImage(o); SHARE.last={o,img};
  const box=m.querySelector('.shr-prev'); if(!box) return;
  box.innerHTML=`<img src="${img.url}" alt="Your share card">`;
  box.insertAdjacentHTML('afterend',`<div class="fgm-row"><button class="btn gold" data-a="shareGo">Share</button><button class="btn" data-a="shareSave">Save image</button></div>
    ${typeof socInLeague==='function'&&socInLeague()?`<button class="btn wide" data-a="sharePost" style="margin-top:8px">Post it to my league</button>`:''}
    <p class="small muted" style="text-align:center;margin:8px 0 0">Your invite code is on the picture — friends who join with it clear your debt and give you $1,000,000.</p>`);
}
const SHARE={last:null};
Object.assign(ACT,{
  shareGo:async()=>{ const L=SHARE.last; if(!L) return; const file=new File([L.img.blob],'fourth-and-gold.png',{type:'image/png'}); const text=`${L.o.title||''} ${L.o.big||(L.o.amount!=null?fmt$(L.o.amount):'')} on Fourth & Gold. Come play me:`.replace(/\s+/g,' ').trim(), url=inviteUrl(typeof socLeagueCode==='function'?socLeagueCode():'');
    if(navigator.canShare&&navigator.canShare({files:[file]})){ try{ await navigator.share({files:[file],text:text+' '+url}); return; }catch(e){ if(e&&e.name==='AbortError') return; } }
    ACT.shareSave(); copyText(text+' '+url); },
  shareSave:()=>{ const L=SHARE.last; if(!L) return; const a=document.createElement('a'); a.href=L.img.url; a.download='fourth-and-gold.png'; document.body.appendChild(a); a.click(); a.remove(); },
  sharePost:el=>{ const L=SHARE.last; if(!L) return; socPost('share',L.o.game,L.o.amount!=null?Math.round(L.o.amount):null,null); el.disabled=true; el.textContent='Posted to your league'; },
});

/* ---------- "Share this?" moments: a little card after a good result ---------- */
function shareMoment(o){
  if(!o) return; document.querySelectorAll('.shm').forEach(e=>e.remove());
  const el=document.createElement('div'); el.className='shm';
  el.innerHTML=`<div class="shm-t"><b>${esc(o.title||'Nice!')}</b><span>${esc(o.big||(o.amount!=null?'+'+fmt$(o.amount):''))}</span></div><button class="btn sm gold">Share</button><button class="shm-x" aria-label="Dismiss">✕</button>`;
  el.querySelector('.btn').onclick=()=>{ el.remove(); shareCard(o); };
  el.querySelector('.shm-x').onclick=()=>el.remove();
  document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('on'));
  setTimeout(()=>{ el.classList.remove('on'); setTimeout(()=>el.remove(),400); },7000);
}
