// Welcome scene: snow falling outside the lodge at night, the doors open, your character walks in
// and brushes the snow off their coat. Full version once a day, a short one otherwise. Tap to skip.

let EXT_BG=null;
function drawExteriorStatic(){
  if(EXT_BG) return EXT_BG;
  const c=document.createElement('canvas'); c.width=PW; c.height=PH; const x=c.getContext('2d'), r=prng(7);
  // sky in dithered bands
  const bands=[[0,LP.night0],[70,LP.night1],[140,LP.night2]];
  for(let y=0;y<210;y++){ let col=LP.night0; for(const [by,bc] of bands) if(y>=by) col=bc;
    rect(x,0,y,PW,1,col);
    for(const [by,bc] of bands){ if(y>=by-6&&y<by){ for(let xx=(y%2);xx<PW;xx+=2) rect(x,xx,y,1,1,bc); } } }
  for(let i=0;i<60;i++){ rect(x,r()*PW,r()*130,1,1,r()<.3?LP.brass2:LP.snow1); }
  // moon with craters
  for(let yy=-9;yy<=9;yy++)for(let xx=-9;xx<=9;xx++) if(xx*xx+yy*yy<=81) rect(x,158+xx,32+yy,1,1,(xx*xx+yy*yy>60&&xx>2)?LP.brass1:LP.moon);
  rect(x,154,28,3,2,LP.brass1); rect(x,160,35,2,2,LP.brass1);
  // far and near pines
  const pine=(cx,base,h,col)=>{ for(let i=0;i<h;i++){ const w=Math.max(1,Math.round(i*.45)); rect(x,cx-w,base-h+i,w*2+1,1,col); } rect(x,cx-1,base,3,4,LP.wal1); };
  for(let i=0;i<22;i++) pine(i*9+r()*6, 206, 22+r()*20, LP.pine1);
  pine(10,214,58,LP.pine2); pine(182,212,64,LP.pine2); pine(26,218,40,LP.pine3); pine(170,220,44,LP.pine3);
  // snowy ground
  rect(x,0,206,PW,PH-206,LP.snow1);
  for(let y=206;y<PH;y+=6) for(let xx=0;xx<PW;xx+=1) if(r()<.08) rect(x,xx,y+(r()*5|0),1,1,LP.snow0);
  for(let i=0;i<9;i++){ const dx=r()*PW, dy=212+r()*90, w=10+r()*24; rect(x,dx,dy,w,1,LP.snow2); rect(x,dx+2,dy+1,w-4,1,LP.snow2); }
  // path to the door
  for(let y=244;y<PH;y++){ const w=34+(y-244)*.55; rect(x,96-w/2,y,w,1,'#dfe6ea'); }
  // lodge: log walls
  for(let y=128;y<238;y+=8){ rect(x,34,y,124,8,(y/8)%2?LP.wal4:LP.wal3); rect(x,34,y,124,1,LP.wal5); rect(x,34,y+7,124,1,LP.wal1);
    for(let i=0;i<6;i++) rect(x,40+r()*112,y+2+(r()*4|0),3+r()*6,1,LP.wal2);
    for(const ex of [30,158]){ rect(x,ex,y+1,6,6,LP.wal5); rect(x,ex+1,y+2,4,4,LP.wal6); rect(x,ex+2,y+3,2,2,LP.wal4); } }
  // gable wall with an attic window
  for(let y=84;y<128;y++){ const w=(y-84)*1.25; rect(x,96-w,y,w*2,1,LP.wal3); }
  for(let xx=58;xx<136;xx+=6) for(let y=84;y<128;y++){ const w=(y-84)*1.25; if(Math.abs(xx-96)<w) rect(x,xx,y,1,1,LP.wal2); }
  for(let yy=-7;yy<=7;yy++)for(let xx=-7;xx<=7;xx++) if(xx*xx+yy*yy<=49) rect(x,96+xx,110+yy,1,1,xx*xx+yy*yy>36?LP.wal1:(Math.abs(xx)<1||Math.abs(yy)<1)?LP.wal1:LP.emb2);
  // roof with snow
  for(let i=0;i<54;i++){ const y=76+i; rect(x,96-i*1.42-4,y,8,2,LP.wal1); rect(x,96+i*1.42-4,y,8,2,LP.wal1); }
  for(let i=0;i<54;i++){ const y=72+i; rect(x,96-i*1.42-5,y,7,3,LP.snow2); rect(x,96+i*1.42-2,y,7,3,LP.snow2); if(i%7===3){ rect(x,96-i*1.42-3,y+3,1,2+(i%3),LP.snow1); rect(x,96+i*1.42+2,y+3,1,2+(i%2),LP.snow1);} }
  // chimney
  rect(x,128,64,16,36,LP.st1); for(let y=64;y<100;y+=5) for(let xx=128;xx<144;xx+=6) rect(x,xx+((y/5)%2?3:0),y,5,4,LP.st2);
  rect(x,126,60,20,5,LP.snow2);
  // windows
  for(const wx of [46,122]){ rect(x,wx-2,150,28,30,LP.wal1); rect(x,wx,152,24,26,LP.emb2); rect(x,wx+6,156,12,18,LP.emb3); rect(x,wx+11,152,2,26,LP.wal1); rect(x,wx,164,24,2,LP.wal1); rect(x,wx-3,180,30,3,LP.snow2); }
  // door frame, sign, porch
  rect(x,78,180,36,58,LP.wal0); rect(x,80,182,32,56,LP.emb1);
  rect(x,68,138,56,10,LP.wal5); rect(x,68,138,56,1,LP.wal6); rect(x,68,147,56,1,LP.wal1);
  ptext(x,'FOURTH & GOLD',96-ptextW('FOURTH & GOLD')/2,140,LP.brass2);
  rect(x,70,238,52,4,LP.st2); rect(x,66,242,60,4,LP.st1); rect(x,66,238,60,1,LP.snow2);
  if(!SEASON.snow) seasonRecolor(x);
  return EXT_BG=c;
}
// Outside of winter, the snowy ground, roof and trees turn into the season's colours.
function seasonRecolor(x){
  const P={spring:['#3f7a3a','#4f8c4a','#5a9a50'],summer:['#5a8a3a','#6a9a44','#7aa84e'],fall:['#6a6a2a','#8a6a2a','#a8783a']}[SEASON.id]; if(!P) return;
  const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const map=new Map([[LP.snow0,P[0]],[LP.snow1,P[1]],[LP.snow2,P[2]],['#dfe6ea','#b8a078']].map(([a,b])=>[hex(a).join(),hex(b)]));
  const img=x.getImageData(0,0,PW,PH), d=img.data;
  for(let i=0;i<d.length;i+=4){ const m=map.get(d[i]+','+d[i+1]+','+d[i+2]); if(m){ d[i]=m[0]; d[i+1]=m[1]; d[i+2]=m[2]; } }
  x.putImageData(img,0,0);
}

