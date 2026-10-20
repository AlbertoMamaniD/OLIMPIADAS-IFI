const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync(process.argv[2], 'utf8') +
  '\nthis.api = { initGameState, forceResolveAuctionOnTimeout, forceEndTurn, trade, startAuction, placeBid, getTeam, getCompany };';
const ctx = {}; vm.createContext(ctx); vm.runInContext(code, ctx);
const A = ctx.api;
const companies = [1,2,3].map(i => ({ id: 'c'+i, name: 'E'+i, ticker: 'E'+i, color: '#000', price: 100 }));
const ok = (c, m) => { if (!c) { console.log('FALLO:', m); process.exitCode = 1; } else console.log('ok  -', m); };
{
  const s = A.initGameState(companies, [{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}], [['100_10','2x'],['100_10','2x'],['100_10','2x']]);
  A.startAuction(s, 'c1');
  A.placeBid(s, 'a'); A.placeBid(s, 'b'); A.placeBid(s, 'c');
  A.getTeam(s,'c').cash = 5;
  A.forceResolveAuctionOnTimeout(s);
  ok(s.auction === null, 'subasta cerrada pese a ganador sin fondos');
  ok((A.getTeam(s,'b').holdings.c1 || 0) === 30, 'B (siguiente mejor puja) recibe el lote');
  ok(A.getTeam(s,'b').cash === 1000 - 20*30, 'B paga 20/accion x 30');
  ok(s.paused === false, 'reloj reanudado tras cerrar la subasta');
  ok(s.log.some(l => l.text.includes('ya no tiene fondos')), 'queda registro de la descalificacion');
}
{
  const s = A.initGameState(companies, [{id:'a',name:'A'},{id:'b',name:'B'}], [['100_10'],['100_10']]);
  A.startAuction(s, 'c1');
  const before = A.getCompany(s,'c1').brokerShares;
  A.placeBid(s, 'a'); A.placeBid(s, 'b');
  A.getTeam(s,'a').cash = 0; A.getTeam(s,'b').cash = 0;
  A.forceResolveAuctionOnTimeout(s);
  ok(s.auction === null && s.paused === false, 'subasta cerrada sin pagadores');
  ok(A.getCompany(s,'c1').brokerShares === before + 30, 'lote de 30 vuelve al broker');
}
{
  const s = A.initGameState(companies, [{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}],
    [['100_10','2x'],['100_10','2x','20_50'],['100_10']]);
  let flagged = [], n = 0, lastFlag = null;
  while (!s.gameOver && n < 50) { lastFlag = s.currentTurn.isLastTurn; flagged.push(lastFlag); A.forceEndTurn(s); n++; }
  ok(s.gameOver, 'partida simulada termina');
  ok(flagged.filter(Boolean).length === 1, 'exactamente un turno marcado como ultimo');
  ok(lastFlag === true, 'el turno final es el marcado');
  const t = A.initGameState(companies, [{id:'a',name:'A'},{id:'b',name:'B'}], [['100_10'],[]]);
  ok(t.currentTurn.isLastTurn === true, 'turno unico restante es ultimo');
  let blocked = false; try { A.trade(t, 'a', 'c1', 1, 'buy', 'before'); } catch (e) { blocked = /solo se puede vender/.test(e.message); }
  ok(blocked, 'comprar en el ultimo turno lanza error');
  A.getTeam(t,'a').holdings.c1 = 3;
  let sold = true; try { A.trade(t, 'a', 'c1', 1, 'sell', 'before'); } catch (e) { sold = false; }
  ok(sold, 'vender en el ultimo turno funciona');
  const u = A.initGameState(companies, [{id:'a',name:'A'},{id:'b',name:'B'}], [['100_10','2x'],['100_10']]);
  ok(u.currentTurn.isLastTurn === false, 'turno normal no es ultimo');
}
