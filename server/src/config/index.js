import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde server/.env y luego fallback a cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const CLIENT_URL = process.env.CLIENT_URL || '*';
export const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Configuración de Supabase
export const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
export const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
