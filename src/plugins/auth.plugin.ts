import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous, bearer, openAPI } from 'better-auth/plugins'
import Elysia, { NotFoundError, t } from 'elysia'
import { ENV } from '~/config'
import { db } from '~/database'
import { account, session, user, verification } from '~/database/schemas'
import { AuthenticationError } from '~/utils/errors.util'
import { ApiErrorSchema } from './error-handler.plugin'

export const auth = betterAuth({
  baseURL: `${ENV.APP_URL}${ENV.BASE_PATH}`,
  basePath: '/auth',
  secret: ENV.AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { account, user, session, verification },
  }),

  user: {
    additionalFields: {
      handle: {
        type: 'string',
        required: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // rotate after 1 day
  },

  plugins: [
    // https://www.better-auth.com/docs/plugins/anonymous
    anonymous({
      schema: {
        user: {
          fields: { isAnonymous: 'is_anonymous' },
        },
      },
    }),

    // https://www.better-auth.com/docs/plugins/bearer
    bearer(),

    // https://www.better-auth.com/docs/plugins/open-api
    openAPI(),
  ],
})

export const authPlugin = new Elysia({ name: 'auth' })
  .guard({
    as: 'scoped',
    headers: t.Object({
      authorization: t.Optional(t.String({ pattern: '^Bearer .+$' })),
    }),
    response: {
      400: ApiErrorSchema,
      401: ApiErrorSchema
    }
  })
  .resolve(async ({ request }) => {
    if (!request.headers.has('authorization')) {
      throw new NotFoundError('Page not found')
    }

    const authenticated = await auth.api.getSession({
      headers: request.headers,
    })

    if (!authenticated) {
      throw new AuthenticationError('Invalid credentials')
    }

    return {
      user: authenticated.user,
    }
  })
  .mount(auth.options.basePath, auth.handler)
