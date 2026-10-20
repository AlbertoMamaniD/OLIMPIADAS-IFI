// ============================================================
// CONSTANTES Y CONFIGURACIONES DEL JUEGO DE LA BOLSA (BBV)
// ============================================================

export const PRICE_FLOOR = 10;
export const PRICE_CEIL = 250;
export const DEFAULT_TURN_SECONDS = 120;
export const TURN_SECONDS_OPTIONS = [30, 60, 90, 120];

export const AUCTION_LOT_SIZE = 30;
export const AUCTION_MAX_CONTRIBUTION_PER_TEAM = 5;
export const AUCTION_BID_INCREMENT = 10;
export const AUCTION_SECONDS = 30;

export const CRISIS_BUYBACK_PRICE = 20;
export const MAX_SHARES_PER_COMPANY = 260; // Total emitido por empresa (empieza en broker)
export const DEFAULT_STARTING_CASH = 1000;
export const DEFAULT_HAND_SIZE = 6;

export const DEFAULT_COMPANIES = [
  { id: 'c1', name: 'Empresa 1', ticker: 'E1', color: '#6a5acd', price: 100 },
  { id: 'c2', name: 'Empresa 2', ticker: 'E2', color: '#2a8fbd', price: 100 },
  { id: 'c3', name: 'Empresa 3', ticker: 'E3', color: '#c07a2e', price: 100 },
  { id: 'c4', name: 'Empresa 4', ticker: 'E4', color: '#b23a7a', price: 100 },
  { id: 'c5', name: 'Empresa 5', ticker: 'E5', color: '#3f9142', price: 100 },
];
