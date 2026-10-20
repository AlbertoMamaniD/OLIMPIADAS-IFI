import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

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
    });

    s.on('disconnect', () => {
      console.warn(' Desconectado del servidor de juego');
      setConnected(false);
    });

    s.on('clock_tick', tick => {
      setClock(tick);
    });

    s.on('room_teams_updated', ({ teams }) => {
      setRoom(prev => (prev ? { ...prev, teams } : null));
    });

    s.on('game_started', ({ room: r, game: g }) => {
      setRoom(r);
      setGame(g);
    });

    s.on('game_updated', g => {
      setGame(g);
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
          setRole('broker');
          setRoom(res.room);
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
          setRole('team');
          setRoom(res.room);
          setMyTeam({ id: res.teamId, name: res.teamName });
          setGame(res.game);
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

  const resetAll = () => {
    setRole(null);
    setRoom(null);
    setGame(null);
    setMyTeam(null);
    setError('');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
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
