import Elysia from 'elysia'
import { asItemResponse, asItemsResponse } from '~/utils/response.util'
import { PostRepository } from './repositories'
import { PostSchema } from './schemas'
import { dbPlugin } from '~/plugins/db.plugin'

export const postsController = new Elysia({
  prefix: '/posts',
  tags: ['Feed'],
})
  .use(dbPlugin)
  .resolve(({ db }) => ({
    repo: new PostRepository(db),
  }))
  .get(
    '/',
    async ({ repo }) => {
      const data = await repo.getAll()

      return {
        data,
        meta: {
          page: 0,
        },
      }
    },
    {
      detail: {
        summary: 'Post Collection',
        description: 'Retrieve list of all posts',
      },
      response: {
        200: asItemsResponse(PostSchema),
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
      response: {
        200: asItemResponse(PostSchema),
      },
    },
  )
