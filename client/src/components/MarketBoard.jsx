import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  LineChart,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  Coins,
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
    <div className="terminal-card">
      <div className="terminal-card-header">
        <div className="header-icon-label">
          <LineChart size={15} color="var(--ifi-secondary)" />
          <span>Cotizaciones Bursátiles en Vivo</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--ink-secondary)', textTransform: 'none', letterSpacing: 'normal' }}>
          {isAuctionActive
            ? 'Subasta activa · Venta de liquidez permitida'
            : 'Piso Bs 10 — Techo Bs 250'}
        </span>
      </div>

      <div>
        {companies.map(c => {
          const held = myTeam?.holdings?.[c.id] || 0;
          const history = c.priceHistory || [];
          const prevPrice = history.length > 1 ? history[history.length - 2] : c.price;
          const delta = c.price - prevPrice;

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

          return (
            <div key={c.id} className="quote-row">
              <div
                className="ticker-symbol"
                style={{ backgroundColor: c.color || 'var(--ink)' }}
              >
                {c.ticker || c.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="company-title">{c.name}</div>
                <div className="company-inventory">
                  <span>Disp. Broker: {c.brokerShares}</span>
                  <span style={{ margin: '0 6px' }}>·</span>
                  <span>En Cartera: <strong>{held}</strong></span>
                </div>
              </div>

              <div className="quote-pricing">
                <div className="price-display-num">Bs {c.price}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                  {delta !== 0 && (
                    <span className={`delta-pill ${delta > 0 ? 'positive' : 'negative'}`}>
                      {delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      <span>{delta > 0 ? `+${delta}` : `${delta}`}</span>
                    </span>
                  )}
                  {c.lastPriceEvent === 'dividend' && (
                    <span className="status-tag dividend">
                      <DollarSign size={10} />
                      <span>DIVIDENDO</span>
                    </span>
                  )}
                  {c.lastPriceEvent === 'crisis' && (
                    <span className="status-tag crisis">
                      <AlertTriangle size={10} />
                      <span>CRISIS PISO</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="quote-actions-cell">
                <button
                  className="btn-market-buy"
                  disabled={!canBuy}
                  onClick={() => onOpenTrade(c, 'buy')}
                  title={canBuy ? 'Comprar acciones' : 'No disponible para compra'}
                >
                  <ShoppingCart size={12} />
                  <span>Comprar</span>
                </button>
                <button
                  className="btn-market-sell"
                  disabled={!canSell}
                  onClick={() => onOpenTrade(c, 'sell')}
                  title={canSell ? 'Vender acciones' : 'No disponible para venta'}
                >
                  <Coins size={12} />
                  <span>Vender</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
