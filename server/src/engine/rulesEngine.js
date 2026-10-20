// ============================================================
// MOTOR DE REGLAS PURO — JUEGO DE LA BOLSA (BBV)
// Toda la lógica de estado es determinista y serializable a JSON.
// ============================================================

import {
  PRICE_FLOOR,
  PRICE_CEIL,
  DEFAULT_TURN_SECONDS,
  AUCTION_LOT_SIZE,
  AUCTION_MAX_CONTRIBUTION_PER_TEAM,
  AUCTION_BID_INCREMENT,
  CRISIS_BUYBACK_PRICE,
  MAX_SHARES_PER_COMPANY,
  DEFAULT_STARTING_CASH,
} from './constants.js';

import { CARD_INFO, makeCardInstance } from './cards.js';

// ---------- Helpers de empresa y precio ----------
export function getCompany(state, companyId) {
  const c = state.companies.find(c => c.id === companyId);
  if (!c) throw new Error(`Empresa no encontrada: ${companyId}`);
  return c;
}

export function allCompaniesExcept(state, excludeId) {
  return state.companies.filter(c => c.id !== excludeId);
}

export function clampPrice(price) {
  return Math.max(PRICE_FLOOR, Math.min(PRICE_CEIL, price));
}

export function applyDelta(state, companyId, delta) {
  const company = getCompany(state, companyId);
  company.price = company.price + delta;
  checkPriceEvents(state, company);
}

export function applyMultiplier(state, companyId, factor) {
  const company = getCompany(state, companyId);
  company.price = Math.round(company.price * factor);
  checkPriceEvents(state, company);
}

export function checkPriceEvents(state, company) {
  company.lastPriceEvent = null; // 'dividend' | 'crisis' | null
  if (company.price > PRICE_CEIL) {
    const excess = company.price - PRICE_CEIL;
    payDividend(state, company, excess);
    company.price = PRICE_CEIL;
    company.lastPriceEvent = 'dividend';
  }
  if (company.price <= PRICE_FLOOR) {
    company.price = PRICE_FLOOR;
    triggerCrisis(state, company);
    company.lastPriceEvent = 'crisis';
  }
  company.priceHistory = company.priceHistory || [];
  company.priceHistory.push(company.price);
}

export function payDividend(state, company, excessPerShare) {
  state.teams.forEach(team => {
    const qty = team.holdings[company.id] || 0;
    if (qty > 0) {
      const payout = qty * excessPerShare;
      team.cash += payout;
      logEvent(state, `Dividendo: ${team.name} recibe Bs ${payout} por ${qty} acciones de ${company.name}`);
    }
  });
}

export function triggerCrisis(state, company) {
  const shareholders = state.teams.filter(t => (t.holdings[company.id] || 0) > 0 && !t.eliminated);
  if (shareholders.length === 0) return;
  state.pendingDecisions = state.pendingDecisions || [];
  shareholders.forEach(team => {
    state.pendingDecisions.push({
      type: 'crisis',
      companyId: company.id,
      teamId: team.id,
      resolved: false,
    });
  });
  state.paused = true;
  logEvent(state, `Crisis en ${company.name}: el precio cayó al piso (Bs ${PRICE_FLOOR})`);
}

export function resolveCrisisDecision(state, teamId, companyId, decision) {
  const pending = state.pendingDecisions?.find(
    d => d.type === 'crisis' && d.teamId === teamId && d.companyId === companyId && !d.resolved
  );
  if (!pending) throw new Error('No hay decisión de crisis pendiente para ese equipo/empresa');

  const team = getTeam(state, teamId);
  const qty = team.holdings[companyId] || 0;

  if (decision === 'keep') {
    const cost = qty * CRISIS_BUYBACK_PRICE;
    if (team.cash < cost) throw new Error('Fondos insuficientes para conservar las acciones');
    team.cash -= cost;
    logEvent(state, `${team.name} conserva ${qty} acciones pagando Bs ${cost}`);
  } else if (decision === 'return') {
    team.holdings[companyId] = 0;
    getCompany(state, companyId).brokerShares += qty;
    logEvent(state, `${team.name} devuelve ${qty} acciones al broker`);
  } else {
    throw new Error("La decisión debe ser 'keep' o 'return'");
  }
  pending.resolved = true;
  checkElimination(state, team);
  if (!hasPendingDecisions(state) && !state.auction) {
    state.paused = false;
    state.currentTurn.turnStartedAt = Date.now();
  }
}

