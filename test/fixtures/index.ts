import type { PgTable } from 'drizzle-orm/pg-core'
import type { Post } from '~/modules/feeds'
import { db } from '~/plugins/database.plugin'

export * from './post-filters'

export async function tearDownTables(...tables: PgTable[]) {
  await db.transaction(async (tx) =>
    tables.forEach(async (table) => await tx.delete(table)),
  )
}

/**
 * Create posts.
 *
 * @param length Number of post to be created
 */
export function createPosts(length: number = 50): Post[] {
  return Array.from({ length }, (_, i) => {
    const id = i + 1
    const created = new Date()

    return {
      id: `post-${id}`,
      content: `Content for post ${id}`,
      createdById: null,
      createdAt: created,
      updatedAt: created,
    }
  })
}
