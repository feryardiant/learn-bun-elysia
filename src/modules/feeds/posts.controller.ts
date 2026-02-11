import { Elysia, t } from 'elysia'
import { asItemResponse, asItemsResponse } from '~/utils/response.util'
import { PostRepository } from './repositories'
import { PostSchema } from './schemas'
import { db } from '~/plugins/database.plugin'
import { FeedMetaSchema, FeedQuerySchema } from './types'
import { paginate } from '~/utils/pagination.util'

export const postsController = new Elysia({
  prefix: '/posts',
  tags: ['Feed'],
})
  .resolve(() => ({
    repo: new PostRepository(db),
  }))
  .get(
    '/',
    async ({ query, repo }) => {
      const data = await repo.getAll(query)
      const meta = await paginate(data, repo, query)

      return { data, meta }
    },
    {
      detail: {
        summary: 'Post Collection',
        description: 'Retrieve list of all posts',
      },
      query: FeedQuerySchema,
      response: {
        200: asItemsResponse(PostSchema, FeedMetaSchema),
      },
    },
  )
  .get(
    '/:id',
    async ({ params, repo }) => {
      const data = await repo.getById(params.id)

      return { data }
    },
    {
      detail: {
        summary: 'Post Detail',
        description: 'Retrieve detail of a post',
      },
      params: t.Object({
        id: t.String({ title: 'Post ID' }),
      }),
      response: {
        200: asItemResponse(PostSchema),
      },
    },
  )
