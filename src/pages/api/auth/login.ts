import { z } from 'zod'
import { json, error } from '@/lib/http'
import { emailSchema, passwordSchema } from '@/lib/validation'
import { dbGet } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'
import { createSession, sessionCookie } from '@/lib/auth'

const bodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { email, password } = parsed.data
  const user = await dbGet<{ id: string; password_hash: string; password_salt: string }>(
    env.DB,
    'SELECT id, password_hash, password_salt FROM users WHERE email = ? LIMIT 1',
    [email],
  )
  if (!user) return error(401, 'invalid credentials')

  const ok = await verifyPassword(password, user.password_salt, user.password_hash)
  if (!ok) return error(401, 'invalid credentials')

  const session = await createSession(env.DB, user.id, env.SESSION_SECRET)
  const secure = request.url.startsWith('https://') || env.APP_URL.startsWith('https://')
  return json(
    { ok: true },
    {
      headers: {
        'set-cookie': sessionCookie(env.SESSION_COOKIE_NAME, session.token, session.expiresAt, secure),
      },
    },
  )
}
