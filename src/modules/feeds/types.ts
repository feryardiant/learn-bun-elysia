import { Type as t } from '@sinclair/typebox'
import { createSelectSchema } from 'drizzle-typebox'
import { comments, posts } from './schemas'

export const PostSchema = createSelectSchema(posts)

export type Post = typeof PostSchema.static

export const CommentSchema = createSelectSchema(comments)

export type Comment = typeof CommentSchema.static
