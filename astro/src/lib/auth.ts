import { dbGet, dbRun } from '@/lib/db'
import { nowIso } from '@/lib/time'
import { randomId } from '@/lib/crypto'

const encoder = new TextEncoder()

export async function hashToken(token: string, secret: string) {
  const data = encoder.encode(`${token}:${secret}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  return btoa(String.fromCharCode(...bytes))
}

export async function createSession(db: D1Database, userId: string, secret: string) {
  const token = crypto.randomUUID()
  const tokenHash = await hashToken(token, secret)
  const now = nowIso()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()

  await dbRun(
    db,
    'INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
    [randomId(), userId, tokenHash, now, expiresAt],
  )

  return { token, expiresAt }
}

export async function getSessionUser(db: D1Database, token: string, secret: string) {
  const tokenHash = await hashToken(token, secret)
  const session = await dbGet<{ user_id: string }>(
    db,
    'SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1',
    [tokenHash, nowIso()],
  )
  return session?.user_id ?? null
}

export function sessionCookie(name: string, token: string, expiresAt: string, secure = false) {
  const expires = new Date(expiresAt).toUTCString()
  return `${name}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires};${secure ? ' Secure;' : ''}`
}

export function clearSessionCookie(name: string) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export async function deleteSession(db: D1Database, token: string, secret: string) {
  const tokenHash = await hashToken(token, secret)
  await dbRun(db, 'DELETE FROM sessions WHERE token_hash = ?', [tokenHash])
}
