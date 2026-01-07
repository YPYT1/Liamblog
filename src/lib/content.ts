export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function readingTime(html: string) {
  const text = stripHtml(html)
  const words = text.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 250))
  return { minutes, words }
}

export function parseTags(tags: string | null | undefined) {
  if (!tags) return []
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
}

export function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export type HeadingItem = { id: string; text: string; level: number }

export function addHeadingIds(html: string) {
  const used = new Map<string, number>()
  return html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    if (/id\s*=/.test(attrs)) return match
    const text = stripHtml(inner)
    const base = slugify(text)
    if (!base) return match
    const count = used.get(base) ?? 0
    used.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count + 1}`
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`
  })
}

export function extractHeadings(html: string): HeadingItem[] {
  const items: HeadingItem[] = []
  const used = new Map<string, number>()
  const regex = /<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html))) {
    const level = Number(match[1])
    const attrs = match[2] || ''
    const inner = match[3] || ''
    const existingId = attrs.match(/id\s*=\s*["']([^"']+)["']/i)?.[1]
    const text = stripHtml(inner)
    const base = existingId || slugify(text)
    if (!base) continue
    const count = used.get(base) ?? 0
    used.set(base, count + 1)
    const id = existingId || (count === 0 ? base : `${base}-${count + 1}`)
    items.push({ id, text, level })
  }
  return items
}
