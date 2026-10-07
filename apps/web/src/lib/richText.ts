import type { Media, Page } from '../payload-types';
import { mediaUrl, pagePath, populated } from './utils';

/** Minimal Lexical JSON → HTML serializer covering the default Payload editor features. */
type LexicalNode = {
	type: string;
	children?: LexicalNode[];
	text?: string;
	format?: number | string;
	tag?: string;
	listType?: 'bullet' | 'number' | 'check';
	checked?: boolean;
	fields?: { linkType?: 'custom' | 'internal'; url?: string; newTab?: boolean; doc?: { value?: number | Page } };
	value?: number | Media;
	[key: string]: unknown;
};

export type RichTextData = { root: { children: LexicalNode[] } } | null | undefined;

const escape = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Lexical text format bitmask
const BOLD = 1;
const ITALIC = 2;
const STRIKETHROUGH = 4;
const UNDERLINE = 8;
const CODE = 16;

const renderText = (node: LexicalNode) => {
	let html = escape(node.text ?? '');
	const format = typeof node.format === 'number' ? node.format : 0;
	if (format & CODE) html = `<code>${html}</code>`;
	if (format & BOLD) html = `<strong>${html}</strong>`;
	if (format & ITALIC) html = `<em>${html}</em>`;
	if (format & STRIKETHROUGH) html = `<s>${html}</s>`;
	if (format & UNDERLINE) html = `<u>${html}</u>`;
	return html;
};

const linkHref = (node: LexicalNode) => {
	if (node.fields?.linkType === 'internal') {
		const page = populated(node.fields.doc?.value as Page | number | undefined);
		return page ? pagePath(page.slug) : '#';
	}
	return node.fields?.url || '#';
};

const renderNodes = (nodes: LexicalNode[] = []): string => nodes.map(renderNode).join('');

function renderNode(node: LexicalNode): string {
	const children = renderNodes(node.children);
	switch (node.type) {
		case 'text':
			return renderText(node);
		case 'linebreak':
			return '<br />';
		case 'paragraph':
			return `<p>${children}</p>`;
		case 'heading': {
			const tag = /^h[1-6]$/.test(node.tag ?? '') ? node.tag : 'h2';
			return `<${tag}>${children}</${tag}>`;
		}
		case 'quote':
			return `<blockquote>${children}</blockquote>`;
		case 'list': {
			const tag = node.listType === 'number' ? 'ol' : 'ul';
			return `<${tag}>${children}</${tag}>`;
		}
		case 'listitem':
			return `<li>${children}</li>`;
		case 'link':
		case 'autolink': {
			const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
			return `<a href="${escape(linkHref(node))}"${target}>${children}</a>`;
		}
		case 'horizontalrule':
			return '<hr />';
		case 'upload': {
			const media = populated(node.value);
			const src = mediaUrl(media);
			return src ? `<img src="${escape(src)}" alt="${escape(media?.alt ?? '')}" loading="lazy" />` : '';
		}
		default:
			return children;
	}
}

export const richTextToHTML = (data: RichTextData): string => (data?.root ? renderNodes(data.root.children) : '');
