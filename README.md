# Fourth & Gold

A play-money casino and football sportsbook. Plain HTML, CSS and JavaScript, with no build step and no framework.

## Run it

Double-click **Start Fourth and Gold.command** in Finder, or in Terminal (from this folder):

```bash
python3 tools/serve.py
```

Your browser opens the app. The window shows an address like `http://192.168.1.23:8000`. Type that into your phone's browser while the phone is on the same Wi-Fi. Press Control-C in the window to stop.

The first time, macOS may ask whether Python can accept incoming network connections. Click **Allow**, or your phone can't connect.

## Put it on your phone's home screen

- **iPhone (Safari):** open the address, tap the Share button, then **Add to Home Screen**.
- **Android (Chrome):** open the address, tap ⋮, then **Add to Home screen**. A full install, with no browser bars, needs the app served over `https://` (see "Hosting" below).

## Where things are

| Path | What it is |
|---|---|
| `index.html` | The page skeleton. It loads the files below **in order**, and the order matters. |
| `css/01…09-*.css` | Styles, split by area. They load in number order. `09-calm.css` is the calmer look for football and Ranks (3 font sizes, fewer borders). |
| `js/core/state.js` | Your bankroll, bets and settings, and saving them. |
| `js/core/helpers.js` | Money and odds formatting, toast messages, secure random numbers. |
| `js/football/data.js` | The football snapshot: teams, records, schedules, rankings, games, futures. |
| `js/football/models.js` | The season simulations. |
| `js/football/today.js` | The Today tab: your next games, a suggested bet, bankroll, open bets. |
| `js/football/home.js`, `predict.js`, `ranks.js` | The Season, Predict and Ranks tabs (Ranks also appears in the Casino). |
| `js/football/myteam.js` | Your chosen NFL and college teams and their schedules. |
| `js/ui.js` | More sections, tappable terms, "Why it matters", shorter score lists, Simple/Full betting. |
| `js/profile.js`, `js/config.js` | Profiles (name + PIN), saving to your profile, the leaderboard; Supabase address and public key. |
| `js/lodge/` · `css/10-lodge.css` | The 8-bit lodge layer: `pixel.js` (pixel engine, palette, character sprites), `welcome.js` (the welcome scene), `hub.js` (the great room, its spots and walking), `bar.js` (the bar and drinks), `powers.js` (drink powers: cocoa 1.5× winnings, cider half-price shop, old fashioned 2× bets / 5× wins, eggnog Santa suit), `xp.js` (XP, levels, titles), `shop.js` (the merchant, outfits and decor art), `catalog.js` (the big catalog: ~120 more things to wear and carry, ~100 more room pieces, and the shop's filters), `myroom.js` (My Room, decorating, trophies), `lodge.js` (switching between lodge and app). |
| `js/season.js` | Seasons: holiday (Nov 15–Dec 31, the Christmas look), winter, spring, summer and fall. The lodge decorations, the welcome scene and the golf course follow it. Preview one with `?season=spring` on the address. |
| `js/league/` · `css/12-league.css` | The League mode: `social.js` (talking to the server, the rewards inbox, invite links, the daily bonus, auto-posting big wins), `view.js` (the League, Challenge, Golf and Invite tabs), `duel.js` (casino duels for challenges: roulette, blackjack, video poker, slots and craps — 1,000 chips, most chips wins), `prizes.js` (gear you can only win in a league). |
| `js/golf/golf.js` · `css/11-golf.css` | 8-bit golf: three 9-hole courses (the seasonal home course, Ridgeback Pines, Twin Lakes), played as 3, 6 or 9 holes — clubs, timing meter, wind, water, bunkers, trees. |
| `js/custom-bets.js` | The Custom amount pop-up: casino chips, video poker coins, slot bet, duel chips and challenge stakes. |
| `js/lodge/vibes.js` | Arrange for me: pick a vibe (golf, casino night, sports den, cozy cabin, game room, high roller, holiday) and My Room is laid out from designed spots with matching pairs; plus 8 golf decor pieces. |
| `js/lodge/buyall.js` | Buy all unlocked items in the shop's current tab and filter. |
| `js/share.js` | Share cards (1080×1920 pictures for Instagram stories), the phone share sheet, and the pop-up layer. |
| `js/economy.js` | The economy scales with net worth: table minimum = net worth² ÷ $20B, capped at 10% of net worth; shop prices × (net worth ÷ $1M); drinks a share of net worth. Wins are never capped. |
| `js/update.js` | Auto-update: when the app opens or comes back on screen it checks for a newer published version and reloads into it. |
| `js/money.js` | Daily top-up to $1M, borrowing (any amount up to $250K a loan), and what a reset wipes. |
| `supabase/` | Database setup script, plus numbered update scripts to run in order. |
| `js/football/sportsbook.js` | Prices, bet slip and settling bets. |
| `js/casino/slots*.js` | Jingle Jackpot: art, maths and the machine itself. |
| `js/casino/roulette.js`, `blackjack.js`, `poker.js`, `craps.js` | One file per table game. |
| `js/casino/common.js`, `sound.js`, `effects.js`, `help.js` | Shared casino pieces, sounds, effects, How-to-play pages. |
| `js/app.js` | Tab bar, drawing the screen, and what every button does. |
| `js/live.js` | Live scores, records and new games from ESPN's free public scoreboard (unofficial, so it could change). |
| `manifest.webmanifest`, `icons/` | Home-screen install: name, icon, full-screen. |
| `original/fourth-and-gold.html` | The untouched single-file original, for reference. |

## Saving

Everything is saved in the browser's local storage, separately on each device and each browser. On iPhone, the home-screen app keeps its own save, apart from Safari's.

## Leagues, invites and challenges

These need the database updates `supabase/update-4-leagues.sql` and `supabase/update-5-big-stakes.sql` (custom challenge stakes up to $1 trillion), run in that order: open Supabase → SQL Editor → New query, paste the whole file, click Run. Until then the League tab says it needs the update; everything else works as before.

- **Leagues** race on *weekly winnings* (Monday to Sunday night, Eastern time). Daily top-ups, the daily bonus, invite rewards, shop spending and resets don't count. The first time anyone opens a league in a new week, last week's #1 is crowned and sent the league's prize.
- **Invites**: `?invite=CODE&league=CODE` links. When a new player makes a profile with your code (within 2 days), your debt is wiped and you get $1,000,000 (up to 25 friends).
- **Challenges**: golf and casino duels — roulette, blackjack, video poker, slots, craps (the challenger plays first and sets the score) and pick'ems on real games. Stakes are held when you send or accept and paid out through the inbox.
- Money is still play money kept by each phone, so a determined cheater could edit their own numbers. Moving the bankroll onto the server is the fix before real prizes or ads.

## Publishing updates

Before each publish, run `python3 tools/stamp-version.py`. It gives the app's files a new version tag so phones load the new files instead of old saved copies. Phones that saved an older copy update themselves: `js/update.js` notices the new version tag the next time the app is opened or brought back on screen, and reloads.
