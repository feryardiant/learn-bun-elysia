import { boolean, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  handle: varchar('handle'),
  email: varchar('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  isAnonymous: boolean('is_anonymous'),
  image: varchar('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})
