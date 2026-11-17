// 🦝 Steal furniture: after a successful robbery you can carry off one piece of their decor (from any room but the
// vault). It leaves their home and shows up in yours with a "stolen from" tag; they can buy it back from Silas or
// steal it back. The server checks it (supabase/update-23-steal-furniture.sql).

function stealButton(){ return `<button class="btn gold" data-a="stealPick">🦝 Take a piece of furniture too</button>`; }
function stealChoices(d){ const ids=new Set(); const add=a=>(Array.isArray(a)?a:[]).forEach(p=>p&&p.id&&ITEM[p.id]&&ITEM[p.id].cat==='decor'&&!ITEM[p.id].free&&!ITEM[p.id].league&&ids.add(p.id));
  add(d.room); Object.entries(d.rooms||{}).forEach(([r,a])=>{ if(r!=='vault') add(a); }); return [...ids].filter(id=>!owns(id)); }
ACT.stealPick=()=>{ const d=HV.data; if(!d) return; const list=stealChoices(d);
  if(!list.length){ modal(`<div class="fgm-k">Nothing to take</div><p>${esc(d.name)} doesn’t have any furniture out that you don’t already own.</p><div class="fgm-row"><button class="btn" data-a="closeModal">Get out of here</button></div>`); return; }
  modal(`<div class="fgm-k">🦝 Grab one piece — quick!</div><p class="small muted">It leaves ${esc(d.name)}’s home and goes into yours.</p>
    <div class="st-grid">${list.map(id=>`<button class="st-it" data-a="stealGo" data-v="${id}"><span data-stic="${id}"></span><b>${esc(ITEM[id].name)}</b><small>${k$(shopPrice(ITEM[id]))}</small></button>`).join('')}</div>
    <div class="fgm-row"><button class="btn" data-a="closeModal">Leave it</button></div>`);
  document.querySelectorAll('#fgModal [data-stic]').forEach(s=>s.appendChild(iconCanvas(ITEM[s.dataset.stic],1))); };
ACT.stealGo=async el=>{ const d=HV.data, id=el.dataset.v; if(!d||!ITEM[id]) return; el.disabled=true;
  let r=null; try{ r=await srpc('fg_steal_item',{p_name:d.name,p_item:id}); }catch(e){}
  if(!r||r.error){ toast({no_heist:'Too late — the coast isn’t clear any more',not_owned:'They don’t have that any more'}[r&&r.error]||'Couldn’t reach the server','loss'); closeModal(); return; }
  S.lodge.owned=(S.lodge.owned||[]).concat(id); S.lodge.stolen=Object.assign({},S.lodge.stolen,{[id]:{from:d.name,at:Date.now()}}); save();
  try{ fx.coins(40,1400); }catch(e){} tone(523,.08,'square',.05); tone(784,.1,'square',.05,.08);
  celebrate('🦝 Got it!',`You stole ${d.name}’s ${ITEM[id].name}. Place it in your room — it’s tagged as stolen.`,ITEM[id].name,id); };

// Someone stole from you.
function stealInbox(it){ const id=it.item; if(!id||!ITEM[id]) return;
  S.lodge.owned=(S.lodge.owned||[]).filter(x=>x!==id);
  const strip=a=>Array.isArray(a)?a.filter(p=>p.id!==id):a; S.lodge.room=strip(S.lodge.room); if(S.lodge.rooms) for(const k in S.lodge.rooms) S.lodge.rooms[k]=strip(S.lodge.rooms[k]);
  if(S.lodge.tiers) delete S.lodge.tiers[id]; if(S.lodge.paid) delete S.lodge.paid[id]; if(S.lodge.stolen) delete S.lodge.stolen[id];
  S.lodge.lost=Object.assign({},S.lodge.lost,{[id]:{by:it.label,at:Date.now()}}); save();
  celebrate('🚨 '+it.label+' stole your '+ITEM[id].name+'!','Buy it back from Silas, or visit '+it.label+' and steal it back.','Revenge?',id); }

// Tags: stolen pieces get a little red tag in the room; the shop says where it came from.
let STOLEN_FOR;
for(const id of Object.keys(DECOR_ART)){ const f=DECOR_ART[id], it=ITEM[id];
  DECOR_ART[id]=function(c,x,y,t){ f(c,x,y,t); if(!it) return; const m=STOLEN_FOR!==undefined?STOLEN_FOR:(t?S.lodge.stolen:null); if(!m||!m[id]) return;
    const tx=x+(it.w||12)-3, ty=y-4; c.fillStyle='#e0203a'; c.fillRect(tx,ty,4,3); c.fillStyle='#ffffff'; c.fillRect(tx+1,ty+1,1,1); c.fillStyle='#8a929e'; c.fillRect(tx-1,ty+1,1,1); }; }
const _drawFriendRoomS=drawFriendRoom;
drawFriendRoom=function(cv,d){ STOLEN_FOR=(d&&d.stolen)||{}; try{ _drawFriendRoomS(cv,d); }finally{ STOLEN_FOR=undefined; } };
const _renderShopS=renderShop;
renderShop=function(){ _renderShopS(); const it=SHOP.sel&&ITEM[SHOP.sel]; if(!it||SHOP.confirm) return; const row=LODGE.el&&LODGE.el.querySelector('.lg-shop .lg-prev .lg-prev-name'); if(!row) return;
  const st=S.lodge.stolen&&S.lodge.stolen[it.id], lost=!owns(it.id)&&S.lodge.lost&&S.lodge.lost[it.id];
  if(st) row.insertAdjacentHTML('afterend',`<div class="lg-prev-desc" style="color:#ff6a6a">🦝 Stolen from ${esc(st.from)}</div>`);
  else if(lost) row.insertAdjacentHTML('afterend',`<div class="lg-prev-desc" style="color:#ff6a6a">🚨 ${esc(lost.by)} stole yours — buy it back, or steal it back</div>`); };
