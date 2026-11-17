// The great room: every part of the app is a spot in the room.

const SPOTS=[ // [id, x, y, w, h, label, where it goes, where you stand]   (TV is checked before the fireplace it hangs on)
  ['league', 27, 24, 30, 82,'Trophy Board · League',  {league:true},[42,198]],
  ['links', 138, 24, 28, 82,'Out the Back · The Grounds',    {golf:true},[150,198]],
  ['tv',      74, 58, 44, 36,'The TV · Scores & Today', {mode:'football',ftab:'today'},[92,212]],
  ['fireside',54, 50, 86,158,'The Fireside · Blackjack', {mode:'casino',ctab:'blackjack'},[92,212]],
  ['library',  2,106, 26, 78,'The Library · Video Poker',{mode:'casino',ctab:'poker'},[30,198]],
  ['wheel',   29,106, 26, 78,'The Wheel Room · Roulette',{mode:'casino',ctab:'roulette'},[42,198]],
  ['hazard', 137,106, 26, 78,'The Hazard Room · Craps',  {mode:'casino',ctab:'craps'},[146,198]],
  ['slots',  164,118, 28, 66,'Jingle Jackpot · Slots',   {mode:'casino',ctab:'slots'},[150,200]],
  ['stairs', 156,192, 36, 76,'Staircase · My Room',      {room:true},[154,268]],
  ['merchant',22,218, 58, 46,'The Merchant · Shop',      {shop:true},[46,272]],
  ['bar',      0,262, 88, 58,'The Bar · Drinks',         {bar:true},[40,288]],
  ['book',   104,270, 88, 50,'Sportsbook · Bets',        {mode:'football',ftab:'bets'},[140,288]],
];

