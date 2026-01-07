import { json, error } from '@/lib/http'
import { dbGet, dbRun } from '@/lib/db'
import { createSalt, hashPassword, randomId } from '@/lib/crypto'
import { nowIso } from '@/lib/time'
import { passwordSchema, emailSchema } from '@/lib/validation'

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const secret = request.headers.get('x-bootstrap-secret')
  if (!secret || secret !== env.BOOTSTRAP_SECRET) return error(403, 'forbidden')

  const existingAdmin = await dbGet(env.DB, 'SELECT id FROM users WHERE role = ? LIMIT 1', ['admin'])
  if (existingAdmin) return json({ ok: true, message: 'admin already exists' })

  const email = env.ADMIN_EMAIL
  const password = env.ADMIN_PASSWORD

  const emailOk = emailSchema.safeParse(email).success
  const passwordOk = passwordSchema.safeParse(password).success
  if (!emailOk || !passwordOk) return error(400, 'invalid admin credentials')

  const salt = await createSalt()
  const passwordHash = await hashPassword(password, salt)
  const now = nowIso()
  const userId = randomId()

  const displayName = email.split('@')[0]
  await dbRun(
    env.DB,
    'INSERT INTO users (id, email, password_hash, password_salt, role, verified, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)',
    [userId, email, passwordHash, salt, 'admin', displayName, now, now],
  )

  return json({ ok: true })
}
