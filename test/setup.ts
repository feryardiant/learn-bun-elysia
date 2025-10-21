import { afterAll, beforeAll } from 'bun:test'
import { migrator } from '~/plugins/database.plugin'

beforeAll(async () => {
  await migrator()
})

afterAll(async () => {
  // console.log('🧹 Cleaning up test environment...')
})
