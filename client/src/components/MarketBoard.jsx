import React from 'react';
import {
  Minus,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Gavel,
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
      {/* Encabezado */}
      <div className="terminal-card-header market-header-row">
        <div className="header-icon-label">
          <span className="card-icon-chip">
            <LineChart size={18} />
          </span>
          <span className="card-title-strong">
            <span className="market-title-full">Mercado de acciones</span>
            <span className="market-title-mob">Mercado</span>
          </span>
          <span className="live-indicator-dot" title="Precios en tiempo real" />
        </div>
        <div className="market-limits-badge">
          <span className="limit-chip floor" title="Precio mínimo permitido">
            Piso <strong className="font-mono">Bs 10</strong>
          </span>
          <span className="limit-chip ceiling" title="Precio máximo permitido">
            Techo <strong className="font-mono">Bs 250</strong>
          </span>
          {isAuctionActive && (
            <span className="auction-active-pill">
              <Gavel size={12} /> Subasta
            </span>
          )}
        </div>
      </div>

      {/* Tabla (escritorio y tablet) */}
      <div className="market-table-wrapper desktop-market-table-wrap">
        <table className="market-table">
          <thead>
            <tr>
              <th className="th-asset">Empresa</th>
              <th className="th-price text-right">Precio</th>
              <th className="th-delta text-right">Cambio</th>
              <th className="th-broker text-right" title="Acciones disponibles en el broker">Broker</th>
              <th className="th-position text-right" title="Acciones en cartera de tu mesa">Tienes</th>
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
                  style={{ '--co': c.color || 'var(--ifi-secondary)' }}
                >
                  {/* Empresa */}
                  <td className="td-asset" title={`${c.name} (${c.ticker || `E${c.id}`}) · Renta Variable BBV`}>
                    <div className="asset-cell">
                      <span className="asset-avatar font-mono" aria-hidden="true">
                        {c.ticker || `E${c.id}`}
                      </span>
                      <div className="asset-info">
                        <span className="asset-name" title={c.name}>{c.name}</span>
                        <span className="asset-sub">Renta variable · BBV</span>
                      </div>
                    </div>
                  </td>

                  {/* Precio */}
                  <td className="td-price text-right">
                    <div className="price-primary font-mono">
                      <span className="price-currency">Bs</span> {c.price}
                    </div>
                    <div className="price-tag-row">
                      {isCeiling && (
                        <span className="status-badge ceiling-badge">Techo</span>
                      )}
                      {isFloor && (
                        <span className="status-badge floor-badge">Piso</span>
                      )}
                      {isDividend && (
                        <span className="status-badge dividend-badge">Dividendo</span>
                      )}
                      {isCrisis && !isFloor && (
                        <span className="status-badge crisis-badge">Crisis</span>
                      )}
                    </div>
                  </td>

                  {/* Cambio */}
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
                          {delta > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                        </span>
                      </div>
                    ) : (
                      <div className="delta-display is-neutral font-mono">
                        <Minus size={13} />
                        <span>0.00</span>
                      </div>
                    )}
                  </td>

                  {/* Disponibles en el broker */}
                  <td className="td-broker text-right">
                    <span className="stat-value font-mono">{c.brokerShares}</span>
                    <span className="stat-unit"> acc.</span>
                  </td>

                  {/* Mi posición */}
                  <td className="td-position text-right">
                    <span className={`stat-value font-mono ${held > 0 ? 'text-highlight' : 'is-zero'}`}>
                      {held}
                    </span>
                    <span className="stat-unit"> acc.</span>
                    {held > 0 && (
                      <div className="position-subval font-mono">
                        Bs {(held * c.price).toLocaleString()}
                      </div>
                    )}
                  </td>

                  {/* Botones de operación */}
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
                        <ArrowUpRight size={14} className="btn-trade-icon" />
                        <span>Comprar</span>
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
                        <ArrowDownRight size={14} className="btn-trade-icon" />
                        <span>Vender</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas de mercado (móvil) */}
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
              style={{ '--co': c.color || 'var(--ifi-secondary)' }}
            >
              <div className="mobile-market-card-top">
                <div className="mobile-market-asset">
                  <span className="asset-avatar font-mono" aria-hidden="true">
                    {c.ticker || `E${c.id}`}
                  </span>
                  <div className="mobile-market-titles">
                    <span className="asset-name">{c.name}</span>
                    <span className="asset-sub">Renta variable · BBV</span>
                  </div>
                </div>

                <div className="mobile-market-price">
                  <div className="price-primary font-mono">
                    <span className="price-currency">Bs</span> {c.price}
                  </div>
                  <div className={`delta-display ${delta > 0 ? 'is-up' : delta < 0 ? 'is-down' : 'is-neutral'}`}>
                    {delta > 0 ? <ArrowUpRight size={13} /> : delta < 0 ? <ArrowDownRight size={13} /> : <Minus size={12} />}
                    <span className="font-mono">{delta > 0 ? `+${delta}` : delta} ({deltaPct}%)</span>
                  </div>
                </div>
              </div>

              {(isCeiling || isFloor || isDividend || isCrisis) && (
                <div className="mobile-market-badges">
                  {isCeiling && <span className="status-badge ceiling-badge">Techo (Bs 250)</span>}
                  {isFloor && <span className="status-badge floor-badge">Piso (Bs 10)</span>}
                  {isDividend && <span className="status-badge dividend-badge">+ Dividendo</span>}
                  {isCrisis && !isFloor && <span className="status-badge crisis-badge">Crisis</span>}
                </div>
              )}

              <div className="mobile-market-stats">
                <div className="mob-stat-item">
                  <span className="mob-stat-label">En el broker</span>
                  <span className="mob-stat-val font-mono">{c.brokerShares} acc.</span>
                </div>
                <div className={`mob-stat-item ${held > 0 ? 'is-held' : ''}`}>
                  <span className="mob-stat-label">Tienes</span>
                  <span className="mob-stat-val font-mono">
                    {held} acc. {held > 0 ? `· Bs ${(held * c.price).toLocaleString()}` : ''}
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
                  <ArrowUpRight size={16} />
                  <span>Comprar</span>
                </button>
                <button
                  type="button"
                  className="btn-trade btn-trade-sell mobile-trade-btn"
                  disabled={!canSell}
                  onClick={() => onOpenTrade(c, 'sell')}
                >
                  <ArrowDownRight size={16} />
                  <span>Vender {held > 0 ? `(${held})` : ''}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
