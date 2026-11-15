// Slot maths: paytable, reel strips, jackpot odds, win evaluation
/* ---------- Slot math (243 ways, Dancing-Drums style) ---------- */
const PAYS={SEVEN:[0,0,0,105,350,1400],BELL:[0,0,0,70,210,700],ORN:[0,0,0,53,140,525],STOCK:[0,0,0,42,105,420],CANE:[0,0,0,35,88,350],A:[0,0,0,18,35,175],K:[0,0,0,18,35,140],Q:[0,0,0,14,28,105],J:[0,0,0,11,21,88]};
const PAY_UNIT=1/50;               // pays are in 1/50ths of the total bet
const SCAT={3:[2,8],4:[5,10]};     // gift boxes: [× total bet, free spins]
const FS_MULT=2;
const JPT=[ // jackpot ladder; p = chance this tier is the one you match in the pick bonus
  {k:'grand',n:'Grand',m:2000,p:.01},{k:'major',n:'Major',m:400,p:.05},{k:'maxi',n:'Maxi',m:100,p:.14},{k:'minor',n:'Minor',m:25,p:.30},{k:'mini',n:'Mini',m:10,p:.50}];
const JP_ODDS=1/850;               // chance any spin triggers the Golden Star jackpot pick
const SYMNAME={WILD:'Wild Tree',BONUS:'Gift Box',SEVEN:'Candy 7',BELL:'Golden Bell',ORN:'Ornament',STOCK:'Stocking',CANE:'Candy Cane',A:'Ace',K:'King',Q:'Queen',J:'Jack'};
const WEIGHTS=[
 {BONUS:3,SEVEN:3,BELL:5,ORN:6,STOCK:7,CANE:8,A:10,K:10,Q:11,J:12},
 {WILD:3,BONUS:3,SEVEN:3,BELL:5,ORN:6,STOCK:7,CANE:8,A:10,K:10,Q:11,J:12},
 {WILD:3,BONUS:3,SEVEN:3,BELL:5,ORN:6,STOCK:7,CANE:8,A:10,K:10,Q:11,J:12},
 {WILD:3,BONUS:3,SEVEN:3,BELL:5,ORN:6,STOCK:7,CANE:8,A:10,K:10,Q:11,J:12},
 {SEVEN:3,BELL:5,ORN:6,STOCK:7,CANE:8,A:10,K:10,Q:11,J:12},
];
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const STRIPS=WEIGHTS.map((w,r)=>{const arr=[];for(const s in w)for(let i=0;i<w[s];i++)arr.push(s);const R=mulberry(9001+r*77);
  for(let k=0;k<80;k++){for(let i=arr.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
    let ok=true;for(let i=0;i<arr.length;i++){const a=arr[i],b=arr[(i+1)%arr.length],c=arr[(i+2)%arr.length];if((a==='BONUS'&&(b==='BONUS'||c==='BONUS'))||(a==='WILD'&&b==='WILD')){ok=false;break;}}if(ok)break;}
  return arr;});
const windowAt=stops=>stops.map((s,r)=>{const L=STRIPS[r].length;return [STRIPS[r][s%L],STRIPS[r][(s+1)%L],STRIPS[r][(s+2)%L]];});
function evalGrid(g){
  const wins=[];let total=0;
  for(const sym in PAYS){
    let ways=1,n=0;const pos=[];
    for(let r=0;r<5;r++){const rows=[0,1,2].filter(i=>g[r][i]===sym||g[r][i]==='WILD');if(!rows.length)break;ways*=rows.length;n++;rows.forEach(i=>pos.push([r,i]));}
    if(n>=3){const m=PAYS[sym][n]*ways;wins.push({sym,n,ways,mult:m,pos});total+=m;}
  }
  let sc=0;const scPos=[];g.forEach((col,r)=>col.forEach((x,row)=>{if(x==='BONUS'){sc++;scPos.push([r,row]);}}));
  return {wins,total,sc,scPos,scat:SCAT[Math.min(sc,4)]||null};
}

