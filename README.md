# Hackathon Backend (ML x AMC)

Node.js + Express API for teams, points, and the live leaderboard. Data is saved in `data/db.json`, so there is no database to set up.

## Run

```bash
npm install
ADMIN_KEY=your-secret npm start      # Windows PowerShell: $env:ADMIN_KEY="your-secret"; npm start
```

| Env var | Default | Purpose |
|---|---|---|
| `ADMIN_KEY` | `changeme` | Secret for all `/api/admin/*` routes. **Change it.** |
| `PORT` | `4000` | Server port |
| `CORS_ORIGIN` | `*` | Frontend origin allowed to call the API (set to the real URL in production) |
| `MAX_TEAM_SIZE` | `5` | Max members per team |
| `DATA_DIR` | `./data` | Where `db.json` lives |

Back up `data/db.json` if you want to keep results.

## Public endpoints (no auth)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{ ok, time }` |
| GET | `/api/leaderboard` | Ranked list: `[{ rank, teamId, name, members: [names], totalPoints, lastScoredAt }]` |
| GET | `/api/leaderboard/stream` | **Live** updates via Server-Sent Events. Pushes the full leaderboard whenever anything changes |
| GET | `/api/stats` | Chart data (see below) |
| GET | `/api/teams` | All teams with members and `totalPoints` |
| GET | `/api/teams/:teamId` | One team: members, `rank`, `totalPoints`, and full points `history` |

**Ranking rule:** higher total wins; on a tie, the team that reached that score first ranks higher.

### Live leaderboard (frontend)

```js
const es = new EventSource('http://localhost:4000/api/leaderboard/stream');
es.onmessage = (e) => setBoard(JSON.parse(e.data));
```

### Chart data: `GET /api/stats`

```jsonc
{
  "totalTeams": 8,
  "totalPoints": 640,
  "lastUpdated": "2026-10-20T10:15:00.000Z",
  "totals":       [{ "teamId", "name", "totalPoints" }],              // bar chart
  "timeline":     [{ "teamId", "name", "series": [{ "time", "total" }] }], // line chart: score over time
  "byDifficulty": [{ "teamId", "name", "easy", "medium", "hard", "other" }] // stacked bar chart
}
```

## Admin endpoints

Send the key on every request as a header: `x-admin-key: <ADMIN_KEY>` (or `Authorization: Bearer <ADMIN_KEY>`). Wrong or missing key returns `401`.

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/admin/verify` | none | Check the key (use for the admin login screen) |
| POST | `/api/admin/teams` | `{ name, members?: [ "Name" \| { name, email? } ] }` | Create team. Names are unique (case-insensitive) |
| PUT | `/api/admin/teams/:teamId` | `{ name }` | Rename |
| DELETE | `/api/admin/teams/:teamId` | | Deletes the team and its points |
| POST | `/api/admin/teams/:teamId/members` | `{ name, email? }` | Add member |
| DELETE | `/api/admin/teams/:teamId/members/:memberId` | | Remove member |
| POST | `/api/admin/teams/:teamId/points` | `{ points, reason?, problem?, difficulty? }` | `points` can be negative to deduct. `difficulty` is `easy`, `medium` or `hard` (feeds the difficulty chart) |
| DELETE | `/api/admin/points/:entryId` | | Undo a points entry (ids are in `GET /api/teams/:teamId` history) |

### Examples

```bash
# create a team
curl -X POST localhost:4000/api/admin/teams \
  -H "x-admin-key: your-secret" -H "Content-Type: application/json" \
  -d '{"name":"Team Alpha","members":["Ravi","Sita"]}'

# award points
curl -X POST localhost:4000/api/admin/teams/<teamId>/points \
  -H "x-admin-key: your-secret" -H "Content-Type: application/json" \
  -d '{"points":50,"reason":"Problem 1 submission","difficulty":"easy"}'
```

## Errors

All errors look like `{ "error": "message" }` with a proper status: `400` validation, `401` bad key, `404` not found, `409` duplicate team name.

## Notes

- Problem statements, descriptions and dataset links are not stored here; the frontend can keep them as static content. If you want them served from the API too, that's a small addition.
- The admin key is a single shared secret, which is fine for a small event. Serve over HTTPS when deployed so the key isn't sent in plain text.
