---
name: debug-live-preview
description: Diagnose Payload Live Preview / draft problems — preview iframe blank or showing published content, edits not updating, 401/403 on draft fetches, CORS errors. Use when the visual editor isn't reflecting changes.
---

# Debug Live Preview

## How it works

1. A CMS doc's `admin.livePreview.url` (via `previewURL()` in `apps/cms/src/utilities/previewURL.ts`) produces `WEB_URL/<path>?preview=PREVIEW_SECRET`.
2. Astro's `isPreview(Astro.url)` (`apps/web/src/lib/preview.ts`) compares that value with its own `PREVIEW_SECRET`.
3. In preview mode, `lib/payload.ts` adds `draft=true` and the header `Authorization: users API-Key <PAYLOAD_API_KEY>`. That key belongs to `preview@example.com`, created by the seed from the cms `PREVIEW_API_KEY`.
4. `LivePreviewListener.astro` calls `ready({ serverURL })`. On a `payload-document-event` message, whose origin must equal the `PAYLOAD_URL` origin, it re-fetches the page and replaces `#page`.

## Checks, in order

1. **Env parity**:
   ```bash
   diff <(grep ^PREVIEW_SECRET= apps/cms/.env | cut -d= -f2) <(grep ^PREVIEW_SECRET= apps/web/.env | cut -d= -f2) && echo secret-ok
   diff <(grep ^PREVIEW_API_KEY= apps/cms/.env | cut -d= -f2) <(grep ^PAYLOAD_API_KEY= apps/web/.env | cut -d= -f2) && echo key-ok
   ```
   Restart both dev servers after changing env. Re-run `npm run seed` if the key changed, since it sets the preview user's key.
2. **The API key works**: run `curl -g -H "Authorization: users API-Key $KEY" 'localhost:3000/api/pages?draft=true&where[slug][equals]=home&depth=0'`. It should return the latest draft. If it only returns published content, or an error, the key is wrong or the preview user is missing: Payload silently treats a bad key as an anonymous request.
3. **Draft visible only in preview**: autosave a change via REST or the admin. `curl localhost:4321/` must **not** contain it, and `curl "localhost:4321/?preview=$SECRET"` must.
4. **Listener rendered**: the preview HTML contains `<live-preview-listener data-server-url="http://localhost:3000">`. The origin must exactly match the admin's origin, so `localhost` vs `127.0.0.1` matters.
5. **New route not updating**: the page must pass `{ draft: isPreview(Astro.url) }` to **every** fetch, including fetches inside blocks, and render inside `Layout.astro`, which owns `#page` and the listener.
6. **CORS / iframe**: the cms `cors`/`csrf` must include `WEB_URL`. If a host adds `X-Frame-Options` or CSP `frame-ancestors` to the Astro site, allow the CMS origin.
7. **Preview refreshes only after the autosave delay**: `AUTOSAVE_INTERVAL` (`apps/cms/src/utilities/autosave.ts`) is how long the editor must stop typing. Collections or globals without `versions.drafts.autosave` refresh only on **Save**.

Clicking links inside the preview iframe drops `?preview=`, so it shows published content. This is expected behaviour.
