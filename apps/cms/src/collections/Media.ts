import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    read: anyone,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400 },
      { name: 'card', width: 800, height: 1000 },
      { name: 'hero', width: 1920 },
    ],
    mimeTypes: ['image/*'],
  },
}
