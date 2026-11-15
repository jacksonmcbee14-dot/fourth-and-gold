// Start-up: run the models, settle bets, draw the screen
dailyTopUp();
applyMyTeams();
baseModels();
settleBets();
render();
connect();
lodgeStart();
xpDaily();
profileStart();
setInterval(()=>{ if(S.mode==='football'&&(S.ftab==='today'||S.ftab==='home'||S.ftab==='bets')&&!SLIP) render(); },60000);
