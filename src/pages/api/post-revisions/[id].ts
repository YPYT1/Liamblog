import { json, error } from '@/lib/http'
import { dbGet, dbRun } from '@/lib/db'
import { requireAdmin } from '@/lib/permissions'
import { nowIso } from '@/lib/time'
import { randomId } from '@/lib/crypto'

export async function GET({ params, locals }: { params: { id: string }; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const revision = await dbGet(env.DB, 'SELECT * FROM post_revisions WHERE id = ? LIMIT 1', [params.id])
  if (!revision) return error(404, 'not found')
  return json({ item: revision })
}

export async function POST({ params, locals }: { params: { id: string }; locals: App.Locals }) {
  const guard = requireAdmin(locals)
  if (guard) return guard

  const env = locals.runtime.env
  const revision = await dbGet<{
    id: string
    post_id: string
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
  }>(env.DB, 'SELECT * FROM post_revisions WHERE id = ? LIMIT 1', [params.id])
  if (!revision) return error(404, 'not found')

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
  }>(env.DB, 'SELECT * FROM posts WHERE id = ? LIMIT 1', [revision.post_id])

  if (current) {
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
        nowIso(),
      ],
    )
  }

  await dbRun(
    env.DB,
    `UPDATE posts SET
      title = ?,
      summary = ?,
      content_html = ?,
      cover_image = ?,
      status = ?,
      tags = ?,
      category = ?,
      series = ?,
      pinned = ?,
      views = ?,
      withdrawn_at = ?,
      published_at = ?,
      updated_at = ?
     WHERE id = ?`,
    [
      revision.title,
      revision.summary ?? null,
      revision.content_html,
      revision.cover_image ?? null,
      revision.status,
      revision.tags ?? null,
      revision.category ?? null,
      revision.series ?? null,
      revision.pinned ?? 0,
      revision.views ?? 0,
      revision.withdrawn_at ?? null,
      revision.published_at ?? null,
      nowIso(),
      revision.post_id,
    ],
  )

  return json({ ok: true })
}
