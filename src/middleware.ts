import type { MiddlewareHandler } from 'astro'
import { dbGet } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { ensureDevAdmin } from '@/lib/bootstrap'

function parseCookie(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split(';').map((chunk) => {
      const [key, ...rest] = chunk.trim().split('=')
      return [key, decodeURIComponent(rest.join('='))]
    }),
  ) as Record<string, string>
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { locals, request } = context
  const env = locals.runtime.env

  await ensureDevAdmin(env)
  const cookies = parseCookie(request.headers.get('cookie'))
  const token = cookies[env.SESSION_COOKIE_NAME]

  if (token) {
    const userId = await getSessionUser(env.DB, token, env.SESSION_SECRET)
    if (userId) {
      const user = await dbGet<{ id: string; email: string; role: 'admin' | 'user'; display_name: string | null; avatar_url: string | null }>(
        env.DB,
        'SELECT id, email, role, display_name, avatar_url FROM users WHERE id = ? LIMIT 1',
        [userId],
      )
      if (user) locals.user = user
    }
  }

  return next()
}
