// Your teams: which NFL and college team are "yours", their remaining schedules, and the team picker.
// The 49ers and BYU are the defaults and keep their original hand-made schedules (SF_SCHED, BYU_SCHED).

const myN=()=>S.myNfl||'SF', myC=()=>S.myCfb||'BYU';
const meN=()=>NFL[myN()], meC=()=>CFB.find(t=>t.me)||CFB.find(t=>t.ab==='BYU');
const CONF_BY_GROUP={'1':'ACC','4':'Big 12','5':'Big Ten','8':'SEC','9':'Pac-12','17':'Mountain West','151':'American','37':'Sun Belt','12':'Conference USA','15':'MAC','18':'Independent'};
const TITLE_SITE={'Big 12':'Arlington','SEC':'Atlanta','Big Ten':'Indianapolis','ACC':'Charlotte'};
const SCHED_FROM={nfl:10, cfbDate:'2026-11-15T12:00:00Z'};   // schedules start where the Nov 14 snapshot ends
const CFB_DIR={};                                             // college teams seen in the ESPN feed: code → {id,n,col}
let MY_NSCHED=SF_SCHED, MY_CSCHED=BYU_SCHED;

const ord=n=>n+(n%100>=11&&n%100<=13?'th':['th','st','nd','rd'][n%10]||'th');
const espnCode=(lg,ab)=>{const m=ALIAS[lg];for(const k in m)if(m[k]===ab)return k;return ab;};
const isMyGame=g=>g.lg==='nfl'?(g.a.ab===myN()||g.h.ab===myN()):(g.a.ab===myC()||g.h.ab===myC());
function nflForced(){const k=myN();if(k==='SF'){if(S.sfF.length!==SF_SCHED.length)S.sfF=SF_SCHED.map(()=>'A');return S.sfF;}
  S.tf=S.tf||{};const a=S.tf['n:'+k]=(S.tf['n:'+k]||[]).slice(0,MY_NSCHED.length);while(a.length<MY_NSCHED.length)a.push('A');return a;}
function cfbForced(){const k=myC();if(k==='BYU'){return S.byuF;}
  S.tf=S.tf||{};const a=S.tf['c:'+k]=(S.tf['c:'+k]||[]).slice(0,MY_CSCHED.length);while(a.length<MY_CSCHED.length)a.push('A');return a;}
