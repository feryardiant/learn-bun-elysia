import Elysia from 'elysia'
import pino from 'pino'
import { ENV } from '~/config'
import { reduceHeaders } from '~/utils/request.util'

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
  .onBeforeHandle(async ({ body, headers, request }) => {
    const { pathname, search } = new URL(request.url)

    logger.debug(
      {
        headers: reduceHeaders(headers),
        payload: body,
      },
      `Request received: ${request.method} ${pathname}${search}`,
    )
  })
