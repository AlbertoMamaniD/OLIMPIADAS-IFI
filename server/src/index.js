import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PORT, CLIENT_URL } from './config/index.js';
import { setupSockets } from './socket/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

import { getRecentMatches, getLeaderboard, isDbConnected } from './db/supabase.js';

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'juego-bolsa-server', timestamp: Date.now() });
});

// Endpoints oficiales para Supabase / Base de Datos
app.get('/api/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 15;
    const matches = await getRecentMatches(limit);
    res.json({ success: true, dbConnected: isDbConnected(), matches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const leaderboard = await getLeaderboard(limit);
    res.json({ success: true, dbConnected: isDbConnected(), leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/db-status', (req, res) => {
  res.json({
    connected: isDbConnected(),
    provider: 'Supabase (PostgreSQL)',
    message: isDbConnected()
      ? 'Conectado a la base de datos de Supabase'
      : 'Modo memoria local activo. Configura SUPABASE_URL y SUPABASE_KEY en server/.env para persistir en la nube.',
  });
});

// Servir cliente estático (React Vite build) si existe
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { etag: false, maxAge: 0 }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path === '/health') return next();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSockets(io);

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor Juego de la Bolsa (BBV) en vivo`);
  console.log(`📡 Puerto: http://localhost:${PORT}`);
  console.log(`🎮 Socket.io listo para conectar 30-50 clientes`);
  console.log(`===============================================`);
});
