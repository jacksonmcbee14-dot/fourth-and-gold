// The big catalog: ~120 more things to wear and carry and ~100 more pieces for My Room, all sold by Silas.
// Wearables use the same paper-doll slots as js/lodge/shop.js (body colours, hat/face grids, watch dot, scarf colour);
// carried items and room decor are little pixel drawings. Static decor is drawn once and reused, so a full room stays smooth.

(()=>{
const R=rect;
// Draw a text grid of pixels: '.' is empty, every other character looks up a colour in pal.
function pg(c,x,y,rows,pal){ rows.forEach((r,yy)=>{ for(let xx=0;xx<r.length;xx++){ const col=pal[r[xx]]; if(col) R(c,x+xx,y+yy,1,1,col); } }); }
const pad=(n,rows)=>Array(n).fill('').concat(rows);

/* =====================================================================
   WEARABLES
   ===================================================================== */
const W=[];
const hat=(id,name,price,lvl,desc,grid,pal)=>W.push({id:'hat_'+id,cat:'clothes',sub:'hat',slot:'hat',name,price,lvl,desc,grid,pal});
const face=(id,name,price,lvl,desc,grid,pal)=>W.push({id:'face_'+id,cat:'clothes',sub:'glasses',slot:'glasses',name,price,lvl,desc,grid,pal});
const coat=(id,name,price,lvl,desc,colors)=>W.push({id:'coat_'+id,cat:'clothes',sub:'body',slot:'body',name,price,lvl,desc,colors});
const scarf=(id,name,price,lvl,desc,col)=>W.push({id:'scarf_'+id,cat:'clothes',sub:'scarf',slot:'scarf',name,price,lvl,desc,colors:{w:col}});
const watch=(id,name,price,lvl,desc,dot)=>W.push({id:'watch_'+id,cat:'clothes',sub:'watch',slot:'watch',name,price,lvl,desc,dot});
const carry=(id,name,price,lvl,desc,grid,pal)=>W.push({id:'acc_'+id,cat:'carry',slot:'acc',name,price,lvl,desc,grid,pal});

// ---- Hats (12×5 grids that sit on the head; a few reach down to the ears) ----
const BEANIE=['......z.....','....xxxx....','...xxxxxx...','...xxxxxx...','...yyyyyy...'];
hat('beanie_pine','Pine beanie',20000,1,'Green as the tree out front.',BEANIE,{x:LP.pine5,y:LP.pine3,z:LP.snow2});
hat('beanie_navy','Navy beanie',20000,1,'Plain, warm, never wrong.',BEANIE,{x:'#2b3a5c',y:'#1a2440',z:LP.snow2});
hat('beanie_gold','Gold beanie',45000,3,'A pom-pom with ambitions.',BEANIE,{x:LP.brass1,y:LP.brass0,z:LP.cran2});
const CAP=['............','............','....xxxx....','...xxzxxx...','...xxxxxxyy.'];
hat('cap_crimson','Crimson ball cap',30000,1,'Game-day classic.',CAP,{x:LP.cran2,y:LP.cran0,z:LP.brass2});
hat('cap_navy','Navy ball cap',30000,1,'Orange button on top. Very official.',CAP,{x:'#1f2d4a',y:'#141d31',z:LP.emb1});
hat('cap_green','Forest ball cap',30000,2,'Sun out of your eyes, heart on your sleeve.',CAP,{x:LP.pine4,y:LP.pine2,z:LP.snow2});
hat('cap_black','Blackout ball cap',35000,2,'Silver logo, no logo. Mysterious.',CAP,{x:'#1c1c22',y:'#0e0e12',z:'#b8c0cc'});
const COWBOY=['............','....xxxx....','...xxxxxx...','x..yyyyyy..x','.xxxxxxxxxx.'];
hat('cowboy_tan','Tan cowboy hat',90000,3,'Yeehaw, but quietly.',COWBOY,{x:'#b8905a',y:LP.wal3});
hat('cowboy_black','Black cowboy hat',140000,5,'The villain always wins at cards.',COWBOY,{x:'#1c1c22',y:LP.brass1});
hat('bowler','Bowler hat',110000,4,'For a gentleman of chance.',['............','....xxxx....','...xxxxxx...','...yyyyyy...','..xxxxxxxx..'],{x:'#1c1c22',y:'#5a0f2a'});
const BERET=['............','............','.....z......','..xxxxxxx...','...xxxxxx...'];
hat('beret_red','Red beret',60000,3,'Très chic.',BERET,{x:LP.cran2,z:LP.cran0});
hat('beret_black','Black beret',60000,3,'Paints a little. Bets a lot.',BERET,{x:'#1c1c22',z:'#0e0e12'});
hat('hardhat','Hard hat',50000,2,'Safety first. Doubling down second.',['............','............','....xxxx....','...xxzxxx...','..xxxxxxxx..'],{x:'#e8b42c',z:'#fff3b0'});
hat('chef','Chef’s toque',75000,3,'Cooking up a heater.',['...wwwwww...','..wwwwwwww..','...wwwwww...','...wwwwww...','...yyyyyy...'],{w:'#f6f3ec',y:'#cfd9e0'});
hat('party','Party hat',25000,1,'It’s always somebody’s birthday.',['......z.....','.....xx.....','.....yy.....','....xxxx....','...yyyyyy...'],{x:'#4a7fd0',y:'#f2b26b',z:LP.snow2});
hat('wizard','Wizard hat',400000,10,'Turns losing streaks into frogs.',['.......x....','......xx....','.....xzx....','....xxxx....','..yyyyyyyy..'],{x:'#3a2a7a',y:'#2a1a5a',z:LP.brass2});
hat('viking','Viking helmet',350000,9,'Raid the jackpot.',['............','....xxxx....','w..xxxxxx..w','ww.xxxxxx.ww','...yyyyyy...'],{x:'#8a929e',y:LP.brass1,w:'#efe6d2'});
hat('tiara','Diamond tiara',900000,14,'For the royalty of the roulette table.',['............','............','.....d......','....ydy.....','...yyyyyy...'],{y:'#dfe4ea',d:'#9fe0ff'});
hat('headphones','Studio headphones',180000,6,'Drowns out the dealer.',['............','....xxxx....','...x....x...','..x......x..','..x......x..','..yy....yy..','..yy....yy..'],{x:'#1c1c22',y:'#c0505a'});
hat('headphones_gold','Gold headphones',600000,12,'Plays only winning songs.',['............','....xxxx....','...x....x...','..x......x..','..x......x..','..yy....yy..','..yy....yy..'],{x:LP.brass0,y:LP.brass1});
hat('earmuffs','Fuzzy earmuffs',35000,2,'Toasty ears, cold blood.',['','','','...xxxxxx...','..x......x..','.yy......yy.','.yy......yy.'],{x:'#9fb0bf',y:'#f0a0b0'});
hat('halo','Halo',777000,13,'Never once cheated. Probably.',['....yyyy....','...y....y...','....yyyy....'],{y:'#fff3b0'});
hat('horns','Devil horns',666000,13,'A little wicked at the craps table.',['............','............','...x....x...','...xx..xx...'],{x:'#d0303a'});
hat('antlers','Reindeer antlers',45000,2,'Rudolph is jealous.',['.x..x..x..x.','.xx.x..x.xx.','..xxx..xxx..','...x....x...'],{x:'#8a5a2a'});
hat('flowers','Flower crown',55000,3,'Spring, in the middle of winter.',['','','','..rgyrgyr...','..g......g..'],{r:'#e05a7a',g:'#4a9a4a',y:'#f2d24b'});
hat('pirate','Pirate tricorn',250000,8,'Arr. Hit me.',['............','............','...xxxxxx...','..xxxzxxxx..','.xxxxxxxxxx.'],{x:'#1c1c22',z:'#f3ead8'});
hat('grad','Graduation cap',150000,5,'Studied the odds. Graduated with honours.',['............','.xxxxxxxxxx.','....xxxx...y','....xxxx...y','...xxxxxx..y'],{x:'#16161c',y:LP.brass1});
const HELMET=['','','....xxxx....','...xxzxxx...','..xxxzxxxx..','..xx.....xx.','..x.......x.','..xyyyyyyx..'];
hat('helmet_crimson','Crimson football helmet',220000,7,'Fourth and gold — go for it.',HELMET,{x:LP.cran2,z:LP.brass2,y:'#cfd9e0'});
hat('helmet_navy','Navy football helmet',220000,7,'Shiny shell, orange stripe.',HELMET,{x:'#1f2d4a',z:LP.emb1,y:'#cfd9e0'});
hat('propeller','Propeller cap',40000,2,'Achieves lift-off on big wins.',['..yy.z.yy...','.....z......','....xrxg....','...xxxxxx...','...xxxxxxyy.'],{x:'#f2d24b',r:LP.cran3,g:'#4a9a4a',y:'#4a7fd0',z:'#1c1c22'});
hat('skihat','Striped ski hat',30000,1,'Fresh off the slopes.',['......z.....','....xyxy....','...yxyxyx...','...xyxyxy...','...wwwwww...'],{x:LP.cran2,y:LP.snow2,w:LP.cran0,z:LP.snow2});
hat('top_white','White top hat',650000,11,'Spotless. Like your record.',['....xxxx....','....xxxx....','....xxxx....','....yyyy....','..xxxxxxxx..'],{x:'#f3ead8',y:'#16161c'});
const BANDANA=['','','','...xxxxxx...','...xzxxzx.xx'];
hat('bandana_red','Red bandana',20000,1,'Rough and ready.',BANDANA,{x:LP.cran2,z:LP.snow2});
hat('bandana_blue','Blue bandana',20000,1,'Cool under pressure.',BANDANA,{x:'#2b6cb0',z:LP.snow2});
hat('elf','Elf hat',40000,2,'Makes toys, takes chips.',['..........z.','.........x..','......xxx...','....xxxx....','...yyyyyy...'],{x:LP.pine5,y:LP.cran2,z:LP.brass2});
hat('bunny','Bunny ears',50000,3,'Hop to it.',['...w....w...','...wp..pw...','...wp..pw...','...w....w...'],{w:'#f3ead8',p:'#f0a0b0'});
hat('crown_silver','Silver crown',2500000,25,'For the prince of the poker room.',['............','............','...y.y.y.y..','...yyyyyy...','...ybyryb...'],{y:'#cfd9e0',b:'#4a7fd0',r:LP.cran3});
hat('crown_emerald','Emerald crown',8000000,40,'The rarest thing in the lodge.',['............','...g.....g..','...y.y.y.y..','...yyyyyy...','...ygyyyg...'],{y:LP.brass1,g:'#3ad08a'});

// ---- Face: shades, specs, masks, beards (sit on rows 5–9 of the face) ----
const SHADES=pad(6,['...dddddd...']);
face('shades_red','Red shades',60000,2,'Lucky lenses.',SHADES,{d:LP.cran2});
face('shades_blue','Blue mirror shades',80000,3,'See the dealer, dealer can’t see you.',SHADES,{d:'#4a9ad0'});
face('shades_white','White party shades',70000,3,'Big energy.',SHADES,{d:'#f3ead8'});
face('shades_gold','Gold-plated shades',1200000,18,'Real gold. Allegedly.',SHADES,{d:LP.brass1});
face('specs','Round gold specs',90000,4,'For reading the fine print on parlays.',pad(6,['...y.yy.y...']),{y:LP.brass1});
face('3d','3-D glasses',30000,1,'The odds jump right off the board.',pad(6,['...rrwwbb...']),{r:'#d0303a',w:'#cfd9e0',b:'#4a7fd0'});
face('hearts','Heart glasses',45000,2,'In love with the game.',pad(5,['...pp..pp...','...pp..pp...','....p..p....']),{p:'#e05a7a'});
face('stars','Star shades',100000,4,'Rock-star energy.',pad(5,['....y..y....','...yyyyyy...','....y..y....']),{y:'#f2d24b'});
face('monocle','Monocle',300000,8,'Indeed.',pad(5,['......yyy...','......y.y...','......yyy...','........y...','........y...']),{y:LP.brass1});
face('eyepatch','Eye patch',60000,3,'Lost it on a bad beat.',pad(5,['...kkkkkk...','...kkk......']),{k:'#121216'});
face('goggles','Ski goggles',120000,5,'Black diamond runs only.',pad(5,['..xxxxxxxx..','..xyyxxyyx..']),{x:'#1c1c22',y:'#f2b26b'});
face('mask_gold','Gold masquerade mask',500000,10,'Nobody knows it’s you. Everybody knows it’s you.',pad(5,['..y.yyyy.y..','..yy.yy.yy..']),{y:LP.brass1});
face('mask_black','Black masquerade mask',450000,10,'Mystery guest at table four.',pad(5,['..k.kkkk.k..','..kk.kk.kk..']),{k:'#1c1c22'});
face('mustache','Handlebar mustache',40000,2,'Twirl it when you win.',pad(7,['...bbbbbb...','...b....b...']),{b:'#4a2a14'});
face('beard_brown','Lumberjack beard',90000,4,'Grown in the lodge, by the fire.',pad(6,['...b....b...','...bbbbbb...','...bbbbbb...','....bbbb....']),{b:'#5a3218'});
face('beard_gray','Silver fox beard',200000,7,'Distinguished. Experienced. Still lucky.',pad(6,['...b....b...','...bbbbbb...','...bbbbbb...','....bbbb....']),{b:'#9fa4ac'});
face('goatee','Goatee',30000,1,'Small, sharp, confident.',pad(8,['.....bb.....','.....bb.....']),{b:'#4a2a14'});
face('clown','Clown nose',20000,1,'Honk if you’re winning.',pad(7,['.....rr.....']),{r:'#e0303a'});
face('eyeblack','Eye black',25000,1,'Game face on.',pad(7,['...k....k...']),{k:'#121216'});

// ---- Coats, jackets, suits and jerseys (recolour coat c, trim C, buttons b, collar w, trousers p, shoes o) ----
coat('denim','Denim jacket',60000,1,'Broken in at a hundred tailgates.',{c:'#3d5a80',C:'#2b4060',b:LP.brass1,p:'#2b4060'});
coat('leather','Black leather jacket',180000,5,'Smells like a motorcycle.',{c:'#1c1c22',C:'#0e0e12',b:'#8a8a92'});
coat('letterman','Letterman jacket',120000,4,'Varsity in betting.',{c:LP.cran2,C:LP.snow2,b:LP.snow2});
coat('hoodie','Gray hoodie',35000,1,'Comfy enough for an all-nighter.',{c:'#6f6d72',C:'#55545c',b:'#cfd9e0'});
coat('puffer','Orange puffer',90000,3,'Like wearing a sleeping bag. Wonderful.',{c:LP.emb1,C:LP.emb0,b:LP.brass3});
coat('flannel','Red flannel shirt',45000,2,'Chopped the firewood this morning.',{c:'#b03a3a',C:'#5a1a1a',b:'#1c1c22'});
coat('safari','Safari jacket',140000,5,'Hunting for value bets.',{c:'#b8a070',C:'#8a7650',b:'#5e4520',p:'#8a7650'});
coat('labcoat','Lab coat',100000,4,'Strictly scientific betting.',{c:'#f3ead8',C:'#cfd9e0',b:'#9fb0bf',w:'#4a7fd0'});
coat('tracksuit','Purple tracksuit',80000,3,'Ready for anything. Mostly lounging.',{c:'#5a2a8a',C:'#3a1a5a',b:LP.snow2,p:'#3a1a5a'});
coat('camo','Camo jacket',110000,4,'You can’t see me at the blackjack table.',{c:'#4a5a30',C:'#2f3a1e',b:'#6b5a3a'});
coat('sweater','Ugly holiday sweater',50000,2,'Hideous. Perfect. Blinks a little.',{c:LP.pine4,C:LP.cran2,b:LP.snow2,w:LP.cran2});
coat('snowsuit','Blue snowsuit',75000,3,'One piece. Zero regrets.',{c:'#2b6cb0',C:'#1e4a80',b:LP.snow2,p:'#1e4a80'});
coat('robe','Royal robe',4000000,30,'Ermine trim. Bow before the bankroll.',{c:'#4a1a6a',C:LP.snow2,b:LP.brass1,w:LP.snow2});
coat('dinner','White dinner jacket',900000,13,'Casino Royale, but cozier.',{c:'#f3ead8',C:'#cfd9e0',w:'#16161c',b:'#16161c',p:'#16161c'});
coat('sequin','Silver sequin blazer',1800000,18,'Sparkles under the chandelier.',{c:'#b8c0cc',C:'#8a929e',b:LP.brass3,p:'#16161c'});
coat('hawaiian','Hawaiian shirt',60000,2,'On vacation. Mentally.',{c:'#2a9a8a',C:'#1a6a5e',b:LP.emb2});
coat('astronaut','Astronaut suit',5000000,32,'Your bankroll is going to the moon.',{c:'#dfe4ea',C:'#9fb0bf',b:LP.cran3,p:'#dfe4ea',o:'#6f6d72'});
coat('jersey_crimson','Crimson & gold jersey',70000,2,'Home whites are for the other guys.',{c:LP.cran2,C:LP.brass1,b:LP.brass1,w:LP.brass1});
coat('jersey_navy','Navy & orange jersey',70000,2,'Sunday’s best.',{c:'#1f2d4a',C:LP.emb1,b:LP.emb1,w:LP.emb1});
coat('jersey_green','Forest & white jersey',70000,2,'Clean, classic, undefeated (in spirit).',{c:LP.pine4,C:LP.snow2,b:LP.snow2,w:LP.snow2});
coat('jersey_purple','Purple & gold jersey',70000,2,'Royalty on the gridiron.',{c:'#4a2a7a',C:LP.brass1,b:LP.brass1,w:LP.brass1});

// ---- Scarves and watches ----
scarf('crimson','Crimson scarf',25000,1,'Bold, like your parlays.',LP.cran3);
scarf('navy','Navy scarf',25000,1,'Understated confidence.','#2b3a5c');
scarf('plum','Plum scarf',30000,2,'A touch of velvet.','#6a2a5a');
scarf('ice','Ice-blue scarf',30000,2,'Cool as the snow outside.','#9fd0e8');
scarf('orange','Pumpkin scarf',30000,2,'Autumn never left.',LP.emb1);
scarf('black','Black cashmere scarf',90000,5,'Expensive-quiet.','#1c1c22');
scarf('white','Snow-white scarf',40000,3,'Fresh powder.','#f6f3ec');
scarf('mustard','Mustard scarf',30000,2,'Goes with everything. Allegedly.','#d0a020');
scarf('teal','Teal scarf',30000,2,'Pairs nicely with green felt.','#2a9a8a');
scarf('pink','Pink scarf',30000,2,'Pretty in pink, deadly at poker.','#e88aa8');
watch('silver','Silver watch',80000,3,'Classic steel.','#cfd9e0');
watch('rose','Rose-gold watch',250000,7,'Warm glow on the wrist.','#e8a090');
watch('emerald','Emerald watch',700000,12,'Green, like the felt.','#3ad08a');
watch('ruby','Ruby watch',700000,12,'Red, like hot dice.','#e0303a');
watch('sapphire','Sapphire watch',700000,12,'Blue, like a cold deck.','#4a7fd0');
watch('black','Black ceramic watch',300000,8,'Stealth wealth.','#121216');
watch('smart','Smart watch',150000,5,'Tracks your steps to the cashier.','#6ad0ff');
watch('platinum','Platinum watch',3500000,28,'Heavier than it looks. Like you.','#f6f3ec');

// ---- Things to carry (pixel grids in the 12×21 character frame; the hand is near column 10, row 14) ----
carry('football','Football',40000,1,'Laces out.',pad(12,['.........bb.','........bwbb','.........bb.']),{b:'#7a4a24',w:LP.snow2});
carry('trophy','Mini trophy',150000,5,'Every day’s a championship.',pad(10,['........y..y','........yyyy','.........yy.','.........yy.','........yyyy']),{y:LP.brass1});
carry('briefcase','Briefcase',120000,4,'Full of very important betting slips.',pad(12,['.........kk.','........bbbb','........bbbb','........bybb']),{b:'#5a3218',k:'#2a1a0e',y:LP.brass1});
carry('moneybag','Money bag',500000,10,'You know what’s inside.',pad(11,['.........kk.','........gggg','........gygg','........gggg']),{g:'#4a7a3a',k:'#2a1a0e',y:LP.brass2});
carry('balloon','Red balloon',20000,1,'Up, up and away.',pad(1,['.........rr.','........rrrr','........rrrr','.........rr.','..........w.','..........w.','..........w.','..........w.','..........w.','..........w.','..........w.','..........w.','..........w.']),{r:'#e0303a',w:'#cfd9e0'});
carry('phone','Phone',60000,2,'Checking the scores. Again.',pad(12,['..........kk','..........bk','..........kk']),{k:'#121216',b:'#6ad0ff'});
carry('book','Book of odds',50000,2,'Dog-eared on every page.',pad(12,['.........rrr','.........rwr','.........rrr']),{r:LP.cran2,w:LP.brass2});
carry('lantern','Lantern',90000,4,'Lights the way home from the lodge.',pad(11,['..........k.','.........kyk','.........yoy','.........kyk']),{k:'#2a2a30',y:'#ffdca8',o:LP.emb1});
carry('candycane','Candy cane',15000,1,'Peppermint, obviously.',pad(9,['.........rwr','.........w.w','...........r','...........w','...........r','...........w','...........r']),{r:'#d0303a',w:LP.snow2});
carry('snowball','Snowball',10000,1,'Nobody saw anything.',pad(13,['..........ww','..........ww']),{w:'#f6f3ec'});
carry('gift','Wrapped gift',35000,1,'For you? For me.',pad(12,['.........gyg','.........yyy','.........gyg']),{g:LP.pine5,y:LP.brass1});
carry('rose','Red rose',30000,2,'For the dealer. She’s been good to you.',pad(9,['..........r.','.........rrr','..........g.','.........gg.','..........g.','..........g.']),{r:'#d0303a',g:'#3a8a3a'});
carry('rod','Fishing rod',110000,4,'Fishing for a big one.',pad(3,['...........k','...........k','...........k','...........k','...........k','...........k','...........k','...........k','...........k','...........k','..........gk','...........k']),{k:'#6b4a2a',g:'#9fa4ac'});
carry('pizza','Pizza slice',20000,1,'Lodge pizza. Extra cheese.',pad(12,['.........bbb','.........yry','..........y.']),{b:'#c08a4a',y:'#f2d24b',r:'#d0303a'});
carry('dice','Lucky dice',75000,3,'Loaded with good vibes only.',pad(12,['........ww..','........wkww','..........kw','..........ww']),{w:LP.snow2,k:'#121216'});
carry('chips','Stack of chips',200000,6,'Ready to ride.',pad(11,['.........rrr','.........www','.........bbb','.........ggg']),{r:LP.cran3,w:LP.snow2,b:'#4a7fd0',g:'#3a8a3a'});
carry('pennant','Team pennant',30000,1,'Wave it when your team scores.',pad(5,['.......rrrrk','........rrrk','.........rrk','..........rk','...........k','...........k','...........k','...........k','...........k','...........k']),{r:LP.cran2,k:'#6b4a2a'});
carry('torch','Torch',60000,3,'Brings its own fire.',pad(8,['..........y.','.........oyo','.........ooo','..........b.','..........b.','..........b.','..........b.']),{y:'#fff3b0',o:LP.emb1,b:'#6b4a2a'});
carry('wand','Magic wand',350000,9,'Abraca-jackpot.',pad(8,['.........y.y','..........y.','.........y.y','...........k','...........k','...........k','...........k']),{y:'#f2d24b',k:'#2a1a0e'});
carry('teddy','Teddy bear',50000,2,'Holds your hand on bad beats.',pad(11,['.........b.b','.........bbb','.........bkb','........bbbb','.........b.b']),{b:'#a06a3a',k:'#2a1a0e'});
carry('mug','Coffee mug',15000,1,'Fuel for the late games.',pad(12,['.........www','........kwbw','.........www']),{w:LP.snow2,b:'#6b3a1f',k:LP.snow1});
carry('mic','Microphone',90000,4,'Calling the action live.',pad(10,['..........kk','..........kk','..........g.','..........g.','..........g.']),{k:'#2a2a30',g:'#9fa4ac'});
carry('umbrella','Umbrella',40000,2,'It never rains in the lodge. Just in case.',pad(2,['......rrrrr.','.....rrrrrrr','.....r.r.r.r','..........k.','..........k.','..........k.','..........k.','..........k.','..........k.','..........k.','..........k.','.........kk.']),{r:'#2b6cb0',k:'#2a2a30'});
carry('guitar','Acoustic guitar',300000,8,'Plays three chords and the blues.',pad(6,['.k..........','.k..........','.k..........','.b..........','bbb.........','bob.........','bbb.........','.b..........']),{k:'#2a1a0e',b:'#c08a4a',o:'#2a1a0e'});
carry('hotdog','Hot dog',15000,1,'Ballpark rules apply.',pad(13,['........bbbb','........rrrr','........bbbb']),{b:'#d8a860',r:'#b0402a'});
carry('lollipop','Giant lollipop',25000,1,'Sweet victory.',pad(8,['.........ppp','.........pwp','.........ppp','..........w.','..........w.','..........w.']),{p:'#e05a9a',w:LP.snow2});
carry('sparkler','Sparkler',30000,2,'Celebrate early, celebrate often.',pad(8,['........y.y.','.........y..','........y.y.','.........k..','..........k.','..........k.']),{y:'#fff3b0',k:'#6f6d72'});
carry('bat','Baseball bat',80000,3,'Swinging for the fences.',pad(6,['...........b','...........b','...........b','...........b','...........b','...........b','..........bb','..........bb','..........kk']),{b:'#c08a4a',k:'#2a1a0e'});
carry('puppy','Puppy',400000,9,'A very good boy. Follows you everywhere.',pad(16,['b..b........','bbbb........','bkbbbb......','.bbbbb......','.b..b.......']),{b:'#c08a4a',k:'#2a1a0e'});
carry('kitten','Kitten',400000,9,'Purrs louder when you win.',pad(16,['g..g........','gggg........','gkgggg......','.ggggg..g...','.g..g...g...']),{g:'#8a8a92',k:'#2a1a0e'});
carry('goldbar','Gold bar',2000000,20,'Heavy. Shiny. Yours.',pad(13,['.........yyy','........yyyy']),{y:LP.brass1});
carry('snowglobe','Snow globe',70000,3,'A tiny lodge inside a tiny lodge.',pad(11,['.........ccc','.........cwc','.........ccc','.........bbb']),{c:'#9fd0e8',w:LP.snow2,b:LP.wal5});

/* =====================================================================
   ROOM DECOR
   ===================================================================== */
const DEC=[];
// place: 'W' = on the wall, 'F' = flat on the floor (rugs), '' = stands on the floor.
// base draws the still picture (cached once); anim (optional) draws the moving bits each frame.
const D=(id,name,price,lvl,sub,place,w,h,desc,base,anim)=>DEC.push({id:'decor_'+id,cat:'decor',sub,name,price,lvl,desc,w,h,wall:place==='W'?1:undefined,floor:place==='F'?1:undefined,base,anim});
const C={ink:LP.ink,wd:LP.wal4,wd2:LP.wal5,wd3:LP.wal3,dk:LP.wal1,br:LP.brass1,br2:LP.brass2,sn:LP.snow2,cr:LP.cran2,gr:'#3a8a3a',gr2:'#2a6a2a',gl:'#9fd0e8'};

// ---- Paintings (one frame, many scenes) ----
const frame=(c,x,y,w,h,f)=>{ R(c,x,y,w,h,f); R(c,x+1,y+1,w-2,h-2,'#00000033'); };
const paint=(id,name,price,lvl,desc,fcol,scene)=>D(id,name,price,lvl,'wall','W',22,16,desc,(c,x,y)=>{ frame(c,x,y,22,16,fcol); scene(c,x+2,y+2,18,12); });
paint('paint_sunset','Sunset painting',120000,2,'The sky over the lake, every night.',LP.brass1,(c,x,y,w,h)=>{ ['#f2b26b','#e8963c','#c9782c','#9a2a35'].forEach((col,i)=>R(c,x,y+i*2,w,2,col)); R(c,x+7,y+4,5,3,'#fff3b0'); R(c,x,y+8,w,4,'#2b3a5c'); R(c,x+6,y+9,7,1,'#f2b26b'); });
paint('paint_ocean','Ocean painting',120000,2,'Waves you can almost hear.',LP.brass1,(c,x,y,w,h)=>{ R(c,x,y,w,h,'#9fd0e8'); R(c,x,y+5,w,7,'#2b6cb0'); for(let i=0;i<w;i+=4){ R(c,x+i,y+5,2,1,LP.snow2); R(c,x+i+2,y+8,2,1,'#6ab0e0'); } R(c,x+14,y+1,3,2,'#fff3b0'); });
paint('paint_forest','Pine forest painting',140000,3,'The woods behind the lodge.',LP.wal5,(c,x,y,w,h)=>{ R(c,x,y,w,h,'#bcd4e0'); R(c,x,y+10,w,2,LP.snow2); for(let i=0;i<5;i++){ const px=x+1+i*4; for(let k=0;k<5;k++) R(c,px+2-Math.floor(k/2),y+3+k*1.4|0,1+Math.floor(k/2)*2,2,i%2?LP.pine4:LP.pine3); R(c,px+2,y+9,1,2,LP.wal3); } });
paint('paint_night','Starry night painting',220000,5,'A swirl of stars over the mountains.','#1c1c22',(c,x,y,w,h)=>{ R(c,x,y,w,h,'#14204a'); for(const [a,b] of [[2,2],[6,4],[11,1],[15,3],[4,7],[13,6],[17,5]]) R(c,x+a,y+b,1,1,'#fff3b0'); R(c,x+14,y+1,3,3,'#f2d24b'); for(let i=0;i<9;i++){ R(c,x+i,y+11-i,1,i+1,'#0a1430'); R(c,x+17-i,y+11-i,1,i+1,'#0a1430'); } });
paint('paint_abstract','Abstract painting',300000,6,'Nobody knows what it means. It cost a lot.',LP.snow2,(c,x,y,w,h)=>{ R(c,x,y,w,h,'#f3ead8'); R(c,x+1,y+1,7,6,'#d0303a'); R(c,x+9,y+1,8,3,'#2b6cb0'); R(c,x+9,y+5,4,6,'#f2d24b'); R(c,x+1,y+8,7,3,'#1c1c22'); R(c,x+14,y+5,3,6,'#1c1c22'); });
paint('paint_lighthouse','Lighthouse painting',180000,4,'Guiding the gamblers home.',LP.brass1,(c,x,y,w,h)=>{ R(c,x,y,w,h,'#7fa8c0'); R(c,x,y+9,w,3,'#2b4a6a'); R(c,x+8,y+2,3,8,LP.snow2); R(c,x+8,y+4,3,1,LP.cran2); R(c,x+8,y+7,3,1,LP.cran2); R(c,x+7,y+1,5,1,'#1c1c22'); R(c,x+11,y+1,6,1,'#fff3b0'); R(c,x+5,y+9,8,1,'#5a5a5a'); });
paint('paint_sailboat','Sailboat painting',160000,3,'Smooth sailing ahead.',LP.wal5,(c,x,y,w,h)=>{ R(c,x,y,w,h,'#bcd4e0'); R(c,x,y+8,w,4,'#2b6cb0'); R(c,x+9,y+1,1,7,'#3a2617'); for(let k=0;k<6;k++) R(c,x+10,y+2+k,k+1,1,LP.snow2); R(c,x+5,y+8,9,1,LP.cran2); R(c,x+6,y+9,7,1,LP.cran2); });
paint('paint_stadium','Stadium painting',260000,6,'Friday night lights.',LP.brass1,(c,x,y,w,h)=>{ R(c,x,y,w,h,'#0a1430'); R(c,x,y+6,w,6,'#2a7a45'); for(let i=0;i<w;i+=3) R(c,x+i,y+6,1,6,'#3a9a55'); R(c,x+2,y+1,1,5,'#9fa4ac'); R(c,x+15,y+1,1,5,'#9fa4ac'); R(c,x+1,y+1,3,1,'#fff3b0'); R(c,x+14,y+1,3,1,'#fff3b0'); R(c,x+8,y+8,2,1,'#7a4a24'); });
paint('paint_desert','Desert painting',150000,3,'Somewhere far from the snow.',LP.wal5,(c,x,y,w,h)=>{ R(c,x,y,w,h,'#f2b26b'); R(c,x,y+8,w,4,'#d8a860'); R(c,x+12,y+1,3,3,'#fff3b0'); R(c,x+4,y+3,2,7,'#3a8a3a'); R(c,x+2,y+5,2,1,'#3a8a3a'); R(c,x+2,y+4,1,2,'#3a8a3a'); R(c,x+6,y+6,2,1,'#3a8a3a'); R(c,x+7,y+5,1,2,'#3a8a3a'); });
paint('paint_aurora','Northern lights painting',400000,8,'Green fire over the peaks.','#1c1c22',(c,x,y,w,h)=>{ R(c,x,y,w,h,'#0a1430'); for(let i=0;i<w;i++){ const yy=2+Math.round(2*Math.sin(i*.6)); R(c,x+i,y+yy,1,3,i%3?'#3ad08a':'#6ae0b0'); } for(let i=0;i<9;i++){ R(c,x+i,y+11-Math.floor(i/2),1,1+Math.floor(i/2),'#1a2a40'); R(c,x+17-i,y+11-Math.floor(i/2),1,1+Math.floor(i/2),'#1a2a40'); } });
paint('paint_city','City skyline painting',240000,5,'The lights of Vegas, far away.','#1c1c22',(c,x,y,w,h)=>{ R(c,x,y,w,h,'#3a2a5a'); for(const [a,b,bw] of [[0,6,3],[3,3,3],[6,7,2],[8,1,3],[11,5,3],[14,4,2],[16,7,2]]){ R(c,x+a,y+b,bw,h-b,'#121226'); for(let yy=b+1;yy<h-1;yy+=2) R(c,x+a+1,y+yy,1,1,'#f2d24b'); } });
paint('paint_hound','Portrait of a hound',500000,9,'Sir Barksalot, founder of the lodge.',LP.brass1,(c,x,y,w,h)=>{ R(c,x,y,w,h,'#3a2a1a'); R(c,x+6,y+2,6,6,'#a06a3a'); R(c,x+5,y+3,1,4,'#6b3a1f'); R(c,x+12,y+3,1,4,'#6b3a1f'); R(c,x+7,y+4,1,1,'#121216'); R(c,x+10,y+4,1,1,'#121216'); R(c,x+8,y+6,2,1,'#121216'); R(c,x+4,y+8,10,4,LP.cran1); R(c,x+8,y+8,2,2,LP.snow2); });

// ---- Wall mounts, signs and things that hang ----
D('fish','Mounted bass',90000,3,'wall','W',24,10,'It was THIS big.',(c,x,y)=>{ R(c,x,y,24,10,LP.wal5); R(c,x+1,y+1,22,8,LP.wal4); R(c,x+4,y+3,13,4,'#5a8a3a'); R(c,x+5,y+6,11,1,'#d8d0a0'); R(c,x+17,y+2,4,6,'#4a7a2a'); R(c,x+6,y+4,1,1,'#121216'); R(c,x+3,y+4,1,2,'#7a2a2a'); });
D('moose','Mounted moose',600000,10,'wall','W',28,22,'Meet Gerald. He watches the games with you.',(c,x,y)=>{ R(c,x+10,y+16,8,6,LP.wal5); R(c,x+10,y+6,8,11,'#5a3a1f'); R(c,x+11,y+15,6,3,'#4a2a14'); R(c,x+11,y+9,1,1,'#121216'); R(c,x+16,y+9,1,1,'#121216'); for(const s of [0,1]){ const ax=s?18:2; R(c,ax,y+3,8,3,'#c8b088'); for(let i=0;i<4;i++) R(c,ax+i*2+(s?1:0),y,1,3,'#c8b088'); R(c,s?17:10,y+5,2,2,'#c8b088'); R(c,s?16:11,y+6,1,1,'#c8b088'); } });
D('jackalope','Mounted jackalope',250000,7,'wall','W',16,18,'Extremely real. Do not question it.',(c,x,y)=>{ R(c,x+3,y+12,10,6,LP.wal5); R(c,x+4,y+6,8,7,'#a88a6a'); R(c,x+5,y+1,2,6,'#a88a6a'); R(c,x+9,y+1,2,6,'#a88a6a'); R(c,x+3,y,1,4,'#e8dcc0'); R(c,x+12,y,1,4,'#e8dcc0'); R(c,x+6,y+8,1,1,'#121216'); R(c,x+9,y+8,1,1,'#121216'); R(c,x+7,y+10,2,1,'#e88aa8'); });
D('clock','Wall clock',70000,2,'wall','W',14,14,'Always says it’s game time.',(c,x,y)=>{ for(let yy=-6;yy<=6;yy++)for(let xx=-6;xx<=6;xx++){ const d=xx*xx+yy*yy; if(d<=42) R(c,x+7+xx,y+7+yy,1,1,d>30?LP.wal5:'#f3ead8'); } for(const [a,b] of [[7,2],[12,7],[7,12],[2,7]]) R(c,x+a,y+b,1,1,'#121216'); },
  (c,x,y,t)=>{ const a=t*.5, b=t*.05; for(let i=1;i<=4;i++) R(c,x+7+Math.round(Math.sin(a)*i),y+7-Math.round(Math.cos(a)*i),1,1,LP.cran2); for(let i=1;i<=3;i++) R(c,x+7+Math.round(Math.sin(b)*i),y+7-Math.round(Math.cos(b)*i),1,1,'#121216'); });
D('cuckoo','Cuckoo clock',180000,5,'wall','W',16,24,'Cuckoo! (every ten seconds)',(c,x,y)=>{ R(c,x,y+4,16,2,LP.wal5); for(let i=0;i<4;i++) R(c,x+4-i,y+i,8+i*2,1,LP.wal5); R(c,x+2,y+6,12,12,LP.wal4); R(c,x+4,y+9,8,7,'#f3ead8'); R(c,x+7,y+10,1,4,'#121216'); R(c,x+8,y+12,2,1,'#121216'); R(c,x+6,y+6,4,3,'#1c1c22'); R(c,x+5,y+18,1,5,'#8a929e'); R(c,x+10,y+18,1,4,'#8a929e'); R(c,x+4,y+22,3,2,LP.brass1); R(c,x+9,y+21,3,2,LP.brass1); },
  (c,x,y,t)=>{ if((t%10)<1.2){ R(c,x+6,y+5,4,3,'#c08a4a'); R(c,x+5,y+6,1,1,'#f2b26b'); } });
const neon=(id,name,price,lvl,desc,txt,col)=>{ const w=ptextW(txt)+8; D(id,name,price,lvl,'wall','W',w,11,desc,(c,x,y)=>{ R(c,x,y,w,11,'#121216'); R(c,x+1,y+1,w-2,9,'#1c1c26'); },
  (c,x,y,t)=>{ const on=Math.sin(t*13+w)>-.92; ptext(c,txt,x+4,y+3,on?col:'#3a3a44'); if(on){ c.globalAlpha=.25; ptext(c,txt,x+4,y+2,col); c.globalAlpha=1; } }); };
neon('neon_bar','Neon “BAR” sign',150000,4,'Every lodge needs one.','BAR','#ff6ad0');
neon('neon_777','Neon “777” sign',250000,6,'Lucky sevens, glowing all night.','777','#ff4a4a');
neon('neon_win','Neon “WIN” sign',200000,5,'Manifesting.','WIN','#5aff8a');
neon('neon_jackpot','Neon “JACKPOT” sign',800000,12,'Flickers when you’re due.','JACKPOT','#ffd24a');
neon('neon_open','Neon “OPEN” sign',120000,3,'The lodge never closes.','OPEN','#6ad0ff');
neon('neon_lucky','Neon “LUCKY” sign',400000,8,'Purple and proud.','LUCKY','#c08aff');
const pennant=(id,name,lvl,txt,a,b)=>D(id,name,60000,lvl,'wall','W',26,11,'Hang your colours high.',(c,x,y)=>{ R(c,x,y,2,11,LP.wal5); for(let i=0;i<24;i++){ const hh=Math.max(1,Math.round(9*(1-i/24))); R(c,x+2+i,y+1+Math.floor((9-hh)/2),1,hh,a); } ptext(c,txt,x+4,y+3,b); });
pennant('pen_mvp','MVP pennant',1,'MVP',LP.cran2,LP.brass2);
pennant('pen_td','TD pennant',1,'TD','#1f2d4a',LP.emb1);
pennant('pen_go','GO pennant',1,'GO',LP.pine4,LP.snow2);
pennant('pen_win','WIN pennant',2,'WIN','#4a2a7a',LP.brass1);
pennant('pen_4g','4&G pennant',2,'4&G','#1c1c22','#cfd9e0');
pennant('pen_hut','HUT pennant',2,'HUT','#2b6cb0',LP.snow2);
D('bookshelf_wall','Wall bookshelf',90000,3,'wall','W',26,12,'Mostly books about luck.',(c,x,y)=>{ const cols=[LP.cran2,'#2b6cb0',LP.pine4,LP.brass1,'#6a2a5a','#c9782c','#1c1c22']; for(let i=0;i<11;i++) R(c,x+1+i*2,y+(i%3),2,10-(i%3),cols[i%7]); R(c,x+23,y+6,2,4,'#9fa4ac'); R(c,x,y+10,26,2,LP.wal5); });
D('goldrecord','Gold record',350000,8,'wall','W',16,18,'Platinum-selling winning streak.',(c,x,y)=>{ R(c,x,y,16,18,'#1c1c22'); R(c,x+1,y+1,14,16,'#2a2a34'); for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++){ const d=xx*xx+yy*yy; if(d<=28) R(c,x+8+xx,y+8+yy,1,1,d<3?LP.cran2:d%5?LP.brass1:LP.brass2); } R(c,x+3,y+15,10,1,LP.brass2); });
D('jersey','Framed jersey',280000,6,'wall','W',20,20,'Number 4. Retired, like your losing streak.',(c,x,y)=>{ R(c,x,y,20,20,LP.wal5); R(c,x+1,y+1,18,18,'#1c2a22'); R(c,x+4,y+4,12,13,LP.cran2); R(c,x+2,y+4,3,5,LP.cran2); R(c,x+15,y+4,3,5,LP.cran2); R(c,x+8,y+4,4,2,LP.snow2); ptext(c,'4',x+9,y+9,LP.brass2); });
D('map','Treasure map',160000,4,'wall','W',26,16,'X marks the jackpot.',(c,x,y)=>{ R(c,x,y,26,16,'#d8c090'); R(c,x+1,y+1,24,14,'#e8d4a8'); R(c,x+3,y+3,8,5,'#a8c890'); R(c,x+14,y+7,8,6,'#a8c890'); for(let i=0;i<8;i++) R(c,x+8+i,y+9-(i%3),1,1,'#8a5a2a'); R(c,x+17,y+9,1,1,LP.cran2); R(c,x+18,y+10,1,1,LP.cran2); R(c,x+18,y+9,1,1,LP.cran2); R(c,x+17,y+10,1,1,LP.cran2); });
D('dartboard','Dartboard',80000,3,'wall','W',14,14,'Three darts, one bullseye.',(c,x,y)=>{ for(let yy=-6;yy<=6;yy++)for(let xx=-6;xx<=6;xx++){ const d=xx*xx+yy*yy; if(d<=42){ const ring=d<3?LP.cran2:d<10?LP.pine4:d<22?'#f3ead8':d<32?'#1c1c22':LP.cran2; R(c,x+7+xx,y+7+yy,1,1,ring); } } R(c,x+9,y+4,1,3,LP.brass1); R(c,x+5,y+8,3,1,LP.brass1); });
D('skis','Crossed skis',140000,4,'wall','W',20,24,'Retired after one legendary run.',(c,x,y)=>{ for(let i=0;i<22;i++){ R(c,x+1+Math.round(i*.8),y+1+i,2,1,LP.cran2); R(c,x+17-Math.round(i*.8),y+1+i,2,1,'#2b6cb0'); } R(c,x+1,y,2,2,LP.cran3); R(c,x+17,y,2,2,'#4a9ad0'); R(c,x+8,y+10,4,2,'#1c1c22'); });
D('paddles','Canoe paddles',100000,3,'wall','W',16,26,'Up the creek, with paddles.',(c,x,y)=>{ for(const [px,col] of [[3,'#c08a4a'],[11,'#a06a3a']]){ R(c,x+px,y,1,17,col); R(c,x+px-2,y+17,5,8,col); R(c,x+px-1,y+25,3,1,col); R(c,x+px-1,y,3,2,col); } R(c,x+1,y+8,14,2,LP.cran2); });
D('mirror','Gilded mirror',220000,6,'wall','W',14,22,'Who’s the luckiest of them all?',(c,x,y)=>{ R(c,x,y,14,22,LP.brass1); R(c,x+5,y-1,4,2,LP.brass2); R(c,x+2,y+2,10,18,'#9fb8c8'); R(c,x+3,y+3,2,6,'#dfeaf0'); R(c,x+6,y+4,1,3,'#dfeaf0'); });
D('sign_rules','“House Rules” sign',50000,1,'wall','W',30,12,'Rule one: be nice. Rule two: tip Mack.',(c,x,y)=>{ R(c,x,y,30,12,LP.wal5); R(c,x+1,y+1,28,10,LP.wal4); ptext(c,'BE NICE',x+2,y+4,LP.brass2); });
D('wreath','Holiday wreath',60000,1,'holiday','W',16,16,'With a big red bow.',(c,x,y)=>{ for(let yy=-7;yy<=7;yy++)for(let xx=-7;xx<=7;xx++){ const d=xx*xx+yy*yy; if(d<=52&&d>=14) R(c,x+8+xx,y+8+yy,1,1,(xx+yy)%3?LP.pine4:LP.pine5); } for(const [a,b] of [[3,5],[12,6],[4,11],[11,12],[8,2]]) R(c,x+a,y+b,1,1,LP.cran3); R(c,x+6,y+12,4,3,LP.cran2); R(c,x+5,y+14,1,2,LP.cran2); R(c,x+10,y+14,1,2,LP.cran2); });
D('stockings','Row of stockings',70000,1,'holiday','W',28,14,'One for you, one for Mack, one for Silas.',(c,x,y)=>{ R(c,x,y,28,2,LP.wal5); for(let i=0;i<3;i++){ const sx=x+2+i*9, col=[LP.cran2,LP.pine4,'#2b6cb0'][i]; R(c,sx,y+2,5,2,LP.snow2); R(c,sx,y+4,5,6,col); R(c,sx,y+10,8,3,col); R(c,sx+5,y+12,3,1,LP.snow2); } });
D('lights','String lights',50000,1,'holiday','W',40,6,'Blinking, of course.',(c,x,y)=>{ for(let i=0;i<40;i++) R(c,x+i,y+1+Math.round(Math.sin(i*.4)),1,1,LP.pine2); },
  (c,x,y,t)=>{ const cols=['#ff4a4a','#ffd24a','#5aff8a','#6ad0ff']; for(let i=0;i<10;i++){ const px=x+2+i*4, on=((t*3|0)+i)%2; R(c,px,y+2+Math.round(Math.sin((px-x)*.4)),2,2,on?cols[i%4]:'#3a3a44'); } });

// ---- Rugs (flat on the floor) ----
D('rug_bear','Bearskin rug',350000,7,'rugs','F',36,14,'Faux. Gerald the moose insisted.',(c,x,y)=>{ R(c,x+6,y+2,22,10,'#5a3a1f'); R(c,x+2,y,6,4,'#5a3a1f'); R(c,x+2,y+10,6,4,'#5a3a1f'); R(c,x+26,y,6,4,'#5a3a1f'); R(c,x+26,y+10,6,4,'#5a3a1f'); R(c,x+28,y+4,8,6,'#4a2a14'); R(c,x+33,y+5,1,1,'#121216'); R(c,x+33,y+8,1,1,'#121216'); R(c,x+35,y+6,1,2,'#121216'); });
D('rug_round','Round blue rug',90000,2,'rugs','F',26,14,'Ties the room together.',(c,x,y)=>{ for(let yy=0;yy<14;yy++){ const k=(yy-6.5)/7, w=Math.round(13*Math.sqrt(Math.max(0,1-k*k))); R(c,x+13-w,y+yy,w*2,1,'#2b4a7a'); if(w>4) R(c,x+13-w+2,y+yy,w*2-4,1,'#3a6aa0'); if(w>8) R(c,x+13-w+5,y+yy,w*2-10,1,'#2b4a7a'); } });
D('rug_runner','Striped runner',70000,1,'rugs','F',38,8,'Leads the way to the bar.',(c,x,y)=>{ R(c,x,y,38,8,LP.cran1); for(let i=0;i<38;i+=4) R(c,x+i,y,2,8,LP.brass0); R(c,x,y+3,38,2,LP.snow2); });
D('rug_check','Checkerboard rug',110000,3,'rugs','F',30,14,'King me.',(c,x,y)=>{ for(let yy=0;yy<14;yy+=2)for(let xx=0;xx<30;xx+=3) R(c,x+xx,y+yy,3,2,((xx/3+yy/2)|0)%2?'#1c1c22':'#f3ead8'); });
D('rug_persian','Emerald Persian rug',600000,10,'rugs','F',36,16,'Woven for a sultan. Won in a card game.',(c,x,y)=>{ R(c,x,y,36,16,'#1a5a3a'); R(c,x+2,y+2,32,12,LP.brass0); R(c,x+3,y+3,30,10,'#24533e'); R(c,x+15,y+5,6,6,LP.cran2); R(c,x+17,y+7,2,2,LP.brass2); for(const [a,b] of [[6,5],[28,5],[6,10],[28,10]]) R(c,x+a,y+b,2,2,LP.cran3); });
D('rug_braided','Braided oval rug',80000,2,'rugs','F',30,12,'Grandma made it. Grandma is a legend.',(c,x,y)=>{ const cols=[LP.cran1,LP.wal5,LP.pine4,LP.brass0]; for(let yy=0;yy<12;yy++){ const k=(yy-5.5)/6, w=Math.round(15*Math.sqrt(Math.max(0,1-k*k))); for(let r=0;r<w;r+=2){ R(c,x+15-w+r,y+yy,1,1,cols[(r/2|0)%4]); R(c,x+14+w-r,y+yy,1,1,cols[(r/2|0)%4]); } } });
D('rug_welcome','Welcome mat',30000,1,'rugs','F',22,8,'Says hi. Means it.',(c,x,y)=>{ R(c,x,y,22,8,'#8a6a3a'); R(c,x+1,y+1,20,6,'#a8844a'); ptext(c,'HI!',x+5,y+2,LP.wal1); });
D('rug_poker','Poker rug',300000,6,'rugs','F',34,14,'All four suits underfoot.',(c,x,y)=>{ R(c,x,y,34,14,'#1f6b3e'); R(c,x+1,y+1,32,12,'#2a7a45'); for(let i=0;i<4;i++){ const sx=x+4+i*7, col=i%2?LP.cran2:'#121216'; R(c,sx+1,y+5,3,3,col); R(c,sx+2,y+4,1,1,col); R(c,sx+2,y+8,1,2,col); } });
D('rug_field','Football field rug',450000,8,'rugs','F',40,14,'Fourth and gold, on the 40.',(c,x,y)=>{ R(c,x,y,40,14,'#2a7a45'); for(let i=0;i<40;i+=4) R(c,x+i,y,1,14,'#f3ead8'); R(c,x,y,3,14,LP.cran2); R(c,x+37,y,3,14,'#1f2d4a'); R(c,x+19,y+6,2,2,'#7a4a24'); });
D('rug_snow','Snowflake rug',120000,3,'rugs','F',26,14,'No two are alike.',(c,x,y)=>{ R(c,x,y,26,14,'#2b4a6a'); R(c,x+1,y+1,24,12,'#3a6a90'); R(c,x+12,y+2,2,10,LP.snow2); R(c,x+6,y+6,14,2,LP.snow2); for(let i=0;i<4;i++){ R(c,x+8+i,y+3+i,1,1,LP.snow2); R(c,x+17-i,y+3+i,1,1,LP.snow2); R(c,x+8+i,y+10-i,1,1,LP.snow2); R(c,x+17-i,y+10-i,1,1,LP.snow2); } });

// ---- Furniture ----
const chair=(id,name,price,lvl,desc,a,b)=>D(id,name,price,lvl,'furniture','',16,16,desc,(c,x,y)=>{ R(c,x+2,y,12,9,a); R(c,x,y+5,3,8,b); R(c,x+13,y+5,3,8,b); R(c,x+3,y+8,10,4,a); R(c,x+3,y+11,10,2,b); R(c,x+2,y+13,2,3,LP.wal0); R(c,x+12,y+13,2,3,LP.wal0); });
chair('arm_red','Red wingback chair',150000,3,'The best seat for the late game.',LP.cran2,LP.cran1);
chair('arm_green','Green velvet armchair',200000,5,'Sink in. Stay a while.',LP.pine4,LP.pine3);
chair('arm_leather','Leather club chair',280000,6,'Smells like old money.','#6b3a24','#4a2618');
D('recliner','Recliner',180000,4,'furniture','',20,14,'Lever on the side. Feet up for overtime.',(c,x,y)=>{ R(c,x,y,6,12,'#5a4a3a'); R(c,x+5,y+5,10,5,'#6b5a48'); R(c,x+14,y+6,6,3,'#6b5a48'); R(c,x+3,y+9,12,3,'#4a3a2a'); R(c,x+4,y+12,2,2,LP.wal0); R(c,x+12,y+12,2,2,LP.wal0); });
D('rocker','Rocking chair',120000,3,'furniture','',14,18,'Creaks in a comforting way.',(c,x,y)=>{ R(c,x+2,y,2,12,LP.wal5); R(c,x+2,y,9,2,LP.wal5); for(let i=0;i<3;i++) R(c,x+4+i*3,y+2,1,8,LP.wal5); R(c,x+2,y+9,10,2,LP.wal6); R(c,x+3,y+11,1,5,LP.wal5); R(c,x+10,y+11,1,5,LP.wal5); for(let i=0;i<14;i++) R(c,x+i,y+16+(i<2||i>11?-1:0),1,1,LP.wal4); });
const beanbag=(id,name,lvl,a,b)=>D(id,name,60000,lvl,'furniture','',16,12,'Impossible to get out of.',(c,x,y)=>{ for(let yy=0;yy<12;yy++){ const w=Math.round(8*Math.sqrt(1-((yy-7)/8)**2)); R(c,x+8-w,y+yy,w*2,1,yy<4?b:a); } R(c,x+5,y+5,6,2,b); });
beanbag('bean_red','Red bean bag',1,LP.cran2,LP.cran3);
beanbag('bean_blue','Blue bean bag',1,'#2b4a7a','#3a6aa0');
D('stools','Pair of bar stools',80000,2,'furniture','',16,16,'Pull up. Mack’s pouring.',(c,x,y)=>{ for(const sx of [0,9]){ R(c,x+sx,y,7,2,LP.cran2); R(c,x+sx+3,y+2,1,12,'#8a929e'); R(c,x+sx+1,y+9,5,1,'#8a929e'); R(c,x+sx+1,y+14,5,2,'#5a5a64'); } });
D('dining','Dining table',260000,5,'furniture','',32,16,'Seats eight. Holds poker night.',(c,x,y)=>{ R(c,x,y+4,32,3,LP.wal6); R(c,x,y+7,32,1,LP.wal4); R(c,x+2,y+8,2,8,LP.wal4); R(c,x+28,y+8,2,8,LP.wal4); R(c,x+10,y+1,3,3,LP.snow2); R(c,x+18,y+2,6,2,LP.brass1); R(c,x+20,y,2,2,'#ffdca8'); });
D('coffee','Coffee table',90000,2,'furniture','',24,10,'Coasters, please.',(c,x,y)=>{ R(c,x,y+2,24,3,LP.wal5); R(c,x,y+5,24,1,LP.wal3); R(c,x+2,y+6,2,4,LP.wal3); R(c,x+20,y+6,2,4,LP.wal3); R(c,x+5,y,4,2,'#f3ead8'); R(c,x+14,y,6,2,LP.cran2); });
D('sidelamp','Side table & lamp',110000,3,'plants','',12,22,'Warm light for reading the odds.',(c,x,y)=>{ R(c,x+2,y,8,6,'#e8d4a8'); R(c,x+5,y+6,2,5,LP.brass1); R(c,x,y+11,12,2,LP.wal5); R(c,x+1,y+13,1,9,LP.wal4); R(c,x+10,y+13,1,9,LP.wal4); R(c,x+1,y+17,10,1,LP.wal4); },
  (c,x,y)=>{ c.globalAlpha=.18; R(c,x-2,y+6,16,4,'#ffdca8'); c.globalAlpha=1; });
D('desk','Desk & computer',300000,6,'furniture','',26,20,'Twelve tabs of live scores.',(c,x,y)=>{ R(c,x+7,y,12,9,'#1c1c22'); R(c,x+12,y+9,2,2,'#5a5a64'); R(c,x,y+11,26,2,LP.wal5); R(c,x+1,y+13,2,7,LP.wal4); R(c,x+18,y+13,7,7,LP.wal4); R(c,x+20,y+15,3,1,LP.brass1); R(c,x+8,y+10,8,1,'#8a929e'); },
  (c,x,y,t)=>{ R(c,x+8,y+1,10,7,'#1f6b3e'); for(let i=0;i<3;i++) R(c,x+9,y+2+i*2,((t*4+i*3)%8)+1|0,1,'#f2d24b'); });
D('bookcase','Tall bookcase',240000,5,'furniture','',20,30,'Every book on probability ever written.',(c,x,y)=>{ R(c,x,y,20,30,LP.wal4); const cols=[LP.cran2,'#2b6cb0',LP.pine4,LP.brass1,'#6a2a5a','#c9782c']; for(let s=0;s<4;s++){ R(c,x+2,y+2+s*7,16,6,LP.wal1); for(let i=0;i<7;i++) R(c,x+2+i*2+(i>4?1:0),y+3+s*7+(i+s)%2,2,5-(i+s)%2,cols[(i+s*2)%6]); } });
D('trunk','Steamer trunk',130000,4,'furniture','',20,12,'Packed for the big trip to Vegas.',(c,x,y)=>{ R(c,x,y,20,12,'#6b3a24'); R(c,x,y+4,20,1,'#3a1d12'); R(c,x+3,y,2,12,LP.brass0); R(c,x+15,y,2,12,LP.brass0); R(c,x+9,y+4,2,3,LP.brass1); });
D('piano','Upright piano',700000,11,'furniture','',28,22,'Plays “The Entertainer” on request.',(c,x,y)=>{ R(c,x,y,28,22,'#1c1c22'); R(c,x+1,y+1,26,8,'#2a2a34'); R(c,x+1,y+10,26,3,'#f3ead8'); for(let i=0;i<26;i+=2) if(i%7!==4) R(c,x+2+i,y+10,1,2,'#121216'); R(c,x+2,y+14,24,8,'#16161c'); R(c,x+4,y+2,3,4,LP.brass1); R(c,x+12,y+20,4,2,LP.brass1); });
D('bed_red','Cozy red bed',350000,6,'furniture','',32,18,'Flannel sheets. Sweet dreams of jackpots.',(c,x,y)=>{ R(c,x,y,4,18,LP.wal5); R(c,x+28,y+6,4,12,LP.wal5); R(c,x+4,y+7,24,7,LP.cran2); R(c,x+4,y+5,7,4,LP.snow2); R(c,x+12,y+7,16,2,LP.cran3); R(c,x+4,y+14,24,2,LP.wal4); });
D('bed_blue','Cozy blue bed',350000,6,'furniture','',32,18,'Like sleeping in a snowdrift (a warm one).',(c,x,y)=>{ R(c,x,y,4,18,LP.wal5); R(c,x+28,y+6,4,12,LP.wal5); R(c,x+4,y+7,24,7,'#2b4a7a'); R(c,x+4,y+5,7,4,LP.snow2); R(c,x+12,y+7,16,2,'#3a6aa0'); R(c,x+4,y+14,24,2,LP.wal4); });
const sofa=(id,name,price,lvl,desc,w,a,b,cu)=>D(id,name,price,lvl,'furniture','',w,14,desc,(c,x,y)=>{ R(c,x,y+2,w,8,a); R(c,x+2,y,w-4,5,b); R(c,x,y+4,4,9,a); R(c,x+w-4,y+4,4,9,a); const hw=(w-8)/2|0; R(c,x+4,y+7,hw,3,cu); R(c,x+4+hw,y+7,w-8-hw,3,cu); R(c,x+2,y+12,2,2,LP.wal0); R(c,x+w-4,y+12,2,2,LP.wal0); });
sofa('sofa_green','Green Chesterfield sofa',450000,8,'Buttoned, tufted, terribly comfortable.',30,'#1a4a32','#24533e','#2a6a4a');
sofa('sofa_gray','Gray sectional',320000,5,'Room for the whole fantasy league.',30,'#4a4a52','#5a5a64','#6f6d72');
sofa('loveseat','Velvet loveseat',260000,6,'For two lucky people.',22,'#5a0f2a','#6a1a3a','#7d2a4a');
D('stove','Iron wood stove',400000,8,'furniture','',14,22,'Crackles all night.',(c,x,y)=>{ R(c,x+5,y,4,6,'#2a2a30'); R(c,x+1,y+6,12,13,'#2a2a30'); R(c,x+3,y+9,8,7,'#121216'); R(c,x+1,y+19,2,3,'#2a2a30'); R(c,x+11,y+19,2,3,'#2a2a30'); },
  (c,x,y,t)=>{ for(let i=0;i<6;i++){ const h=2+Math.round(3*Math.abs(Math.sin(t*6+i))); R(c,x+4+i,y+15-h,1,h,i%2?LP.emb1:LP.emb2); } });
D('woodpile','Firewood pile',40000,1,'furniture','',18,10,'Chopped by you. Mostly by Mack.',(c,x,y)=>{ for(let r=0;r<3;r++) for(let i=0;i<5-r;i++){ const lx=x+1+i*3+r*1.5|0, ly=y+7-r*3; R(c,lx,ly,3,3,'#6b4a2a'); R(c,lx+1,ly+1,1,1,'#c08a4a'); } });
D('hatstand','Coat rack',60000,2,'furniture','',12,30,'Hang up your winnings. I mean your coat.',(c,x,y)=>{ R(c,x+5,y+2,2,26,LP.wal5); R(c,x+2,y+28,8,2,LP.wal4); R(c,x+2,y+3,8,1,LP.wal5); R(c,x+1,y+4,3,8,LP.cran2); R(c,x+8,y+4,3,5,'#1c1c22'); R(c,x+4,y,4,2,'#3a2a1a'); });

// ---- Games & entertainment ----
D('jukebox','Jukebox',650000,10,'games','',16,26,'Plays the hits from 1958.',(c,x,y)=>{ R(c,x,y+4,16,22,'#6b3a24'); for(let i=0;i<4;i++) R(c,x+4-i,y+i,8+i*2,1,'#6b3a24'); R(c,x+3,y+8,10,7,'#1c1c22'); R(c,x+3,y+17,10,6,'#2a2a34'); },
  (c,x,y,t)=>{ const cols=['#ff4a4a','#ffd24a','#5aff8a','#6ad0ff','#ff6ad0']; for(let i=0;i<5;i++) R(c,x+1+i*3,y+4,2,2,cols[(i+(t*4|0))%5]); for(let i=0;i<4;i++) R(c,x+4+i*2,y+9+((t*5+i)%4|0),1,2,LP.brass2); });
D('arcade','Arcade cabinet',500000,9,'games','',14,28,'Insert coin. High score: you.',(c,x,y)=>{ R(c,x,y,14,28,'#2a2a6a'); R(c,x+1,y+1,12,3,'#ff6ad0'); R(c,x+2,y+6,10,9,'#121216'); R(c,x+1,y+16,12,3,'#3a3a8a'); R(c,x+3,y+16,1,2,'#d0303a'); R(c,x+7,y+17,2,1,'#5aff8a'); R(c,x+10,y+17,2,1,'#6ad0ff'); },
  (c,x,y,t)=>{ R(c,x+3,y+7,8,7,'#0a1430'); R(c,x+3+((t*6|0)%7),y+12,2,1,'#5aff8a'); R(c,x+4+((t*3|0)%6),y+8+((t*2|0)%3),1,1,'#ffd24a'); });
D('pinball','Pinball machine',550000,10,'games','',16,24,'Tilt! Never tilt.',(c,x,y)=>{ R(c,x,y,16,10,'#1c1c22'); R(c,x+1,y+1,14,8,'#3a1a6a'); R(c,x,y+10,16,6,'#6a2a8a'); R(c,x+2,y+11,12,4,'#2a7a45'); R(c,x+1,y+16,2,8,'#2a2a30'); R(c,x+13,y+16,2,8,'#2a2a30'); },
  (c,x,y,t)=>{ ptext(c,'WIN',x+2,y+3,Math.sin(t*6)>0?'#ffd24a':'#ff6ad0'); R(c,x+3+((t*9|0)%10),y+12+((t*5|0)%2),1,1,LP.snow2); });
D('slotmachine','Slot machine',800000,12,'games','',14,24,'Your own personal Jingle Jackpot.',(c,x,y)=>{ R(c,x,y,14,24,LP.cran2); R(c,x+1,y+1,12,4,LP.brass1); R(c,x+2,y+7,10,6,'#f3ead8'); R(c,x+1,y+15,12,2,LP.cran1); R(c,x+13,y+6,1,6,'#9fa4ac'); R(c,x+12,y+4,2,2,LP.cran3); R(c,x+3,y+19,8,3,'#121216'); },
  (c,x,y,t)=>{ const sy=['#d0303a','#f2d24b','#3a8a3a','#4a7fd0']; for(let i=0;i<3;i++) R(c,x+3+i*3,y+9,2,2,sy[((t*8|0)+i*3)%4]); R(c,x+2+((t*4|0)%10),y+2,1,2,'#fff3b0'); });
D('roulette','Mini roulette table',900000,13,'games','',30,16,'Spin it whenever you like.',(c,x,y)=>{ R(c,x,y+3,30,8,'#1f6b3e'); R(c,x,y+11,30,2,LP.wal4); R(c,x+2,y+13,2,3,LP.wal4); R(c,x+26,y+13,2,3,LP.wal4); for(let i=0;i<6;i++) R(c,x+14+i*2,y+5,2,4,i%2?LP.cran2:'#121216'); },
  (c,x,y,t)=>{ for(let yy=-4;yy<=4;yy++)for(let xx=-4;xx<=4;xx++){ if(xx*xx+yy*yy<=16){ const a=Math.atan2(yy,xx)+t*3; R(c,x+7+xx,y+7+yy*.7|0,1,1,((a*3|0)%2+2)%2?LP.cran2:'#121216'); } } R(c,x+7,y+7,1,1,LP.brass1); });
D('foosball','Foosball table',250000,5,'games','',30,16,'Spinning is legal in this lodge.',(c,x,y)=>{ R(c,x,y+2,30,8,LP.wal5); R(c,x+2,y+3,26,6,'#2a7a45'); for(let i=0;i<6;i++){ R(c,x+4+i*4,y,1,12,'#9fa4ac'); R(c,x+3+i*4,y+4+(i%2)*2,3,2,i%2?'#2b6cb0':LP.cran2); } R(c,x+2,y+10,2,6,LP.wal4); R(c,x+26,y+10,2,6,LP.wal4); });
D('airhockey','Air hockey table',300000,6,'games','',30,14,'Fast hands win.',(c,x,y)=>{ R(c,x,y+2,30,8,'#2b4a7a'); R(c,x+1,y+3,28,6,'#dfeaf0'); R(c,x+15,y+3,1,6,LP.cran2); R(c,x+2,y+10,2,4,'#2a2a30'); R(c,x+26,y+10,2,4,'#2a2a30'); },
  (c,x,y,t)=>{ const px=x+3+Math.round(11*(1+Math.sin(t*2.2))), py=y+4+Math.round(2*(1+Math.sin(t*3.1))); R(c,px,py,2,2,'#121216'); R(c,x+3,y+5,2,2,LP.cran2); R(c,x+25,y+5,2,2,'#2b6cb0'); });
D('pingpong','Ping-pong table',200000,4,'games','',34,14,'Best of three for the TV remote.',(c,x,y)=>{ R(c,x,y+2,34,6,'#1f4a7a'); R(c,x,y+2,34,1,LP.snow2); R(c,x+16,y,2,8,LP.snow2); R(c,x+2,y+8,2,6,'#2a2a30'); R(c,x+30,y+8,2,6,'#2a2a30'); R(c,x+6,y+4,3,2,LP.cran2); R(c,x+25,y+4,3,2,LP.cran2); });
D('cardtable','Card table',220000,5,'games','',26,16,'Poker night, every night.',(c,x,y)=>{ for(let yy=0;yy<9;yy++){ const k=(yy-4)/4.5, w=Math.round(13*Math.sqrt(Math.max(0,1-k*k))); R(c,x+13-w,y+yy,w*2,1,yy===0||yy===8?LP.wal5:'#1f6b3e'); } R(c,x+5,y+3,3,2,LP.cran3); R(c,x+18,y+4,3,2,'#4a7fd0'); R(c,x+11,y+3,4,3,LP.snow2); R(c,x+12,y+9,2,6,LP.wal4); R(c,x+8,y+15,10,1,LP.wal4); });
D('drums','Drum kit',450000,9,'games','',26,18,'Ba-dum-tss.',(c,x,y)=>{ R(c,x+9,y+8,8,8,LP.cran2); R(c,x+11,y+10,4,4,LP.snow2); R(c,x+2,y+8,6,4,'#cfd9e0'); R(c,x+18,y+8,6,4,'#cfd9e0'); R(c,x,y+2,7,1,LP.brass1); R(c,x+19,y,7,1,LP.brass1); R(c,x+3,y+3,1,13,'#8a929e'); R(c,x+22,y+1,1,15,'#8a929e'); R(c,x+9,y+16,8,2,'#2a2a30'); });
D('amp','Guitar & amp',380000,8,'games','',20,22,'Turn it up to eleven.',(c,x,y)=>{ R(c,x,y+10,12,12,'#1c1c22'); R(c,x+2,y+12,8,8,'#3a3a44'); R(c,x+2,y+11,8,1,LP.brass1); R(c,x+15,y,2,10,'#2a1a0e'); R(c,x+13,y+10,6,5,LP.cran2); R(c,x+12,y+14,8,6,LP.cran2); R(c,x+15,y+15,2,2,'#121216'); R(c,x+13,y+20,6,2,'#2a2a30'); });
D('telescope','Brass telescope',320000,7,'games','',16,24,'Spot the northern lights. Or the neighbours.',(c,x,y)=>{ for(let i=0;i<12;i++) R(c,x+2+i,y+8-Math.round(i*.6),2,3,i<4?LP.brass2:LP.brass1); R(c,x+7,y+10,2,3,'#2a2a30'); R(c,x+7,y+13,2,9,'#5a5a64'); R(c,x+3,y+21,10,1,'#5a5a64'); R(c,x+2,y+22,2,2,'#5a5a64'); R(c,x+12,y+22,2,2,'#5a5a64'); });
D('globe','Antique globe',180000,4,'games','',12,20,'Where in the world is your next bet?',(c,x,y)=>{ for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++){ if(xx*xx+yy*yy<=25) R(c,x+6+xx,y+6+yy,1,1,(xx*3+yy*5)%7<2?'#8a6a3a':'#4a7a9a'); } R(c,x,y+6,1,1,LP.brass1); R(c,x+1,y,1,13,LP.brass1); R(c,x+5,y+12,2,6,LP.wal4); R(c,x+2,y+18,8,2,LP.wal4); });
D('aquarium','Aquarium',420000,8,'games','',26,20,'Fish don’t gamble. Smart fish.',(c,x,y)=>{ R(c,x,y,26,14,'#1c1c22'); R(c,x+1,y+1,24,12,'#2a6aa0'); R(c,x+1,y+11,24,2,'#d8c090'); R(c,x+4,y+7,1,4,'#3a8a3a'); R(c,x+20,y+6,1,5,'#3a8a3a'); R(c,x+2,y+14,22,6,LP.wal4); },
  (c,x,y,t)=>{ const f=(o,col,yy,sp)=>{ const px=x+2+Math.round(10*(1+Math.sin(t*sp+o))); R(c,px,y+yy,3,2,col); R(c,px+(Math.cos(t*sp+o)>0?-1:3),y+yy,1,2,col); }; f(0,'#f2b26b',4,.8); f(2,'#e05a7a',8,1.1); f(4,'#ffd24a',6,.6); R(c,x+18,y+2+((t*6|0)%9),1,1,'#bfe4ff'); });
