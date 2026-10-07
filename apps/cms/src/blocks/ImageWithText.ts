import type { Block } from 'payload'

import { linkField } from '../fields/link'

export const ImageWithText: Block = {
  slug: 'imageWithText',
  interfaceName: 'ImageWithTextBlock',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'imagePosition',
      type: 'radio',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
      admin: { layout: 'horizontal' },
    },
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText' },
    {
      name: 'enableLink',
      type: 'checkbox',
    },
    {
      ...linkField(),
      admin: { condition: (_, siblingData) => Boolean(siblingData?.enableLink) },
    },
  ],
}
