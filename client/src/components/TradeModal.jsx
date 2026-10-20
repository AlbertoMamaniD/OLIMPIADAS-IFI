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
      <div className="terminal-modal-window order-ticket-window" onClick={e => e.stopPropagation()}>
        {/* Encabezado de la Boleta */}
        <div className="modal-header-ribbon">
          <div className="modal-header-left">
            <div className={`order-type-chip ${isBuy ? 'chip-buy' : 'chip-sell'}`}>
              {isBuy ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="font-mono">ORDEN OFICIAL DE {isBuy ? 'COMPRA' : 'VENTA'}</span>
            </div>
            <div className="order-target-title">
              <span className="order-target-ticker font-mono">[{company.ticker || `E${company.id}`}]</span>
              <span className="order-target-name">{company.name}</span>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose} title="Cerrar boleta">
            <X size={18} />
          </button>
        </div>

        {/* Resumen de Cotización */}
        <div className="order-quote-bar font-mono">
          <div className="quote-bar-item">
            <span className="quote-bar-label">Precio Unitario: </span>
            <span className="quote-bar-val font-bold">Bs {price}</span>
          </div>
          <div className="quote-bar-divider">·</div>
          <div className="quote-bar-item">
            <span className="quote-bar-label">{isBuy ? 'Disponible en Broker: ' : 'En Cartera Actual: '}</span>
            <span className="quote-bar-val font-bold">{isBuy ? `${company.brokerShares} acc.` : `${held} acc.`}</span>
          </div>
        </div>

        {/* Formulario de Cantidad Sin Flechas y con Edición Libre */}
        <div className="order-input-section">
          <div className="order-input-label">
            <span>Volumen de títulos a operar:</span>
            <span className="order-input-max font-mono">
              Límite autorizado: <strong>{maxPossible} acc.</strong>
            </span>
          </div>
          <div className="order-input-row">
            <input
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
            <div className="order-validation-msg error font-mono">
              <AlertCircle size={12} />
              <span>La cantidad solicitada ({qtyStr}) excede el límite autorizado ({maxPossible} acc.).</span>
            </div>
          )}
          {maxPossible === 0 && (
            <div className="order-validation-msg error font-mono">
              <AlertCircle size={12} />
              <span>{isBuy ? 'No dispone de saldo suficiente para adquirir este activo.' : 'No posee acciones disponibles de esta empresa.'}</span>
            </div>
          )}
          {qtyStr === '' && maxPossible > 0 && (
            <div className="order-validation-msg info font-mono">
              <span>Ingrese una cantidad mínima de 1 acción.</span>
            </div>
          )}
        </div>

        {/* Liquidación Estimada */}
        <div className="order-settlement-card font-mono">
          <div className="settlement-row primary-settlement">
            <span className="settlement-label">
              {isBuy ? 'Importe Total a Liquidar:' : 'Importe Total a Acreditar:'}
            </span>
            <span className="settlement-val">
              Bs {totalCost.toLocaleString()}
            </span>
          </div>
          <div className="settlement-row text-muted">
            <span className="settlement-label">Saldo en Efectivo Actual:</span>
            <span className="settlement-val">Bs {cash.toLocaleString()}</span>
          </div>
          <div className="settlement-row text-muted settlement-result">
            <span className="settlement-label">Saldo Proyectado en Tesorería:</span>
            <span className="settlement-val text-ifi font-bold">
              Bs {(isBuy ? cash - totalCost : cash + totalCost).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="modal-actions-row">
          <button className="btn-secondary-action" onClick={onClose}>
            Descartar
          </button>
          <button
            className={`btn-primary-action ${isBuy ? 'btn-order-confirm-buy' : 'btn-order-confirm-sell'}`}
            disabled={!isValid}
            onClick={handleConfirm}
          >
            {isBuy ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>
              {maxPossible === 0
                ? 'Sin volumen disponible'
                : isValid
                ? `Confirmar ${isBuy ? 'Compra' : 'Venta'} (${numericQty} acc.)`
                : isTooHigh
                ? `Excede límite (máx. ${maxPossible})`
                : 'Ingrese cantidad (mín. 1)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