D('punchbag','Punching bag',90000,3,'games','',10,30,'For bad beats.',(c,x,y)=>{ R(c,x+4,y,2,6,'#8a929e'); R(c,x+1,y+6,8,18,LP.cran2); R(c,x+1,y+6,8,2,'#1c1c22'); R(c,x+1,y+22,8,2,'#1c1c22'); R(c,x+2,y+8,1,13,LP.cran3); });
D('weights','Weight rack',150000,4,'games','',24,18,'Lift the chip stacks.',(c,x,y)=>{ R(c,x+2,y,2,18,'#2a2a30'); R(c,x+20,y,2,18,'#2a2a30'); R(c,x,y+16,24,2,'#2a2a30'); for(let i=0;i<3;i++){ R(c,x+3,y+3+i*5,18,1,'#9fa4ac'); R(c,x+5,y+1+i*5,3,5,'#1c1c22'); R(c,x+16,y+1+i*5,3,5,'#1c1c22'); } });
D('tv','Big-screen TV',600000,10,'games','',28,24,'Every game, every channel.',(c,x,y)=>{ R(c,x,y,28,16,'#121216'); R(c,x+12,y+16,4,2,'#2a2a30'); R(c,x+2,y+18,24,6,LP.wal4); R(c,x+4,y+20,8,2,LP.wal3); R(c,x+16,y+20,8,2,LP.wal3); },
  (c,x,y,t)=>{ R(c,x+1,y+1,26,14,'#2a7a45'); for(let i=0;i<26;i+=5) R(c,x+1+i,y+1,1,14,'#3a9a55'); const bx=x+3+Math.round(10*(1+Math.sin(t*.9))); R(c,bx,y+8,2,1,'#7a4a24'); R(c,bx-2,y+6,1,3,LP.cran2); R(c,bx+4,y+9,1,3,'#2b6cb0'); R(c,x+1,y+1,9,3,'#121216'); ptext(c,'4G',x+2,y+1,LP.brass2); });
