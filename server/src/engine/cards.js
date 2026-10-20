// ============================================================
// DEFINICIÓN DE TARJETAS Y SUS EFECTOS DECLARATIVOS
// ============================================================

export const CARD_INFO = {
  '100_10': {
    id: '100_10',
    label: '100 / 10',
    desc: 'La empresa de la tarjeta sube Bs 100; las demás bajan Bs 10.',
    needsOtherCompany: false,
  },
  '20_50': {
    id: '20_50',
    label: '20 / 50',
    desc: 'La empresa de la tarjeta baja Bs 50; las demás suben Bs 20.',
    needsOtherCompany: false,
  },
  '80_40': {
    id: '80_40',
    label: '80 / 40',
    desc: 'La empresa de la tarjeta sube Bs 80. Otra empresa elegida baja Bs 40.',
    needsOtherCompany: true,
  },
  '2x': {
    id: '2x',
    label: '2x',
    desc: 'La empresa de la tarjeta duplica su precio. Otra empresa elegida baja a la mitad.',
    needsOtherCompany: true,
  },
  'half_2x': {
    id: 'half_2x',
    label: '1/2x',
    desc: 'La empresa de la tarjeta baja a la mitad. Otra empresa elegida duplica su precio.',
    needsOtherCompany: true,
  },
  'auction': {
    id: 'auction',
    label: 'Subasta',
    desc: 'Activa una subasta obligatoria de 30 acciones de la empresa de la tarjeta.',
    needsOtherCompany: false,
  },
};

export const ALL_CARD_IDS = Object.keys(CARD_INFO);

let cardCounter = 0;
export function makeCardInstance(cardId, targetCompanyId) {
  cardCounter += 1;
  return {
    instanceId: `card_${Date.now()}_${cardCounter}`,
    cardId,
    targetCompanyId,
  };
}

export function dealRandomHand(size = 6, allowedIds = ALL_CARD_IDS) {
  const pool = allowedIds && allowedIds.length > 0 ? allowedIds : ALL_CARD_IDS;
  return Array.from({ length: size }, () => pool[Math.floor(Math.random() * pool.length)]);
}
