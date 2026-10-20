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
  let badgeLabel = 'RUEDA';
  let Icon = Activity;
  let badgeClass = 'badge-general';

  if (lower.includes('subasta')) {
    type = 'auction';
    badgeLabel = 'SUBASTA';
    Icon = Gavel;
    badgeClass = 'badge-auction';
  } else if (lower.includes('dividendo')) {
    type = 'dividend';
    badgeLabel = 'DIVIDENDO';
    Icon = DollarSign;
    badgeClass = 'badge-dividend';
  } else if (lower.includes('compra')) {
    type = 'buy';
    badgeLabel = 'COMPRA';
    Icon = ArrowUpRight;
    badgeClass = 'badge-buy';
  } else if (lower.includes('venta') || lower.includes('vende') || lower.includes('liquidada')) {
    type = 'sell';
    badgeLabel = 'VENTA';
    Icon = ArrowDownRight;
    badgeClass = 'badge-sell';
  } else if (lower.includes('juega') || lower.includes('tarjeta')) {
    type = 'card';
    badgeLabel = 'TÁCTICA';
    Icon = Zap;
    badgeClass = 'badge-card';
  } else if (lower.includes('crisis')) {
    type = 'crisis';
    badgeLabel = 'CRISIS';
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
      {/* Encabezado Fijo: Título en su propia fila completa */}
      {/* Encabezado Fijo: Título en su propia fila completa */}
      <div className="terminal-card-header tape-header-row">
        <div className="header-icon-label">
          <Activity size={17} className="text-ifi" />
          <span className="card-title-strong">
            <span className="tape-title-full">Cinta de Operaciones en Rueda</span>
            <span className="tape-title-mob">Cinta de Operaciones</span>
          </span>
          <span className="tape-pulse-dot" title="Transmisión en tiempo real de la BBV" />
        </div>
        <span className="tape-counter-badge font-mono">
          {log?.length || 0} ev.
        </span>
      </div>

      {/* Sub-barra de Filtros Dedicada (Nunca comprime el título) */}
      <div className="tape-filter-toolbar">
        <span className="filter-toolbar-label font-mono">FILTRO:</span>
        <button
          className={`tape-filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Todas ({log?.length || 0})
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

      {/* Contenedor Amplio y Espacioso de Entradas */}
      <div ref={containerRef} className="tape-feed-scroll">
        {filteredLog.length === 0 ? (
          <div className="tape-empty-feed">
            <Activity size={22} className="tape-empty-icon" />
            <span className="tape-empty-title">Sin registros en este filtro</span>
            <span className="tape-empty-sub">Las órdenes transmitidas en la rueda bursátil se reflejarán aquí en tiempo real.</span>
          </div>
        ) : (
          filteredLog.map((item, idx) => {
            const { type, badgeLabel, Icon, badgeClass } = parseEvent(item.text);
            const turnStr = item.turn < 10 ? `0${item.turn}` : `${item.turn}`;

            return (
              <div key={idx} className={`tape-card-entry entry-${type}`}>
                <div className="tape-card-left">
                  <span className="turn-stamp-pill font-mono">
                    T{turnStr}
                  </span>
                  <span className={`operation-badge ${badgeClass}`}>
                    <Icon size={11} />
                    <span>{badgeLabel}</span>
                  </span>
                </div>

                <div className="tape-card-body">
                  <span className="tape-narrative-text">
                    {item.text}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pie de Sincronización */}
      <div className="tape-footer-bar">
        <span className="tape-footer-status">
          <CheckCircle2 size={13} className="text-ifi" />
          <span>Libro de transacciones auditado</span>
        </span>
        <span className="tape-footer-counter font-mono">
          Mostrando {filteredLog.length} de {log?.length || 0}
        </span>
      </div>
    </div>
  );
}
