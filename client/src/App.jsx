import React, { useState } from 'react';
import { useGameSocket } from './context/SocketContext';
import { Topbar } from './components/Topbar';
import { RulesModal } from './components/RulesModal';
import { HistoryModal } from './components/HistoryModal';
import { RoleSelectScreen } from './screens/RoleSelectScreen';
import { BrokerSetupScreen } from './screens/BrokerSetupScreen';
import { BrokerLobbyScreen } from './screens/BrokerLobbyScreen';
import { BrokerLiveDashboard } from './screens/BrokerLiveDashboard';
import { TeamJoinScreen } from './screens/TeamJoinScreen';
import { TeamLobbyScreen } from './screens/TeamLobbyScreen';
import { TeamGameScreen } from './screens/TeamGameScreen';
import { GameOverScreen } from './screens/GameOverScreen';

export function App() {
  const { role, room, game, resetAll, restoringSession } = useGameSocket();

  const [selectedRole, setSelectedRole] = useState(null); // 'broker' | 'team' | null
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const activeRole = role || selectedRole;

  return (
    <div className="app-container">
      <Topbar
        onOpenRules={() => setShowRules(true)}
        onOpenHistory={() => setShowHistory(true)}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {restoringSession ? (
          <div className="terminal-centered" style={{ minHeight: '65vh' }}>
            <div className="terminal-panel" style={{ maxWidth: '440px', textAlign: 'center', padding: '36px 28px' }}>
              <div className="status-pulse-dot" style={{ width: '14px', height: '14px', margin: '0 auto 16px auto', background: 'var(--ifi-primary)' }} />
              <h3 className="terminal-heading" style={{ fontSize: '18px', marginBottom: '8px' }}>
                Reanudando Rueda Bursátil...
              </h3>
              <p className="terminal-subheading" style={{ fontSize: '12.5px', margin: 0 }}>
                Restableciendo terminal, cartera de títulos y conexión con el recinto olímpico.
              </p>
            </div>
          </div>
        ) : game?.gameOver ? (
          <GameOverScreen
            onPlayAgain={() => {
              setSelectedRole(null);
              resetAll();
            }}
          />
        ) : activeRole === 'broker' ? (
          /* 2. Flujo del Broker */
          game ? (
            <BrokerLiveDashboard />
          ) : room ? (
            <BrokerLobbyScreen />
          ) : (
            <BrokerSetupScreen
              onBack={() => setSelectedRole(null)}
              onRoomCreated={() => {}}
            />
          )
        ) : activeRole === 'team' ? (
          /* 3. Flujo del Equipo Estudiante */
          game ? (
            <TeamGameScreen />
          ) : room ? (
            <TeamLobbyScreen onOpenRules={() => setShowRules(true)} />
          ) : (
            <TeamJoinScreen
              onBack={() => setSelectedRole(null)}
              onJoined={() => {}}
            />
          )
        ) : (
          /* 4. Selección inicial de rol */
          <RoleSelectScreen onSelectRole={r => setSelectedRole(r)} />
        )}
      </main>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}
export default App;
