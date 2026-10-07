import type { Media, Page } from '../payload-types';
import { PAYLOAD_URL } from 'astro:env/server';

/** A relationship/upload field is either an ID (depth 0) or the populated document. */
export const populated = <T extends object>(value: T | number | null | undefined): T | null =>
	value && typeof value === 'object' ? value : null;

export const pagePath = (slug?: string | null) => (!slug || slug === 'home' ? '/' : `/${slug}`);

export type CMSLink = {
	type?: ('reference' | 'custom') | null;
	newTab?: boolean | null;
	reference?: (number | null) | Page;
	url?: string | null;
	label: string;
};

export const linkHref = (link?: CMSLink | null): string => {
	if (!link) return '#';
	if (link.type === 'reference') {
		const page = populated(link.reference);
		return page ? pagePath(page.slug) : '#';
	}
	return link.url || '#';
};

export const linkTarget = (link?: CMSLink | null) => (link?.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {});

/** Absolute URL for a media document (or one of its image sizes). */
export const mediaUrl = (media: Media | number | null | undefined, size?: keyof NonNullable<Media['sizes']>): string | null => {
	const doc = populated(media);
	if (!doc) return null;
	const url = (size && doc.sizes?.[size]?.url) || doc.url;
	if (!url) return null;
	return url.startsWith('http') ? url : new URL(url, PAYLOAD_URL).toString();
};

export const formatPrice = (price?: number | null) =>
	price == null ? 'Price on request' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
