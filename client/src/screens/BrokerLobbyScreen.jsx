import React, { useState } from 'react';
import { KeyRound, Users, Play, CheckCircle2, Clock, X, Bot, Layers, Globe } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';

export function BrokerLobbyScreen() {
  const { room, startGame, error, setError, addBot, removeTeam } = useGameSocket();
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
    <div className="broker-lobby">
      <div className="broker-lobby-grid">
        {/* PIN para proyectar */}
        <section className="pin-stage">
          <div className="pin-stage-top">
            <span className="pin-stage-eyebrow">
              <KeyRound size={16} />
              Código de la sala
            </span>
            <h1 className="pin-stage-title">Únete a la rueda bursátil</h1>
          </div>

          <div className="pin-terminal-display">
            <div className="pin-value-code font-mono">{room?.code}</div>
          </div>

          <ol className="pin-steps">
            <li>
              <span className="pin-step-num">1</span>
              <span>
                <Globe size={15} /> Abre <strong className="font-mono">{window.location.host}</strong>
              </span>
            </li>
            <li>
              <span className="pin-step-num">2</span>
              <span>Elige <strong>Mesa Inversionista</strong></span>
            </li>
            <li>
              <span className="pin-step-num">3</span>
              <span>Escribe el código y el nombre de tu equipo</span>
            </li>
          </ol>

          <div className="pin-stage-meta">
            <span>
              <Clock size={15} />
              <strong className="font-mono">{room?.settings?.turnSeconds}</strong> seg por turno
            </span>
            <span>
              <Layers size={15} />
              <strong className="font-mono">{room?.settings?.handSize}</strong> tarjetas por equipo
            </span>
          </div>
        </section>

        {/* Equipos registrados */}
        <section className="broker-lobby-teams terminal-card">
          <div className="terminal-card-header">
            <div className="header-icon-label">
              <Users size={18} />
              <span className="card-title-strong">
                Equipos conectados{' '}
                <span className="font-mono lobby-team-count">
                  {teams.length}
                  {room?.settings?.maxTeams ? ` / ${room.settings.maxTeams}` : ''}
                </span>
              </span>
            </div>
            <span className={`ui-badge ${canStart ? 'ui-badge--up' : 'ui-badge--gold'}`}>
              {canStart ? 'Listo para iniciar' : `Faltan ${minTeamsNeeded - teams.length}`}
            </span>
          </div>

          <div className="broker-lobby-body">
            {error && <div className="terminal-alert-error">{error}</div>}

            {teams.length === 0 ? (
              <div className="lobby-empty-state">
                <div className="lobby-waiting-loader" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <strong>Esperando a los primeros equipos…</strong>
                <span>Aparecerán aquí en cuanto ingresen el código.</span>
              </div>
            ) : (
              <div className="team-chips-grid">
                {teams.map(t => (
                  <div key={t.id} className="team-indicator-chip">
                    {t.isBot ? (
                      <Bot size={15} className="team-chip-bot" />
                    ) : (
                      <CheckCircle2 size={15} className="team-chip-check" />
                    )}
                    <span className="team-chip-name">{t.name}</span>
                    {t.isBot && <span className="team-chip-cpu">CPU</span>}
                    <button
                      type="button"
                      className="team-chip-remove"
                      onClick={() => removeTeam(t.id)}
                      title={`Retirar a ${t.name} de la sala`}
                      aria-label={`Retirar a ${t.name} de la sala`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="broker-lobby-actions">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => addBot()}
                title="Añadir una mesa operada por inteligencia artificial"
              >
                <Bot size={16} />
                <span>Añadir bot</span>
              </button>

              <button
                className="btn-primary-action"
                disabled={!canStart || starting}
                onClick={handleStart}
              >
                <Play size={17} />
                <span>
                  {starting
                    ? 'Iniciando rueda…'
                    : canStart
                    ? `Iniciar rueda con ${teams.length} equipos`
                    : `Se necesitan mínimo ${minTeamsNeeded} equipos`}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
