import { registerRoomHandlers } from './roomHandlers.js';
import { registerGameHandlers } from './gameHandlers.js';
import { registerAuctionHandlers } from './auctionHandlers.js';
import { registerBrokerHandlers } from './brokerHandlers.js';
import { roomManager } from '../managers/roomManager.js';

export function setupSockets(io) {
  io.on('connection', socket => {
    // Registrar todos los manejadores modulares por categoría
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerAuctionHandlers(io, socket);
    registerBrokerHandlers(io, socket);

    socket.on('disconnect', () => {
      roomManager.handleDisconnect(socket.id, io);
    });
  });
}
