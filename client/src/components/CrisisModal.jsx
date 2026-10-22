import React from 'react';
import { AlertTriangle, ShieldCheck, Undo2, AlertCircle } from 'lucide-react';

export function CrisisModal({ decision, companies, myTeam, onResolve }) {
  if (!decision) return null;

  const company = companies.find(c => c.id === decision.companyId) || { name: 'Empresa' };
  const held = myTeam?.holdings?.[decision.companyId] || 0;
  const costToKeep = held * 20;
  const canAfford = (myTeam?.cash || 0) >= costToKeep;

  return (
    <div className="terminal-modal-overlay">
      <div className="terminal-modal-window crisis-modal-window" role="alertdialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-icon modal-icon--down">
            <AlertTriangle size={22} />
          </div>
          <div className="modal-head-text">
            <span className="modal-eyebrow modal-eyebrow--down">Crisis de piso · Decisión obligatoria</span>
            <h3 className="modal-title">{company.name} tocó el piso de Bs 10</h3>
            <p className="modal-subtitle">
              Tu equipo tiene <strong className="font-mono">{held}</strong> acciones de esta empresa. Elige qué hacer con ellas:
            </p>
          </div>
        </div>

        <div className="crisis-options">
          <div className="crisis-option crisis-option--keep">
            <span className="crisis-option-title">
              <ShieldCheck size={16} /> Conservar
            </span>
            <span className="crisis-option-cost">Bs {costToKeep}</span>
            <span className="crisis-option-desc">
              Pagas <strong>Bs 20 por acción</strong> y te quedas con tus acciones.
            </span>
            {!canAfford && (
              <span className="crisis-option-warning">
                <AlertCircle size={13} />
                <span>No te alcanza el efectivo (tienes Bs {myTeam?.cash || 0}).</span>
              </span>
            )}
          </div>
          <div className="crisis-option crisis-option--return">
            <span className="crisis-option-title">
              <Undo2 size={16} /> Devolver
            </span>
            <span className="crisis-option-cost">Bs 0</span>
            <span className="crisis-option-desc">
              Entregas las {held} acciones al broker, sin costo ni penalización.
            </span>
          </div>
        </div>

        <div className="modal-actions-row">
          <button
            className="btn-secondary-action"
            onClick={() => onResolve(decision.companyId, 'return')}
          >
            Devolver al broker
          </button>
          <button
            className="btn-primary-action btn-modal-danger"
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