export function hasPendingDecisions(state) {
  return (state.pendingDecisions || []).some(d => !d.resolved);
}

// ---------- Equipos y Operaciones de Mercado ----------
export function getTeam(state, teamId) {
  const t = state.teams.find(t => t.id === teamId);
  if (!t) throw new Error(`Equipo no encontrado: ${teamId}`);
  return t;
}

export function currentTeam(state) {
  return getTeam(state, state.currentTurn.teamId);
}

export function trade(state, teamId, companyId, qty, side, phase) {
  if (state.currentTurn.teamId !== teamId) throw new Error('No es el turno de tu equipo');
  if (state.currentTurn.phase !== phase) throw new Error(`No puedes operar en fase "${phase}" en este momento`);
  if (phase === 'after' && state.currentTurn.operatedCompanyBefore === companyId) {
    throw new Error('No puedes operar la misma empresa antes y después de jugar la tarjeta');
  }
  if (state.currentTurn.isLastTurn && side === 'buy') {
    throw new Error('Último turno del juego: solo está permitido vender');
  }

  const team = getTeam(state, teamId);
  const company = getCompany(state, companyId);

  if (side === 'buy') {
    const cost = qty * company.price;
    if (team.cash < cost) throw new Error('Fondos insuficientes para comprar');
    if (company.brokerShares < qty) throw new Error('El broker no tiene tantas acciones disponibles');
    team.cash -= cost;
    company.brokerShares -= qty;
    team.holdings[companyId] = (team.holdings[companyId] || 0) + qty;
    logEvent(state, `${team.name} compra ${qty} acciones de ${company.name} a Bs ${company.price}`);
  } else if (side === 'sell') {
    const held = team.holdings[companyId] || 0;
    if (held < qty) throw new Error('No tienes suficientes acciones para vender');
    team.holdings[companyId] = held - qty;
    company.brokerShares += qty;
    team.cash += qty * company.price;
    logEvent(state, `${team.name} vende ${qty} acciones de ${company.name} a Bs ${company.price}`);
  } else {
    throw new Error("Operación no válida: debe ser 'buy' o 'sell'");
  }

  if (phase === 'before') {
    state.currentTurn.operatedCompanyBefore = companyId;
  }
}

export function sellDuringAuction(state, teamId, companyId, qty) {
  if (!state.auction) throw new Error('Solo se puede vender libremente si hay una subasta activa');
  const team = getTeam(state, teamId);
  const company = getCompany(state, companyId);
  const held = team.holdings[companyId] || 0;
  if (held < qty) throw new Error('No tienes suficientes acciones para vender');
  team.holdings[companyId] = held - qty;
  company.brokerShares += qty;
  team.cash += qty * company.price;
  logEvent(state, `${team.name} vende ${qty} de ${company.name} a Bs ${company.price} (liquidez para subasta)`);
}

