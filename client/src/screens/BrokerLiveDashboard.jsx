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

  return (
    <div style={{ padding: '18px 24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Barra de Control de la Mesa Central */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'var(--surface)',
          padding: '12px 20px',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--line)',
          marginBottom: '18px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'var(--ifi-subtle)',
              border: '1px solid var(--ifi-secondary)',
              padding: '8px',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--ifi-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sliders size={20} />
          </div>
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--ink-secondary)', letterSpacing: '0.08em' }}>
              MESA DE CONTROL · SALA {room?.code}
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, marginTop: '2px' }}>
              Ronda de Negociación · Turno {game.turnNumber} · En turno:{' '}
              <span style={{ color: 'var(--ifi-secondary)' }}>{currentTeam.name}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TimerBadge
            seconds={clock.timeRemaining}
            paused={game.paused || game.manualPause}
            isAuction={!!game.auction}
          />

          <button
            className="btn-control"
            style={{
              borderColor: game.manualPause ? 'var(--up-border)' : 'var(--line-strong)',
              color: game.manualPause ? 'var(--up)' : 'var(--ink)',
            }}
            onClick={togglePause}
          >
            {game.manualPause ? <Play size={13} /> : <Pause size={13} />}
            <span>{game.manualPause ? 'Reanudar' : 'Pausar'}</span>
          </button>

          <button
            className="btn-control"
            style={{ color: 'var(--down)', borderColor: 'var(--down-border)' }}
            onClick={() => setShowSkipModal(true)}
            title="Forzar el fin del turno actual si el equipo se demora"
          >
            <SkipForward size={13} />
            <span>Saltar Turno</span>
          </button>
        </div>
      </div>

      {showSkipModal && (
        <div className="terminal-modal-overlay" onClick={() => setShowSkipModal(false)}>
          <div
            className="terminal-modal-window"
            style={{ maxWidth: '440px', padding: '24px 28px', textAlign: 'left' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'var(--down-subtle)',
                  color: 'var(--down)',
                  border: '1px solid var(--down-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <SkipForward size={18} />
              </div>
              <div>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  MESA DE CONTROL (BROKER)
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)' }}>
                  ¿Forzar Término de Turno?
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'var(--ink)', marginBottom: '20px' }}>
              Se forzará la conclusión inmediata del turno de <strong>{currentTeam.name}</strong>, descartando una tarjeta al azar si no jugaron ninguna y transfiriendo la custodia al siguiente equipo.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-control"
                onClick={() => setShowSkipModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--down)',
                  background: 'var(--down)',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setShowSkipModal(false);
                  skipTurn();
                }}
              >
                Forzar Término
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '18px' }}>
        {/* Columna Izquierda: Cotizaciones y Gráfico */}
        <div>
          <div className="terminal-card">
            <div className="terminal-card-header">
              <div className="header-icon-label">
                <LineChart size={15} color="var(--ifi-secondary)" />
                <span>Cotizaciones del Panel de Control</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)' }}>
                {game.auction ? 'SUBASTA ACTIVA' : 'FASE: ' + (currentTurn?.phase || 'ESPERA').toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {game.companies.map(c => {
                const history = c.priceHistory || [];
                const prev = history.length > 1 ? history[history.length - 2] : c.price;
                const delta = c.price - prev;

                return (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--surface-subtle)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span
                        style={{
                          backgroundColor: c.color || 'var(--ink)',
                          color: '#ffffff',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '2px',
                        }}
                      >
                        {c.ticker}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>
                        Broker: {c.brokerShares}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '13.5px', marginBottom: '2px' }}>
                      {c.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span className="val-num" style={{ fontSize: '18px', fontWeight: 700 }}>
                        Bs {c.price}
                      </span>
                      {delta !== 0 && (
                        <span className={`delta-pill ${delta > 0 ? 'positive' : 'negative'}`}>
                          {delta > 0 ? `+${delta}` : `${delta}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <PriceChart companies={game.companies} />
        </div>

        {/* Columna Derecha: Ranking en vivo y Auditoría */}
        <div>
          {/* Clasificación en Vivo */}
          <div className="terminal-card">
            <div className="terminal-card-header">
              <div className="header-icon-label">
                <Trophy size={15} color="var(--accent)" />
                <span>Posiciones de Rendimiento en Vivo</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)' }}>
                {ranking.length} MESAS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {ranking.map((t, idx) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: t.id === currentTurn?.teamId ? 'var(--ifi-subtle)' : 'var(--surface-subtle)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: '12.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, width: '22px', color: idx === 0 ? 'var(--accent)' : 'var(--ink-secondary)' }}>
                      {idx + 1}.º
                    </span>
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>{t.name}</strong>
                      {t.eliminated && (
                        <span style={{ color: 'var(--down)', fontSize: '10px', marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>
                          [LIQUIDADO]
                        </span>
                      )}
                      {t.id === currentTurn?.teamId && (
                        <span style={{ color: 'var(--ifi-secondary)', fontSize: '10px', marginLeft: '6px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          [TURNO]
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="val-num" style={{ fontWeight: 700 }}>
                      Bs {t.totalValue.toLocaleString()}
                    </span>
                    <div style={{ fontSize: '10.5px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Disp: Bs {t.cash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <EventLog log={game.log} />
        </div>
      </div>
    </div>
  );
}
