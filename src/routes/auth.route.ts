import { getCurrentSpan } from '@elysiajs/opentelemetry'
import { Elysia } from 'elysia'
import { auth } from '~/plugins/auth.plugin'

export const authRoute = new Elysia({
  name: 'auth-route',
  prefix: auth.options.basePath,
}).mount(async (request) => {
  const span = getCurrentSpan()
  const { pathname } = new URL(request.url)

  if (span) {
    span.updateName(`${request.method} ${pathname}`)
  }

  // The `auth.handler` might response with a non-JSON content type
  // e.g. `/auth/error` endpoint will return HTML content type
  const response = await auth.handler(request)

  if (response.headers.get('content-type') !== 'application/json') {
    // For non-JSON responses, return them directly
    return response
  }

  // Meanwhile the JSON content type might return `null` body
  const json = (await response.json()) || {}

  return new Response(JSON.stringify(json), {
    status: response.status,
    headers: response.headers,
  })
})
