import { Type as t } from '@sinclair/typebox'
import { createSelectSchema } from 'drizzle-typebox'
import { accounts, sessions, users } from '~/database/schemas'

export const AccountSchema = createSelectSchema(accounts)

export type Account = (typeof AccountSchema)['static']

export const UserSchema = createSelectSchema(users)

export type User = (typeof UserSchema)['static']

export const SessionSchema = createSelectSchema(sessions)

export type Session = (typeof SessionSchema)['static']
