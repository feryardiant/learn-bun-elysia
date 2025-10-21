import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from './users.schema'

// Defines the 'sessions' table for storing user session information.
export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id').primaryKey(),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token').notNull().unique(),
    userAgent: varchar('user_agent'),
    ipAddress: varchar('ip_address'),
    revoked: boolean('revoked').notNull().default(false),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedReason: varchar('revoked_reason'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('session_token_idx').on(table.token),
    index('session_created_at_idx').on(table.createdAt),
  ],
)

export const sessionUser = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))
