import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test'
import { createPosts } from 'test/fixtures'
import {
  FeedQuerySchema,
  PostRepository,
  posts,
  type Post,
} from '~/modules/feeds'
import { db } from '~/plugins/database.plugin'

describe('Post Repository', () => {
  let postRepository: PostRepository
  const entries = createPosts() as [Post, ...Post[]]

  beforeAll(() => {
    postRepository = new PostRepository(db)
  })

  beforeEach(async () => {
    await db.insert(posts).values(entries)
  })

  afterEach(async () => {
    await db.delete(posts)
  })

  it('should get all posts', async () => {
    const results = await postRepository.getAll()

    expect(results).toBeArray()
    expect(results).toHaveLength(FeedQuerySchema.properties.limit.default)
  })

  it('should get a post by id', async () => {
    const id = entries[0].id
    const result = await postRepository.getById(id)

    expect(result).toBeObject()
    expect(result.id).toBe(id)
  })

  it('should throw an error if post not found', async () => {
    expect(postRepository.getById('999')).rejects.toThrow('Post not found')
  })
})
