import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { user } from './users.schema'

export const account = pgTable('accounts', {
  id: varchar('id').primaryKey(),
  accountId: varchar('account_id').notNull(),
  providerId: varchar('provider_id').notNull(),
  userId: varchar('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: varchar('access_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshToken: varchar('refresh_token'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  idToken: varchar('id_token'),
  scope: varchar('scope'),
  password: varchar('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})
