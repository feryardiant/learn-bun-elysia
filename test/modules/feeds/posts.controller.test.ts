import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { createPosts } from 'test/fixtures'
import {
  FeedQuerySchema,
  posts,
  postsController,
  type Post,
  type PostResponse,
  type PostsResponse,
} from '~/modules/feeds'
import { db } from '~/plugins/database.plugin'

describe('Posts Controller', () => {
  const APP_URL = 'http://localhost/posts'
  const entries = createPosts() as [Post, ...Post[]]

  beforeAll(async () => {
    await db.insert(posts).values(entries)
  })

  afterAll(async () => {
    await db.delete(posts)
  })

  it('should retrieve posts collection', async () => {
    const response = await postsController.handle(new Request(APP_URL))
    const { data } = (await response.json()) as PostsResponse

    expect(response.status).toBe(200)
    expect(data).toHaveLength(FeedQuerySchema.properties.limit.default)
  })

  it('should retrieve a post by id', async () => {
    const id = entries[0].id
    const response = await postsController.handle(
      new Request(`${APP_URL}/${id}`),
    )
    const { data } = (await response.json()) as PostResponse

    expect(response.status).toBe(200)
    expect(data.id).toBe(id)
  })
})
