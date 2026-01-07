import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbRun } from '@/lib/db'

const bodySchema = z.object({
  type: z.enum(['post', 'doc']),
  id: z.string().min(1),
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { type, id } = parsed.data
  if (type === 'post') {
    await dbRun(env.DB, 'UPDATE posts SET views = views + 1 WHERE id = ?', [id])
  } else {
    await dbRun(env.DB, 'UPDATE docs SET views = views + 1 WHERE id = ?', [id])
  }

  return json({ ok: true })
}
