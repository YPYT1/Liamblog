import { json } from '@/lib/http'
import { dbAll } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const scope = url.searchParams.get('scope') || 'all'

  const payload: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
  }

  const include = (key: string) => scope === 'all' || scope === key

  if (include('posts')) {
    payload.posts = await dbAll(env.DB, 'SELECT * FROM posts ORDER BY created_at DESC', [])
  }
  if (include('post_revisions')) {
    payload.post_revisions = await dbAll(env.DB, 'SELECT * FROM post_revisions ORDER BY created_at DESC', [])
  }
  if (include('docs')) {
    payload.docs = await dbAll(env.DB, 'SELECT * FROM docs ORDER BY created_at DESC', [])
  }
  if (include('comments')) {
    payload.comments = await dbAll(env.DB, 'SELECT * FROM comments ORDER BY created_at DESC', [])
  }
  if (include('media')) {
    payload.media = await dbAll(env.DB, 'SELECT * FROM media ORDER BY created_at DESC', [])
  }
  if (include('users')) {
    payload.users = await dbAll(
      env.DB,
      'SELECT id, email, role, verified, display_name, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC',
      [],
    )
  }

  return json(payload)
}
