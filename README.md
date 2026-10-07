# astro-payload-app

Website for a watch brand. Editors manage content in **Payload CMS** with a live visual preview, and the public site is rendered by **Astro** (with React islands and Tailwind CSS).

> Content and branding are placeholders until the client's material arrives. Run `npm run seed` to load example data.

📚 **Full documentation:** [`docs/`](docs/README.md) covers architecture, how Payload and Astro work and connect, Live Preview, the content model, and how-to processes.

```
apps/
  cms/   Payload 3 (Next.js) — admin panel at :3000/admin, REST API at :3000/api, Postgres
  web/   Astro 7 (SSR, Node adapter) + React + Tailwind v4 — public site at :4321
scripts/
  sync-types.mjs   copies Payload's generated types into apps/web
```

## Getting started from scratch

This walks a new teammate from `git clone` to both apps running with demo content. It takes about 10 minutes, mostly waiting for installs.

### 1. Prerequisites

Install these first:

| Tool | Version | Check with |
| --- | --- | --- |
| **Git** | any recent | `git --version` |
| **Node.js** | **22.12 or newer** (Astro requires it) | `node -v` |
| **npm** | comes with Node | `npm -v` |
| **Docker** with Compose v2 | Docker Desktop (macOS / Windows / Linux) or Docker Engine + compose plugin (Linux) | `docker compose version` |

Notes:

- On **Windows**, use **WSL2** (Ubuntu) and run every command below inside the WSL terminal. Enable Docker Desktop's WSL integration.
- Make sure Docker is **running** before you start (on Docker Desktop, open the app and wait for "Engine running").
- If you have more than one Docker engine installed (for example Docker Desktop *and* a native Linux engine), check `docker context show` and switch with `docker context use <name>` so you always use the same one. The database lives in whichever engine was active when you ran `npm run db:up`.
- Ports **3000** (CMS), **4321** (website) and **5442** (Postgres) must be free.

### 2. Clone and install

```bash
git clone https://github.com/ankitdubey93/astro-payload-app.git
cd astro-payload-app
npm run install:all
```

> The repo is **not** an npm workspace. `install:all` runs three separate installs: the root (just `concurrently`), `apps/cms` and `apps/web`. If you add a package later, install it into the right app: `npm --prefix apps/cms install <pkg>`.

### 3. Create the env files

`.env` files are git-ignored, so each person creates their own from the examples:

```bash
cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.example apps/web/.env
```

Generate the secret values:

```bash
node -e "console.log('PAYLOAD_SECRET  =', crypto.randomBytes(32).toString('hex'))"
node -e "console.log('PREVIEW_SECRET  =', crypto.randomBytes(16).toString('hex'))"
node -e "console.log('API KEY (UUID)  =', crypto.randomUUID())"
```

Paste them in as follows (without the `<…>` brackets). Two pairs **must match** across the files:

**`apps/cms/.env`**

```env
# Keep as is
DATABASE_URL=postgresql://payload:payload@127.0.0.1:5442/payload
PAYLOAD_SECRET=<PAYLOAD_SECRET>
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
WEB_URL=http://localhost:4321
# Same as PREVIEW_SECRET in apps/web/.env
PREVIEW_SECRET=<PREVIEW_SECRET>
# Same as PAYLOAD_API_KEY in apps/web/.env
PREVIEW_API_KEY=<API KEY (UUID)>
```

**`apps/web/.env`**

```env
PAYLOAD_URL=http://localhost:3000
# Same as PREVIEW_API_KEY in apps/cms/.env
PAYLOAD_API_KEY=<API KEY (UUID)>
# Same as PREVIEW_SECRET in apps/cms/.env
PREVIEW_SECRET=<PREVIEW_SECRET>
```

| Variable | Where | Notes |
| --- | --- | --- |
| `DATABASE_URL` | cms | The local Docker Postgres. Keep the default from `.env.example` |
| `PAYLOAD_SECRET` | cms | Any long random string. Don't change it after seeding, or stored API keys stop working (re-seed if you do) |
| `PREVIEW_SECRET` | cms **and** web | Same value in both |
| `PREVIEW_API_KEY` (cms) / `PAYLOAD_API_KEY` (web) | both | Same UUID in both. The seed assigns it to a `preview@example.com` user that Astro uses to read drafts |
| `WEB_URL` / `PAYLOAD_URL` | cms / web | Where each app can reach the other |

Each developer can use their own values; nothing here is shared with the team.

### 4. Start the database (Docker)

```bash
npm run db:up
```

This runs `docker compose -f apps/cms/docker-compose.yml up -d --wait`, which:

- pulls the `postgres:16` image (first time only),
- starts a container named `astro-payload-postgres` on host port **5442** (user / password / db: `payload`),
- stores data in the Docker volume `astro-payload-pgdata`, so it survives restarts,
- waits until Postgres reports healthy.

Check it's up:

```bash
docker ps --filter name=astro-payload-postgres   # STATUS should say "healthy"
```

You don't need to create any tables. Payload creates the schema automatically the first time it connects in dev.

### 5. Seed demo content

```bash
npm run seed
```

This creates the tables, the admin user, the preview user, placeholder images, 3 series, 6 watches, the Home and About pages, and the header/footer. It's safe to re-run at any time.

### 6. Run both apps

```bash
npm run dev
```

