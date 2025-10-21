import { afterAll, beforeAll } from 'bun:test'
import type { DrizzleError } from 'drizzle-orm'
import { migrator } from '~/plugins/database.plugin'

beforeAll(async () => {
  try {
    await migrator()
  } catch (error) {
    const err = error as DrizzleError
    console.error('Error during database migration:', (err.cause as any).code)
  }
})

afterAll(async () => {
  // console.log('🧹 Cleaning up test environment...')
})
