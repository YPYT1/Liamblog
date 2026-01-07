import { json } from '@/lib/http'
import { clearSessionCookie, deleteSession } from '@/lib/auth'

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const env = locals.runtime.env
  const cookie = request.headers.get('cookie') || ''
  const token = cookie
    .split(';')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${env.SESSION_COOKIE_NAME}=`))
    ?.split('=')[1]

  if (token) {
    await deleteSession(env.DB, token, env.SESSION_SECRET)
  }

  return json(
    { ok: true },
    {
      headers: {
        'set-cookie': clearSessionCookie(env.SESSION_COOKIE_NAME),
      },
    },
  )
}
