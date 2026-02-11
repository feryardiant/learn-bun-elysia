import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test'
import { PostRepository, posts } from '~/modules/feeds'
import { db } from '~/plugins/database.plugin'

describe('Post Repository', () => {
  let postRepository: PostRepository

  beforeAll(() => {
    postRepository = new PostRepository(db)
  })

  beforeEach(async () => {
    await db.insert(posts).values([
      { id: '10', content: 'Post 10' },
      { id: '20', content: 'Post 20' },
    ])
  })

  afterEach(async () => {
    await db.delete(posts)
  })

  it('should get all posts', async () => {
    const results = await postRepository.getAll()
    expect(results).toBeArray()
    expect(results.length).toBeGreaterThan(0)
  })

  it('should get a post by id', async () => {
    const result = await postRepository.getById('10')
    expect(result).toBeObject()
    expect(result.id).toBe('10')
  })

  it('should throw an error if post not found', async () => {
    const err = async () => await postRepository.getById('999')
    expect(err).toThrow('Post not found')
  })
})
