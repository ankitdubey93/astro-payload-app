import type { GroupField } from 'payload'

type LinkOptions = {
  name?: string
  label?: string
}

/** A link to either an internal page or an external URL. */
export const linkField = ({ name = 'link', label }: LinkOptions = {}): GroupField => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'reference',
          options: [
            { label: 'Internal page', value: 'reference' },
            { label: 'Custom URL', value: 'custom' },
          ],
          admin: { layout: 'horizontal' },
        },
        {
          name: 'newTab',
          label: 'Open in new tab',
          type: 'checkbox',
        },
      ],
    },
    {
      name: 'reference',
      label: 'Page',
      type: 'relationship',
      relationTo: 'pages',
      admin: { condition: (_, siblingData) => siblingData?.type === 'reference' },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      admin: { condition: (_, siblingData) => siblingData?.type === 'custom' },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
  ],
})
