import type { AppDatabase } from '~/plugins/database.plugin'
import type { FeedQuery, Post } from '../types'
import { decodeToken, type Paginable } from '~/utils/pagination.util'
import { posts } from '../schemas/posts.schema'
import { and, between, eq, gt, lt, or, SQL } from 'drizzle-orm'
import { getRange } from '~/utils/filters.util'
import type { PostRelationsFilter } from '../schemas'

export class PostRepository implements Paginable {
  constructor(private readonly db: AppDatabase) {}

  async getNextToken(
    query: FeedQuery,
    entry?: Post,
  ): Promise<[number, string] | null> {
    if (!entry) return null

    const filters = or(
      lt(posts.createdAt, entry.createdAt),
      and(eq(posts.createdAt, entry.createdAt), lt(posts.id, entry.id)),
    )

    const entries = await this.db.$count(
      posts.id,
      and(filters, ...this.buildFilters(query)),
    )

    return entries > 0 ? [new Date(entry.createdAt).getTime(), entry.id] : null
  }

  async getPrevToken(
    query: FeedQuery,
    entry?: Post,
  ): Promise<[number, string] | null> {
    if (!entry) return null

    const filters = or(
      gt(posts.createdAt, entry.createdAt),
      and(eq(posts.createdAt, entry.createdAt), gt(posts.id, entry.id)),
    )

    const entries = await this.db.$count(
      posts.id,
      and(filters, ...this.buildFilters(query)),
    )

    return entries > 0 ? [new Date(entry.createdAt).getTime(), entry.id] : null
  }

  async getAll({
    prev_page_token,
    next_page_token,
    limit,
    ...query
  }: FeedQuery = {}): Promise<Post[]> {
    const AND: PostRelationsFilter[] = []
    const today = new Date()

    if (next_page_token) {
      const [timestamp, id] = decodeToken(next_page_token)
      const createdAt = new Date(timestamp)

      AND.push({
        OR: [
          { createdAt: { lt: createdAt } },
          { createdAt: { eq: createdAt }, id: { lt: id } },
        ],
      })
    } else if (prev_page_token) {
      const [timestamp, id] = decodeToken(prev_page_token)
      const createdAt = new Date(timestamp)

      AND.push({
        OR: [
          { createdAt: { gt: createdAt } },
          { createdAt: { eq: createdAt }, id: { gt: id } },
        ],
      })
    } else {
      AND.push({
        createdAt: { lte: today },
      })
    }

    if (query.date_range) {
      AND.push({
        createdAt: {
          gte: getRange(query.date_range, today),
          lte: today,
        },
      })
    }

    const sortOrder = prev_page_token ? 'asc' : 'desc'
    const items = await this.db.query.posts.findMany({
      where: { AND },
      limit,
      orderBy: {
        createdAt: sortOrder,
        id: sortOrder,
      },
    })

    return items
  }

  async getById(id: Post['id']): Promise<Post> {
    const item = await this.db.query.posts.findFirst({
      where: { id },
    })

    if (!item) {
      throw new Error('Post not found')
    }

    return item
  }

  private buildFilters({ date_range }: FeedQuery) {
    const filters: SQL[] = []

    if (date_range) {
      const today = new Date()

      filters.push(between(posts.createdAt, getRange(date_range, today), today))
    }

    return filters
  }
}
