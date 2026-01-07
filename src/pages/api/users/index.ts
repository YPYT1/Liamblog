import { json } from '@/lib/http'
import { dbAll, dbGet } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || '20')))
  const offset = (page - 1) * pageSize
  const rows = await dbAll(
    env.DB,
    'SELECT id, email, role, verified, display_name, avatar_url, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [pageSize, offset],
  )
  const totalRow = await dbGet<{ total: number }>(env.DB, 'SELECT COUNT(*) as total FROM users', [])
  const total = totalRow?.total ?? 0
  return json({ items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
}
