import type { GlobalConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../access'
import { linkField } from '../fields/link'
import { AUTOSAVE_INTERVAL } from '../utilities/autosave'
import { previewURL } from '../utilities/previewURL'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    livePreview: { url: () => previewURL('/') },
  },
  fields: [
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'navItems',
      type: 'array',
      maxRows: 8,
      fields: [linkField()],
    },
  ],
  versions: {
    drafts: {
      autosave: { interval: AUTOSAVE_INTERVAL },
    },
    max: 50,
  },
}
