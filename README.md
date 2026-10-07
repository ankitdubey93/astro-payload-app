# astro-payload-app

Website for a watch brand. Editors manage content in **Payload CMS** with a live visual preview, and the public site is rendered by **Astro** (with React islands and Tailwind CSS).

> Content and branding are placeholders until the client's material arrives. Run `npm run seed` to load example data.

```
apps/
  cms/   Payload 3 (Next.js) — admin panel at :3000/admin, REST API at :3000/api, Postgres (Neon)
  web/   Astro 7 (SSR, Node adapter) + React + Tailwind v4 — public site at :4321
scripts/
  sync-types.mjs   copies Payload's generated types into apps/web
```

## Setup

```bash
npm run install:all                 # installs root, apps/cms and apps/web
cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.example apps/web/.env
```

Fill in the env files:

| Variable | Where | Notes |
| --- | --- | --- |
| `DATABASE_URL` | cms | Neon Postgres URL, or the local one from `apps/cms/docker-compose.yml` |
| `PAYLOAD_SECRET` | cms | any long random string |
| `PREVIEW_SECRET` | cms **and** web | same value in both |
| `PREVIEW_API_KEY` (cms) / `PAYLOAD_API_KEY` (web) | both | same UUID in both; the seed assigns it to a `preview@example.com` user that Astro uses to read drafts |
| `WEB_URL` / `PAYLOAD_URL` | cms / web | where each app can reach the other |

Then:

```bash
npm run seed   # example series, watches, pages, nav + admin@example.com / changeme123
npm run dev    # runs both apps
```

Open http://localhost:3000/admin and http://localhost:4321.

## Scripts (root)

| Script | What it does |
| --- | --- |
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

Use a **separate database (or Neon branch) for production**. A database that has been through dev-push should not also be migrated.

## Before going live (not done yet)

- Media is stored on local disk (`apps/cms/media`). Add a storage adapter (S3 / R2 / Vercel Blob) before deploying to a host with an ephemeral filesystem.
- Change the seeded admin password, or delete that user.
- Configure an email adapter for password resets.
- The design is a bare Tailwind skeleton. Brand tokens live in `apps/web/src/styles/global.css` (`@theme`).
