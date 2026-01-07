import { json, error } from '@/lib/http'
import { dbAll } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'
import { parseTags } from '@/lib/content'

type TaxonomyType = 'tag' | 'category' | 'series'
type Scope = 'post' | 'doc' | 'all'

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const type = url.searchParams.get('type') as TaxonomyType | null
  const scope = (url.searchParams.get('scope') as Scope | null) ?? 'all'
  if (!type || !['tag', 'category', 'series'].includes(type)) return error(400, 'invalid type')

  const env = locals.runtime.env

  const collectTags = async (table: 'posts' | 'docs') => {
    const rows = await dbAll<{ tags: string | null }>(env.DB, `SELECT tags FROM ${table}`, [])
    const counts = new Map<string, number>()
    rows.forEach((row) => {
      parseTags(row.tags).forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      })
    })
    return counts
  }

  const collectScalar = async (table: 'posts' | 'docs', field: 'category' | 'series') => {
    const rows = await dbAll<{ name: string; count: number }>(
      env.DB,
      `SELECT ${field} as name, COUNT(*) as count FROM ${table} WHERE ${field} IS NOT NULL AND ${field} != '' GROUP BY ${field}`,
      [],
    )
    return rows
  }

  if (type === 'tag') {
    const counts = new Map<string, number>()
    if (scope === 'post' || scope === 'all') {
      const postCounts = await collectTags('posts')
      postCounts.forEach((count, name) => counts.set(name, (counts.get(name) ?? 0) + count))
    }
    if (scope === 'doc' || scope === 'all') {
      const docCounts = await collectTags('docs')
      docCounts.forEach((count, name) => counts.set(name, (counts.get(name) ?? 0) + count))
    }
    const items = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    return json({ items })
  }

  const field = type === 'category' ? 'category' : 'series'
  const itemsMap = new Map<string, number>()
  if (scope === 'post' || scope === 'all') {
    const rows = await collectScalar('posts', field)
    rows.forEach((row) => itemsMap.set(row.name, (itemsMap.get(row.name) ?? 0) + row.count))
  }
  if (scope === 'doc' || scope === 'all') {
    const rows = await collectScalar('docs', field)
    rows.forEach((row) => itemsMap.set(row.name, (itemsMap.get(row.name) ?? 0) + row.count))
  }

  const items = Array.from(itemsMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  return json({ items })
}
