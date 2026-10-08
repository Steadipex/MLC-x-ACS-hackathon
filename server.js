import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import * as store from './store.js';

const PORT = Number(process.env.PORT || 4000);
const ADMIN_KEY = process.env.ADMIN_KEY || 'changeme';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

if (ADMIN_KEY === 'changeme') {
  console.warn('[warn] ADMIN_KEY is not set, using the default "changeme". Set it before the event!');
}

const app = express();
app.use(express.json({ limit: '100kb' }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const wrap = (fn) => (req, res, next) => {
  try { fn(req, res, next); } catch (err) { next(err); }
};

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function requireAdmin(req, res, next) {
  const bearer = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const key = req.get('x-admin-key') || bearer;
  if (!key || !safeEqual(key, ADMIN_KEY)) {
    return res.status(401).json({ error: 'Invalid or missing admin key' });
  }
  next();
}

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get('/api/leaderboard', wrap((req, res) => res.json(store.leaderboard())));
app.get('/api/stats', wrap((req, res) => res.json(store.stats())));
app.get('/api/teams', wrap((req, res) => res.json(store.listTeams())));
app.get('/api/teams/:teamId', wrap((req, res) => res.json(store.getTeam(req.params.teamId))));

app.get('/api/leaderboard/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const push = () => res.write('data: ' + JSON.stringify(store.leaderboard()) + '\n\n');
  push();
  store.events.on('change', push);
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(heartbeat);
    store.events.off('change', push);
  });
});

const admin = express.Router();
admin.use(requireAdmin);
admin.post('/verify', (req, res) => res.json({ ok: true }));
admin.post('/teams', wrap((req, res) => res.status(201).json(store.createTeam(req.body))));
admin.put('/teams/:teamId', wrap((req, res) => res.json(store.updateTeam(req.params.teamId, req.body))));
admin.delete('/teams/:teamId', wrap((req, res) => {
  store.deleteTeam(req.params.teamId);
  res.status(204).end();
}));
admin.post('/teams/:teamId/members', wrap((req, res) =>
  res.status(201).json(store.addMember(req.params.teamId, req.body))));
admin.delete('/teams/:teamId/members/:memberId', wrap((req, res) => {
  store.removeMember(req.params.teamId, req.params.memberId);
  res.status(204).end();
}));
admin.post('/teams/:teamId/points', wrap((req, res) =>
  res.status(201).json(store.addPoints(req.params.teamId, req.body))));
admin.delete('/points/:entryId', wrap((req, res) => {
  store.removePoints(req.params.entryId);
  res.status(204).end();
}));
app.use('/api/admin', admin);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  if (err instanceof store.HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log('Hackathon API running on http://localhost:' + PORT));
