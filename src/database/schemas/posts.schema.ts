import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const posts = pgTable(
  'posts',
  {
    id: varchar('id').primaryKey(),
    content: text('content'),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }),
  },
  (table) => [index('post_created_at_idx').on(table.createdAt)],
)
