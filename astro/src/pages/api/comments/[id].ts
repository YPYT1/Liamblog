import { json } from '@/lib/http'
import { dbRun } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'

export async function DELETE({ params, locals }: { params: { id: string }; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  await dbRun(env.DB, 'UPDATE comments SET status = ? WHERE id = ?', ['deleted', params.id])
  return json({ ok: true })
}
