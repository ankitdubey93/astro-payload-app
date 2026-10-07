// Copies the generated Payload types into the Astro app so the frontend gets typed CMS data.
// The `declare module 'payload'` augmentation is stripped because the web app doesn't install payload.
import { readFileSync, writeFileSync } from 'node:fs'

const src = new URL('../apps/cms/src/payload-types.ts', import.meta.url)
const dest = new URL('../apps/web/src/payload-types.ts', import.meta.url)

const types = readFileSync(src, 'utf8').replace(/\ndeclare module 'payload' \{[\s\S]*?\n\}\n?/, '\n')

writeFileSync(dest, `// Synced from apps/cms by \`npm run types:sync\`. Do not edit.\n${types}`)
console.log('Synced payload-types.ts → apps/web/src/payload-types.ts')