D('radio','Vintage radio',80000,3,'games','',16,12,'Play-by-play, the old way.',(c,x,y)=>{ R(c,x,y+2,16,10,'#8a5a2a'); for(let i=0;i<6;i++) R(c,x+2+i,y+1+Math.max(0,3-i)*0,1,1,'#8a5a2a'); R(c,x+2,y+4,7,6,'#d8c090'); for(let i=0;i<3;i++) R(c,x+2,y+5+i*2,7,1,'#8a6a3a'); R(c,x+11,y+4,3,3,LP.brass1); R(c,x+11,y+8,3,2,'#f3ead8'); });
D('turntable','Record player',200000,5,'games','',18,16,'Vinyl only. Obviously.',(c,x,y)=>{ R(c,x,y+5,18,4,LP.wal5); R(c,x+1,y+9,2,7,LP.wal4); R(c,x+15,y+9,2,7,LP.wal4); R(c,x+14,y+2,1,4,'#9fa4ac'); },
  (c,x,y,t)=>{ for(let xx=-5;xx<=5;xx++) R(c,x+7+xx,y+4,1,1,'#121216'); R(c,x+7,y+4,1,1,LP.cran2); R(c,x+7+Math.round(4*Math.cos(t*5)),y+4,1,1,'#3a3a44'); });

