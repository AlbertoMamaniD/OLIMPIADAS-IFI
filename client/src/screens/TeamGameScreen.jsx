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
  TrendingUp,
  Layers,
  Briefcase,
  LineChart,
  Activity,
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
  const [mobileTab, setMobileTab] = useState('market'); // 'market' | 'cards' | 'portfolio' | 'chart' | 'tape'

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
      <div className={`turn-command-ribbon ${isMyTurn ? 'is-my-turn' : ''}`}>
        <div className="ribbon-inner-container">
          <div className="ribbon-left">
            <div className="turn-number-tag">
              <span className="turn-number-label">Ronda</span>
              <span className="turn-number-value font-mono">{game.turnNumber}</span>
            </div>

            <div className="ribbon-team-pill">
              {teamData.name}
            </div>

            <div className={`turn-status-badge ${isMyTurn ? 'is-active' : 'is-idle'}`}>
              <span className="status-pulse-dot" />
              <span className="status-text">
                {isMyTurn ? (
                  <>¡Es tu turno! <span className="status-text-extra">Puedes operar</span></>
                ) : (
                  <>Turno de <strong>{currentTurnTeam.name}</strong></>
                )}
              </span>
            </div>

            {/* Pasos del turno */}
            {isMyTurn && (
              <div className="phase-stepper-bar" aria-label="Pasos del turno">
                <span className={`phase-step ${currentTurn.phase === 'before' ? 'step-current' : 'step-done'}`}>
                  <span className="step-num font-mono">1</span>
                  <span className="step-full-label">Operar (opcional)</span>
                  <span className="step-mob-label">Operar</span>
                </span>
                <ArrowRight size={14} className="step-arrow" />
                <span className={`phase-step ${currentTurn.cardPlayed ? 'step-done' : currentTurn.phase === 'before' ? 'step-pending' : 'step-current'}`}>
                  <span className="step-num font-mono">2</span>
                  <span className="step-full-label">Jugar tarjeta (obligatorio)</span>
                  <span className="step-mob-label">Tarjeta {!currentTurn.cardPlayed ? '!' : '✓'}</span>
                </span>
                <ArrowRight size={14} className="step-arrow" />
                <span className={`phase-step ${currentTurn.cardPlayed ? 'step-current' : 'step-pending'}`}>
                  <span className="step-num font-mono">3</span>
                  <span className="step-full-label">Operar y terminar</span>
                  <span className="step-mob-label">Terminar</span>
                </span>
              </div>
            )}

            {currentTurn?.isLastTurn && (
              <div className="last-turn-warning-chip">
                <AlertTriangle size={14} />
                <span>Último turno · solo puedes vender</span>
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

      {/* Barra de pestañas inferior (solo móvil, <= 768px) */}
      <nav className="mobile-nav-tabs-bar" aria-label="Secciones del juego">
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'market' ? 'active' : ''}`}
          onClick={() => setMobileTab('market')}
        >
          <TrendingUp size={20} />
          <span className="tab-label">Mercado</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'cards' ? 'active' : ''} ${isMyTurn && !currentTurn?.cardPlayed ? 'tab-urgent' : ''}`}
          onClick={() => setMobileTab('cards')}
        >
          <Layers size={20} />
          <span className="tab-label">Cartas</span>
          <span className="tab-count-pill font-mono" aria-label="tarjetas en mano">{teamData.hand?.length || 0}</span>
          {isMyTurn && !currentTurn?.cardPlayed && <span className="tab-alert-badge">!</span>}
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setMobileTab('portfolio')}
        >
          <Briefcase size={20} />
          <span className="tab-label">Cartera</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'chart' ? 'active' : ''}`}
          onClick={() => setMobileTab('chart')}
        >
          <LineChart size={20} />
          <span className="tab-label">Gráfico</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'tape' ? 'active' : ''}`}
          onClick={() => setMobileTab('tape')}
        >
          <Activity size={20} />
          <span className="tab-label">Registro</span>
        </button>
      </nav>

      {/* Área de Trabajo de Negociación */}
      <div className="trading-workspace">
        {/* Columna Izquierda: Cotizaciones y Gráfico */}
        <div className="workspace-main-column">
          <div className={`workspace-tab-pane pane-market ${mobileTab === 'market' ? 'is-active-tab' : ''}`}>
            <MarketBoard
              companies={game.companies}
              myTeam={teamData}
              currentTurn={currentTurn}
              isMyTurn={isMyTurn}
              onOpenTrade={handleOpenTrade}
              isAuctionActive={!!game.auction}
            />
          </div>

          <div className={`workspace-tab-pane pane-chart ${mobileTab === 'chart' ? 'is-active-tab' : ''}`}>
            <PriceChart companies={game.companies} />
          </div>
        </div>

        {/* Columna Derecha: Tarjetas, Portafolio y Auditoría */}
        <div className="workspace-side-column">
          <div className={`workspace-tab-pane pane-cards ${mobileTab === 'cards' ? 'is-active-tab' : ''}`}>
            <CardDeck
              hand={teamData.hand || []}
              companies={game.companies}
              isMyTurn={isMyTurn}
              cardPlayed={!!currentTurn?.cardPlayed}
              onPlayCard={handlePlayCard}
              actionInProgress={actionInProgress}
            />
          </div>

          <div className={`workspace-tab-pane pane-portfolio ${mobileTab === 'portfolio' ? 'is-active-tab' : ''}`}>
            <Portfolio team={teamData} companies={game.companies} />
          </div>

          <div className={`workspace-tab-pane pane-tape ${mobileTab === 'tape' ? 'is-active-tab' : ''}`}>
            <EventLog log={game.log} />
          </div>
        </div>
      </div>

      {/* Barra Inferior Fija para Cierre de Turno */}
      {canEndTurn && (
        <div className="turn-completion-dock">
          <div className="dock-content">
            <div className="dock-hint">
              <CheckCircle2 size={20} className="dock-hint-icon" />
              <span><strong>Tarjeta jugada.</strong> Puedes hacer una operación más o terminar tu turno.</span>
            </div>
            <button
              className="btn-complete-turn"
              disabled={actionInProgress}
              onClick={handleEndTurn}
            >
              <Send size={17} />
              <span>{actionInProgress ? 'Enviando…' : 'Terminar turno'}</span>
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
