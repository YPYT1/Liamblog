import type { APIRoute } from 'astro'
import { dbAll } from '@/lib/db'

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env
  const site = env.APP_URL || 'https://liamwang.online'
  const posts = await dbAll(
    env.DB,
    'SELECT slug, title, summary, published_at FROM posts WHERE status = ? ORDER BY published_at DESC LIMIT 50',
    ['published'],
  )

  const items = posts
    .map((post) => {
      const url = `${site}/blog/${post.slug}`
      return `\n    <item>\n      <title><![CDATA[${post.title}]]></title>\n      <link>${url}</link>\n      <guid>${url}</guid>\n      <pubDate>${post.published_at || ''}</pubDate>\n      <description><![CDATA[${post.summary || ''}]]></description>\n    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Liam Blog</title>
    <link>${site}</link>
    <description>Liam 的博客</description>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  })
}
