import { z } from 'zod'
import { json, error } from '@/lib/http'
import { dbGet, dbRun } from '@/lib/db'
import { nowIso } from '@/lib/time'
import { requireAdmin } from '@/lib/permissions'
import { sanitizeContent } from '@/lib/sanitize'
import { addHeadingIds } from '@/lib/content'
import { randomId } from '@/lib/crypto'

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional().nullable(),
  contentHtml: z.string().min(1).optional(),
  coverImage: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'withdrawn']).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  pinned: z.boolean().optional(),
})

export async function PATCH({ params, request, locals }: { params: { id: string }; request: Request; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return error(400, 'invalid payload')

  const current = await dbGet<{
    id: string
    title: string
    summary: string | null
    content_html: string
    cover_image: string | null
    status: string
    tags: string | null
    category: string | null
    series: string | null
    pinned: number
    views: number
    withdrawn_at: string | null
    published_at: string | null
  }>(
    env.DB,
    'SELECT id, title, summary, content_html, cover_image, status, tags, category, series, pinned, views, withdrawn_at, published_at FROM posts WHERE id = ? LIMIT 1',
    [params.id],
  )
  if (!current) return error(404, 'not found')

  const data = parsed.data
  const now = nowIso()
  let nextPublishedAt = current.published_at
  let nextWithdrawnAt = current.withdrawn_at
  if (data.status) {
    if (data.status === 'published') {
      nextPublishedAt = current.published_at ?? now
      nextWithdrawnAt = null
    }
    if (data.status === 'draft') {
      nextPublishedAt = null
      nextWithdrawnAt = null
    }
    if (data.status === 'withdrawn') {
      nextWithdrawnAt = now
    }
  }

  const safeHtml = data.contentHtml ? sanitizeContent(addHeadingIds(data.contentHtml)) : null

  await dbRun(
    env.DB,
    `INSERT INTO post_revisions (
      id, post_id, editor_id, title, summary, content_html, cover_image, status, tags, category, series, pinned, views, withdrawn_at, published_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomId(),
      current.id,
      locals.user?.id ?? null,
      current.title,
      current.summary ?? null,
      current.content_html,
      current.cover_image ?? null,
      current.status,
      current.tags ?? null,
      current.category ?? null,
      current.series ?? null,
      current.pinned ?? 0,
      current.views ?? 0,
      current.withdrawn_at ?? null,
      current.published_at ?? null,
      now,
    ],
  )

  await dbRun(
    env.DB,
    `UPDATE posts SET
      slug = COALESCE(?, slug),
      title = COALESCE(?, title),
      summary = COALESCE(?, summary),
      content_html = COALESCE(?, content_html),
      cover_image = COALESCE(?, cover_image),
      status = COALESCE(?, status),
      tags = COALESCE(?, tags),
      category = COALESCE(?, category),
      series = COALESCE(?, series),
      pinned = COALESCE(?, pinned),
      withdrawn_at = ?,
      updated_at = ?,
      published_at = ?
     WHERE id = ?`,
    [
      data.slug ?? null,
      data.title ?? null,
      data.summary ?? null,
      safeHtml ?? null,
      data.coverImage ?? null,
      data.status ?? null,
      data.tags ? data.tags.join(',') : null,
      data.category ?? null,
      data.series ?? null,
      typeof data.pinned === 'boolean' ? (data.pinned ? 1 : 0) : null,
      nextWithdrawnAt,
      now,
      nextPublishedAt,
      params.id,
    ],
  )

  return json({ ok: true })
}

export async function DELETE({ params, locals }: { params: { id: string }; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  await dbRun(env.DB, 'UPDATE posts SET status = ?, withdrawn_at = ? WHERE id = ?', ['deleted', nowIso(), params.id])
  return json({ ok: true })
}
