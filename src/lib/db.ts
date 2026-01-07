export function getDb(locals: App.Locals) {
  return locals.runtime.env.DB
}

export async function dbGet<T = unknown>(db: D1Database, sql: string, params: unknown[] = []) {
  const result = await db.prepare(sql).bind(...params).first<T>()
  return result ?? null
}

export async function dbAll<T = unknown>(db: D1Database, sql: string, params: unknown[] = []) {
  const result = await db.prepare(sql).bind(...params).all<T>()
  return result.results ?? []
}

export async function dbRun(db: D1Database, sql: string, params: unknown[] = []) {
  return db.prepare(sql).bind(...params).run()
}
