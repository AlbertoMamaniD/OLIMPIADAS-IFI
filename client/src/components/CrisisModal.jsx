import React from 'react';

export function CrisisModal({ decision, companies, myTeam, onResolve }) {
  if (!decision) return null;

  const company = companies.find(c => c.id === decision.companyId) || { name: 'Empresa' };
  const held = myTeam?.holdings?.[decision.companyId] || 0;
  const costToKeep = held * 20;
  const canAfford = (myTeam?.cash || 0) >= costToKeep;

  return (
    <div className="terminal-modal-overlay">
      <div className="terminal-modal-window" style={{ borderTop: '3px solid var(--down)' }}>
        <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--down)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          PROTOCOLO DE RESCATE BURSÁTIL
        </span>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, margin: '2px 0 10px 0' }}>
          Activación de Crisis de Piso: {company.name}
        </h3>

        <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          El activo ha tocado el piso reglamentario de <strong>Bs 10</strong>. Su equipo mantiene una posición de <strong>{held}</strong> acciones. La normativa exige adoptar una de las siguientes dos resoluciones:
        </p>

        <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--line)', padding: '14px', borderRadius: 'var(--border-radius-sm)', marginBottom: '18px', fontSize: '12.5px' }}>
          <div style={{ marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
            <strong style={{ color: 'var(--ink)' }}>Resolución 1: Conservar tenencia accionaria</strong>
            <div style={{ color: 'var(--ink-secondary)', marginTop: '2px' }}>
              Abona una tasa de rescate reglamentaria de <strong>Bs 20 por acción</strong> (Total: Bs {costToKeep}).
            </div>
            {!canAfford && (
              <div style={{ color: 'var(--down)', fontSize: '11px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                Fondos insuficientes en tesorería (Disponibilidad: Bs {myTeam?.cash || 0}).
              </div>
            )}
          </div>
          <div>
            <strong style={{ color: 'var(--ink)' }}>Resolución 2: Devolución forzosa al broker</strong>
            <div style={{ color: 'var(--ink-secondary)', marginTop: '2px' }}>
              Transfiere las {held} acciones al inventario del broker sin penalización ni costo.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary-action"
            style={{ flex: 1 }}
            onClick={() => onResolve(decision.companyId, 'return')}
          >
            Devolver al Broker
          </button>
          <button
            className="btn-primary-action"
            style={{ flex: 1, backgroundColor: 'var(--down)', borderColor: 'var(--down)' }}
            disabled={!canAfford}
            onClick={() => onResolve(decision.companyId, 'keep')}
          >
            Conservar (Bs {costToKeep})
          </button>
        </div>
      </div>
    </div>
  );
}
