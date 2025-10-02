import {
  boolean,
  timestamp,
  pgEnum,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core'

export const onboardingStepEnum = pgEnum('onboarding_step', [
  'step_1',
  'step_2',
  'completed',
])

export const user = pgTable('users', {
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
