import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous, bearer, openAPI } from 'better-auth/plugins'
import Elysia, { NotFoundError, t } from 'elysia'
import { ENV } from '~/config'
import { ApiErrorSchema } from '~/utils/response.util'
import { AuthenticationError } from '~/utils/errors.util'
import { db } from './db.plugin'
import { logger } from './logger.plugin'

export const auth = betterAuth({
  appName: ENV.APP_NAME,
  baseURL: ENV.APP_URL,
  basePath: `${ENV.BASE_PATH}/auth`,
  secret: ENV.AUTH_SECRET,

  trustedOrigins(request) {
    return ENV.TRUSTED_ORIGINS
  },

  onAPIError: {
    throw: true,
  },

  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),

  logger: {
    level: 'error',
    disabled: ENV.NODE_ENV === 'test',
    log(level, message, ...args) {
      logger[level]({ args }, message)
    },
  },

  user: {
    additionalFields: {
      handle: {
        type: 'string',
        required: false,
      },
      isAnonymous: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
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
      emailDomainName: ENV.APP_DOMAIN,
    }),

    // https://www.better-auth.com/docs/plugins/bearer
    bearer(),

    // https://www.better-auth.com/docs/plugins/open-api
    openAPI(),
  ],
})

export const authPlugin = () =>
  new Elysia({ name: 'auth' })
    .as('scoped')
    .guard({
      headers: t.Object({
        Authorization: t.Optional(
          t.String({
            title: 'User Credential',
            description: 'Authorization Token',
          }),
        ),
      }),
      response: {
        401: t.Object(ApiErrorSchema.properties, {
          description:
            'Unauthorized. Due to missing or invalid authentication.',
        }),
        404: t.Object(ApiErrorSchema.properties, {
          description: 'Not Found. The requested resource was not found.',
        }),
      },
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