// ---------- Tarjetas y sus efectos ----------
export function playCard(state, teamId, instanceId, otherCompanyId) {
  if (state.currentTurn.teamId !== teamId) throw new Error('No es el turno de tu equipo');
  if (state.currentTurn.cardPlayed) throw new Error('Ya jugaste una tarjeta este turno');

  const team = getTeam(state, teamId);
  const idxInHand = team.hand.findIndex(c => c.instanceId === instanceId);
  if (idxInHand === -1) throw new Error('Tarjeta no encontrada en tu mano');
  const instance = team.hand[idxInHand];

  const info = CARD_INFO[instance.cardId];
  if (!info) throw new Error(`Tarjeta desconocida: ${instance.cardId}`);

  if (info.needsOtherCompany) {
    if (!otherCompanyId) throw new Error('Esta tarjeta requiere elegir otra empresa afectada');
    if (otherCompanyId === instance.targetCompanyId) throw new Error('La otra empresa debe ser distinta de la empresa objetivo');
  }

  // Quitar de mano y mover a jugadas
  team.hand.splice(idxInHand, 1);
  team.played.push(instance);

  const targetId = instance.targetCompanyId;

  // Aplicar efecto de la tarjeta
  switch (instance.cardId) {
    case '100_10':
      applyDelta(state, targetId, +100);
      allCompaniesExcept(state, targetId).forEach(c => applyDelta(state, c.id, -10));
      break;
    case '20_50':
      applyDelta(state, targetId, -50);
      allCompaniesExcept(state, targetId).forEach(c => applyDelta(state, c.id, +20));
      break;
    case '80_40':
      applyDelta(state, targetId, +80);
      applyDelta(state, otherCompanyId, -40);
      break;
    case '2x':
      applyMultiplier(state, targetId, 2);
      applyMultiplier(state, otherCompanyId, 0.5);
      break;
    case 'half_2x':
      applyMultiplier(state, targetId, 0.5);
      applyMultiplier(state, otherCompanyId, 2);
      break;
    case 'auction':
      startAuction(state, targetId);
      break;
    default:
      throw new Error(`Efecto no implementado para ${instance.cardId}`);
  }

  state.currentTurn.cardPlayed = {
    cardId: instance.cardId,
    targetCompanyId: instance.targetCompanyId,
    otherCompanyId,
  };
  state.currentTurn.phase = 'after';
  logEvent(state, `${team.name} juega [${info.label}] sobre ${getCompany(state, targetId).name}`);
}

// ---------- Subasta ----------
export function startAuction(state, companyId) {
  const company = getCompany(state, companyId);
  const priceAtStart = company.price;
  const shareholders = state.teams.filter(t => (t.holdings[companyId] || 0) > 0 && !t.eliminated);

  const contributions = {};
  shareholders.forEach(team => {
    const held = team.holdings[companyId] || 0;
    const qty = Math.min(held, AUCTION_MAX_CONTRIBUTION_PER_TEAM);
    team.holdings[companyId] = held - qty;
    contributions[team.id] = qty;
  });

  const contributedTotal = Object.values(contributions).reduce((a, b) => a + b, 0);
  const neededFromBroker = AUCTION_LOT_SIZE - contributedTotal;
  const brokerGives = Math.min(neededFromBroker, company.brokerShares);
  company.brokerShares -= brokerGives;

  state.auction = {
    companyId,
    lotSize: AUCTION_LOT_SIZE,
    priceAtStart,
    contributions,
    brokerShares: brokerGives,
    bids: [],
    status: 'bidding',
    initiatorTeamId: state.currentTurn.teamId,
    auctionStartedAt: Date.now(),
  };
  state.paused = true;
  logEvent(state, `Subasta iniciada: ${AUCTION_LOT_SIZE} acciones de ${company.name} (equipos aportaron ${contributedTotal}, broker completa ${brokerGives})`);
}

export function nextAuctionBidAmount(state) {
  const auction = state.auction;
  if (!auction) return null;
  const highest = auction.bids[auction.bids.length - 1];
  return highest ? highest.amountPerShare + AUCTION_BID_INCREMENT : AUCTION_BID_INCREMENT;
}

export function placeBid(state, teamId) {
  const auction = state.auction;
  if (!auction || auction.status !== 'bidding') throw new Error('No hay subasta activa en puja');
  const amountPerShare = nextAuctionBidAmount(state);
  const team = getTeam(state, teamId);
  if (team.cash < amountPerShare * auction.lotSize) {
    throw new Error(`Fondos insuficientes para pujar Bs ${amountPerShare}/acc por el lote completo (Bs ${amountPerShare * auction.lotSize})`);
  }
  auction.bids.push({ teamId, amountPerShare });
  logEvent(state, `${team.name} puja Bs ${amountPerShare}/acción (total Bs ${amountPerShare * auction.lotSize})`);
}

