import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from '~/modules/auth'

export const posts = pgTable(
  'posts',
  {
    id: varchar('id').primaryKey(),
    content: text('content').notNull(),
    createdById: varchar('created_by_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('post_created_at_idx').on(table.createdAt)],
)
