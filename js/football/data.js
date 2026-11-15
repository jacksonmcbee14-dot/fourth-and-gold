// Football data snapshot: NFL teams, seeds, schedules, college Top 25, games, futures
/* =========================================================
   DATA — snapshot as of Sat Nov 14, 2026 (live layer overrides)
   ========================================================= */
const NFL = {
  BUF:{n:'Bills',c:'Buffalo',conf:'AFC',div:'East',w:7,l:1,col:'#00338D',sb:600},
  NE:{n:'Patriots',c:'New England',conf:'AFC',div:'East',w:5,l:4,col:'#0B2240',sb:2700},
  NYJ:{n:'Jets',c:'New York',conf:'AFC',div:'East',w:2,l:7,col:'#125740',sb:100000},
  MIA:{n:'Dolphins',c:'Miami',conf:'AFC',div:'East',w:1,l:7,col:'#008E97',sb:100000},
  PIT:{n:'Steelers',c:'Pittsburgh',conf:'AFC',div:'North',w:6,l:2,col:'#C79A16',sb:4000},
  CIN:{n:'Bengals',c:'Cincinnati',conf:'AFC',div:'North',w:6,l:2,col:'#FB4F14',sb:1300},
  CLE:{n:'Browns',c:'Cleveland',conf:'AFC',div:'North',w:5,l:4,col:'#4a2a10',sb:22500},
  BAL:{n:'Ravens',c:'Baltimore',conf:'AFC',div:'North',w:4,l:5,col:'#241773',sb:15000},
  JAX:{n:'Jaguars',c:'Jacksonville',conf:'AFC',div:'South',w:6,l:2,col:'#006778',sb:850},
  HOU:{n:'Texans',c:'Houston',conf:'AFC',div:'South',w:3,l:5,col:'#03202F',sb:3500},
  IND:{n:'Colts',c:'Indianapolis',conf:'AFC',div:'South',w:2,l:6,col:'#002C5F',sb:100000},
  TEN:{n:'Titans',c:'Tennessee',conf:'AFC',div:'South',w:1,l:7,col:'#4B92DB',sb:100000},
  DEN:{n:'Broncos',c:'Denver',conf:'AFC',div:'West',w:7,l:2,col:'#FB4F14',sb:1700},
  KC:{n:'Chiefs',c:'Kansas City',conf:'AFC',div:'West',w:6,l:2,col:'#E31837',sb:1200},
  LV:{n:'Raiders',c:'Las Vegas',conf:'AFC',div:'West',w:4,l:5,col:'#555b61',sb:17500},
  LAC:{n:'Chargers',c:'Los Angeles',conf:'AFC',div:'West',w:0,l:8,col:'#0080C6',sb:100000},
  NYG:{n:'Giants',c:'New York',conf:'NFC',div:'East',w:5,l:3,t:1,col:'#0B2265',sb:6500},
  DAL:{n:'Cowboys',c:'Dallas',conf:'NFC',div:'East',w:4,l:5,col:'#003594',sb:5500},
  WAS:{n:'Commanders',c:'Washington',conf:'NFC',div:'East',w:3,l:5,t:1,col:'#5A1414',sb:12500},
  PHI:{n:'Eagles',c:'Philadelphia',conf:'NFC',div:'East',w:2,l:7,col:'#004C54',sb:100000},
  CHI:{n:'Bears',c:'Chicago',conf:'NFC',div:'North',w:7,l:2,col:'#C83803',sb:800},
  DET:{n:'Lions',c:'Detroit',conf:'NFC',div:'North',w:6,l:2,col:'#0076B6',sb:1500},
  MIN:{n:'Vikings',c:'Minnesota',conf:'NFC',div:'North',w:6,l:2,col:'#4F2683',sb:2500},
  GB:{n:'Packers',c:'Green Bay',conf:'NFC',div:'North',w:6,l:3,col:'#203731',sb:2000},
  CAR:{n:'Panthers',c:'Carolina',conf:'NFC',div:'South',w:3,l:5,col:'#0085CA',sb:8000},
  NO:{n:'Saints',c:'New Orleans',conf:'NFC',div:'South',w:3,l:5,col:'#9c8656',sb:12500},
  TB:{n:'Buccaneers',c:'Tampa Bay',conf:'NFC',div:'South',w:3,l:6,col:'#D50A0A',sb:6000},
  ATL:{n:'Falcons',c:'Atlanta',conf:'NFC',div:'South',w:3,l:6,col:'#A71930',sb:10000},
  SF:{n:'49ers',c:'San Francisco',conf:'NFC',div:'West',w:7,l:1,col:'#AA0000',sb:600},
  SEA:{n:'Seahawks',c:'Seattle',conf:'NFC',div:'West',w:5,l:4,col:'#3d7a1c',sb:1500},
  LAR:{n:'Rams',c:'Los Angeles',conf:'NFC',div:'West',w:5,l:4,col:'#003594',sb:1300},
  ARI:{n:'Cardinals',c:'Arizona',conf:'NFC',div:'West',w:3,l:6,col:'#97233F',sb:100000},
};
// Current seeds (published playoff picture after Week 9)
const SEEDS = {
  NFC:['SF','CHI','NYG','CAR','DET','MIN','GB'], NFC_hunt:['SEA','LAR','DAL'],
  AFC:['BUF','DEN','JAX','PIT','KC','CIN','NE'], AFC_hunt:['CLE','LV','BAL'],
};
// 49ers remaining schedule
const SF_SCHED = [
  {wk:10,o:'DAL',loc:'away',t:'2026-11-15T21:25:00Z',tv:'FOX',venue:'AT&T Stadium'},
  {wk:11,o:'MIN',loc:'neutral',t:'2026-11-23T01:20:00Z',tv:'NBC',venue:'Mexico City'},
  {wk:12,o:'SEA',loc:'home',t:'2026-11-29T21:25:00Z',tv:'FOX',venue:"Levi's Stadium"},
  {wk:13,o:'NYG',loc:'away',t:'2026-12-06T18:00:00Z',tv:'FOX',venue:'MetLife Stadium'},
  {wk:14,o:'LAR',loc:'home',t:'2026-12-13T21:25:00Z',tv:'',venue:"Levi's Stadium"},
  {wk:15,o:'LAC',loc:'away',t:'2026-12-18T01:15:00Z',tv:'Prime',venue:'SoFi Stadium'},
  {wk:16,o:'KC',loc:'away',t:'2026-12-27T21:25:00Z',tv:'',venue:'Arrowhead'},
  {wk:17,o:'PHI',loc:'home',t:'2027-01-04T01:20:00Z',tv:'NBC',venue:"Levi's Stadium"},
  {wk:18,o:'ARI',loc:'away',t:'2027-01-10T21:25:00Z',tv:'',venue:'State Farm Stadium',tba:1},
];
// College: CFP committee top 25 (Nov 10), records updated with Nov 14 finals where known
const CFB = [
  {r:1,n:'Georgia',ab:'UGA',cf:'SEC',w:9,l:1,col:'#BA0C2F'},
  {r:2,n:'Utah',ab:'UTAH',cf:'Big 12',w:9,l:0,col:'#CC0000',rem:3},
  {r:3,n:'Alabama',ab:'ALA',cf:'SEC',w:8,l:2,col:'#9E1B32'},
  {r:4,n:'UCLA',ab:'UCLA',cf:'Big Ten',w:10,l:0,col:'#2D68C4'},
  {r:5,n:'Notre Dame',ab:'ND',cf:'Ind',w:9,l:1,col:'#0C2340'},
  {r:6,n:'Texas',ab:'TEX',cf:'SEC',w:7,l:2,col:'#BF5700'},
  {r:7,n:'Miami',ab:'MIA',cf:'ACC',w:8,l:1,col:'#F47321'},
  {r:8,n:'Tennessee',ab:'TENN',cf:'SEC',w:8,l:2,col:'#FF8200'},
  {r:9,n:'Indiana',ab:'IND',cf:'Big Ten',w:9,l:1,col:'#990000'},
  {r:10,n:'BYU',ab:'BYU',cf:'Big 12',w:8,l:2,col:'#002E5D',me:1},
  {r:11,n:'Kentucky',ab:'UK',cf:'SEC',w:7,l:2,col:'#0033A0'},
  {r:12,n:'Texas Tech',ab:'TTU',cf:'Big 12',w:8,l:1,col:'#CC0000'},
  {r:13,n:'Wake Forest',ab:'WAKE',cf:'ACC',w:8,l:1,col:'#9E7E38'},
  {r:14,n:'Houston',ab:'HOU',cf:'Big 12',w:7,l:2,col:'#C8102E'},
  {r:15,n:'Iowa',ab:'IOWA',cf:'Big Ten',w:7,l:2,col:'#b8920f'},
  {r:16,n:'Oregon',ab:'ORE',cf:'Big Ten',w:6,l:3,col:'#154733'},
  {r:17,n:'South Carolina',ab:'SC',cf:'SEC',w:6,l:3,col:'#73000A'},
  {r:18,n:'USC',ab:'USC',cf:'Big Ten',w:7,l:3,col:'#990000'},
  {r:19,n:'Ole Miss',ab:'MISS',cf:'SEC',w:6,l:3,col:'#14213D'},
  {r:20,n:'Ohio State',ab:'OSU',cf:'Big Ten',w:6,l:3,col:'#BB0000'},
  {r:21,n:'LSU',ab:'LSU',cf:'SEC',w:6,l:3,col:'#461D7C'},
  {r:22,n:'Missouri',ab:'MIZ',cf:'SEC',w:6,l:4,col:'#a8862c'},
  {r:23,n:'Arizona',ab:'ARIZ',cf:'Big 12',w:7,l:2,col:'#003366'},
  {r:24,n:'Boise State',ab:'BSU',cf:'Pac-12',w:8,l:1,col:'#0033A0'},
  {r:25,n:'Oklahoma State',ab:'OKST',cf:'Big 12',w:6,l:3,col:'#FF7300'},
];
const BYU_SCHED = [
  {o:'Kansas',ab:'KU',loc:'away',t:'2026-11-21T20:00:00Z',tba:1,p:.78,col:'#0051BA'},
  {o:'Cincinnati',ab:'CIN',loc:'home',t:'2026-11-28T20:00:00Z',tba:1,p:.80,col:'#E00122'},
];
const T = (ab,name,col,rank)=>({ab,name,col,rank});
const nt = k=>T(k,NFL[k].n,NFL[k].col);
const GAMES = [
  // NFL Week 10
  {id:'n1',lg:'nfl',wk:'Week 10',a:nt('WAS'),h:nt('NYG'),t:'2026-11-13T01:15:00Z',tv:'Prime',s:'final',as:24,hs:21},
  {id:'n2',lg:'nfl',wk:'Week 10',a:nt('NE'),h:nt('DET'),t:'2026-11-15T14:30:00Z',tv:'FOX',neutral:'Munich'},
  {id:'n3',lg:'nfl',wk:'Week 10',a:nt('KC'),h:nt('ATL'),t:'2026-11-15T18:00:00Z',tv:'CBS'},
  {id:'n4',lg:'nfl',wk:'Week 10',a:nt('HOU'),h:nt('CLE'),t:'2026-11-15T18:00:00Z',tv:'FOX'},
  {id:'n5',lg:'nfl',wk:'Week 10',a:nt('MIN'),h:nt('GB'),t:'2026-11-15T18:00:00Z',tv:'FOX'},
  {id:'n6',lg:'nfl',wk:'Week 10',a:nt('JAX'),h:nt('TEN'),t:'2026-11-15T18:00:00Z',tv:'CBS'},
  {id:'n7',lg:'nfl',wk:'Week 10',a:nt('MIA'),h:nt('IND'),t:'2026-11-15T18:00:00Z',tv:'CBS'},
  {id:'n8',lg:'nfl',wk:'Week 10',a:nt('CAR'),h:nt('NO'),t:'2026-11-15T18:00:00Z',tv:'FOX'},
  {id:'n9',lg:'nfl',wk:'Week 10',a:nt('BUF'),h:nt('NYJ'),t:'2026-11-15T18:00:00Z',tv:'CBS'},
  {id:'n10',lg:'nfl',wk:'Week 10',a:nt('SEA'),h:nt('LV'),t:'2026-11-15T21:05:00Z',tv:'CBS'},
  {id:'n11',lg:'nfl',wk:'Week 10',a:nt('LAR'),h:nt('ARI'),t:'2026-11-15T21:05:00Z',tv:'CBS'},
  {id:'n12',lg:'nfl',wk:'Week 10',a:nt('SF'),h:nt('DAL'),t:'2026-11-15T21:25:00Z',tv:'FOX',mine:1},
  {id:'n13',lg:'nfl',wk:'Week 10',a:nt('PIT'),h:nt('CIN'),t:'2026-11-16T01:20:00Z',tv:'NBC'},
  {id:'n14',lg:'nfl',wk:'Week 10',a:nt('LAC'),h:nt('BAL'),t:'2026-11-17T01:15:00Z',tv:'ESPN'},
  {id:'n15',lg:'nfl',wk:'Week 11',a:nt('IND'),h:nt('HOU'),t:'2026-11-20T01:15:00Z',tv:'Prime'},
  {id:'n16',lg:'nfl',wk:'Week 11',a:nt('MIA'),h:nt('BUF'),t:'2026-11-22T18:00:00Z',tv:'FOX'},
  {id:'n17',lg:'nfl',wk:'Week 11',a:nt('MIN'),h:nt('SF'),t:'2026-11-23T01:20:00Z',tv:'NBC',neutral:'Mexico City',mine:1},
  // College — Saturday Nov 14
  {id:'c1',lg:'cfb',wk:'Week 11',a:T('BAY','Baylor','#154734'),h:T('BYU','BYU','#002E5D',10),t:'2026-11-14T21:30:00Z',tv:'FOX',s:'final',as:7,hs:28,mine:1},
  {id:'c2',lg:'cfb',wk:'Week 11',a:T('MIZ','Missouri','#a8862c',22),h:T('UGA','Georgia','#BA0C2F',1),t:'2026-11-14T20:30:00Z',tv:'',s:'final',as:21,hs:48},
  {id:'c3',lg:'cfb',wk:'Week 11',a:T('ALA','Alabama','#9E1B32',3),h:T('VAN','Vanderbilt','#866D4B'),t:'2026-11-14T17:00:00Z',tv:'',s:'final',as:21,hs:6},
  {id:'c4',lg:'cfb',wk:'Week 11',a:T('ILL','Illinois','#E84A27'),h:T('UCLA','UCLA','#2D68C4',4),t:'2026-11-14T20:30:00Z',tv:'',s:'final',as:14,hs:22},
  {id:'c5',lg:'cfb',wk:'Week 11',a:T('UTAH','Utah','#CC0000',2),h:T('ARIZ','Arizona','#003366',23),t:'2026-11-15T03:30:00Z',tv:'FOX',p:.47,total:53.5},
  {id:'c10',lg:'cfb',wk:'Week 11',a:T('USC','USC','#990000',18),h:T('IND','Indiana','#990000',9),t:'2026-11-14T20:30:00Z',tv:'',s:'final',as:13,hs:27},
  {id:'c11',lg:'cfb',wk:'Week 11',a:T('BC','Boston College','#98002E'),h:T('ND','Notre Dame','#0C2340',5),t:'2026-11-14T20:30:00Z',tv:'NBC',s:'final',as:7,hs:41},
  {id:'c12',lg:'cfb',wk:'Week 11',a:T('TENN','Tennessee','#FF8200',8),h:T('TAMU','Texas A&M','#500000'),t:'2026-11-14T20:30:00Z',tv:'',s:'final',as:22,hs:7},
  {id:'c13',lg:'cfb',wk:'Week 12',a:T('ISU','Iowa State','#C8102E'),h:T('UCF','UCF','#BA9B37'),t:'2026-11-20T23:00:00Z',tv:'FS1',p:.52},
  {id:'c14',lg:'cfb',wk:'Week 12',a:T('CLEM','Clemson','#F56600'),h:T('DUKE','Duke','#003087'),t:'2026-11-21T00:30:00Z',tv:'ESPN',p:.48},
  {id:'c15',lg:'cfb',wk:'Week 12',a:T('TAMU','Texas A&M','#500000'),h:T('OU','Oklahoma','#841617'),t:'2026-11-21T17:00:00Z',tv:'',p:.63},
  {id:'c16',lg:'cfb',wk:'Week 12',a:T('VAN','Vanderbilt','#866D4B'),h:T('UF','Florida','#0021A5'),t:'2026-11-21T17:00:00Z',tv:'',p:.55},
  {id:'c17',lg:'cfb',wk:'Week 12',a:T('NCST','NC State','#CC0000'),h:T('FSU','Florida State','#782F40'),t:'2026-11-21T20:30:00Z',tv:'ACCN',p:.56},
  {id:'c18',lg:'cfb',wk:'Week 12',a:T('SMU','SMU','#0033A0'),h:T('ND','Notre Dame','#0C2340',5),t:'2026-11-22T00:30:00Z',tv:'NBC',p:.86},
  {id:'c19',lg:'cfb',wk:'Week 12',a:T('SDSU','San Diego State','#A6192E'),h:T('BSU','Boise State','#0033A0',24),t:'2026-11-22T02:30:00Z',tv:'USA',p:.82},
  {id:'c20',lg:'cfb',wk:'Week 12',a:T('IND','Indiana','#990000',9),h:T('WASH','Washington','#4B2E83'),t:'2026-11-21T20:00:00Z',tba:1,p:.27},
  {id:'c21',lg:'cfb',wk:'Week 12',a:T('MD','Maryland','#E03A3E'),h:T('USC','USC','#990000',18),t:'2026-11-21T20:00:00Z',tba:1,p:.80},
  // College — Saturday Nov 21 (kickoff times TBA)
  {id:'c6',lg:'cfb',wk:'Week 12',a:T('BYU','BYU','#002E5D',10),h:T('KU','Kansas','#0051BA'),t:'2026-11-21T20:00:00Z',tba:1,p:.22,mine:1},
  {id:'c7',lg:'cfb',wk:'Week 12',a:T('TTU','Texas Tech','#CC0000',12),h:T('BAY','Baylor','#154734'),t:'2026-11-21T20:00:00Z',tba:1,p:.40},
  {id:'c8',lg:'cfb',wk:'Week 12',a:T('ARK','Arkansas','#9D2235'),h:T('TEX','Texas','#BF5700',6),t:'2026-11-21T20:00:00Z',tba:1,p:.80},
  {id:'c9',lg:'cfb',wk:'Week 12',a:T('UTC','Chattanooga','#00386B'),h:T('ALA','Alabama','#9E1B32',3),t:'2026-11-21T19:00:00Z',p:.985},
];
// Futures (prices from published Super Bowl odds; CFP lines priced from the in-app model)
const FUTURES_NFL = [
  {id:'f_sb_sf',label:'49ers win Super Bowl LXI',odds:600,mine:1},
  {id:'f_sb_buf',label:'Bills win Super Bowl LXI',odds:600},
  {id:'f_sb_chi',label:'Bears win Super Bowl LXI',odds:800},
  {id:'f_sb_jax',label:'Jaguars win Super Bowl LXI',odds:850},
  {id:'f_sb_kc',label:'Chiefs win Super Bowl LXI',odds:1200},
  {id:'f_sb_lar',label:'Rams win Super Bowl LXI',odds:1300},
];

