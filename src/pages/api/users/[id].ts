import { json, error } from '@/lib/http'
import { dbGet, dbRun } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'

export async function DELETE({ params, locals }: { params: { id: string }; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  if (params.id === locals.user?.id) {
    return error(400, 'cannot delete self')
  }

  const env = locals.runtime.env
  const target = await dbGet<{ id: string; role: string }>(
    env.DB,
    'SELECT id, role FROM users WHERE id = ? LIMIT 1',
    [params.id],
  )
  if (!target) return error(404, 'not found')
  if (target.role === 'admin') return error(403, 'cannot delete admin')

  await dbRun(env.DB, 'DELETE FROM sessions WHERE user_id = ?', [params.id])
  await dbRun(env.DB, 'DELETE FROM comments WHERE user_id = ?', [params.id])
  await dbRun(env.DB, 'DELETE FROM media WHERE user_id = ?', [params.id])
  await dbRun(env.DB, 'DELETE FROM users WHERE id = ?', [params.id])
  return json({ ok: true })
}
