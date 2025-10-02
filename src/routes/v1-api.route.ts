import { Elysia } from 'elysia';
import { authPlugin } from '~/plugins/auth.plugin';

export const v1ApiRoute = new Elysia({
  prefix: '/v1',
  detail: {
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
})
  .use(authPlugin)   // ctx.betterAuth
