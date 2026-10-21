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
      <div className="terminal-card-header market-header-row">
        <div className="header-icon-label">
          <LineChart size={17} className="text-ifi" />
          <span className="card-title-strong">
            <span className="market-title-full">Pizarra de Cotizaciones Bursátiles</span>
            <span className="market-title-mob">Cotizaciones Bursátiles</span>
          </span>
          <span className="live-indicator-dot" title="Transmisión en tiempo real" />
        </div>
        <div className="market-limits-badge font-mono">
          <span className="limit-chip floor">Piso Bs 10</span>
          <span className="limit-divider">/</span>
          <span className="limit-chip ceiling">Techo Bs 250</span>
          {isAuctionActive && (
            <span className="auction-active-pill">Subasta</span>
          )}
        </div>
      </div>

      {/* Tabla Bursátil con Tipografía Nítida y Espaciado Amplio */}
      <div className="market-table-wrapper desktop-market-table-wrap">
        <table className="market-table">
          <thead>
            <tr>
              <th className="th-asset">Activo / Emisor</th>
              <th className="th-price text-right">Cotización</th>
              <th className="th-delta text-right">Variación</th>
              <th className="th-broker text-right" title="Acciones disponibles en el broker">Broker</th>
              <th className="th-position text-right" title="Acciones en cartera de tu mesa">Posición</th>
              <th className="th-actions text-center">Operar</th>
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
                  <td className="td-asset" title={`${c.name} (${c.ticker || `E${c.id}`}) · Renta Variable BBV`}>
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
                          <span className="asset-name" title={c.name}>{c.name}</span>
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
                  <td className="td-broker text-right font-mono">
                    <span className="stat-value">{c.brokerShares}</span>
                    <span className="stat-unit"> acc.</span>
                  </td>

                  {/* Mi Posición */}
                  <td className="td-position text-right font-mono">
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
                        <span>Compra</span>
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
                        <span>Venta</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Vista de Tarjetas Tácticas de Mercado para Móviles (100% visible, cero corte) */}
      <div className="mobile-market-cards-list">
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
            <div
              key={`mob_${c.id}`}
              className={`mobile-market-card ${isCeiling ? 'row-ceiling' : ''} ${isFloor ? 'row-floor' : ''} ${held > 0 ? 'row-held' : ''}`}
            >
              <div className="mobile-market-card-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div className="mobile-market-asset" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <div
                    className="asset-color-bar"
                    style={{ backgroundColor: c.color || 'var(--ifi-secondary)', width: '4px', height: '32px', borderRadius: '2px', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="ticker-badge font-mono">{c.ticker || `E${c.id}`}</span>
                      <span className="asset-name" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.25 }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>Renta Variable · BBV</span>
                  </div>
                </div>

                <div className="mobile-market-price text-right font-mono">
                  <div className="price-primary" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>Bs {c.price}</div>
                  <div className={`delta-display ${delta > 0 ? 'is-up' : delta < 0 ? 'is-down' : 'is-neutral'}`} style={{ fontSize: '11px', justifyContent: 'flex-end' }}>
                    {delta > 0 ? <ArrowUpRight size={12} /> : delta < 0 ? <ArrowDownRight size={12} /> : null}
                    <span>{delta > 0 ? `+${delta}` : delta} ({deltaPct}%)</span>
                  </div>
                </div>
              </div>

              {(isCeiling || isFloor || isDividend || isCrisis) && (
                <div style={{ display: 'flex', gap: '6px', margin: '6px 0 8px 0', flexWrap: 'wrap' }}>
                  {isCeiling && <span className="status-badge ceiling-badge">TECHO (Bs 250)</span>}
                  {isFloor && <span className="status-badge floor-badge">PISO (Bs 10)</span>}
                  {isDividend && <span className="status-badge dividend-badge">+DIVIDENDO</span>}
                  {isCrisis && !isFloor && <span className="status-badge crisis-badge">CRISIS</span>}
                </div>
              )}

              <div className="mobile-market-stats font-mono">
                <div className="mob-stat-item">
                  <span className="mob-stat-label">DISP. BROKER:</span>
                  <span className="mob-stat-val">{c.brokerShares} acc.</span>
                </div>
                <div className="mob-stat-item">
                  <span className="mob-stat-label">EN CARTERA:</span>
                  <span className="mob-stat-val" style={{ color: held > 0 ? 'var(--ifi-primary)' : 'inherit', fontWeight: 700 }}>
                    {held} acc. {held > 0 ? `(Bs ${(held * c.price).toLocaleString()})` : ''}
                  </span>
                </div>
              </div>

              <div className="mobile-market-actions">
                <button
                  type="button"
                  className="btn-trade btn-trade-buy mobile-trade-btn"
                  disabled={!canBuy}
                  onClick={() => onOpenTrade(c, 'buy')}
                >
                  <ArrowUpRight size={14} />
                  <span>COMPRAR</span>
                </button>
                <button
                  type="button"
                  className="btn-trade btn-trade-sell mobile-trade-btn"
                  disabled={!canSell}
                  onClick={() => onOpenTrade(c, 'sell')}
                >
                  <ArrowDownRight size={14} />
                  <span>VENDER {held > 0 ? `(${held})` : ''}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
