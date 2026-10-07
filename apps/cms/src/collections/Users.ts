import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Lets the Astro server fetch drafts for Live Preview with an API key.
    useAPIKey: true,
  },
  fields: [
    // Email added by default
    { name: 'name', type: 'text' },
  ],
}