// ---- Plants & lights ----
const pot=(c,x,y,w,col)=>{ R(c,x,y,w,1,col); R(c,x+1,y+1,w-2,4,col); };
D('fern','Potted fern',40000,1,'plants','',12,18,'Thrives on neglect.',(c,x,y)=>{ for(let i=0;i<6;i++){ R(c,x+5-i,y+2+i,1,1,LP.pine5); R(c,x+6+i,y+2+i,1,1,LP.pine5); R(c,x+5-i+1,y+4+i,1,1,LP.pine4); R(c,x+5+i,y+4+i,1,1,LP.pine4); } R(c,x+5,y,2,12,LP.pine4); pot(c,x+2,y+12,8,'#a0502a'); });
D('cactus','Cactus',30000,1,'plants','',10,18,'Don’t hug it.',(c,x,y)=>{ R(c,x+4,y,3,13,'#3a8a3a'); R(c,x+1,y+4,2,5,'#3a8a3a'); R(c,x+1,y+8,3,1,'#3a8a3a'); R(c,x+7,y+3,2,5,'#3a8a3a'); R(c,x+6,y+7,2,1,'#3a8a3a'); R(c,x+5,y-1,1,1,'#e05a7a'); pot(c,x+1,y+13,8,'#c9782c'); });
D('palm','Potted palm',150000,4,'plants','',18,30,'A little vacation in the corner.',(c,x,y)=>{ R(c,x+8,y+6,2,18,'#8a6a3a'); for(let i=0;i<8;i++){ R(c,x+9+i,y+4+Math.round(i*i*.08),1,2,LP.pine5); R(c,x+8-i,y+4+Math.round(i*i*.08),1,2,LP.pine5); R(c,x+9+Math.round(i*.5),y+5-Math.round(i*.5),1,1,LP.pine4); } pot(c,x+4,y+24,10,'#a0502a'); });
D('bonsai','Bonsai tree',260000,7,'plants','',16,14,'Ninety years old. Very patient.',(c,x,y)=>{ R(c,x+1,y,9,3,LP.pine4); R(c,x+8,y+2,7,3,LP.pine5); R(c,x+6,y+3,2,5,'#6b4a2a'); R(c,x+5,y+6,2,2,'#6b4a2a'); R(c,x+2,y+9,12,1,'#3a3a44'); R(c,x+3,y+10,10,3,'#5a5a64'); });
D('fiddle','Fiddle-leaf fig',120000,3,'plants','',14,26,'Very trendy. Very dramatic.',(c,x,y)=>{ R(c,x+6,y+4,2,16,'#6b4a2a'); for(const [a,b] of [[2,2],[8,0],[1,8],[9,6],[3,13],[8,12]]) { R(c,x+a,y+b,4,3,LP.pine5); R(c,x+a+1,y+b+3,2,1,LP.pine4); } pot(c,x+2,y+20,10,'#f3ead8'); });
D('monstera','Monstera',140000,4,'plants','',18,20,'Big leaves, big energy.',(c,x,y)=>{ for(const [a,b] of [[0,4],[9,0],[4,7],[11,6]]){ R(c,x+a,y+b,7,6,'#2a7a45'); R(c,x+a+2,y+b+2,1,2,'#1a4a2a'); R(c,x+a+4,y+b+3,1,2,'#1a4a2a'); } pot(c,x+4,y+14,10,'#1c1c22'); });
D('vase','Vase of roses',70000,2,'plants','',10,16,'From an admirer. Probably the dealer.',(c,x,y)=>{ for(const [a,b] of [[1,1],[4,0],[7,1],[3,3],[6,3]]) R(c,x+a,y+b,2,2,'#d0303a'); R(c,x+2,y+4,1,4,'#3a8a3a'); R(c,x+5,y+3,1,5,'#3a8a3a'); R(c,x+7,y+4,1,4,'#3a8a3a'); R(c,x+2,y+8,6,8,'#4a9ad0'); R(c,x+3,y+9,1,5,'#9fd0e8'); });
D('sunflowers','Sunflowers',60000,2,'plants','',12,22,'Always facing the winners.',(c,x,y)=>{ for(const [a,b] of [[0,0],[6,3]]){ R(c,x+a,y+b,5,5,'#f2d24b'); R(c,x+a+1,y+b+1,3,3,'#6b3a1f'); R(c,x+a+2,y+b+5,1,10-b,'#3a8a3a'); } pot(c,x+1,y+16,10,'#a0502a'); });
D('floorlamp','Floor lamp',90000,2,'plants','',10,30,'Tall, elegant, plugged in.',(c,x,y)=>{ R(c,x,y,10,7,'#e8d4a8'); R(c,x+1,y+6,8,1,'#c8b088'); R(c,x+4,y+7,2,21,LP.brass1); R(c,x+1,y+28,8,2,LP.brass0); },
  (c,x,y)=>{ c.globalAlpha=.16; R(c,x-3,y+7,16,6,'#ffdca8'); c.globalAlpha=1; });
