import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { db } from '~/database'
import { posts } from '~/modules/feeds'
import { postRepository } from '~/modules/feeds/repositories'

describe('Post Repository', () => {
  beforeAll(async () => {
    await db.insert(posts).values([
      { id: '10', content: 'Post 10', createdAt: Date.now() },
      { id: '20', content: 'Post 20', createdAt: Date.now() },
    ])
  })

  afterAll(async () => {
    await db.delete(posts)
  })

  it('should get all posts', async () => {
    const posts = await postRepository.getAll()
    expect(posts).toBeArray()
    expect(posts.length).toBeGreaterThan(0)
  })

  it('should get a post by id', async () => {
    const post = await postRepository.getById('10')
    expect(post).toBeObject()
    expect(post.id).toBe('10')
  })

  it('should throw an error if post not found', async () => {
    const err = async () => await postRepository.getById('999')
    expect(err).toThrow('Post not found')
  })
})
