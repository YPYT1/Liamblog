import { z } from 'zod'
import { json, error } from '@/lib/http'
import { emailSchema, passwordSchema, codeSchema } from '@/lib/validation'
import { dbGet, dbRun } from '@/lib/db'
import { createSalt, hashPassword, randomId } from '@/lib/crypto'
import { verifyCode } from '@/lib/email-codes'
import { nowIso } from '@/lib/time'
import { createSession, sessionCookie } from '@/lib/auth'

const bodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  code: codeSchema,
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { email, password, code } = parsed.data
  const existing = await dbGet(env.DB, 'SELECT id FROM users WHERE email = ? LIMIT 1', [email])
  if (existing) return error(409, 'email already registered')

  const validCode = await verifyCode(env.DB, email, code, 'signup')
  if (!validCode) return error(400, 'invalid code')

  const salt = await createSalt()
  const passwordHash = await hashPassword(password, salt)
  const now = nowIso()
  const userId = randomId()

  await dbRun(
    env.DB,
    'INSERT INTO users (id, email, password_hash, password_salt, role, verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
    [userId, email, passwordHash, salt, 'user', now, now],
  )

  const session = await createSession(env.DB, userId, env.SESSION_SECRET)
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