let HUB_BG=null;
function drawHubStatic(){
  if(HUB_BG) return HUB_BG;
  const c=document.createElement('canvas'); c.width=PW; c.height=PH; const x=c.getContext('2d'), r=prng(42);
  // back wall: walnut planks
  for(let xx=0;xx<PW;xx+=6){ rect(x,xx,18,6,164,(xx/6)%2?LP.wal2:'#2f2118'); rect(x,xx,18,1,164,LP.wal1); }
  for(let i=0;i<26;i++){ const kx=r()*PW, ky=24+r()*120; rect(x,kx,ky,2,1,LP.wal1); rect(x,kx,ky+1,1,1,LP.wal3); }
  // wainscot and rail
  rect(x,0,150,PW,32,LP.wal1); rect(x,0,150,PW,2,LP.brass0); for(let xx=4;xx<PW;xx+=24){ rect(x,xx,156,18,22,'#24170f'); rect(x,xx,156,18,1,LP.wal2); }
  // ceiling and beams
  rect(x,0,0,PW,18,LP.wal0); for(const bx of [0,46,92,138,184]){ rect(x,bx,0,8,18,LP.wal3); rect(x,bx,0,1,18,LP.wal4); } rect(x,0,14,PW,4,LP.wal4); rect(x,0,17,PW,1,LP.wal1);
  // floor boards
  for(let y=182;y<PH;y+=5){ rect(x,0,y,PW,5,(y/5)%2?LP.wal3:'#33220f'); rect(x,0,y+4,PW,1,'#24170d'); for(let xx=((y/5)%3)*20;xx<PW;xx+=60) rect(x,xx,y,1,4,'#24170d'); }
  // rug
  for(let y=210;y<270;y++){ const k=(y-240)/30, w=Math.round(46*Math.sqrt(Math.max(0,1-k*k))); rect(x,96-w,y,w*2,1,LP.cran1); if(w>4){ rect(x,96-w,y,2,1,LP.brass0); rect(x,96+w-2,y,2,1,LP.brass0); } }
  for(let y=216;y<264;y+=6) for(let xx=60;xx<132;xx+=8) if(((y+xx)/2)%3<1) rect(x,xx,y,2,2,LP.cran2);
  // windows with frames (glass + snow drawn live)
  for(const wx of [30,138]){ rect(x,wx-3,26,30,78,LP.wal0); rect(x,wx-2,27,28,76,LP.wal4); rect(x,wx,30,24,70,LP.night1); rect(x,wx-4,100,32,4,LP.wal5); rect(x,wx-4,100,32,1,LP.wal6); }
  // doors with plaques
  const door=(dx,icon)=>{ rect(x,dx-2,118,26,64,LP.wal0); rect(x,dx,120,22,62,LP.wal4); rect(x,dx+3,124,7,24,LP.wal3); rect(x,dx+12,124,7,24,LP.wal3); rect(x,dx+3,152,7,24,LP.wal3); rect(x,dx+12,152,7,24,LP.wal3); rect(x,dx+17,150,2,3,LP.brass1);
    rect(x,dx+3,108,16,9,LP.brass0); rect(x,dx+4,109,14,7,LP.brass1); icon(dx+7,110); };
  door(4,(ix,iy)=>{ rect(x,ix,iy,8,5,LP.cran1); rect(x,ix+3,iy,1,5,LP.brass2); rect(x,ix+1,iy+1,2,3,LP.cran2); });            // library: a book
  door(31,(ix,iy)=>{ for(let a=0;a<8;a++){ const ang=a/8*6.28; rect(x,ix+4+Math.cos(ang)*3,iy+2.5+Math.sin(ang)*2.5,1,1,a%2?LP.ink:LP.cran2);} rect(x,ix+3,iy+2,2,1,LP.brass2); }); // wheel
  door(139,(ix,iy)=>{ rect(x,ix,iy,5,5,LP.snow2); rect(x,ix+1,iy+1,1,1,LP.ink); rect(x,ix+3,iy+3,1,1,LP.ink); rect(x,ix+4,iy+1,4,4,LP.cran2); rect(x,ix+5,iy+2,1,1,LP.snow2); rect(x,ix+6,iy+3,1,1,LP.snow2); }); // dice
  // fireplace: stone chimney breast, firebox, hearth, mantel with garland and stockings
  rect(x,62,52,68,130,LP.st0);
  for(let y=52;y<182;y+=7) for(let xx=62+((y/7)%2?0:5);xx<130;xx+=11){ const w=Math.min(9,130-xx); if(w>0){ rect(x,xx,y,w,6,r()<.5?LP.st1:LP.st2); rect(x,xx,y,w,1,LP.st3); } }
  for(let y=132;y<182;y++){ const k=(y-132)/14, w=y<146?Math.round(16*Math.sqrt(Math.max(0,1-(1-k)*(1-k)))):16; rect(x,96-w-2,y,w*2+4,1,LP.st1); rect(x,96-w,y,w*2,1,LP.ink); }
  rect(x,54,180,84,6,LP.st2); rect(x,54,180,84,1,LP.st3);
  rect(x,58,98,76,7,LP.wal5); rect(x,58,98,76,1,LP.wal6); rect(x,58,104,76,1,LP.wal1);
  if(SEASON.xmas){ for(let xx=58;xx<134;xx+=2){ const sag=Math.round(Math.sin((xx-58)/76*Math.PI*3)*1.5); rect(x,xx,105+Math.abs(sag),2,2,(xx/2)%2?LP.pine4:LP.pine3); if(xx%10===0) rect(x,xx,107+Math.abs(sag),1,1,LP.cran3); }
  for(const sx of [70,92,114]){ rect(x,sx,108,6,10,LP.cran1); rect(x,sx,108,6,2,LP.snow2); rect(x,sx-3,115,6,4,LP.cran1); } }
  // the league trophy board (in the left window frame)
  rect(x,30,30,24,70,LP.wal1); rect(x,31,31,22,68,'#24170f');
  rect(x,36,36,12,2,LP.brass1); rect(x,37,38,10,7,LP.brass1); rect(x,34,38,2,4,LP.brass1); rect(x,48,38,2,4,LP.brass1); rect(x,39,39,2,4,LP.brass3); rect(x,41,45,2,4,LP.brass0); rect(x,38,49,8,2,LP.brass1);
  ptext(x,'LEAGUE',31,56,LP.brass2);
  for(let i=0;i<4;i++){ rect(x,33,66+i*8,3,5,i?LP.st3:LP.brass1); rect(x,38,67+i*8,(4-i)*3+3,3,i?LP.wal5:LP.brass2); }
  // TV bezel (picture drawn live)
  rect(x,74,60,44,32,LP.ink); rect(x,75,61,42,30,'#101418'); rect(x,94,92,4,6,LP.st0);
  // armchairs
  for(const ax of [54,116]){ rect(x,ax,186,22,6,LP.wal5); rect(x,ax,192,22,12,'#4a2618'); rect(x,ax+2,190,18,4,'#5e3220'); rect(x,ax,186,4,20,'#3a1d12'); rect(x,ax+18,186,4,20,'#3a1d12'); rect(x,ax+2,204,2,4,LP.wal0); rect(x,ax+18,204,2,4,LP.wal0); }
  // staircase up to My Room
  for(let i=0;i<7;i++){ const sy=258-i*10, sx=156+i*5; rect(x,sx,sy,PW-sx,10,LP.wal4); rect(x,sx,sy,PW-sx,2,LP.wal5); rect(x,sx,sy+9,PW-sx,1,LP.wal1); }
  for(let i=0;i<34;i++) rect(x,156+i,250-i*2,1,2,LP.brass1);
  for(let i=0;i<7;i++) rect(x,158+i*5,252-i*10,1,8,LP.brass0);
  // slot machine cabinet (lights drawn live)
  rect(x,166,124,24,58,LP.cran0); rect(x,167,125,22,56,LP.cran1); rect(x,166,120,24,6,LP.brass1); rect(x,169,136,18,12,LP.ink); rect(x,170,154,16,4,LP.brass0); rect(x,168,170,20,10,LP.cran0); rect(x,190,140,2,14,LP.st3); rect(x,189,138,4,3,LP.cran3);
  // merchant table (the merchant stands behind it, drawn live)
  rect(x,24,246,52,4,LP.wal5); rect(x,24,250,52,12,LP.cran1); rect(x,24,250,52,1,LP.brass1); for(let xx=26;xx<76;xx+=6) rect(x,xx,261,3,2,LP.brass0);
  rect(x,30,240,8,6,LP.ink); rect(x,28,245,12,1,LP.ink); rect(x,30,242,8,1,LP.cran2);     // top hat
  rect(x,62,241,6,5,LP.brass1); rect(x,63,242,4,3,LP.brass3); rect(x,64,243,1,1,LP.ink);  // pocket watch
  rect(x,48,244,10,2,LP.pine4); rect(x,56,244,2,3,LP.pine4);                              // scarf
  // bar counter (bartender drawn live behind it)
  rect(x,0,292,88,28,LP.wal3); rect(x,0,290,88,4,LP.wal5); rect(x,0,290,88,1,LP.wal6); rect(x,0,297,88,1,LP.brass1);
  for(let xx=4;xx<84;xx+=14){ rect(x,xx,300,10,16,LP.wal4); rect(x,xx,300,10,1,LP.wal5); }
  rect(x,10,284,5,6,LP.snow2); rect(x,11,285,3,4,'#6b3a1f'); rect(x,66,284,5,6,LP.snow2); rect(x,67,285,3,4,LP.emb0);
  // sportsbook desk with odds board (ticker drawn live)
  rect(x,104,294,88,26,LP.wal4); rect(x,104,292,88,3,LP.pine3); rect(x,104,292,88,1,LP.brass1); for(let xx=108;xx<190;xx+=20){ rect(x,xx,298,16,18,LP.wal3); }
  rect(x,130,274,58,16,LP.ink); rect(x,130,274,58,1,LP.brass1); rect(x,130,289,58,1,LP.brass1); rect(x,156,290,6,3,LP.wal1);
  return HUB_BG=c;
}
// What the TV shows: your NFL team's next game and your chance to win it.
function tvInfo(){
  try{ const g=nextMyGame('nfl'); if(!g) return ['4&G','LODGE'];
    const K=myN(), meA=g.a.ab===K, M=market(g), p=meA?1-M.ph:M.ph;
    if(g.s==='live'&&g.as!=null) return [g.a.ab+' '+g.as,g.h.ab+' '+g.hs];
    return [(meA?K+'@'+g.h.ab:K+' V '+g.a.ab), Math.round(p*100)+' PCT']; }catch(e){ return ['4&G','LODGE']; }
}
function makeHub(host,onSpot){
  const {c,ctx}=makeCanvas(host);
  const winSnow=[snowField(18,31,{x:30,y:30,w:24,h:70}),snowField(18,32,{x:138,y:30,w:24,h:70})];
  const tree=prng(5), lights=Array.from({length:14},()=>({x:4+tree()*22,y:192+tree()*42,c:[LP.cran3,LP.brass2,LP.emb2,LP.snow2][tree()*4|0],p:tree()*6}));
  let tv=tvInfo(), tvAt=0, flash=null;
  // You: walk to wherever the room is tapped. Feet position in room pixels.
  const me={x:96,y:246,tx:90,ty:246,face:1,speed:40,arrive:null,walkT:0};
  const walkTo=(x,y,arrive)=>{ const p=walkable(x,y); me.tx=p[0]; me.ty=p[1]; me.arrive=arrive||null; const d=Math.hypot(me.tx-me.x,me.ty-me.y); me.speed=Math.max(40,d/0.85); clearTimeout(me.backup);
    if(d<1&&arrive){ me.arrive=null; arrive(); return; }
    // Backup: if the phone slows animation down (e.g. Low Power Mode), still arrive and open the spot.
    if(arrive) me.backup=setTimeout(()=>{ if(me.arrive===arrive){ me.arrive=null; me.x=me.tx; me.y=me.ty; arrive(); } },d/me.speed*1000+450); };
  const look=lodgeLook();
  const loop=makeLoop((t,dt)=>{
    ctx.drawImage(drawHubStatic(),0,0);
    // chandelier glow
    const g=.8+Math.sin(t*3)*.05+Math.sin(t*11)*.04; ctx.globalAlpha=.12*g; for(let rr=34;rr>0;rr-=8) rect(ctx,96-rr,22-rr/3,rr*2,rr*.8,LP.emb2); ctx.globalAlpha=1;
    rect(ctx,95,14,2,8,LP.brass0); rect(ctx,86,22,20,2,LP.brass1); for(const cx of [86,92,98,104]) rect(ctx,cx,19,2,3,g>.82?LP.emb3:LP.emb2);
    // windows: night, moon, snow, sill
    rect(ctx,138,30,24,70,SEASON.sky);
    for(let yy=-4;yy<=4;yy++)for(let xx=-4;xx<=4;xx++) if(xx*xx+yy*yy<=16) rect(ctx,154+xx,40+yy,1,1,LP.moon);
    rect(ctx,138,86,24,14,SEASON.snow?LP.snow1:'#3f7a3a'); rect(ctx,141,84,10,4,SEASON.snow?'#9fd0b0':'#72c86c'); rect(ctx,147,72,1,13,LP.snow2); rect(ctx,148,72,4,3,Math.sin(t*5)>0?LP.cran3:LP.cran2);
    winSnow[1].draw(ctx,dt,SEASON.fall); rect(ctx,149,30,2,70,LP.wal4); rect(ctx,138,62,24,2,LP.wal4);
    if(Math.sin(t*2.3)>.7) rect(ctx,46,37,1,1,'#ffffff');
    // fire
    for(let col=0;col<28;col++){ const xx=82+col, h=10+Math.round(8*Math.abs(Math.sin(t*6+col*.7))+5*Math.abs(Math.sin(t*13+col*1.9))+(col>6&&col<22?8:0));
      for(let y=0;y<h;y++){ const k=y/h; rect(ctx,xx,178-y,1,1,k<.25?LP.emb4:k<.5?LP.emb3:k<.75?LP.emb1:LP.emb0); } }
    rect(ctx,84,176,24,4,LP.wal1); rect(ctx,88,174,16,2,LP.wal2);
    for(let i=0;i<4;i++){ const k=((t*.7+i*.27)%1); rect(ctx,88+i*5+Math.sin(t*3+i)*2,170-k*34,1,1,k<.7?LP.emb2:LP.emb0); }
    ctx.globalAlpha=.10+.04*Math.sin(t*7); rect(ctx,54,180,84,40,LP.emb1); ctx.globalAlpha=1;
    // TV picture
    if(t-tvAt>5){ tv=tvInfo(); tvAt=t; }
    rect(ctx,75,61,42,30,LP.pine2); rect(ctx,75,61,42,6,LP.pine3); ptext(ctx,'LIVE',77,62,LP.cran3);
    if(Math.sin(t*4)>0) rect(ctx,94,63,2,2,LP.cran3);
    ptext(ctx,tv[0].slice(0,10),96-ptextW(tv[0].slice(0,10))/2,70,LP.brass2); ptext(ctx,tv[1].slice(0,10),96-ptextW(tv[1].slice(0,10))/2,79,LP.snow2);
    // tree with lights and star (holiday) · a snowy pine (winter) · a big potted plant and a golf bag (spring–fall)
    if(SEASON.snow){
      for(let i=0;i<50;i++){ const w=Math.round(i*.26)+1; rect(ctx,15-w,188+i,w*2,1,i%7<3?LP.pine3:LP.pine4); if(!SEASON.xmas&&i%7===0) rect(ctx,15-w,188+i,w*2,1,LP.snow1); }
      rect(ctx,13,238,4,4,LP.wal3); rect(ctx,9,241,12,3,SEASON.xmas?LP.cran1:LP.wal4);
      if(SEASON.xmas){ for(const L of lights){ if(Math.sin(t*2.2+L.p)>-.3) rect(ctx,L.x,L.y,1,1,L.c); }
        const sp=Math.sin(t*3)>0; rect(ctx,14,183,3,3,LP.brass1); rect(ctx,15,182,1,5,sp?LP.brass3:LP.brass1); rect(ctx,13,184,5,1,sp?LP.brass3:LP.brass1); }
    } else {
      const leaf=SEASON.id==='fall'?['#c9782c','#e8963c']:SEASON.id==='spring'?['#2a6a3a','#e88aa8']:['#2a6a3a','#3a8a4a'];
      for(let i=0;i<22;i++){ const a=i/22*Math.PI, r=12+Math.sin(i*1.7)*3; rect(ctx,15+Math.cos(a)*r-1,224-Math.sin(a)*r*1.4+Math.sin(t*1.5+i)*.5,3,2,leaf[i%2]); }
      for(let i=0;i<10;i++) rect(ctx,8+i,214+(i%3),2,12,leaf[0]);
      rect(ctx,8,226,14,10,LP.cran1); rect(ctx,7,226,16,2,LP.cran2); rect(ctx,9,236,12,4,LP.cran0);
      rect(ctx,22,214,5,22,'#2b3a5c'); rect(ctx,22,214,5,2,LP.brass1); rect(ctx,23,208,1,6,LP.st3); rect(ctx,25,206,1,8,LP.st3); rect(ctx,22,207,2,2,LP.st3); rect(ctx,25,205,2,2,LP.st3);
    }
    // slot machine reels and bulbs
    const syms=[LP.cran3,LP.brass2,LP.pine5,LP.snow2];
    for(let i=0;i<3;i++){ const k=(t*1.5+i*.4)%4|0; rect(ctx,170+i*6,138,4,8,syms[(k+i)%4]); }
    for(let i=0;i<6;i++) rect(ctx,168+i*4,121,2,2,Math.sin(t*6+i)>0?LP.emb3:LP.brass0);
    // odds board ticker
    const msg='ODDS  '+(tv[0]||'')+'  SPREAD  TOTAL  MONEY  PARLAY  ', w=ptextW(msg)+4, off=(t*14)%w;
    ctx.save(); ctx.beginPath(); ctx.rect(131,276,56,12); ctx.clip(); ptext(ctx,msg+msg,131-off,279,LP.emb2); ctx.restore();
    // people: merchant behind the table, bartender behind the bar, you on the rug
    ctx.drawImage(personSprite('merchant',Math.sin(t*.9)>.95?'idle1':'idle0'),44,250-PERSON_H); rect(ctx,24,246,52,4,LP.wal5); rect(ctx,24,250,52,12,LP.cran1); rect(ctx,24,250,52,1,LP.brass1);
    rect(ctx,30,240,8,6,LP.ink); rect(ctx,28,245,12,1,LP.ink); rect(ctx,62,241,6,5,LP.brass1); rect(ctx,48,244,10,2,LP.pine4);
    const pour=(t%9)>7.6||(LODGE.pour&&performance.now()-LODGE.pour<1600); ctx.drawImage(personSprite('bartender',pour?'pour0':(Math.sin(t*1.3)>.96?'idle1':'idle0')),36,296-PERSON_H);
    rect(ctx,0,292,88,28,LP.wal3); rect(ctx,0,290,88,4,LP.wal5); rect(ctx,0,290,88,1,LP.wal6); rect(ctx,0,297,88,1,LP.brass1); for(let xx=4;xx<84;xx+=14){ rect(ctx,xx,300,10,16,LP.wal4); rect(ctx,xx,300,10,1,LP.wal5); }
    rect(ctx,10,284,5,6,LP.snow2); rect(ctx,11,285,3,4,'#6b3a1f'); rect(ctx,66,284,5,6,LP.snow2); rect(ctx,67,285,3,4,LP.emb0);
    const dx=me.tx-me.x, dy=me.ty-me.y, d=Math.hypot(dx,dy), moving=d>0.5;
    if(moving){ const st=Math.min(d,me.speed*dt); me.x+=dx/d*st; me.y+=dy/d*st; if(Math.abs(dx)>0.5) me.face=dx<0?-1:1; me.walkT+=dt; }
    else if(me.arrive){ const a=me.arrive; me.arrive=null; clearTimeout(me.backup); setTimeout(a,60); }
    const bob=!moving&&Math.sin(t*2)>.6?1:0, fr=moving?'walk'+((me.walkT*10|0)%4):(Math.sin(t*.8)>.97?'idle1':'idle0');
    drawPerson(ctx,'player',fr,lodgeLook(),me.x,me.y+bob,me.face);
    drawHeld(ctx,me.x,me.y+bob,me.face,t);
    // tap flash
    if(flash){ const k=(performance.now()-flash.at)/350; if(k>=1) flash=null; else { ctx.globalAlpha=.45*(1-k); rect(ctx,flash.x,flash.y,flash.w,flash.h,LP.brass2); ctx.globalAlpha=1; } }
  });
  c.addEventListener('click',e=>{
    const b=c.getBoundingClientRect(), px=(e.clientX-b.left)/b.width*PW, py=(e.clientY-b.top)/b.height*PH;
    const s=SPOTS.find(([,x,y,w,h])=>px>=x&&px<x+w&&py>=y&&py<y+h);
    if(!s){ if(py>=186){ walkTo(px,py); tone(520,.04,'square',.02); } return; }
    flash={x:s[1],y:s[2],w:s[3],h:s[4],at:performance.now()}; tone(660,.06,'square',.03); tone(990,.08,'square',.02,.05);
    walkTo(s[7][0],s[7][1],()=>onSpot(s));
  });
  return {loop,canvas:c,me,walkTo};
}

// Where you can stand: the floor, but not inside the tree, the merchant's table, the stairs or the counters.
function walkable(x,y){
  y=clamp(y,196,288); x=clamp(x,8,182);
  if(x<30&&y<244) x=30;                         // Christmas tree
  if(x>18&&x<82&&y>234&&y<268) y=y<251?234:268; // merchant's table
  if(x>152&&y<270) x=Math.min(x,152);           // staircase
  return [x,y];
}
// Draw a person standing with their feet at (x, y), facing left (-1) or right (1).
function drawPerson(ctx,who,frame,look,x,y,face){
  const spr=personSprite(who,frame,look), X=Math.round(x-6), Y=Math.round(y-PERSON_H);
  if(face<0){ ctx.save(); ctx.translate(X+12,Y); ctx.scale(-1,1); ctx.drawImage(spr,0,0); ctx.restore(); } else ctx.drawImage(spr,X,Y);
}
