import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);
const SESSION_KEY = 'ifi_trader_session';

function saveSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('No se pudo guardar la sesión en sessionStorage', e);
  }
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    // ignore
  }
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [role, setRole] = useState(null); // 'broker' | 'team'
  const [room, setRoom] = useState(null);
  const [game, setGame] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [clock, setClock] = useState({ phase: 'idle', timeRemaining: 120, paused: false });
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('bbv-theme') || 'light');
  const [restoringSession, setRestoringSession] = useState(() => {
    const saved = loadSession();
    return !!(saved && saved.roomCode);
  });

  // Referencia mutable a la sala activa para filtrar eventos de sockets desfasados
  const roomRef = useRef(null);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // Mantener tema en el HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bbv-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    // Si estamos en Vite proxy o local, socket se conecta automáticamente al backend
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    s.on('connect', () => {
      console.log(' Conectado al servidor de juego por WebSocket:', s.id);
      setConnected(true);
      setError('');

      // Restauración transparente de sesión activa tras F5 / recarga
      const saved = loadSession();
      if (saved && saved.roomCode) {
        if (saved.role === 'team' && saved.teamName) {
          s.emit('join_room', { roomCode: saved.roomCode, teamName: saved.teamName }, res => {
            setRestoringSession(false);
            if (res && res.success) {
              setRole('team');
              setRoom(res.room);
              setMyTeam({ id: res.teamId, name: res.teamName });
              if (res.game) setGame(res.game);
              roomRef.current = res.room;
              console.log(' Sesión de equipo restaurada exitosamente:', saved.teamName, saved.roomCode);
            } else {
              clearSession();
            }
          });
        } else if (saved.role === 'broker' && saved.brokerToken) {
          s.emit('reconnect_broker', { roomCode: saved.roomCode, brokerToken: saved.brokerToken }, res => {
            setRestoringSession(false);
            if (res && res.success) {
              setRole('broker');
              setRoom(res.room);
              if (res.game) setGame(res.game);
              roomRef.current = res.room;
              console.log(' Sesión de broker restaurada exitosamente:', saved.roomCode);
            } else {
              clearSession();
            }
          });
        } else {
          setRestoringSession(false);
        }
      } else {
        setRestoringSession(false);
      }
    });

    s.on('connect_error', () => {
      setRestoringSession(false);
    });

    s.on('disconnect', () => {
      console.warn(' Desconectado del servidor de juego');
      setConnected(false);
    });

    // Filtro de sala estricto para evitar colisión de relojes entre partidas distintas
    s.on('clock_tick', tick => {
      if (tick.roomCode && roomRef.current?.code && tick.roomCode !== roomRef.current.code) {
        return; // Descartar ticks de partidas anteriores o ajenas
      }
      setClock(tick);
    });

    s.on('room_teams_updated', ({ teams }) => {
      setRoom(prev => (prev ? { ...prev, teams } : null));
    });

    s.on('game_started', ({ room: r, game: g }) => {
      if (r.code && roomRef.current?.code && r.code !== roomRef.current.code) {
        return;
      }
      setRoom(r);
      setGame(g);
      roomRef.current = r;
    });

    s.on('game_updated', g => {
      if (g.roomCode && roomRef.current?.code && g.roomCode !== roomRef.current.code) {
        return; // Descartar actualizaciones de otras salas
      }
      setGame(g);
    });

    s.on('room_closed', ({ reason }) => {
      clearSession();
      roomRef.current = null;
      setRole(null);
      setRoom(null);
      setGame(null);
      setMyTeam(null);
      setError(reason || 'La sala fue cerrada por el Broker administrador.');
    });

    s.on('team_removed_by_broker', ({ message }) => {
      clearSession();
      roomRef.current = null;
      setRole(null);
      setRoom(null);
      setGame(null);
      setMyTeam(null);
      setError(message || 'Su mesa fue retirada de la sala por el Broker.');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Métodos de acción
  const createRoom = options => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Sin conexión'));
      socket.emit('create_room', options, res => {
        if (res.success) {
          saveSession({
            role: 'broker',
            roomCode: res.room.code,
            brokerToken: res.brokerToken,
          });
          roomRef.current = res.room;
          setRole('broker');
          setRoom(res.room);
          setClock({ phase: 'idle', timeRemaining: res.room.settings?.turnSeconds || 120, paused: false });
          resolve(res);
        } else {
          setError(res.error || 'Error al crear sala');
          reject(new Error(res.error));
        }
      });
    });
  };

  const joinRoom = (roomCode, teamName) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Sin conexión'));
      socket.emit('join_room', { roomCode, teamName }, res => {
        if (res.success) {
          saveSession({
            role: 'team',
            roomCode: res.room.code,
            teamName: res.teamName,
            teamId: res.teamId,
          });
          roomRef.current = res.room;
          setRole('team');
          setRoom(res.room);
          setMyTeam({ id: res.teamId, name: res.teamName });
          if (res.game) setGame(res.game);
          resolve(res);
        } else {
          setError(res.error || 'Error al unirse');
          reject(new Error(res.error));
        }
      });
    });
  };

  const createSoloDemo = (playerName) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Sin conexión'));
      socket.emit('create_solo_demo', { playerName }, res => {
        if (res.success) {
          saveSession({
            role: 'team',
            roomCode: res.room.code,
            teamName: res.teamName,
            teamId: res.teamId,
            isSolo: true,
          });
          roomRef.current = res.room;
          setRole('team');
          setRoom(res.room);
          setMyTeam({ id: res.teamId, name: res.teamName });
          setGame(res.game);
          setClock({ phase: 'turn', timeRemaining: res.game?.currentTurn?.timeRemaining || 45, paused: false });
          resolve(res);
        } else {
          setError(res.error || 'Error al iniciar modo solitario');
          reject(new Error(res.error));
        }
      });
    });
  };

  const addBot = () => {
    return new Promise((resolve, reject) => {
      if (!socket || !room) return reject(new Error('No hay sala activa'));
      socket.emit('add_bot', { roomCode: room.code }, res => {
        if (res.success) resolve(res.bot);
        else reject(new Error(res.error));
      });
    });
  };

  const startGame = () => {
    return new Promise((resolve, reject) => {
      if (!socket || !room) return reject(new Error('No hay sala activa'));
      socket.emit('start_game', { roomCode: room.code }, res => {
        if (res.success) {
          setGame(res.game);
          resolve(res);
        } else {
          setError(res.error || 'Error al iniciar');
          reject(new Error(res.error));
        }
      });
    });
  };

  const trade = (companyId, qty, side, phase) => {
    return new Promise((resolve, reject) => {
      if (!socket || !room || !myTeam) return reject(new Error('Acción no permitida'));
      socket.emit(
        'trade',
        { roomCode: room.code, teamId: myTeam.id, companyId, qty, side, phase },
        res => {
          if (res.success) resolve();
          else reject(new Error(res.error));
        }
      );
    });
  };

  const playCard = (instanceId, otherCompanyId) => {
    return new Promise((resolve, reject) => {
      if (!socket || !room || !myTeam) return reject(new Error('Acción no permitida'));
      socket.emit(
        'play_card',
        { roomCode: room.code, teamId: myTeam.id, instanceId, otherCompanyId },
        res => {
          if (res.success) resolve();
          else reject(new Error(res.error));
        }
      );
    });
  };

  const endTurn = () => {
    return new Promise((resolve, reject) => {
      if (!socket || !room || !myTeam) return reject(new Error('Acción no permitida'));
      socket.emit('end_turn', { roomCode: room.code, teamId: myTeam.id }, res => {
        if (res.success) resolve();
        else reject(new Error(res.error));
      });
    });
  };

  const placeBid = () => {
    return new Promise((resolve, reject) => {
      if (!socket || !room || !myTeam) return reject(new Error('Acción no permitida'));
      socket.emit('place_bid', { roomCode: room.code, teamId: myTeam.id }, res => {
        if (res.success) resolve();
        else reject(new Error(res.error));
      });
    });
  };

  const sellDuringAuction = (companyId, qty) => {
    return new Promise((resolve, reject) => {
      if (!socket || !room || !myTeam) return reject(new Error('Acción no permitida'));
      socket.emit(
        'sell_during_auction',
        { roomCode: room.code, teamId: myTeam.id, companyId, qty },
        res => {
          if (res.success) resolve();
          else reject(new Error(res.error));
        }
      );
    });
  };

  const resolveCrisis = (companyId, decision) => {
    return new Promise((resolve, reject) => {
      if (!socket || !room || !myTeam) return reject(new Error('Acción no permitida'));
      socket.emit(
        'resolve_crisis',
        { roomCode: room.code, teamId: myTeam.id, companyId, decision },
        res => {
          if (res.success) resolve();
          else reject(new Error(res.error));
        }
      );
    });
  };

  const togglePause = () => {
    if (!socket || !room) return;
    socket.emit('toggle_pause', { roomCode: room.code });
  };

  const skipTurn = () => {
    if (!socket || !room) return;
    socket.emit('skip_turn', { roomCode: room.code });
  };

  const renameTeam = newName => {
    return new Promise((resolve, reject) => {
      if (!socket || !room || !myTeam) return reject(new Error('Sin sala activa'));
      socket.emit('rename_team', { roomCode: room.code, teamId: myTeam.id, newName }, res => {
        if (res && res.success) {
          setMyTeam(prev => (prev ? { ...prev, name: res.newName } : null));
          const saved = loadSession();
          if (saved) {
            saveSession({ ...saved, teamName: res.newName });
          }
          resolve(res);
        } else {
          reject(new Error(res?.error || 'Error al renombrar equipo'));
        }
      });
    });
  };

  const removeTeam = teamId => {
    return new Promise((resolve, reject) => {
      if (!socket || !room) return reject(new Error('Sin sala activa'));
      socket.emit('remove_team', { roomCode: room.code, teamId }, res => {
        if (res && res.success) resolve(res);
        else reject(new Error(res?.error || 'Error al retirar equipo'));
      });
    });
  };

  const resetAll = () => {
    if (socket && roomRef.current?.code) {
      socket.emit('leave_room', { roomCode: roomRef.current.code });
    }
    clearSession();
    roomRef.current = null;
    setRole(null);
    setRoom(null);
    setGame(null);
    setMyTeam(null);
    setClock({ phase: 'idle', timeRemaining: 120, paused: false });
    setError('');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        restoringSession,
        role,
        room,
        game,
        myTeam,
        clock,
        error,
        setError,
        theme,
        toggleTheme,
        createRoom,
        joinRoom,
        createSoloDemo,
        addBot,
        startGame,
        renameTeam,
        removeTeam,
        trade,
        playCard,
        endTurn,
        placeBid,
        sellDuringAuction,
        resolveCrisis,
        togglePause,
        skipTurn,
        resetAll,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useGameSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useGameSocket debe ser usado dentro de un SocketProvider');
  return ctx;
}