function makeWelcome(host,onDone){
  const {c,ctx}=makeCanvas(host);
  const snowBack=snowField(70,11), snowFront=snowField(26,12);
  const full=(S.lodge.lastFull!==dayKey());
  if(full){ S.lodge.lastFull=dayKey(); save(); }
  const T0=full?0:2.3, SPEED=full?1:1.7, END=6.0;
  let t=T0, finished=false, prints=[], bits=[], coatSnow=6, lastPrint=0;
  const look=lodgeLook();
  function finish(){ if(finished) return; finished=true; t=END; onDone&&onDone(); }
  c.addEventListener('click',finish);
  const loop=makeLoop((_,dt)=>{
    if(!finished){ t+=dt*SPEED; if(t>=END) finish(); }
    ctx.drawImage(drawExteriorStatic(),0,0);
    const tt=performance.now()/1000;
    // twinkles, chimney smoke, lanterns
    for(let i=0;i<8;i++){ const p=prng(100+i)(); if(Math.sin(tt*2+i*1.7)>.7) rect(ctx,(p*PW)|0,(prng(200+i)()*120)|0,1,1,LP.brass3); }
    for(let i=0;i<5;i++){ const k=((tt*.25+i/5)%1); const s=2+k*6; ctx.globalAlpha=(1-k)*.5; rect(ctx,134+Math.sin(k*6+i)*4-s/2,58-k*46,s,s,LP.st3); } ctx.globalAlpha=1;
    for(const lx of [72,118]){ const f=.75+Math.sin(tt*9+lx)*.15+Math.sin(tt*23+lx)*.1; ctx.globalAlpha=.25*f; rect(ctx,lx-6,186,12,14,LP.emb2); ctx.globalAlpha=1; rect(ctx,lx-2,190,4,6,f>.8?LP.emb3:LP.emb2); rect(ctx,lx-3,189,6,1,LP.brass1); rect(ctx,lx-3,196,6,1,LP.brass1); }
    // doors open
    const o=clamp((t-2.4)/0.8,0,1), ease=1-Math.pow(1-o,3);
    rect(ctx,80,182,32,56,o>0?LP.emb3:LP.emb1);
    if(o>0){ ctx.globalAlpha=.6*ease; rect(ctx,84,186,24,52,LP.emb4); ctx.globalAlpha=.28*ease;
      for(let y=242;y<PH;y++){ const w=32+(y-242)*.9; rect(ctx,96-w/2,y,w,1,LP.emb2); } ctx.globalAlpha=1; }
    const lw=Math.round(16*(1-ease));
    if(lw>0){ for(const [dx,dir] of [[80,1],[112-lw,-1]]){ rect(ctx,dx,182,lw,56,LP.wal4); for(let yy=186;yy<236;yy+=10) rect(ctx,dx+1,yy,Math.max(0,lw-2),8,LP.wal3); if(lw>4) rect(ctx,dir>0?dx+lw-3:dx+1,208,2,4,LP.brass1); } }
    // your character: walk up the path, stop, brush off the snow, step inside
    let px=90, feet=300, frame='idle0', alpha=1;
    if(t<0.6){ feet=PH+30; }
    else if(t<2.6){ const k=(t-0.6)/2; feet=PH+20-k*(PH+20-250); frame='walk'+((t*8|0)%4); if(t-lastPrint>.22){ lastPrint=t; prints.push([px+((t*8|0)%2?2:7),feet-1]); } }
    else if(t<3.2){ feet=250; frame=(t*2|0)%2?'idle1':'idle0'; }
    else if(t<4.4){ feet=250; frame=((t*7|0)%2)?'brush0':'brush1'; if(coatSnow>0&&Math.random()<dt*7){ coatSnow-=.5; for(let i=0;i<3;i++) bits.push({x:px+3+Math.random()*7,y:feet-15,vx:(Math.random()-.5)*14,vy:-6-Math.random()*8}); } }
    else if(t<5.2){ const k=(t-4.4)/.8; feet=250-k*12; frame='walk'+((t*8|0)%4); alpha=1-k; }
    else { alpha=0; }
    if(SEASON.snow) for(const [fx,fy] of prints) rect(ctx,fx,fy,2,1,LP.snow0);
    if(alpha>0&&feet<PH+21){ ctx.globalAlpha=alpha; ctx.drawImage(personSprite('player',frame,look),px,feet-PERSON_H);
      if(coatSnow>0&&SEASON.snow){ rect(ctx,px+4,feet-PERSON_H+3,4,1,LP.snow2); if(coatSnow>2) rect(ctx,px+1,feet-PERSON_H+10,2,1,LP.snow2); if(coatSnow>4) rect(ctx,px+9,feet-PERSON_H+10,2,1,LP.snow2); }
      ctx.globalAlpha=1; }
    for(const b of bits){ b.vy+=60*dt; b.x+=b.vx*dt; b.y+=b.vy*dt; } bits=bits.filter(b=>b.y<feet+1); for(const b of bits) rect(ctx,b.x,b.y,1,1,LP.snow2);
    if(SEASON.snow){ snowBack.draw(ctx,dt,LP.snow1); snowFront.draw(ctx,dt,LP.snow2); } else snowFront.draw(ctx,dt,SEASON.fall);
    if(t>5.0){ ctx.globalAlpha=clamp((t-5)/1,0,.1); rect(ctx,0,0,PW,PH,LP.emb1); ctx.globalAlpha=1; }
  });
  loop.start();
  return {stop(){loop.stop();}, skip:finish, canvas:c};
}
