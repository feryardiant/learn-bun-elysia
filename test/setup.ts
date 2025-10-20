import { afterAll, beforeAll } from 'bun:test'
import { migrator } from '~/database'

beforeAll(async () => {
  await migrator()
})

afterAll(async () => {
  // console.log('🧹 Cleaning up test environment...')
})
