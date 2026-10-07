---
name: run-app
description: Start, stop and smoke-test this project's apps (Payload CMS on :3000, Astro site on :4321). Use when asked to run, start, restart, screenshot or verify the website or admin panel, or to confirm a change works in the real app.
---

# Run the app

## Start

Make sure the local Postgres is up first (idempotent, returns once healthy):

```bash
npm run db:up
```

Then run in the background from the repo root, logging to the scratchpad:

```bash
npm run dev > "$SCRATCH/dev.log" 2>&1   # run_in_background: true
```

Wait for both to answer, without sleeping blindly:

```bash
for i in $(seq 1 90); do
  c=$(curl -s -o /dev/null -w '%{http_code}' localhost:3000/admin)
  w=$(curl -s -o /dev/null -w '%{http_code}' localhost:4321/)
  [ "$c" != 000 ] && [ "$w" != 000 ] && break; sleep 2
done; echo "cms=$c web=$w"
```

The first CMS boot takes 30–60s: Next compiles and Payload pulls the DB schema. If the log shows `ECONNREFUSED 127.0.0.1:5442`, the DB container isn't running (`npm run db:up`).

If a port is already taken, check `ss -ltnp | grep -E ':(3000|4321) '`. It may be the user's own running server, so ask before killing it.

## Smoke test

```bash
for p in / /about /watches /watches/abyss-300 /series/abyss /home /does-not-exist; do
  printf '%-24s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' localhost:4321$p)"
done
```

Expect 200s, a 301 for `/home`, and a 404 for the unknown path. If pages 500 because content is missing, run `npm run seed`.

Draft and preview check: `curl -s "localhost:4321/?preview=$(grep ^PREVIEW_SECRET= apps/web/.env | cut -d= -f2-)"` should include `live-preview-listener`.

Admin login for testing: `admin@example.com` / `changeme123`. Via REST: `POST /api/users/login` returns `token`, then send `Authorization: JWT <token>`. Use `curl -g` for `where[...]` queries.

## Stop

Stop the background task (TaskStop). If orphans keep the ports, kill **by PID**:

```bash
kill $(ss -ltnp | grep -E ':(3000|4321) ' | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
```

Never `pkill -f "next dev"`: it matches the invoking shell and kills it.

## Production build check

Stop dev servers first, since they share `.next`. Then run `npm run check && npm run build`.
