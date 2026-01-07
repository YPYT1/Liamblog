import { z } from 'zod'
import { json, error } from '@/lib/http'
import { passwordSchema } from '@/lib/validation'
import { dbGet, dbRun } from '@/lib/db'
import { requireUser } from '@/lib/permissions'
import { verifyPassword, createSalt, hashPassword } from '@/lib/crypto'
import { nowIso } from '@/lib/time'

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const guard = requireUser(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { currentPassword, newPassword } = parsed.data
  const user = await dbGet<{ password_hash: string; password_salt: string }>(
    env.DB,
    'SELECT password_hash, password_salt FROM users WHERE id = ? LIMIT 1',
    [locals.user!.id],
  )
  if (!user) return error(404, 'user not found')

  const ok = await verifyPassword(currentPassword, user.password_salt, user.password_hash)
  if (!ok) return error(401, 'invalid credentials')

  const salt = await createSalt()
  const passwordHash = await hashPassword(newPassword, salt)
  await dbRun(
    env.DB,
    'UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?',
    [passwordHash, salt, nowIso(), locals.user!.id],
  )

  return json({ ok: true })
}
