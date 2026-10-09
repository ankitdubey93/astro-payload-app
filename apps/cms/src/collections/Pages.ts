import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../access'
import { pageBlocks } from '../blocks'
import { slugField } from '../fields/slug'
import { AUTOSAVE_INTERVAL } from '../utilities/autosave'
import { pagePath, previewURL } from '../utilities/previewURL'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Use the slug "home" for the homepage.',
    livePreview: {
      url: ({ data }) => previewURL(pagePath(data?.slug)),
    },
    preview: (data) => previewURL(pagePath(data?.slug as string)),
  },
  access: {
    create: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [{ name: 'layout', type: 'blocks', blocks: pageBlocks }],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: { interval: AUTOSAVE_INTERVAL },
    },
    maxPerDoc: 50,
  },
}
