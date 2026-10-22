import React from 'react';
import { Play, Pause, SkipForward, Trophy, LineChart, Sliders } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';
import { TimerBadge } from '../components/TimerBadge';
import { PriceChart } from '../components/PriceChart';
import { EventLog } from '../components/EventLog';

export function BrokerLiveDashboard() {
  const { room, game, clock, togglePause, skipTurn } = useGameSocket();
  const [showSkipModal, setShowSkipModal] = React.useState(false);

  if (!game) return null;

  const currentTurn = game.currentTurn;
  const currentTeam = game.teams.find(t => t.id === currentTurn?.teamId) || { name: 'Desconocido' };

  // Ranking patrimonial en tiempo real
  const ranking = [...game.teams].map(team => {
    let stockValue = 0;
    game.companies.forEach(c => {
      const held = team.holdings?.[c.id] || 0;
      stockValue += held * c.price;
    });
    return {
      ...team,
      stockValue,
      totalValue: team.cash + stockValue,
    };
  }).sort((a, b) => b.totalValue - a.totalValue);


  // Solo presentación: nombre legible de la fase del turno
  const phaseLabels = { before: 'Antes de la tarjeta', after: 'Después de la tarjeta' };
  const phaseText = currentTurn?.phase ? phaseLabels[currentTurn.phase] || currentTurn.phase : 'En espera';

  return (
    <div className="broker-dashboard-wrapper">
      {/* Barra de Control de la Mesa Central */}
      <div className="broker-control-bar">
        <div className="broker-control-info">
          <div className="broker-control-icon">
            <Sliders size={20} />
          </div>
          <div className="broker-control-text">
            <span className="ui-eyebrow">
              Mesa de control · Sala <span className="font-mono">{room?.code}</span>
            </span>
            <div className="broker-control-title">
              <span>
                Turno <span className="font-mono">{game.turnNumber}</span>
              </span>
              <span className="broker-control-sep" aria-hidden="true" />
              <span className="broker-control-current">
                <span className="broker-turn-dot" />
                En turno: <strong>{currentTeam.name}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="broker-control-actions">
          <TimerBadge
            seconds={clock.timeRemaining}
            paused={game.paused || game.manualPause}
            isAuction={!!game.auction}
          />

          <button
            className={`broker-ctrl-btn ${game.manualPause ? 'is-resume' : ''}`}
            onClick={togglePause}
          >
            {game.manualPause ? <Play size={16} /> : <Pause size={16} />}
            <span>{game.manualPause ? 'Reanudar' : 'Pausar'}</span>
          </button>

          <button
            className="broker-ctrl-btn is-danger"
            onClick={() => setShowSkipModal(true)}
            title="Forzar el fin del turno actual si el equipo se demora"
          >
            <SkipForward size={16} />
            <span>Saltar turno</span>
          </button>
        </div>
      </div>

      {showSkipModal && (
        <div className="terminal-modal-overlay" onClick={() => setShowSkipModal(false)}>
          <div className="terminal-modal-window broker-skip-modal" onClick={e => e.stopPropagation()}>
            <div className="broker-skip-head">
              <div className="broker-skip-icon">
                <SkipForward size={20} />
              </div>
              <div>
                <span className="ui-eyebrow">Mesa de control</span>
                <h3>¿Saltar el turno actual?</h3>
              </div>
            </div>

            <p className="broker-skip-text">
              Se terminará de inmediato el turno de <strong>{currentTeam.name}</strong>. Si no jugaron
              ninguna tarjeta, se descartará una al azar y el turno pasará al siguiente equipo.
            </p>

            <div className="broker-skip-actions">
              <button type="button" className="btn-secondary-action" onClick={() => setShowSkipModal(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary-action btn-danger-solid"
                onClick={() => {
                  setShowSkipModal(false);
                  skipTurn();
                }}
              >
                <SkipForward size={16} />
                Forzar término
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Principal */}
      <div className="broker-dashboard-grid">
        {/* Columna Izquierda: Cotizaciones y Gráfico */}
        <div className="broker-column-main">
          <div className="terminal-card">
            <div className="terminal-card-header">
              <div className="header-icon-label">
                <LineChart size={18} />
                <span className="card-title-strong">Cotizaciones</span>
              </div>
              <span className={`ui-badge ${game.auction ? 'ui-badge--gold' : 'ui-badge--brand'}`}>
                {game.auction ? 'Subasta activa' : `Fase: ${phaseText}`}
              </span>
            </div>

            <div className="broker-quote-grid">
              {game.companies.map(c => {
                const history = c.priceHistory || [];
                const prev = history.length > 1 ? history[history.length - 2] : c.price;
                const delta = c.price - prev;

                return (
                  <div
                    key={c.id}
                    className="broker-quote-tile"
                    style={{ '--company-color': c.color || 'var(--ink-muted)' }}
                  >
                    <div className="broker-quote-top">
                      <span className="broker-quote-ticker font-mono">{c.ticker}</span>
                      {delta !== 0 && (
                        <span className={`broker-quote-delta font-mono ${delta > 0 ? 'is-up' : 'is-down'}`}>
                          {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
                        </span>
                      )}
                    </div>

                    <div className="broker-quote-name" title={c.name}>
                      {c.name}
                    </div>

                    <div className="broker-quote-price val-num">
                      <span className="broker-quote-currency">Bs</span> {c.price}
                    </div>

                    <div className="broker-quote-foot">
                      Broker: <span className="font-mono">{c.brokerShares}</span> acc.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <PriceChart companies={game.companies} />
        </div>

        {/* Columna Derecha: Ranking en vivo y Auditoría */}
        <div className="broker-column-side">
          {/* Clasificación en Vivo */}
          <div className="terminal-card">
            <div className="terminal-card-header">
              <div className="header-icon-label broker-rank-title">
                <Trophy size={18} />
                <span className="card-title-strong">Clasificación en vivo</span>
              </div>
              <span className="ui-badge">
                <span className="font-mono">{ranking.length}</span> equipos
              </span>
            </div>

            <ol className="broker-rank-list">
              {ranking.map((t, idx) => (
                <li
                  key={t.id}
                  className={`broker-rank-row ${t.id === currentTurn?.teamId ? 'is-current' : ''} ${
                    idx < 3 ? `rank-top rank-${idx + 1}` : ''
                  }`}
                >
                  <span className="broker-rank-pos font-mono">{idx + 1}</span>
                  <div className="broker-rank-team">
                    <strong>{t.name}</strong>
                    <div className="broker-rank-tags">
                      {t.id === currentTurn?.teamId && <span className="ui-badge ui-badge--brand">En turno</span>}
                      {t.eliminated && <span className="ui-badge ui-badge--down">Liquidado</span>}
                    </div>
                  </div>
                  <div className="broker-rank-value">
                    <span className="val-num">Bs {t.totalValue.toLocaleString()}</span>
                    <small>
                      Efectivo <span className="font-mono">Bs {t.cash}</span>
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <EventLog log={game.log} />
        </div>
      </div>
    </div>
  );
}
