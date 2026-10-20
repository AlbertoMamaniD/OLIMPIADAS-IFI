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
    <div className="auction-execution-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              padding: '8px',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Gavel size={20} />
          </div>
          <div>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SUBASTA OBLIGATORIA EN CURSO
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', fontWeight: 600, margin: '2px 0 0 0' }}>
              Lote de {auction.lotSize} acciones de {company.name}
            </h3>
          </div>
        </div>

        <div className="institutional-timer warn" style={{ padding: '6px 14px' }}>
          <Clock size={15} />
          <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>Cierre:</span>
          <span className="val-num" style={{ fontSize: '17px', fontWeight: 700 }}>
            {auctionSeconds}s
          </span>
        </div>
      </div>

      <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
        Aportes obligatorios liquidados al precio base (Bs {auction.priceAtStart}). El lote se adjudicará a la mayor postura solvente al vencimiento del plazo.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--surface-subtle)',
          padding: '12px 16px',
          borderRadius: 'var(--border-radius-sm)',
          border: '1px solid var(--line)',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Postura máxima vigente:
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
            {highestBid ? (
              <span>
                Bs {highestBid.amountPerShare} / acción{' '}
                <span style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', fontWeight: 400 }}>
                  ({highestBid.teamId === myTeam?.id ? 'Propiedad de tu equipo' : 'Oferta rival'})
                </span>
              </span>
            ) : (
              <span style={{ color: 'var(--ink-secondary)' }}>Sin posturas iniciales (Base: Bs 10)</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-primary-action"
            style={{ padding: '8px 16px', fontSize: '12.5px', backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }}
            disabled={!canAfford}
            onClick={onPlaceBid}
          >
            <ArrowUpRight size={14} />
            <span>Pujar Bs {nextBidAmount} / acc (Total Bs {totalCost})</span>
          </button>

          <button
            className="btn-control"
            style={{ borderColor: 'var(--down-border)', color: 'var(--down)' }}
            onClick={onOpenQuickSell}
            title="Vender acciones para fondear la puja"
          >
            <Coins size={13} />
            <span>Venta p/ Liquidez</span>
          </button>
        </div>
      </div>

      {!canAfford && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--down)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
          <AlertCircle size={13} />
          <span>Fondos insuficientes (Disponibilidad: Bs {myTeam?.cash || 0}). Realice una venta de liquidez para ofertar.</span>
        </div>
      )}
    </div>
  );
}
