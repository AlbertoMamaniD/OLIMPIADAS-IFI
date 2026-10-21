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

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div className="terminal-modal-window modal-target-selector-window" onClick={e => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header-ribbon">
          <div className="modal-header-left">
            <span className="modal-category-chip font-mono">ORDEN TÁCTICA DE IMPACTO DUAL</span>
            <h3 className="modal-main-title">{config.title}</h3>
          </div>
          <button className="btn-modal-close" onClick={onClose} title="Cerrar ventana">
            <X size={18} />
          </button>
        </div>

        {/* Resumen del Objetivo Principal */}
        <div className="target-principal-card">
          <div className="principal-badge-tag font-mono">EMPRESA OBJETIVO PRINCIPAL (FIJA)</div>
          <div className="principal-company-row">
            <div className="principal-company-left">
              <span className="target-color-indicator" style={{ backgroundColor: targetCompany.color || 'var(--ifi-secondary)' }} />
              <span className="ticker-badge font-mono">{targetCompany.ticker || `E${targetCompany.id}`}</span>
              <strong className="principal-company-name">{targetCompany.name}</strong>
            </div>
            <div className="principal-impact-pill font-mono">
              <span className="pill-effect-label">Efecto:</span>
              <span className="pill-effect-val">{config.targetBonus}</span>
              <span className="pill-price-preview">
                (Bs {targetCompany.price} → Bs {config.calcTarget(targetCompany.price)})
              </span>
            </div>
          </div>
        </div>

        {/* Sección de Selección de Contraparte */}
        <div className="target-selector-section">
          <label className="target-selector-label">
            <span>SELECCIONA LA EMPRESA CONTRAPARTE AFECTADA ({config.otherPenalty}):</span>
          </label>
          <p className="target-selector-hint">
            Haz clic directamente en la empresa que recibirá la contraparte de la orden:
          </p>

          <div className="target-options-list">
            {otherCompanies.map(c => {
              const isSelected = selectedOtherId === c.id;
              const nextPrice = config.calcOther(c.price);
              const delta = nextPrice - c.price;

              return (
                <button
                  key={c.id}
                  type="button"
                  className={`target-option-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedOtherId(c.id)}
                >
                  <div className="target-option-main">
                    <span
                      className="target-color-indicator"
                      style={{ backgroundColor: c.color || 'var(--ink)' }}
                    />
                    <span className="ticker-badge font-mono">{c.ticker || `E${c.id}`}</span>
                    <div className="target-option-names">
                      <strong className="target-option-full-name">{c.name}</strong>
                      <span className="target-option-sub font-mono">Renta Variable · BBV</span>
                    </div>
                  </div>

                  <div className="target-option-pricing font-mono">
                    <div className="pricing-values-wrap">
                      <div className="pricing-current">
                        <span className="pricing-label">Actual:</span>
                        <span className="pricing-val font-bold">Bs {c.price}</span>
                      </div>
                      <ArrowRight size={13} className="pricing-arrow" />
                      <div className={`pricing-projected ${delta < 0 ? 'text-down' : delta > 0 ? 'text-up' : ''}`}>
                        <span className="pricing-label">Proyectado:</span>
                        <span className="pricing-val font-bold">
                          Bs {nextPrice} ({delta > 0 ? `+${delta}` : delta})
                        </span>
                      </div>
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
        <div className="modal-actions-bar">
          <button className="btn-secondary-action" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary-action btn-execute-dual-card"
            disabled={!selectedOtherId}
            onClick={() => onConfirm(card.instanceId, selectedOtherId)}
          >
            {selectedComp
              ? `Confirmar Orden (Afectar a ${selectedComp.name})`
              : 'Selecciona una Contraparte'}
          </button>
        </div>
      </div>
    </div>
  );
}
