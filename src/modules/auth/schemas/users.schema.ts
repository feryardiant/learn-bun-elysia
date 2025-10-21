import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { sessions } from './sessions.schema'
import { accounts } from './accounts.schema'

export const users = pgTable(
  'users',
  {
    id: varchar('id').primaryKey(),
    name: varchar('name').notNull(),
    handle: varchar('handle'),
    email: varchar('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    isAnonymous: boolean('is_anonymous'),
    image: varchar('image'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('user_handle_idx').on(table.handle),
    index('user_email_idx').on(table.email),
    index('user_created_at_idx').on(table.createdAt),
  ],
)

export const userSessions = relations(users, ({ many }) => ({
  posts: many(sessions),
}))

export const userAccounts = relations(users, ({ many }) => ({
  posts: many(accounts),
}))
