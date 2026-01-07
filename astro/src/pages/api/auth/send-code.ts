import { z } from 'zod'
import { json, error } from '@/lib/http'
import { emailSchema } from '@/lib/validation'
import { dbGet } from '@/lib/db'
import { generateCode, storeCode } from '@/lib/email-codes'
import { sendVerificationEmail } from '@/lib/mail'

const bodySchema = z.object({
  email: emailSchema,
  purpose: z.enum(['signup']),
})

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const { email } = parsed.data
  const existing = await dbGet(env.DB, 'SELECT id FROM users WHERE email = ? LIMIT 1', [email])
  if (existing) return error(409, 'email already registered')

  const lastCode = await dbGet<{ created_at: string }>(
    env.DB,
    'SELECT created_at FROM email_codes WHERE email = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1',
    [email, 'signup'],
  )
  if (lastCode) {
    const diff = Date.now() - new Date(lastCode.created_at).getTime()
    if (diff < 60_000) return error(429, 'try again later')
  }

  const code = generateCode()
  await storeCode(env.DB, email, code, 'signup')
  await sendVerificationEmail(env, email, code)

  return json({ ok: true })
}
