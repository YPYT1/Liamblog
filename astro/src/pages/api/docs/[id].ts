import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbGet, dbRun } from '@/lib/db'
import { nowIso } from '@/lib/time'
import { requireAdmin } from '@/lib/permissions'
import { sanitizeContent } from '@/lib/sanitize'
import { addHeadingIds } from '@/lib/content'

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional().nullable(),
  contentHtml: z.string().min(1).optional(),
  status: z.enum(['draft', 'published']).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  orderIndex: z.number().int().optional(),
})

export async function PATCH({ params, request, locals }: { params: { id: string }; request: Request; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const current = await dbGet<{ id: string; status: string; published_at: string | null }>(
    env.DB,
    'SELECT id, status, published_at FROM docs WHERE id = ? LIMIT 1',
    [params.id],
  )
  if (!current) return error(404, 'not found')

  const data = parsed.data
  const now = nowIso()
  const publishedAt =
    data.status === 'published' && !current.published_at
      ? now
      : data.status === 'draft'
        ? null
        : current.published_at

  const safeHtml = data.contentHtml ? sanitizeContent(addHeadingIds(data.contentHtml)) : null

  await dbRun(
    env.DB,
    `UPDATE docs SET
      slug = COALESCE(?, slug),
      title = COALESCE(?, title),
      summary = COALESCE(?, summary),
      content_html = COALESCE(?, content_html),
      status = COALESCE(?, status),
      tags = COALESCE(?, tags),
      category = COALESCE(?, category),
      series = COALESCE(?, series),
      order_index = COALESCE(?, order_index),
      updated_at = ?,
      published_at = ?
     WHERE id = ?`,
    [
      data.slug ?? null,
      data.title ?? null,
      data.summary ?? null,
      safeHtml ?? null,
      data.status ?? null,
      data.tags ? data.tags.join(',') : null,
      data.category ?? null,
      data.series ?? null,
      data.orderIndex ?? null,
      now,
      publishedAt,
      params.id,
    ],
  )

  return json({ ok: true })
}

export async function DELETE({ params, locals }: { params: { id: string }; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  await dbRun(env.DB, 'UPDATE docs SET status = ? WHERE id = ?', ['deleted', params.id])
  return json({ ok: true })
}
