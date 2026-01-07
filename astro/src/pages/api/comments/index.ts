import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbAll, dbRun } from '@/lib/db'
import { requireAdmin, requireUser } from '@/lib/permissions'
import { nowIso } from '@/lib/time'
import { randomId } from '@/lib/crypto'

const createSchema = z.object({
  targetType: z.enum(['post', 'doc', 'guestbook']),
  targetId: z.string().min(1),
  content: z.string().min(1).max(1000),
})

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const env = locals.runtime.env
  const all = url.searchParams.get('all') === '1'
  const mine = url.searchParams.get('mine') === '1'
  if (all) {
    const guard = requireAdmin(locals)
    if (guard) return guard
    const rows = await dbAll(
      env.DB,
      `SELECT comments.id, comments.content, comments.created_at, comments.status, comments.target_type, comments.target_id,
              users.email AS author_email,
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
       ORDER BY comments.created_at DESC`,
      [],
    )
    return json({ items: rows })
  }

  if (mine) {
    const guard = requireUser(locals)
    if (guard) return guard
    const rows = await dbAll(
      env.DB,
      `SELECT comments.id, comments.content, comments.created_at, comments.status, comments.target_type, comments.target_id,
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
       ORDER BY comments.created_at DESC`,
      [locals.user!.id],
    )
    return json({ items: rows })
  }

  const targetType = url.searchParams.get('targetType')
  const targetId = url.searchParams.get('targetId')
  if (!targetType || !targetId) return error(400, 'missing target')

  const rows = await dbAll(
    env.DB,
    `SELECT comments.id, comments.content, comments.created_at, users.email AS author_email
     FROM comments
     JOIN users ON users.id = comments.user_id
     WHERE comments.target_type = ? AND comments.target_id = ? AND comments.status = 'visible'
     ORDER BY comments.created_at DESC`,
    [targetType, targetId],
  )

  return json({ items: rows })
}

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const guard = requireUser(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { targetType, targetId, content } = parsed.data
  await dbRun(
    env.DB,
    'INSERT INTO comments (id, user_id, target_type, target_id, content, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [randomId(), locals.user!.id, targetType, targetId, content, 'visible', nowIso()],
  )

  return json({ ok: true })
}
