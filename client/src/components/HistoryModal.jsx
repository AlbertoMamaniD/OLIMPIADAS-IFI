import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  TrendingUp,
  X,
  RefreshCw,
  Award,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  DollarSign,
} from 'lucide-react';

export function HistoryModal({ onClose }) {
  const [tab, setTab] = useState('leaderboard'); // 'leaderboard' | 'matches'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [matches, setMatches] = useState([]);
  const [filterHumanOnly, setFilterHumanOnly] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lbRes, matchesRes] = await Promise.all([
        fetch('/api/leaderboard?limit=30').then(r => r.json()).catch(() => ({ leaderboard: [] })),
        fetch('/api/history?limit=25').then(r => r.json()).catch(() => ({ matches: [] })),
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

  const displayedLeaderboard = filterHumanOnly
    ? leaderboard.filter(t => !t.is_bot)
    : leaderboard;

  const highestRecord = leaderboard.reduce(
    (max, t) => Math.max(max, Number(t.highest_net_worth || 0)),
    0
  );

  const toggleExpandMatch = id => {
    setExpandedMatchId(prev => (prev === id ? null : id));
  };

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div
        className="terminal-modal-window history-modal-window"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="history-head">
          <div className="modal-head">
            <div className="modal-icon modal-icon--gold history-head-icon">
              <Trophy size={24} />
            </div>
            <div className="modal-head-text">
              <span className="modal-eyebrow modal-eyebrow--gold">Olimpiadas IFI 2026</span>
              <h2 className="modal-title">Cuadro de honor</h2>
              <p className="modal-subtitle">Los mejores equipos y el resultado de cada partida jugada.</p>
            </div>
            <button
              className="btn-refresh-history"
              onClick={fetchData}
              disabled={loading}
              title="Actualizar clasificación y partidas"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
            <button className="btn-modal-close" onClick={onClose} title="Cerrar ventana" aria-label="Cerrar ventana">
              <X size={20} />
            </button>
          </div>

          {/* Pestañas */}
          <div className="history-nav-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'leaderboard'}
              className={`history-tab-btn ${tab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setTab('leaderboard')}
            >
              <Award size={16} />
              <span>Clasificación</span>
              {leaderboard.length > 0 && <span className="tab-counter-pill">{leaderboard.length}</span>}
            </button>
            <button
              role="tab"
              aria-selected={tab === 'matches'}
              className={`history-tab-btn ${tab === 'matches' ? 'active' : ''}`}
              onClick={() => setTab('matches')}
            >
              <Calendar size={16} />
              <span>Partidas jugadas</span>
              {matches.length > 0 && <span className="tab-counter-pill">{matches.length}</span>}
            </button>
          </div>
        </div>

        {/* Cuerpo con scroll propio */}
        <div className="history-body-content">
          {/* Indicadores */}
          <div className="history-kpi-ribbon">
            <div className="history-kpi-card">
              <div className="history-kpi-icon">
                <FileText size={18} />
              </div>
              <div className="history-kpi-info">
                <span className="history-kpi-label">Partidas jugadas</span>
                <span className="history-kpi-val">{matches.length}</span>
              </div>
            </div>

            <div className="history-kpi-card">
              <div className="history-kpi-icon">
                <Users size={18} />
              </div>
              <div className="history-kpi-info">
                <span className="history-kpi-label">Equipos registrados</span>
                <span className="history-kpi-val">{leaderboard.length}</span>
              </div>
            </div>

            <div className="history-kpi-card history-kpi-card--gold">
              <div className="history-kpi-icon">
                <DollarSign size={18} />
              </div>
              <div className="history-kpi-info">
                <span className="history-kpi-label">Récord de patrimonio</span>
                <span className="history-kpi-val">Bs {highestRecord.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="history-loading-state">
              <RefreshCw size={28} className="animate-spin text-ifi" />
              <span>Cargando clasificación y partidas…</span>
            </div>
          ) : error ? (
            <div className="history-error-state">
              <p>{error}</p>
              <button className="btn-secondary-action" onClick={fetchData}>
                Reintentar
              </button>
            </div>
          ) : tab === 'leaderboard' ? (
            /* TAB 1: CLASIFICACIÓN / LEADERBOARD */
            <div>
              {/* Filtros de Tabla */}
              <div className="history-toolbar">
                <span className="history-toolbar-label">
                  {displayedLeaderboard.length} equipos clasificados
                </span>
                <div className="history-filter-group" role="group" aria-label="Filtrar equipos">
                  <button
                    type="button"
                    className={`history-filter-btn ${!filterHumanOnly ? 'is-active' : ''}`}
                    onClick={() => setFilterHumanOnly(false)}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={`history-filter-btn ${filterHumanOnly ? 'is-active' : ''}`}
                    onClick={() => setFilterHumanOnly(true)}
                  >
                    Solo estudiantes
                  </button>
                </div>
              </div>

              {displayedLeaderboard.length === 0 ? (
                <div className="history-empty-state">
                  <div className="empty-trophy-halo">
                    <Trophy size={44} className="empty-icon" />
                  </div>
                  <h4>Aún no hay equipos en el cuadro de honor</h4>
                  <p>No se encontraron equipos para el filtro seleccionado. ¡El primer lugar está esperando!</p>
                </div>
              ) : (
                <>
                  {/* Podio visual con los tres primeros */}
                  <div className="history-podium">
                    {displayedLeaderboard.slice(0, 3).map((team, idx) => (
                      <div
                        key={team.team_name || idx}
                        className={`hof-card hof-${idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze'}`}
                      >
                        <span className="hof-medal">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                        <span className="hof-place">{idx + 1}.º lugar</span>
                        <span className="hof-name">{team.team_name}</span>
                        <span className="hof-value">Bs {Number(team.highest_net_worth || 0).toLocaleString()}</span>
                        <span className="hof-meta">
                          {team.championships_won || 0} {Number(team.championships_won || 0) === 1 ? 'victoria' : 'victorias'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="history-table-wrapper">
                    <table className="history-data-table">
                      <thead>
                        <tr>
                          <th className="col-rank">Puesto</th>
                          <th>Equipo</th>
                          <th className="col-center col-optional">Partidas</th>
                          <th className="col-center">1.º lugar</th>
                          <th className="col-center col-optional">Podios</th>
                          <th className="col-center col-optional">Eficacia</th>
                          <th className="col-right">Mejor patrimonio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedLeaderboard.map((team, idx) => {
                          const isFirst = idx === 0;
                          const isSecond = idx === 1;
                          const isThird = idx === 2;
                          const played = team.matches_played || 1;
                          const wins = team.championships_won || 0;
                          const winRate = ((wins / played) * 100).toFixed(0);

                          return (
                            <tr key={team.team_name || idx} className={isFirst ? 'row-champion' : ''}>
                              <td className="col-rank">
                                <div className="rank-badge-cell">
                                  {isFirst && <span className="rank-crown gold">1</span>}
                                  {isSecond && <span className="rank-crown silver">2</span>}
                                  {isThird && <span className="rank-crown bronze">3</span>}
                                  {!isFirst && !isSecond && !isThird && (
                                    <span className="rank-num">{idx + 1}</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="team-cell-title">
                                  <span className="team-cell-name">{team.team_name}</span>
                                  {team.is_bot && <span className="badge-bot">Bot</span>}
                                </div>
                              </td>
                              <td className="col-center col-optional font-mono">{team.matches_played}</td>
                              <td className="col-center font-mono col-wins">
                                {team.championships_won || 0}
                              </td>
                              <td className="col-center col-optional font-mono">{team.podium_finishes || 0}</td>
                              <td className="col-center col-optional">
                                <span className={`winrate-pill ${Number(winRate) >= 50 ? 'is-high' : ''}`}>
                                  {winRate}%
                                </span>
                              </td>
                              <td className="col-right font-mono col-networth">
                                Bs {Number(team.highest_net_worth || 0).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* TAB 2: PARTIDAS JUGADAS */
            matches.length === 0 ? (
              <div className="history-empty-state">
                <div className="empty-trophy-halo">
                  <Calendar size={44} className="empty-icon" />
                </div>
                <h4>Todavía no hay partidas registradas</h4>
                <p>
                  Cuando termine una partida, aquí verás el ganador y el detalle final de cada equipo.
                </p>
              </div>
            ) : (
              <div className="history-matches-list">
                {matches.map(m => {
                  const dateStr = m.finished_at || m.created_at;
                  const dateFormatted = dateStr ? new Date(dateStr).toLocaleString() : 'Sesión reciente';
                  const isExpanded = expandedMatchId === (m.id || m.room_code);

                  return (
                    <div key={m.id || m.room_code} className="history-match-card">
                      <div className="match-card-top">
                        <div className="match-room-tag">
                          <span className="match-room-code">Sala {m.room_code}</span>
                          <span className="match-status-pill">
                            <CheckCircle2 size={12} /> Finalizada
                          </span>
                        </div>
                        <div className="match-date-tag">
                          <Calendar size={13} />
                          <span>{dateFormatted}</span>
                        </div>
                      </div>

                      <div className="match-card-body">
                        <div className="match-winner-highlight">
                          <div className="match-winner-icon">
                            <Trophy size={20} />
                          </div>
                          <div className="winner-details">
                            <span className="winner-label">Equipo ganador</span>
                            <span className="winner-name">{m.winner_team_name}</span>
                          </div>
                          <div className="winner-amount font-mono">
                            Bs {Number(m.winner_net_worth || 0).toLocaleString()}
                          </div>
                        </div>

                        {/* Vista previa de los 3 primeros */}
                        {m.final_standings && Array.isArray(m.final_standings) && (
                          <div className="match-standings-preview">
                            {m.final_standings.slice(0, 3).map(s => (
                              <div key={s.id || s.name} className="standing-mini-chip">
                                <span className="mini-rank font-mono">#{s.rank}</span>
                                <span className="mini-name">{s.name}</span>
                                <span className="mini-val font-mono">Bs {Number(s.netWorth || 0).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Botón para ver el acta completa */}
                        {m.final_standings && Array.isArray(m.final_standings) && m.final_standings.length > 0 && (
                          <button
                            type="button"
                            className={`btn-expand-acta ${isExpanded ? 'is-open' : ''}`}
                            aria-expanded={isExpanded}
                            onClick={() => toggleExpandMatch(m.id || m.room_code)}
                          >
                            <span className="btn-expand-acta-left">
                              <FileText size={15} />
                              <span>{isExpanded ? 'Ocultar resultados completos' : 'Ver resultados completos'}</span>
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}

                        {/* Desglose expandible */}
                        {isExpanded && m.final_standings && (
                          <div className="match-details-expandable">
                            <div className="match-details-header-row">
                              <span className="match-details-title">
                                <ShieldCheck size={15} />
                                Resultado final de la partida
                              </span>
                              <span className="match-details-count">
                                {m.final_standings.length} equipos
                              </span>
                            </div>

                            <table className="match-details-table">
                              <thead>
                                <tr>
                                  <th className="col-center">Puesto</th>
                                  <th>Equipo</th>
                                  <th className="col-center col-optional">Resultado</th>
                                  <th className="col-right">Patrimonio final</th>
                                </tr>
                              </thead>
                              <tbody>
                                {m.final_standings.map((s, sIdx) => (
                                  <tr key={s.id || s.name || sIdx} className={sIdx === 0 ? 'is-winner' : ''}>
                                    <td className="col-center">
                                      {sIdx === 0 ? '🥇' : sIdx === 1 ? '🥈' : sIdx === 2 ? '🥉' : <span className="font-mono">#{s.rank || sIdx + 1}</span>}
                                    </td>
                                    <td>
                                      <strong className="match-team-name">{s.name}</strong>
                                      {s.isBot && <span className="badge-bot">Bot</span>}
                                    </td>
                                    <td className="col-center col-optional">
                                      {sIdx === 0 ? (
                                        <span className="result-tag result-tag--champion">Campeón</span>
                                      ) : sIdx < 3 ? (
                                        <span className="result-tag result-tag--podium">Podio</span>
                                      ) : (
                                        <span className="result-tag">Finalista</span>
                                      )}
                                    </td>
                                    <td className="col-right font-mono match-networth">
                                      Bs {Number(s.netWorth || 0).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

        {/* Pie */}
        <div className="history-modal-footer">
          <div className="footer-institutional-seal">
            <ShieldCheck size={14} />
            <span className="seal-text">Olimpiadas IFI 2026 · Simulación de la Bolsa Boliviana de Valores</span>
          </div>
          <button className="btn-close-history-modal" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
