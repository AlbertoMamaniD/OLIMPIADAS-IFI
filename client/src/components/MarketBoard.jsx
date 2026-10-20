import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Building2,
} from 'lucide-react';

export function MarketBoard({
  companies,
  myTeam,
  currentTurn,
  isMyTurn,
  onOpenTrade,
  isAuctionActive,
}) {
  const canTradeBefore = isMyTurn && currentTurn?.phase === 'before';
  const canTradeAfter =
    isMyTurn &&
    currentTurn?.phase === 'after' &&
    currentTurn?.cardPlayed;

  return (
    <div className="terminal-card market-board-card">
      {/* Encabezado Institucional con Espaciado Generoso */}
      <div className="terminal-card-header">
        <div className="header-icon-label">
          <LineChart size={18} className="text-ifi" />
          <span className="card-title-strong">Pizarra de Cotizaciones Bursátiles</span>
          <span className="live-indicator-dot" title="Transmisión en tiempo real" />
        </div>
        <div className="market-limits-badge">
          <span className="limit-chip floor">Piso: Bs 10</span>
          <span className="limit-divider">/</span>
          <span className="limit-chip ceiling">Techo: Bs 250</span>
          {isAuctionActive && (
            <span className="auction-active-pill">Subasta en Curso</span>
          )}
        </div>
      </div>

      {/* Tabla Bursátil con Tipografía Nítida y Espaciado Amplio */}
      <div className="market-table-wrapper">
        <table className="market-table">
          <thead>
            <tr>
              <th className="th-asset">Activo / Emisor</th>
              <th className="th-price text-right">Cotización</th>
              <th className="th-delta text-right">Variación</th>
              <th className="th-stats text-right">Disp. Broker</th>
              <th className="th-stats text-right">Mi Posición</th>
              <th className="th-actions text-center">Operación Bursátil</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => {
              const held = myTeam?.holdings?.[c.id] || 0;
              const history = c.priceHistory || [];
              const prevPrice = history.length > 1 ? history[history.length - 2] : c.price;
              const delta = c.price - prevPrice;
              const deltaPct = prevPrice > 0 ? ((delta / prevPrice) * 100).toFixed(1) : '0.0';

              const operatedBefore = currentTurn?.operatedCompanyBefore === c.id;
              const isLastTurn = currentTurn?.isLastTurn;

              const canBuy =
                (canTradeBefore || (canTradeAfter && !operatedBefore)) &&
                !isLastTurn &&
                c.brokerShares > 0 &&
                (myTeam?.cash || 0) >= c.price;

              const canSell =
                isAuctionActive
                  ? held > 0
                  : (canTradeBefore || (canTradeAfter && !operatedBefore)) && held > 0;

              const isCeiling = c.price >= 250;
              const isFloor = c.price <= 10;
              const isDividend = c.lastPriceEvent === 'dividend';
              const isCrisis = c.lastPriceEvent === 'crisis';

              return (
                <tr
                  key={c.id}
                  className={`market-row ${isCeiling ? 'row-ceiling' : ''} ${isFloor ? 'row-floor' : ''} ${held > 0 ? 'row-held' : ''}`}
                >
                  {/* Activo / Emisor */}
                  <td className="td-asset">
                    <div className="asset-cell">
                      <div
                        className="asset-color-bar"
                        style={{ backgroundColor: c.color || 'var(--ifi-secondary)' }}
                      />
                      <div className="asset-info">
                        <div className="asset-header-line">
                          <span className="ticker-badge font-mono">
                            {c.ticker || `E${c.id}`}
                          </span>
                          <span className="asset-name">{c.name}</span>
                        </div>
                        <span className="asset-sub font-mono">Renta Variable · BBV</span>
                      </div>
                    </div>
                  </td>

                  {/* Cotización Actual */}
                  <td className="td-price text-right">
                    <div className="price-primary font-mono">
                      Bs {c.price}
                    </div>
                    <div className="price-tag-row">
                      {isCeiling && (
                        <span className="status-badge ceiling-badge">TECHO</span>
                      )}
                      {isFloor && (
                        <span className="status-badge floor-badge">PISO</span>
                      )}
                      {isDividend && (
                        <span className="status-badge dividend-badge">DIVIDENDO</span>
                      )}
                      {isCrisis && !isFloor && (
                        <span className="status-badge crisis-badge">CRISIS</span>
                      )}
                    </div>
                  </td>

                  {/* Variación */}
                  <td className="td-delta text-right">
                    {delta !== 0 ? (
                      <div className={`delta-display ${delta > 0 ? 'is-up' : 'is-down'}`}>
                        <span className="delta-icon">
                          {delta > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </span>
                        <span className="delta-val font-mono">
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                        <span className="delta-pct font-mono">
                          ({delta > 0 ? `+${deltaPct}%` : `${deltaPct}%`})
                        </span>
                      </div>
                    ) : (
                      <div className="delta-display is-neutral font-mono">
                        <Minus size={13} />
                        <span>0.00</span>
                      </div>
                    )}
                  </td>

                  {/* Disponibilidad Broker */}
                  <td className="td-stats text-right font-mono">
                    <span className="stat-value">{c.brokerShares}</span>
                    <span className="stat-unit"> acc.</span>
                  </td>

                  {/* Mi Posición */}
                  <td className="td-stats text-right font-mono">
                    <span className={`stat-value ${held > 0 ? 'text-highlight' : 'text-muted'}`}>
                      {held}
                    </span>
                    <span className="stat-unit"> acc.</span>
                    {held > 0 && (
                      <div className="position-subval text-muted">
                        Bs {(held * c.price).toLocaleString()}
                      </div>
                    )}
                  </td>

                  {/* Botones de Operación */}
                  <td className="td-actions text-center">
                    <div className="trade-btn-group">
                      <button
                        className="btn-trade btn-trade-buy"
                        disabled={!canBuy}
                        onClick={() => onOpenTrade(c, 'buy')}
                        title={
                          !isMyTurn
                            ? 'Esperando turno de operación'
                            : isLastTurn
                            ? 'Último turno: compras bloqueadas'
                            : c.brokerShares <= 0
                            ? 'Sin acciones disponibles en el broker'
                            : (myTeam?.cash || 0) < c.price
                            ? 'Efectivo insuficiente'
                            : operatedBefore
                            ? 'Esta empresa ya fue operada en fase previa'
                            : 'Emitir orden de COMPRA'
                        }
                      >
                        <ArrowUpRight size={13} />
                        <span>COMPRA</span>
                      </button>
                      <button
                        className="btn-trade btn-trade-sell"
                        disabled={!canSell}
                        onClick={() => onOpenTrade(c, 'sell')}
                        title={
                          held <= 0
                            ? 'No posee acciones de esta empresa'
                            : !isMyTurn && !isAuctionActive
                            ? 'Esperando turno de operación'
                            : operatedBefore && !isAuctionActive
                            ? 'Esta empresa ya fue operada en fase previa'
                            : 'Emitir orden de VENTA'
                        }
                      >
                        <ArrowDownRight size={13} />
                        <span>VENTA</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
