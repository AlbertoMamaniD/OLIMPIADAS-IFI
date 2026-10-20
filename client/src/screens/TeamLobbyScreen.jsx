import React from 'react';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

export function TeamLobbyScreen({ onOpenRules }) {
  const { room, myTeam } = useGameSocket();

  const teams = room?.teams || [];

  return (
    <div className="terminal-centered">
      <div className="terminal-panel" style={{ maxWidth: '520px', textAlign: 'center' }}>
        <h2 className="terminal-heading">
          Mesa Registrada: <span style={{ color: 'var(--ifi-secondary)' }}>{myTeam?.name}</span>
        </h2>
        <p className="terminal-subheading">
          Conexión establecida con la sala <strong>{room?.code}</strong>. Permanezca en esta pantalla hasta la apertura de la rueda por parte del broker.
        </p>

        <div
          style={{
            background: 'var(--surface-subtle)',
            border: '1px solid var(--line)',
            borderLeft: '3px solid var(--ifi-secondary)',
            padding: '14px 18px',
            borderRadius: 'var(--border-radius-sm)',
            marginBottom: '20px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ifi-secondary)', fontWeight: 700 }}>
              <Clock size={14} />
              <span>ESTADO: EN ESPERA DE APERTURA</span>
            </span>
            <span style={{ color: 'var(--ink-secondary)' }}>{teams.length} equipos en sala</span>
          </div>
        </div>

        {/* Equipos registrados */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
            OPERADORES INSCRITOS EN SALA:
          </div>
          <div className="team-chips-grid">
            {teams.map(t => (
              <div
                key={t.id}
                className={`team-indicator-chip ${t.id === myTeam?.id ? 'self' : ''}`}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.name}
                </span>
                <CheckCircle2 size={12} color="var(--up)" />
              </div>
            ))}
          </div>
        </div>

        <button className="btn-secondary-action" style={{ width: '100%' }} onClick={onOpenRules}>
          <BookOpen size={14} />
          <span>Consultar Reglamento de Operación</span>
        </button>
      </div>
    </div>
  );
}
