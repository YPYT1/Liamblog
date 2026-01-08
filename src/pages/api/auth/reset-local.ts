import { z } from 'zod'
import { error, json } from '@/lib/http'
import { dbGet, dbRun } from '@/lib/db'
import { createSalt, hashPassword } from '@/lib/crypto'
import { nowIso } from '@/lib/time'
import { emailSchema, passwordSchema } from '@/lib/validation'

const bodySchema = z
  .object({
    account: z.string().trim().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwords do not match',
    path: ['confirmPassword'],
  })

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, '重置信息不正确')

  const { account, password } = parsed.data
  const normalized = account.trim()
  const isEmail = emailSchema.safeParse(normalized).success
  if (!isEmail && normalized.length < 5) return error(400, '用户名至少5位')

  const existing = await dbGet<{ id: string }>(
    env.DB,
    'SELECT id FROM users WHERE email = ? OR display_name = ? LIMIT 1',
    [normalized, normalized],
  )
  if (!existing) return error(404, '账号不存在')

  const salt = await createSalt()
  const passwordHash = await hashPassword(password, salt)
  await dbRun(env.DB, 'UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?', [
    passwordHash,
    salt,
    nowIso(),
    existing.id,
  ])

  return json({ ok: true })
}
