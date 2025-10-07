import { Elysia } from 'elysia'
import {
  ApiErrorSchema,
  ValidationErrorSchema,
  type ValidationValueError,
} from '~/utils/api-response.util'
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '~/utils/errors.util'
import { logger } from './logger.plugin'
import type { ValueError } from '@sinclair/typebox/errors'

const customErrors = {
  [AuthenticationError.code]: AuthenticationError,
  [AuthorizationError.code]: AuthorizationError,
  [NotFoundError.code]: NotFoundError,
}

/**
 * Error handler
 */
export const errorHandlerPlugin = new Elysia({ name: 'error-handler' })
  .as('global')
  .guard({
    response: {
      500: ApiErrorSchema,
      422: ValidationErrorSchema,
    },
  })
  .error(customErrors)
  .onError({ as: 'scoped' }, ({ error, code, headers, set, request }) => {
    set.status = 'status' in error ? error.status : 500

    let message = 'message' in error ? error.message : 'Unknown error'
    const url = new URL(request.url)

    if (message === 'NOT_FOUND') {
      message = 'Page Not Found'
    }

    logger.error(
      {
        error,
        headers,
        endpoint: `${request.method} ${url.pathname}${url.search}`,
      },
      code as string,
    )

    if (code === 'VALIDATION') {
      const errors = error.all as (ValueError & ValidationValueError)[]
      message = `Invalid request, found ${errors.length} validation issue`

      return {
        code,
        message,
        errors: errors.map(({ type, path, value, summary }) => {
          return { type, path, value, summary }
        }),
      }
    }

    return { code, message }
  })
