import { PAYLOAD_API_KEY, PAYLOAD_URL } from 'astro:env/server';

import type { Footer, Header, Page, Series, Watch } from '../payload-types';

type FetchOptions = {
	/** Fetch the latest draft instead of the published version (Live Preview). */
	draft?: boolean;
	depth?: number;
};

type PaginatedDocs<T> = { docs: T[]; totalDocs: number };

async function request<T>(path: string, params: Record<string, string | number> = {}, { draft = false, depth = 2 }: FetchOptions = {}): Promise<T> {
	const url = new URL(`/api/${path}`, PAYLOAD_URL);
	url.searchParams.set('depth', String(depth));
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

	const headers: HeadersInit = {};
	if (draft) {
		url.searchParams.set('draft', 'true');
		if (PAYLOAD_API_KEY) headers.Authorization = `users API-Key ${PAYLOAD_API_KEY}`;
	}

	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`Payload request failed: ${res.status} ${url.pathname}${url.search}`);
	return res.json() as Promise<T>;
}

async function findOne<T>(collection: string, where: Record<string, string>, options?: FetchOptions): Promise<T | null> {
	const params: Record<string, string | number> = { limit: 1 };
	for (const [field, value] of Object.entries(where)) params[`where[${field}][equals]`] = value;
	const { docs } = await request<PaginatedDocs<T>>(collection, params, options);
	return docs[0] ?? null;
}

export const getPageBySlug = (slug: string, options?: FetchOptions) => findOne<Page>('pages', { slug }, options);

export const getWatchBySlug = (slug: string, options?: FetchOptions) => findOne<Watch>('watches', { slug }, options);

export const getSeriesBySlug = (slug: string, options?: FetchOptions) => findOne<Series>('series', { slug }, options);

export async function getWatches({ seriesId, featured, limit = 100, ...options }: FetchOptions & { seriesId?: number; featured?: boolean; limit?: number } = {}) {
	const params: Record<string, string | number> = { limit, sort: 'name' };
	if (seriesId) params['where[series][equals]'] = seriesId;
	if (featured) params['where[featured][equals]'] = 'true';
	const { docs } = await request<PaginatedDocs<Watch>>('watches', params, options);
	return docs;
}

export async function getAllSeries(options?: FetchOptions) {
	const { docs } = await request<PaginatedDocs<Series>>('series', { limit: 100, sort: 'name' }, options);
	return docs;
}

export const getHeader = (options?: FetchOptions) => request<Header>('globals/header', {}, { depth: 1, ...options });

export const getFooter = (options?: FetchOptions) => request<Footer>('globals/footer', {}, { depth: 1, ...options });
