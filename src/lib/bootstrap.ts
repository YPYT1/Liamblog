import { dbGet, dbRun } from '@/lib/db'
import { createSalt, hashPassword, randomId } from '@/lib/crypto'
import { nowIso } from '@/lib/time'
import { emailSchema, passwordSchema } from '@/lib/validation'

let bootstrapped = false

export async function ensureDevAdmin(env: App.Locals['runtime']['env']) {
  if (bootstrapped) return
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return

  const emailOk = emailSchema.safeParse(env.ADMIN_EMAIL).success
  const passwordOk = passwordSchema.safeParse(env.ADMIN_PASSWORD).success
  if (!emailOk || !passwordOk) return

  const existing = await dbGet(env.DB, 'SELECT id FROM users WHERE role = ? LIMIT 1', ['admin'])
  if (existing) {
    bootstrapped = true
    return
  }

  const salt = await createSalt()
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD, salt)
  const now = nowIso()

  const displayName = env.ADMIN_EMAIL.split('@')[0]
  await dbRun(
    env.DB,
    'INSERT INTO users (id, email, password_hash, password_salt, role, verified, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)',
    [randomId(), env.ADMIN_EMAIL, passwordHash, salt, 'admin', displayName, now, now],
  )

  bootstrapped = true
}
