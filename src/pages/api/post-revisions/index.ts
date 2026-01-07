import { json, error } from '@/lib/http'
import { dbAll, dbGet } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const postId = url.searchParams.get('postId')
  if (!postId) return error(400, 'missing postId')

  const env = locals.runtime.env
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || '20')))
  const offset = (page - 1) * pageSize

  const rows = await dbAll(
    env.DB,
    `SELECT post_revisions.id, post_revisions.created_at, post_revisions.title, post_revisions.summary,
            post_revisions.status, post_revisions.published_at, post_revisions.withdrawn_at,
            users.email AS editor_email
     FROM post_revisions
     LEFT JOIN users ON users.id = post_revisions.editor_id
     WHERE post_revisions.post_id = ?
     ORDER BY post_revisions.created_at DESC
     LIMIT ? OFFSET ?`,
    [postId, pageSize, offset],
  )
  const totalRow = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM post_revisions WHERE post_id = ?',
    [postId],
  )
  const total = totalRow?.total ?? 0

  return json({ items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
}
