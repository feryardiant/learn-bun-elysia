import type { TLiteral } from '@sinclair/typebox'
import { t } from 'elysia'
import { name, version } from 'package.json'
import { levels } from 'pino'

export const appConfig = t.Object({
  APP_NAME: t.String({ default: name }),
  APP_VERSION: t.String({ default: version }),
  APP_URL: t.String({ default: 'http://localhost:3000', format: 'uri' }),
  APP_DOMAIN: t.String({ default: 'localhost', format: 'hostname' }),

  BASE_PATH: t.String({ default: '' }),
  LOG_LEVEL: t.Union(
    Object.values(levels.labels).map((level) => t.Literal(level)) as [
      TLiteral<'fatal'>,
      TLiteral<'error'>,
      TLiteral<'warn'>,
      TLiteral<'info'>,
      TLiteral<'debug'>,
      TLiteral<'trace'>,
    ],
    { default: 'info' },
  ),
})
