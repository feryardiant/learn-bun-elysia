import { defineRelationsPart, type RelationsFilter } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'
import { users } from '~/modules/auth'
import { posts } from './posts.schema'
import { comments } from './comments.schema'

export const PostSchema = createSelectSchema(posts, {
  createdById: t.Nullable(
    t.String({ description: 'User ID who create the post' }),
  ),
})

export const CommentSchema = createSelectSchema(comments, {
  createdById: t.Nullable(
    t.String({ description: 'User ID who create the comment' }),
  ),
  postId: t.String({ description: 'Post ID where this comment belongs' }),
})

export const feedTables = { comments, posts }

export const feedRelations = defineRelationsPart(
  { comments, posts, users },
  (rel) => ({
    comments: {
      post: rel.one.posts({
        from: rel.comments.postId,
        to: rel.posts.id,
      }),
      createdBy: rel.one.users({
        from: rel.comments.createdById,
        to: rel.users.id,
      }),
    },
    posts: {
      comments: rel.many.comments(),
      createdBy: rel.one.users({
        from: rel.posts.createdById,
        to: rel.users.id,
      }),
    },
  }),
)

export type PostRelationsFilter = RelationsFilter<
  typeof feedRelations.posts,
  typeof PostSchema
>
