import type { CommentSchema, PostSchema } from './schemas'

export type Post = typeof PostSchema.static

export type Comment = typeof CommentSchema.static
