import { Type as t } from '@sinclair/typebox'
import { drizzle } from 'drizzle-orm/bun-sql'
import { createSelectSchema } from 'drizzle-typebox'
import { ENV, isLocal } from '~/config'
import * as schema from './schemas'

export const db = drizzle({
  connection: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASS,
    database: ENV.DB_NAME,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },
  schema,
})

export type AppDatabase = typeof db

export const PostSchema = createSelectSchema(schema.posts, {
  createdAt: t.Number(),
})

export const CommentSchema = createSelectSchema(schema.comments, {
  createdAt: t.Number(),
})

export type Post = typeof PostSchema.static

export type Comment = typeof CommentSchema.static

