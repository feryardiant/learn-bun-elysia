import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './users.schema'
import { relations } from 'drizzle-orm'

export const accounts = pgTable('accounts', {
  id: varchar('id').primaryKey(),
  accountId: varchar('account_id').notNull(),
  providerId: varchar('provider_id').notNull(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: varchar('access_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshToken: varchar('refresh_token'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  idToken: varchar('id_token'),
  scope: varchar('scope'),
  password: varchar('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const accountUser = relations(accounts, ({ one }) => ({
  user: one(users),
}))
