import type { Block } from 'payload'

export const FeaturedWatches: Block = {
  slug: 'featuredWatches',
  interfaceName: 'FeaturedWatchesBlock',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'featured',
      options: [
        { label: 'Watches marked as featured', value: 'featured' },
        { label: 'Pick watches manually', value: 'manual' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'watches',
      type: 'relationship',
      relationTo: 'watches',
      hasMany: true,
      admin: { condition: (_, siblingData) => siblingData?.source === 'manual' },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 12,
      admin: { condition: (_, siblingData) => siblingData?.source === 'featured' },
    },
  ],
}
