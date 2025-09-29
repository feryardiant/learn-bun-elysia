import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const comments = pgTable(
  'comments',
  {
    id: varchar('id').primaryKey(),
    postId: varchar('post_id').notNull(),
    content: text('content').notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }),
  },
  (table) => [
    index('comment_post_id_idx').on(table.createdAt),
    index('comment_created_at_idx').on(table.createdAt),
  ],
)
