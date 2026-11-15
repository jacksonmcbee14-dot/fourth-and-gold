// Seasons: the lodge, the golf course and the featured sport change with the calendar.
// Holiday (Nov 15 – Dec 31) is the Christmas look. After that it's plain winter, then spring (golf),
// summer and fall. To preview another season add ?season=spring (or holiday, winter, summer, fall) to the address.

const SEASONS={
  holiday:{name:'Holiday',  xmas:1, snow:1, sport:'football',   course:'Candy Cane Links', sky:'#0a1420', fall:'#f3ead8', tagline:'Snow on the greens, cocoa at the turn.'},
  winter: {name:'Winter',   xmas:0, snow:1, sport:'football',   course:'Frostbite Pines',  sky:'#0a1420', fall:'#f3ead8', tagline:'Playoff football and frozen fairways.'},
  spring: {name:'Spring',   xmas:0, snow:0, sport:'basketball', course:'Blossom Valley',   sky:'#1d2f52', fall:'#f2b8c8', tagline:'Blossoms, birdies and March Madness.'},
  summer: {name:'Summer',   xmas:0, snow:0, sport:'golf',       course:'Sunset Dunes',     sky:'#2a2448', fall:'#ffe9a8', tagline:'Long days on the links.'},
  fall:   {name:'Fall',     xmas:0, snow:0, sport:'football',   course:'Harvest Hollow',   sky:'#1a1830', fall:'#e8963c', tagline:'Kickoff season. Leaves on the fairway.'},
};
function seasonFor(d){
  const m=d.getMonth()+1, day=d.getDate();
  if((m===11&&day>=15)||m===12) return 'holiday';
  if(m<=2) return 'winter';
  if(m<=5) return 'spring';
  if(m<=8) return 'summer';
  return 'fall';
}
const SEASON_ID=(()=>{ try{ const q=new URLSearchParams(location.search).get('season'); if(q&&SEASONS[q]) return q; }catch(e){} return seasonFor(new Date()); })();
const SEASON=Object.assign({id:SEASON_ID},SEASONS[SEASON_ID]);
document.documentElement.dataset.season=SEASON.id;
