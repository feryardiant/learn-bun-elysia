import { Elysia } from 'elysia'
import pino from 'pino'
import pinoPretty from 'pino-pretty'
import { ENV } from '~/config'
import { reduceHeaders } from '~/utils/request.util'
import { updateSpanName } from './otel.plugin'

const stream = pinoPretty({
  colorize: true,
  translateTime: 'HH:MM:ss Z',
  ignore: 'pid,hostname',
})

export const logger = pino(
  {
    name: ENV.APP_NAME,
    level: ENV.LOG_LEVEL,
  },
  stream,
)

const ignorePathnames = ['/', '/docs', '/docs/json', '/favicon.ico', '/health']

export const loggerPlugin = (app: Elysia) =>
  app
    .decorate('logger', logger)
    .onBeforeHandle(async ({ body, headers, request }) => {
      const { pathname, search } = new URL(request.url)

      updateSpanName('LogRequest')

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
