import { z } from 'zod'
import { json, error } from '@/lib/http'
import { emailSchema, passwordSchema } from '@/lib/validation'
import { dbGet } from '@/lib/db'
import { verifyPassword } from '@/lib/crypto'
import { createSession, sessionCookie } from '@/lib/auth'

const bodySchema = z.object({
  account: z.string().optional(),
  email: z.string().optional(),
  password: passwordSchema,
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, '账号格式不正确')

  const account = (parsed.data.account ?? parsed.data.email ?? '').trim()
  const { password } = parsed.data
  if (!account) return error(400, '账号格式不正确')
  if (!emailSchema.safeParse(account).success && account.length < 5) return error(400, '账号格式不正确')

  const user = await dbGet<{ id: string; password_hash: string; password_salt: string }>(
    env.DB,
    'SELECT id, password_hash, password_salt FROM users WHERE email = ? OR display_name = ? LIMIT 1',
    [account, account],
  )
  if (!user) return error(401, '账号或密码错误')

  const ok = await verifyPassword(password, user.password_salt, user.password_hash)
  if (!ok) return error(401, '账号或密码错误')

  const session = await createSession(env.DB, user.id, env.SESSION_SECRET)
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
