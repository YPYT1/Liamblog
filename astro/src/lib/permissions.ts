import { error } from '@/lib/http'

export function requireUser(locals: App.Locals) {
  if (!locals.user) return error(401, 'unauthorized')
  return null
}

export function requireAdmin(locals: App.Locals) {
  if (!locals.user) return error(401, 'unauthorized')
  if (locals.user.role !== 'admin') return error(403, 'forbidden')
  return null
}
