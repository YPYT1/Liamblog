export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
    ...init,
  })
}

export function error(status: number, message: string) {
  return json({ error: message }, { status })
}
