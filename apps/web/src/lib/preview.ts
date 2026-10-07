import { PREVIEW_SECRET } from 'astro:env/server';

/** True when the request comes from Payload's Live Preview iframe (or a preview link). */
export const isPreview = (url: URL): boolean => Boolean(PREVIEW_SECRET) && url.searchParams.get('preview') === PREVIEW_SECRET;
