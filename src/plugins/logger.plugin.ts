import Elysia from 'elysia'
import pino, { type TransportTargetOptions } from 'pino'
import { ENV } from '~/config'
import { reduceHeaders } from '~/utils/request.util'

const targets: TransportTargetOptions[] = [
  // See: https://getpino.io/#/docs/pretty
  {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
]

export const logger = pino({
  name: ENV.APP_NAME,
  level: ENV.LOG_LEVEL,
  transport: { targets },
})

const ignorePathnames = ['/', '/docs', '/docs/json', '/favicon.ico', '/health']

export const loggerPlugin = () =>
  new Elysia({ name: 'logger' })
    .as('scoped')
    .decorate('logger', logger)
    .onBeforeHandle(async ({ body, headers, request }) => {
      const { pathname, search } = new URL(request.url)

      if (!ignorePathnames.includes(pathname)) {
        logger.debug(
          {
            headers: reduceHeaders(headers),
            payload: body,
          },
          `Request received: ${request.method} ${pathname}${search}`,
        )
      }
    })
