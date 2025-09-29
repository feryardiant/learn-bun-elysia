import { afterAll, beforeAll } from 'bun:test'
import { migrate } from 'drizzle-orm/bun-sql/migrator'
import { db } from '~/database'

beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle' })
})

afterAll(async () => {
  // console.log('🧹 Cleaning up test environment...')
})
