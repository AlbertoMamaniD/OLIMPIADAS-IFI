import React, { useState } from 'react';
import { Layers, Zap, Play, ChevronDown, ChevronUp } from 'lucide-react';

const CARD_INFO = {
  '100_10': { label: '100 / 10', desc: 'La empresa objetivo sube Bs 100; las demás bajan Bs 10.', needsOther: false },
  '20_50':  { label: '20 / 50',  desc: 'La empresa objetivo baja Bs 50; las demás suben Bs 20.', needsOther: false },
  '80_40':  { label: '80 / 40',  desc: 'La empresa objetivo sube Bs 80. Otra empresa elegida baja Bs 40.', needsOther: true },
  '2x':     { label: '2x',       desc: 'La empresa objetivo duplica su precio. Otra empresa elegida reduce a la mitad.', needsOther: true },
  'half_2x':{ label: '1/2x',     desc: 'La empresa objetivo reduce a la mitad. Otra empresa elegida duplica su precio.', needsOther: true },
  'auction':{ label: 'Subasta',  desc: 'Inicia subasta obligatoria de 30 acciones de la empresa objetivo.', needsOther: false },
};

export function CardDeck({ hand, companies, isMyTurn, cardPlayed, onPlayCard, actionInProgress }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getCompanyName = id => {
    const c = companies.find(comp => comp.id === id);
    return c ? c.name : id;
  };

  const canPlay = isMyTurn && !cardPlayed && !actionInProgress;

  return (
    <div className="terminal-card">
      <div className="terminal-card-header">
        <div className="header-icon-label">
          <Layers size={15} color="var(--ifi-secondary)" />
          <span>Cartera de Tarjetas ({hand?.length || 0})</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--ink-secondary)', textTransform: 'none', letterSpacing: 'normal' }}>
          {cardPlayed ? 'Tarjeta de turno ejecutada' : 'Obligatorio ejecutar 1 por turno'}
        </span>
      </div>

      {(!hand || hand.length === 0) ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '13px', fontStyle: 'italic' }}>
          Sin tarjetas disponibles en cartera
        </div>
      ) : (
        hand.map(card => {
          const info = CARD_INFO[card.cardId] || { label: card.cardId, desc: '', needsOther: false };
          const isExpanded = expandedId === card.instanceId;
          const targetName = getCompanyName(card.targetCompanyId);

          return (
            <div
              key={card.instanceId}
              className="card-entry-row"
              onClick={() => toggleExpand(card.instanceId)}
            >
              <div className="card-entry-header">
                <div>
                  <div className="card-name-label">
                    <Zap size={14} />
                    <span>{info.label}</span>
                  </div>
                  <div className="card-target-label">
                    Objetivo: <strong style={{ color: 'var(--ink)' }}>{targetName}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="btn-primary-action"
                    style={{ padding: '6px 12px', fontSize: '11.5px', textTransform: 'uppercase' }}
                    disabled={!canPlay}
                    onClick={e => {
                      e.stopPropagation();
                      onPlayCard(card, info.needsOther);
                    }}
                  >
                    <Play size={11} />
                    <span>Ejecutar</span>
                  </button>

                  <div style={{ color: 'var(--ink-muted)' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="card-description-box">
                  <div>{info.desc}</div>
                  {info.needsOther && (
                    <div style={{ color: 'var(--accent)', marginTop: '4px', fontWeight: 600, fontSize: '11px' }}>
                      Requiere seleccionar una segunda empresa en pantalla.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
