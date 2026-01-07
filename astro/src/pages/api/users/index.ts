import { json } from '@/lib/http'
import { dbAll } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'

export async function GET({ locals }: { locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const rows = await dbAll(
    env.DB,
    'SELECT id, email, role, verified, created_at FROM users ORDER BY created_at DESC',
    [],
  )
  return json({ items: rows })
}
