import { db } from '~/database'
import { CommentRepository } from './comment.repository'
import { PostRepository } from './post.repository'

export { CommentRepository, PostRepository }

export const postRepository = new PostRepository(db)

export const commentRepository = new CommentRepository(db)