function cfbOpt(){return {g:cfbForced(),b12:S.b12,utahL:S.utahL,ttuL:S.ttuL};}
function cfbRivals(){const me=meC();return CFB.filter(t=>t!==me&&t.cf===me.cf).sort((a,b)=>a.r-b.r).slice(0,2);}
const hasTitleGame=()=>CONFS.includes(meC().cf);
function divRank(k){const t=NFL[k],wp=x=>(x.w+(x.t||0)*.5)/Math.max(1,x.w+x.l+(x.t||0));return DIVS[t.conf+t.div].map(z=>NFL[z]).sort((a,b)=>wp(b)-wp(a)).indexOf(t)+1;}
function mix(hex,to,f){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),[a,b]=[p(hex),p(to)];return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*f).toString(16).padStart(2,'0')).join('');}
function heroBg(lg){
  if(lg==='nfl'&&myN()==='SF') return 'radial-gradient(120% 90% at 100% 0%,#d03030 0%,#8c0b0b 38%,#3a0606 75%,#1a0404 100%)';
  if(lg==='cfb'&&myC()==='BYU') return 'radial-gradient(120% 90% at 100% 0%,#2e6bb5 0%,#0b3b78 35%,#06213f 75%,#030f1e 100%)';
  let c=(lg==='nfl'?meN().col:meC().col)||'#3a2b1f'; if(!/^#[0-9a-f]{6}$/i.test(c))c='#3a2b1f';
  return `radial-gradient(120% 90% at 100% 0%,${mix(c,'#ffffff',.25)} 0%,${c} 38%,${mix(c,'#000000',.6)} 75%,${mix(c,'#000000',.85)} 100%)`;
}

// Put the chosen teams in place: "me" flags, schedules, an unranked college pick added to the model.
function applyMyTeams(){
  const sv=S.mySched||{};
  MY_NSCHED=myN()==='SF'?SF_SCHED:((sv.nfl&&sv.nfl.ab===myN()&&sv.nfl.list)||[]);
  MY_NSCHED.forEach(g=>{if(NFL[g.o]){const adj=g.loc==='home'?40:g.loc==='away'?-40:0;g.p=pVs(meN().elo+adj,NFL[g.o].elo);}});
  const meta=S.myCfbMeta;
  for(let i=CFB.length-1;i>=0;i--) if(CFB[i].unr&&CFB[i].ab!==myC()) CFB.splice(i,1);
  if(!CFB.find(t=>t.ab===myC())&&meta&&meta.ab===myC()){
    const t={r:26,n:meta.n,ab:meta.ab,cf:meta.cf,w:meta.w,l:meta.l,col:meta.col,unr:1};t.s=100-t.r*2.2;t.rem=2;t._g0=t.w+t.l;t._rem0=t.rem;CFB.push(t);
  }
  CFB.forEach(t=>{t.me=t.ab===myC()?1:0;});
  if(!CFB.some(t=>t.me)){S.myCfb='BYU';CFB.forEach(t=>{t.me=t.ab==='BYU'?1:0;});}
  MY_CSCHED=myC()==='BYU'?BYU_SCHED:((sv.cfb&&sv.cfb.ab===myC()&&sv.cfb.list)||[]);
  const rate=ab=>{const c=CFB.find(x=>x.ab===ab);return c?c.s:40;}, me=meC();
  MY_CSCHED.forEach(g=>{if(myC()!=='BYU')g.p=Math.round(1000/(1+Math.exp(-((me.s-rate(g.ab))+(g.loc==='home'?3:g.loc==='away'?-3:0))/14)))/1000;});
}
// Load the remaining schedule for a non-default team from ESPN, and keep it for offline use.
async function loadMySchedules(){
  const sv=S.mySched=S.mySched||{};
  const get=async u=>{const r=await fetch(ESPN+u);if(!r.ok)throw new Error(r.status);return r.json();};
  const side=(c,ha)=>c.competitors.find(x=>x.homeAway===ha)||{};
  if(myN()!=='SF'){ try{
    const d=await get('nfl/teams/'+encodeURIComponent(espnCode('nfl',myN()).toLowerCase())+'/schedule');
    sv.nfl={ab:myN(),list:(d.events||[]).filter(e=>(!e.seasonType||e.seasonType.type===2)&&e.week&&e.week.number>=SCHED_FROM.nfl).map(e=>{const c=e.competitions[0],h=side(c,'home').team||{},a=side(c,'away').team||{},home=appAb('nfl',h.abbreviation)===myN();
      const st=c.status&&c.status.type||{};return {wk:e.week.number,o:appAb('nfl',(home?a:h).abbreviation),loc:c.neutralSite?'neutral':home?'home':'away',t:e.date,tv:'',venue:(c.venue&&c.venue.fullName)||'',tba:c.timeValid===false?1:0,done:st.state==='post'&&st.completed?1:0};}).filter(g=>NFL[g.o])};
  }catch(e){} }
  if(myC()!=='BYU'){ try{
    const dir=CFB_DIR[myC()]; let id=dir&&dir.id;
    if(!id){const t=await get('college-football/teams/'+encodeURIComponent(espnCode('cfb',myC()).toLowerCase()));id=t.team&&t.team.id;}
    if(id){ const d=await get('college-football/teams/'+id+'/schedule');
      sv.cfb={ab:myC(),list:(d.events||[]).filter(e=>(!e.seasonType||e.seasonType.type===2)&&e.date>=SCHED_FROM.cfbDate).map(e=>{const c=e.competitions[0],h=side(c,'home').team||{},a=side(c,'away').team||{},home=appAb('cfb',h.abbreviation)===myC(),o=home?a:h;
        const st=c.status&&c.status.type||{};return {o:o.location||o.displayName||o.abbreviation,ab:appAb('cfb',o.abbreviation||''),loc:c.neutralSite?'neutral':home?'home':'away',t:e.date,tba:c.timeValid===false?1:0,col:o.color?'#'+o.color:'#3a2b1f',done:st.state==='post'&&st.completed?1:0};}).filter(g=>g.ab&&g.ab!=='TBD')}; }
  }catch(e){} }
  try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){}
}
// Details for a college team outside the Top 25 (conference, record, colours).
async function loadCfbMeta(ab){
  const dir=CFB_DIR[ab]; let id=dir&&dir.id;
  const get=async u=>{const r=await fetch(ESPN+u);if(!r.ok)throw new Error(r.status);return r.json();};
  // (ESPN's team-details address blocks browsers; its schedule address carries the same team info.)
  const t=(await get('college-football/teams/'+(id||encodeURIComponent(espnCode('cfb',ab).toLowerCase()))+'/schedule')).team;
  const m=/in (.+)$/.exec(t.standingSummary||''), rec=parseRec(t.recordSummary);
  return {ab, id:t.id, n:t.location||t.displayName, cf:(m&&m[1])||CONF_BY_GROUP[t.groups&&t.groups.id]||'Independent', w:rec?rec.w:0, l:rec?rec.l:0, col:t.color?'#'+t.color:'#3a2b1f'};
}
async function setTeam(lg,ab){
  if(lg==='nfl'){ if(!NFL[ab]||ab===myN()) return; S.myNfl=ab; }
  else { if(ab===myC()) return;
    if(!CFB.find(t=>t.ab===ab&&!t.unr)){ try{ S.myCfbMeta=await loadCfbMeta(ab); }catch(e){ toast('Couldn’t load that team — check your connection','loss'); return; } }
    S.myCfb=ab; S.b12='auto'; S.utahL=false; S.ttuL=false; }
  save(); applyMyTeams(); baseModels(); NFLM_S=null; CFBM_S=null; render();
  await loadMySchedules(); applyMyTeams(); baseModels(); NFLM_S=null; CFBM_S=null;
  if(typeof refreshLive==='function') refreshLive(true); else render();
  save(); render();
  toast('Your team: '+(lg==='nfl'?NFL[ab].c+' '+NFL[ab].n:(CFB.find(t=>t.ab===ab)||{n:ab}).n),'gold');
}
function teamSheetHTML(){
  const nfl=KEYS.slice().sort((a,b)=>(NFL[a].c+NFL[a].n).localeCompare(NFL[b].c+NFL[b].n)).map(k=>`<option value="${k}" ${k===myN()?'selected':''}>${esc(NFL[k].c+' '+NFL[k].n)}</option>`).join('');
  const seen=new Set(), list=[];
  CFB.filter(t=>!t.unr).forEach(t=>{seen.add(t.ab);list.push({ab:t.ab,n:t.n,r:t.r});});
  const me=meC(); if(!seen.has(me.ab)){seen.add(me.ab);list.push({ab:me.ab,n:me.n});}
  Object.keys(CFB_DIR).forEach(ab=>{if(!seen.has(ab)){seen.add(ab);list.push({ab,n:CFB_DIR[ab].n});}});
  const ranked=list.filter(x=>x.r).sort((a,b)=>a.r-b.r), rest=list.filter(x=>!x.r).sort((a,b)=>a.n.localeCompare(b.n));
  const opt=x=>`<option value="${esc(x.ab)}" ${x.ab===myC()?'selected':''}>${x.r?'#'+x.r+' ':''}${esc(x.n)}</option>`;
  return `<div class="grab"></div><div class="eyebrow">Your teams</div>
  <p class="small muted" style="margin:6px 0 14px">Your teams get the Home card, the scenario lab, highlighted scores and their own futures.</p>
  <label class="small muted">NFL</label><select class="input" style="font-family:var(--sans);font-size:16px;margin:6px 0 14px" data-ch="teamNfl">${nfl}</select>
  <label class="small muted">College</label><select class="input" style="font-family:var(--sans);font-size:16px;margin-top:6px" data-ch="teamCfb"><optgroup label="CFP Top 25">${ranked.map(opt).join('')}</optgroup>${rest.length?`<optgroup label="All FBS">${rest.map(opt).join('')}</optgroup>`:''}</select>
  ${Object.keys(CFB_DIR).length?'':'<p class="small muted" style="margin-top:8px">More college teams appear once live scores load.</p>'}`;
}
function openTeamSheet(){$('#sheet').innerHTML=teamSheetHTML();$('#scrim').classList.add('on');$('#sheet').classList.add('on');}
document.addEventListener('change',e=>{const el=e.target.closest('[data-ch]');if(!el)return;
  if(el.dataset.ch==='teamNfl')setTeam('nfl',el.value); else if(el.dataset.ch==='teamCfb')setTeam('cfb',el.value);});
