import React, { useState } from 'react';
import { BookOpen, Sun, Moon, LogOut, Shield, Trophy } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';
import { ExitConfirmModal } from './ExitConfirmModal';

export function Topbar({ onOpenRules, onOpenHistory }) {
  const { room, role, myTeam, game, theme, toggleTheme, resetAll } = useGameSocket();
  const [showExitModal, setShowExitModal] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-logo-frame">
            <img
              src="/logo-ifi.png"
              alt="Olimpiadas IFI 2026"
              className="brand-logo-img"
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="brand-title-wrap">
            <div className="brand-title-row">
              <span className="brand-main-title">IFI TRADER LEAGUE</span>
              {room?.code && (
                <span className="room-code-badge font-mono">
                  SALA {room.code}
                </span>
              )}
            </div>
            <div className="brand-meta-row">
              <span className="live-feed-dot" />
              <span className="brand-sub-badge">BOLSA BOLIVIANA DE VALORES · OLIMPIADAS IFI 2026</span>
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          {myTeam && (
            <div className="user-seat-pill">
              <span className="seat-label">MESA ASIGNADA:</span>
              <span className="seat-team-name font-mono">{myTeam.name}</span>
            </div>
          )}

          {role === 'broker' && (
            <div className="broker-auth-pill">
              <Shield size={14} />
              <span>MESA DE CONTROL (BROKER)</span>
            </div>
          )}

          <button className="btn-control btn-history" onClick={onOpenHistory} title="Ver clasificación y podio histórico de las Olimpiadas">
            <Trophy size={15} />
            <span>Historial & Podio</span>
          </button>

          <button className="btn-control btn-rules" onClick={onOpenRules} title="Ver reglamento oficial de competencia">
            <BookOpen size={15} />
            <span>Reglamento</span>
          </button>

          <button className="btn-control btn-theme-toggle" onClick={toggleTheme} title="Alternar modo claro / oscuro">
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            <span>{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
          </button>

          {room && (
            <button
              className="btn-control btn-exit-danger"
              onClick={() => setShowExitModal(true)}
              title="Abandonar sala y regresar a la pantalla principal"
            >
              <LogOut size={15} />
              <span>Salir</span>
            </button>
          )}
        </div>
      </header>

      <ExitConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
          resetAll();
        }}
        inGame={!!game && !game.gameOver}
        roomCode={room?.code || ''}
      />
    </>
  );
}
