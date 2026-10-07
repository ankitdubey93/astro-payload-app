---
name: content-model-change
description: Safely change the Payload content model — add/modify/remove collections, globals or fields — and propagate it to types, the Astro frontend, the seed and migrations. Use for any schema change in apps/cms/src/collections, globals or fields.
---

# Change the content model

For Payload API details (field types, hooks, access), consult `apps/cms/.claude/skills/payload/SKILL.md`. For blocks specifically, use the `add-block` skill.

## Checklist

1. **Edit the config** in `apps/cms/src/collections|globals|fields`.
   - Register new collections and globals in `apps/cms/src/payload.config.ts`.
   - Access: public-readable plus `authenticated` writes (`apps/cms/src/access`). For draft-enabled collections, read access is `publishedOrAuthenticated`.
   - URL-addressable docs: `slugField('<titleField>')`, plus `admin.livePreview.url` / `admin.preview` built with `previewURL()` from `apps/cms/src/utilities/previewURL.ts`.
   - Editable visual content: `versions: { drafts: { autosave: { interval: 375 } } }`.
   - If you add an upload or relationship to a **new** collection, also add that slug to `relationTo`.
2. **Regenerate**: `npm run types:sync`. For new admin components, also run `npm --prefix apps/cms run generate:importmap`.
3. **Frontend**:
   - Add fetch helpers in `apps/web/src/lib/payload.ts` (`findOne` / `request`) that accept `FetchOptions` so draft mode works.
   - Add routes in `apps/web/src/pages/` that call `isPreview(Astro.url)` and return `Astro.rewrite('/404')` when not found.
   - Fix every usage `astro check` flags after renames or removals.
4. **Seed**: update `apps/cms/src/seed/index.ts`. It must remain idempotent: delete what it creates by slug or filename before recreating.
5. **Migration**: `npm --prefix apps/cms run payload migrate:create <descriptive_name> < /dev/null`. Review the generated SQL for **destructive** operations (dropped columns or tables). Warn the user before anything that loses data.
6. **Verify**: `npm run check`, `npm run seed`, then smoke-test with the `run-app` skill.

## Cautions

- In dev, Payload pushes schema changes to the dev DB (local Docker Postgres) as soon as the CMS boots or a `payload` command runs. Renaming or removing a field **drops that data**. Confirm with the user first if real content may exist.
- Run Payload CLI commands with `< /dev/null` so an interactive push prompt can't hang.
- Never hand-edit `payload-types.ts` (either copy) or files in `src/migrations` that have already been applied.
