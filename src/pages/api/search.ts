import { json, error } from '@/lib/http'
import { dbAll } from '@/lib/db'

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const env = locals.runtime.env
  const q = url.searchParams.get('q')?.trim()
  if (!q) return error(400, 'missing query')

  const like = `%${q}%`
  const posts = await dbAll(
    env.DB,
    'SELECT slug, title, summary, published_at FROM posts WHERE status = ? AND (title LIKE ? OR summary LIKE ? OR content_html LIKE ?) ORDER BY published_at DESC LIMIT 20',
    ['published', like, like, like],
  )
  const docs = await dbAll(
    env.DB,
    'SELECT slug, title, summary, published_at FROM docs WHERE status = ? AND (title LIKE ? OR summary LIKE ? OR content_html LIKE ?) ORDER BY order_index ASC LIMIT 20',
    ['published', like, like, like],
  )

  return json({ posts, docs })
}
