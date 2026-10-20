import React, { useState } from 'react';
import { Clock, BookOpen, CheckCircle2, Edit3, LogOut } from 'lucide-react';
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
      <div className="terminal-centered">
        <div className="terminal-panel" style={{ maxWidth: '520px', textAlign: 'center' }}>
          {/* Título de mesa con botón para editar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <h2 className="terminal-heading" style={{ margin: 0, fontSize: '22px' }}>
              Mesa Registrada: <span style={{ color: 'var(--ifi-secondary)' }}>{myTeam?.name}</span>
            </h2>
            <button
              type="button"
              className="btn-control"
              onClick={() => setShowRenameModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--ifi-secondary)',
                borderColor: 'var(--ifi-border)',
                background: 'var(--ifi-subtle)',
              }}
              title="Modificar nombre de su equipo"
            >
              <Edit3 size={12} />
              <span>Editar</span>
            </button>
          </div>

          <p className="terminal-subheading">
            Conexión establecida con la sala <strong>{room?.code}</strong>. Permanezca en esta pantalla hasta la apertura de la rueda por parte del broker.
          </p>

          <div
            style={{
              background: 'var(--surface-subtle)',
              border: '1px solid var(--line)',
              borderLeft: '3px solid var(--ifi-secondary)',
              padding: '14px 18px',
              borderRadius: 'var(--border-radius-sm)',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ifi-secondary)', fontWeight: 700 }}>
                <Clock size={14} />
                <span>ESTADO: EN ESPERA DE APERTURA</span>
              </span>
              <span style={{ color: 'var(--ink-secondary)' }}>{teams.length} equipos en sala</span>
            </div>
          </div>

          {/* Equipos registrados */}
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
              OPERADORES INSCRITOS EN SALA:
            </div>
            <div className="team-chips-grid">
              {teams.map(t => (
                <div
                  key={t.id}
                  className={`team-indicator-chip ${t.id === myTeam?.id ? 'self' : ''}`}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.name}
                  </span>
                  <CheckCircle2 size={12} color="var(--up)" />
                </div>
              ))}
            </div>
          </div>

          {/* Acciones del Lobby */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn-secondary-action" style={{ width: '100%' }} onClick={onOpenRules}>
              <BookOpen size={14} />
              <span>Consultar Reglamento de Operación</span>
            </button>

            <button
              type="button"
              className="btn-control"
              style={{
                width: '100%',
                padding: '9px',
                fontSize: '12px',
                color: 'var(--down)',
                borderColor: 'var(--down-border)',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onClick={() => setShowExitModal(true)}
              title="Liberar cupo y salir de la sala"
            >
              <LogOut size={13} />
              <span>Abandonar Sala de Espera</span>
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
