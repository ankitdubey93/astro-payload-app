// @ts-check
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Rendered on demand so Payload drafts / Live Preview work. Individual pages can opt into
	// static output later with `export const prerender = true`.
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	integrations: [react()],
	vite: {
		plugins: [tailwindcss()],
	},
	env: {
		schema: {
			PAYLOAD_URL: envField.string({ context: 'server', access: 'public', default: 'http://localhost:3000' }),
			PAYLOAD_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
			PREVIEW_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
		},
	},
	image: {
		remotePatterns: [{ protocol: 'http', hostname: 'localhost' }, { protocol: 'https' }],
	},
});
