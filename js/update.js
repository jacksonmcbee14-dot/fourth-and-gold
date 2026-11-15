// Auto-update: phones keep a saved copy of the page, so after a new version is published they can keep
// showing the old one. Each time the app opens or comes back on screen, this asks the server for the
// current page (skipping every cache) and compares its version tag (set by tools/stamp-version.py)
// with the one running. If they differ, the app reloads itself into the new version.

(()=>{
  const mine=(document.querySelector('script[src*="?v="]')||{}).src, ver=mine&&(mine.match(/\?v=(\d+)/)||[])[1];
  // after an update reload, tidy the address bar
  try{ const q=new URLSearchParams(location.search); if(q.has('u')){ q.delete('u'); history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash); } }catch(e){}
  if(!ver) return;
  let busy=false, last=0;
  async function check(){
    if(busy||Date.now()-last<20e3||!navigator.onLine) return; busy=true; last=Date.now();
    try{
      const r=await fetch(location.pathname+'?nocache='+Date.now(),{cache:'no-store'}); if(!r.ok) throw 0;
      const live=((await r.text()).match(/\?v=(\d+)/)||[])[1];
      if(live&&live!==ver&&+live>+ver){
        if(typeof toast==='function') toast('Updating to the newest version…','gold');
        if(typeof save==='function') try{ save(); }catch(e){}
        const q=new URLSearchParams(location.search); q.set('u',live);
        setTimeout(()=>location.replace(location.pathname+'?'+q+location.hash),700);
        return;
      }
    }catch(e){}
    busy=false;
  }
  setTimeout(check,1500);
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) check(); });
  addEventListener('focus',check);
})();
