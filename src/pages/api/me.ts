import { json } from '@/lib/http'

export async function GET({ locals }: { locals: App.Locals }) {
  if (!locals.user) return json({ user: null })
  return json({ user: locals.user })
}
