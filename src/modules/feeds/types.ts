import { Elysia, t } from 'elysia'
import { DateRangeSchema } from '~/utils/filters.util'
import {
  PaginatedMetaSchema,
  PaginatedQuerySchema,
} from '~/utils/pagination.util'
import type {
  CollectionResponse,
  ResourceResponse,
} from '~/utils/response.util'
import { CommentSchema, PostSchema } from './schemas'

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

export interface PostsResponse extends CollectionResponse<Post, FeedMeta> {}

export interface PostResponse extends ResourceResponse<Post> {}
