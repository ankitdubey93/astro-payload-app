/**
 * Seeds placeholder content for a fictional watch brand.
 * Run with `npm run seed`. Safe to re-run: it removes the documents it created before.
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'

import { slugify as slugOf } from '../utilities/slugify'
import { lexical } from './lexical'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'changeme123'

const payload = await getPayload({ config })

const placeholderImage = async (name: string, from: string, to: string, label: string) => {
  const width = 1600
  const height = 1200
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}" />
          <stop offset="1" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
      <circle cx="${width / 2}" cy="${height / 2}" r="320" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="18" />
      <line x1="${width / 2}" y1="${height / 2}" x2="${width / 2}" y2="${height / 2 - 220}" stroke="#fff" stroke-width="14" stroke-linecap="round" />
      <line x1="${width / 2}" y1="${height / 2}" x2="${width / 2 + 150}" y2="${height / 2 + 60}" stroke="#fff" stroke-width="10" stroke-linecap="round" />
      <text x="50%" y="${height - 90}" font-family="sans-serif" font-size="56" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${label}</text>
    </svg>`
  const data = await sharp(Buffer.from(svg)).png().toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt: `${label} (placeholder image)` },
    file: { data, mimetype: 'image/png', name: `seed-${name}.png`, size: data.length },
  })
}

const seriesData = [
  {
    name: 'Abyss',
    slug: 'abyss',
    tagline: 'Built for the deep.',
    description: 'Professional dive watches with 300 m water resistance and luminous dials.',
    colors: ['#0b3d5c', '#1f8a9e'],
  },
  {
    name: 'Lumière',
    slug: 'lumiere',
    tagline: 'Quiet elegance.',
    description: 'Slim dress watches with hand-finished dials and leather straps.',
    colors: ['#3b2a1a', '#b08a5a'],
  },
  {
    name: 'Tempo',
    slug: 'tempo',
    tagline: 'Every second counts.',
    description: 'Motorsport-inspired chronographs with tachymeter bezels.',
    colors: ['#2b2b2b', '#b5302f'],
  },
] as const

const watchData = [
  { name: 'Abyss 300', series: 'abyss', reference: 'AB-300-01', price: 2450, featured: true, movement: 'automatic', caliber: 'AT-21', caseMaterial: 'Stainless steel', caseDiameterMm: 42, waterResistanceM: 300, powerReserveH: 70, strap: 'Rubber' },
  { name: 'Abyss GMT', series: 'abyss', reference: 'AB-GMT-02', price: 3100, featured: false, movement: 'automatic', caliber: 'AT-24 GMT', caseMaterial: 'Titanium', caseDiameterMm: 41, waterResistanceM: 200, powerReserveH: 68, strap: 'Steel bracelet' },
  { name: 'Lumière 38', series: 'lumiere', reference: 'LU-38-01', price: 1890, featured: true, movement: 'manual', caliber: 'AT-10', caseMaterial: 'Rose gold PVD', caseDiameterMm: 38, waterResistanceM: 30, powerReserveH: 48, strap: 'Alligator leather' },
  { name: 'Lumière Moonphase', series: 'lumiere', reference: 'LU-MP-03', price: null, featured: false, movement: 'automatic', caliber: 'AT-15 MP', caseMaterial: '18k gold', caseDiameterMm: 39, waterResistanceM: 30, powerReserveH: 52, strap: 'Calf leather' },
  { name: 'Tempo Chrono', series: 'tempo', reference: 'TE-CH-01', price: 3650, featured: true, movement: 'automatic', caliber: 'AT-40 Chrono', caseMaterial: 'Stainless steel', caseDiameterMm: 42, waterResistanceM: 100, powerReserveH: 60, strap: 'Perforated leather' },
  { name: 'Tempo Rally', series: 'tempo', reference: 'TE-RA-02', price: 990, featured: false, movement: 'quartz', caliber: 'Q-7', caseMaterial: 'Ceramic', caseDiameterMm: 40, waterResistanceM: 100, powerReserveH: null, strap: 'NATO fabric' },
] as const

const pageSlugs = ['home', 'about']

payload.logger.info('Seed: clearing previous seed data…')
await payload.delete({ collection: 'pages', where: { slug: { in: pageSlugs } } })
await payload.delete({ collection: 'watches', where: { slug: { in: watchData.map((w) => slugOf(w.name)) } } })
await payload.delete({ collection: 'series', where: { slug: { in: seriesData.map((s) => s.slug) } } })
await payload.delete({ collection: 'media', where: { filename: { like: 'seed-' } } })

payload.logger.info('Seed: admin user…')
const existingAdmin = await payload.find({ collection: 'users', where: { email: { equals: ADMIN_EMAIL } }, limit: 1 })
if (existingAdmin.totalDocs === 0) {
  await payload.create({ collection: 'users', data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Admin' } })
  payload.logger.info(`Seed: created ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
}

const PREVIEW_API_KEY = process.env.PREVIEW_API_KEY
if (PREVIEW_API_KEY) {
  payload.logger.info('Seed: preview API user…')
  const previewUser = { email: 'preview@example.com', name: 'Astro preview', enableAPIKey: true, apiKey: PREVIEW_API_KEY }
  const existing = await payload.find({ collection: 'users', where: { email: { equals: previewUser.email } }, limit: 1 })
  if (existing.docs[0]) {
    await payload.update({ collection: 'users', id: existing.docs[0].id, data: previewUser })
  } else {
    await payload.create({ collection: 'users', data: { ...previewUser, password: crypto.randomUUID() } })
  }
} else {
  payload.logger.warn('Seed: PREVIEW_API_KEY not set — skipping preview user (Live Preview drafts will not load).')
}

payload.logger.info('Seed: images…')
const heroImage = await placeholderImage('hero', '#111111', '#4a4a4a', 'Hero image')
const atelierImage = await placeholderImage('atelier', '#2d2a26', '#8c7b65', 'The atelier')
const craftImages = await Promise.all(
  ['Dial', 'Movement', 'Case back'].map((label, i) =>
    placeholderImage(`craft-${i}`, '#1d1d1d', ['#5a6b7a', '#7a5a5a', '#5a7a63'][i], label),
  ),
)

payload.logger.info('Seed: series…')
const seriesBySlug: Record<string, number> = {}
for (const s of seriesData) {
  const image = await placeholderImage(`series-${s.slug}`, s.colors[0], s.colors[1], `${s.name} series`)
  const doc = await payload.create({
    collection: 'series',
    data: { name: s.name, slug: s.slug, tagline: s.tagline, description: s.description, heroImage: image.id },
  })
  seriesBySlug[s.slug] = doc.id
}

payload.logger.info('Seed: watches…')
for (const w of watchData) {
  const colors = seriesData.find((s) => s.slug === w.series)!.colors
  const images = await Promise.all(
    [0, 1].map((i) => placeholderImage(`watch-${slugOf(w.name)}-${i}`, colors[i], colors[1 - i], w.name)),
  )
  await payload.create({
    collection: 'watches',
    data: {
      _status: 'published',
      name: w.name,
      slug: slugOf(w.name),
      reference: w.reference,
      series: seriesBySlug[w.series],
      featured: w.featured,
      price: w.price,
      shortDescription: `The ${w.name} — placeholder copy until the client's product content arrives.`,
      description: lexical([
        { h2: 'Overview' },
        `The ${w.name} pairs a ${w.caseDiameterMm} mm ${w.caseMaterial.toLowerCase()} case with the ${w.caliber} calibre.`,
        'This is example text. Replace it with the real product story once it is available.',
      ]),
      gallery: images.map((image) => ({ image: image.id })),
      specs: {
        movement: w.movement,
        caliber: w.caliber,
        caseMaterial: w.caseMaterial,
        caseDiameterMm: w.caseDiameterMm,
        waterResistanceM: w.waterResistanceM,
        powerReserveH: w.powerReserveH,
        strap: w.strap,
      },
    },
  })
}

payload.logger.info('Seed: pages…')
const about = await payload.create({
  collection: 'pages',
  data: {
    _status: 'published',
    title: 'About',
    slug: 'about',
    meta: { title: 'About us', description: 'The story behind the brand (placeholder).' },
    layout: [
      { blockType: 'hero', heading: 'Our story', subheading: 'Watchmaking since 1923 — placeholder copy.', image: atelierImage.id },
      {
        blockType: 'richText',
        content: lexical([
          { h2: 'A century of craft' },
          'Placeholder text describing the history of the brand. Replace with the client copy.',
          'Every watch is assembled by hand by a single watchmaker, from movement to case.',
        ]),
      },
      {
        blockType: 'imageWithText',
        image: craftImages[1].id,
        imagePosition: 'right',
        heading: 'In-house movements',
        content: lexical(['Placeholder text about the in-house calibres and finishing.']),
      },
      { blockType: 'gallery', heading: 'In the workshop', images: craftImages.map((image) => ({ image: image.id })) },
    ],
  },
})

await payload.create({
  collection: 'pages',
  data: {
    _status: 'published',
    title: 'Home',
    slug: 'home',
    meta: { title: 'Fine watches', description: 'Placeholder homepage for the watch brand.' },
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'New collection',
        heading: 'Time, refined.',
        subheading: 'Mechanical watches designed and assembled in our atelier.',
        image: heroImage.id,
        cta: [
          { link: { type: 'custom', url: '/watches', label: 'Explore watches' } },
          { link: { type: 'reference', reference: about.id, label: 'Our story' } },
        ],
      },
      { blockType: 'featuredWatches', heading: 'Featured', intro: 'A selection from our current collections.', source: 'featured', limit: 3 },
      {
        blockType: 'imageWithText',
        image: atelierImage.id,
        imagePosition: 'left',
        heading: 'Made by hand',
        content: lexical(['Each movement is decorated, assembled and regulated by hand. Placeholder copy.']),
        enableLink: true,
        link: { type: 'reference', reference: about.id, label: 'Visit the atelier' },
      },
      { blockType: 'seriesGrid', heading: 'Collections' },
      {
        blockType: 'richText',
        content: lexical([{ h2: 'Why mechanical?' }, 'A short editorial section. Replace with real content later.']),
      },
      { blockType: 'gallery', heading: 'Details', images: craftImages.map((image, i) => ({ image: image.id, caption: ['Dial', 'Movement', 'Case back'][i] })) },
      {
        blockType: 'callToAction',
        heading: 'Visit a boutique',
        text: 'Try any watch on at one of our boutiques. Placeholder copy.',
        links: [{ link: { type: 'custom', url: 'mailto:hello@example.com', label: 'Book an appointment' } }],
      },
    ],
  },
})

payload.logger.info('Seed: header & footer…')
await payload.updateGlobal({
  slug: 'header',
  data: {
    navItems: [
      { link: { type: 'custom', url: '/watches', label: 'Watches' } },
      { link: { type: 'custom', url: '/series/abyss', label: 'Abyss' } },
      { link: { type: 'custom', url: '/series/lumiere', label: 'Lumière' } },
      { link: { type: 'custom', url: '/series/tempo', label: 'Tempo' } },
      { link: { type: 'reference', reference: about.id, label: 'About' } },
    ],
  },
})
await payload.updateGlobal({
  slug: 'footer',
  data: {
    columns: [
      {
        heading: 'Collections',
        links: seriesData.map((s) => ({ link: { type: 'custom' as const, url: `/series/${s.slug}`, label: s.name } })),
      },
      {
        heading: 'Company',
        links: [
          { link: { type: 'reference', reference: about.id, label: 'About' } },
          { link: { type: 'custom', url: 'mailto:hello@example.com', label: 'Contact' } },
        ],
      },
    ],
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/' },
      { platform: 'youtube', url: 'https://youtube.com/' },
    ],
    copyright: `© ${new Date().getFullYear()} Placeholder Watch Co.`,
  },
})

payload.logger.info('Seed: done ✓')
process.exit(0)