export function payAuctionContributors(state, auction) {
  Object.entries(auction.contributions).forEach(([teamId, qty]) => {
    if (qty > 0) {
      const team = getTeam(state, teamId);
      const payout = qty * auction.priceAtStart;
      team.cash += payout;
      logEvent(state, `${team.name} recibe Bs ${payout} por sus ${qty} acciones liquidadas en la subasta`);
    }
  });
}

export function closeAuction(state) {
  state.auction = null;
  if (!hasPendingDecisions(state)) {
    state.paused = false;
    state.currentTurn.turnStartedAt = Date.now();
  }
}

export function finalizeAuctionWithWinner(state, auction) {
  const disqualified = new Set();
  for (let i = auction.bids.length - 1; i >= 0; i--) {
    const bid = auction.bids[i];
    if (disqualified.has(bid.teamId)) continue;
    const team = getTeam(state, bid.teamId);
    const totalPaid = bid.amountPerShare * auction.lotSize;
    if (team.cash < totalPaid) {
      disqualified.add(bid.teamId);
      logEvent(state, `${team.name} no cuenta con fondos suficientes y queda descalificado de la subasta`);
      continue;
    }
    team.cash -= totalPaid;
    team.holdings[auction.companyId] = (team.holdings[auction.companyId] || 0) + auction.lotSize;
    payAuctionContributors(state, auction);
    logEvent(state, `Subasta adjudicada a ${team.name} por Bs ${bid.amountPerShare}/acción (total Bs ${totalPaid})`);
    closeAuction(state);
    return;
  }

  // Ninguna puja pudo pagarse: el lote vuelve al broker
  const company = getCompany(state, auction.companyId);
  company.brokerShares += auction.lotSize;
  payAuctionContributors(state, auction);
  logEvent(state, 'Subasta terminada: ninguna puja pudo pagarse. El lote vuelve al inventario del broker');
  closeAuction(state);
}

export function resolveAuction(state) {
  const auction = state.auction;
  if (!auction || auction.status !== 'bidding') throw new Error('La subasta no está en fase de puja');
  if (auction.bids.length === 0) throw new Error('No hay pujas registradas');
  finalizeAuctionWithWinner(state, auction);
}

export function forceResolveAuctionOnTimeout(state) {
  const auction = state.auction;
  if (!auction) return;
  if (auction.bids.length === 0) {
    const company = getCompany(state, auction.companyId);
    company.brokerShares += auction.lotSize;
    payAuctionContributors(state, auction);
    logEvent(state, 'Subasta finalizada sin ofertas: el lote regresa al broker');
    closeAuction(state);
  } else {
    finalizeAuctionWithWinner(state, auction);
  }
}

// ---------- Eliminación y Fin de Turno ----------
export function checkElimination(state, team) {
  const totalShares = Object.values(team.holdings).reduce((a, b) => a + b, 0);
  if (team.cash <= 0 && totalShares === 0) {
    team.eliminated = true;
    logEvent(state, `${team.name} queda eliminado de la competencia (sin efectivo ni acciones)`);
  }
}

export function computeIsLastTurn(state, teamId) {
  const team = getTeam(state, teamId);
  if (team.hand.length !== 1) return false;
  return state.teams.every(t => t.id === teamId || t.eliminated || t.hand.length === 0);
}

export function advanceToNextTeam(state) {
  const order = state.turnOrder;
  let idx = order.indexOf(state.currentTurn.teamId);
  let nextTeam;
  let loops = 0;
  do {
    idx = (idx + 1) % order.length;
    nextTeam = getTeam(state, order[idx]);
    loops++;
    if (loops > order.length * 2) {
      endGame(state);
      return;
    }
  } while (nextTeam.eliminated || nextTeam.hand.length === 0);

  state.turnNumber += 1;
  state.currentTurn = {
    teamId: nextTeam.id,
    phase: 'before',
    operatedCompanyBefore: null,
    cardPlayed: null,
    timeRemaining: state.turnSeconds ?? DEFAULT_TURN_SECONDS,
    turnStartedAt: Date.now(),
    isLastTurn: computeIsLastTurn(state, nextTeam.id),
  };
}

