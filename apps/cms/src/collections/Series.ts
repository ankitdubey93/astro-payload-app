import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../access'
import { slugField } from '../fields/slug'
import { AUTOSAVE_INTERVAL } from '../utilities/autosave'
import { previewURL } from '../utilities/previewURL'

export const Series: CollectionConfig = {
  slug: 'series',
  labels: { singular: 'Series', plural: 'Series' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    description: 'Watch lines, e.g. Diver, Dress, Chronograph.',
    livePreview: {
      url: ({ data }) => (data?.slug ? previewURL(`/series/${data.slug}`) : null),
    },
    preview: (data) => (data?.slug ? previewURL(`/series/${data.slug}`) : null),
  },
  access: {
    create: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'tagline', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
  ],
  versions: {
    drafts: {
      autosave: { interval: AUTOSAVE_INTERVAL },
    },
    maxPerDoc: 50,
  },
}
