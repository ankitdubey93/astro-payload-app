import type { Block } from 'payload'

export const SeriesGrid: Block = {
  slug: 'seriesGrid',
  interfaceName: 'SeriesGridBlock',
  labels: { singular: 'Series grid', plural: 'Series grids' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'series',
      type: 'relationship',
      relationTo: 'series',
      hasMany: true,
      admin: { description: 'Leave empty to show every series.' },
    },
  ],
}
