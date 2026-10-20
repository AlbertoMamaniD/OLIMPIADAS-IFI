// ============================================================
// MOTOR DE INTELIGENCIA ARTIFICIAL / BOTS SIMULADOS
// Permite partidas de prueba en solitario sin requerir otras personas.
// ============================================================

import {
  trade,
  playCard,
  endTurn,
  placeBid,
  sellDuringAuction,
  resolveCrisisDecision,
  getCompany,
  getTeam,
} from './rulesEngine.js';

export const BOT_NAMES = [
  'Inversiones Andina (Bot)',
  'Capital Alfa (Bot)',
  'Fondo Quórum (Bot)',
  'Valores del Valle (Bot)',
  'Traders del Sur (Bot)',
];

export function isBot(team) {
  return !!team?.isBot;
}

export function generateBotTeam(existingTeams = []) {
  const existingNames = new Set(existingTeams.map(t => t.name));
  const available = BOT_NAMES.filter(name => !existingNames.has(name));
  const name = available.length > 0 ? available[0] : `Mesa Bot ${existingTeams.length + 1}`;

  return {
    id: 'bot_' + Math.random().toString(36).substring(2, 9),
    name,
    isBot: true,
    socketId: null,
    connected: true,
  };
}

/**
 * Ejecuta el turno completo de un Bot de forma realista con pausas
 */
export async function executeBotTurn(game, botId, io, roomCode) {
  const team = game.teams.find(t => t.id === botId);
  if (!team || team.eliminated || !team.isBot) return;

  // 0. Resolver crisis pendientes de bots inmediatamente
  resolvePendingBotCrisis(game, io, roomCode);

  // Si hay crisis pendientes no resueltas (ej. de jugadores humanos), esperar su resolución
  if (game.pendingDecisions?.some(d => !d.resolved)) {
    return;
  }

  // Espera natural de 1.2 segundos para que los humanos vean que el bot está "pensando"
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Verificar que siga siendo el turno del bot y no haya cambiado
  if (game.gameOver || game.currentTurn?.teamId !== botId || game.paused || game.manualPause) {
    return;
  }

  try {
    // 1. Fase Previa: Compra o Venta estratégica
    if (game.currentTurn.phase === 'before' && !game.currentTurn.isLastTurn) {
      if (team.cash >= 300) {
        // Comprar 1 o 2 acciones de una empresa que no esté en techo
        const eligible = game.companies.filter(c => c.brokerShares > 0 && c.price < 220 && team.cash >= c.price);
        if (eligible.length > 0 && Math.random() > 0.3) {
          const target = eligible[Math.floor(Math.random() * eligible.length)];
          const qty = Math.min(Math.floor(Math.random() * 2) + 1, target.brokerShares, Math.floor(team.cash / target.price));
          if (qty > 0) {
            trade(game, botId, target.id, qty, 'buy', 'before');
            io.to(roomCode).emit('game_updated', game);
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
      } else if (team.cash < 150) {
        // Vender para conseguir liquidez si tiene acciones
        const owned = game.companies.filter(c => (team.holdings[c.id] || 0) > 0);
        if (owned.length > 0 && Math.random() > 0.4) {
          const target = owned[Math.floor(Math.random() * owned.length)];
          const held = team.holdings[target.id] || 0;
          const qty = Math.min(Math.floor(Math.random() * 2) + 1, held);
          if (qty > 0) {
            trade(game, botId, target.id, qty, 'sell', 'before');
            io.to(roomCode).emit('game_updated', game);
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
      }
    }

    // 2. Jugar Tarjeta (Obligatorio)
    if (!game.currentTurn.cardPlayed && team.hand && team.hand.length > 0) {
      const card = team.hand[0]; // juega la primera disponible
      let otherCompanyId = null;

      if (['80_40', '2x', 'half_2x'].includes(card.cardId)) {
        const others = game.companies.filter(c => c.id !== card.targetCompanyId);
        otherCompanyId = others[Math.floor(Math.random() * others.length)].id;
      }

      playCard(game, botId, card.instanceId, otherCompanyId);
      io.to(roomCode).emit('game_updated', game);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. Resolver crisis pendientes si el bot tiene decisiones
    resolvePendingBotCrisis(game, io, roomCode);

    // 4. Si se inició una subasta, no terminar el turno hasta que concluya
    if (game.auction) {
      return;
    }

    // 5. Terminar turno
    if (!game.gameOver && game.currentTurn?.teamId === botId && game.currentTurn.cardPlayed && !game.auction) {
      endTurn(game);
      io.to(roomCode).emit('game_updated', game);
    }
  } catch (err) {
    console.warn(`Error en turno del bot ${team.name}:`, err.message);
  }
}

/**
 * Resuelve decisiones de piso para bots
 */
export function resolvePendingBotCrisis(game, io, roomCode) {
  if (!game.pendingDecisions) return;

  const botDecisions = game.pendingDecisions.filter(d => {
    if (d.resolved) return false;
    const team = game.teams.find(t => t.id === d.teamId);
    return team && team.isBot;
  });

  botDecisions.forEach(d => {
    const team = game.teams.find(t => t.id === d.teamId);
    const held = team.holdings[d.companyId] || 0;
    const cost = held * 20;

    const decision = (team.cash >= cost && Math.random() > 0.3) ? 'keep' : 'return';
    try {
      resolveCrisisDecision(game, d.teamId, d.companyId, decision);
      io.to(roomCode).emit('game_updated', game);
    } catch (e) {
      try {
        resolveCrisisDecision(game, d.teamId, d.companyId, 'return');
        io.to(roomCode).emit('game_updated', game);
      } catch (err) {}
    }
  });
}

/**
 * Evalúa y ejecuta pujas de bots durante una subasta activa
 */
export function maybeBotBidInAuction(game, io, roomCode) {
  if (!game.auction || game.auction.status !== 'bidding') return;

  const bots = game.teams.filter(t => t.isBot && !t.eliminated);
  if (bots.length === 0) return;

  const auction = game.auction;
  const highest = auction.bids[auction.bids.length - 1];
  const nextBid = highest ? highest.amountPerShare + 10 : 10;
  const totalCost = nextBid * auction.lotSize;

  // Elegir un bot al azar que pueda pagarlo y no sea el postor más alto actual
  const eligibleBots = bots.filter(b => b.cash >= totalCost && (!highest || highest.teamId !== b.id));
  if (eligibleBots.length > 0 && Math.random() > 0.4) {
    const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
    try {
      placeBid(game, bot.id);
      io.to(roomCode).emit('game_updated', game);
    } catch (e) {}
  }
}
