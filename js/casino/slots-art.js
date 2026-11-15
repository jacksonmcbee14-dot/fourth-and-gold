// Slot symbol artwork (SVG), added to the page once
/* ---------- Symbol art (SVG, defined once and reused) ---------- */
function star(cx,cy,R,r){let p='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:R;p+=`${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)} `;}return p;}
function giftArt(lidCls=''){
  return `<g><rect x="16" y="44" width="68" height="44" rx="5" fill="url(#gRed)" stroke="#4a050b" stroke-width="2"/>
  <rect x="44" y="44" width="12" height="44" fill="url(#gGold)"/><rect x="16" y="60" width="68" height="9" fill="url(#gGold)" opacity=".9"/>
  <path d="M18 50 L82 50" stroke="#ffffff" stroke-opacity=".18" stroke-width="3"/></g>
  <g class="${lidCls}"><rect x="11" y="32" width="78" height="15" rx="4" fill="url(#gRed2)" stroke="#4a050b" stroke-width="2"/>
  <rect x="44" y="32" width="12" height="15" fill="url(#gGold)"/>
  <path d="M50 32 C36 14 18 20 30 30 C36 34 46 33 50 32Z" fill="url(#gGold)" stroke="#5e4520" stroke-width="1.5"/>
  <path d="M50 32 C64 14 82 20 70 30 C64 34 54 33 50 32Z" fill="url(#gGold)" stroke="#5e4520" stroke-width="1.5"/>
  <circle cx="50" cy="31" r="5" fill="url(#gGold)" stroke="#5e4520" stroke-width="1.5"/></g>`;
}
function letterSym(id,ch,grad){
  return `<symbol id="s-${id}" viewBox="0 0 100 100"><text x="50" y="80" text-anchor="middle" font-family="Instrument Serif,Georgia,serif" font-size="86" fill="url(#${grad})" stroke="#000" stroke-opacity=".45" stroke-width="2.5" paint-order="stroke">${ch}</text>
  <path d="M30 20 Q40 12 52 17 Q62 10 72 19 Q66 23 56 21 Q46 25 38 22 Q33 24 30 20Z" fill="#f3ead8" opacity=".92"/>
  <polygon points="${star(80,30,5,2)}" fill="#f3ead8" opacity=".85"/></symbol>`;
}
const SYMDEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ebcb"/><stop offset=".45" stop-color="#c8a45c"/><stop offset="1" stop-color="#6b5228"/></linearGradient>
<linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0606b"/><stop offset=".5" stop-color="#8e2533"/><stop offset="1" stop-color="#4a0f17"/></linearGradient>
<linearGradient id="gRed2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d97a84"/><stop offset="1" stop-color="#7d1f2a"/></linearGradient>
<linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb894"/><stop offset=".5" stop-color="#2a6a4a"/><stop offset="1" stop-color="#0f2a1e"/></linearGradient>
<linearGradient id="gIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef2ee"/><stop offset=".5" stop-color="#8fb1c4"/><stop offset="1" stop-color="#3a5a74"/></linearGradient>
<linearGradient id="gPlum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1c6ff"/><stop offset=".5" stop-color="#a24ad6"/><stop offset="1" stop-color="#4b1670"/></linearGradient>
<radialGradient id="gOrn" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#d27c86"/><stop offset=".35" stop-color="#8e2533"/><stop offset="1" stop-color="#3a0d13"/></radialGradient>
<radialGradient id="gGlowG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f0c27a" stop-opacity=".45"/><stop offset="1" stop-color="#f0c27a" stop-opacity="0"/></radialGradient>
<pattern id="pCandy" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="12" height="12" fill="#f6ebcb"/><rect width="6" height="12" fill="#9a2a35"/></pattern>
<symbol id="s-WILD" viewBox="0 0 100 100"><circle cx="50" cy="46" r="44" fill="url(#gGlowG)"/>
 <path d="M50 12 L67 37 H58 L73 55 H63 L80 73 H20 L37 55 H27 L42 37 H33Z" fill="url(#gGreen)" stroke="#05301a" stroke-width="2.2" stroke-linejoin="round"/>
 <rect x="45" y="72" width="10" height="7" fill="#6b3a1f"/>
 <path d="M38 41 Q50 48 62 40 M31 60 Q50 67 69 58" stroke="url(#gGold)" stroke-width="2.6" fill="none"/>
 <circle cx="44" cy="51" r="3.6" fill="url(#gOrn)"/><circle cx="58" cy="49" r="3.4" fill="url(#gGold)"/><circle cx="38" cy="67" r="3.4" fill="url(#gGold)"/><circle cx="62" cy="67" r="3.6" fill="url(#gOrn)"/><circle cx="51" cy="31" r="3" fill="url(#gOrn)"/>
 <polygon points="${star(50,12,10,4.2)}" fill="url(#gGold)" stroke="#5e4520" stroke-width="1.2"/>
 <rect x="15" y="78" width="70" height="17" rx="8.5" fill="url(#gRed)" stroke="url(#gGold)" stroke-width="2.2"/>
 <text x="50" y="91" text-anchor="middle" font-family="Inter Tight,Arial,sans-serif" font-weight="700" font-size="12.5" fill="#f6ebcb" letter-spacing="3">WILD</text></symbol>
<symbol id="s-BONUS" viewBox="0 0 100 100"><circle cx="50" cy="55" r="46" fill="url(#gGlowG)"/>${giftArt()}
 <rect x="14" y="80" width="72" height="16" rx="8" fill="url(#gGreen)" stroke="url(#gGold)" stroke-width="2"/>
 <text x="50" y="92" text-anchor="middle" font-family="Inter Tight,Arial,sans-serif" font-weight="700" font-size="11.5" fill="#f6ebcb" letter-spacing="2.5">BONUS</text></symbol>
<symbol id="s-SEVEN" viewBox="0 0 100 100"><text x="50" y="88" text-anchor="middle" font-family="Inter Tight,Arial,sans-serif" font-weight="700" font-size="100" fill="url(#pCandy)" stroke="url(#gGold)" stroke-width="5" paint-order="stroke" stroke-linejoin="round">7</text>
 <path d="M70 14 q8 -6 14 2 q-8 2 -14 -2z M70 14 q-2 -10 8 -12 q0 8 -8 12z" fill="url(#gGreen)"/><circle cx="70" cy="16" r="3" fill="#9a2a35"/><circle cx="66" cy="13" r="2.6" fill="#9a2a35"/></symbol>
<symbol id="s-BELL" viewBox="0 0 100 100"><path d="M50 17 C33 17 28 32 28 47 C28 61 23 67 17 73 H83 C77 67 72 61 72 47 C72 32 67 17 50 17Z" fill="url(#gGold)" stroke="#5e4520" stroke-width="2"/>
 <rect x="16" y="71" width="68" height="7" rx="3.5" fill="url(#gGold)" stroke="#5e4520" stroke-width="1.6"/><circle cx="50" cy="83" r="6.5" fill="url(#gGold)" stroke="#5e4520" stroke-width="1.6"/>
 <path d="M36 30 Q40 22 48 21" stroke="#fffaf0" stroke-opacity=".6" stroke-width="3.2" fill="none" stroke-linecap="round"/>
 <path d="M50 16 L36 7 L38 20Z M50 16 L64 7 L62 20Z" fill="url(#gRed)" stroke="#4a050b" stroke-width="1.2"/><circle cx="50" cy="15" r="4" fill="url(#gRed)"/></symbol>
<symbol id="s-ORN" viewBox="0 0 100 100"><path d="M44 14 Q50 4 56 14" stroke="url(#gGold)" stroke-width="3" fill="none"/><rect x="40" y="14" width="20" height="11" rx="2" fill="url(#gGold)" stroke="#5e4520" stroke-width="1.4"/>
 <circle cx="50" cy="58" r="34" fill="url(#gOrn)" stroke="#4a040b" stroke-width="1.5"/>
 <path d="M17 52 Q50 64 83 52 M18 66 Q50 78 82 66" stroke="url(#gGold)" stroke-width="3.2" fill="none"/>
 <polygon points="${star(50,59,5,2)}" fill="#f6ebcb"/><polygon points="${star(34,60,3.5,1.4)}" fill="#f6ebcb"/><polygon points="${star(66,60,3.5,1.4)}" fill="#f6ebcb"/>
 <ellipse cx="37" cy="40" rx="9" ry="5.5" transform="rotate(-30 37 40)" fill="#fff4e4" opacity=".5"/></symbol>
<symbol id="s-STOCK" viewBox="0 0 100 100"><path d="M33 26 H66 V58 C66 72 58 82 44 84 L28 86 C16 87 12 72 22 66 L33 58Z" fill="url(#gRed)" stroke="#4a050b" stroke-width="2" stroke-linejoin="round"/>
 <path d="M17 70 C14 80 22 87 30 85 C27 80 24 74 17 70Z" fill="#f4f1ea"/><path d="M50 62 H66 M47 69 H64" stroke="url(#gGold)" stroke-width="3"/>
 <rect x="29" y="13" width="42" height="16" rx="7" fill="#fbf8f1" stroke="#d6d0c2" stroke-width="1.5"/><circle cx="35" cy="17" r="2" fill="#e6e0d2"/><circle cx="48" cy="24" r="2" fill="#e6e0d2"/><circle cx="62" cy="18" r="2" fill="#e6e0d2"/>
 <polygon points="${star(48,46,6,2.4)}" fill="url(#gGold)"/></symbol>
<symbol id="s-CANE" viewBox="0 0 100 100"><path d="M60 90 V38 C60 16 32 16 32 36" stroke="#3a0d13" stroke-width="17" fill="none" stroke-linecap="round"/>
 <path d="M60 90 V38 C60 16 32 16 32 36" stroke="#f6ebcb" stroke-width="13" fill="none" stroke-linecap="round"/>
 <path d="M60 90 V38 C60 16 32 16 32 36" stroke="#9a2a35" stroke-width="13" fill="none" stroke-dasharray="7 8"/>
 <path d="M60 40 L46 46 L46 34Z M60 40 L74 46 L74 34Z" fill="url(#gGreen)"/><circle cx="60" cy="40" r="4.5" fill="url(#gGold)"/></symbol>
${letterSym('A','A','gGold')}${letterSym('K','K','gRed')}${letterSym('Q','Q','gGreen')}${letterSym('J','J','gIce')}
</defs></svg>`;
document.body.insertAdjacentHTML('afterbegin',SYMDEFS);

