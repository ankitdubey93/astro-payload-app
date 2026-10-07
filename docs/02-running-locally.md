# 2. Running the app

## Prerequisites

- **Node.js 22.12+** (Astro requires it. Payload needs 20.18+.)
- **Docker Desktop** for the local Postgres database.

> **Two Docker engines.** This machine has both Docker Desktop and a native Docker engine. The database lives in **Docker Desktop**. Check with `docker context show`. It should print `desktop-linux`. If it doesn't, run `docker context use desktop-linux`.

## First-time setup

```bash
# 1. Install dependencies (root, apps/cms, apps/web: three separate installs)
npm run install:all

# 2. Create env files from the examples
cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.example apps/web/.env
```

### 3. Fill in the env files

```bash
# Generate values:
node -e "console.log(crypto.randomUUID())"   # use one for the API key
node -e "console.log(crypto.randomBytes(32).toString('hex'))"  # for secrets
```

**`apps/cms/.env`**

| Variable | Example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://payload:payload@127.0.0.1:5442/payload` | Local Docker Postgres. Keep the default |
| `PAYLOAD_SECRET` | long random string | Signs login tokens (JWTs) and encrypts API keys. **Don't change it after the seed**, or stored API keys stop working |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:3000` | Public URL of the CMS. Used to build absolute URLs |
| `WEB_URL` | `http://localhost:4321` | Where the Astro site lives. Used for Live Preview URLs and CORS/CSRF |
| `PREVIEW_SECRET` | random string | **Must equal** the web `PREVIEW_SECRET` |
| `PREVIEW_API_KEY` | a UUID | **Must equal** the web `PAYLOAD_API_KEY`. The seed gives it to the preview user |

**`apps/web/.env`**

| Variable | Example | Purpose |
| --- | --- | --- |
| `PAYLOAD_URL` | `http://localhost:3000` | Where Astro sends API requests |
| `PAYLOAD_API_KEY` | same UUID as above | Lets Astro read drafts in preview mode |
| `PREVIEW_SECRET` | same as cms | Astro compares `?preview=` against this |

The two pairs that must match:

```mermaid
flowchart LR
    subgraph cms[apps/cms/.env]
        A[PREVIEW_SECRET]
        B[PREVIEW_API_KEY]
    end
    subgraph web[apps/web/.env]
        C[PREVIEW_SECRET]
        D[PAYLOAD_API_KEY]
    end
    A <-->|must be equal| C
    B <-->|must be equal| D
```

Web env vars are declared with types in `apps/web/astro.config.mjs` (`env.schema`). Code reads them through `import { ... } from 'astro:env/server'`, not `process.env`. Astro validates them at startup.

### 4. Start the database, seed, run

```bash
npm run db:up   # starts Postgres and waits until it's healthy
npm run seed    # creates demo content and users
npm run dev     # starts both apps
```

Open:

- http://localhost:3000/admin and log in as `admin@example.com` / `changeme123`
- http://localhost:4321

The first CMS start takes 30–60 seconds while Next.js compiles.

## Day-to-day commands

All commands run from the repo root.

| Command | What it does |
| --- | --- |
| `npm run db:up` / `npm run db:down` | Start or stop Postgres. Data survives `db:down` because it lives in the `astro-payload-pgdata` volume |
| `npm run dev` | Both apps together, with coloured `[cms]` / `[web]` log prefixes |
| `npm run dev:cms` / `npm run dev:web` | Just one app |
| `npm run seed` | Recreates the demo content. Safe to re-run |
| `npm run types:sync` | Regenerates TypeScript types from the Payload config and copies them to the web app |
| `npm run check` | Type-checks both apps (`tsc --noEmit` and `astro check`) |
| `npm run build` | Production build of both apps |

## What happens when you run `npm run dev`

```mermaid
sequenceDiagram
    participant R as root npm run dev
    participant C as apps/cms (next dev)
    participant DB as Postgres
    participant W as apps/web (astro dev)

    R->>C: concurrently: npm run dev:cms
    R->>W: concurrently: npm run dev:web
    C->>C: Next.js loads next.config.ts (withPayload)
    W->>W: Vite dev server, validates env schema
    W-->>R: ready on :4321
    Note over C: On the first request (e.g. /admin):
    C->>C: buildConfig() from payload.config.ts
    C->>DB: connect via DATABASE_URL
    C->>DB: schema "push": make the tables match the config
    C-->>R: ready on :3000
```

**Schema push** is a dev-only behaviour. Payload compares your collection config to the database and alters the tables to match. Add a field, save the file, and the column appears. This is convenient but can **drop data** when you rename or remove a field. See [Payload: the database](03-payload.md#the-database).

The Astro dev server works without the CMS running. Pages will just error when they try to fetch content.

## What `npm run seed` does

`apps/cms/src/seed/index.ts` is run with `payload run`, which boots Payload **without** an HTTP server and uses the **Local API** (direct function calls instead of HTTP). It:

1. Deletes what a previous seed created (pages `home`/`about`, the seeded watches and series, media named `seed-*`). This is why it's safe to re-run.
2. Creates `admin@example.com` if missing.
3. Creates or updates `preview@example.com` with API key = `PREVIEW_API_KEY`. **If you change that env var, re-run the seed.**
4. Generates placeholder PNG images with `sharp` and uploads them to Media.
5. Creates 3 series, 6 watches, and the Home and About pages, all published.
6. Fills the Header and Footer globals.

## Ports and processes

| Port | Process |
| --- | --- |
| 3000 | CMS (Next.js + Payload) |
| 4321 | Astro |
| 5442 | Postgres (container port 5432 mapped to host port 5442, so it can't clash with another local Postgres) |

To find what's using a port: `ss -ltnp | grep -E ':(3000|4321) '`. Kill by PID. **Don't** run `pkill -f "next dev"`: it matches its own shell's command line and kills that too.

## Production build

```bash
npm run build
```

- **CMS**: `next build` produces `.next/`. Run it with `npm --prefix apps/cms start` (`next start`). On startup in production, Payload runs any pending migrations from `src/migrations` (`prodMigrations` in `payload.config.ts`).
- **Web**: `astro build` produces `dist/`. Because the adapter is `@astrojs/node` in `standalone` mode, it's a self-contained Node server: `node apps/web/dist/server/entry.mjs`.

Stop the dev servers before building the CMS, because they share the `.next` folder.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `ECONNREFUSED 127.0.0.1:5442` | Database isn't running | `npm run db:up`, and check `docker context show` |
| Website pages return 500 | No content in the DB, or the CMS is down | Is `:3000` up? Run `npm run seed` |
| `ValidationError: filename` during seed | Old `seed-*` files in `apps/cms/media` don't match the DB | Move the stale `seed-*` files out of `apps/cms/media`, then re-seed |
| A `payload` CLI command hangs | It's waiting on an interactive schema-push prompt | Add `< /dev/null` to the command |
| Live Preview shows published content | Env mismatch or missing preview user | See [Live Preview: debugging](06-live-preview.md#debugging) |
| Types errors after a schema change | Types are stale | `npm run types:sync` |

Next: [How Payload works →](03-payload.md)
