import type { TextField } from 'payload'

import { slugify } from '../utilities/slugify'

/** URL slug, auto-generated from `sourceField` when left empty. */
export const slugField = (sourceField = 'title'): TextField => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: `Generated from the ${sourceField} if left empty.`,
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = data?.[sourceField]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})