Logs from both apps appear with `[cms]` / `[web]` prefixes. The first CMS load takes 30–60 seconds while Next.js compiles.

| URL | What |
| --- | --- |
| http://localhost:3000/admin | Payload admin. Log in with `admin@example.com` / `changeme123` |
| http://localhost:4321 | The public Astro site |

### 7. Verify everything works

- [ ] The website homepage shows the seeded hero and watches.
- [ ] You can log in to the admin.
- [ ] In the admin, open **Pages → Home**, click **Live Preview**, and edit the hero heading. The preview updates as you type. If it doesn't, see [`docs/06-live-preview.md`](docs/06-live-preview.md#debugging). The usual cause is mismatched `PREVIEW_SECRET` / API key values.
- [ ] `npm run check` passes.

### Daily workflow

```bash
npm run db:up    # if Docker was restarted
npm run dev
# ... work ...
# Ctrl+C to stop the apps
npm run db:down  # optional: stop Postgres (data is kept)
```

After `git pull`, re-run `npm run install:all` if any `package-lock.json` changed, and `npm run seed` if the seed or schema changed.

### Starting over with a clean database

```bash
npm run db:down
docker volume rm astro-payload-pgdata    # deletes all local DB data
rm -f apps/cms/media/seed-*              # uploaded seed images must match the DB
npm run db:up
npm run seed
```

### Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` | Docker isn't running | Start Docker Desktop / `sudo systemctl start docker` |
| `port is already allocated` on `db:up` | Something else uses port 5442 | Stop it, or change the host port in `apps/cms/docker-compose.yml` **and** `DATABASE_URL` |
| `ECONNREFUSED 127.0.0.1:5442` | Database isn't running, or you're on a different Docker context | `npm run db:up`, check `docker context show` |
| Astro fails on startup with an env error | A web `.env` value is missing | Fill in all three vars in `apps/web/.env` |
| Website pages return 500 | CMS is down or the DB is empty | Make sure `:3000` is up, then `npm run seed` |
| `ValidationError: filename` during seed | Stale `seed-*` files in `apps/cms/media` | `rm -f apps/cms/media/seed-*`, then re-seed |
| A `payload` CLI command hangs | It's waiting on a schema-push prompt | Append `< /dev/null` to the command |
| Live Preview shows published content / 401 | Env mismatch or missing preview user | Match the two env pairs, re-run `npm run seed`, restart `npm run dev` |
| Type errors after pulling a schema change | Generated types are stale | `npm run types:sync` |

More detail: [`docs/02-running-locally.md`](docs/02-running-locally.md).

## Scripts (root)

| Script | What it does |
| --- | --- |
| `npm run db:up` / `db:down` | Start / stop the local dev Postgres container |
| `npm run dev` | CMS + web together (`dev:cms` / `dev:web` for one) |
| `npm run seed` | (Re)creates the placeholder content. Safe to re-run |
| `npm run types:sync` | Regenerates Payload types and copies them to `apps/web/src/payload-types.ts`. **Run after changing any collection, global or block** |
| `npm run check` | Type-checks both apps |
| `npm run build` | Production build of both apps |

## Content model

- **Pages**: page builder made of blocks. The slug `home` is the homepage, and other slugs map to `/<slug>`.
  Blocks: Hero, Rich text, Featured watches, Image with text, Series grid, Call to action, Gallery.
- **Watches**: products with specs, gallery, price and a featured flag. Rendered at `/watches/<slug>`.
- **Series**: watch lines (e.g. Diver, Dress). Rendered at `/series/<slug>`.
- **Media**: uploads with focal point and `thumbnail` / `card` / `hero` sizes.
- **Header / Footer** (globals): navigation, footer columns and social links.

Pages and Watches have **drafts with autosave**. The public site only ever shows published content.

## Visual editing (Live Preview)

1. In the admin, open a Page or Watch and click **Live Preview**. Payload loads the Astro page in an iframe as `…?preview=<PREVIEW_SECRET>`.
2. With the secret present, Astro fetches the **draft** using the preview user's API key (`apps/web/src/lib/payload.ts`).
3. As the editor types, Payload autosaves and posts a message to the iframe. `LivePreviewListener.astro` then re-fetches the page and swaps the content in place.

## Adding a block

1. Create `apps/cms/src/blocks/MyBlock.ts` and add it to `apps/cms/src/blocks/index.ts`.
2. Run `npm run types:sync`.
3. Create `apps/web/src/components/blocks/MyBlock.astro` and register it in `apps/web/src/components/RenderBlocks.astro`.
4. Create a migration (see below).

## Database and migrations

In development Payload **pushes** schema changes to the database automatically. For production, migrations live in `apps/cms/src/migrations` and run on startup (`prodMigrations`). After any schema change, run:

```bash
npm --prefix apps/cms run payload migrate:create <name>
```

Use a **separate database for production**. A database that has been through dev-push should not also be migrated.

## Before going live (not done yet)

- Media is stored on local disk (`apps/cms/media`). Add a storage adapter (S3 / R2 / Vercel Blob) before deploying to a host with an ephemeral filesystem.
- Change the seeded admin password, or delete that user.
- Configure an email adapter for password resets.
- The design is a bare Tailwind skeleton. Brand tokens live in `apps/web/src/styles/global.css` (`@theme`).
