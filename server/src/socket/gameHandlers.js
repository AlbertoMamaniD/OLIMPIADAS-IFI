import { roomManager } from '../managers/roomManager.js';
import {
  trade,
  playCard,
  endTurn,
  resolveCrisisDecision,
} from '../engine/rulesEngine.js';

export function registerGameHandlers(io, socket) {
  // Operar en el mercado (Comprar o Vender acciones)
  socket.on('trade', ({ roomCode, teamId, companyId, qty, side, phase }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) throw new Error('Partida no activa');

      trade(room.game, teamId, companyId, parseInt(qty, 10), side, phase);
      io.to(room.code).emit('game_updated', room.game);

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Jugar una tarjeta
  socket.on('play_card', ({ roomCode, teamId, instanceId, otherCompanyId }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) throw new Error('Partida no activa');

      playCard(room.game, teamId, instanceId, otherCompanyId);
      io.to(room.code).emit('game_updated', room.game);

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Terminar el turno
  socket.on('end_turn', ({ roomCode, teamId }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) throw new Error('Partida no activa');

      if (room.game.currentTurn.teamId !== teamId) {
        throw new Error('No es el turno de tu equipo');
      }

      endTurn(room.game);
      io.to(room.code).emit('game_updated', room.game);

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Decisión de crisis (conservar pagando Bs 20 o devolver al broker)
  socket.on('resolve_crisis', ({ roomCode, teamId, companyId, decision }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) throw new Error('Partida no activa');

      resolveCrisisDecision(room.game, teamId, companyId, decision);
      io.to(room.code).emit('game_updated', room.game);

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });
}
