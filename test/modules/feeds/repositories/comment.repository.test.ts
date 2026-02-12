import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { tearDownTables } from 'test/fixtures'
import { posts, comments, CommentRepository } from '~/modules/feeds'
import { db } from '~/plugins/database.plugin'

let commentRepository: CommentRepository

beforeAll(async () => {
  await db.insert(posts).values([
    { id: '30', content: 'Post 30' },
    { id: '40', content: 'Post 40' },
  ])

  await db
    .insert(comments)
    .values([{ id: '3', content: 'Comment 3', postId: '30' }])

  commentRepository = new CommentRepository(db)
})

afterAll(async () => {
  await tearDownTables(comments, posts)
})

it('should get all comments', async () => {
  const result = await commentRepository.getAll()
  expect(result).toBeArray()
  expect(result.length).toBeGreaterThan(0)
})

it('should get all comments by post id', async () => {
  const result = await commentRepository.getAllByPostId('30')
  expect(result).toBeArray()
  expect(result.length).toBeGreaterThan(0)
})

it('returns an empty array if no comments found by post id', async () => {
  const result = await commentRepository.getAllByPostId('40')
  expect(result).toBeArray()
  expect(result.length).toBe(0)
})
