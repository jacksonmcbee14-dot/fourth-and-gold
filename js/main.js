// Start-up: run the models, settle bets, draw the screen
applyMyTeams();
baseModels();
settleBets();
render();
connect();
profileStart();
setInterval(()=>{ if(S.mode==='football'&&(S.ftab==='home'||S.ftab==='bets')&&!SLIP) render(); },60000);
