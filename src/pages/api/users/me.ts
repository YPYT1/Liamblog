import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbRun } from '@/lib/db'
import { requireUser } from '@/lib/permissions'
import { nowIso } from '@/lib/time'

const bodySchema = z.object({
  displayName: z.string().min(1).max(50).optional().nullable(),
  avatarUrl: z.string().min(1).max(500).optional().nullable(),
})

export async function PATCH({ request, locals }: { request: Request; locals: App.Locals }) {
  const guard = requireUser(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const data = parsed.data
  await dbRun(
    env.DB,
    'UPDATE users SET display_name = COALESCE(?, display_name), avatar_url = COALESCE(?, avatar_url), updated_at = ? WHERE id = ?',
    [data.displayName ?? null, data.avatarUrl ?? null, nowIso(), locals.user!.id],
  )

  return json({ ok: true })
}
