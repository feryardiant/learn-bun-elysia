import { expect } from 'bun:test'
import { encodeToken } from '~/utils/pagination.util'
import type { CollectionResponse } from '~/utils/response.util'

interface Entry {
  id: string
  createdAt: Date
}

export async function assertForwardPagination<
  D extends Entry,
  R extends CollectionResponse<D> = CollectionResponse<D>,
>(body: R, page: number, nextPageToken: string | null, prevBody: R | null) {
  if (body.meta.next_page_token) {
    // On every pages except the last one, value of `next_page_token`
    // should be encoded `post_create_date` and `internal_post_id`
    const lastEntry = body.data.at(-1) as D
    const createdAt = new Date(lastEntry.createdAt)

    expect(body.meta.next_page_token).toBe(
      encodeToken(createdAt.getTime(), lastEntry.id),
    )
  }

  // We should not receive the same token as previous one
  expect(body.meta.next_page_token).not.toEqual(nextPageToken)
  expect(body.meta.next_page_token).not.toEqual(body.meta.prev_page_token)

  if (page === 0) {
    // We're at first page we should have next page but no prev page
    expect(body.meta.prev_page_token).toBeNull()
  }

  if (prevBody) {
    // We're no longer at the first page, verify no overlap
    const prevIds = prevBody.data.map((post) => post.id)

    for (const post of body.data) {
      expect(prevIds).not.toContain(post.id)
    }
  }
}

export async function assertBackwardPagination<
  D extends Entry,
  R extends CollectionResponse<D> = CollectionResponse<D>,
>(
  body: R,
  page: number,
  lastPage: number,
  prevPageToken: string | null,
  nextBody: R | null,
) {
  if (body.meta.prev_page_token) {
    // On every pages except the last one, value of `prev_page_token`
    // should be encoded `post_create_date` and `internal_post_id`
    const firstEntry = body.data.at(0) as D
    const createdAt = new Date(firstEntry.createdAt)

    expect(body.meta.prev_page_token).toBe(
      encodeToken(createdAt.getTime(), firstEntry.id),
    )
  }

  // We should not receive the same token as previous one
  expect(body.meta.prev_page_token).not.toEqual(prevPageToken)
  expect(body.meta.next_page_token).not.toEqual(body.meta.prev_page_token)

  if (page === lastPage) {
    // We're at last page we should have no next page but a prev page
    expect(body.meta.next_page_token).toBeNull()
  }

  if (nextBody) {
    // We're no longer at the last page, verify no overlap
    const nextIds = nextBody.data.map((post) => post.id)

    for (const post of body.data) {
      expect(nextIds).not.toContain(post.id)
    }
  }
}
