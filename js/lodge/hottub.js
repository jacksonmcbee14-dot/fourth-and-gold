// ♨️ Hot tubs are for everyone (supabase/update-18-hot-tubs.sql).
//  • Visit someone who owns a hot tub and tap "Get in": +10% XP for 30 minutes, once a day per friend's tub.
//  • Hot tub party: when two friends are in the same tub within an hour, everyone in it gets +20%; three or more, +30%.
//  • The owner gets 50 XP each time a friend gets in.
// (Owning a hot tub still gives the owner their own +10% XP from everything: js/perks.js.)

const TUB_MS=30*60e3;
const tubPct=()=>S.tub&&S.tub.until>Date.now()?S.tub.pct:0;
const tubPartyPct=n=>n>=3?.3:n>=2?.2:.1;
const _gainXPT=gainXP;
gainXP=function(n,why,capped){ const p=tubPct(); return _gainXPT(n>0&&p?Math.round(n*(1+p)):n,why,capped); };

function tubBlock(d){
  if(!d.has_tub||d.me) return '';
  const now=d.tub_now||[], p=tubPartyPct(now.length+(d.soaked_today?0:1));
  return `<div class="hv-tub"><div><b>♨️ ${esc(d.name)} has a hot tub</b><small>${now.length?esc(now.join(', '))+' '+(now.length>1?'are':'is')+' in it now':'Nobody in it right now'}</small></div>
    ${d.soaked_today?'<span class="hv-tub-done">You’ve soaked here today</span>':`<button class="btn gold" data-a="tubSoak">Get in · +${Math.round(p*100)}% XP</button>`}</div>`;
}
const _visitDrawT=visitDraw;
visitDraw=function(){ _visitDrawT(); const d=HV.data, at=document.querySelector('#fgModal .hv-stats'); if(!d||!at) return; const html=tubBlock(d); if(html) at.insertAdjacentHTML('afterend',html); };

ACT.tubSoak=async el=>{
  const d=HV.data; if(!d) return; el.disabled=true;
  let r=null; try{ r=await srpc('fg_soak',{p_name:d.name}); }catch(e){}
  if(!r||r.error){ el.disabled=false; toast({already:'You’ve already soaked here today',no_tub:'They don’t have a hot tub any more'}[r&&r.error]||'Couldn’t reach the server','loss'); return; }
  const pct=tubPartyPct(r.party||1); S.tub={until:Date.now()+TUB_MS,pct,host:d.name}; save();
  try{ fx.burst(innerWidth/2,innerHeight/2,50,'#bff6ff'); }catch(e){} [523,659,784].forEach((f,i)=>tone(f,.1,'triangle',.05,i*.08));
  d.soaked_today=true; d.tub_now=r.names||d.tub_now;
  celebrate(r.party>=2?'♨️ Hot tub party!':'♨️ Ahhh…',r.party>=2?`${(r.names||[]).join(', ')} are in ${d.name}’s tub together.`:`You’re soaking in ${d.name}’s hot tub.`,`+${Math.round(pct*100)}% XP for 30 minutes`);
};

// Inbox: someone got in your tub, or more friends joined the tub you're in.
function tubInbox(it){
  if(it.kind==='tub_guest'){ gainXP(50,'Hot tub guest',false); toast(`♨️ ${it.label} got in your hot tub${it.amount>=2?' — it’s a party of '+it.amount+'!':''} · +50 XP`,'gold'); }
  else if(it.kind==='tub_party'){ const pct=tubPartyPct(it.amount||2);
    if(!S.tub||S.tub.pct<pct||S.tub.until<Date.now()) S.tub={until:Date.now()+TUB_MS,pct,host:it.label}; else S.tub.until=Date.now()+TUB_MS;
    save(); toast(`♨️ Hot tub party at ${it.label}’s! ${it.amount} in the tub · +${Math.round(pct*100)}% XP for 30 min`,'gold'); }
}
