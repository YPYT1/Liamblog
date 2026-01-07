import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbGet, dbRun } from '@/lib/db'
import { requireAdmin, requireUser } from '@/lib/permissions'
import { nowIso } from '@/lib/time'

const updateSchema = z.object({
  status: z.enum(['visible', 'hidden', 'deleted']).optional(),
  content: z.string().min(1).max(1000).optional(),
})

export async function PATCH({ params, request, locals }: { params: { id: string }; request: Request; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const data = parsed.data
  await dbRun(
    env.DB,
    `UPDATE comments SET
      status = COALESCE(?, status),
      content = COALESCE(?, content),
      updated_at = ?
     WHERE id = ?`,
    [data.status ?? null, data.content ?? null, nowIso(), params.id],
  )

  return json({ ok: true })
}

export async function DELETE({ params, locals }: { params: { id: string }; locals: App.Locals }) {
  const guard = requireUser(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const comment = await dbGet<{ id: string; user_id: string }>(
    env.DB,
    'SELECT id, user_id FROM comments WHERE id = ? LIMIT 1',
    [params.id],
  )
  if (!comment) return error(404, 'not found')
  if (locals.user!.role !== 'admin' && comment.user_id !== locals.user!.id) {
    return error(403, 'forbidden')
  }

  await dbRun(env.DB, 'UPDATE comments SET status = ?, updated_at = ? WHERE id = ?', [
    'deleted',
    nowIso(),
    params.id,
  ])
  return json({ ok: true })
}
