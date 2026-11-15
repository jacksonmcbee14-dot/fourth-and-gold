// Live layer: loads scores, records and new games from ESPN's public scoreboard.

/* =========================================================
   APPLYING LIVE DATA
   applyLive() takes one bundle of live data and updates the app:
     { games:{id:{s,as,hs,clock,q,t,tba}}, extra:[new games], futures:{id:'won'|'lost'|'push'},
       updated:ISO time, records:{NFL code:{w,l,t}}, cfbRecords:{college code:{w,l}},
       seeds:{NFC:[...],AFC:[...]}, cfbRanks:[{n,r}], nflWeek:'Week 11', cfbWeek:12 }
   ========================================================= */
// Snapshot values, so college "games left" can count down as games are played.
CFB.forEach(t=>{t._g0=t.w+t.l;t._rem0=t.rem;});
for(const k in NFL) NFL[k]._g0=NFL[k].w+NFL[k].l+(NFL[k].t||0);
function applyLive(d){
  d=d||{};
  LIVE.games=d.games||{}; LIVE.extra=Array.isArray(d.extra)?d.extra:[]; LIVE.futures=d.futures||{}; LIVE.updated=d.updated||null;
  LIVE.nflWeek=d.nflWeek||null; LIVE.cfbWeek=d.cfbWeek||null;
  if(d.records&&typeof d.records==='object'){ for(const k in d.records){ const r=d.records[k]; if(NFL[k]&&r){NFL[k].w=r.w;NFL[k].l=r.l;NFL[k].t=r.t||0;} } }
  if(d.cfbRecords&&typeof d.cfbRecords==='object'){ for(const k in d.cfbRecords){ const r=d.cfbRecords[k], c=CFB.find(t=>t.ab===k); if(c&&r){c.w=r.w;c.l=r.l;c.rem=Math.max(0,c._rem0-((c.w+c.l)-c._g0));} } }
  if(d.seeds&&d.seeds.NFC&&d.seeds.AFC) Object.assign(SEEDS,d.seeds);
  if(d.cfbRanks&&Array.isArray(d.cfbRanks)) d.cfbRanks.forEach(x=>{const c=CFB.find(t=>t.n===x.n);if(c){c.r=x.r;c.s=100-x.r*2.2;}});
  CFB.sort((a,b)=>a.r-b.r);
  baseModels(); NFLM_S=null; CFBM_S=null; settleBets(); if(!SLIP&&!RL.spinning&&!CR.rolling&&!SL.spinning&&BJ.phase!=='dealer'&&!(S.mode==='casino'&&S.ctab==='slots')) render(); else slipBar();
}

/* =========================================================
   ESPN FEED
   Free and public, but unofficial: ESPN could change or block it without
   notice. If it fails, the app quietly keeps the last data it had.
   ========================================================= */
const ESPN='https://site.api.espn.com/apis/site/v2/sports/football/';
const ESPN_PATH={nfl:'nfl/scoreboard', cfb:'college-football/scoreboard'};
const ESPN_EXTRA={nfl:'', cfb:'&groups=80&limit=500'};            // college: all FBS games
const ALIAS={nfl:{WSH:'WAS'}, cfb:{BOIS:'BSU',IU:'IND',FLA:'UF','TA&M':'TAMU',NCSU:'NCST'}}; // ESPN code → app code
const FAST_MS=60e3, SLOW_MS=10*60e3;
const FEED={weeks:{}, cur:{}, lastFull:0, busy:false, timer:null, sig:'', pKey:'fg_live_p'};
let FEED_P={}; try{FEED_P=JSON.parse(localStorage.getItem(FEED.pKey)||'{}');}catch(e){}

