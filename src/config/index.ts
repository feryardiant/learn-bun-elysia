import { Type as t } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { authConfig } from './auth.config'
import { dbConfig } from './db.config'
import { appConfig } from './app.config'

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

  ...appConfig.properties,
  ...authConfig.properties,
  ...dbConfig.properties,
})

export const ENV = Value.Parse(envSchema, Bun.env)

export const isLocal = ['local', 'test'].includes(ENV.NODE_ENV)
