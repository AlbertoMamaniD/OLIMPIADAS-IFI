import { roomManager } from '../managers/roomManager.js';

export function registerRoomHandlers(io, socket) {
  // Crear sala (Broker)
  socket.on('create_room', (options, callback) => {
    try {
      const room = roomManager.createRoom(socket.id, options);
      socket.join(room.code);
      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: room.code,
          room: {
            code: room.code,
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

  // Unirse a sala (Equipo / Alumno)
  socket.on('join_room', ({ roomCode, teamName }, callback) => {
    try {
      const { room, team, reconnected } = roomManager.joinRoom(roomCode, teamName, socket.id);
      socket.join(room.code);

      // Notificar a todos en la sala la lista actualizada de equipos
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
