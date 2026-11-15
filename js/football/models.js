// Season simulation models (NFL and college)
/* =========================================================
   MODELS
   ========================================================= */
const pVs=(a,b)=>1/(1+Math.pow(10,-(a-b)/400));
for(const k in NFL){const t=NFL[k];const imp=100/(t.sb+100);const gp=t.w+t.l+(t.t||0);const wp=(t.w+(t.t||0)*.5)/gp;t.elo=1500+72*Math.log(imp/0.03125)+(wp-.5)*110;t.pAvg=pVs(t.elo,1500);}
SF_SCHED.forEach(g=>{const adj=g.loc==='home'?40:g.loc==='away'?-40:0;g.p=pVs(NFL.SF.elo+adj,NFL[g.o].elo);});
const KEYS=Object.keys(NFL);
const DIVS={};for(const k of KEYS){const t=NFL[k];(DIVS[t.conf+t.div]=DIVS[t.conf+t.div]||[]).push(k);}
function nflAgg(){const o={n:0,t:{},sfW:new Array(19).fill(0)};for(const k of KEYS)o.t[k]={po:0,div:0,s1:0,wins:0,seed:new Array(8).fill(0)};return o;}
function nflRun(agg,n,forced){
  for(let i=0;i<n;i++){
    const W={};
    for(const k of KEYS){
      const t=NFL[k]; let w=t.w+(t.t||0)*.5;
      if(k==='SF'){ for(let j=0;j<SF_SCHED.length;j++){const g=SF_SCHED[j],f=forced[j]; if(g.done) continue; if(f==='W')w++; else if(f==='A'&&Math.random()<g.p)w++;} }
      else { const rem=17-t.w-t.l-(t.t||0); for(let r=0;r<rem;r++) if(Math.random()<t.pAvg) w++; }
      W[k]=w+Math.random()*.4; agg.t[k].wins+=w;
    }
    agg.sfW[Math.min(18,Math.round(W.SF-.2))]++;
    for(const conf of ['AFC','NFC']){
      const lead=[],rest=[];
      for(const d of ['East','North','South','West']){const ks=DIVS[conf+d].slice().sort((a,b)=>W[b]-W[a]);lead.push(ks[0]);rest.push(...ks.slice(1));}
      lead.sort((a,b)=>W[b]-W[a]);rest.sort((a,b)=>W[b]-W[a]);
      const seeds=lead.concat(rest.slice(0,3));
      for(let s=0;s<7;s++){const a=agg.t[seeds[s]];a.po++;a.seed[s+1]++;if(s===0)a.s1++;if(s<4)a.div++;}
    }
    agg.n++;
  }
  return agg;
}
const CONFS=['SEC','Big Ten','Big 12','ACC'];
CFB.forEach(t=>{t.s=100-t.r*2.2; if(!t.rem)t.rem=2;});
function cfbAgg(){const o={n:0,t:{}};CFB.forEach(t=>o.t[t.n]={po:0,bye:0,rank:0,b12g:0,b12w:0});return o;}
function cfbRun(agg,n,opt){
  const byu=CFB.find(t=>t.me);
  for(let i=0;i<n;i++){
    const L={},champ={},tl={};
    for(const t of CFB){
      let l=t.l, rem=t.rem;
      if(t===byu){ opt.g.forEach((f,j)=>{ if(f==='L')l++; else if(f==='A'&&Math.random()>BYU_SCHED[j].p) l++; }); }
      else{
        if((t.n==='Utah'&&opt.utahL)||(t.n==='Texas Tech'&&opt.ttuL)){l++;rem--;}
        for(let r=0;r<rem;r++) if(Math.random()>1/(1+Math.exp(-(t.s-34)/16))) l++;
      }
      L[t.n]=l;
    }
    for(const c of CONFS){
      let ts=CFB.filter(t=>t.cf===c).sort((a,b)=>L[a.n]-L[b.n]||a.r-b.r+gauss()*0.6);
      if(c==='Big 12'){
        if(opt.b12==='miss') ts=ts.filter(t=>t!==byu);
        else if((opt.b12==='win'||opt.b12==='lose')&&ts.indexOf(byu)>1){ts=ts.filter(t=>t!==byu);ts.splice(1,0,byu);}
      }
      const [A,B]=ts; if(!A) continue; if(!B){champ[A.n]=1;continue;}
      let aWins=Math.random()<1/(1+Math.exp(-(A.s-B.s)/14));
      if(c==='Big 12'&&(A===byu||B===byu)){
        agg.t.BYU.b12g++;
        if(opt.b12==='win') aWins = A===byu; else if(opt.b12==='lose') aWins = B===byu;
      }
      const w=aWins?A:B, lo=aWins?B:A; champ[w.n]=1; L[lo.n]++; tl[lo.n]=1;
      if(w===byu) agg.t.BYU.b12w++;
    }
    champ['Boise State']=1; champ['Notre Dame']=0;
    const ord=CFB.map(t=>({t,sc:t.r+(L[t.n]-t.l)*5.2-(champ[t.n]?2.5:0)+(tl[t.n]?-.5:0)+gauss()*1.6})).sort((a,b)=>a.sc-b.sc);
    ord.forEach((o,ix)=>{o.fr=ix+1;agg.t[o.t.n].rank+=ix+1;});
    const champs=ord.filter(o=>champ[o.t.n]).slice(0,5);
    const field=new Set(champs.map(o=>o.t.n));
    for(const o of ord){ if(field.size>=12)break; field.add(o.t.n); }
    const inField=ord.filter(o=>field.has(o.t.n));
    inField.forEach((o,ix)=>{agg.t[o.t.n].po++; if(ix<4)agg.t[o.t.n].bye++;});
    agg.n++;
  }
  return agg;
}
let NFLM=null, CFBM=null;
function baseModels(){
  NFLM=nflRun(nflAgg(),5000,SF_SCHED.map(()=>'A'));
  CFBM=cfbRun(cfbAgg(),5000,{g:['A','A'],b12:'auto',utahL:false,ttuL:false});
}
const nflP=k=>NFLM.t[k].po/NFLM.n;
const cfbP=n=>CFBM.t[n].po/CFBM.n;

