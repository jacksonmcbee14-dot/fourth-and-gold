// How-to-play pages and the Play / How to play switch
/* ---------- How to play ---------- */
function slotPaytable(){
  const u=S.slotBet*PAY_UNIT;
  return `<div class="ptab">${['SEVEN','BELL','ORN','STOCK','CANE','A','K','Q','J'].map(s=>`<div class="pt"><svg viewBox="0 0 100 100"><use href="#s-${s}"/></svg><div><b>${SYMNAME[s]}</b><span>3× ${cmp$(PAYS[s][3]*u)} · 4× ${cmp$(PAYS[s][4]*u)} · 5× ${cmp$(PAYS[s][5]*u)} <small style="color:var(--muted)">per way</small></span></div></div>`).join('')}
  <div class="pt"><svg viewBox="0 0 100 100"><use href="#s-WILD"/></svg><div><b>Wild Tree · reels 2–4</b><span>Substitutes for all symbols except the gift box</span></div></div>
  <div class="pt"><svg viewBox="0 0 100 100"><use href="#s-BONUS"/></svg><div><b>Gift Box · reels 1–4</b><span>3 = 8 free games · 4 = 10 · wins pay ×2</span></div></div>
  ${JPT.map(t=>`<div class="pt"><div class="badge ${t.k}" style="justify-self:center">${t.n}</div><div><b>${t.n} Jackpot</b><span>${cmp$(jpVal(t))} at your bet</span></div></div>`).join('')}</div>`;
}
const TIPS={
  pinball:()=>`<div class="tchips"><span>👆 Tap left / right to flip</span><span>🚀 Hold LAUNCH, let go</span><span>🟢 Green = skill shot</span></div>
    <div class="tchips"><span>🔒 Lock balls → MULTIBALL</span><span>💥 Saucer in multiball = JACKPOT</span><span>🟡 Top lanes → bonus ×</span><span>🟦 Targets → ×</span><span>🧩 Your sets = targets</span></div>
    <div class="tchips">${PB_LADDER.map(([s,m])=>`<span>${Math.round(s/1000)}K → ×${m}</span>`).join('')}</div>`,
  slots:()=>`<div class="tips">
    <div class="tip"><h4>How it works</h4><p>Choose your bet with − and +, then tap <b>Spin</b>. This is a <b>243 ways</b> machine (like Dancing Drums and 88 Fortunes): there are no paylines. Land a symbol on reels 1, 2 and 3 — any row — and you win. More matching symbols on a reel multiply the ways.</p></div>
    <div class="tip"><h4>The Wild tree</h4><p>Appears on the middle three reels and stands in for every symbol except the gift box.</p></div>
    <div class="tip"><h4>Golden Star jackpots</h4><p>Any paid spin can randomly light the <b>Golden Star</b> (about 1 in 850). You'll pick ornaments off the tree until three match — that jackpot is yours, and you're guaranteed one. The ladder above the reels shows each jackpot at your current bet. At max bet (${cmp$(MAXBET)}) the Grand also includes the progressive pool.</p></div>
    <div class="tip"><h4>Gift boxes = free games</h4><p>Three gift boxes on reels 1–4 start 8 free games (2× bet); four start 10 (5× bet). Every free-game win pays <b>double</b>, and more boxes add games. Two boxes on the board make the next reel glow and slow down.</p></div>
    <div class="tip"><h4>Controls</h4><p>Tap Spin again while reels move to slam them. <b>Turbo</b> spins faster. <b>Auto</b> plays 25 spins (it stops for jackpots).</p></div>
    <div class="tip gold"><h4>Is there a strategy?</h4><p>No — honestly. Each reel's stop and the Golden Star roll come from a secure random generator before any animation plays; even the pick bonus is decided before you tap. Bet size scales payouts and jackpots but never changes your odds. Long-run return is about 96¢ per $1, in line with real Vegas machines. Set a budget and enjoy the show.</p></div>
    <h4 class="pth">Paytable at your current bet</h4>${slotPaytable()}</div>`,
  roulette:()=>`<div class="tips">
    <div class="tip"><h4>The goal</h4><p>Guess where the ball lands. Tap a chip size, tap the table to place chips, then <b>Spin</b>. Numbers 1–36 are red or black; 0 is green.</p></div>
    <div class="tip"><h4>Payouts</h4><div class="tt"><span>Single number</span><b>35 to 1</b><span>Dozen or column</span><b>2 to 1</b><span>Red/Black · Odd/Even · 1–18/19–36</span><b>1 to 1</b></div></div>
    <div class="tip"><h4>What the zero does</h4><p>If the ball lands on 0, every outside bet (red, black, odd, dozens…) loses. That single green pocket is the house's entire edge: 2.7% on every bet.</p></div>
    <div class="tip gold"><h4>Is there a strategy?</h4><p>No betting system changes the odds — not doubling after losses (Martingale) or anything else. Every spin is independent and random. The one real tip: single-zero tables like this one (2.7%) beat American double-zero tables (5.26%).</p></div></div>`,
  blackjack:()=>`<div class="tips">
    <div class="tip"><h4>The goal</h4><p>Get closer to 21 than the dealer without going over. Number cards count face value, J/Q/K count 10, Aces count 1 or 11. Two-card 21 is <b>Blackjack</b> and pays 3 to 2.</p></div>
    <div class="tip"><h4>Your moves</h4><div class="tt"><span>Hit</span><b>take a card</b><span>Stand</span><b>keep your total</b><span>Double</span><b>double bet, one card</b><span>Split</span><b>pair → two hands</b></div></div>
    <div class="tip"><h4>Dealer rules</h4><p>The dealer has no choices: hits until 17, stands on all 17s. Six decks, shuffled with a secure random generator.</p></div>
    <div class="tip gold"><h4>Yes — there's a real strategy</h4><p>"Basic strategy" cuts the house edge to about 0.5%. The short version:</p>
      <ul><li>Hard 17+ → stand. 13–16 → stand vs dealer 2–6, hit vs 7–A.</li><li>12 → stand vs 4–6, otherwise hit.</li><li>11 → double. 10 → double vs 2–9. 9 → double vs 3–6.</li><li>Always split Aces and 8s. Never split 10s or 5s.</li><li>Soft 18 (A-7) → stand vs 2, 7, 8; double vs 3–6; hit vs 9–A.</li></ul>
      <p>Stuck? Tap <b>Hint</b> during a hand and it tells you the basic-strategy move.</p></div></div>`,
  poker:()=>`<div class="tips">
    <div class="tip"><h4>How it works</h4><p>Jacks or Better video poker. You're dealt 5 cards. Tap the ones you want to <b>hold</b>, then <b>Draw</b> to replace the rest — one time. Your final hand is paid from the table.</p></div>
    <div class="tip"><h4>Hands, best to worst</h4><div class="tt"><span>Royal flush</span><b>A K Q J 10, same suit</b><span>Straight flush</span><b>5 in a row, same suit</b><span>Four of a kind</span><b>4 matching</b><span>Full house</span><b>3 + 2</b><span>Flush</span><b>5 same suit</b><span>Straight</span><b>5 in a row</b><span>Three of a kind</span><b>3 matching</b><span>Two pair</span><b>2 + 2</b><span>Jacks or better</span><b>a pair of J, Q, K or A</b></div></div>
    <div class="tip gold"><h4>Yes — strategy matters here</h4><p>Played perfectly, this full-pay game returns about 99.5%. Keep the first thing on this list you have:</p>
      <ol><li>Any paying hand of two pair or better (but break a straight or flush for 4 to a Royal)</li><li>4 to a straight flush</li><li>A high pair (J, Q, K, A)</li><li>3 to a Royal</li><li>4 to a flush</li><li>A low pair (2–10)</li><li>4 to an open-ended straight</li><li>2 suited high cards</li><li>Otherwise, any 1–2 high cards — or draw five new cards</li></ol>
      <p>Always bet 5 coins: the Royal jumps from 1,250× to 4,000×.</p></div></div>`,
  craps:()=>`<div class="tips">
    <div class="tip"><h4>The flow</h4><p>The first roll is the <b>come-out</b>. 7 or 11 wins the Pass Line instantly; 2, 3 or 12 ("craps") loses. Any other number becomes the <b>point</b> — the puck flips ON. Now roll that number again before a 7 to win.</p></div>
    <div class="tip"><h4>The bets here</h4><div class="tt"><span>Pass Line</span><b>with the shooter · 1 to 1</b><span>Don't Pass</span><b>against the shooter · 1 to 1</b><span>Field</span><b>one roll · 2× on 2, 3× on 12</b><span>Place 6 / 8</span><b>7 to 6 every time it hits</b></div></div>
    <div class="tip gold"><h4>Best and worst bets</h4><p>Dice can't be beaten, but bets aren't equal. Best: <b>Don't Pass</b> (1.36% edge) and <b>Pass Line</b> (1.41%), then <b>Place 6/8</b> (1.52%). The Field costs you about 2.8%. Both dice are rolled with a secure random generator.</p></div></div>`,
};
function gameHead(key,title){
  const how=S.howto&&S.howto[key];
  return `<div class="ghead"><h2 class="serif">${title}</h2><div class="seg"><button data-a="howto" data-k="${key}" data-v="0" class="${!how?'on':''}">Play</button><button data-a="howto" data-k="${key}" data-v="1" class="${how?'on':''}">How to play</button></div></div>`;
}

