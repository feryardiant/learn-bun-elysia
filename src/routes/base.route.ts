import { Elysia, t } from 'elysia'

/**
 * Base Controller
 * Provides basic endpoints for monitoring and load balancing
 */
export const baseRoute = new Elysia()
  .get('/', () => ({ message: 'Nothing to see here' }), {
    detail: { hide: true },
  })
  .get(
    '/health',
    async () => ({
      status: 'ok',
      timestamp: new Date().toUTCString(),
      uptime: Math.floor(process.uptime()),
    }),
    {
      detail: {
        summary: 'Health Status',
        description: 'Retrieve current service health',
        tags: ['Default'],
      },
      response: {
        200: t.Object({
          status: t.String(),
          timestamp: t.String(),
          uptime: t.Number(),
        }),
      },
    },
  )
