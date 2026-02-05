import { Value } from '@sinclair/typebox/value'
import { defineConfig } from 'drizzle-kit'
import { dbConfig } from '~/config/database.config'

const ENV = Value.Parse(dbConfig, process.env)
const isLocal = ['local', 'test'].includes(process.env.NODE_ENV || 'local')

export default defineConfig({
  schema: './src/modules/*/schemas/*.schema.ts',
  out: './database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASS,
    database: ENV.DB_NAME,
    ssl: !isLocal && ENV.DB_SSL_CA_CERT
      ? {
          rejectUnauthorized: false,
          ca: ENV.DB_SSL_CA_CERT,
        }
      : false,
  },
  verbose: true,
})
