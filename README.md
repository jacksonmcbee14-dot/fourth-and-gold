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
| `css/01…08-*.css` | Styles, split by area. They load in number order; `08-finish.css` must stay last. |
| `js/core/state.js` | Your bankroll, bets and settings, and saving them. |
| `js/core/helpers.js` | Money and odds formatting, toast messages, secure random numbers. |
| `js/football/data.js` | The football snapshot: teams, records, schedules, rankings, games, futures. |
| `js/football/models.js` | The season simulations. |
| `js/football/home.js`, `predict.js`, `ranks.js` | The football tabs. |
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
