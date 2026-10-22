import React, { useState } from 'react';
import { Target, X, ArrowRight, CheckCircle2, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export function CardTargetModal({ card, companies, onClose, onConfirm }) {
  const targetCompany = companies.find(c => c.id === card.targetCompanyId) || {
    id: card.targetCompanyId,
    name: 'Empresa Principal',
    ticker: 'E1',
    price: 100,
    color: 'var(--ifi-secondary)',
  };
  const otherCompanies = companies.filter(c => c.id !== card.targetCompanyId);

  const [selectedOtherId, setSelectedOtherId] = useState(
    otherCompanies.length > 0 ? otherCompanies[0].id : ''
  );

  const cardConfig = {
    '80_40': {
      title: 'Arbitraje Directo (+80 / -40)',
      targetBonus: '+Bs 80',
      otherPenalty: '-Bs 40',
      icon: TrendingDown,
      desc: 'La empresa principal sube +Bs 80 en rueda. La contraparte seleccionada bajará -Bs 40.',
      calcOther: price => Math.max(10, price - 40),
      calcTarget: price => Math.min(250, price + 80),
    },
    '2x': {
      title: 'Multiplicador Doble (2x / 0.5x)',
      targetBonus: 'Duplica (x2)',
      otherPenalty: 'Cae a la mitad (x0.5)',
      icon: Zap,
      desc: 'La empresa principal duplica su cotización (x2). La contraparte seleccionada cae a la mitad (x0.5).',
      calcOther: price => Math.max(10, Math.floor(price / 2)),
      calcTarget: price => Math.min(250, price * 2),
    },
    'half_2x': {
      title: 'Inversión de Mitad (0.5x / 2x)',
      targetBonus: 'Cae a la mitad (x0.5)',
      otherPenalty: 'Duplica (x2)',
      icon: TrendingUp,
      desc: 'La empresa principal reduce a la mitad su valor (x0.5). La contraparte seleccionada duplicará su cotización (x2).',
      calcOther: price => Math.min(250, price * 2),
      calcTarget: price => Math.max(10, Math.floor(price / 2)),
    },
  };

  const config = cardConfig[card.cardId] || {
    title: 'Orden Táctica Dual',
    targetBonus: 'Impacto Principal',
    otherPenalty: 'Impacto Contraparte',
    icon: Target,
    desc: 'Selecciona la empresa contraparte que recibirá el impacto secundario de esta orden táctica.',
    calcOther: price => price,
    calcTarget: price => price,
  };

  const selectedComp = companies.find(c => c.id === selectedOtherId);

  const CardIcon = config.icon;

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className="terminal-modal-window modal-target-selector-window"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="modal-head">
          <div className="modal-icon modal-icon--gold">
            <CardIcon size={22} />
          </div>
          <div className="modal-head-text">
            <span className="modal-eyebrow modal-eyebrow--gold">Carta de doble efecto</span>
            <h3 className="modal-title">{config.title}</h3>
            <p className="modal-subtitle">{config.desc}</p>
          </div>
          <button className="btn-modal-close" onClick={onClose} title="Cerrar ventana" aria-label="Cerrar ventana">
            <X size={20} />
          </button>
        </div>

        {/* Resumen del Objetivo Principal */}
        <div className="target-principal-card">
          <div className="principal-badge-tag">Empresa objetivo (fija)</div>
          <div className="principal-company-row">
            <div className="principal-company-left">
              <span className="target-color-indicator" style={{ backgroundColor: targetCompany.color || 'var(--ifi-secondary)' }} />
              <span className="target-ticker">{targetCompany.ticker || `E${targetCompany.id}`}</span>
              <strong className="principal-company-name">{targetCompany.name}</strong>
            </div>
            <div className="principal-impact-pill">
              <span className="pill-effect-val">{config.targetBonus}</span>
              <span className="pill-price-preview font-mono">
                Bs {targetCompany.price} <ArrowRight size={12} /> Bs {config.calcTarget(targetCompany.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Sección de Selección de Contraparte */}
        <div className="target-selector-section">
          <div className="target-selector-label">
            Elige la empresa contraparte
            <span className="target-selector-effect">{config.otherPenalty}</span>
          </div>
          <p className="target-selector-hint">
            Toca la empresa que recibirá el efecto contrario de la carta.
          </p>

          <div className="target-options-list" role="radiogroup">
            {otherCompanies.map(c => {
              const isSelected = selectedOtherId === c.id;
              const nextPrice = config.calcOther(c.price);
              const delta = nextPrice - c.price;

              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`target-option-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedOtherId(c.id)}
                >
                  <div className="target-option-main">
                    <span
                      className="target-color-indicator"
                      style={{ backgroundColor: c.color || 'var(--ink)' }}
                    />
                    <span className="target-ticker">{c.ticker || `E${c.id}`}</span>
                    <div className="target-option-names">
                      <strong className="target-option-full-name">{c.name}</strong>
                    </div>
                  </div>

                  <div className="target-option-pricing">
                    <div className="pricing-values-wrap font-mono">
                      <span className="pricing-current">Bs {c.price}</span>
                      <ArrowRight size={13} className="pricing-arrow" />
                      <span className={`pricing-projected ${delta < 0 ? 'is-down' : delta > 0 ? 'is-up' : ''}`}>
                        Bs {nextPrice}
                        <span className="pricing-delta">({delta > 0 ? `+${delta}` : delta})</span>
                      </span>
                    </div>
                    <div className={`custom-radio-circle ${isSelected ? 'is-checked' : ''}`}>
                      {isSelected ? <CheckCircle2 size={16} /> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="modal-actions-row">
          <button className="btn-secondary-action" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary-action btn-execute-dual-card"
            disabled={!selectedOtherId}
            onClick={() => onConfirm(card.instanceId, selectedOtherId)}
          >
            {selectedComp
              ? `Jugar carta · afecta a ${selectedComp.name}`
              : 'Elige una contraparte'}
          </button>
        </div>
      </div>
    </div>
  );
}
