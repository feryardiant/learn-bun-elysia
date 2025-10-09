import { Elysia } from 'elysia'
import { postsController } from '~/modules/feeds'
import { authPlugin } from '~/plugins/auth.plugin'
import { loggerPlugin } from '~/plugins/logger.plugin'

export const v1Route = new Elysia({
  prefix: '/v1',
})
  .use(authPlugin)
  .use(loggerPlugin)
  .use(postsController)
