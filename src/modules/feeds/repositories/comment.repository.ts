import type { AppDatabase } from '~/database'
import type { Comment, Post } from '~/modules/feeds/types'
import { PostRepository } from './post.repository'

export class CommentRepository {
  private readonly postRepo: PostRepository

  constructor(private readonly db: AppDatabase) {
    this.postRepo = new PostRepository(db)
  }

  async getAll(): Promise<Comment[]> {
    const items = await this.db.query.comments.findMany({
      //
    })

    return items
  }

  async getAllByPostId(id: Post['id']): Promise<Comment[]> {
    const post = await this.postRepo.getById(id)

    const items = await this.db.query.comments.findMany({
      where(field, { eq }) {
        return eq(field.postId, post.id)
      },
    })

    return items
  }
}
