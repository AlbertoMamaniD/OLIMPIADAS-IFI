import React, { useRef, useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Gavel,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Filter,
} from 'lucide-react';

function parseEvent(text) {
  const lower = text.toLowerCase();

  let type = 'general';
  let badgeLabel = 'Rueda';
  let Icon = Activity;
  let badgeClass = 'badge-general';

  if (lower.includes('subasta')) {
    type = 'auction';
    badgeLabel = 'Subasta';
    Icon = Gavel;
    badgeClass = 'badge-auction';
  } else if (lower.includes('dividendo')) {
    type = 'dividend';
    badgeLabel = 'Dividendo';
    Icon = DollarSign;
    badgeClass = 'badge-dividend';
  } else if (lower.includes('compra')) {
    type = 'buy';
    badgeLabel = 'Compra';
    Icon = ArrowUpRight;
    badgeClass = 'badge-buy';
  } else if (lower.includes('venta') || lower.includes('vende') || lower.includes('liquidada')) {
    type = 'sell';
    badgeLabel = 'Venta';
    Icon = ArrowDownRight;
    badgeClass = 'badge-sell';
  } else if (lower.includes('juega') || lower.includes('tarjeta')) {
    type = 'card';
    badgeLabel = 'Carta';
    Icon = Zap;
    badgeClass = 'badge-card';
  } else if (lower.includes('crisis')) {
    type = 'crisis';
    badgeLabel = 'Crisis';
    Icon = ShieldAlert;
    badgeClass = 'badge-crisis';
  }

  return { type, badgeLabel, Icon, badgeClass };
}

export function EventLog({ log }) {
  const containerRef = useRef(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log, filterType]);

  const filteredLog = (log || []).filter(item => {
    if (filterType === 'all') return true;
    const { type } = parseEvent(item.text);
    if (filterType === 'trades') return type === 'buy' || type === 'sell';
    if (filterType === 'cards') return type === 'card';
    if (filterType === 'events') return type === 'auction' || type === 'dividend' || type === 'crisis';
    return true;
  });

  return (
    <div className="terminal-card event-tape-card">
      {/* Encabezado */}
      <div className="terminal-card-header tape-header-row">
        <div className="header-icon-label">
          <span className="panel-icon-chip">
            <Activity size={17} />
          </span>
          <span className="card-title-strong">
            <span className="tape-title-full">Registro de la rueda</span>
            <span className="tape-title-mob">Registro</span>
          </span>
          <span className="tape-pulse-dot" title="Transmisión en tiempo real de la BBV" />
        </div>
        <span className="tape-counter-badge">
          <span className="font-mono">{log?.length || 0}</span> eventos
        </span>
      </div>

      {/* Filtros */}
      <div className="tape-filter-toolbar" role="tablist" aria-label="Filtrar registro">
        <span className="filter-toolbar-label">Ver</span>
        <button
          className={`tape-filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Todo
        </button>
        <button
          className={`tape-filter-btn ${filterType === 'trades' ? 'active' : ''}`}
          onClick={() => setFilterType('trades')}
        >
          Órdenes
        </button>
        <button
          className={`tape-filter-btn ${filterType === 'cards' ? 'active' : ''}`}
          onClick={() => setFilterType('cards')}
        >
          Tarjetas
        </button>
        <button
          className={`tape-filter-btn ${filterType === 'events' ? 'active' : ''}`}
          onClick={() => setFilterType('events')}
        >
          Eventos
        </button>
      </div>

      {/* Entradas */}
      <div ref={containerRef} className="tape-feed-scroll">
        {filteredLog.length === 0 ? (
          <div className="tape-empty-feed">
            <Activity size={24} className="tape-empty-icon" />
            <span className="tape-empty-title">Nada por aquí todavía</span>
            <span className="tape-empty-sub">Las compras, ventas y cartas jugadas aparecerán aquí en tiempo real.</span>
          </div>
        ) : (
          filteredLog.map((item, idx) => {
            const { type, badgeLabel, Icon, badgeClass } = parseEvent(item.text);
            const turnStr = item.turn < 10 ? `0${item.turn}` : `${item.turn}`;

            return (
              <div key={idx} className={`tape-card-entry entry-${type}`}>
                <span className={`tape-entry-icon ${badgeClass}`} aria-hidden="true">
                  <Icon size={15} />
                </span>

                <div className="tape-card-body">
                  <div className="tape-entry-meta">
                    <span className={`operation-badge ${badgeClass}`}>{badgeLabel}</span>
                    <span className="turn-stamp-pill">
                      Turno <span className="font-mono">{turnStr}</span>
                    </span>
                  </div>
                  <span className="tape-narrative-text">
                    {item.text}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pie */}
      <div className="tape-footer-bar">
        <span className="tape-footer-status">
          <CheckCircle2 size={14} />
          <span>Registro en tiempo real</span>
        </span>
        <span className="tape-footer-counter">
          Mostrando <span className="font-mono">{filteredLog.length}</span> de{' '}
          <span className="font-mono">{log?.length || 0}</span>
        </span>
      </div>
    </div>
  );
}
