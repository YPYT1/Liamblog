import { z } from 'zod'
import { json, error } from '@/lib/http'
import { emailSchema, passwordSchema } from '@/lib/validation'
import { dbGet, dbRun } from '@/lib/db'
import { createSalt, hashPassword, randomId } from '@/lib/crypto'
import { nowIso } from '@/lib/time'
import { createSession, sessionCookie } from '@/lib/auth'

const bodySchema = z.object({
  account: z.string().trim().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwords do not match',
  path: ['confirmPassword'],
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, '注册信息不正确')

  const { account, password } = parsed.data
  const normalized = account.trim()
  const isEmail = emailSchema.safeParse(normalized).success
  if (!isEmail && normalized.length < 5) return error(400, '用户名至少5位')

  const existing = await dbGet(env.DB, 'SELECT id FROM users WHERE email = ? OR display_name = ? LIMIT 1', [normalized, normalized])
  if (existing) return error(409, isEmail ? '邮箱已被注册' : '用户名已存在')

  const salt = await createSalt()
  const passwordHash = await hashPassword(password, salt)
  const now = nowIso()
  const userId = randomId()

  const email = normalized
  const displayName = isEmail ? normalized.split('@')[0] : normalized
  await dbRun(
    env.DB,
    'INSERT INTO users (id, email, password_hash, password_salt, role, verified, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)',
    [userId, email, passwordHash, salt, 'user', displayName, now, now],
  )

  const session = await createSession(env.DB, userId, env.SESSION_SECRET)
  const appUrl = env.APP_URL || ''
  const secure = request.url.startsWith('https://') || appUrl.startsWith('https://')
  return json(
    { ok: true },
    {
      headers: {
        'set-cookie': sessionCookie(env.SESSION_COOKIE_NAME, session.token, session.expiresAt, secure),
      },
    },
  )
}
