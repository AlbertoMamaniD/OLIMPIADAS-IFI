import React, { useState } from 'react';
import { KeyRound, Users, Play, CheckCircle2, Clock } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

export function BrokerLobbyScreen() {
  const { room, startGame, error, setError, addBot } = useGameSocket();
  const [starting, setStarting] = useState(false);

  const teams = room?.teams || [];
  const minTeamsNeeded = 2;
  const canStart = teams.length >= minTeamsNeeded;

  const handleStart = async () => {
    setError('');
    setStarting(true);
    try {
      await startGame();
    } catch (err) {
      // error handled in context
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="terminal-centered">
      <div className="terminal-panel" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 className="terminal-heading">Apertura de Rueda Bursátil</h1>
        <p className="terminal-subheading">
          Proyecte el código PIN en la pantalla del auditorio para el ingreso de las mesas operadoras:
        </p>

        {/* PIN Institucional */}
        <div className="pin-terminal-display">
          <div className="pin-label-caption">
            <KeyRound size={13} color="var(--ifi-secondary)" />
            <span>CÓDIGO DE ACCESO (PIN)</span>
          </div>
          <div className="pin-value-code">{room?.code}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            <Clock size={12} />
            <span>{room?.settings?.turnSeconds} seg/turno · {room?.settings?.handSize} tarjetas/equipo</span>
          </div>
        </div>

        {error && <div className="terminal-alert-error">{error}</div>}

        {/* Equipos registrados */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              <Users size={14} color="var(--ifi-secondary)" />
              <span>
                Equipos Registrados ({teams.length}
                {room?.settings?.maxTeams ? ` / ${room.settings.maxTeams}` : ''})
              </span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-control"
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => addBot()}
                title="Añadir una mesa operada por inteligencia artificial"
              >
                + Añadir Bot (CPU)
              </button>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: canStart ? 'var(--up)' : 'var(--accent)' }}>
                {canStart ? 'LISTO' : `FALTAN ${minTeamsNeeded - teams.length}`}
              </span>
            </div>
          </div>

          {teams.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--ink-muted)',
                fontStyle: 'italic',
                fontSize: '13px',
              }}
            >
              Aguardando conexión de las primeras terminales estudiantiles...
            </div>
          ) : (
            <div className="team-chips-grid">
              {teams.map(t => (
                <div key={t.id} className="team-indicator-chip">
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.name}
                  </span>
                  <CheckCircle2 size={13} color="var(--up)" />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn-primary-action"
          style={{ width: '100%', fontSize: '14px', padding: '12px' }}
          disabled={!canStart || starting}
          onClick={handleStart}
        >
          <Play size={16} />
          <span>
            {starting
              ? 'Iniciando Rueda...'
              : canStart
              ? `Iniciar Rueda con ${teams.length} Equipos`
              : `Requiere mínimo ${minTeamsNeeded} equipos`}
          </span>
        </button>
      </div>
    </div>
  );
}
