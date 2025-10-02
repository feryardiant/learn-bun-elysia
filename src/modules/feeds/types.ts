import { Type as t } from '@sinclair/typebox'
import { createSelectSchema } from 'drizzle-typebox'
import { comment, post } from '~/database/schemas'

export const PostSchema = createSelectSchema(post, {
  createdAt: t.Number(),
})

export type Post = typeof PostSchema.static

export const CommentSchema = createSelectSchema(comment, {
  createdAt: t.Number(),
})

export type Comment = typeof CommentSchema.static
