import Elysia from 'elysia'
import pino from 'pino'

export const logger = pino({
  transport: {
    targets: [
      // See: https://getpino.io/#/docs/pretty
      { target: 'pino-pretty' },
    ],
  },
})

export const loggerPlugin = new Elysia({ name: 'logger' })
  .decorate('logger', logger)
  .guard({
    as: 'scoped',
    async beforeHandle({ headers, request }) {
      const obj: Record<string, any> = {
        headers: request.headers.toJSON(),
      }

      if (request.body && headers['content-type'] === 'application/json') {
        obj.payload = await request.body.json()
      }

      logger.debug(obj, `Request received: ${request.method} ${request.url}`)
    },
  })
