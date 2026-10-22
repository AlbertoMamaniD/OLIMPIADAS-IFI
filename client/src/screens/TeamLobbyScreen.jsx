import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Edit3, LogOut, Users } from 'lucide-react';
import { useGameSocket } from '../context/SocketContext';
import { RenameTeamModal } from '../components/RenameTeamModal';
import { ExitConfirmModal } from '../components/ExitConfirmModal';

export function TeamLobbyScreen({ onOpenRules }) {
  const { room, myTeam, renameTeam, resetAll } = useGameSocket();
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const teams = room?.teams || [];

  return (
    <>
      <div className="terminal-centered access-screen">
        <div className="terminal-panel lobby-panel">
          <div className="lobby-status-chip">
            <span className="lobby-status-dot" />
            <span>
              Conectado a la sala <strong className="font-mono">{room?.code}</strong>
            </span>
          </div>

          {/* Título de mesa con botón para editar */}
          <div className="lobby-team-head">
            <span className="ui-eyebrow">Tu mesa</span>
            <div className="lobby-team-name-row">
              <h2 className="lobby-team-name">{myTeam?.name}</h2>
              <button
                type="button"
                className="lobby-edit-btn"
                onClick={() => setShowRenameModal(true)}
                title="Modificar nombre de su equipo"
              >
                <Edit3 size={14} />
                <span>Editar</span>
              </button>
            </div>
          </div>

          {/* Estado de espera */}
          <div className="lobby-waiting-card">
            <div className="lobby-waiting-loader" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="lobby-waiting-text">
              <strong>Esperando que el broker abra la rueda</strong>
              <span>Mantén esta pantalla abierta. El juego empezará automáticamente.</span>
            </div>
          </div>

          {/* Equipos registrados */}
          <div className="lobby-teams-block">
            <div className="lobby-section-title">
              <span className="lobby-section-label">
                <Users size={15} />
                Equipos en la sala
              </span>
              <span className="ui-badge ui-badge--brand font-mono">{teams.length}</span>
            </div>
            <div className="team-chips-grid">
              {teams.map(t => (
                <div
                  key={t.id}
                  className={`team-indicator-chip ${t.id === myTeam?.id ? 'self' : ''}`}
                >
                  <CheckCircle2 size={15} className="team-chip-check" />
                  <span className="team-chip-name">{t.name}</span>
                  {t.id === myTeam?.id && <span className="team-chip-you">Tú</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Acciones del Lobby */}
          <div className="access-actions">
            <button className="btn-secondary-action" onClick={onOpenRules}>
              <BookOpen size={16} />
              <span>Leer el reglamento</span>
            </button>

            <button
              type="button"
              className="btn-ghost-danger"
              onClick={() => setShowExitModal(true)}
              title="Liberar cupo y salir de la sala"
            >
              <LogOut size={15} />
              <span>Salir de la sala</span>
            </button>
          </div>
        </div>
      </div>

      <RenameTeamModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        currentName={myTeam?.name || ''}
        onRename={renameTeam}
      />

      <ExitConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
          resetAll();
        }}
        inGame={false}
        roomCode={room?.code || ''}
      />
    </>
  );
}
