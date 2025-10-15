import { boolean, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users.schema'

// Defines the 'sessions' table for storing user session information.
export const sessions = pgTable('sessions', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revoked: boolean('revoked').notNull().default(false),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedReason: varchar('revoked_reason'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  ipAddress: varchar('ip_address'),
  userAgent: varchar('user_agent'),
})
