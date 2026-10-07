# Documentation

How this watch-brand website is built, how it runs, and how to change it.

The project has two apps:

- **Payload CMS** (`apps/cms`) is where content lives and where editors work.
- **Astro** (`apps/web`) is the public website that visitors see.

Astro asks Payload for content over HTTP and turns it into HTML.

## Reading order

If you're new to the project, read these in order. Each one builds on the previous one.

| # | Doc | What you'll learn |
| --- | --- | --- |
| 1 | [Architecture overview](01-architecture.md) | The big picture: the two apps, the database, and how a page request flows through them |
| 2 | [Running the app](02-running-locally.md) | Setup, env vars, commands, and what happens when you run `npm run dev` |
| 3 | [How Payload works](03-payload.md) | Payload from first principles: config, collections, fields, blocks, access, drafts, the database, and its APIs |
| 4 | [How Astro works](04-astro.md) | Astro from first principles: SSR, file-based routing, components, islands, and styling |
| 5 | [How Payload and Astro connect](05-payload-astro-connection.md) | The REST client, `depth` and relationships, shared types, images, and rich text |
| 6 | [Live Preview](06-live-preview.md) | How editors see drafts update inside the admin, step by step |
| 7 | [Content model reference](07-content-model.md) | Every collection, global, block, and route |
| 8 | [Processes (how-to)](08-processes.md) | Adding a block, changing the schema, migrations, seeding, debugging, and deploying |

## Quick reference

```bash
npm run db:up      # start local Postgres (Docker Desktop)
npm run dev        # CMS on :3000, website on :4321
npm run seed       # load placeholder content
npm run types:sync # after any schema change
npm run check      # type-check both apps
```

- Admin: http://localhost:3000/admin (`admin@example.com` / `changeme123`)
- Website: http://localhost:4321

## Related files

- [`/CLAUDE.md`](../CLAUDE.md) is the condensed rulebook for AI assistants. These docs explain the same rules in more depth.
- [`/README.md`](../README.md) is the short project README.
- `.claude/skills/` holds step-by-step checklists (`add-block`, `content-model-change`, `debug-live-preview`, `run-app`). The [processes doc](08-processes.md) covers the same ground for people.
