import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { comments } from './comments.schema'

export const posts = pgTable(
  'posts',
  {
    id: varchar('id').primaryKey(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('post_created_at_idx').on(table.createdAt)],
)

export const postComments = relations(posts, ({ many }) => ({
  comments: many(comments),
}))
