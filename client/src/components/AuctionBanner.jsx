import React from 'react';
import { Gavel, Clock, ArrowUpRight, Coins, AlertCircle, ShieldAlert } from 'lucide-react';

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
    <div className="auction-execution-panel">
      <div className="auction-top-row">
        <div className="auction-title-group">
          <div className="auction-icon-box">
            <Gavel size={18} />
          </div>
          <div>
            <div className="auction-header-tag font-mono">
              SUBASTA PÚBLICA EXTRAORDINARIA EN CURSO
            </div>
            <h3 className="auction-main-heading">
              Lote de {auction.lotSize} acciones de {company.name}
            </h3>
          </div>
        </div>

        <div className="auction-countdown-pill font-mono">
          <Clock size={14} />
          <span className="countdown-label">CIERRE:</span>
          <span className="countdown-seconds">{auctionSeconds}s</span>
        </div>
      </div>

      <p className="auction-legal-desc">
        Aportes obligatorios liquidados al precio base de mercado (Bs {auction.priceAtStart}). El paquete adjudicado se transferirá a la mayor postura solvente registrada al cierre de rueda.
      </p>

      <div className="auction-bid-control-strip">
        <div className="current-bid-box">
          <span className="current-bid-caption font-mono">POSTURA MÁXIMA VIGENTE:</span>
          <div className="current-bid-amount font-mono">
            {highestBid ? (
              <span>
                <strong>Bs {highestBid.amountPerShare}</strong> / acción
                <span className="bid-owner-tag">
                  {highestBid.teamId === myTeam?.id ? ' (Propiedad de tu mesa)' : ' (Oferta contraria)'}
                </span>
              </span>
            ) : (
              <span className="no-bids-yet">Sin posturas iniciales (Base: Bs 10 / acc)</span>
            )}
          </div>
        </div>

        <div className="auction-action-buttons">
          <button
            className="btn-auction-bid"
            disabled={!canAfford}
            onClick={onPlaceBid}
          >
            <ArrowUpRight size={14} />
            <span>Pujar Bs {nextBidAmount} / acc (Total: Bs {totalCost.toLocaleString()})</span>
          </button>

          <button
            className="btn-auction-quicksell"
            onClick={onOpenQuickSell}
            title="Venta inmediata de acciones en cartera para generar liquidez"
          >
            <Coins size={13} />
            <span>Venta de Liquidez</span>
          </button>
        </div>
      </div>

      {!canAfford && (
        <div className="auction-insolvency-alert font-mono">
          <AlertCircle size={13} />
          <span>Liquidez disponible insuficiente (Bs {myTeam?.cash || 0}). Realice una venta de cartera para fondear la postura.</span>
        </div>
      )}
    </div>
  );
}
