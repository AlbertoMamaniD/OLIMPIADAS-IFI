import { roomManager } from '../managers/roomManager.js';

export function registerBrokerHandlers(io, socket) {
  // Iniciar la partida
  socket.on('start_game', ({ roomCode }, callback) => {
    try {
      const room = roomManager.startGame(roomCode, io);
      io.to(room.code).emit('game_started', {
        room: {
          code: room.code,
          settings: room.settings,
          teams: room.teams,
          started: true,
        },
        game: room.game,
      });

      if (typeof callback === 'function') callback({ success: true, game: room.game });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Pausar / Reanudar la partida
  socket.on('toggle_pause', ({ roomCode }, callback) => {
    try {
      roomManager.togglePause(roomCode, io);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Saltar turno actual
  socket.on('skip_turn', ({ roomCode }, callback) => {
    try {
      roomManager.skipTurn(roomCode, io);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });
}
