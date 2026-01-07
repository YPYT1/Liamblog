import { dbGet, dbRun } from '@/lib/db'
import { nowIso } from '@/lib/time'
import { randomId } from '@/lib/crypto'

const encoder = new TextEncoder()

export function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function hashCode(code: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(code))
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
}

export async function storeCode(db: D1Database, email: string, code: string, purpose: string, ttlMinutes = 10) {
  const codeHash = await hashCode(code)
  const now = nowIso()
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
  await dbRun(
    db,
    'INSERT INTO email_codes (id, email, code_hash, purpose, attempts, expires_at, created_at) VALUES (?, ?, ?, ?, 0, ?, ?)',
    [randomId(), email, codeHash, purpose, expiresAt, now],
  )
}

export async function verifyCode(db: D1Database, email: string, code: string, purpose: string) {
  const record = await dbGet<{ id: string; code_hash: string; attempts: number }>(
    db,
    'SELECT id, code_hash, attempts FROM email_codes WHERE email = ? AND purpose = ? AND used_at IS NULL AND expires_at > ? ORDER BY created_at DESC LIMIT 1',
    [email, purpose, nowIso()],
  )
  if (!record) return false

  const codeHash = await hashCode(code)
  const ok = timingSafeEqual(codeHash, record.code_hash)
  const attempts = record.attempts + 1

  await dbRun(db, 'UPDATE email_codes SET attempts = ? WHERE id = ?', [attempts, record.id])

  if (ok) {
    await dbRun(db, 'UPDATE email_codes SET used_at = ? WHERE id = ?', [nowIso(), record.id])
  }

  return ok
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
