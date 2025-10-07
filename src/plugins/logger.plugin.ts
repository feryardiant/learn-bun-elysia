import Elysia from 'elysia'
import pino from 'pino'
import { ENV } from '~/config'

export const logger = pino({
  level: ENV.LOG_LEVEL,
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
      const url = new URL(request.url)
      const obj: Record<string, any> = {
        headers: {},
      }

      for (const [key, val] of request.headers.entries()) {
        if (['cookie'].includes(key)) continue

        obj.headers[key] = val
      }

      if (request.body && headers['content-type'] === 'application/json') {
        obj.payload = await request.body.json()
      }

      logger.debug(obj, `Request received: ${request.method} ${url.pathname}`)
    },
  })
