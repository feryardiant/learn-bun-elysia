import { afterAll, beforeAll } from 'bun:test'
import type { DrizzleError } from 'drizzle-orm'
import { migrator } from '~/plugins/database.plugin'

beforeAll(async () => {
  try {
    await migrator()
  } catch (error) {
    const err = error as DrizzleError
    const errCode = (err.cause as { code: string } | undefined)?.code ?? 'UNKNOWN'
    console.error('Error during database migration:', errCode)
  }
})

afterAll(async () => {
  // console.log('🧹 Cleaning up test environment...')
})
