import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const post = pgTable(
  'posts',
  {
    id: varchar('id').primaryKey(),
    content: text('content').notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }),
  },
  (table) => [index('post_created_at_idx').on(table.createdAt)],
)