D('lavalamp','Lava lamp',50000,2,'plants','',6,16,'Groovy.',(c,x,y)=>{ R(c,x+1,y,4,2,'#8a929e'); R(c,x,y+2,6,10,'#6a2a8a'); R(c,x+1,y+12,4,4,'#8a929e'); },
  (c,x,y,t)=>{ R(c,x+1+((t|0)%2),y+3+Math.round(3.5*(1+Math.sin(t*.9))),2,2,'#ff8a3a'); R(c,x+2,y+3+Math.round(3.5*(1+Math.cos(t*.7))),2,2,'#ffb05a'); });
D('candelabra','Candelabra',160000,4,'plants','',12,16,'Three flames for three wins.',(c,x,y)=>{ for(const a of [1,5,9]) R(c,x+a,y+3,2,5,LP.snow2); R(c,x+1,y+8,10,1,LP.brass1); R(c,x+5,y+9,2,5,LP.brass1); R(c,x+3,y+14,6,2,LP.brass0); },
  (c,x,y,t)=>{ for(const [i,a] of [[0,1],[1,5],[2,9]]){ const f=Math.sin(t*9+i*2)>0; R(c,x+a+(f?1:0),y,1,2,LP.emb2); R(c,x+a,y+1,2,2,LP.emb1); } });
