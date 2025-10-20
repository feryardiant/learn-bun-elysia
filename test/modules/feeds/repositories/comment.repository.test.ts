import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { db } from '~/database'
import { posts, comments } from '~/modules/feeds'
import { commentRepository } from '~/modules/feeds/repositories'

describe('Comment Repository', () => {
  beforeAll(async () => {
    await db.insert(posts).values([
      { id: '30', content: 'Post 30', createdAt: Date.now() },
      { id: '40', content: 'Post 40', createdAt: Date.now() },
    ])
    await db
      .insert(comments)
      .values([
        { id: '3', content: 'Comment 3', postId: '30', createdAt: Date.now() },
      ])
  })

  afterAll(async () => {
    await db.delete(comments)
    await db.delete(posts)
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

  it('should return an empty array if no comments found by post id', async () => {
    const result = await commentRepository.getAllByPostId('40')
    expect(result).toBeArray()
    expect(result.length).toBe(0)
  })
})
