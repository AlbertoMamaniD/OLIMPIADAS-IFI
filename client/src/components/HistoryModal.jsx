import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, TrendingUp, X, RefreshCw, Award, ShieldCheck } from 'lucide-react';

export function HistoryModal({ onClose }) {
  const [tab, setTab] = useState('leaderboard'); // 'leaderboard' | 'matches'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [matches, setMatches] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lbRes, matchesRes] = await Promise.all([
        fetch('/api/leaderboard?limit=25').then(r => r.json()).catch(() => ({ leaderboard: [] })),
        fetch('/api/history?limit=20').then(r => r.json()).catch(() => ({ matches: [] })),
      ]);

      setLeaderboard(lbRes.leaderboard || []);
      setMatches(matchesRes.matches || []);
    } catch (err) {
      setError('No fue posible sincronizar los registros oficiales de la rueda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className="terminal-modal-window history-modal-window"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '840px', width: '92%' }}
      >
        {/* Encabezado Institucional */}
        <div className="modal-header-ribbon">
          <div className="modal-header-left">
            <div className="order-type-chip chip-buy">
              <Trophy size={14} />
              <span className="font-mono">OLIMPIADAS IFI 2026 · LIBRO MAYOR BBV</span>
            </div>
            <div className="order-target-title">
              <span className="order-target-name">Cuadro de Honor y Actas de Rueda</span>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose} title="Cerrar ventana">
            <X size={18} />
          </button>
        </div>

        {/* Barra de Certificación de Auditoría */}
        <div className="history-audit-subbar font-mono">
          <div className="audit-subbar-left">
            <ShieldCheck size={14} className="text-ifi" />
            <span className="audit-status-dot" />
            <span className="audit-label">REGISTRO OFICIAL DE AUDITORÍA Y LIQUIDACIÓN BBV</span>
          </div>
          <button
            className="btn-refresh-history"
            onClick={fetchData}
            disabled={loading}
            title="Sincronizar actas y podios"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="history-nav-tabs">
          <button
            className={`history-tab-btn ${tab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setTab('leaderboard')}
          >
            <Award size={15} />
            <span>Clasificación General y Podios</span>
            {leaderboard.length > 0 && <span className="tab-counter-pill">{leaderboard.length}</span>}
          </button>
          <button
            className={`history-tab-btn ${tab === 'matches' ? 'active' : ''}`}
            onClick={() => setTab('matches')}
          >
            <Calendar size={15} />
            <span>Actas de Sesiones Concluidas</span>
            {matches.length > 0 && <span className="tab-counter-pill">{matches.length}</span>}
          </button>
        </div>

        {/* Cuerpo del Contenido */}
        <div className="history-body-content">
          {loading ? (
            <div className="history-loading-state font-mono">
              <RefreshCw size={26} className="animate-spin text-ifi" />
              <span>Sincronizando libro de órdenes y actas de liquidación...</span>
            </div>
          ) : error ? (
            <div className="history-error-state font-mono">
              <p>{error}</p>
              <button className="btn-secondary-action" onClick={fetchData} style={{ marginTop: 8 }}>
                Reintentar
              </button>
            </div>
          ) : tab === 'leaderboard' ? (
            /* TAB 1: CLASIFICACIÓN / LEADERBOARD */
            leaderboard.length === 0 ? (
              <div className="history-empty-state">
                <div className="empty-trophy-halo">
                  <Trophy size={48} className="empty-icon text-ifi" />
                </div>
                <h4>Sin Ruedas Oficiales Registradas</h4>
                <p>
                  Al concluir una sesión de negociación en el parqué, los balances patrimoniales de cada mesa se liquidarán y certificarán aquí automáticamente.
                </p>
              </div>
            ) : (
              <div className="history-table-wrapper">
                <table className="history-data-table font-mono">
                  <thead>
                    <tr>
                      <th style={{ width: '70px' }}>PUESTO</th>
                      <th>MESA / EQUIPO COMPETIDOR</th>
                      <th style={{ textAlign: 'center' }}>RUEDAS</th>
                      <th style={{ textAlign: 'center' }}>1º LUGAR</th>
                      <th style={{ textAlign: 'center' }}>PODIOS (TOP 3)</th>
                      <th style={{ textAlign: 'right' }}>MÁX. PATRIMONIO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((team, idx) => {
                      const isFirst = idx === 0;
                      const isSecond = idx === 1;
                      const isThird = idx === 2;

                      return (
                        <tr key={team.team_name || idx} className={isFirst ? 'row-champion' : ''}>
                          <td>
                            <div className="rank-badge-cell">
                              {isFirst && <span className="rank-crown gold">🥇 1º</span>}
                              {isSecond && <span className="rank-crown silver">🥈 2º</span>}
                              {isThird && <span className="rank-crown bronze">🥉 3º</span>}
                              {!isFirst && !isSecond && !isThird && (
                                <span className="rank-num">#{idx + 1}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="team-cell-title">
                              <span className="team-cell-name font-bold">{team.team_name}</span>
                              {team.is_bot && <span className="badge-bot font-mono">SIMULACIÓN</span>}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>{team.matches_played}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--ifi-green)' }}>
                            {team.championships_won || 0}
                          </td>
                          <td style={{ textAlign: 'center' }}>{team.podium_finishes || 0}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            Bs {Number(team.highest_net_worth || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* TAB 2: ACTAS DE RUEDAS / PARTIDAS */
            matches.length === 0 ? (
              <div className="history-empty-state">
                <div className="empty-trophy-halo">
                  <Calendar size={48} className="empty-icon text-ifi" />
                </div>
                <h4>No hay actas archivadas</h4>
                <p>
                  Las partidas concluidas con su detalle de liquidación por títulos y saldos en efectivo aparecerán en esta sección.
                </p>
              </div>
            ) : (
              <div className="history-matches-list">
                {matches.map(m => {
                  const dateStr = m.finished_at || m.created_at;
                  const dateFormatted = dateStr ? new Date(dateStr).toLocaleString() : 'Sesión reciente';

                  return (
                    <div key={m.id || m.room_code} className="history-match-card">
                      <div className="match-card-top font-mono">
                        <div className="match-room-tag">
                          <span>SALA {m.room_code}</span>
                          <span className="match-status-pill">LIQUIDACIÓN CERTIFICADA</span>
                        </div>
                        <div className="match-date-tag">
                          <Calendar size={12} />
                          <span>{dateFormatted}</span>
                        </div>
                      </div>

                      <div className="match-card-body">
                        <div className="match-winner-highlight">
                          <Trophy size={20} className="text-amber-500" />
                          <div className="winner-details">
                            <span className="winner-label font-mono">EQUIPO GANADOR:</span>
                            <span className="winner-name font-bold">{m.winner_team_name}</span>
                          </div>
                          <div className="winner-amount font-mono">
                            Bs {Number(m.winner_net_worth || 0).toLocaleString()}
                          </div>
                        </div>

                        {/* Top 3 Standings preview */}
                        {m.final_standings && Array.isArray(m.final_standings) && (
                          <div className="match-standings-preview font-mono">
                            {m.final_standings.slice(0, 3).map(s => (
                              <div key={s.id || s.name} className="standing-mini-chip">
                                <span className="mini-rank">#{s.rank}</span>
                                <span className="mini-name">{s.name}</span>
                                <span className="mini-val">Bs {Number(s.netWorth || 0).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Pie Institucional Limpio */}
        <div className="history-modal-footer font-mono">
          <div className="footer-institutional-seal">
            <span className="seal-text">Bolsa Boliviana de Valores S.A. · Olimpiadas IFI 2026</span>
          </div>
          <button className="btn-close-history-modal" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
