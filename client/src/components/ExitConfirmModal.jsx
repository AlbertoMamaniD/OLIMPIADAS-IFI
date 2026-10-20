import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export function ExitConfirmModal({ isOpen, onClose, onConfirm, inGame, roomCode }) {
  if (!isOpen) return null;

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className="terminal-modal-window"
        style={{ maxWidth: '460px', padding: '24px 28px', textAlign: 'left' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: inGame ? 'var(--down-subtle)' : 'var(--ifi-subtle)',
                color: inGame ? 'var(--down)' : 'var(--ifi-secondary)',
                border: `1px solid ${inGame ? 'var(--down-border)' : 'var(--ifi-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {inGame ? <AlertTriangle size={20} /> : <LogOut size={20} />}
            </div>
            <div>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                BOLSA BOLIVIANA DE VALORES (BBV)
              </span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)' }}>
                {inGame ? '¿Abandonar Sesión en Curso?' : '¿Salir de la Sala de Espera?'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            className="btn-control"
            onClick={onClose}
            style={{ padding: '4px', border: 'none', background: 'transparent', color: 'var(--ink-secondary)', cursor: 'pointer' }}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <div
          style={{
            background: 'var(--surface-subtle)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: '12.5px',
            lineHeight: 1.5,
            color: 'var(--ink)',
            marginBottom: '20px',
          }}
        >
          {inGame ? (
            <span>
              La rueda bursátil de la sala <strong className="font-mono">{roomCode}</strong> se encuentra <strong>en marcha</strong>. Si sale ahora, su mesa quedará desconectada y sus turnos vencerán por tiempo límite reglamentario.
            </span>
          ) : (
            <span>
              Su mesa se encuentra registrada en la sala de espera <strong className="font-mono">{roomCode}</strong>. Si sale, <strong>su cupo será liberado</strong> de la lista de operadores, permitiéndole cambiar de nombre o unirse a otra sala sin dejar registros duplicados.
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn-control"
            style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 500 }}
            onClick={onClose}
          >
            Permanecer en Sala
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--down)',
              background: 'var(--down)',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={14} />
            <span>Confirmar Salida</span>
          </button>
        </div>
      </div>
    </div>
  );
}
