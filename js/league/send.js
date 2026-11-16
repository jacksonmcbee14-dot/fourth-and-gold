// 💸 Send money to another player: from their lodge (visit them from the leaderboard), tap "Send money".
// The server checks you have it and delivers it to their inbox (supabase/update-20-send-money.sql). It arrives as a
// gift, so it doesn't count toward their league score.

function sendBlock(d){ return d&&!d.me?`<button class="btn wide hv-send" data-a="sendMoney">💸 Send ${esc(d.name)} money</button>`:''; }
const _visitDrawS=visitDraw;
visitDraw=function(){ _visitDrawS(); const d=HV.data, at=document.querySelector('#fgModal .hv-stats'); if(!d||!at) return; const h=sendBlock(d); if(h) at.insertAdjacentHTML('afterend',h); };

ACT.sendMoney=()=>{ const d=HV.data; if(!d) return;
  if(!(typeof socOn==='function'&&socOn())){ toast('Make a profile first','loss'); return; }
  askAmount({title:'Send '+d.name+' money',value:Math.min(S.bank,100000),max:Math.max(0,S.bank),note:'It goes straight to their bankroll',
    onSet:async v=>{ v=Math.floor(v); if(!(v>0)) return visitDraw();
      if(!confirm(`Send ${fmt$(v)} to ${d.name}? This can’t be undone.`)) return visitDraw();
      let r=null; try{ if(typeof cloudPush==='function') await cloudPush(); r=await srpc('fg_send',{p_name:d.name,p_amount:v}); }catch(e){}
      if(!r||r.error){ toast({too_much:'You don’t have that much saved yet — try again in a moment',no_player:'Couldn’t find them',bad_amount:'Pick an amount'}[r&&r.error]||'Couldn’t reach the server','loss'); return visitDraw(); }
      setBank(-v); save(); try{ fx.coins(40,1400); }catch(e){} tone(784,.08,'square',.05); tone(1047,.1,'square',.05,.08);
      toast(`💸 Sent ${fmt$(v)} to ${d.name}`,'gold'); visitDraw(); },
    onCancel:()=>visitDraw()}); };

// Money someone sent you.
function moneyInbox(it){ addGift(it.amount); try{ fx.coins(80,2200); }catch(e){} celebrate('💸 Money from '+it.label,`${it.label} sent you money.`,'+'+fmt$(it.amount)); }
