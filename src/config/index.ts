import { Type as t, type TLiteral } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { name, version } from 'package.json'
import { levels } from 'pino'
import { authConfig } from './auth.config'
import { dbConfig } from './db.config'

const envSchema = t.Object({
  HOST: t.String({ default: 'localhost' }),
  PORT: t.Number({ default: 3000 }),
  NODE_ENV: t.Union(
    [
      t.Literal('local'),
      t.Literal('test'),
      t.Literal('staging'),
      t.Literal('development'),
      t.Literal('production'),
    ],
    { default: 'production' },
  ),

  APP_NAME: t.String({ default: name }),
  APP_VERSION: t.String({ default: version }),
  APP_URL: t.String({ default: 'http://localhost:3000' }),
  APP_DOMAIN: t.String({ default: 'localhost' }),

  BASE_PATH: t.String({ default: '' }),
  LOG_LEVEL: t.Union(
    Object.values(levels.labels).reduce((out, level) => {
      out.push(t.Literal(level))
      return out
    }, [] as TLiteral<string>[]),
    { default: 'info' },
  ),

  ...authConfig.properties,
  ...dbConfig.properties,
})

export const ENV = Value.Parse(envSchema, Bun.env)

export const isLocal = ['local', 'test'].includes(ENV.NODE_ENV)
