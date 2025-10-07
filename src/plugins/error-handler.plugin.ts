import { Elysia, t } from 'elysia'
import { ApiErrorSchema } from '~/utils/api-response.util'
import { AuthenticationError, AuthorizationError, NotFoundError } from '~/utils/errors.util'

const customErrors = {
  [AuthenticationError.code]: AuthenticationError,
  [AuthorizationError.code]: AuthorizationError,
  [NotFoundError.code]: NotFoundError,
}

/**
 * Error handler
 */
export const errorHandlerPlugin = new Elysia({ name: 'error-handler' })
  .guard({
    as: 'global',
    response: {
      500: ApiErrorSchema,
    },
  })
  .error(customErrors)
  .onError({ as: 'scoped' }, ({ error, code, set }) => {
    set.status = 'status' in error ? error.status : 500

    const message = 'message' in error ? error.message : 'Unknown error'

    if (code === 'VALIDATION') {
      console.log(code, error)

      return error.toResponse()
    }

    return { code, message }
  })
