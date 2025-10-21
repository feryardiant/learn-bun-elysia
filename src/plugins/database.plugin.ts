import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'
import { Elysia } from 'elysia'
import { ENV, isLocal } from '~/config'

import * as authSchema from '~/modules/auth/schemas'
import * as feedSchema from '~/modules/feeds/schemas'

export const db = drizzle({
  connection: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASS,
    database: ENV.DB_NAME,
    ssl:
      !isLocal && ENV.DB_SSL_CA_CERT
        ? {
            rejectUnauthorized: false,
            ca: ENV.DB_SSL_CA_CERT,
          }
        : false,
  },
  schema: {
    ...authSchema,
    ...feedSchema,
  },
})

export type AppDatabase = typeof db

export async function migrator() {
  await migrate(db, {
    migrationsFolder: './database/migrations',
  })
}

export const dbPlugin = new Elysia({ name: 'database' }).decorate({ db })
