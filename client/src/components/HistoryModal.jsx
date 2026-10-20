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
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
        }}
      >
        {/* Encabezado Institucional Fijo */}
        <div style={{ padding: '20px 24px 14px 24px', borderBottom: '1px solid var(--line)' }}>
          <div className="modal-header-ribbon" style={{ marginBottom: '10px' }}>
            <div className="modal-header-left">
              <div className="order-type-chip chip-buy">
                <Trophy size={14} />
                <span className="font-mono">OLIMPIADAS IFI 2026 · LIBRO MAYOR BBV</span>
              </div>
              <div className="order-target-title" style={{ marginTop: '2px' }}>
                <span className="order-target-name" style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  Cuadro de Honor y Actas de Rueda
                </span>
              </div>
            </div>
            <button className="btn-modal-close" onClick={onClose} title="Cerrar ventana">
              <X size={18} />
            </button>
          </div>

          {/* Barra de Certificación de Auditoría */}
          <div className="history-audit-subbar font-mono" style={{ margin: 0 }}>
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
        </div>

        {/* Pestañas de Navegación Fijas */}
        <div style={{ padding: '0 24px', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--line)' }}>
          <div className="history-nav-tabs" style={{ margin: 0, borderBottom: 'none' }}>
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
        </div>

        {/* Cuerpo del Contenido con Scroll Independiente */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* KPI Ribbon Estadístico */}
          <div className="history-kpi-ribbon">
            <div className="history-kpi-card">
              <div className="history-kpi-icon">
                <FileText size={16} />
              </div>
              <div className="history-kpi-info">
                <span className="history-kpi-label">Ruedas Concluidas</span>
                <span className="history-kpi-val">{matches.length} sesiones</span>
              </div>
            </div>

            <div className="history-kpi-card">
              <div className="history-kpi-icon">
                <Users size={16} />
              </div>
              <div className="history-kpi-info">
                <span className="history-kpi-label">Mesas Registradas</span>
                <span className="history-kpi-val">{leaderboard.length} operadores</span>
              </div>
            </div>

            <div className="history-kpi-card">
              <div className="history-kpi-icon">
                <DollarSign size={16} />
              </div>
              <div className="history-kpi-info">
                <span className="history-kpi-label">Récord Patrimonial</span>
                <span className="history-kpi-val">Bs {highestRecord.toLocaleString()}</span>
              </div>
            </div>
          </div>

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
            <div>
              {/* Filtros de Tabla */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Cuadro de Honor Oficial ({displayedLeaderboard.length} mesas clasificadas)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-control"
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderColor: !filterHumanOnly ? 'var(--ifi-secondary)' : 'var(--line)',
                      background: !filterHumanOnly ? 'var(--ifi-subtle)' : 'transparent',
                      color: !filterHumanOnly ? 'var(--ifi-secondary)' : 'var(--ink-secondary)',
                      fontWeight: !filterHumanOnly ? 700 : 400,
                    }}
                    onClick={() => setFilterHumanOnly(false)}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    className="btn-control"
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderColor: filterHumanOnly ? 'var(--ifi-secondary)' : 'var(--line)',
                      background: filterHumanOnly ? 'var(--ifi-subtle)' : 'transparent',
                      color: filterHumanOnly ? 'var(--ifi-secondary)' : 'var(--ink-secondary)',
                      fontWeight: filterHumanOnly ? 700 : 400,
                    }}
                    onClick={() => setFilterHumanOnly(true)}
                  >
                    Solo Estudiantes
                  </button>
                </div>
              </div>

              {displayedLeaderboard.length === 0 ? (
                <div className="history-empty-state">
                  <div className="empty-trophy-halo">
                    <Trophy size={48} className="empty-icon text-ifi" />
                  </div>
                  <h4>Sin Registros Coincidentes</h4>
                  <p>No se encontraron registros de mesas para el filtro seleccionado.</p>
                </div>
              ) : (
                <div className="history-table-wrapper">
                  <table className="history-data-table font-mono">
                    <thead>
                      <tr>
                        <th style={{ width: '75px' }}>PUESTO</th>
                        <th>MESA / EQUIPO COMPETIDOR</th>
                        <th style={{ textAlign: 'center' }}>RUEDAS</th>
                        <th style={{ textAlign: 'center' }}>1º LUGAR</th>
                        <th style={{ textAlign: 'center' }}>PODIOS (TOP 3)</th>
                        <th style={{ textAlign: 'center' }}>EFICACIA</th>
                        <th style={{ textAlign: 'right' }}>MÁX. PATRIMONIO</th>
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
                            <td>
                              <div className="rank-badge-cell">
                                {isFirst && <span className="rank-crown gold">🥇 1.º</span>}
                                {isSecond && <span className="rank-crown silver">🥈 2.º</span>}
                                {isThird && <span className="rank-crown bronze">🥉 3.º</span>}
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
                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--ifi-secondary)' }}>
                              {team.championships_won || 0}
                            </td>
                            <td style={{ textAlign: 'center' }}>{team.podium_finishes || 0}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  background: Number(winRate) >= 50 ? 'var(--up-subtle)' : 'var(--surface-subtle)',
                                  color: Number(winRate) >= 50 ? 'var(--up)' : 'var(--ink-secondary)',
                                  fontWeight: 700,
                                }}
                              >
                                {winRate}%
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              Bs {Number(team.highest_net_worth || 0).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
                  const isExpanded = expandedMatchId === (m.id || m.room_code);

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
                            <span className="winner-label font-mono">EQUIPO GANADOR DE RUEDA:</span>
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

                        {/* Botón de Expansión de Acta Completa */}
                        {m.final_standings && Array.isArray(m.final_standings) && m.final_standings.length > 0 && (
                          <button
                            type="button"
                            className={`btn-expand-acta ${isExpanded ? 'is-open' : ''}`}
                            onClick={() => toggleExpandMatch(m.id || m.room_code)}
                          >
                            <span className="btn-expand-acta-left">
                              <FileText size={15} />
                              <span>{isExpanded ? 'Ocultar Acta de Liquidación' : 'Ver Acta Detallada de Liquidación y Portafolios'}</span>
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}

                        {/* Desglose Detallado Expandible */}
                        {isExpanded && m.final_standings && (
                          <div className="match-details-expandable">
                            <div className="match-details-header-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ShieldCheck size={14} className="text-ifi" />
                                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ifi-secondary)', textTransform: 'uppercase' }}>
                                  ACTA OFICIAL DE CIERRE Y BALANCES LIQUIDADOS AL VENCIMIENTO
                                </span>
                              </div>
                              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
                                {m.final_standings.length} mesas participantes
                              </span>
                            </div>

                            <table className="match-details-table">
                              <thead>
                                <tr>
                                  <th style={{ textAlign: 'center', width: '70px' }}>PUESTO</th>
                                  <th style={{ textAlign: 'left' }}>MESA OPERADORA</th>
                                  <th style={{ textAlign: 'center' }}>CONDICIÓN</th>
                                  <th style={{ textAlign: 'right' }}>PATRIMONIO LIQUIDADO</th>
                                </tr>
                              </thead>
                              <tbody>
                                {m.final_standings.map((s, sIdx) => (
                                  <tr key={s.id || s.name || sIdx} style={{ background: sIdx === 0 ? 'var(--ifi-subtle)' : 'transparent' }}>
                                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                                      {sIdx === 0 ? '🥇 1.º' : sIdx === 1 ? '🥈 2.º' : sIdx === 2 ? '🥉 3.º' : `#${s.rank || sIdx + 1}`}
                                    </td>
                                    <td>
                                      <strong style={{ color: sIdx === 0 ? 'var(--ifi-secondary)' : 'var(--ink)' }}>{s.name}</strong>
                                      {s.isBot && <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.7, marginLeft: '6px' }}>(BOT)</span>}
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: '10.5px' }}>
                                      {sIdx === 0 ? (
                                        <span style={{ color: 'var(--ifi-secondary)', fontWeight: 700 }}>CAMPEÓN</span>
                                      ) : sIdx < 3 ? (
                                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>PODIO</span>
                                      ) : (
                                        <span style={{ color: 'var(--ink-muted)' }}>FINALISTA</span>
                                      )}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '12px' }}>
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

        {/* Pie Institucional Fijo */}
        <div className="history-modal-footer font-mono">
          <div className="footer-institutional-seal">
            <ShieldCheck size={13} className="text-ifi" />
            <span className="seal-text">Bolsa Boliviana de Valores S.A. · Libro Mayor de Olimpiadas IFI</span>
          </div>
          <button className="btn-close-history-modal" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
