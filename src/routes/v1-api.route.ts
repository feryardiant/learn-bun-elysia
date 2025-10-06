import { Elysia } from 'elysia';
import { authPlugin } from '~/plugins/auth.plugin';
import { loggerPlugin } from '~/plugins/logger.plugin';

export const v1ApiRoute = new Elysia({
  prefix: '/v1',
})
  .use(authPlugin)
  .use(loggerPlugin)
