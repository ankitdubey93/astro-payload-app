import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../access'
import { slugField } from '../fields/slug'
import { AUTOSAVE_INTERVAL } from '../utilities/autosave'
import { previewURL } from '../utilities/previewURL'

export const Watches: CollectionConfig = {
  slug: 'watches',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'reference', 'series', 'price', '_status'],
    livePreview: {
      url: ({ data }) => (data?.slug ? previewURL(`/watches/${data.slug}`) : null),
    },
    preview: (data) => (data?.slug ? previewURL(`/watches/${data.slug}`) : null),
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
    {
      name: 'reference',
      label: 'Reference no.',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'series',
      type: 'relationship',
      relationTo: 'series',
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show in "Featured watches" blocks.' },
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: { position: 'sidebar', description: 'Leave empty for "Price on request".' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'shortDescription', type: 'textarea' },
            { name: 'description', type: 'richText' },
            {
              name: 'gallery',
              type: 'array',
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
          ],
        },
        {
          name: 'specs',
          label: 'Specifications',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'movement',
                  type: 'select',
                  options: [
                    { label: 'Automatic', value: 'automatic' },
                    { label: 'Manual wind', value: 'manual' },
                    { label: 'Quartz', value: 'quartz' },
                  ],
                },
                { name: 'caliber', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'caseMaterial', type: 'text' },
                { name: 'caseDiameterMm', label: 'Case diameter (mm)', type: 'number' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'waterResistanceM', label: 'Water resistance (m)', type: 'number' },
                { name: 'powerReserveH', label: 'Power reserve (h)', type: 'number' },
              ],
            },
            { name: 'strap', type: 'text' },
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
