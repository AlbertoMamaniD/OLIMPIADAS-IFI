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
  const { role, room, game, resetAll } = useGameSocket();

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
        {/* 1. Fin de partida */}
        {game?.gameOver ? (
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
