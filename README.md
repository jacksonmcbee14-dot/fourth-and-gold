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

## Publishing updates

Before each publish, run `python3 tools/stamp-version.py`. It gives the app's files a new version tag so phones load the new files instead of old saved copies. GitHub still lets phones keep the page itself for up to 10 minutes, so after publishing, close the home-screen app fully and reopen it.
