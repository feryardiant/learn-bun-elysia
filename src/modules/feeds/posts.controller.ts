import Elysia from 'elysia'
import { asItemResponse, asItemsResponse } from '~/utils/api-response.util'
import { postRepository } from './repositories'
import { PostSchema } from './types'

export const postsController = new Elysia({ prefix: '/posts' })
  .get(
    '/',
    async () => {
      const data = await postRepository.getAll()

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
        tags: ['Posts'],
      },
      response: {
        200: asItemsResponse(PostSchema),
      },
    },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const data = await postRepository.getById(params.id)

      return { data }
    },
    {
      detail: {
        summary: 'Post Detail',
        description: 'Retrieve detail of a post',
        tags: ['Posts'],
      },
      response: {
        200: asItemResponse(PostSchema),
      },
    },
  )
