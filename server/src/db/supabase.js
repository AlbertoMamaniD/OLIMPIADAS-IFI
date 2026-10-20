// ============================================================
// SERVICIO DE BASE DE DATOS SUPABASE
// IFI TRADER LEAGUE (Juego de la Bolsa — BBV)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config/index.js';

let supabaseClient = null;
let isConfigured = false;

// Fallback en memoria si aún no configuró las credenciales en .env
const memoryMatches = [];

if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('your-project')) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    isConfigured = true;
    console.log(`⚡ [Supabase] Conectado exitosamente a: ${SUPABASE_URL}`);
  } catch (err) {
    console.warn(`⚠️ [Supabase] Error al inicializar cliente:`, err.message);
  }
} else {
  console.log(`ℹ️ [Supabase] Modo memoria local activo. Configura SUPABASE_URL y SUPABASE_KEY en server/.env para persistir en la nube.`);
}

export function isDbConnected() {
  return isConfigured;
}

/**
 * Calcula el podio final con efectivo, valor de cartera y patrimonio neto
 */
export function computeFinalStandings(game) {
  if (!game || !game.teams) return [];

  const companiesMap = new Map((game.companies || []).map(c => [c.id, c]));

  const standings = game.teams.map(t => {
    let portfolioValue = 0;
    const holdings = { ...(t.holdings || {}) };

    Object.entries(holdings).forEach(([cId, qty]) => {
      const company = companiesMap.get(cId);
      const price = company ? company.price : 0;
      portfolioValue += (qty || 0) * price;
    });

    const cash = t.cash || 0;
    const netWorth = cash + portfolioValue;

    return {
      id: t.id,
      name: t.name,
      isBot: !!t.isBot,
      cash,
      portfolioValue,
      netWorth,
      holdings,
    };
  });

  standings.sort((a, b) => b.netWorth - a.netWorth);

  return standings.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
}

/**
 * Guarda una partida finalizada y su cinta de operaciones en Supabase
 */
export async function saveFinishedMatch(game, roomCode, settings = {}) {
  const standings = computeFinalStandings(game);
  const winner = standings[0] || null;

  const matchRecord = {
    room_code: roomCode,
    status: 'finished',
    total_rounds: game.totalRounds || 10,
    final_round: game.round || 1,
    winner_team_name: winner ? winner.name : 'N/A',
    winner_net_worth: winner ? winner.netWorth : 0,
    settings: settings || {},
    final_standings: standings,
    stock_history: game.history || [],
    finished_at: new Date().toISOString(),
  };

  // Guardar en memoria siempre como respaldo rápido
  memoryMatches.unshift({
    id: 'mem_' + Date.now(),
    created_at: new Date().toISOString(),
    ...matchRecord,
  });
  if (memoryMatches.length > 50) memoryMatches.pop();

  if (!isConfigured || !supabaseClient) {
    return { success: true, mode: 'memory', record: matchRecord };
  }

  try {
    const { data: matchData, error: matchErr } = await supabaseClient
      .from('tournament_matches')
      .insert([matchRecord])
      .select('id')
      .single();

    if (matchErr) {
      console.error('[Supabase] Error al insertar partida:', matchErr.message);
      return { success: false, error: matchErr.message };
    }

    const matchId = matchData.id;

    // Guardar los eventos del registro / cinta de operaciones en match_events
    if (game.log && Array.isArray(game.log) && game.log.length > 0) {
      const events = game.log.slice(-100).map(entry => ({
        match_id: matchId,
        room_code: roomCode,
        round: entry.turn || 1,
        turn: entry.turn || 1,
        event_type: entry.type || 'EVENT',
        description: entry.text || '',
        created_at: entry.timestamp ? new Date(entry.timestamp).toISOString() : new Date().toISOString(),
      }));

      const { error: eventsErr } = await supabaseClient
        .from('match_events')
        .insert(events);

      if (eventsErr) {
        console.warn('[Supabase] Error al guardar eventos de auditoría:', eventsErr.message);
      }
    }

    // Limpiar de saved_rooms porque la partida concluyó
    await supabaseClient
      .from('saved_rooms')
      .delete()
      .eq('room_code', roomCode);

    console.log(`✅ [Supabase] Partida [${roomCode}] guardada con éxito (ID: ${matchId}). Ganador: ${winner?.name}`);
    return { success: true, matchId };
  } catch (err) {
    console.error('[Supabase] Excepción al guardar partida:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Obtener las partidas más recientes
 */
export async function getRecentMatches(limit = 15) {
  if (!isConfigured || !supabaseClient) {
    return memoryMatches.slice(0, limit);
  }

  try {
    const { data, error } = await supabaseClient
      .from('tournament_matches')
      .select('id, room_code, status, total_rounds, final_round, winner_team_name, winner_net_worth, final_standings, created_at, finished_at')
      .order('finished_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Supabase] Fallo al consultar partidas:', error.message);
      return memoryMatches.slice(0, limit);
    }
    return data || [];
  } catch (err) {
    console.error('[Supabase] Error en getRecentMatches:', err.message);
    return memoryMatches.slice(0, limit);
  }
}

/**
 * Obtener clasificación y podio histórico (Leaderboard de las Olimpiadas)
 */
export async function getLeaderboard(limit = 20) {
  if (!isConfigured || !supabaseClient) {
    // Generar leaderboard en memoria
    const statsMap = new Map();
    memoryMatches.forEach(m => {
      (m.final_standings || []).forEach(t => {
        const key = t.name;
        const current = statsMap.get(key) || {
          team_name: t.name,
          is_bot: !!t.isBot,
          matches_played: 0,
          championships_won: 0,
          podium_finishes: 0,
          highest_net_worth: 0,
          total_net_worth: 0,
        };
        current.matches_played += 1;
        if (t.rank === 1) current.championships_won += 1;
        if (t.rank <= 3) current.podium_finishes += 1;
        if (t.netWorth > current.highest_net_worth) current.highest_net_worth = t.netWorth;
        current.total_net_worth += t.netWorth;
        statsMap.set(key, current);
      });
    });

    return Array.from(statsMap.values())
      .map(s => ({
        ...s,
        avg_net_worth: Math.round(s.total_net_worth / (s.matches_played || 1)),
      }))
      .sort((a, b) => b.championships_won - a.championships_won || b.highest_net_worth - a.highest_net_worth)
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabaseClient
      .from('leaderboard_teams')
      .select('*')
      .limit(limit);

    if (error) {
      console.warn('[Supabase] Fallo al consultar vista leaderboard_teams:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[Supabase] Error en getLeaderboard:', err.message);
    return [];
  }
}

/**
 * Persistir sala activa ante posibles caídas del servidor
 */
export async function saveActiveRoom(roomCode, settings, gameState) {
  if (!isConfigured || !supabaseClient) return;

  try {
    await supabaseClient
      .from('saved_rooms')
      .upsert({
        room_code: roomCode,
        settings: settings || {},
        game_state: gameState || {},
        is_active: true,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    // silencioso para no bloquear el bucle de juego
  }
}

/**
 * Eliminar sala persistida cuando se cierra
 */
export async function deleteActiveRoom(roomCode) {
  if (!isConfigured || !supabaseClient) return;

  try {
    await supabaseClient
      .from('saved_rooms')
      .delete()
      .eq('room_code', roomCode);
  } catch (err) {
    // silencioso
  }
}
