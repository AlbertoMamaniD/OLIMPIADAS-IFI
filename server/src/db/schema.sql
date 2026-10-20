-- ====================================================================
-- ESQUEMA OFICIAL SUPABASE / POSTGRESQL (PRODUCCIÓN & ESCALABLE)
-- PROYECTO: IFI TRADER LEAGUE (Juego de la Bolsa — BBV)
-- Olimpiadas de Ingeniería Financiera (IFI 2026)
-- ====================================================================

-- 0. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA: tournament_matches (Partidas y Ruedas Oficiales)
CREATE TABLE IF NOT EXISTS public.tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'finished' CHECK (status IN ('in_progress', 'finished', 'cancelled')),
    total_rounds INTEGER DEFAULT 10,
    final_round INTEGER DEFAULT 1,
    winner_team_name TEXT,
    winner_net_worth NUMERIC(15, 2) DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb,
    final_standings JSONB NOT NULL DEFAULT '[]'::jsonb,
    stock_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices B-Tree para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_matches_room_code ON public.tournament_matches(room_code);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.tournament_matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_finished_at ON public.tournament_matches(finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.tournament_matches(status);

-- Índice GIN para búsquedas de alta velocidad dentro de los datos JSONB
CREATE INDEX IF NOT EXISTS idx_matches_final_standings_gin ON public.tournament_matches USING gin (final_standings jsonb_path_ops);

-- 2. TABLA: match_events (Cinta de Operaciones / Auditoría BBV)
CREATE TABLE IF NOT EXISTS public.match_events (
    id BIGSERIAL PRIMARY KEY,
    match_id UUID REFERENCES public.tournament_matches(id) ON DELETE CASCADE,
    room_code VARCHAR(10) NOT NULL,
    round INTEGER NOT NULL DEFAULT 1,
    turn INTEGER NOT NULL DEFAULT 1,
    event_type VARCHAR(30) NOT NULL DEFAULT 'TRADE',
    team_name TEXT,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de eventos para auditoría de alta velocidad
CREATE INDEX IF NOT EXISTS idx_events_match_id ON public.match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_events_room_code ON public.match_events(room_code);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.match_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.match_events(event_type);

-- 3. TABLA: saved_rooms (Persistencia de Salas Activas ante reinicios del Servidor)
CREATE TABLE IF NOT EXISTS public.saved_rooms (
    room_code VARCHAR(10) PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    game_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saved_rooms_active ON public.saved_rooms(is_active);

-- 4. VISTA: leaderboard_teams (Podio Histórico y Estadísticas Acumuladas)
CREATE OR REPLACE VIEW public.leaderboard_teams AS
WITH team_flat AS (
    SELECT 
        coalesce(trim(elem->>'name'), 'Sin Nombre')::text AS team_name,
        coalesce((elem->>'isBot')::boolean, false) AS is_bot,
        coalesce((elem->>'netWorth')::numeric, 0) AS net_worth,
        coalesce((elem->>'rank')::integer, 99) AS rank,
        m.id AS match_id,
        m.finished_at
    FROM public.tournament_matches m,
    jsonb_array_elements(m.final_standings) elem
    WHERE m.status = 'finished'
)
SELECT 
    team_name,
    bool_or(is_bot) AS is_bot,
    count(*)::integer AS matches_played,
    count(*) FILTER (WHERE rank = 1)::integer AS championships_won,
    count(*) FILTER (WHERE rank <= 3)::integer AS podium_finishes,
    coalesce(max(net_worth), 0)::numeric(15,2) AS highest_net_worth,
    coalesce(round(avg(net_worth), 2), 0)::numeric(15,2) AS avg_net_worth,
    max(finished_at) AS last_played_at
FROM team_flat
WHERE team_name IS NOT NULL AND team_name != ''
GROUP BY team_name
ORDER BY championships_won DESC, highest_net_worth DESC;

-- ====================================================================
-- PERMISOS DE ESQUEMA (PostgREST / Supabase API)
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ====================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- 100% IDEMPOTENTES (Seguras para re-ejecutar sin errores)
-- ====================================================================

ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_rooms ENABLE ROW LEVEL SECURITY;

-- 1. tournament_matches:
DROP POLICY IF EXISTS "Lectura pública de partidas terminadas" ON public.tournament_matches;
CREATE POLICY "Lectura pública de partidas terminadas"
ON public.tournament_matches FOR SELECT
TO anon, authenticated, service_role
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de partidas a servicio y clientes" ON public.tournament_matches;
CREATE POLICY "Permitir inserción de partidas a servicio y clientes"
ON public.tournament_matches FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización a servicio y clientes" ON public.tournament_matches;
CREATE POLICY "Permitir actualización a servicio y clientes"
ON public.tournament_matches FOR UPDATE
TO anon, authenticated, service_role
USING (true);

-- 2. match_events:
DROP POLICY IF EXISTS "Lectura pública de eventos de auditoría" ON public.match_events;
CREATE POLICY "Lectura pública de eventos de auditoría"
ON public.match_events FOR SELECT
TO anon, authenticated, service_role
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de eventos de auditoría" ON public.match_events;
CREATE POLICY "Permitir inserción de eventos de auditoría"
ON public.match_events FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- 3. saved_rooms:
DROP POLICY IF EXISTS "Lectura y escritura de salas guardadas" ON public.saved_rooms;
CREATE POLICY "Lectura y escritura de salas guardadas"
ON public.saved_rooms FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- Comentarios oficiales de documentación en el catálogo Postgres
COMMENT ON TABLE public.tournament_matches IS 'Historial oficial de partidas de la IFI Trader League';
COMMENT ON TABLE public.match_events IS 'Cinta de operaciones y auditoría de transacciones';
COMMENT ON TABLE public.saved_rooms IS 'Salas activas persistidas para recuperación tras desconexión';
COMMENT ON VIEW public.leaderboard_teams IS 'Tabla de posiciones histórica de equipos en las Olimpiadas';
