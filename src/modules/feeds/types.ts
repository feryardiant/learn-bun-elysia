import { Type as t } from '@sinclair/typebox'
import { createSelectSchema } from 'drizzle-typebox'
import { comments, posts } from '~/database/schemas'

export const PostSchema = createSelectSchema(posts, {
  createdAt: t.Number(),
})

export type Post = typeof PostSchema.static

export const CommentSchema = createSelectSchema(comments, {
  createdAt: t.Number(),
})

export type Comment = typeof CommentSchema.static
