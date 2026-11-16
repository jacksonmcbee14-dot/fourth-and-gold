// ⛳ Golf skill: every shot, hole, round and driving-range ball earns golf XP, and golf levels (1–50) make you better.
//  • The green (perfect) and yellow (good) parts of the meter get wider, and the meter moves slower.
//  • Misses hook and slice less, the wind pushes the ball less, and greens break less.
//  • Birdie, eagle and hole-in-one money grows with your level (and with your net worth).
// Practising on your own putting green (Estate and Palace) earns double golf XP. The driving range is js/golf/range.js.

const GOLF_LV_MAX=50;
const golfNeed=L=>30+15*(L-1);   // golf XP to go from level L to L+1
function golfLvOf(xp){ let L=1,left=xp||0; while(L<GOLF_LV_MAX&&left>=golfNeed(L)){ left-=golfNeed(L); L++; } return {L,into:left,need:L<GOLF_LV_MAX?golfNeed(L):0}; }
const golfLv=()=>golfLvOf(S.golf&&S.golf.xp).L;
function golfK(L){ const s=((L||golfLv())-1)/(GOLF_LV_MAX-1);
  return {perfect:.07+.08*s, good:.35+.17*s, err:1-.45*s, wind:1-.4*s, speed:1+.4*s, brk:1-.35*s}; }
const golfPayX=()=>(1+.08*(golfLv()-1))*Math.max(1,Math.sqrt(Math.max(0,worth())/1e6));

// Earning golf XP. Your own green counts double.
function golfXP(n,why){
  if(!(n>0)) return; S.golf=S.golf||{};
  const home=typeof GOLF!=='undefined'&&GOLF.o&&GOLF.o.course==='home'&&GOLF.phase!=='off'&&why!=='range';
  n=Math.round(n*(home?2:1));
  const before=golfLv(); S.golf.xp=(S.golf.xp||0)+n; const after=golfLv(); save();
  if(after>before){ const K=golfK(after);
    if(typeof GOLF!=='undefined'&&GOLF.phase&&GOLF.phase!=='off'&&typeof golfMsg==='function') golfMsg('GOLF LEVEL '+after+'!','Bigger sweet spot · less wind',1800);
    else toast('⛳ Golf level '+after+'! Sweet spot '+Math.round(K.perfect*100)+'%','gold');
    tone(988,.12,'square',.05); tone(1319,.14,'square',.05,.1);
    if(typeof rangeMeter==='function') rangeMeter(); golfZones(); }
}
const golfShotXP=(q,putt)=>golfXP(q==='perfect'?8:q==='good'?4:1,'shot');
const golfHoleXP=(diff,strokes)=>golfXP(strokes===1?250:diff<=-2?100:diff===-1?40:diff===0?15:diff===1?5:2,'hole');
const golfRoundXP=rel=>golfXP(40+Math.max(0,-rel)*10,'round');

// The meter's coloured zones match your level.
function golfZones(el){
  const m=el||(typeof GOLF!=='undefined'&&GOLF.el&&GOLF.el.querySelector('.gf-meter')); if(!m) return;
  const K=golfK(), g=K.perfect*100, y=(K.good-K.perfect)*50, r=50-g/2-y, z=m.querySelectorAll('i');
  if(z.length<5) return; const w=[r,y,g,y,r]; let left=0; z.forEach((e,i)=>{ e.style.left=left+'%'; e.style.width=w[i]+'%'; left+=w[i]; });
}
const _openGolfS=openGolf; openGolf=function(o){ _openGolfS(o); golfZones(); golfLvTag(); };
const _golfHoleS=golfHole; golfHole=function(i){ _golfHoleS(i); if(GOLF.brk){ const k=golfK().brk; GOLF.brk.x*=k; GOLF.brk.y*=k; } golfLvTag(); };
function golfLvTag(){ if(!GOLF.el) return; let t=GOLF.el.querySelector('.gf-lv'); if(!t){ t=document.createElement('span'); t.className='gf-lv'; const top=GOLF.el.querySelector('.gf-top'); top.insertBefore(t,top.querySelector('.gf-tot')); }
  t.textContent='LV '+golfLv()+(GOLF.o&&GOLF.o.course==='home'?' · 2× XP':''); }

// The card at the top of the Golf tab.
function golfSkillCard(){
  const {L,into,need}=golfLvOf(S.golf&&S.golf.xp), K=golfK(L);
  return `<div class="gk-card"><div class="gk-top"><b>Golf level ${L}</b><span>${L<GOLF_LV_MAX?into+' / '+need+' XP':'MAX'}</span></div>
    <div class="gk-bar"><i style="width:${L<GOLF_LV_MAX?Math.round(into/need*100):100}%"></i></div>
    <div class="gk-perks"><span>🎯 Sweet spot ${Math.round(K.perfect*100)}%</span><span>💨 Wind ${Math.round(K.wind*100)}%</span><span>🐢 Meter ${Math.round(100/K.speed)}% speed</span><span>💰 Prizes ×${golfPayX()<10?golfPayX().toFixed(1):Math.round(golfPayX())}</span></div>
    <div class="gk-note">Every shot, hole, round and range ball makes you better.${typeof homeTier==='function'&&homeTier()>=5?' Your own green earns 2× golf XP.':' Your own putting green (level 100) earns 2× golf XP.'}</div></div>`;
}

// Walking out to the course from the lodge: a round, the range, or your own green.
function golfChooser(){
  const green=typeof home==='function'&&home().rooms.includes('green');
  modal(`<div class="fgm-k">⛳ Lodge Links · golf level ${golfLv()}</div>${golfSkillCard()}
    <div class="fgm-row" style="flex-direction:column;gap:8px;margin-top:12px"><button class="btn gold wide" data-a="golfPlayM">Play a round</button><button class="btn wide" data-a="rangeOpen">🎯 Driving range</button>
    ${green?'<button class="btn wide" data-a="golfHomeM">⛳ Practise on your green (2× XP)</button>':''}</div>`);
}
Object.assign(ACT,{ golfPlayM:()=>{ closeModal(); openGolf({}); }, golfHomeM:()=>{ closeModal(); openGolf({course:'home',holes:3}); } });

// Rounds played before golf levels existed count too: 150 golf XP each, once.
function golfBackfill(){ const G=S.golf; if(G&&G.xp==null&&G.rounds){ G.xp=G.rounds*150; save(); } }
golfBackfill();
const _adoptStateG=adoptState; adoptState=function(st){ _adoptStateG(st); golfBackfill(); };
