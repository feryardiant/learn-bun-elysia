import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { posts } from './posts.schema'
import { relations } from 'drizzle-orm'

export const comments = pgTable(
  'comments',
  {
    id: varchar('id').primaryKey(),
    postId: varchar('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('comment_created_at_idx').on(table.createdAt)],
)

export const commentPost = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}))
