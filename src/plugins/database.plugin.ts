import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'
import { Elysia } from 'elysia'
import { resolve } from 'path'
import { ENV, isLocal } from '~/config'
import * as schema from '~/database/schema'

export const db = drizzle({
  connection: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASS,
    database: ENV.DB_NAME,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },
  schema,
})

export type AppDatabase = typeof db

export async function migrator() {
  await migrate(db, {
    migrationsFolder: resolve(__dirname, '../database/migrations'),
  })
}

export const dbPlugin = new Elysia({ name: 'database' }).decorate({ db })
