import React from 'react';
import { Gavel, Clock, ArrowUpRight, Coins, AlertCircle } from 'lucide-react';

export function AuctionBanner({
  auction,
  companies,
  myTeam,
  clock,
  onPlaceBid,
  onOpenQuickSell,
}) {
  if (!auction) return null;

  const company = companies.find(c => c.id === auction.companyId) || { name: 'Empresa', price: 100 };
  const bids = auction.bids || [];
  const highestBid = bids.length > 0 ? bids[bids.length - 1] : null;

  const nextBidAmount = highestBid ? highestBid.amountPerShare + 10 : 10;
  const totalCost = nextBidAmount * auction.lotSize;
  const canAfford = (myTeam?.cash || 0) >= totalCost;

  const auctionSeconds = clock?.phase === 'auction' ? clock.auctionRemaining : 30;

  return (
    <div className="auction-execution-panel" role="region" aria-label="Subasta en curso">
      <div className="auction-top-row">
        <div className="auction-title-group">
          <div className="auction-icon-box">
            <Gavel size={22} />
          </div>
          <div className="auction-title-text">
            <div className="auction-header-tag">
              <span className="auction-live-dot" />
              Subasta pública en curso
            </div>
            <h3 className="auction-main-heading">
              Lote de <span className="font-mono">{auction.lotSize}</span> acciones de {company.name}
            </h3>
          </div>
        </div>

        <div className="auction-countdown-pill" aria-live="polite">
          <Clock size={16} />
          <span className="countdown-label">Cierra en</span>
          <span className="countdown-seconds font-mono">{auctionSeconds}s</span>
        </div>
      </div>

      <p className="auction-legal-desc">
        Los aportes obligatorios se pagan al precio base (<strong className="font-mono">Bs {auction.priceAtStart}</strong>).
        El lote completo se adjudica a la oferta más alta que pueda pagarse al cierre.
      </p>

      <div className="auction-bid-control-strip">
        <div className="current-bid-box">
          <span className="current-bid-caption">Mejor oferta actual</span>
          <div className="current-bid-amount">
            {highestBid ? (
              <span className="current-bid-line">
                <strong className="font-mono">Bs {highestBid.amountPerShare}</strong>
                <span className="current-bid-unit">por acción</span>
                <span className={`bid-owner-tag ${highestBid.teamId === myTeam?.id ? 'is-mine' : ''}`}>
                  {highestBid.teamId === myTeam?.id ? 'Tu mesa' : 'Otra mesa'}
                </span>
              </span>
            ) : (
              <span className="no-bids-yet">Sin ofertas aún · mínimo Bs 10 por acción</span>
            )}
          </div>
        </div>

        <div className="auction-action-buttons">
          <button
            className="btn-auction-bid"
            disabled={!canAfford}
            onClick={onPlaceBid}
          >
            <ArrowUpRight size={17} />
            <span className="btn-bid-text">
              <span className="btn-bid-main">Pujar Bs {nextBidAmount} por acción</span>
              <span className="btn-bid-sub font-mono">Total Bs {totalCost.toLocaleString()}</span>
            </span>
          </button>

          <button
            className="btn-auction-quicksell"
            onClick={onOpenQuickSell}
            title="Venta inmediata de acciones en cartera para generar liquidez"
          >
            <Coins size={16} />
            <span>Vender acciones</span>
          </button>
        </div>
      </div>

      {!canAfford && (
        <div className="auction-insolvency-alert">
          <AlertCircle size={15} />
          <span>
            Tu efectivo (<span className="font-mono">Bs {myTeam?.cash || 0}</span>) no alcanza para esta oferta.
            Vende acciones para conseguir liquidez.
          </span>
        </div>
      )}
    </div>
  );
}
