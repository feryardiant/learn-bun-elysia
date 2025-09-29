import { drizzle } from 'drizzle-orm/bun-sql'
import { ENV, isLocal } from '~/config'
import * as schema from './schemas'

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
