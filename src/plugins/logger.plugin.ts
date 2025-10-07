import Elysia from 'elysia'
import pino from 'pino'
import { ENV } from '~/config'

export const logger = pino({
  name: ENV.APP_NAME,
  level: ENV.LOG_LEVEL,
  transport: {
    targets: [
      // See: https://getpino.io/#/docs/pretty
      { target: 'pino-pretty' },
    ],
  },
})

export const loggerPlugin = new Elysia({ name: 'logger' })
  .as('scoped')
  .decorate('logger', logger)
  .onBeforeHandle(async ({ body, request }) => {
    const url = new URL(request.url)
    const obj: Record<string, any> = {
      headers: {},
      payload: body,
    }

    for (const [key, val] of request.headers.entries()) {
      if (['cookie'].includes(key)) continue

      obj.headers[key] = val
    }

    logger.debug(
      obj,
      `Request received: ${request.method} ${url.pathname}${url.search}`,
    )
  })
