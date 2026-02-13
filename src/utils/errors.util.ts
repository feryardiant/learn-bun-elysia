import { NotFoundError as ElysiaNotFoundError } from 'elysia'

export enum ERROR_CODES {
  MISSING_CONFIG = 'MISSING_CONFIG',
}

export interface AppError extends Error {
  readonly code: ERROR_CODES
}

export class AuthenticationError extends Error {
  static readonly code = 'AUTHENTICATION'
  readonly status = 401
}

export class AuthorizationError extends Error {
  static readonly code = 'AUTHORIZATION'
  readonly status = 403
}

export class NotFoundError extends ElysiaNotFoundError {
  static readonly code = 'NOT_FOUND'

  constructor() {
    super('Page Not Found')
  }
}

export class InvalidParamError extends Error {
  static readonly code = 'INVALID_PARAM'
  readonly status = 422
}

export class MissingConfigError extends Error implements AppError {
  readonly code = ERROR_CODES.MISSING_CONFIG
  readonly status = 500
}

export default {
  [AuthenticationError.code]: AuthenticationError,
  [AuthorizationError.code]: AuthorizationError,
  [NotFoundError.code]: NotFoundError,
  [InvalidParamError.code]: InvalidParamError,
  [ERROR_CODES.MISSING_CONFIG]: MissingConfigError,
}
