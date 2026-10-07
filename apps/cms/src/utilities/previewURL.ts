const WEB_URL = process.env.WEB_URL || 'http://localhost:4321'
const PREVIEW_SECRET = process.env.PREVIEW_SECRET || ''

/**
 * Builds the Astro URL rendered inside Payload's Live Preview iframe.
 * The secret lets Astro know it should fetch drafts instead of published content.
 */
export const previewURL = (path: string): string => {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, WEB_URL)
  url.searchParams.set('preview', PREVIEW_SECRET)
  return url.toString()
}

export const pagePath = (slug?: string | null): string => (!slug || slug === 'home' ? '/' : `/${slug}`)
