import type { AppDatabase } from '~/plugins/database.plugin'
import type { FeedQuery, Post } from '../types'
import { type Paginable } from '~/utils/pagination.util'
import { posts } from '../schemas/posts.schema'
import { and, between, eq, gt, lt, or, SQL } from 'drizzle-orm'
import { getRange } from '~/utils/filters.util'

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

  async getAll(): Promise<Post[]> {
    const items = await this.db.query.posts.findMany({
      //
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
