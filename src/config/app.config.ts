import { Type as t, type TLiteral } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { name, version } from 'package.json'
import { levels } from 'pino'

export const appConfig = t.Object({
  APP_NAME: t.String({ default: name }),
  APP_VERSION: t.String({ default: version }),
  APP_URL: t.String({ format: 'uri', default: 'http://localhost:3000' }),
  APP_DOMAIN: t.String({ format: 'hostname', default: 'localhost' }),

  BASE_PATH: t.String({ default: '' }),
  LOG_LEVEL: t.Union(
    Object.values(levels.labels).map((level) => {
      return t.Literal(level)
    }),
    { default: 'info' },
  ),
})
