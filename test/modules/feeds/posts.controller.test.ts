import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test'
import { createPosts, filtersScenario } from 'test/fixtures'
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
  const headers = new Headers({})

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

  describe('Filtering', () => {
    const filteringUrl = new URL(APP_URL)

    for (const scenario of filtersScenario) {
      afterEach(() => {
        scenario.reset(filteringUrl.searchParams)
      })

      let page = 0
      let prevPageToken: string | null = null
      let nextPageToken: string | null = null
      let prevBody: PostsResponse | null = null
      let nextBody: PostsResponse | null = null

      it(`should able to filter by ${scenario.label}`, async () => {
        scenario.apply(filteringUrl.searchParams)

        do {
          if (nextPageToken) {
            filteringUrl.searchParams.set('next_page_token', nextPageToken)
          }

          // First page of comments
          const currentPage = await postsController.handle(
            new Request(filteringUrl.toString(), { headers }),
          )

          expect(currentPage.status).toBe(200)
          const currentBody = (await currentPage.json()) as PostsResponse

          currentBody.data.forEach(scenario.callback)
          assertForwardPagination(currentBody, page, nextPageToken, prevBody)

          prevBody = currentBody
          nextPageToken = currentBody.meta.next_page_token

          page++
        } while (nextPageToken)

        // We're at the last page we should have no next page but a prev page
        expect(prevBody.meta.next_page_token).toBeNull()
        expect(prevBody.meta.prev_page_token).not.toBeNull()

        page--
        const lastPage = page

        do {
          if (prevPageToken) {
            filteringUrl.searchParams.delete('next_page_token')
            filteringUrl.searchParams.set('prev_page_token', prevPageToken)
          }

          // First page of comments
          const currentPage = await postsController.handle(
            new Request(filteringUrl.toString(), { headers }),
          )

          expect(currentPage.status).toBe(200)
          const currentBody = (await currentPage.json()) as PostsResponse

          currentBody.data.forEach(scenario.callback)
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
    }
  })

  describe('Pagination', () => {
    const pagingUrl = new URL(APP_URL)

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
