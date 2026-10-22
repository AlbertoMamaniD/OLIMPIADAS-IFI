import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export function ExitConfirmModal({ isOpen, onClose, onConfirm, inGame, roomCode }) {
  if (!isOpen) return null;

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className="terminal-modal-window modal-compact-window"
        role="alertdialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="modal-head">
          <div className={`modal-icon ${inGame ? 'modal-icon--down' : ''}`}>
            {inGame ? <AlertTriangle size={22} /> : <LogOut size={22} />}
          </div>
          <div className="modal-head-text">
            <span className="modal-eyebrow">{inGame ? 'Partida en curso' : 'Sala de espera'}</span>
            <h3 className="modal-title">
              {inGame ? '¿Abandonar la partida?' : '¿Salir de la sala de espera?'}
            </h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} title="Cerrar" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <div className="modal-note">
          {inGame ? (
            <span>
              La partida de la sala <span className="modal-code">{roomCode}</span> está <strong>en marcha</strong>. Si sales ahora, tu mesa quedará desconectada y tus turnos se pasarán solos cuando se acabe el tiempo.
            </span>
          ) : (
            <span>
              Tu mesa está registrada en la sala <span className="modal-code">{roomCode}</span>. Si sales, <strong>se liberará tu lugar</strong> y podrás cambiar de nombre o unirte a otra sala sin dejar registros duplicados.
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div className="modal-actions-row">
          <button type="button" className="btn-secondary-action" onClick={onClose}>
            Quedarme en la sala
          </button>

          <button type="button" className="btn-primary-action btn-modal-danger" onClick={onConfirm}>
            <LogOut size={16} />
            <span>Sí, salir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