D('tiffany','Stained-glass lamp',280000,7,'plants','',12,22,'Colours dance on the ceiling.',(c,x,y)=>{ for(let i=0;i<5;i++) R(c,x+4-i,y+i,4+i*2,1,['#d0303a','#f2d24b','#3a8a3a','#4a7fd0','#c9782c'][i]); R(c,x,y+5,12,2,LP.brass0); R(c,x+5,y+7,2,12,LP.brass0); R(c,x+2,y+19,8,3,LP.brass0); });

// ---- Holiday ----
D('xmastree','Christmas tree',350000,5,'holiday','',24,34,'Decorated by the whole lodge.',(c,x,y)=>{ for(let r=0;r<6;r++){ const w=4+r*3; R(c,x+12-w/2|0,y+4+r*4,w,5,r%2?LP.pine4:LP.pine3); } R(c,x+10,y+28,4,3,LP.wal4); R(c,x+5,y+30,6,4,LP.cran2); R(c,x+14,y+31,6,3,'#2b6cb0'); R(c,x+7,y+30,1,4,LP.brass1); },
  (c,x,y,t)=>{ const cols=['#ff4a4a','#ffd24a','#6ad0ff','#5aff8a']; for(let i=0;i<14;i++){ const r=i%6, px=x+12-(2+r*1.5|0)+((i*7)%(4+r*3)), py=y+6+r*4+(i%2); if(((t*2|0)+i)%3) R(c,px,py,1,1,cols[i%4]); } R(c,x+11,y,3,3,Math.sin(t*4)>0?'#fff3b0':LP.brass1); });
