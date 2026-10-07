import type { Block } from 'payload'

import { linkField } from '../fields/link'

export const CallToAction: Block = {
  slug: 'callToAction',
  interfaceName: 'CallToActionBlock',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    {
      name: 'links',
      type: 'array',
      maxRows: 2,
      fields: [linkField()],
    },
  ],
}
