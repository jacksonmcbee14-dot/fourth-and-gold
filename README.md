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
| `js/lodge/` · `css/10-lodge.css` | The 8-bit lodge layer: `pixel.js` (pixel engine, palette, character sprites), `welcome.js` (the welcome scene), `hub.js` (the great room, its spots and walking), `bar.js` (the bar and drinks), `powers.js` (drink powers: cocoa 1.5× winnings, cider half-price shop, old fashioned 2× bets / 2.5× wins, eggnog Santa suit), `xp.js` (XP, levels, titles), `shop.js` (the merchant, outfits and decor art), `catalog.js` (the big catalog: ~120 more things to wear and carry, ~100 more room pieces, and the shop's filters), `myroom.js` (My Room, decorating, trophies), `lodge.js` (switching between lodge and app). |
| `js/season.js` | Seasons: holiday (Nov 15–Dec 31, the Christmas look), winter, spring, summer and fall. The lodge decorations, the welcome scene and the golf course follow it. Preview one with `?season=spring` on the address. |
| `js/league/` · `css/12-league.css` | The League mode: `social.js` (talking to the server, the rewards inbox, invite links, the daily bonus, auto-posting big wins), `view.js` (the League, Challenge, Golf and Invite tabs), `duel.js` (casino duels for challenges: roulette, blackjack, video poker, slots and craps — 1,000 chips, most chips wins), `prizes.js` (gear you can only win in a league). |
| `js/golf/golf.js` · `css/11-golf.css` | 8-bit golf: three 9-hole courses (the seasonal home course, Ridgeback Pines, Twin Lakes), played as 3, 6 or 9 holes — clubs, timing meter, wind, water, bunkers, trees. |
| `js/custom-bets.js` | The Custom amount pop-up: casino chips, video poker coins, slot bet, duel chips and challenge stakes. |
| `js/lodge/vibes.js` | Arrange for me: pick a vibe (golf, casino night, sports den, cozy cabin, game room, high roller, holiday) and My Room is laid out from designed spots with matching pairs; plus 8 golf decor pieces. |
| `js/lodge/heist.js` | Visit and rob friends' lodges: a look at their room, the safe-cracking game (harder the higher their VIP table is above yours), defence items (guard dog, bouncer, cameras, laser grid, steel safe, vault door), 10 tries a day, characters on the leaderboard. Visitors can look around every room except the vault room. Out of tries? Buy a lockpick (1% of net worth, doubling each time, up to 10 a day; `update-19-lockpicks.sql`). Needs `supabase/update-7-heists.sql` and `update-16-visit-rooms.sql`. |
| `js/golf/skill.js` · `js/golf/range.js` | Golf levels 1–50: every shot, hole, round and range ball earns golf XP (2× on your own green). Higher levels widen the sweet spot, slow the meter, shrink hooks and slices, cut wind and green break, and raise birdie/eagle/ace prizes. The driving range has three mini games (long drive, target practice, perfect streak); a new personal best pays a prize. |
| `js/lodge/home.js` | Homes that grow with your level: attic loft (1) → cabin suite (10) → chalet (20, adds a bedroom) → lodge house (35, vault room) → mansion (50, game room) → estate (100, your own putting green to play on). Each home has more windows; robbers come in through the front door (dog, bouncer) or a window, and each security camera covers one window. Cash in the vault room can't be robbed. Needs `supabase/update-14-homes.sql`. |
| `js/casino/pinball.js` | Pinball (casino tab): one button — hold to launch when a ball is in the lane, otherwise it flips both flippers (tapping the table does the same). Physics table with flippers, bumpers, slingshots, drop targets, top lanes, orbit combos, a lock saucer for multiball and jackpots, skill shots, ball save and bonus count-ups. Your completed sets are glowing targets (all lit = COLLECTION). Score pays on a ladder (10K ×0.5 … 800K ×30). 100 machines: 80 to buy (cheap → very expensive, 12 art styles), 12 unlocked by VIP table tier, 8 by prestige stars. Each has its own bonuses (bumper layout, 2-lock multiball, frenzy, named center-gate jackpot, 2× sets, extra ball, starting multiplier, longer ball save, bigger bumpers). The static playfield is cached per machine so play stays at 60fps. |
| `js/casino/themes.js` · `css/15-themes.css` | 101 table themes and 101 card decks, each hand-named to match its colours. Every theme has its own particles, win animation (fountain, rain, shockwave, drift, spiral, zigzag, pulse, comets) and a bonus: +1–4% extra on net winnings in one game (VIP and star themes: every game). Themes dress every game including slots (cabinet, reels, lights, falling particles, the machine name and its own 7 reel symbols per theme). Sets unlock their theme and deck; 70 of each are for sale; 12 unlock by VIP table (Silver Suite … Galaxy Suite) and 8 by prestige stars. Switching a theme or deck restyles in place, so spins and hands are never interrupted. |
| `js/football/ranksfx.js` | Smooth Ranks: the leaderboard loads into its own slot (shimmer → podium + rows crossfade) without redrawing the screen, net worth counts up, the bar fills, Show all opens in place; the leaderboard no longer retries in a redraw loop when offline. |
| `css/14-modern-lodge.css` | Modern finish for the lodge and every 8-bit screen (shop, Home, decorate tray, Kennel Club, golf, range, park, stables, butler panels): glass panels, pill buttons, rounded gradient tiles, a clean font for text and the pixel font for headings. The pixel art and colours are unchanged. |
| `js/football/fresh.js` · `css/13-casino-fresh.css` | Tap-first Season (team hero ring, score tiles, seed bars / CFP grid), Predict (big % with the simulator and W/L pickers), Ranks (status card, colour-coded ratings) and League (podium, prize card, chip feed); footnotes hidden. The casino refresh restyles felt, buttons, roulette board, craps zones and paytable without touching game logic. |
| `js/football/gameday.js` | Game day (simple mode): Today is your team's matchup with a win-chance ring, the boost, live games, a tap-the-winner list and bet tickets; Bets is every game as two big team-coloured buttons. Tapping a team opens the quick-bet sheet (casino chips, big WIN number, LOCK IT IN with a stamp). Pro mode keeps the full sportsbook. |
| `js/lodge/homepanel.js` | The Home panel: tabs (Butlers, Rooms, Security, Vault, Score) with an animated butler, room thumbnails, window icons, a vault meter and a counting score — big tiles, short labels. |
| `js/casino/tourney.js` | Weekly slots tournament: buy in from the slots screen; score = your 10 best slot wins in multiples of your bet; top 3 split the pot 50/30/20 (+$1M house bonus). Needs `supabase/update-26-tournaments.sql`. |
| `js/lodge/besthome.js` | House score (furniture by value × upgrade tier, finished sets, limited and stolen pieces, home size, decorated rooms) and the weekly Best Home vote: visitors give one ❤️ a week, most hearts wins a prize and trophy. Needs `supabase/update-24-best-home.sql`. |
| `js/lodge/steal.js` | Steal furniture: after a successful robbery, take one piece of their decor (any room but the vault). It leaves their home and joins yours with a red stolen tag; they can buy it back or steal it back. Needs `supabase/update-23-steal-furniture.sql`. |
| `js/lodge/rares.js` | Monthly rares (three pieces a month, 10 of each ever, numbered, retired at month end) and the player market (list anything you own; other players buy it, money and serial move over). Shop tabs Rares and Market. Needs `supabase/update-25-rares-market.sql`. |
| `js/lodge/upgrades.js` | Upgrades: anything you own goes Gold → Diamond → Neon in Silas's shop (3×, 10×, 30× its price; 60% counts toward net worth). Upgraded clothes give your character gold sparkles, diamond twinkles or a rainbow neon outline; upgraded decor glints or glows in your rooms. Visitors see it (`update-22-tiers.sql`). |
| `js/lodge/petgames.js` | Every pet action is a mini game: catch the falling food, scrub the mud off with a brush, tug of war, Simon-says obedience that grows longer/faster with new tricks as your pet levels up, faster agility/tricks meters, a runway show with judges' cards, and a glow-up for upgrades. |
| `js/lodge/walks.js` | Walkies: walk your pet in the park out back with other players' pets; 60 seconds to collect bones and chase squirrels; daily best-walk board (`update-27-walks.sql`). |
| `js/lodge/horses.js` | Horse racing: buy a horse (Pony → Pegasus), train speed/stamina/acceleration, race through 7 tiers (3 wins to move up), tap STRIDE in rhythm in the race, four tracks, free practice. |
| `js/lodge/card.js` | Character card: a big view of someone's outfit (every piece named) and pet — tap the room picture on a visit, or your level badge in the lodge. Watches are a 2-pixel band, and gear glints every few seconds. |
| `js/lodge/pets.js` | Pets and the Kennel Club (Pets button in the lodge): adopt a puppy or kitty, keep it fed, clean and happy (grocery, groomer, play — costs scale with your cash), train Agility/Tricks/Obedience with mini games, enter the daily dog or cat show against other players' pets and lodge regulars, upgrade to Neon and Mega Neon. Your pet follows you around and visitors see it. Needs `supabase/update-21-pets.sql`. |
| `js/league/send.js` | Send money: visit a player and tap Send money. The server checks you have it, takes it off your saved bankroll and delivers it to their inbox as a gift (doesn't count toward league scores). Needs `supabase/update-20-send-money.sql`. |
| `js/lodge/hottub.js` | Hot tubs for everyone: visit a friend who owns one and get in for +10% XP for 30 minutes (once a day per tub); two friends in the same tub within an hour is a party (+20%, three or more +30%); the owner gets 50 XP per guest. Needs `supabase/update-18-hot-tubs.sql`. |
| `js/lodge/palace.js` | The Palace: an owner-only home above the Estate, given through the inbox (kind `palace`). Eight rooms (throne room, royal suite, ballroom, grand pool, supercar garage, treasury, game room, putting green), animated art, 12 windows with 12 cameras, both butlers in diamond tuxedos. |
| `js/lodge/butler.js` | Butlers (Home panel): the first comes with the Mansion, the second at level 75. Each does one job a day: play slots, blackjack, roulette, golf or a sports parlay with house money (5% of net worth, at least $1M; wins ×2 or more, losses on the house), stand guard for 24h, rob someone, collect the daily bonus ×2, buy from the limited shelf at 25% off, or mix a free old fashioned. At full heat (+50%), call a butler in for ×2 wins for 2 minutes. Suits improve his multiplier at levels 60/75/90/100, and your daily streak never breaks while you have one. Needs `supabase/update-15-butlers.sql`. |
| `js/lodge/buyall.js` | Buy all unlocked items in the shop's current tab and filter. |
| `js/share.js` | Share cards (1080×1920 pictures for Instagram stories), the phone share sheet, and the pop-up layer. |
| `js/economy.js` | The economy: store prices follow your cash (bankroll + safe − debt, not what you own, so buying never pushes other prices up) and each prestige star takes 5% off (max 40%); the best horse, machine, theme and deck are tuned to stay buyable under the $1T vault; every table has a maximum bet (100× its minimum), a 🔥 heat meter adds up to +50% on winning streaks, cash tops out at a $1 trillion vault, then Prestige (⭐: back to $1M keeping your stuff, +20% XP per star, stars rank first); the old fashioned is once a day with its bonus capped at 3× its price; endless VIP tables you choose (Lodge $1K, Silver $100K, Gold $10M, Diamond $1B, Emerald $100B, Ruby $10T … each 100× the last, needing 20× its minimum in net worth; you always see the next 5); higher tables give more XP, perks and a badge, never bigger payouts; Diamond-only shop items; shop prices × (net worth ÷ $1M)^0.8; drinks a share of net worth. |
| `js/update.js` | Auto-update: when the app opens or comes back on screen it checks for a newer published version and reloads into it. |
| `js/perks.js` · `js/lodge/extras-items.js` | Reasons to spend: your stuff counts toward net worth at 60% of what you paid (and Silas buys it back for that), perk items, collections (finish a set for +1,000 XP and +5% XP for good), and a weekly limited shelf. |
| `js/league/sports.js` | Reasons to bet on sports: weekly league pick'em, Tail a friend's bet from the feed, a daily odds boost, win streaks that unlock the Sharp title and sportsbook-only gear, and game-day wins counting double in leagues. Needs `supabase/update-8-sports.sql`. |
| `js/fire.js` | 🔥 On a roll: animated flames around the table or slot machine, and flickering fire on your chips, cards and bets, growing with your heat. |
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

These need the database updates `supabase/update-4-leagues.sql`, `supabase/update-5-big-stakes.sql` (custom challenge stakes up to $1 trillion) and `supabase/update-6-vip.sql` (💎 for Diamond players), run in that order: open Supabase → SQL Editor → New query, paste the whole file, click Run. Until then the League tab says it needs the update; everything else works as before.

- **Leagues** race on *weekly winnings* (Monday to Sunday night, Eastern time). Daily top-ups, the daily bonus, invite rewards, shop spending and resets don't count. The first time anyone opens a league in a new week, last week's #1 is crowned and sent the league's prize.
- **Invites**: `?invite=CODE&league=CODE` links. When a new player makes a profile with your code (within 2 days), your debt is wiped and you get $1,000,000 (up to 25 friends).
- **Challenges**: golf and casino duels — roulette, blackjack, video poker, slots, craps (the challenger plays first and sets the score) and pick'ems on real games. Stakes are held when you send or accept and paid out through the inbox.
- Money is still play money kept by each phone, so a determined cheater could edit their own numbers. Moving the bankroll onto the server is the fix before real prizes or ads.

## Publishing updates

Before each publish, run `python3 tools/stamp-version.py`. It gives the app's files a new version tag so phones load the new files instead of old saved copies. Phones that saved an older copy update themselves: `js/update.js` notices the new version tag the next time the app is opened or brought back on screen, and reloads.
