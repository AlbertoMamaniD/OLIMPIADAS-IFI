import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
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
  const currentTurnTeam = game.teams.find(t => t.id === currentTurn?.teamId) || { name: 'Mesa Rival' };

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
    <div className="game-screen-wrapper">
      {/* Barra de Comando de Ronda con Espaciado Generoso */}
      <div className="turn-command-ribbon">
        <div className="ribbon-left">
          <div className="turn-number-tag font-mono">
            RONDA #{game.turnNumber}
          </div>

          <div className={`turn-status-badge ${isMyTurn ? 'is-active' : 'is-idle'}`}>
            <span className="status-pulse-dot" />
            <span className="status-text font-mono">
              {isMyTurn ? 'MESA HABILITADA PARA OPERAR' : `TURNO EN CURSO: ${currentTurnTeam.name.toUpperCase()}`}
            </span>
          </div>

          {/* Stepper de Fases Operativas con Alto Contraste */}
          {isMyTurn && (
            <div className="phase-stepper-bar font-mono">
              <span className={`phase-step ${currentTurn.phase === 'before' ? 'step-current' : 'step-done'}`}>
                1. Pre-operación (Libre)
              </span>
              <ArrowRight size={13} className="step-arrow" />
              <span className={`phase-step ${currentTurn.cardPlayed ? 'step-done' : currentTurn.phase === 'before' ? 'step-pending' : 'step-current'}`}>
                2. Tarjeta Táctica (Obligatoria)
              </span>
              <ArrowRight size={13} className="step-arrow" />
              <span className={`phase-step ${currentTurn.cardPlayed ? 'step-current' : 'step-pending'}`}>
                3. Post-operación (Restante)
              </span>
            </div>
          )}

          {currentTurn?.isLastTurn && (
            <div className="last-turn-warning-chip font-mono">
              <AlertTriangle size={14} />
              <span>ÚLTIMO TURNO · SOLO VENTAS AUTORIZADAS</span>
            </div>
          )}
        </div>

        <div className="ribbon-right">
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
        <div className="terminal-alert-error-container">
          <div className="terminal-alert-error">
            <AlertCircle size={16} />
            <span>{localError}</span>
          </div>
        </div>
      )}

      {/* Área de Trabajo de Negociación */}
      <div className="trading-workspace">
        {/* Columna Izquierda: Cotizaciones y Gráfico */}
        <div className="workspace-main-column">
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
        <div className="workspace-side-column">
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

      {/* Barra Inferior Fija para Cierre de Turno */}
      {canEndTurn && (
        <div className="turn-completion-dock">
          <div className="dock-content">
            <div className="dock-hint">
              <CheckCircle2 size={18} className="text-ifi" />
              <span>Orden táctica registrada en el libro de la BBV. Puede realizar una operación bursátil restante o finalizar su turno ahora.</span>
            </div>
            <button
              className="btn-complete-turn font-mono"
              disabled={actionInProgress}
              onClick={handleEndTurn}
            >
              <Send size={15} />
              <span>{actionInProgress ? 'Transmitiendo orden...' : 'Finalizar Turno Operativo'}</span>
            </button>
          </div>
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
