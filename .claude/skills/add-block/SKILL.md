---
name: add-block
description: Add or change a page-builder block end to end (Payload block config + Astro component + types + migration + seed). Use when the user asks for a new section/block/component editors can place on pages, or to add fields to an existing block.
---

# Add a page-builder block

A block exists in **two places that must stay in sync**: the CMS config and the Astro renderer. Follow every step.

## 1. CMS block — `apps/cms/src/blocks/<Name>.ts`

Match the existing blocks (see `Hero.ts`, `ImageWithText.ts`):

```ts
import type { Block } from 'payload'
import { linkField } from '../fields/link'

export const Testimonial: Block = {
  slug: 'testimonial',              // camelCase; becomes blockType
  interfaceName: 'TestimonialBlock',// generated TS interface name
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'author', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
```

- Reuse `linkField()` for links (it renders via `<CMSLink>`). Use `upload` → `media` for images and `richText` for formatted copy.
- Keep slugs short. Postgres table names (`pages_blocks_<slug>_<array>`, plus `_pages_v_…` for versions) must stay under 63 characters.
- Register the block in `apps/cms/src/blocks/index.ts` (`pageBlocks`).

## 2. Types

```bash
npm run types:sync
```

## 3. Astro component — `apps/web/src/components/blocks/<Name>.astro`

```astro
---
import type { TestimonialBlock } from '../../payload-types';
import Image from '../Image.astro';

type Props = TestimonialBlock;
const { quote, author, image } = Astro.props;
---

<section class="container-page py-16">…</section>
```

- Use `<Image media size>`, `<RichText data>`, `<CMSLink link appearance>`, and `populated()` for relationships.
- If the block fetches extra data (like `FeaturedWatches`), pass `draft: isPreview(Astro.url)`.
- Interactive behaviour belongs in a React island (`components/*.tsx` + `client:visible`). Keep the block itself `.astro`.
- Styling: Tailwind utilities with tokens from `src/styles/global.css` and placeholder-level design.

Register it in `apps/web/src/components/RenderBlocks.astro`, in the `components` map, keyed by the block **slug**.

## 4. Seed + migration

- Add an example of the block to the Home page in `apps/cms/src/seed/index.ts` so it's visible in the demo.
- `npm --prefix apps/cms run payload migrate:create add_<slug>_block < /dev/null`

## 5. Verify

`npm run check`, then `npm run seed` and the `run-app` skill: the block should render on `/`. In the admin, add the block to a page, open Live Preview, and confirm it appears and updates while typing.
