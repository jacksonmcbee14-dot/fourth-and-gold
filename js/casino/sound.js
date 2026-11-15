// Synthesized sound effects (no audio files)
/* ---------- Sound (synthesized, no files) ---------- */
let AC=null;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(AC&&AC.state==='suspended') AC.resume().catch(()=>{}); return AC; }
function tone(f,d,type='sine',v=.15,when=0,slide){
  if(!S.sound) return; const a=ac(); if(!a) return;
  try{
    const o=a.createOscillator(), g=a.createGain(), t0=a.currentTime+when;
    o.type=type; o.frequency.setValueAtTime(f,t0); if(slide) o.frequency.exponentialRampToValueAtTime(slide,t0+d);
    g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(v,t0+.012); g.gain.exponentialRampToValueAtTime(.0001,t0+d);
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0+d+.05);
  }catch(e){}
}
const SND={
  spin:()=>{for(let i=0;i<5;i++)tone(300+i*90,.06,'square',.025,i*.035);},
  stop:()=>{tone(140,.14,'triangle',.22,0,55);tone(2400,.03,'square',.015);},
  scatter:()=>{tone(1318,.6,'sine',.12);tone(1976,.7,'sine',.07,.07);tone(2637,.5,'sine',.04,.14);},
  antic:()=>{tone(180,1.4,'sawtooth',.035,0,720);},
  tick:()=>tone(1900+rng()*700,.05,'square',.025),
  win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.28,'triangle',.11,i*.08)),
  bells:()=>{for(let i=0;i<22;i++)tone(2400+rng()*1600,.12,'sine',.03,i*.06);},
  // "Jingle Bells" (J. Pierpont, 1857 — public domain), opening phrase
  jingle:()=>{const E=659,G=784,C=523,D=587,b=.17;[[E,0],[E,1],[E,2],[E,4],[E,5],[E,6],[E,8],[G,9],[C,10],[D,11],[E,12]].forEach(([f,t])=>{tone(f,.24,'triangle',.13,t*b);tone(f*2,.2,'sine',.035,t*b);});tone(1047,1.1,'sine',.06,12*b);SND.bells();},
  boom:()=>{tone(80,.5,'sine',.25,0,40);},
  drum:(t=0,v=.32)=>{tone(95,.28,'sine',v,t,42);tone(190,.08,'triangle',v*.3,t,90);},
  drumroll:()=>{let t=0;for(let i=0;i<18;i++){SND.drum(t,.12+i*.012);t+=Math.max(.045,.13-i*.006);}SND.drum(t+.05,.45);},
  gong:()=>{tone(98,2.4,'sine',.22);tone(147,2,'triangle',.07);tone(196,1.6,'sine',.06,.02);tone(392,1.2,'sine',.03,.03);SND.drum(0,.4);},
};

