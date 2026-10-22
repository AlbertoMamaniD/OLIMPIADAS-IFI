import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, X, AlertCircle } from 'lucide-react';

export function TradeModal({ company, side, myTeam, onClose, onConfirm }) {
  const [qtyStr, setQtyStr] = useState('1');

  if (!company) return null;

  const isBuy = side === 'buy';
  const price = company.price;
  const cash = myTeam?.cash || 0;
  const held = myTeam?.holdings?.[company.id] || 0;

  const maxPossible = isBuy
    ? Math.min(company.brokerShares, Math.floor(cash / price))
    : held;

  const numericQty = parseInt(qtyStr, 10);
  const isTooHigh = !isNaN(numericQty) && numericQty > maxPossible;
  const isTooLow = isNaN(numericQty) || numericQty < 1;
  const isValid = maxPossible >= 1 && !isTooHigh && !isTooLow;

  const totalCost = (isValid ? numericQty : 0) * price;

  const handleInputChange = e => {
    let raw = e.target.value.replace(/\D/g, ''); // puro número, sin signos ni letras
    raw = raw.replace(/^0+/, ''); // evita ceros a la izquierda (evita 0, 00, 01 -> 1)
    setQtyStr(raw);
  };

  const handleBlur = () => {
    const val = parseInt(qtyStr, 10);
    if (isNaN(val) || val < 1) {
      setQtyStr(maxPossible >= 1 ? '1' : '0');
    } else if (val > maxPossible) {
      setQtyStr(String(maxPossible));
    } else {
      setQtyStr(String(val));
    }
  };

  const setAmount = num => {
    if (maxPossible <= 0) return;
    const clamped = Math.max(1, Math.min(maxPossible, num));
    setQtyStr(String(clamped));
  };

  const addAmount = delta => {
    if (maxPossible <= 0) return;
    const current = parseInt(qtyStr, 10) || 0;
    setAmount(current + delta);
  };

  const handleConfirm = () => {
    if (isValid && numericQty >= 1 && numericQty <= maxPossible) {
      onConfirm(company.id, numericQty, side);
    }
  };

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className={`terminal-modal-window order-ticket-window ${isBuy ? 'is-buy' : 'is-sell'}`}
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado de la Boleta */}
        <div className="modal-head">
          <div className={`modal-icon ${isBuy ? 'modal-icon--up' : 'modal-icon--down'}`}>
            {isBuy ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
          </div>
          <div className="modal-head-text">
            <span className={`modal-eyebrow ${isBuy ? 'modal-eyebrow--up' : 'modal-eyebrow--down'}`}>
              Orden de {isBuy ? 'compra' : 'venta'}
            </span>
            <div className="order-target-title">
              <h3 className="modal-title">{company.name}</h3>
              <span className="order-target-ticker">{company.ticker || `E${company.id}`}</span>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose} title="Cerrar boleta" aria-label="Cerrar boleta">
            <X size={20} />
          </button>
        </div>

        {/* Resumen de Cotización */}
        <div className="order-quote-grid">
          <div className="order-quote-tile">
            <span className="order-quote-label">Precio por acción</span>
            <span className="order-quote-val">Bs {price}</span>
          </div>
          <div className="order-quote-tile">
            <span className="order-quote-label">{isBuy ? 'Disponibles en el broker' : 'Tus acciones'}</span>
            <span className="order-quote-val">
              {isBuy ? company.brokerShares : held}
              <small>acc.</small>
            </span>
          </div>
        </div>

        {/* Formulario de Cantidad Sin Flechas y con Edición Libre */}
        <div className="order-input-section">
          <label className="order-input-label" htmlFor="order-qty-input">
            <span>Cantidad de acciones</span>
            <span className="order-input-max">
              Máximo: <strong>{maxPossible}</strong>
            </span>
          </label>
          <div className="order-input-row">
            <input
              id="order-qty-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={qtyStr}
              placeholder={maxPossible >= 1 ? "1" : "0"}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={e => e.target.select()}
              onKeyDown={e => {
                if (e.key === 'Enter' && isValid) {
                  handleConfirm();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                }
              }}
              onWheel={e => e.target.blur()}
              disabled={maxPossible === 0}
              className={`order-quantity-input font-mono ${isTooHigh ? 'input-error' : ''}`}
              autoFocus
            />
            <div className="quick-qty-buttons">
              <button
                type="button"
                className="btn-quick-qty"
                onClick={() => addAmount(1)}
                disabled={maxPossible <= 0 || (numericQty || 0) >= maxPossible}
                title="Añadir 1 acción"
              >
                +1
              </button>
              {maxPossible >= 5 && (
                <button
                  type="button"
                  className="btn-quick-qty"
                  onClick={() => addAmount(5)}
                  disabled={maxPossible <= 0 || (numericQty || 0) + 5 > maxPossible}
                  title="Añadir 5 acciones"
                >
                  +5
                </button>
              )}
              {maxPossible > 1 && (
                <button
                  type="button"
                  className="btn-quick-qty btn-quick-max"
                  onClick={() => setAmount(maxPossible)}
                  title="Establecer el volumen máximo posible"
                >
                  MÁX ({maxPossible})
                </button>
              )}
            </div>
          </div>

          {/* Avisos de Validación en Tiempo Real */}
          {isTooHigh && (
            <div className="order-validation-msg error">
              <AlertCircle size={14} />
              <span>La cantidad ({qtyStr}) supera el máximo permitido ({maxPossible} acc.).</span>
            </div>
          )}
          {maxPossible === 0 && (
            <div className="order-validation-msg error">
              <AlertCircle size={14} />
              <span>{isBuy ? 'No tienes efectivo suficiente para comprar esta acción.' : 'No tienes acciones de esta empresa.'}</span>
            </div>
          )}
          {qtyStr === '' && maxPossible > 0 && (
            <div className="order-validation-msg info">
              <span>Ingresa al menos 1 acción.</span>
            </div>
          )}
        </div>

        {/* Liquidación Estimada */}
        <div className="order-settlement-card">
          <div className="settlement-row primary-settlement">
            <span className="settlement-label">
              {isBuy ? 'Total a pagar' : 'Total a recibir'}
            </span>
            <span className="settlement-val">
              Bs {totalCost.toLocaleString()}
            </span>
          </div>
          <div className="settlement-row">
            <span className="settlement-label">Efectivo actual</span>
            <span className="settlement-val">Bs {cash.toLocaleString()}</span>
          </div>
          <div className="settlement-row settlement-result">
            <span className="settlement-label">Efectivo después de la orden</span>
            <span className="settlement-val">
              Bs {(isBuy ? cash - totalCost : cash + totalCost).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="modal-actions-row">
          <button className="btn-secondary-action" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`btn-primary-action ${isBuy ? 'btn-order-confirm-buy' : 'btn-order-confirm-sell'}`}
            disabled={!isValid}
            onClick={handleConfirm}
          >
            {isBuy ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            <span>
              {maxPossible === 0
                ? 'Sin acciones disponibles'
                : isValid
                ? `Confirmar ${isBuy ? 'compra' : 'venta'} · ${numericQty} acc.`
                : isTooHigh
                ? `Supera el máximo (${maxPossible})`
                : 'Ingresa una cantidad'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
