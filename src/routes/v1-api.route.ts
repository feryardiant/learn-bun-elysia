import { Elysia } from 'elysia'
import { postsController } from '~/modules/feeds/posts.controller'
import { authPlugin } from '~/plugins/auth.plugin'
import { loggerPlugin } from '~/plugins/logger.plugin'

export const v1ApiRoute = new Elysia({
  prefix: '/v1',
})
  .use(authPlugin)
  .use(loggerPlugin)
  .use(postsController)
