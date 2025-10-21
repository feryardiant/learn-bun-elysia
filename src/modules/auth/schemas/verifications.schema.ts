import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const verifications = pgTable('verifications', {
  id: varchar('id').primaryKey(),
  identifier: varchar('identifier').notNull(),
  value: varchar('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
