import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { posts } from './posts.schema'
import { users } from '~/modules/auth'

export const comments = pgTable(
  'comments',
  {
    id: varchar('id').primaryKey(),
    postId: varchar('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdById: varchar('created_by_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('comment_created_at_idx').on(table.createdAt)],
)
