# 4. How Astro works

Astro is a web framework for content-heavy sites. Its core idea: **render HTML on the server and ship zero JavaScript by default.** You opt into JavaScript only for the parts of the page that need to be interactive.

## Rendering mode (SSR)

`apps/web/astro.config.mjs`:

```js
export default defineConfig({
  output: 'server',                          // render every page per request
  adapter: node({ mode: 'standalone' }),     // ...on a Node.js server
  integrations: [react()],                   // allow React components (islands)
  vite: { plugins: [tailwindcss()] },
  env: { schema: { PAYLOAD_URL, PAYLOAD_API_KEY, PREVIEW_SECRET } },
})
```

Astro can work in two ways:

| Mode | When HTML is made | Fits |
| --- | --- | --- |
| **Static (SSG)** | Once, at `astro build` | Content that rarely changes |
| **Server (SSR)**, *ours* | On **every request** | Content from a CMS that changes, drafts, previews |

We use SSR so that a change published in Payload shows up on the next page load with no rebuild, and so that `?preview=` can fetch drafts. The trade-off is that every page view makes API calls to Payload. A single page can opt back into static with `export const prerender = true`. Adding caching later (HTTP cache headers or a CDN) is a likely optimisation.

## File-based routing: `src/pages/`

The file path decides the URL:

| File | URL | Notes |
| --- | --- | --- |
| `pages/index.astro` | `/` | Loads the Page with slug `home` |
| `pages/[...slug].astro` | `/about`, `/anything/nested` | **Catch-all**. Loads the Page with that slug. `/home` redirects to `/` |
| `pages/watches/index.astro` | `/watches` | Watch listing |
| `pages/watches/[slug].astro` | `/watches/abyss-300` | One watch |
| `pages/series/[slug].astro` | `/series/abyss` | One series and its watches |
| `pages/404.astro` | not found | Used via `Astro.rewrite('/404')` |

- `[slug]` matches one URL segment. `Astro.params.slug` holds its value.
- `[...slug]` matches any number of segments.
- More specific routes win: `/watches/x` goes to `watches/[slug].astro`, not the catch-all.

## Anatomy of an `.astro` file

```astro
---
// 1. FRONTMATTER: runs on the server, per request. Never sent to the browser.
import Layout from '../../layouts/Layout.astro';
import { getWatchBySlug } from '../../lib/payload';
import { isPreview } from '../../lib/preview';

const watch = await getWatchBySlug(Astro.params.slug!, { draft: isPreview(Astro.url) });
if (!watch) return Astro.rewrite('/404');   // render the 404 page at this URL
---

<!-- 2. TEMPLATE: JSX-like HTML. {expressions} are evaluated on the server. -->
<Layout title={watch.name}>
  <h1>{watch.name}</h1>
  {watch.price && <p>{watch.price}</p>}
</Layout>
```

- The code between `---` fences is plain server-side TypeScript. You can `await`, read secrets, and call APIs.
- `Astro.url`, `Astro.params`, `Astro.props`, `Astro.redirect()`, `Astro.rewrite()`, and `Astro.response` give you the request and response.
- `<slot />` in a component is where its children go (like React's `children`).
- `class:list={[...]}` combines class names. `set:html={html}` injects raw HTML (we use it for rich text).
- A `<script>` tag inside an `.astro` file is bundled and runs **in the browser** (see `LivePreviewListener.astro`).

## Components in this project

```
src/
├── layouts/Layout.astro        <html>, <head>/SEO, Header, Footer, LivePreviewListener
├── components/
│   ├── CMSPage.astro           Layout + RenderBlocks for a Payload Page
│   ├── RenderBlocks.astro      maps blockType → block component
│   ├── blocks/*.astro          one per CMS block (Hero, Gallery, …)
│   ├── Header.astro / Footer.astro
│   ├── CMSLink.astro           renders a linkField() value
│   ├── Image.astro             renders a Media doc (sizes + focal point)
│   ├── RichText.astro          renders Lexical JSON
│   ├── WatchCard.astro
│   ├── LivePreviewListener.astro
│   └── WatchGallery.tsx        ← the only React component (an island)
└── lib/
    ├── payload.ts              typed REST client for Payload
    ├── preview.ts              isPreview(url)
    ├── utils.ts                populated(), linkHref(), mediaUrl(), formatPrice()
    └── richText.ts             Lexical JSON → HTML
```

**`Layout.astro`** wraps every page. Besides the HTML shell, it fetches the **Header and Footer globals** (in parallel, with `Promise.all`), adds `noindex` in preview mode, and includes `<LivePreviewListener />` only when previewing. Its `<div id="page">` is what Live Preview swaps out on refresh.

## Islands: React only where needed

`.astro` components render to HTML and **ship no JS**. When something needs to be interactive in the browser, write a React component and add a `client:*` directive:

```astro
<!-- pages/watches/[slug].astro -->
<WatchGallery client:visible images={images} />
```

- Astro renders the component's HTML on the server (so it shows without JS), then
- **hydrates** it in the browser. `client:visible` waits until it scrolls into view, then loads React and makes it interactive.
- Other options: `client:load` (immediately), `client:idle` (when the browser is idle), `client:only="react"` (skip the server render).
- Props passed to an island must be serialisable (plain JSON). That's why the page converts Media docs into simple `{ src, alt }` objects first.

Project rule: **static markup stays in `.astro`. Use React only for interactive islands.**

## Environment variables: `astro:env`

Env vars are declared with types in `astro.config.mjs`:

```js
PAYLOAD_URL:     envField.string({ context: 'server', access: 'public', default: 'http://localhost:3000' }),
PAYLOAD_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
PREVIEW_SECRET:  envField.string({ context: 'server', access: 'secret', optional: true }),
```

and imported like modules:

```ts
import { PAYLOAD_URL, PAYLOAD_API_KEY } from 'astro:env/server';
```

`context: 'server'` means they can only be imported in server code. Trying to use one in a browser script fails at build time, so the API key can't leak into client JS by accident. Astro validates them on startup.

## Styling: Tailwind v4 and brand tokens

`src/styles/global.css` is imported by `Layout.astro`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';   /* `prose` classes, used for rich text */

@theme {                              /* placeholder brand tokens */
  --color-ink: #111111;
  --color-paper: #fafaf7;
  --color-accent: #8c7b65;
  --font-display: Georgia, serif;
  --font-sans: system-ui, sans-serif;
}

@utility container-page { @apply mx-auto w-full max-w-6xl px-4 sm:px-6; }
```

In Tailwind v4, each `--color-*` in `@theme` automatically becomes a set of utilities: `bg-ink`, `text-paper`, `border-accent`, `text-accent/60`, and so on. `--font-display` becomes `font-display`.

**When the real branding arrives, change these tokens, and the whole site updates.** Don't hardcode hex colours or font names in components.

## Building for production

`npm --prefix apps/web run build` produces `dist/`:

- `dist/client/`: static assets (CSS, the island JS, `public/` files)
- `dist/server/entry.mjs`: the Node server. Run it with `node dist/server/entry.mjs`. Set `HOST` and `PORT` as needed, and provide the same env vars as in dev.

## Learning more

- Official docs: https://docs.astro.build (see `apps/web/CLAUDE.md` for the specific pages).
- Good files to read first: `src/pages/watches/[slug].astro` (a full data-fetching page with an island), then `src/layouts/Layout.astro`.

Next: [How Payload and Astro connect →](05-payload-astro-connection.md)
