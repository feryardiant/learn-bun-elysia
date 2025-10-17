import { relations } from 'drizzle-orm'
import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { comments } from './comments.schema'

export const posts = pgTable(
  'posts',
  {
    id: varchar('id').primaryKey(),
    content: text('content').notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }),
  },
  (table) => [index('post_created_at_idx').on(table.createdAt)],
)

export const postComments = relations(posts, ({ many }) => ({
  comments: many(comments),
}))
