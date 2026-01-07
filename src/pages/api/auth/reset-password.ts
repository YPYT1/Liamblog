import { z } from 'zod'
import { json, error } from '@/lib/http'
import { emailSchema, passwordSchema, codeSchema } from '@/lib/validation'
import { dbGet, dbRun } from '@/lib/db'
import { verifyCode } from '@/lib/email-codes'
import { createSalt, hashPassword } from '@/lib/crypto'
import { nowIso } from '@/lib/time'

const bodySchema = z.object({
  email: emailSchema,
  code: codeSchema,
  password: passwordSchema,
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { email, code, password } = parsed.data
  const existing = await dbGet<{ id: string }>(env.DB, 'SELECT id FROM users WHERE email = ? LIMIT 1', [email])
  if (!existing) return error(404, 'user not found')

  const valid = await verifyCode(env.DB, email, code, 'reset')
  if (!valid) return error(400, 'invalid code')

  const salt = await createSalt()
  const passwordHash = await hashPassword(password, salt)
  await dbRun(
    env.DB,
    'UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE email = ?',
    [passwordHash, salt, nowIso(), email],
  )

  return json({ ok: true })
}
