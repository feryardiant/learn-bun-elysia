import type { DrizzleError } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate as migrator } from 'drizzle-orm/bun-sql/migrator'
import { Elysia } from 'elysia'
import { ENV, isLocal } from '~/config'
import { logger } from './logger.plugin'

import { authRelations, authTables } from '~/modules/auth/schemas'
import { feedRelations, feedTables } from '~/modules/feeds/schemas'

export const db = drizzle({
  connection: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    username: ENV.DB_USER,
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
    ...authTables,
    ...feedTables,
  },
  relations: {
    ...authRelations,
    ...feedRelations,
  },
})

export type AppDatabase = typeof db

export async function migrate() {
  try {
    await migrator(db, {
      migrationsFolder: './database/migrations',
    })

    logger.info('Database migration completed')
    return true
  } catch (err) {
    const error = err as DrizzleError
    logger.error(error, 'Failed to migrate database')
    return false
  }
}

export const dbPlugin = new Elysia({ name: 'database' }).decorate({ db })
