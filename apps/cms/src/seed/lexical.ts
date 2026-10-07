/** Builds minimal Lexical rich text JSON from strings (paragraphs) and `{ h2 }` headings. */
type Node = string | { h2: string }

const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})

export const lexical = (nodes: Node[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: nodes.map((node) =>
      typeof node === 'string'
        ? { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [text(node)] }
        : { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [text(node.h2)] },
    ),
  },
})
