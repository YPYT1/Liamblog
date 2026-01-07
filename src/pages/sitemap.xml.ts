import type { APIRoute } from 'astro'
import { dbAll } from '@/lib/db'

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env
  const site = env.APP_URL || 'https://liamwang.online'

  const staticPaths = ['/', '/blog', '/blog/archive', '/docs', '/project', '/about', '/guestbook', '/search']

  const posts = await dbAll(env.DB, 'SELECT slug, updated_at FROM posts WHERE status = ?', ['published'])
  const docs = await dbAll(env.DB, 'SELECT slug, updated_at FROM docs WHERE status = ?', ['published'])

  const urls = [
    ...staticPaths.map((path) => ({ loc: `${site}${path}`, lastmod: null })),
    ...posts.map((post) => ({ loc: `${site}/blog/${post.slug}`, lastmod: post.updated_at })),
    ...docs.map((doc) => ({ loc: `${site}/docs/${doc.slug}`, lastmod: doc.updated_at })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `  <url><loc>${url.loc}</loc>${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>`

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  })
}
