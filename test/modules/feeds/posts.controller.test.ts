import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { postsController } from '~/modules/feeds/posts.controller'
import { posts } from '~/database/schemas'
import { db } from '~/database'
import type { Post } from '~/modules/feeds/types'
import type { ApiItemsMeta } from '~/utils/response.util'

describe('Posts Controller', () => {
  beforeAll(async () => {
    await db.insert(posts).values([
      { id: '10', content: 'Post 10', createdAt: Date.now() },
      { id: '20', content: 'Post 20', createdAt: Date.now() },
    ])
  })

  afterAll(async () => {
    await db.delete(posts)
  })

  it('should retrieve posts collection', async () => {
    const response = await postsController.handle(
      new Request('http://localhost/posts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const { data } = (await response.json()) as {
      data: Post[]
      meta: ApiItemsMeta
    }

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
  })

  it('should retrieve a post by id', async () => {
    const id = '10'
    const response = await postsController.handle(
      new Request(`http://localhost/posts/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const { data } = (await response.json()) as { data: Post }

    expect(response.status).toBe(200)
    expect(data.id).toBe(id)
  })
})
