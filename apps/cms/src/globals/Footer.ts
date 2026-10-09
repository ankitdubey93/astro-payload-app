import type { GlobalConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../access'
import { linkField } from '../fields/link'
import { AUTOSAVE_INTERVAL } from '../utilities/autosave'
import { previewURL } from '../utilities/previewURL'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    livePreview: { url: () => previewURL('/') },
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'links', type: 'array', fields: [linkField()] },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: ['instagram', 'facebook', 'x', 'youtube', 'tiktok', 'linkedin'].map((value) => ({
            label: value,
            value,
          })),
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'copyright', type: 'text' },
  ],
  versions: {
    drafts: {
      autosave: { interval: AUTOSAVE_INTERVAL },
    },
    max: 50,
  },
}
