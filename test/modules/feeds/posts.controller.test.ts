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
import { assertBackwardPagination, assertForwardPagination } from '../helpers'

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

  describe('Pagination', () => {
    const pagingUrl = new URL(APP_URL)
    const headers = new Headers({})

    let page = 0

    it('should navigate forwards using next_page_token', async () => {
      let nextPageToken: string | null = null
      let prevBody: PostsResponse | null = null

      do {
        if (nextPageToken) {
          pagingUrl.searchParams.set('next_page_token', nextPageToken)
        }

        // First page of comments
        const currentPage = await postsController.handle(
          new Request(pagingUrl.toString(), { headers }),
        )

        expect(currentPage.status).toBe(200)
        const currentBody = (await currentPage.json()) as PostsResponse

        assertForwardPagination(currentBody, page, nextPageToken, prevBody)

        prevBody = currentBody
        nextPageToken = currentBody.meta.next_page_token

        page++
      } while (nextPageToken)

      // We're at the last page we should have no next page but a prev page
      expect(prevBody.meta.next_page_token).toBeNull()
      expect(prevBody.meta.prev_page_token).not.toBeNull()
    })

    it('should navigate backwards using prev_page_token', async () => {
      let prevPageToken: string | null = null
      let nextBody: PostsResponse | null = null

      page--
      const lastPage = page

      do {
        if (prevPageToken) {
          pagingUrl.searchParams.delete('next_page_token')
          pagingUrl.searchParams.set('prev_page_token', prevPageToken)
        }

        // First page of comments
        const currentPage = await postsController.handle(
          new Request(pagingUrl.toString(), { headers }),
        )

        expect(currentPage.status).toBe(200)
        const currentBody = (await currentPage.json()) as PostsResponse

        assertBackwardPagination(
          currentBody,
          page,
          lastPage,
          prevPageToken,
          nextBody,
        )

        nextBody = currentBody
        prevPageToken = currentBody.meta.prev_page_token

        page--
      } while (page >= 0)

      // We're at first page we should have next page but no prev page
      expect(nextBody.meta.next_page_token).not.toBeNull()
      expect(nextBody.meta.prev_page_token).toBeNull()
    })
  })
})
