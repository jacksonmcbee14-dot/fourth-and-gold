// Start-up: run the models, settle bets, draw the screen
baseModels();
settleBets();
render();
connect();
setInterval(()=>{ if(S.mode==='football'&&(S.ftab==='home'||S.ftab==='bets')&&!SLIP) render(); },60000);
