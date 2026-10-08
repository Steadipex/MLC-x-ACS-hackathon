import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'db.json');
const MAX_TEAM_SIZE = Number(process.env.MAX_TEAM_SIZE || 5);
export const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Emits "change" after every write so the SSE stream can push live updates.
export const events = new EventEmitter();

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let db = { teams: [], points: [] };

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(FILE)) db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, FILE); // atomic swap, so a crash can't corrupt the file
  events.emit('change');
}

load();

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ---------- helpers ----------

function cleanString(value, field, { max = 80, required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, `${field} is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string`);
  const v = value.trim();
  if (!v && required) throw new HttpError(400, `${field} is required`);
  if (v.length > max) throw new HttpError(400, `${field} must be at most ${max} characters`);
  return v || undefined;
}

function normalizeMember(m) {
  const obj = typeof m === 'string' ? { name: m } : m || {};
  return {
    id: id(),
    name: cleanString(obj.name, 'member name'),
    email: cleanString(obj.email, 'member email', { required: false, max: 120 }),
  };
}

function assertUniqueName(name, exceptId) {
  const taken = db.teams.some(
    (t) => t.id !== exceptId && t.name.toLowerCase() === name.toLowerCase()
  );
  if (taken) throw new HttpError(409, `A team named "${name}" already exists`);
}

function findTeam(teamId) {
  const team = db.teams.find((t) => t.id === teamId);
  if (!team) throw new HttpError(404, 'Team not found');
  return team;
}

function totalsByTeam() {
  const map = new Map(db.teams.map((t) => [t.id, { total: 0, lastAt: t.createdAt }]));
  for (const p of db.points) {
    const row = map.get(p.teamId);
    if (!row) continue;
    row.total += p.points;
    if (p.createdAt > row.lastAt) row.lastAt = p.createdAt;
  }
  return map;
}

// ---------- teams ----------

export function createTeam(body = {}) {
  const name = cleanString(body.name, 'name');
  assertUniqueName(name);
  const rawMembers = body.members ?? [];
  if (!Array.isArray(rawMembers)) throw new HttpError(400, 'members must be an array');
  if (rawMembers.length > MAX_TEAM_SIZE)
    throw new HttpError(400, `A team can have at most ${MAX_TEAM_SIZE} members`);

  const team = {
    id: id(),
    name,
    members: rawMembers.map(normalizeMember),
    createdAt: now(),
  };
  db.teams.push(team);
  save();
  return team;
}

export function updateTeam(teamId, body = {}) {
  const team = findTeam(teamId);
  if (body.name !== undefined) {
    const name = cleanString(body.name, 'name');
    assertUniqueName(name, teamId);
    team.name = name;
  }
  save();
  return team;
}

export function deleteTeam(teamId) {
  findTeam(teamId);
  db.teams = db.teams.filter((t) => t.id !== teamId);
  db.points = db.points.filter((p) => p.teamId !== teamId);
  save();
}

export function addMember(teamId, body) {
  const team = findTeam(teamId);
  if (team.members.length >= MAX_TEAM_SIZE)
    throw new HttpError(400, `A team can have at most ${MAX_TEAM_SIZE} members`);
  const member = normalizeMember(body);
  team.members.push(member);
  save();
  return member;
}

export function removeMember(teamId, memberId) {
  const team = findTeam(teamId);
  const before = team.members.length;
  team.members = team.members.filter((m) => m.id !== memberId);
  if (team.members.length === before) throw new HttpError(404, 'Member not found');
  save();
}

export function listTeams() {
  const totals = totalsByTeam();
  return db.teams.map((t) => ({ ...t, totalPoints: totals.get(t.id).total }));
}

export function getTeam(teamId) {
  const team = findTeam(teamId);
  const history = db.points
    .filter((p) => p.teamId === teamId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = history.reduce((sum, p) => sum + p.points, 0);
  const rank = leaderboard().find((r) => r.teamId === teamId)?.rank ?? null;
  return { ...team, totalPoints: total, rank, history };
}

// ---------- points ----------

export function addPoints(teamId, body = {}) {
  findTeam(teamId);
  const points = Number(body.points);
  if (!Number.isFinite(points) || points === 0)
    throw new HttpError(400, 'points must be a non-zero number (negative values deduct)');
  if (Math.abs(points) > 10000) throw new HttpError(400, 'points must be between -10000 and 10000');

  let difficulty;
  if (body.difficulty !== undefined && body.difficulty !== null && body.difficulty !== '') {
    difficulty = String(body.difficulty).toLowerCase();
    if (!DIFFICULTIES.includes(difficulty))
      throw new HttpError(400, `difficulty must be one of: ${DIFFICULTIES.join(', ')}`);
  }

  const entry = {
    id: id(),
    teamId,
    points,
    reason: cleanString(body.reason, 'reason', { required: false, max: 200 }),
    problem: cleanString(body.problem, 'problem', { required: false, max: 100 }),
    difficulty,
    createdAt: now(),
  };
  db.points.push(entry);
  save();
  return entry;
}

export function removePoints(entryId) {
  const before = db.points.length;
  db.points = db.points.filter((p) => p.id !== entryId);
  if (db.points.length === before) throw new HttpError(404, 'Points entry not found');
  save();
}

// ---------- leaderboard & stats ----------

// Ranking: higher total first; on a tie, whoever reached their score earlier ranks higher.
export function leaderboard() {
  const totals = totalsByTeam();
  return db.teams
    .map((t) => ({
      teamId: t.id,
      name: t.name,
      members: t.members.map((m) => m.name),
      totalPoints: totals.get(t.id).total,
      lastScoredAt: totals.get(t.id).lastAt,
    }))
    .sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        a.lastScoredAt.localeCompare(b.lastScoredAt) ||
        a.name.localeCompare(b.name)
    )
    .map((row, i) => ({ rank: i + 1, ...row }));
}

// Everything a frontend needs to draw charts.
export function stats() {
  const board = leaderboard();
  const byTeam = new Map(db.teams.map((t) => [t.id, t]));
  const sorted = [...db.points].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Cumulative score over time, one series per team (for line charts).
  const running = new Map(db.teams.map((t) => [t.id, 0]));
  const timeline = new Map(db.teams.map((t) => [t.id, []]));
  for (const p of sorted) {
    if (!byTeam.has(p.teamId)) continue;
    running.set(p.teamId, running.get(p.teamId) + p.points);
    timeline.get(p.teamId).push({ time: p.createdAt, total: running.get(p.teamId) });
  }

  // Points per difficulty (for stacked/grouped bar charts).
  const breakdown = new Map(
    db.teams.map((t) => [t.id, { easy: 0, medium: 0, hard: 0, other: 0 }])
  );
  for (const p of db.points) {
    const row = breakdown.get(p.teamId);
    if (row) row[p.difficulty || 'other'] += p.points;
  }

  return {
    totalTeams: db.teams.length,
    totalPoints: board.reduce((s, r) => s + r.totalPoints, 0),
    lastUpdated: sorted.length ? sorted[sorted.length - 1].createdAt : null,
    totals: board.map((r) => ({ teamId: r.teamId, name: r.name, totalPoints: r.totalPoints })),
    timeline: db.teams.map((t) => ({
      teamId: t.id,
      name: t.name,
      series: timeline.get(t.id),
    })),
    byDifficulty: db.teams.map((t) => ({
      teamId: t.id,
      name: t.name,
      ...breakdown.get(t.id),
    })),
  };
}
