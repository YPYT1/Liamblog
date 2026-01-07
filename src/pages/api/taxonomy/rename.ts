import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbAll, dbRun } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'
import { parseTags } from '@/lib/content'

const bodySchema = z.object({
  type: z.enum(['tag', 'category', 'series']),
  scope: z.enum(['post', 'doc', 'all']).default('all'),
  from: z.string().min(1),
  to: z.string().min(1),
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { type, scope, from, to } = parsed.data
  const tables: Array<'posts' | 'docs'> = []
  if (scope === 'post' || scope === 'all') tables.push('posts')
  if (scope === 'doc' || scope === 'all') tables.push('docs')

  if (type === 'tag') {
    for (const table of tables) {
      const rows = await dbAll<{ id: string; tags: string | null }>(
        env.DB,
        `SELECT id, tags FROM ${table} WHERE tags LIKE ?`,
        [`%${from}%`],
      )
      for (const row of rows) {
        const tags = parseTags(row.tags)
        if (!tags.includes(from)) continue
        const next = Array.from(new Set(tags.map((t) => (t === from ? to : t)).filter(Boolean)))
        await dbRun(env.DB, `UPDATE ${table} SET tags = ? WHERE id = ?`, [next.join(','), row.id])
      }
    }
    return json({ ok: true })
  }

  const field = type === 'category' ? 'category' : 'series'
  for (const table of tables) {
    await dbRun(env.DB, `UPDATE ${table} SET ${field} = ? WHERE ${field} = ?`, [to, from])
  }

  return json({ ok: true })
}
