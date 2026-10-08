import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import * as store from './store.js';

const PORT = Number(process.env.PORT || 4000);
const ADMIN_KEY = process.env.ADMIN_KEY || 'changeme';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

if (ADMIN_KEY === 'changeme') {
  if (process.env.NODE_ENV === 'production') {
    console.error('[fatal] Refusing to start in production with the default ADMIN_KEY. Set ADMIN_KEY.');
    process.exit(1);
  }
  console.warn('[warn] ADMIN_KEY is not set, using the default "changeme". Set it before the event!');
}

const app = express();
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.get('/data/problems.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'problems.js'));
});

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

// Brute-force protection: too many wrong keys from one IP locks it out for a while.
const MAX_FAILS = 10;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map(); // ip -> { count, first }

function lockedOut(ip) {
  const rec = fails.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.first > LOCK_MS) { fails.delete(ip); return false; }
  return rec.count >= MAX_FAILS;
}

function recordFail(ip) {
  const rec = fails.get(ip);
  if (!rec || Date.now() - rec.first > LOCK_MS) fails.set(ip, { count: 1, first: Date.now() });
  else rec.count += 1;
}

setInterval(() => {
  const cutoff = Date.now() - LOCK_MS;
  for (const [ip, rec] of fails) if (rec.first < cutoff) fails.delete(ip);
}, LOCK_MS).unref();

function requireAdmin(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  if (lockedOut(req.ip)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  }
  const bearer = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const key = req.get('x-admin-key') || bearer;
  if (!key || !safeEqual(key, ADMIN_KEY)) {
    recordFail(req.ip);
    return res.status(401).json({ error: 'Invalid or missing admin key' });
  }
  fails.delete(req.ip);
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

// The admin login page is not linked from anywhere on the public site.
app.get('/admin', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

const admin = express.Router();
admin.use(requireAdmin);
admin.post('/verify', (req, res) => res.json({ ok: true }));

// Dashboard markup, styles and script are only ever sent to a caller with a valid key.
const PANEL_FILES = { html: 'panel.html', css: 'panel.css', js: 'panel.js' };
admin.get('/panel/:type', (req, res) => {
  const file = PANEL_FILES[req.params.type];
  if (!file) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'admin', file));
});
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
  if (/^\/admin(\/|$)/i.test(req.path)) return res.status(404).send('Not found');
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
