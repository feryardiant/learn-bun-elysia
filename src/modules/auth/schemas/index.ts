import { defineRelationsPart } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-typebox'
import { accounts } from './accounts.schema'
import { sessions } from './sessions.schema'
import { users } from './users.schema'
import { verifications } from './verifications.schema'
import { comments, posts } from '~/modules/feeds'

export const AccountSchema = createSelectSchema(accounts)

export const UserSchema = createSelectSchema(users)

export const SessionSchema = createSelectSchema(sessions)

export const authTables = { accounts, sessions, users, verifications }

export const authRelations = defineRelationsPart(
  { accounts, comments, posts, sessions, users },
  (rel) => ({
    accounts: {
      user: rel.one.users({
        from: rel.accounts.userId,
        to: rel.users.id,
      }),
    },
    sessions: {
      user: rel.one.users({
        from: rel.sessions.userId,
        to: rel.users.id,
      }),
    },
    users: {
      accounts: rel.many.accounts(),
      comments: rel.many.comments(),
      posts: rel.many.posts(),
      sessions: rel.many.sessions(),
    },
  }),
)