D('snowman','Snowman',80000,2,'holiday','',14,24,'Built indoors. Somehow not melting.',(c,x,y)=>{ const ball=(cx,cy,r)=>{ for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++) if(xx*xx+yy*yy<=r*r) R(c,x+cx+xx,y+cy+yy,1,1,LP.snow2); }; ball(7,18,6); ball(7,10,4); ball(7,4,3); R(c,x+4,y,7,1,'#1c1c22'); R(c,x+5,y-2,5,2,'#1c1c22'); R(c,x+6,y+3,1,1,'#121216'); R(c,x+8,y+3,1,1,'#121216'); R(c,x+9,y+4,2,1,LP.emb1); R(c,x+3,y+7,8,1,LP.cran2); R(c,x+7,y+10,1,1,'#121216'); R(c,x+7,y+13,1,1,'#121216'); });
D('sled','Wooden sled',60000,2,'holiday','',26,8,'Rosebud?',(c,x,y)=>{ R(c,x+2,y+1,20,4,'#c08a4a'); for(let i=0;i<20;i+=4) R(c,x+2+i,y+1,1,4,'#8a5a2a'); R(c,x,y+6,24,1,LP.cran2); R(c,x+24,y+3,2,4,LP.cran2); R(c,x+4,y+5,1,1,LP.cran2); R(c,x+18,y+5,1,1,LP.cran2); });
D('presents','Pile of presents',90000,2,'holiday','',20,12,'Don’t shake them.',(c,x,y)=>{ const box=(a,b,w,h,c1,c2)=>{ R(c,x+a,y+b,w,h,c1); R(c,x+a+w/2-1|0,y+b,2,h,c2); R(c,x+a,y+b+h/2-1|0,w,1,c2); }; box(0,4,8,8,LP.cran2,LP.brass1); box(7,6,7,6,'#2b6cb0',LP.snow2); box(13,3,7,9,LP.pine4,LP.cran3); box(4,0,6,5,'#6a2a8a',LP.brass2); });
D('nutcracker','Nutcracker',120000,3,'holiday','',10,26,'Guards the lodge. Cracks walnuts.',(c,x,y)=>{ R(c,x+3,y,4,4,'#1c1c22'); R(c,x+3,y+4,4,4,'#f0c8a0'); R(c,x+4,y+5,1,1,'#121216'); R(c,x+3,y+7,4,1,LP.snow2); R(c,x+2,y+8,6,7,LP.cran2); R(c,x+2,y+12,6,1,LP.brass1); R(c,x+1,y+8,1,6,LP.cran2); R(c,x+8,y+8,1,6,LP.cran2); R(c,x+3,y+15,2,8,'#1f2d4a'); R(c,x+5,y+15,2,8,'#1f2d4a'); R(c,x+2,y+23,7,3,'#1c1c22'); });
D('reindeer','Reindeer statue',220000,6,'holiday','',22,22,'Rudolph’s understudy.',(c,x,y)=>{ R(c,x+4,y+10,12,6,'#a06a3a'); R(c,x+15,y+5,4,7,'#a06a3a'); R(c,x+16,y+3,5,4,'#a06a3a'); R(c,x+20,y+4,2,2,'#d0303a'); for(const lx of [5,8,12,14]) R(c,x+lx,y+16,1,6,'#6b4a2a'); R(c,x+15,y,1,3,'#e8dcc0'); R(c,x+18,y,1,3,'#e8dcc0'); R(c,x+14,y,2,1,'#e8dcc0'); R(c,x+18,y,2,1,'#e8dcc0'); R(c,x+18,y+4,1,1,'#121216'); });
D('gingerbread','Gingerbread house',100000,3,'holiday','',18,16,'Mostly frosting.',(c,x,y)=>{ for(let i=0;i<7;i++) R(c,x+9-i-1,y+i,(i+1)*2,1,LP.snow2); R(c,x+2,y+7,14,9,'#a0602a'); R(c,x+7,y+10,4,6,'#6b3a1f'); R(c,x+3,y+9,3,3,'#f2d24b'); R(c,x+12,y+9,3,3,'#f2d24b'); for(const a of [3,6,9,12]) R(c,x+a,y+7,1,1,LP.cran3); });

