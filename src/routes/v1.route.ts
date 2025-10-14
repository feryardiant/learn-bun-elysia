import { Elysia } from 'elysia'
import { postsController } from '~/modules/feeds'
import { authPlugin } from '~/plugins/auth.plugin'

export const v1Route = new Elysia({
  prefix: '/v1',
})
  .use(authPlugin)
  .use(postsController)
