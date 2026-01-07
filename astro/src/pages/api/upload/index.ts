import { json, error } from '@/lib/http'
import { requireAdmin } from '@/lib/permissions'
import { randomId } from '@/lib/crypto'
import { dbRun } from '@/lib/db'
import { nowIso } from '@/lib/time'

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const form = await request.formData()
  const file = form.get('file')
  if (!file || !(file instanceof File)) return error(400, 'missing file')
  if (file.size > 10 * 1024 * 1024) return error(400, 'file too large')

  const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
  const date = new Date()
  const key = `uploads/${date.getFullYear()}/${date.getMonth() + 1}/${randomId()}${ext ? `.${ext}` : ''}`

  await env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
  })

  const publicBase = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')
  const url = publicBase ? `${publicBase}/${key}` : `/media/${key}`

  await dbRun(
    env.DB,
    'INSERT INTO media (id, user_id, key, url, mime_type, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [randomId(), locals.user!.id, key, url, file.type || 'application/octet-stream', file.size, nowIso()],
  )

  return json({ ok: true, url })
}