const appAb=(lg,ab)=>ALIAS[lg][ab]||ab;
async function feedWeek(lg,type,year,week){
  const key=lg+':'+type+':'+week;
  const r=await fetch(ESPN+ESPN_PATH[lg]+`?dates=${year}&seasontype=${type}&week=${week}`+ESPN_EXTRA[lg]);
  if(!r.ok) throw new Error('feed '+r.status);
  FEED.weeks[key]={lg,type,year,week,events:(await r.json()).events||[]};
}
async function feedCurrent(lg){
  const r=await fetch(ESPN+ESPN_PATH[lg]+(ESPN_EXTRA[lg]?'?'+ESPN_EXTRA[lg].slice(1):''));
  if(!r.ok) throw new Error('feed '+r.status);
  const d=await r.json(), type=d.season&&d.season.type||2, year=d.season&&d.season.year, week=d.week&&d.week.number;
  if(!year||!week) return;
  FEED.cur[lg]={type,year,week};
  FEED.weeks[lg+':'+type+':'+week]={lg,type,year,week,events:d.events||[]};
}
// Turn one ESPN event into the app's terms.
function feedEvent(lg,e){
  const c=e.competitions&&e.competitions[0]; if(!c) return null;
  const side=ha=>{const x=c.competitors.find(z=>z.homeAway===ha); if(!x) return null; const tm=x.team||{}, ab=appAb(lg,tm.abbreviation||'');
    const rk=x.curatedRank&&x.curatedRank.current, rec=(x.records||[]).find(z=>z.type==='total'||z.name==='overall')||(x.records||[])[0];
    return {ab, name:lg==='nfl'&&NFL[ab]?NFL[ab].n:(tm.location||tm.shortDisplayName||ab), col:tm.color?'#'+tm.color:null, rank:rk&&rk<=25?rk:undefined, score:x.score!=null&&x.score!==''?+x.score:null, rec:rec&&rec.summary};};
  const a=side('away'), h=side('home'); if(!a||!h) return null;
  const st=e.status&&e.status.type||{}, state=st.state;
  const tba=c.timeValid===false?1:0;                                // TBA kickoffs: ESPN puts midnight Eastern; use 5pm Eastern so the day reads right everywhere
  const g={espn:e.id, lg, t:tba?new Date(Date.parse(e.date)+17*3600e3).toISOString():e.date, a, h, tba, tv:((c.broadcasts||[])[0]||{names:[]}).names[0]||'',
    neutral:c.neutralSite&&c.venue&&c.venue.address?c.venue.address.city:undefined, week:e.week&&e.week.number};
  if(state==='in'){ g.s='live'; g.as=a.score; g.hs=h.score; g.clock=st.shortDetail||''; g.q=Math.min(4,(e.status.period||1)); }
  else if(state==='post'&&st.completed&&/FINAL/.test(st.name||'')){ g.s='final'; g.as=a.score; g.hs=h.score; }
  const o=(c.odds||[])[0];
  if(o){ g.total=o.overUnder||undefined; const m=/^([A-Z&]+)\s+(-?[\d.]+)$/.exec(o.details||'');
    if(/^EVEN/i.test(o.details||'')) g.pOdds=.5;
    else if(m){ const fav=appAb(lg,m[1]), mu=fav===h.ab?-(+m[2]):fav===a.ab?+m[2]:null; if(mu!=null) g.pOdds=clamp(Phi(mu/(SIG[lg]||14)),.02,.98); } }
  return g;
}
// Pre-game chance the home team wins, for games the app didn't already have. Kept once set, so lines don't jump mid-game.
function feedP(id,g){
  if(FEED_P[id]!=null) return FEED_P[id];
  let p=g.pOdds;
  if(p==null&&g.lg==='cfb'){ const rate=t=>{const c=CFB.find(x=>x.ab===t.ab);return c?c.s:t.rank?100-t.rank*2.2:40;}; p=1/(1+Math.exp(-((rate(g.h)-rate(g.a))+(g.neutral?0:3))/14)); }
  if(p==null) return undefined;                                    // NFL: the app's own team ratings price it
  FEED_P[id]=Math.round(p*1000)/1000; try{localStorage.setItem(FEED.pKey,JSON.stringify(FEED_P));}catch(e){}
  return FEED_P[id];
}
function parseRec(s){const m=/^(\d+)-(\d+)(?:-(\d+))?/.exec(s||'');return m?{w:+m[1],l:+m[2],t:+(m[3]||0)}:null;}
const near=(t1,t2)=>Math.abs(new Date(t1)-new Date(t2))<4*864e5;

