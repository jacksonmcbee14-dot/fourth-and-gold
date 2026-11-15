// Your saved state (bankroll, bets, settings) and saving it
/* =========================================================
   STATE
   ========================================================= */
const START_BANK = 1_000_000;
const KEY='fg_state_v1';
let S = {bank:START_BANK, bets:[], mode:'football', ftab:'home', ctab:'roulette', lg:'nfl', conf:'NFC', btab:'games', sfF:SF_SCHED.map(()=>'A'), byuF:['A','A'], b12:'auto', utahL:false, ttuL:false, chip:5000, picks:{w:0,l:0}, peak:START_BANK, upd:0, slip:[], slipMode:'single', stake:25000, blg:'all', howto:{}, slotBet:10000, jp:2500000, sound:true, turbo:false};
S.ctab=S.ctab||'slots';
try{ const raw=localStorage.getItem(KEY); if(raw) S=Object.assign(S,JSON.parse(raw)); }catch(e){}
function migrate(){S.bets=(S.bets||[]).map(b=>b.legs?b:{id:b.id,stake:b.stake,pay:b.pay,st:b.st,dec:decOf0(b.odds),legs:[b.fid?{fid:b.fid,odds:b.odds,label:b.label,sub:'Futures'}:{gid:b.gid,m:'ml',s:b.side,odds:b.odds,label:b.label.split(' · ')[0],sub:b.label.split(' · ')[1]||''}]});if(!Array.isArray(S.slip))S.slip=[];if(!S.howto)S.howto={};}
const decOf0=o=>o>0?1+o/100:1+100/(-o);
migrate();
let LIVE = {games:{}, extra:[], futures:{}, records:{}, updated:null, connected:false};
// Everything is saved in this browser's local storage, on this device only.
// (The Claude-artifact version also copied it to your Claude account; that is gone.)
function save(){
  S.upd=Date.now();
  try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){}
}

