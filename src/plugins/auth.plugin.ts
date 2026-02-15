import { betterAuth, type Path } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous, bearer, openAPI } from 'better-auth/plugins'
import { Elysia, t } from 'elysia'
import type { OpenAPIV3 } from 'openapi-types'
import { ENV } from '~/config'
import { ErrorResponseSchema } from '~/utils/response.util'
import { AuthenticationError } from '~/utils/errors.util'
import { db } from './database.plugin'
import { logger } from './logger.plugin'
import { updateSpanName } from './otel.plugin'

export const auth = betterAuth({
  appName: ENV.APP_NAME,
  baseURL: ENV.APP_URL,
  basePath: `${ENV.BASE_PATH}/auth`,
  secret: ENV.AUTH_SECRET,

  trustedOrigins(request) {
    return ENV.TRUSTED_ORIGINS || ['*']
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

const { components, paths, security } = await auth.api.generateOpenAPISchema()

export const authDoc: Partial<OpenAPIV3.Document> = {
  components: components as OpenAPIV3.ComponentsObject,
  paths: Object.keys(paths).reduce((res, path) => {
    // Retrieve original path object
    const ref = paths[path] as Path

    // Rewrite path by adding prefix `${basePath}` from auth config
    res[`${auth.options.basePath}${path}`] = Object.keys(ref).reduce(
      (item, mtd) => {
        const method = mtd as keyof Path

        // Better-auth uses `Default` tag for all it's endpoint
        // We need to replace it with `Auth` for better organize
        item[method] = ref[method] as OpenAPIV3.OperationObject
        item[method].tags = ['Auth']

        return item
      },
      {} as Pick<OpenAPIV3.PathItemObject, OpenAPIV3.HttpMethods>,
    )

    return res
  }, {} as OpenAPIV3.PathsObject),
}

export const authPlugin = () =>
  new Elysia({ name: 'auth' })
    .as('scoped')
    .guard({
      detail: { security },
      response: {
        401: t.Object(ErrorResponseSchema.properties, {
          description:
            'Unauthorized. Due to missing or invalid authentication.',
        }),
      },
    })
    .resolve(async ({ request }) => {
      const authenticated = await auth.api.getSession({
        headers: request.headers,
      })

      updateSpanName('Authenticate')

      if (!authenticated) {
        throw new AuthenticationError('Invalid credentials')
      }

      return {
        user: authenticated.user,
        session: authenticated.session,
      }
    })
