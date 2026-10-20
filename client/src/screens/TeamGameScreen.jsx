import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';
import { TimerBadge } from '../components/TimerBadge';
import { MarketBoard } from '../components/MarketBoard';
import { CardDeck } from '../components/CardDeck';
import { Portfolio } from '../components/Portfolio';
import { EventLog } from '../components/EventLog';
import { PriceChart } from '../components/PriceChart';
import { AuctionBanner } from '../components/AuctionBanner';
import { TradeModal } from '../components/TradeModal';
import { CardTargetModal } from '../components/CardTargetModal';
import { CrisisModal } from '../components/CrisisModal';

export function TeamGameScreen() {
  const {
    game,
    myTeam,
    clock,
    trade,
    playCard,
    endTurn,
    placeBid,
    sellDuringAuction,
    resolveCrisis,
  } = useGameSocket();

  const [activeModal, setActiveModal] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!game || !myTeam) return null;

  const teamData = game.teams.find(t => t.id === myTeam.id) || myTeam;
  const currentTurn = game.currentTurn;
  const isMyTurn = currentTurn?.teamId === myTeam.id && !game.paused && !game.manualPause;
  const currentTurnTeam = game.teams.find(t => t.id === currentTurn?.teamId) || { name: 'Mesa contraria' };

  const canEndTurn = isMyTurn && !!currentTurn?.cardPlayed;

  const myPendingCrisis = game.pendingDecisions?.find(
    d => d.type === 'crisis' && d.teamId === myTeam.id && !d.resolved
  );

  const handleOpenTrade = (company, side) => {
    setLocalError('');
    setActiveModal({ type: 'trade', company, side });
  };

  const handleConfirmTrade = async (companyId, qty, side) => {
    setActionInProgress(true);
    setLocalError('');
    try {
      if (game.auction) {
        await sellDuringAuction(companyId, qty);
      } else {
        await trade(companyId, qty, side, currentTurn.phase);
      }
      setActiveModal(null);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePlayCard = (card, needsOther) => {
    setLocalError('');
    if (needsOther) {
      setActiveModal({ type: 'cardTarget', card });
    } else {
      executePlayCard(card.instanceId, null);
    }
  };

  const executePlayCard = async (instanceId, otherCompanyId) => {
    setActionInProgress(true);
    setLocalError('');
    try {
      await playCard(instanceId, otherCompanyId);
      setActiveModal(null);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleEndTurn = async () => {
    setActionInProgress(true);
    setLocalError('');
    try {
      await endTurn();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePlaceBid = async () => {
    setActionInProgress(true);
    setLocalError('');
    try {
      await placeBid();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResolveCrisis = async (companyId, decision) => {
    setActionInProgress(true);
    setLocalError('');
    try {
      await resolveCrisis(companyId, decision);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div>
      {/* Barra de Estado de Turno */}
      <div className="turn-status-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`turn-pill-badge ${isMyTurn ? 'active' : 'inactive'}`}>
            <CheckCircle2 size={11} />
            <span>{isMyTurn ? 'TURNO ACTIVO' : 'TURNO RIVAL'}</span>
          </span>
          <span style={{ fontSize: '13px' }}>
            {isMyTurn ? (
              <strong>Mesa Habilitada para Operar</strong>
            ) : (
              <span>Operando actualmente: <strong style={{ color: 'var(--ink)' }}>{currentTurnTeam.name}</strong></span>
            )}
          </span>
          {currentTurn?.isLastTurn && (
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--down)', fontWeight: 700, border: '1px solid var(--down-border)', background: 'var(--down-subtle)', padding: '2px 6px', borderRadius: '2px' }}>
              ÚLTIMO TURNO · SOLO VENTA AUTORIZADA
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TimerBadge
            seconds={clock.timeRemaining}
            paused={game.paused || game.manualPause}
            isAuction={!!game.auction}
          />
        </div>
      </div>

      {/* Banner de Subasta Activa */}
      {game.auction && (
        <AuctionBanner
          auction={game.auction}
          companies={game.companies}
          myTeam={teamData}
          clock={clock}
          onPlaceBid={handlePlaceBid}
          onOpenQuickSell={() => {
            const firstWithShares = game.companies.find(c => (teamData.holdings?.[c.id] || 0) > 0);
            if (firstWithShares) handleOpenTrade(firstWithShares, 'sell');
          }}
        />
      )}

      {/* Notificación de Error */}
      {localError && (
        <div style={{ padding: '0 24px', marginTop: '12px' }}>
          <div className="terminal-alert-error">
            <AlertCircle size={14} />
            <span>{localError}</span>
          </div>
        </div>
      )}

      {/* Área de Trabajo de Negociación */}
      <div className="trading-workspace">
        {/* Columna Izquierda: Cotizaciones y Gráfico */}
        <div>
          <MarketBoard
            companies={game.companies}
            myTeam={teamData}
            currentTurn={currentTurn}
            isMyTurn={isMyTurn}
            onOpenTrade={handleOpenTrade}
            isAuctionActive={!!game.auction}
          />
          <PriceChart companies={game.companies} />
        </div>

        {/* Columna Derecha: Tarjetas, Portafolio y Auditoría */}
        <div>
          <CardDeck
            hand={teamData.hand || []}
            companies={game.companies}
            isMyTurn={isMyTurn}
            cardPlayed={!!currentTurn?.cardPlayed}
            onPlayCard={handlePlayCard}
            actionInProgress={actionInProgress}
          />

          <Portfolio team={teamData} companies={game.companies} />

          <EventLog log={game.log} />
        </div>
      </div>

      {/* Cierre de Turno */}
      {canEndTurn && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--surface)',
            borderTop: '1px solid var(--line)',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            boxShadow: 'var(--shadow-overlay)',
            zIndex: 40,
          }}
        >
          <button
            className="btn-primary-action"
            style={{ width: 'auto', padding: '10px 24px', fontSize: '13.5px' }}
            disabled={actionInProgress}
            onClick={handleEndTurn}
          >
            <Send size={14} />
            <span>{actionInProgress ? 'Transmitiendo orden...' : 'Finalizar Turno Operativo'}</span>
          </button>
        </div>
      )}

      {/* Modales */}
      {activeModal?.type === 'trade' && (
        <TradeModal
          company={activeModal.company}
          side={activeModal.side}
          myTeam={teamData}
          onClose={() => setActiveModal(null)}
          onConfirm={handleConfirmTrade}
        />
      )}

      {activeModal?.type === 'cardTarget' && (
        <CardTargetModal
          card={activeModal.card}
          companies={game.companies}
          onClose={() => setActiveModal(null)}
          onConfirm={executePlayCard}
        />
      )}

      {myPendingCrisis && (
        <CrisisModal
          decision={myPendingCrisis}
          companies={game.companies}
          myTeam={teamData}
          onResolve={handleResolveCrisis}
        />
      )}
    </div>
  );
}
