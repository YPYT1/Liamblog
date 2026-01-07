import { json, error } from '@/lib/http'
import { dbGet, dbRun } from '@/lib/db'
import { requireUser } from '@/lib/permissions'

export async function DELETE({ params, locals }: { params: { id: string }; locals: App.Locals }) {
  const guard = requireUser(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const media = await dbGet<{ id: string; user_id: string; key: string }>(
    env.DB,
    'SELECT id, user_id, key FROM media WHERE id = ? LIMIT 1',
    [params.id],
  )
  if (!media) return error(404, 'not found')
  if (locals.user!.role !== 'admin' && media.user_id !== locals.user!.id) {
    return error(403, 'forbidden')
  }

  await env.R2.delete(media.key)
  await dbRun(env.DB, 'DELETE FROM media WHERE id = ?', [params.id])

  return json({ ok: true })
}
