// ============================================================
// GESTOR CENTRAL DE SALAS, TEMPORIZADORES Y BOTS SIMULADOS
// ============================================================

import { CODE_CHARS } from '../config/index.js';
import {
  initGameState,
  forceEndTurn,
  forceResolveAuctionOnTimeout,
  logEvent,
} from '../engine/rulesEngine.js';
import { DEFAULT_COMPANIES, AUCTION_SECONDS } from '../engine/constants.js';
import { ALL_CARD_IDS, dealRandomHand } from '../engine/cards.js';
import {
  generateBotTeam,
  executeBotTurn,
  resolvePendingBotCrisis,
  maybeBotBidInAuction,
} from '../engine/botEngine.js';
import {
  saveFinishedMatch,
  saveActiveRoom,
  deleteActiveRoom,
} from '../db/supabase.js';

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> room object
  }

  generateCode() {
    for (let attempt = 0; attempt < 20; attempt++) {
      let code = '';
      for (let i = 0; i < 5; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
      }
      if (!this.rooms.has(code)) return code;
    }
    return 'ROOM' + Math.floor(Math.random() * 1000);
  }

  createRoom(brokerSocketId, options = {}) {
    const code = this.generateCode();
    const companies = options.companies && options.companies.length >= 3
      ? options.companies
      : DEFAULT_COMPANIES;

    const room = {
      code,
      brokerSocketId,
      settings: {
        maxTeams: options.maxTeams ? parseInt(options.maxTeams, 10) : null,
        handSize: options.handSize ? parseInt(options.handSize, 10) : 6,
        turnSeconds: options.turnSeconds ? parseInt(options.turnSeconds, 10) : 120,
        enabledCardIds: options.enabledCardIds && options.enabledCardIds.length > 0
          ? options.enabledCardIds
          : ALL_CARD_IDS,
        companies,
      },
      teams: [], // { id, name, socketId, connected: true, isBot: boolean }
      started: false,
      game: null,
      createdAt: Date.now(),
      timerHandle: null,
      botActionInFlight: false,
    };

    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.trim().toUpperCase()) || null;
  }

  findRoomBySocket(socketId) {
    for (const room of this.rooms.values()) {
      if (room.brokerSocketId === socketId) return { room, isBroker: true };
      const team = room.teams.find(t => t.socketId === socketId);
      if (team) return { room, isBroker: false, team };
    }
    return null;
  }

  joinRoom(code, teamName, socketId) {
    const room = this.getRoom(code);
    if (!room) throw new Error('No existe una sala con ese código');

    const cleanName = teamName.trim();
    if (!cleanName) throw new Error('Debes ingresar un nombre de equipo');

    // Si ya comenzó, verificar si es reconexión
    if (room.started) {
      const existing = room.teams.find(t => t.name.toLowerCase() === cleanName.toLowerCase());
      if (!existing) {
        throw new Error('La partida ya empezó y no hay ningún equipo con ese nombre para reconectarse');
      }
      existing.socketId = socketId;
      existing.connected = true;
      return { room, team: existing, reconnected: true };
    }

    // Comprobaciones antes de empezar
    if (room.settings.maxTeams && room.teams.length >= room.settings.maxTeams) {
      throw new Error('La sala ya alcanzó el cupo máximo de equipos');
    }
    if (room.teams.some(t => t.name.toLowerCase() === cleanName.toLowerCase())) {
      throw new Error('Ya existe un equipo con ese nombre en esta sala');
    }

    const team = {
      id: 'team_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      socketId,
      connected: true,
      isBot: false,
    };
    room.teams.push(team);
    return { room, team, reconnected: false };
  }

  addBot(code, io) {
    const room = this.getRoom(code);
    if (!room) throw new Error('Sala no encontrada');
    if (room.started) throw new Error('No se pueden añadir bots a una partida ya iniciada');
    if (room.settings.maxTeams && room.teams.length >= room.settings.maxTeams) {
      throw new Error('La sala ya alcanzó el límite de equipos');
    }

    const bot = generateBotTeam(room.teams);
    room.teams.push(bot);

    if (io) {
      io.to(room.code).emit('room_teams_updated', {
        teams: room.teams,
        total: room.teams.length,
      });
    }
    return bot;
  }

  createSoloDemoGame(socketId, playerName, io) {
    const code = this.generateCode();
    const room = {
      code,
      brokerSocketId: socketId,
      settings: {
        maxTeams: 4,
        handSize: 5,
        turnSeconds: 45, // Turnos ágiles para demo
        enabledCardIds: ALL_CARD_IDS,
        companies: DEFAULT_COMPANIES,
      },
      teams: [],
      started: false,
      game: null,
      createdAt: Date.now(),
      timerHandle: null,
      botActionInFlight: false,
    };

    // 1. Equipo del Jugador Humano
    const playerTeam = {
      id: 'team_player_' + Math.random().toString(36).substring(2, 7),
      name: (playerName || 'Mi Mesa Inversionista').trim(),
      socketId,
      connected: true,
      isBot: false,
    };
    room.teams.push(playerTeam);

    // 2. Tres Equipos Bots Automáticos
    room.teams.push(generateBotTeam(room.teams));
    room.teams.push(generateBotTeam(room.teams));
    room.teams.push(generateBotTeam(room.teams));

    this.rooms.set(code, room);

    // 3. Iniciar la partida inmediatamente
    this.startGame(code, io);

    return { room, team: playerTeam, game: room.game };
  }

  startGame(code, io) {
    const room = this.getRoom(code);
    if (!room) throw new Error('Sala no encontrada');
    if (room.started) throw new Error('La partida ya fue iniciada');
    if (room.teams.length < 2) throw new Error('Se necesitan al menos 2 equipos para comenzar');

    const teamsForEngine = room.teams.map(t => ({ id: t.id, name: t.name, isBot: t.isBot }));
    const allowedIds = room.settings.enabledCardIds;
    const hands = teamsForEngine.map(() => dealRandomHand(room.settings.handSize, allowedIds));

    room.game = initGameState(room.settings.companies, teamsForEngine, hands, {
      startingCash: 1000,
      turnSeconds: room.settings.turnSeconds,
    });
    // Propagar bandera isBot al estado del juego
    room.game.teams.forEach(gt => {
      const rt = room.teams.find(t => t.id === gt.id);
      gt.isBot = !!rt?.isBot;
    });

    room.started = true;
    this.startAuthoritativeClock(room, io);

    // Si el primer turno es de un Bot, ejecutarlo
    this.triggerBotTurnIfNeeded(room, io);

    return room;
  }

  triggerBotTurnIfNeeded(room, io) {
    const g = room.game;
    if (!g || g.gameOver || room.botActionInFlight || g.paused || g.manualPause || g.auction) return;

    const currentTeam = g.teams.find(t => t.id === g.currentTurn?.teamId);
    if (currentTeam?.isBot) {
      room.botActionInFlight = true;
      executeBotTurn(g, currentTeam.id, io, room.code)
        .finally(() => {
          room.botActionInFlight = false;
          // Revisar si el siguiente turno también es de un bot
          this.triggerBotTurnIfNeeded(room, io);
        });
    }
  }

  startAuthoritativeClock(room, io) {
    if (room.timerHandle) clearInterval(room.timerHandle);

    room.timerHandle = setInterval(() => {
      const g = room.game;
      if (!g || g.gameOver) {
        clearInterval(room.timerHandle);
        if (g && g.gameOver && !room.savedToDb) {
          room.savedToDb = true;
          saveFinishedMatch(g, room.code, room.settings);
        }
        return;
      }

      // Si hay subasta activa
      if (g.auction) {
        const elapsed = Math.floor((Date.now() - (g.auction.auctionStartedAt || Date.now())) / 1000);
        const auctionRemaining = Math.max(0, AUCTION_SECONDS - elapsed);

        io.to(room.code).emit('clock_tick', {
          phase: 'auction',
          auctionRemaining,
          timeRemaining: null,
          paused: true,
        });

        // Los bots pueden pujar durante la subasta
        maybeBotBidInAuction(g, io, room.code);

        if (auctionRemaining <= 0) {
          forceResolveAuctionOnTimeout(g);
          if (g.gameOver && !room.savedToDb) {
            room.savedToDb = true;
            saveFinishedMatch(g, room.code, room.settings);
          }
          io.to(room.code).emit('game_updated', g);
          this.triggerBotTurnIfNeeded(room, io);
        }
        return;
      }

      // Resolver crisis pendientes de bots si las hubiera
      resolvePendingBotCrisis(g, io, room.code);

      // Si está pausado
      if (g.paused || g.manualPause) {
        io.to(room.code).emit('clock_tick', {
          phase: 'paused',
          timeRemaining: g.currentTurn.timeRemaining,
          paused: true,
        });
        return;
      }

      // Verificar si corresponde el turno a un Bot
      this.triggerBotTurnIfNeeded(room, io);

      // Cuenta regresiva normal
      const elapsed = Math.floor((Date.now() - (g.currentTurn.turnStartedAt || Date.now())) / 1000);
      const remaining = Math.max(0, (g.turnSeconds || 120) - elapsed);
      g.currentTurn.timeRemaining = remaining;

      io.to(room.code).emit('clock_tick', {
        phase: 'turn',
        timeRemaining: remaining,
        paused: false,
      });

      if (remaining <= 0) {
        forceEndTurn(g);
        if (g.gameOver && !room.savedToDb) {
          room.savedToDb = true;
          saveFinishedMatch(g, room.code, room.settings);
        }
        io.to(room.code).emit('game_updated', g);
        this.triggerBotTurnIfNeeded(room, io);
      }
    }, 1000);
  }

  togglePause(code, io) {
    const room = this.getRoom(code);
    if (!room || !room.game || room.game.gameOver) return;

    const g = room.game;
    if (!g.manualPause) {
      g.manualPause = true;
      g.manualPauseStartedAt = Date.now();
      logEvent(g, 'La mesa de control pausó la partida');
    } else {
      const pausedMs = Date.now() - (g.manualPauseStartedAt || Date.now());
      g.currentTurn.turnStartedAt = (g.currentTurn.turnStartedAt || Date.now()) + pausedMs;
      g.manualPause = false;
      g.manualPauseStartedAt = null;
      logEvent(g, 'La mesa de control reanudó la partida');
    }

    io.to(room.code).emit('game_updated', g);
    this.triggerBotTurnIfNeeded(room, io);
  }

  skipTurn(code, io) {
    const room = this.getRoom(code);
    if (!room || !room.game || room.game.gameOver) return;

    forceEndTurn(room.game);
    io.to(room.code).emit('game_updated', room.game);
    this.triggerBotTurnIfNeeded(room, io);
  }

  handleDisconnect(socketId, io) {
    const found = this.findRoomBySocket(socketId);
    if (!found) return;

    const { room, isBroker, team } = found;
    if (isBroker) {
      io.to(room.code).emit('broker_status', { connected: false });
    } else if (team && !team.isBot) {
      team.connected = false;
      io.to(room.code).emit('team_status', { teamId: team.id, connected: false });
    }
  }
}

export const roomManager = new RoomManager();
