import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbAll, dbGet, dbRun } from '@/lib/db'
import { nowIso } from '@/lib/time'
import { randomId } from '@/lib/crypto'
import { requireAdmin } from '@/lib/permissions'
import { sanitizeContent } from '@/lib/sanitize'
import { addHeadingIds } from '@/lib/content'

const createSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional().nullable(),
  contentHtml: z.string().min(1),
  status: z.enum(['draft', 'published']).default('draft'),
  tags: z.array(z.string()).optional().default([]),
  category: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
})

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const env = locals.runtime.env
  const all = url.searchParams.get('all') === '1'
  if (all) {
    const guard = requireAdmin(locals)
    if (guard) return guard
  }

  const rows = await dbAll(
    env.DB,
    all
      ? 'SELECT * FROM docs ORDER BY order_index ASC, created_at DESC'
      : 'SELECT * FROM docs WHERE status = ? ORDER BY order_index ASC, published_at DESC',
    all ? [] : ['published'],
  )
  return json({ items: rows })
}

export async function POST({ request, locals }: { request: Request; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const data = parsed.data
  const exists = await dbGet(env.DB, 'SELECT id FROM docs WHERE slug = ? LIMIT 1', [data.slug])
  if (exists) return error(409, 'slug exists')

  const now = nowIso()
  const publishedAt = data.status === 'published' ? now : null

  const safeHtml = sanitizeContent(addHeadingIds(data.contentHtml))

  await dbRun(
    env.DB,
    `INSERT INTO docs (id, slug, title, summary, content_html, status, tags, category, series, order_index, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ,
    [
      randomId(),
      data.slug,
      data.title,
      data.summary ?? null,
      safeHtml,
      data.status,
      data.tags.join(','),
      data.category ?? null,
      data.series ?? null,
      data.orderIndex ?? 0,
      now,
      now,
      publishedAt,
    ],
  )

  return json({ ok: true })
}
