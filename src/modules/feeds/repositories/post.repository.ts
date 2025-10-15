import type { AppDatabase } from '~/database'
import type { Post } from '../types'

export class PostRepository {
  constructor(private readonly db: AppDatabase) {}

  async getAll(): Promise<Post[]> {
    const items = await this.db.query.posts.findMany({
      //
    })

    return items
  }

  async getById(id: Post['id']): Promise<Post> {
    const item = await this.db.query.posts.findFirst({
      where: (field, { eq }) => eq(field.id, id),
    })

    if (!item) {
      throw new Error('Post not found')
    }

    return item
  }
}
