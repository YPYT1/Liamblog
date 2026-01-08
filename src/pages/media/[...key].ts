export async function GET({ params, locals }: { params: { key?: string | string[] }; locals: App.Locals }) {
  const env = locals.runtime.env
  const rawKey = params.key
  const key = Array.isArray(rawKey) ? rawKey.join('/') : rawKey
  if (!key) return new Response('Not found', { status: 404 })
  const object = await env.R2.get(key)
  if (!object) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return new Response(object.body, { headers })
}
