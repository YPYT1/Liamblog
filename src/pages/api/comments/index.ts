import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbAll, dbGet, dbRun } from '@/lib/db'
import { requireAdmin, requireUser } from '@/lib/permissions'
import { nowIso } from '@/lib/time'
import { randomId } from '@/lib/crypto'

const createSchema = z.object({
  targetType: z.enum(['post', 'doc', 'guestbook']),
  targetId: z.string().min(1),
  content: z.string().max(1000).optional().default(''),
  parentId: z.string().optional().nullable(),
  images: z.array(z.string().min(1)).max(6).optional().default([]),
})

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const env = locals.runtime.env
  const all = url.searchParams.get('all') === '1'
  const mine = url.searchParams.get('mine') === '1'
  const statusFilter = url.searchParams.get('status')
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || '20')))
  const offset = (page - 1) * pageSize
  if (all) {
    const guard = requireAdmin(locals)
    if (guard) return guard
    const where = statusFilter ? 'WHERE comments.status = ?' : ''
    const params: unknown[] = []
    if (statusFilter) params.push(statusFilter)
    const rows = await dbAll(
      env.DB,
      `SELECT comments.id, comments.content, comments.created_at, comments.status, comments.target_type, comments.target_id,
              comments.parent_id, comments.images, comments.updated_at,
              users.email AS author_email, users.display_name AS author_name, users.avatar_url AS author_avatar,
              CASE
                WHEN comments.target_type = 'post' THEN posts.title
                WHEN comments.target_type = 'doc' THEN docs.title
                ELSE '留言箱'
              END AS target_title,
              CASE
                WHEN comments.target_type = 'post' THEN posts.slug
                WHEN comments.target_type = 'doc' THEN docs.slug
                ELSE 'guestbook'
              END AS target_slug
       FROM comments
       JOIN users ON users.id = comments.user_id
       LEFT JOIN posts ON posts.id = comments.target_id AND comments.target_type = 'post'
       LEFT JOIN docs ON docs.id = comments.target_id AND comments.target_type = 'doc'
       ${where}
       ORDER BY comments.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    )
    const totalRow = await dbGet<{ total: number }>(
      env.DB,
      `SELECT COUNT(*) as total FROM comments ${where}`,
      params,
    )
    const total = totalRow?.total ?? 0
    return json({ items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
  }

  if (mine) {
    const guard = requireUser(locals)
    if (guard) return guard
    const rows = await dbAll(
      env.DB,
      `SELECT comments.id, comments.content, comments.created_at, comments.status, comments.target_type, comments.target_id,
              comments.parent_id, comments.images, comments.updated_at,
              CASE
                WHEN comments.target_type = 'post' THEN posts.title
                WHEN comments.target_type = 'doc' THEN docs.title
                ELSE '留言箱'
              END AS target_title,
              CASE
                WHEN comments.target_type = 'post' THEN posts.slug
                WHEN comments.target_type = 'doc' THEN docs.slug
                ELSE 'guestbook'
              END AS target_slug
       FROM comments
       LEFT JOIN posts ON posts.id = comments.target_id AND comments.target_type = 'post'
       LEFT JOIN docs ON docs.id = comments.target_id AND comments.target_type = 'doc'
       WHERE comments.user_id = ?
       ORDER BY comments.created_at DESC
       LIMIT ? OFFSET ?`,
      [locals.user!.id, pageSize, offset],
    )
    const totalRow = await dbGet<{ total: number }>(
      env.DB,
      'SELECT COUNT(*) as total FROM comments WHERE user_id = ?',
      [locals.user!.id],
    )
    const total = totalRow?.total ?? 0
    return json({ items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
  }

  const targetType = url.searchParams.get('targetType')
  const targetId = url.searchParams.get('targetId')
  if (!targetType || !targetId) return error(400, 'missing target')

  const rows = await dbAll(
    env.DB,
    `SELECT comments.id, comments.content, comments.created_at, comments.parent_id, comments.images,
            users.email AS author_email, users.display_name AS author_name, users.avatar_url AS author_avatar
     FROM comments
     JOIN users ON users.id = comments.user_id
     WHERE comments.target_type = ? AND comments.target_id = ? AND comments.status = 'visible'
     ORDER BY comments.created_at ASC
     LIMIT ? OFFSET ?`,
    [targetType, targetId, pageSize, offset],
  )

  const totalRow = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM comments WHERE target_type = ? AND target_id = ? AND status = ?',
    [targetType, targetId, 'visible'],
  )
  const total = totalRow?.total ?? 0
  return json({ items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
}

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const guard = requireUser(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { targetType, targetId, content, parentId, images } = parsed.data
  if (!content.trim() && (!images || images.length === 0)) {
    return error(400, 'empty comment')
  }
  const last = await dbAll<{ created_at: string }>(
    env.DB,
    'SELECT created_at FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [locals.user!.id],
  )
  if (last[0]) {
    const diff = Date.now() - new Date(last[0].created_at).getTime()
    if (diff < 5000) return error(429, 'too fast')
  }
  await dbRun(
    env.DB,
    'INSERT INTO comments (id, user_id, parent_id, target_type, target_id, content, images, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [randomId(), locals.user!.id, parentId ?? null, targetType, targetId, content, JSON.stringify(images || []), 'visible', nowIso(), nowIso()],
  )

  return json({ ok: true })
}
