import type { Post } from '~/modules/feeds'

/**
 * Create posts.
 *
 * @param length Number of post to be created
 */
export function createPosts(length: number = 50): Post[] {
  return Array.from({ length }, (_, i) => {
    const id = i + 1
    const created = new Date()

    return {
      id: `post-${id}`,
      content: `Content for post ${id}`,
      createdById: null,
      createdAt: created,
      updatedAt: created,
    }
  })
}
