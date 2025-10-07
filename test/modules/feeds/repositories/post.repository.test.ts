import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { db } from '~/database'
import * as schemas from '~/database/schemas'
import { PostRepository } from '~/modules/feeds'

describe('Post Repository', () => {
  let postRepo: PostRepository

  beforeAll(async () => {
    postRepo = new PostRepository(db)
    await db.insert(schemas.post).values([
      { id: '10', content: 'Post 10', createdAt: Date.now() },
      { id: '20', content: 'Post 20', createdAt: Date.now() },
    ])
  })

  afterAll(async () => {
    await db.delete(schemas.post)
  })

  it('should get all posts', async () => {
    const posts = await postRepo.getAll()
    expect(posts).toBeArray()
    expect(posts.length).toBeGreaterThan(0)
  })

  it('should get a post by id', async () => {
    const post = await postRepo.getById('10')
    expect(post).toBeObject()
    expect(post.id).toBe('10')
  })

  it('should throw an error if post not found', async () => {
    const err = async () => await postRepo.getById('999')
    expect(err).toThrow('Post not found')
  })
})
