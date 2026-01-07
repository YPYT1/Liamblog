import sanitizeHtml from 'sanitize-html'

export function sanitizeContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'strong', 'em', 'blockquote',
      'code', 'pre',
      'a', 'img',
      'hr', 'br',
      'span',
    ],
    allowedAttributes: {
      '*': ['id'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
      span: ['data-type'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}
