import { afterAll, beforeAll } from 'bun:test'
import { migrate } from '~/plugins/db.plugin'

beforeAll(async () => {
  const migrated = await migrate()

  if (!migrated) {
    process.exit(1)
  }
})

afterAll(async () => {
  // console.log('🧹 Cleaning up test environment...')
})
