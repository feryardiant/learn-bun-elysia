import { db } from '~/database'
import { PostRepository } from './post.repository'
import { CommentRepository } from './comment.repository'

export { CommentRepository, PostRepository }

export const postRepository = new PostRepository(db)

export const commentRepository = new CommentRepository(db)
