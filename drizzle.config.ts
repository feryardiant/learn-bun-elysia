import { Value } from '@sinclair/typebox/value'
import { defineConfig } from 'drizzle-kit'
import { dbConfig } from '~/config/db.config'

const ENV = Value.Parse(dbConfig, process.env)
const isLocal = ['local', 'test'].includes(process.env.NODE_ENV || 'local')

export default defineConfig({
  schema: './src/database/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASS,
    database: ENV.DB_NAME,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },
  verbose: true,
})
