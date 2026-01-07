import { json } from '@/lib/http'
import { dbAll, dbGet } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'

export async function GET({ locals }: { locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const postTotal = await dbGet<{ total: number }>(env.DB, 'SELECT COUNT(*) as total FROM posts', [])
  const postPublished = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM posts WHERE status = ?',
    ['published'],
  )
  const postDraft = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM posts WHERE status = ?',
    ['draft'],
  )
  const postWithdrawn = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM posts WHERE status = ?',
    ['withdrawn'],
  )
  const postDeleted = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM posts WHERE status = ?',
    ['deleted'],
  )

  const docTotal = await dbGet<{ total: number }>(env.DB, 'SELECT COUNT(*) as total FROM docs', [])
  const docPublished = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM docs WHERE status = ?',
    ['published'],
  )
  const docDraft = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM docs WHERE status = ?',
    ['draft'],
  )

  const commentTotal = await dbGet<{ total: number }>(env.DB, 'SELECT COUNT(*) as total FROM comments', [])
  const commentVisible = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM comments WHERE status = ?',
    ['visible'],
  )
  const commentHidden = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM comments WHERE status = ?',
    ['hidden'],
  )
  const commentDeleted = await dbGet<{ total: number }>(
    env.DB,
    'SELECT COUNT(*) as total FROM comments WHERE status = ?',
    ['deleted'],
  )

  const userTotal = await dbGet<{ total: number }>(env.DB, 'SELECT COUNT(*) as total FROM users', [])
  const postViews = await dbGet<{ total: number }>(env.DB, 'SELECT COALESCE(SUM(views), 0) as total FROM posts', [])
  const docViews = await dbGet<{ total: number }>(env.DB, 'SELECT COALESCE(SUM(views), 0) as total FROM docs', [])

  const topPosts = await dbAll(
    env.DB,
    'SELECT id, slug, title, views, published_at FROM posts WHERE status = ? ORDER BY views DESC, published_at DESC LIMIT 8',
    ['published'],
  )
  const topDocs = await dbAll(
    env.DB,
    'SELECT id, slug, title, views, published_at FROM docs WHERE status = ? ORDER BY views DESC, published_at DESC LIMIT 8',
    ['published'],
  )

  return json({
    posts: {
      total: postTotal?.total ?? 0,
      published: postPublished?.total ?? 0,
      draft: postDraft?.total ?? 0,
      withdrawn: postWithdrawn?.total ?? 0,
      deleted: postDeleted?.total ?? 0,
    },
    docs: {
      total: docTotal?.total ?? 0,
      published: docPublished?.total ?? 0,
      draft: docDraft?.total ?? 0,
    },
    comments: {
      total: commentTotal?.total ?? 0,
      visible: commentVisible?.total ?? 0,
      hidden: commentHidden?.total ?? 0,
      deleted: commentDeleted?.total ?? 0,
    },
    users: {
      total: userTotal?.total ?? 0,
    },
    views: {
      posts: postViews?.total ?? 0,
      docs: docViews?.total ?? 0,
    },
    topPosts,
    topDocs,
  })
}
