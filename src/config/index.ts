import { Type as t } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { levels } from 'pino'
import { authConfig } from './auth.config'
import { dbConfig } from './db.config'
import { name, version } from 'package.json'

const logLevels: string[] = []

for (const level of Object.values(levels.labels)) {
  logLevels.push(level)
}

const envSchema = t.Object({
  HOST: t.String({ default: 'localhost' }),
  PORT: t.Number({ default: 3000 }),
  NODE_ENV: t.Union(
    [
      t.Literal('local'),
      t.Literal('test'),
      t.Literal('development'),
      t.Literal('qa'),
      t.Literal('production'),
    ],
    { default: 'production' },
  ),

  APP_NAME: t.String({ default: name }),
  APP_VERSION: t.String({ default: version }),
  APP_URL: t.String({ default: 'http://localhost:3000' }),
  BASE_PATH: t.String({ default: '' }),
  LOG_LEVEL: t.Union(
    logLevels.map((l) => t.Literal(l)),
    { default: 'info' },
  ),

  ...authConfig.properties,
  ...dbConfig.properties,
})

export const ENV = Value.Parse(envSchema, Bun.env)

export const isLocal = ['local', 'test'].includes(ENV.NODE_ENV)
