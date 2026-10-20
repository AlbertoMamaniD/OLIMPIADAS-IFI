import { roomManager } from '../managers/roomManager.js';
import {
  placeBid,
  sellDuringAuction,
  resolveAuction,
} from '../engine/rulesEngine.js';

export function registerAuctionHandlers(io, socket) {
  // Realizar una puja en la subasta
  socket.on('place_bid', ({ roomCode, teamId }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) throw new Error('Partida no activa');

      placeBid(room.game, teamId);
      io.to(room.code).emit('game_updated', room.game);

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Venta libre de acciones durante la subasta para obtener liquidez
  socket.on('sell_during_auction', ({ roomCode, teamId, companyId, qty }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) throw new Error('Partida no activa');

      sellDuringAuction(room.game, teamId, companyId, parseInt(qty, 10));
      io.to(room.code).emit('game_updated', room.game);

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Adjudicación de subasta
  socket.on('resolve_auction', ({ roomCode }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room || !room.game) throw new Error('Partida no activa');

      resolveAuction(room.game);
      io.to(room.code).emit('game_updated', room.game);

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });
}
