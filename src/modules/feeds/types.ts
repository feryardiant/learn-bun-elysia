import { Elysia } from 'elysia'
import { CommentSchema, PostSchema } from './schemas'

export type Post = typeof PostSchema.static

export type Comment = typeof CommentSchema.static

export const feedModels = new Elysia({ name: 'feed-models' }).model({
  Post: PostSchema,
  Comment: CommentSchema,
})
