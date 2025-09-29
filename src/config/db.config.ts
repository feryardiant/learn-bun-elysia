import { Type as t } from '@sinclair/typebox'

export const dbConfig = t.Object({
  DB_USER: t.String({ default: 'postgres' }),
  DB_PASS: t.String({ default: 'secret' }),
  DB_HOST: t.String({ default: 'localhost' }),
  DB_PORT: t.Number({ default: 5432 }),
  DB_NAME: t.String(),
})
