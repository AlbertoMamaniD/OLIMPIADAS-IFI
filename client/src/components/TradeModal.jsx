import React, { useState } from 'react';

export function TradeModal({ company, side, myTeam, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);

  if (!company) return null;

  const isBuy = side === 'buy';
  const price = company.price;
  const totalCost = qty * price;
  const cash = myTeam?.cash || 0;
  const held = myTeam?.holdings?.[company.id] || 0;

  const maxPossible = isBuy
    ? Math.min(company.brokerShares, Math.floor(cash / price))
    : held;

  const isValid = qty >= 1 && qty <= maxPossible;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(company.id, qty, side);
    }
  };

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div className="terminal-modal-window" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isBuy ? 'var(--up)' : 'var(--down)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              BOLETA DE OPERACIÓN BURSÁTIL
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, margin: '2px 0 0 0' }}>
              {isBuy ? 'Orden de Compra' : 'Orden de Venta'}: {company.name}
            </h3>
          </div>
          <button className="btn-control" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
          Precio unitario: <strong>Bs {price}</strong>
          {isBuy
            ? ` | Disponible en broker: ${company.brokerShares} acc.`
            : ` | Tenencia en cartera: ${held} acc.`}
        </div>

        <div className="form-field">
          <label className="form-label-institutional">Cantidad de acciones:</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              max={maxPossible || 1}
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value || '1', 10)))}
              className="form-input-institutional"
              style={{ fontSize: '16px', fontWeight: 600 }}
            />
            {maxPossible > 1 && (
              <button
                type="button"
                className="btn-control"
                onClick={() => setQty(maxPossible)}
              >
                Máximo ({maxPossible})
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-subtle)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--ink-secondary)' }}>
              {isBuy ? 'Liquidación total:' : 'Importe a acreditar:'}
            </span>
            <strong className="val-num" style={{ fontSize: '15px' }}>
              Bs {totalCost.toLocaleString()}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ink-secondary)' }}>
            <span>Saldo resultante en efectivo:</span>
            <span className="val-num">
              Bs {(isBuy ? cash - totalCost : cash + totalCost).toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary-action" style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary-action"
            style={{
              flex: 1,
              backgroundColor: isBuy ? 'var(--up)' : 'var(--down)',
              borderColor: isBuy ? 'var(--up)' : 'var(--down)',
            }}
            disabled={!isValid}
            onClick={handleConfirm}
          >
            Confirmar {isBuy ? 'Compra' : 'Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}
