import { NotFoundError as ElysiaNotFoundError } from 'elysia'

export enum ERROR_CODES {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_PARAM = 'INVALID_PARAM',
  MISSING_CONFIG = 'MISSING_CONFIG',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError extends Error {
  readonly code: ERROR_CODES
  readonly status: number
}

export class AuthenticationError extends Error {
  readonly code = ERROR_CODES.AUTHENTICATION
  readonly status = 401
}

export class AuthorizationError extends Error {
  readonly code = ERROR_CODES.AUTHORIZATION
  readonly status = 403
}

export class NotFoundError extends ElysiaNotFoundError {
  override readonly code = ERROR_CODES.NOT_FOUND
}

export class InvalidParamError extends Error {
  readonly code = ERROR_CODES.INVALID_PARAM
  readonly status = 422
}

export class MissingConfigError extends Error implements AppError {
  readonly code = ERROR_CODES.MISSING_CONFIG
  readonly status = 500
}

export default {
  [ERROR_CODES.AUTHENTICATION]: AuthenticationError,
  [ERROR_CODES.AUTHORIZATION]: AuthorizationError,
  [ERROR_CODES.NOT_FOUND]: NotFoundError,
  [ERROR_CODES.INVALID_PARAM]: InvalidParamError,
  [ERROR_CODES.MISSING_CONFIG]: MissingConfigError,
}