function feedBuild(){
  const games={}, extra=[], records={}, cfbRecords={}, seen=new Set();
  const weeks=Object.values(FEED.weeks).sort((x,y)=>x.type-y.type||x.week-y.week);
  for(const W of weeks) for(const e of W.events){
    const g=feedEvent(W.lg,e); if(!g) continue;
    // Records: later weeks overwrite earlier ones, so the newest wins.
    for(const t of [g.a,g.h]){ const r=parseRec(t.rec); if(!r) continue;
      if(W.lg==='nfl'&&NFL[t.ab]&&r.w+r.l+r.t>=NFL[t.ab]._g0) records[t.ab]=r;
      if(W.lg==='cfb'){ const c=CFB.find(x=>x.ab===t.ab); if(c&&r.w+r.l>=c._g0) cfbRecords[t.ab]=r; } }
    const live=g.tba?{}:{t:g.t,tba:0}; if(g.s){live.s=g.s;live.as=g.as;live.hs=g.hs;if(g.clock)live.clock=g.clock;if(g.q)live.q=g.q;}
    // A game the app already has? (same two teams within a few days; neutral-site games may list home/away the other way)
    const mine=GAMES.find(x=>x.lg===W.lg&&near(x.t,g.t)&&((x.a.ab===g.a.ab&&x.h.ab===g.h.ab)||(x.a.ab===g.h.ab&&x.h.ab===g.a.ab)));
    if(mine){ if(seen.has(mine.id)) continue; seen.add(mine.id);
      if(mine.a.ab!==g.a.ab&&live.s){const z=live.as;live.as=live.hs;live.hs=z;}
      games[mine.id]=live; continue; }
    // A new game: NFL always; college only when a ranked team (or BYU) plays.
    if(W.lg==='cfb'&&!g.a.rank&&!g.h.rank&&g.a.ab!=='BYU'&&g.h.ab!=='BYU') continue;
    const id=`x-${W.lg}-${W.type}-${W.week}-${g.espn}`;
    const T2=t=>T(t.ab,t.name,t.col||(NFL[t.ab]&&NFL[t.ab].col)||'#3a2b1f',t.rank);
    const x={id,lg:W.lg,wk:W.type===2?'Week '+W.week:'Postseason',a:T2(g.a),h:T2(g.h),t:g.t,tv:g.tv};
    if(g.tba)x.tba=1; if(g.neutral)x.neutral=g.neutral; if(g.total)x.total=g.total;
    const p=feedP(id,g); if(p!=null)x.p=p;
    if((W.lg==='nfl'&&(g.a.ab==='SF'||g.h.ab==='SF'))||(W.lg==='cfb'&&(g.a.ab==='BYU'||g.h.ab==='BYU')))x.mine=1;
    extra.push(x); games[id]=live;
  }
  // Games the 49ers / BYU have finished no longer get simulated.
  const fin=(lg,me,o,t)=>weeks.some(W=>W.lg===lg&&W.events.some(e=>{const g=feedEvent(lg,e);return g&&g.s==='final'&&near(g.t,t)&&[g.a.ab,g.h.ab].includes(me)&&[g.a.ab,g.h.ab].includes(o);}));
  SF_SCHED.forEach(g=>{if(fin('nfl','SF',g.o,g.t))g.done=1;});
  BYU_SCHED.forEach(g=>{if(fin('cfb','BYU',g.ab,g.t))g.done=1;});
  const wk=lg=>FEED.cur[lg]&&FEED.cur[lg].type===2?FEED.cur[lg].week:null;
  return {games,extra,records,cfbRecords,futures:LIVE.futures,nflWeek:wk('nfl')?'Week '+wk('nfl'):null,cfbWeek:wk('cfb')};
}
// Weeks we still need for open bets (so they settle even if you haven't opened the app in a while).
function feedBetWeeks(){
  const need=[];
  for(const b of S.bets) if(b.st==='open') for(const l of b.legs){ if(!l.gid) continue;
    const x=/^x-(\w+)-(\d+)-(\d+)-/.exec(l.gid); if(x){need.push([x[1],+x[2],+x[3]]);continue;}
    const g=GAMES.find(z=>z.id===l.gid), m=g&&/Week (\d+)/.exec(g.wk); if(m) need.push([g.lg,2,+m[1]]); }
  return need;
}
async function refreshLive(full){
  if(FEED.busy) return; FEED.busy=true;
  try{
    await Promise.all(['nfl','cfb'].map(feedCurrent));
    if(full){
      const want=[];
      for(const lg of ['nfl','cfb']){const c=FEED.cur[lg]; if(c){want.push([lg,c.type,c.week-1]);want.push([lg,c.type,c.week+1]);}}
      for(const w of feedBetWeeks()) want.push(w);
      const yr=lg=>(FEED.cur[lg]||{}).year||new Date().getFullYear();
      const todo=want.filter(([lg,t,w],i)=>w>=1&&want.findIndex(z=>z[0]===lg&&z[1]===t&&z[2]===w)===i&&!(FEED.cur[lg]&&FEED.cur[lg].type===t&&FEED.cur[lg].week===w));
      await Promise.all(todo.map(([lg,t,w])=>feedWeek(lg,t,yr(lg),w).catch(()=>{})));
      FEED.lastFull=Date.now();
    }
    const d=feedBuild(), sig=JSON.stringify(d);
    if(sig!==FEED.sig){ FEED.sig=sig; d.updated=new Date().toISOString(); applyLive(d); }
    else LIVE.updated=new Date().toISOString();
    LIVE.connected=true;
  }catch(e){ /* offline or feed down: keep what we have */ }
  FEED.busy=false;
  feedSchedule();
}
function feedSchedule(){
  clearTimeout(FEED.timer);
  const now=Date.now(), soon=allGames().some(g=>g.s==='live'||g.s==='inprog'||(g.s==='pre'&&!g.tba&&new Date(g.t)-now<15*60e3&&new Date(g.t)>now));
  const wait=soon?FAST_MS:SLOW_MS;
  FEED.timer=setTimeout(()=>refreshLive(Date.now()-FEED.lastFull>=SLOW_MS),wait);
}
async function connect(){
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&LIVE.updated&&Date.now()-new Date(LIVE.updated)>FAST_MS) refreshLive(Date.now()-FEED.lastFull>=SLOW_MS); });
  await refreshLive(true);
}