export function endTurn(state) {
  if (!state.currentTurn.cardPlayed) throw new Error('Debes jugar una tarjeta antes de finalizar el turno');
  if (hasPendingDecisions(state)) throw new Error('Hay decisiones de crisis pendientes');
  if (state.auction) throw new Error('Hay una subasta activa que debe resolverse');

  checkElimination(state, currentTeam(state));

  const activeTeams = state.teams.filter(t => !t.eliminated);
  const allHandsEmpty = activeTeams.every(t => t.hand.length === 0);
  if (allHandsEmpty) {
    endGame(state);
    return;
  }

  advanceToNextTeam(state);
}

export function forceEndTurn(state) {
  const team = currentTeam(state);
  if (!state.currentTurn.cardPlayed && team.hand.length > 0) {
    const idx = Math.floor(Math.random() * team.hand.length);
    const discarded = team.hand.splice(idx, 1)[0];
    const info = CARD_INFO[discarded.cardId] || { label: discarded.cardId };
    logEvent(state, `Tiempo agotado: se descartó al azar la tarjeta [${info.label}] de ${team.name}`);
  } else {
    logEvent(state, `Fin de turno forzado para ${team.name}`);
  }
  checkElimination(state, team);
  const activeTeams = state.teams.filter(t => !t.eliminated);
  const allHandsEmpty = activeTeams.every(t => t.hand.length === 0);
  if (allHandsEmpty) {
    endGame(state);
    return;
  }
  advanceToNextTeam(state);
}

export function endGame(state) {
  state.teams.forEach(team => {
    Object.entries(team.holdings).forEach(([companyId, qty]) => {
      const company = getCompany(state, companyId);
      team.cash += qty * company.price;
      team.holdings[companyId] = 0;
    });
  });
  state.gameOver = true;
  const ranking = [...state.teams].sort((a, b) => b.cash - a.cash);
  state.winnerTeamId = ranking[0].id;
  logEvent(state, `¡Juego finalizado! Ganador: ${ranking[0].name} con Bs ${ranking[0].cash}`);
}

export function logEvent(state, text) {
  state.log.push({ turn: state.turnNumber, text, timestamp: Date.now() });
  if (state.log.length > 80) state.log.shift();
}

// ---------- Inicialización del Estado ----------
export function initGameState(companies, teamNames, hands, options = {}) {
  const startingCash = options.startingCash ?? DEFAULT_STARTING_CASH;
  const turnSeconds = options.turnSeconds ?? DEFAULT_TURN_SECONDS;

  const state = {
    turnSeconds,
    companies: companies.map(c => ({
      ...c,
      brokerShares: MAX_SHARES_PER_COMPANY,
      priceHistory: [c.price],
      lastPriceEvent: null,
    })),
    teams: teamNames.map((entry, i) => {
      const isObj = typeof entry === 'object' && entry !== null;
      const id = isObj ? entry.id : `team_${i + 1}`;
      const name = isObj ? entry.name : entry;
      const hand = hands[i].map(cardEntry => {
        if (typeof cardEntry === 'string') {
          const randomCompany = companies[Math.floor(Math.random() * companies.length)];
          return makeCardInstance(cardEntry, randomCompany.id);
        }
        return makeCardInstance(cardEntry.cardId, cardEntry.targetCompanyId);
      });
      return {
        id,
        name,
        cash: startingCash,
        holdings: {},
        hand,
        played: [],
        eliminated: false,
      };
    }),
    turnOrder: teamNames.map((entry, i) =>
      typeof entry === 'object' && entry !== null ? entry.id : `team_${i + 1}`
    ),
    turnNumber: 1,
    currentTurn: null,
    auction: null,
    paused: false,
    manualPause: false,
    manualPauseStartedAt: null,
    pendingDecisions: [],
    gameOver: false,
    log: [],
  };

  state.currentTurn = {
    teamId: state.turnOrder[0],
    phase: 'before',
    operatedCompanyBefore: null,
    cardPlayed: null,
    timeRemaining: turnSeconds,
    turnStartedAt: Date.now(),
    isLastTurn: false,
  };
  state.currentTurn.isLastTurn = computeIsLastTurn(state, state.currentTurn.teamId);

  return state;
}
