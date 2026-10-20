import React, { useState } from 'react';

export function CardTargetModal({ card, companies, onClose, onConfirm }) {
  const targetCompany = companies.find(c => c.id === card.targetCompanyId);
  const otherCompanies = companies.filter(c => c.id !== card.targetCompanyId);

  const [selectedOtherId, setSelectedOtherId] = useState(
    otherCompanies.length > 0 ? otherCompanies[0].id : ''
  );

  const cardLabels = {
    '80_40': '80 / 40 (+80 objetivo principal, -40 secundaria elegida)',
    '2x': '2x (Duplica objetivo principal, divide a la mitad secundaria elegida)',
    'half_2x': '1/2x (Divide a la mitad principal, duplica secundaria elegida)',
  };

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div className="terminal-modal-window" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SELECCIÓN DE ACTIVO SECUNDARIO
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, margin: '2px 0 0 0' }}>
              Definir empresa contraparte
            </h3>
          </div>
          <button className="btn-control" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={onClose}>
            Cerrar
          </button>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          Efecto de la tarjeta: <strong>{cardLabels[card.cardId] || card.cardId}</strong>.
          <br />
          Empresa principal asignada: <strong style={{ color: 'var(--ink)' }}>{targetCompany?.name}</strong>.
        </p>

        <div className="form-field">
          <label className="form-label-institutional">Empresa contraparte afectada:</label>
          <select
            className="form-input-institutional"
            value={selectedOtherId}
            onChange={e => setSelectedOtherId(e.target.value)}
          >
            {otherCompanies.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (Cotización actual: Bs {c.price})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary-action" style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary-action"
            style={{ flex: 1 }}
            disabled={!selectedOtherId}
            onClick={() => onConfirm(card.instanceId, selectedOtherId)}
          >
            Ejecutar Tarjeta
          </button>
        </div>
      </div>
    </div>
  );
}
