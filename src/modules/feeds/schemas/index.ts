import { defineRelationsPart } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-typebox'
import { users } from '~/modules/auth'
import { posts } from './posts.schema'
import { comments } from './comments.schema'

export const PostSchema = createSelectSchema(posts)

export const CommentSchema = createSelectSchema(comments)

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
