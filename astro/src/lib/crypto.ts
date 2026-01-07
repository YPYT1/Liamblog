const encoder = new TextEncoder()

export function randomId() {
  return crypto.randomUUID()
}

export async function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes))
}

export async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 120_000,
      hash: 'SHA-256',
    },
    key,
    256,
  )
  const bytes = new Uint8Array(derived)
  return btoa(String.fromCharCode(...bytes))
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  const computed = await hashPassword(password, salt)
  return timingSafeEqual(computed, hash)
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
