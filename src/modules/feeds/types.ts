import { Elysia, t } from 'elysia'
import { CommentSchema, PostSchema } from './schemas'
import {
  PaginatedMetaSchema,
  PaginatedQuerySchema,
} from '~/utils/pagination.util'
import { DateRangeSchema } from '~/utils/filters.util'

export type Post = typeof PostSchema.static

export type Comment = typeof CommentSchema.static

export const feedModels = new Elysia({ name: 'feed-models' }).model({
  Post: PostSchema,
  Comment: CommentSchema,
})

export const FeedQuerySchema = t.Object(
  {
    date_range: t.Optional(DateRangeSchema),
    ...PaginatedQuerySchema.properties,
  },
  { description: PaginatedQuerySchema.description },
)

export const FeedMetaSchema = t.Object(
  {
    ...PaginatedMetaSchema.properties,
  },
  { description: PaginatedMetaSchema.description, additionalProperties: true },
)

export type FeedQuery = typeof FeedQuerySchema.static

export type FeedMeta = typeof FeedMetaSchema.static

export interface PostsResponse {
  data: Post[]
  meta: FeedMeta
}

export interface PostResponse {
  data: Post
}
