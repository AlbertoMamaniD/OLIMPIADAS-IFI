import { roomManager } from '../managers/roomManager.js';

function leavePreviousGameRooms(socket) {
  for (const r of socket.rooms) {
    if (r !== socket.id) {
      socket.leave(r);
    }
  }
}

export function registerRoomHandlers(io, socket) {
  // Crear sala (Broker)
  socket.on('create_room', (options, callback) => {
    try {
      leavePreviousGameRooms(socket);
      const room = roomManager.createRoom(socket.id, options);
      socket.join(room.code);
      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: room.code,
          brokerToken: room.brokerToken,
          room: {
            code: room.code,
            brokerToken: room.brokerToken,
            settings: room.settings,
            teams: room.teams,
            started: room.started,
          },
        });
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Reconectar Broker (tras recarga de página)
  socket.on('reconnect_broker', ({ roomCode, brokerToken }, callback) => {
    try {
      leavePreviousGameRooms(socket);
      const room = roomManager.reconnectBroker(roomCode, brokerToken, socket.id);
      socket.join(room.code);
      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: room.code,
          brokerToken: room.brokerToken,
          room: {
            code: room.code,
            brokerToken: room.brokerToken,
            settings: room.settings,
            teams: room.teams,
            started: room.started,
          },
          game: room.game,
        });
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Modo Solo / Demostración rápida con Bots (sin requerir otras personas)
  socket.on('create_solo_demo', ({ playerName }, callback) => {
    try {
      leavePreviousGameRooms(socket);
      const { room, team, game } = roomManager.createSoloDemoGame(socket.id, playerName, io);
      socket.join(room.code);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: room.code,
          brokerToken: room.brokerToken,
          teamId: team.id,
          teamName: team.name,
          room: {
            code: room.code,
            brokerToken: room.brokerToken,
            settings: room.settings,
            teams: room.teams,
            started: true,
          },
          game,
        });
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Agregar un equipo Bot a la sala (Broker)
  socket.on('add_bot', ({ roomCode }, callback) => {
    try {
      const bot = roomManager.addBot(roomCode, io);
      if (typeof callback === 'function') callback({ success: true, bot });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Unirse a sala (Equipo / Alumno o Reconexión tras F5)
  socket.on('join_room', ({ roomCode, teamName }, callback) => {
    try {
      leavePreviousGameRooms(socket);

      // Limpiar salas huérfanas previas donde este socket era el único humano
      if (roomCode) {
        const normCode = roomCode.trim().toUpperCase();
        for (const [code, r] of roomManager.rooms.entries()) {
          if (code !== normCode) {
            const humanTeams = r.teams.filter(t => !t.isBot);
            if (humanTeams.length <= 1 && (r.brokerSocketId === socket.id || r.teams.some(t => t.socketId === socket.id))) {
              roomManager.destroyRoom(code);
            }
          }
        }
      }

      const { room, team, reconnected } = roomManager.joinRoom(roomCode, teamName, socket.id);
      socket.join(room.code);

      io.to(room.code).emit('room_teams_updated', {
        teams: room.teams,
        total: room.teams.length,
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          reconnected,
          teamId: team.id,
          teamName: team.name,
          room: {
            code: room.code,
            settings: room.settings,
            teams: room.teams,
            started: room.started,
          },
          game: room.game,
        });
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Renombrar equipo en el lobby antes de iniciar
  socket.on('rename_team', ({ roomCode, teamId, newName }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room) throw new Error('Sala no encontrada');
      if (room.started) throw new Error('No se puede cambiar el nombre una vez iniciada la rueda');

      const cleanName = (newName || '').trim();
      if (!cleanName) throw new Error('El nombre de equipo no puede estar vacío');
      if (cleanName.length > 25) throw new Error('El nombre no puede tener más de 25 caracteres');

      const duplicate = room.teams.find(
        t => t.id !== teamId && t.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (duplicate) throw new Error('Ya existe otro equipo con ese nombre en la sala');

      const team = room.teams.find(t => t.id === teamId);
      if (!team) throw new Error('Equipo no encontrado en la sala');

      team.name = cleanName;

      io.to(room.code).emit('room_teams_updated', {
        teams: room.teams,
        total: room.teams.length,
      });

      if (typeof callback === 'function') {
        callback({ success: true, newName: cleanName });
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Retirar equipo del lobby (Broker)
  socket.on('remove_team', ({ roomCode, teamId }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room) throw new Error('Sala no encontrada');
      if (room.started) throw new Error('No se puede retirar equipos una vez iniciada la partida');
      if (room.brokerSocketId !== socket.id) throw new Error('Solo el Broker administrador puede retirar equipos');

      const targetTeam = room.teams.find(t => t.id === teamId);
      if (targetTeam && targetTeam.socketId) {
        io.to(targetTeam.socketId).emit('team_removed_by_broker', {
          message: 'Su mesa fue retirada de la sala por el Broker administrador.',
        });
      }

      room.teams = room.teams.filter(t => t.id !== teamId);
      io.to(room.code).emit('room_teams_updated', {
        teams: room.teams,
        total: room.teams.length,
      });

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Salir de la sala activamente
  socket.on('leave_room', ({ roomCode }) => {
    leavePreviousGameRooms(socket);
    if (roomCode) {
      const room = roomManager.getRoom(roomCode);
      if (room) {
        if (!room.started) {
          // Si estamos en el lobby antes de iniciar:
          if (room.brokerSocketId === socket.id) {
            // Si el broker sale, se cierra la sala
            roomManager.destroyRoom(roomCode);
            io.to(room.code).emit('room_closed', { reason: 'El Broker administrador cerró la sala de espera.' });
          } else {
            // Si un equipo sale del lobby, se elimina de la lista y se avisa a todos
            room.teams = room.teams.filter(t => t.socketId !== socket.id);
            io.to(room.code).emit('room_teams_updated', {
              teams: room.teams,
              total: room.teams.length,
            });
          }
        } else {
          // Si la partida ya comenzó:
          const humanTeams = room.teams.filter(t => !t.isBot);
          if (room.game?.gameOver || humanTeams.length <= 1 || room.brokerSocketId === socket.id) {
            roomManager.destroyRoom(roomCode);
          } else {
            const myTeam = room.teams.find(t => t.socketId === socket.id);
            if (myTeam) myTeam.connected = false;
          }
        }
      }
    }
  });

  // Consultar estado de sala
  socket.on('get_room_state', ({ roomCode }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      if (typeof callback === 'function') callback({ success: false, error: 'Sala no encontrada' });
      return;
    }
    if (typeof callback === 'function') {
      callback({
        success: true,
        room: {
          code: room.code,
          settings: room.settings,
          teams: room.teams,
          started: room.started,
        },
        game: room.game,
      });
    }
  });
}
