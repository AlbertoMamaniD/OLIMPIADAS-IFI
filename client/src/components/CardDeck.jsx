import React, { useState } from 'react';
import {
  Layers,
  Zap,
  Play,
  ChevronDown,
  ChevronUp,
  Gavel,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';

const CARD_CONFIG = {
  '100_10': {
    label: '+100 / -10',
    type: 'Alza Sistémica',
    impact: 'La empresa objetivo sube +Bs 100; las demás 4 bajan -Bs 10.',
    icon: TrendingUp,
    badgeClass: 'badge-bullish',
    needsOther: false,
  },
  '20_50': {
    label: '-50 / +20',
    type: 'Corrección / Rally',
    impact: 'La empresa objetivo baja -Bs 50; las demás 4 suben +Bs 20.',
    icon: TrendingDown,
    badgeClass: 'badge-bearish',
    needsOther: false,
  },
  '80_40': {
    label: '+80 / -40',
    type: 'Arbitraje Directo',
    impact: 'La empresa objetivo sube +Bs 80; una contraparte elegida baja -Bs 40.',
    icon: ArrowRightLeft,
    badgeClass: 'badge-arbitrage',
    needsOther: true,
  },
  '2x': {
    label: '2x / 0.5x',
    type: 'Multiplicador Doble',
    impact: 'La empresa objetivo duplica su cotización (x2); la elegida reduce a la mitad (x0.5).',
    icon: Zap,
    badgeClass: 'badge-multiplier',
    needsOther: true,
  },
  'half_2x': {
    label: '0.5x / 2x',
    type: 'Inversión de Mitad',
    impact: 'La empresa objetivo reduce a la mitad (x0.5); la elegida duplica su cotización (x2).',
    icon: Zap,
    badgeClass: 'badge-multiplier',
    needsOther: true,
  },
  'auction': {
    label: 'Subasta Pública',
    type: 'Liquidez Obligatoria',
    impact: 'Convoca a subasta extraordinaria de 30 acciones del objetivo a precio base.',
    icon: Gavel,
    badgeClass: 'badge-auction',
    needsOther: false,
  },
};

export function CardDeck({ hand, companies, isMyTurn, cardPlayed, onPlayCard, actionInProgress }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getCompany = id => {
    return companies.find(comp => comp.id === id) || { name: `Empresa ${id}`, ticker: `E${id}` };
  };

  const canPlay = isMyTurn && !cardPlayed && !actionInProgress;

  return (
    <div className="terminal-card card-deck-card">
      <div className="terminal-card-header deck-header-row">
        <div className="header-icon-label">
          <span className="panel-icon-chip">
            <Layers size={17} />
          </span>
          <span className="card-title-strong">
            <span className="deck-title-full">Tus cartas tácticas</span>
            <span className="deck-title-mob">Cartas tácticas</span>
          </span>
          <span className="deck-count-pill font-mono">{hand?.length || 0}</span>
        </div>
        <div className="card-deck-status">
          {cardPlayed ? (
            <span className="turn-step-executed">
              <CheckCircle2 size={14} />
              <span>Carta jugada</span>
            </span>
          ) : (
            <span className="turn-step-pending">
              Juega 1 por turno
            </span>
          )}
        </div>
      </div>

      <div className="cards-list-container">
        {(!hand || hand.length === 0) ? (
          <div className="empty-deck-notice">
            <Layers size={26} className="empty-deck-icon" />
            <span>No te quedan cartas en la mano</span>
          </div>
        ) : (
          hand.map(card => {
            const config = CARD_CONFIG[card.cardId] || {
              label: card.cardId,
              type: 'Estratégica',
              impact: 'Impacto táctico sobre cotizaciones',
              icon: Zap,
              badgeClass: 'badge-default',
              needsOther: false,
            };
            const Icon = config.icon;
            const isExpanded = expandedId === card.instanceId;
            const targetComp = getCompany(card.targetCompanyId);

            return (
              <div
                key={card.instanceId}
                className={`tactical-card-item ${isExpanded ? 'is-expanded' : ''} ${config.badgeClass} ${canPlay ? 'is-playable' : ''}`}
                onClick={() => toggleExpand(card.instanceId)}
              >
                <div className="tactical-card-header">
                  <div className="tactical-card-face">
                    <span className="tactical-card-icon">
                      <Icon size={16} />
                    </span>
                    <span className="tactical-type-tag">{config.type}</span>
                  </div>

                  <div className="tactical-card-badge font-mono">{config.label}</div>

                  <div className="tactical-target-line">
                    <span className="meta-label">Empresa objetivo</span>
                    <span className="meta-target-row">
                      <span className="meta-ticker-chip font-mono">
                        {targetComp.ticker || `E${targetComp.id}`}
                      </span>
                      <strong className="meta-name-full">{targetComp.name}</strong>
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="tactical-card-detail">
                    <div className="impact-description">
                      <strong>Qué hace:</strong>{' '}
                      {config.impact
                        .replace('La empresa objetivo', `[${targetComp.ticker || `E${targetComp.id}`}] ${targetComp.name}`)
                        .replace('del objetivo', `de [${targetComp.ticker || `E${targetComp.id}`}] ${targetComp.name}`)}
                    </div>
                    {config.needsOther && (
                      <div className="dual-target-alert">
                        Al jugarla elegirás una segunda empresa.
                      </div>
                    )}
                  </div>
                )}

                <div className="tactical-card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn-execute-card"
                    disabled={!canPlay}
                    onClick={() => onPlayCard(card, config.needsOther)}
                    title={
                      !isMyTurn
                        ? 'Esperando turno de tu mesa'
                        : cardPlayed
                        ? 'Ya se ejecutó una tarjeta en este turno'
                        : 'Ejecutar orden táctica en el mercado'
                    }
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Jugar</span>
                  </button>
                  <button
                    className="btn-expand-card"
                    onClick={() => toggleExpand(card.instanceId)}
                    title={isExpanded ? 'Colapsar detalles' : 'Ver impacto completo'}
                    aria-label={isExpanded ? 'Ocultar efecto' : 'Ver efecto'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
