import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { db } from '~/database'
import * as schemas from '~/database/schemas'
import { CommentRepository } from '~/modules/feeds'

describe('Comment Repository', () => {
  let commentRepo: CommentRepository

  beforeAll(async () => {
    commentRepo = new CommentRepository(db)
    await db.insert(schemas.posts).values([
      { id: '30', content: 'Post 30', createdAt: Date.now() },
      { id: '40', content: 'Post 40', createdAt: Date.now() },
    ])
    await db
      .insert(schemas.comments)
      .values([
        { id: '3', content: 'Comment 3', postId: '30', createdAt: Date.now() },
      ])
  })

  afterAll(async () => {
    await db.delete(schemas.comments)
    await db.delete(schemas.posts)
  })

  it('should get all comments', async () => {
    const comments = await commentRepo.getAll()
    expect(comments).toBeArray()
    expect(comments.length).toBeGreaterThan(0)
  })

  it('should get all comments by post id', async () => {
    const comments = await commentRepo.getAllByPostId('30')
    expect(comments).toBeArray()
    expect(comments.length).toBeGreaterThan(0)
  })

  it('should return an empty array if no comments found by post id', async () => {
    const comments = await commentRepo.getAllByPostId('40')
    expect(comments).toBeArray()
    expect(comments.length).toBe(0)
  })
})
