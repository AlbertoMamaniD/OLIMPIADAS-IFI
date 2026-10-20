// Test runner for the ESM rules engine
import {
  initGameState,
  forceResolveAuctionOnTimeout,
  forceEndTurn,
  trade,
  startAuction,
  placeBid,
  getTeam,
  getCompany,
} from '../src/engine/rulesEngine.js';

const companies = [1, 2, 3].map(i => ({
  id: 'c' + i,
  name: 'E' + i,
  ticker: 'E' + i,
  color: '#000',
  price: 100,
}));

let passed = 0;
let failed = 0;

const ok = (condition, msg) => {
  if (!condition) {
    console.error('❌ FALLO:', msg);
    failed++;
  } else {
    console.log('✅ ok -', msg);
    passed++;
  }
};

console.log('--- Corriendo pruebas del motor de reglas ---');

// Test 1: Subasta con postor que se queda sin fondos
{
  const s = initGameState(
    companies,
    [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }],
    [['100_10', '2x'], ['100_10', '2x'], ['100_10', '2x']]
  );
  startAuction(s, 'c1');
  placeBid(s, 'a');
  placeBid(s, 'b');
  placeBid(s, 'c');
  getTeam(s, 'c').cash = 5; // C no puede pagar
  forceResolveAuctionOnTimeout(s);

  ok(s.auction === null, 'subasta cerrada pese a ganador sin fondos');
  ok((getTeam(s, 'b').holdings.c1 || 0) === 30, 'B (siguiente mejor puja) recibe el lote');
  ok(getTeam(s, 'b').cash === 1000 - 20 * 30, 'B paga 20/accion x 30');
  ok(s.paused === false, 'reloj reanudado tras cerrar la subasta');
  ok(s.log.some(l => l.text.includes('no cuenta con fondos')), 'queda registro de la descalificacion');
}

// Test 2: Subasta cerrada sin pagadores
{
  const s = initGameState(
    companies,
    [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    [['100_10'], ['100_10']]
  );
  startAuction(s, 'c1');
  const before = getCompany(s, 'c1').brokerShares;
  placeBid(s, 'a');
  placeBid(s, 'b');
  getTeam(s, 'a').cash = 0;
  getTeam(s, 'b').cash = 0;
  forceResolveAuctionOnTimeout(s);

  ok(s.auction === null && s.paused === false, 'subasta cerrada sin pagadores');
  ok(getCompany(s, 'c1').brokerShares === before + 30, 'lote de 30 vuelve al broker');
}

// Test 3: Último turno y detección de fin de partida
{
  const s = initGameState(
    companies,
    [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }],
    [['100_10', '2x'], ['100_10', '2x', '20_50'], ['100_10']]
  );
  let flagged = [];
  let n = 0;
  let lastFlag = null;
  while (!s.gameOver && n < 50) {
    lastFlag = s.currentTurn.isLastTurn;
    flagged.push(lastFlag);
    forceEndTurn(s);
    n++;
  }
  ok(s.gameOver, 'partida simulada termina');
  ok(flagged.filter(Boolean).length === 1, 'exactamente un turno marcado como ultimo');
  ok(lastFlag === true, 'el turno final es el marcado');

  const t = initGameState(
    companies,
    [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    [['100_10'], []]
  );
  ok(t.currentTurn.isLastTurn === true, 'turno unico restante es ultimo');

  let blocked = false;
  try {
    trade(t, 'a', 'c1', 1, 'buy', 'before');
  } catch (e) {
    blocked = /solo está permitido vender/.test(e.message);
  }
  ok(blocked, 'comprar en el ultimo turno lanza error');

  getTeam(t, 'a').holdings.c1 = 3;
  let sold = true;
  try {
    trade(t, 'a', 'c1', 1, 'sell', 'before');
  } catch (e) {
    sold = false;
  }
  ok(sold, 'vender en el ultimo turno funciona');
}

console.log(`\nResultado: ${passed} pasados, ${failed} fallados.`);
if (failed > 0) process.exit(1);
