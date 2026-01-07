import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbAll, dbRun } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'
import { parseTags } from '@/lib/content'

const bodySchema = z.object({
  type: z.enum(['tag', 'category', 'series']),
  scope: z.enum(['post', 'doc', 'all']).default('all'),
  name: z.string().min(1),
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { type, scope, name } = parsed.data
  const tables: Array<'posts' | 'docs'> = []
  if (scope === 'post' || scope === 'all') tables.push('posts')
  if (scope === 'doc' || scope === 'all') tables.push('docs')

  if (type === 'tag') {
    for (const table of tables) {
      const rows = await dbAll<{ id: string; tags: string | null }>(
        env.DB,
        `SELECT id, tags FROM ${table} WHERE tags LIKE ?`,
        [`%${name}%`],
      )
      for (const row of rows) {
        const tags = parseTags(row.tags).filter((tag) => tag !== name)
        await dbRun(env.DB, `UPDATE ${table} SET tags = ? WHERE id = ?`, [tags.join(','), row.id])
      }
    }
    return json({ ok: true })
  }

  const field = type === 'category' ? 'category' : 'series'
  for (const table of tables) {
    await dbRun(env.DB, `UPDATE ${table} SET ${field} = NULL WHERE ${field} = ?`, [name])
  }

  return json({ ok: true })
}
