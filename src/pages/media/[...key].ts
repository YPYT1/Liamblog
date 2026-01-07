export async function GET({ params, locals }: { params: { key: string[] }; locals: App.Locals }) {
  const env = locals.runtime.env
  const key = params.key.join('/')
  const object = await env.R2.get(key)
  if (!object) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return new Response(object.body, { headers })
}
