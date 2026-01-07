import { json } from '@/lib/http'
import { dbAll, dbGet } from '@/lib/db'
import { requireAdmin, requireUser } from '@/lib/permissions'

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const env = locals.runtime.env
  const mine = url.searchParams.get('mine') === '1'
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || '20')))
  const offset = (page - 1) * pageSize
  const q = url.searchParams.get('q')?.trim()

  if (mine) {
    const guard = requireUser(locals)
    if (guard) return guard
  } else {
    const guard = requireAdmin(locals)
    if (guard) return guard
  }

  const conditions: string[] = []
  const params: unknown[] = []

  if (mine) {
    conditions.push('user_id = ?')
    params.push(locals.user!.id)
  }
  if (q) {
    conditions.push('(key LIKE ? OR url LIKE ?)')
    const like = `%${q}%`
    params.push(like, like)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = await dbAll(
    env.DB,
    `SELECT id, user_id, key, url, mime_type, size, created_at FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  )
  const totalRow = await dbGet<{ total: number }>(
    env.DB,
    `SELECT COUNT(*) as total FROM media ${where}`,
    params,
  )
  const total = totalRow?.total ?? 0

  return json({ items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
}
