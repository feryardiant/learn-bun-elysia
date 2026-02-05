import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { posts, postsController, type Post } from '~/modules/feeds'
import { db } from '~/plugins/db.plugin'
import type { ApiItemsMeta } from '~/utils/response.util'

describe('Posts Controller', () => {
  const APP_URL = 'http://localhost/posts'

  beforeAll(async () => {
    await db.insert(posts).values([
      { id: '10', content: 'Post 10' },
      { id: '20', content: 'Post 20' },
    ])
  })

  afterAll(async () => {
    await db.delete(posts)
  })

  it('should retrieve posts collection', async () => {
    const response = await postsController.handle(new Request(APP_URL))
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
      new Request(`${APP_URL}/${id}`),
    )
    const { data } = (await response.json()) as { data: Post }

    expect(response.status).toBe(200)
    expect(data.id).toBe(id)
  })
})
