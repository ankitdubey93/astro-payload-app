# CLAUDE.md

Website for a watch brand. **Payload CMS** (`apps/cms`) is the content backend and visual editor (Live Preview). **Astro** (`apps/web`) renders the public site. Branding and content are placeholders until the client delivers them, so don't invent final copy or design. Keep styling minimal and token-driven.

## Layout

```
apps/cms/   Payload 3 on Next 16, Postgres (Docker Desktop, :5442) — :3000 (/admin, /api)
apps/web/   Astro 7 SSR (@astrojs/node) + React islands + Tailwind v4 — :4321
scripts/sync-types.mjs   copies apps/cms/src/payload-types.ts → apps/web/src/payload-types.ts
```

These are **not** npm workspaces. Each app has its own `node_modules` and `package-lock.json`. Install per app (`npm --prefix apps/<app> install <pkg>`). Never install app dependencies at the root.

App-specific guidance:
- `apps/cms/CLAUDE.md` and the Payload skill at `apps/cms/.claude/skills/payload/`. Read it before non-trivial Payload work.
- `apps/web/CLAUDE.md` (Astro docs links).

## Commands (run from root)

| Command | Purpose |
| --- | --- |
| `npm run db:up` / `db:down` | Start/stop the local dev Postgres (`apps/cms/docker-compose.yml`). Must be up before `dev` or `seed` |
| `npm run dev` | Both apps via concurrently (`dev:cms`, `dev:web` for one) |
| `npm run check` | `tsc --noEmit` on cms + `astro check` on web. Run after every change |
| `npm run types:sync` | Regenerate Payload types and copy them to web. **Required after any collection/global/block/field change** |
| `npm run seed` | Idempotent placeholder content (admin@example.com / changeme123) |
| `npm run build` | Production build of both apps |
| `npm --prefix apps/cms run payload migrate:create <name>` | Postgres migration after a schema change |

## How the pieces connect

- **Content model**: `apps/cms/src/{collections,globals,blocks,fields,access}`. Pages use a `layout` blocks field. Pages, Watches, Series and the Header/Footer globals have drafts + autosave; the delay is `AUTOSAVE_INTERVAL` in `apps/cms/src/utilities/autosave.ts`.
- **Frontend data**: `apps/web/src/lib/payload.ts` is a typed REST client. Use these helpers instead of calling `fetch` in pages. Pass `{ draft: isPreview(Astro.url) }` everywhere content is fetched so Live Preview shows drafts.
- **Block rendering**: each CMS block slug maps to `apps/web/src/components/blocks/<Name>.astro`, registered in `apps/web/src/components/RenderBlocks.astro`. Block props are the generated `<Name>Block` interface.
- **Live Preview**: the CMS `admin.livePreview.url` → `WEB_URL/<path>?preview=PREVIEW_SECRET`. Astro then fetches drafts with the preview user's API key, and `LivePreviewListener.astro` swaps `#page` on Payload's `payload-document-event`.
- **Helpers to reuse** (`apps/web/src/lib/utils.ts`): `populated()` for relationship fields that may be an ID, `linkHref()` / `<CMSLink>` for the shared `linkField`, `mediaUrl()` / `<Image>` for uploads (respects focal point), `formatPrice()`. Rich text goes through `<RichText>` (`lib/richText.ts`).

## Conventions

- Types in `apps/web/src/payload-types.ts` are generated. Never edit them by hand.
- Add new reusable CMS fields to `apps/cms/src/fields/`, e.g. `slugField()`, `linkField()`.
- Access: public reads of draft-enabled collections use `publishedOrAuthenticated`, and writes use `authenticated` (`apps/cms/src/access`).
- Use React only for interactive islands (`client:visible` etc.). Static markup stays in `.astro`.
- Styling uses Tailwind utilities plus the brand tokens in `apps/web/src/styles/global.css` (`@theme`). Don't hardcode brand colours or fonts.
- Keep `apps/cms/src/seed/index.ts` working when the schema changes, since the seed is the demo data.
- Env vars: cms `.env` / web `.env`, both git-ignored, with `.env.example` documenting them. `PREVIEW_SECRET` must match in both. The cms `PREVIEW_API_KEY` must equal the web `PAYLOAD_API_KEY`. Web env is declared in the `env.schema` of `astro.config.mjs` and read via `astro:env/server`.

## Gotchas

- Dev uses the local Docker Postgres (`postgresql://payload:payload@127.0.0.1:5442/payload`). Payload **pushes** schema changes to it on boot. Run `payload` CLI commands with `< /dev/null` so a push prompt can't hang.
- The DB runs in **Docker Desktop** as container `astro-payload-postgres` (volume `astro-payload-pgdata`). This machine also has a native Docker engine (`docker context default`) that Docker Desktop doesn't show, so make sure `docker context show` says `desktop-linux`.
- Don't use a remote DB for dev. A far-away hosted Postgres made the admin and site slow, because Payload runs many sequential queries per request. No production DB is chosen yet.
- Production migrations run on startup (`prodMigrations`). Production must use a separate DB/branch from the dev-pushed one.
- Use `curl -g` (or Node `fetch`) for Payload REST queries with `where[...]` brackets.
- Don't use `pkill -f "next dev"` from a shell: it matches its own command line. Kill by PID from `ss -ltnp | grep -E ':(3000|4321) '`.
- Media is stored on local disk (`apps/cms/media`). A storage adapter is still TODO before deploy. Files there must match the DB you're pointed at: after switching or wiping the DB, move stale `seed-*` files out before `npm run seed`, or the seed's parallel uploads collide on filenames (`ValidationError: filename`).

## Project skills

In `.claude/skills/`: `run-app`, `add-block`, `content-model-change`, `debug-live-preview`.
