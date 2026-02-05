import type { AccountSchema, SessionSchema, UserSchema } from './schemas'

export type Account = typeof AccountSchema.static

export type User = typeof UserSchema.static

export type Session = typeof SessionSchema.static
