import type { ValueError } from '@sinclair/typebox/errors'
import { DrizzleQueryError } from 'drizzle-orm'
import { Elysia } from 'elysia'
import {
  ApiErrorSchema,
  ValidationErrorSchema,
  type ValidationValueError,
} from '~/utils/response.util'
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '~/utils/errors.util'
import { reduceHeaders } from '~/utils/request.util'
import { logger } from './logger.plugin'
import { APIError } from 'better-auth'

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
    const { pathname, search } = new URL(request.url)
    const errorObj: Record<string, unknown> = {
      error,
      endpoint: `${request.method} ${pathname}${search}`,
    }

    if (error instanceof APIError) {
      set.status = error.statusCode
      errorObj.headers = error.headers
      errorObj.error = {
        name: error.name,
        ...error.body,
      }

      logger.error(errorObj, `AuthError: ${error.message}`)

      return {
        code: error.status,
        message: error.message,
      }
    }

    if (error instanceof DrizzleQueryError) {
      const causeCode =
        error.cause && 'code' in error.cause
          ? error.cause.code
          : error.cause?.name

      errorObj.error = error.cause
      errorObj.query = error.query
      errorObj.params = error.params

      logger.fatal(errorObj, `${causeCode}: ${error.cause?.message}`)

      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong in our end',
      }
    }

    if (message === 'NOT_FOUND') {
      message = 'Page Not Found'
    }

    errorObj.headers = reduceHeaders(headers)

    if (code === 'VALIDATION') {
      const errors = error.all as (ValueError & ValidationValueError)[]
      message = `Invalid request, found ${errors.length} validation issue`

      logger.error(errorObj, message)

      return {
        code,
        message,
        errors: errors.map(({ type, path, value, summary }) => {
          return { type, path, value, summary }
        }),
      }
    }

    logger.error(errorObj, message)

    return { code, message }
  })