// ---- Treasures & statues ----
D('armor','Suit of armour',900000,14,'treasure','',12,30,'Sir Lancelot lost a bet.',(c,x,y)=>{ R(c,x+3,y,6,6,'#9fa4ac'); R(c,x+4,y+3,4,1,'#121216'); R(c,x+2,y+6,8,10,'#b8c0cc'); R(c,x+5,y+7,2,8,'#8a929e'); R(c,x,y+7,2,8,'#9fa4ac'); R(c,x+10,y+7,2,8,'#9fa4ac'); R(c,x+3,y+16,2,10,'#9fa4ac'); R(c,x+7,y+16,2,10,'#9fa4ac'); R(c,x+1,y+26,10,4,'#5a5a64'); R(c,x+11,y,1,26,'#cfd9e0'); });
D('bearstatue','Carved bear',300000,7,'treasure','',16,24,'Chainsaw art by a local legend.',(c,x,y)=>{ R(c,x+4,y,8,7,'#8a5a2a'); R(c,x+4,y,2,2,'#6b3a1f'); R(c,x+10,y,2,2,'#6b3a1f'); R(c,x+6,y+3,1,1,'#121216'); R(c,x+9,y+3,1,1,'#121216'); R(c,x+7,y+5,2,2,'#4a2a14'); R(c,x+3,y+7,10,11,'#8a5a2a'); R(c,x+1,y+9,3,6,'#7a4a24'); R(c,x+12,y+9,3,6,'#7a4a24'); R(c,x+4,y+18,3,4,'#7a4a24'); R(c,x+9,y+18,3,4,'#7a4a24'); R(c,x+1,y+22,14,2,'#6b4a2a'); });
D('lion','Golden lion statue',3000000,24,'treasure','',18,18,'Roars at every jackpot.',(c,x,y)=>{ R(c,x+1,y,9,9,LP.brass0); R(c,x+3,y+2,5,5,LP.brass1); R(c,x+4,y+3,1,1,'#121216'); R(c,x+6,y+3,1,1,'#121216'); R(c,x+6,y+5,4,7,LP.brass1); R(c,x+9,y+8,8,5,LP.brass1); R(c,x+16,y+5,1,4,LP.brass1); R(c,x+7,y+12,2,3,LP.brass1); R(c,x+14,y+12,2,3,LP.brass1); R(c,x,y+15,18,3,'#5a5a64'); });
D('vault','Bank vault safe',1500000,18,'treasure','',18,20,'Combination: your lucky numbers.',(c,x,y)=>{ R(c,x,y,18,18,'#3a3a44'); R(c,x+1,y+1,16,16,'#5a5a64'); R(c,x+2,y+2,14,14,'#4a4a52'); for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++) if(xx*xx+yy*yy<=9) R(c,x+9+xx,y+9+yy,1,1,'#8a929e'); R(c,x+9,y+6,1,3,'#2a2a30'); R(c,x+14,y+7,1,4,LP.brass1); R(c,x+1,y+18,3,2,'#2a2a30'); R(c,x+14,y+18,3,2,'#2a2a30'); });
D('goldstack','Stack of gold bars',5000000,30,'treasure','',20,12,'Fort Knox called. They’re jealous.',(c,x,y)=>{ const bar=(a,b)=>{ R(c,x+a,y+b,8,4,LP.brass1); R(c,x+a+1,y+b,6,1,LP.brass3); R(c,x+a,y+b+3,8,1,LP.brass0); }; bar(0,8); bar(6,8); bar(12,8); bar(3,4); bar(9,4); bar(6,0); });
D('chest','Treasure chest',700000,11,'treasure','',20,14,'Overflowing. Literally.',(c,x,y)=>{ R(c,x,y+5,20,9,'#6b3a1f'); R(c,x+1,y+1,18,5,'#7a4a24'); R(c,x,y+5,20,1,LP.brass0); R(c,x+3,y+1,2,13,LP.brass0); R(c,x+15,y+1,2,13,LP.brass0); R(c,x+9,y+6,2,3,LP.brass1); for(const a of [2,6,10,14,17]) R(c,x+a,y,2,1,LP.brass2); },
  (c,x,y,t)=>{ if(Math.sin(t*3)>.8) R(c,x+7+((t|0)%5),y,1,1,'#fff3b0'); });
D('grandfather','Grandfather clock',650000,10,'treasure','',12,32,'Chimes on the hour. Every hour.',(c,x,y)=>{ R(c,x+1,y,10,32,LP.wal4); for(let i=0;i<3;i++) R(c,x+3-i,y+i,6+i*2,1,LP.wal5); R(c,x+2,y+3,8,8,'#f3ead8'); R(c,x+6,y+5,1,3,'#121216'); R(c,x+3,y+13,6,15,'#2a1a10'); R(c,x+1,y+30,10,2,LP.wal5); },
  (c,x,y,t)=>{ const sw=Math.round(2*Math.sin(t*3)); R(c,x+6+Math.round(sw/2),y+14,1,8,LP.brass1); R(c,x+5+sw,y+22,3,3,LP.brass1); R(c,x+6+Math.round(1.6*Math.sin(t*.4)),y+7-Math.round(1.6*Math.cos(t*.4)),1,1,LP.cran2); });
D('gumball','Gumball machine',50000,2,'treasure','',10,22,'One quarter, one gumball, one wish.',(c,x,y)=>{ for(let yy=-4;yy<=4;yy++)for(let xx=-4;xx<=4;xx++) if(xx*xx+yy*yy<=16) R(c,x+5+xx,y+5+yy,1,1,'#dfeaf0'); for(const [a,b,col] of [[3,4,'#d0303a'],[6,3,'#f2d24b'],[4,7,'#4a7fd0'],[7,6,'#3a8a3a'],[5,5,'#e05a9a']]) R(c,x+a,y+b,2,2,col); R(c,x+1,y+10,8,6,LP.cran2); R(c,x+4,y+12,2,2,'#9fa4ac'); R(c,x+4,y+16,2,4,LP.cran2); R(c,x+1,y+20,8,2,LP.cran2); });
D('popcorn','Popcorn machine',140000,4,'treasure','',14,24,'Game-day essential.',(c,x,y)=>{ R(c,x,y,14,2,LP.cran2); R(c,x+1,y+2,12,10,'#dfeaf0'); R(c,x+2,y+6,10,6,'#fff3b0'); R(c,x,y+12,14,4,LP.cran2); R(c,x+1,y+16,2,8,LP.cran1); R(c,x+11,y+16,2,8,LP.cran1); R(c,x+3,y+13,8,2,LP.brass1); },
  (c,x,y,t)=>{ for(let i=0;i<4;i++) R(c,x+3+((i*3+(t*7|0))%8),y+3+((i*2+(t*5|0))%4),1,1,'#fffbe8'); });
D('fridge','Mini fridge',60000,2,'treasure','',12,18,'Stocked with cocoa.',(c,x,y)=>{ R(c,x,y,12,18,'#dfe4ea'); R(c,x,y+6,12,1,'#9fa4ac'); R(c,x+9,y+2,1,3,'#8a929e'); R(c,x+9,y+8,1,5,'#8a929e'); R(c,x+2,y+9,4,4,LP.cran2); });
D('vending','Vending machine',350000,7,'treasure','',18,30,'Snacks for the all-nighter.',(c,x,y)=>{ R(c,x,y,18,30,'#2b4a7a'); R(c,x+2,y+2,10,20,'#121226'); for(let r=0;r<4;r++) for(let i=0;i<3;i++) R(c,x+3+i*3,y+3+r*5,2,3,['#d0303a','#f2d24b','#3a8a3a','#e05a9a'][(r+i)%4]); R(c,x+13,y+4,3,6,'#8a929e'); R(c,x+2,y+24,10,3,'#121216'); },
  (c,x,y,t)=>{ R(c,x+13,y+12,3,2,Math.sin(t*2)>0?'#5aff8a':'#2a4a3a'); });
D('hottub','Hot tub',1200000,16,'treasure','',38,16,'Bubbles. Snow outside. Perfection.',(c,x,y)=>{ R(c,x,y+3,38,13,'#8a5a2a'); for(let i=0;i<38;i+=4) R(c,x+i,y+3,1,13,'#6b4a2a'); R(c,x+2,y+4,34,6,'#3ab0d0'); },
  (c,x,y,t)=>{ for(let i=0;i<8;i++){ const k=(t*1.5+i*.37)%1; R(c,x+4+i*4,y+9-Math.round(k*5),1,1,'#dff4ff'); } c.globalAlpha=.3; for(let i=0;i<3;i++) R(c,x+8+i*10+Math.round(Math.sin(t+i)*2),y-1-((t*4+i*3)%4|0),2,2,'#ffffff'); c.globalAlpha=1; });
D('rockinghorse','Rocking horse',110000,3,'treasure','',18,16,'Giddy-up.',(c,x,y)=>{ R(c,x+4,y+5,9,4,'#c08a4a'); R(c,x+12,y,4,6,'#c08a4a'); R(c,x+11,y,2,5,'#6b3a1f'); R(c,x+14,y+1,1,1,'#121216'); R(c,x+2,y+5,2,3,'#6b3a1f'); R(c,x+6,y+4,4,2,LP.cran2); for(const a of [5,11]) R(c,x+a,y+9,1,5,'#8a5a2a'); for(let i=0;i<18;i++) R(c,x+i,y+14+(i<3||i>14?-1:0),1,1,LP.cran2); });

/* ---------- Register everything ---------- */
// Static art is drawn once onto its own little canvas and then just stamped each frame.
function bake(it){
  const base=it.base, anim=it.anim; let cv=null;
  delete it.base; delete it.anim;
  DECOR_ART[it.id]=(c,x,y,t)=>{
    if(!cv){ cv=document.createElement('canvas'); cv.width=it.w+8; cv.height=it.h+8; const g=cv.getContext('2d'); g.imageSmoothingEnabled=false; base(g,4,4); }
    c.drawImage(cv,x-4,y-4); if(anim) anim(c,x,y,t||0);
  };
}
for(const it of W.concat(DEC)){ if(ITEM[it.id]) continue; if(it.cat==='decor') bake(it); ITEMS.push(it); ITEM[it.id]=it; }
// Sub-groups for the original items, so the shop's filters cover them too.
const OLD={decor_antlers:'wall',decor_paint_mtn:'wall',decor_paint_gold:'wall',decor_fireplace:'wall',decor_rug:'rugs',decor_green:'rugs',decor_sofa:'furniture',decor_barcart:'furniture',decor_pool:'games',decor_trophy:'treasure'};
for(const it of ITEMS){ if(it.cat==='decor'&&!it.sub) it.sub=OLD[it.id]||'furniture'; if(it.cat==='clothes'&&!it.sub) it.sub=it.slot; }

// Carried items drawn from grids.
const _drawGear=drawGear;
drawGear=function(x,gear,frame){ _drawGear(x,gear,frame); const a=ITEM[gear.acc]; if(a&&a.grid) pg(x,0,0,a.grid,a.pal); };
})();

/* ---------- A bigger shop needs filters ---------- */
const SHOP_SUBS={
  clothes:[['all','All'],['body','Coats'],['hat','Hats'],['glasses','Face'],['scarf','Scarves'],['watch','Watches']],
  decor:[['all','All'],['furniture','Furniture'],['wall','Wall'],['rugs','Rugs'],['games','Games'],['plants','Plants & lights'],['holiday','Holiday'],['treasure','Treasures']],
};
SHOP.sub='all';
// The item list Silas shows: the current tab, the chosen filter, cheapest-and-lowest-level first.
function shopList(){
  const subs=SHOP_SUBS[SHOP.tab], sub=subs&&SHOP.sub!=='all'?SHOP.sub:null;
  return ITEMS.filter(i=>i.cat===SHOP.tab&&!i.free&&(!sub||i.sub===sub)).sort((a,b)=>a.lvl-b.lvl||a.price-b.price);
}
const _renderShop=renderShop;
renderShop=function(){
  _renderShop();
  const box=LODGE.el&&LODGE.el.querySelector('.lg-shop'); if(!box) return;
  const subs=SHOP_SUBS[SHOP.tab];
  if(SHOP.sel||SHOP.tab==='closet') return;
  // Re-list in sorted order with the filter applied.
  const grid=box.querySelector('.lg-grid'); if(!grid) return;
  const lv=myLevel(), list=shopList();
  grid.innerHTML=list.map(i=>{const mine=owns(i.id),wearing=i.slot&&(S.lodge.outfit||{})[i.slot]===i.id,locked=lv<i.lvl;
    return `<button class="lg-item ${locked?'locked':''} ${wearing?'wearing':''}" data-lg="shopSel" data-id="${i.id}"><span class="lg-ic" data-ic="${i.id}"></span><span class="lg-in">${esc(i.name)}</span><span class="lg-ip">${mine?'OWNED':locked?'LV '+i.lvl:k$(shopPrice(i))}</span></button>`;}).join('')||'<div class="lg-prev-desc">Nothing here yet.</div>';
  grid.querySelectorAll('[data-ic]').forEach(s=>s.appendChild(iconCanvas(ITEM[s.dataset.ic],2)));
  const owned=list.filter(i=>owns(i.id)).length;
  grid.insertAdjacentHTML('beforebegin',`${subs?`<div class="lg-subs">${subs.map(([k,l])=>`<button class="lg-sub ${SHOP.sub===k?'on':''}" data-lg="shopSub" data-v="${k}">${l}</button>`).join('')}</div>`:''}<div class="lg-count">${list.length} items · ${owned} owned</div>`);
  const body=box.querySelector('.lg-shop-body'); if(body&&SHOP.scroll){ body.scrollTop=SHOP.scroll; SHOP.scroll=0; }
};
// Remember the scroll position when you open an item, so Back returns you to the same spot.
const _shopSel=LG_ACT.shopSel;
Object.assign(LG_ACT,{
  shopSub:b=>{ SHOP.sub=b.dataset.v; SHOP.sel=null; SHOP.confirm=false; renderShop(); },
  shopTab:b=>{ SHOP.tab=b.dataset.v; SHOP.sub='all'; SHOP.sel=null; SHOP.confirm=false; renderShop(); },
  shopSel:b=>{ const body=LODGE.el.querySelector('.lg-shop-body'); if(body&&SHOP.tab!=='closet') SHOP.keep=body.scrollTop; _shopSel(b); },
  shopBack:()=>{ SHOP.sel=null; SHOP.confirm=false; SHOP.scroll=SHOP.keep||0; renderShop(); },
});
// Level-ups list a few of the new unlocks instead of all of them.
unlocksBetween=function(a,b){ const n=ITEMS.filter(i=>!i.free&&i.lvl>a&&i.lvl<=b).map(i=>i.name); return n.length>4?n.slice(0,4).concat(['and '+(n.length-4)+' more']):n; };
