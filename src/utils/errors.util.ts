import { NotFoundError as ElysiaNotFoundError } from 'elysia'

export class AuthenticationError extends Error {
  static readonly code = 'AUTHENTICATION'
  readonly status = 401

  constructor(message: string) {
    super(message)
  }
}

export class AuthorizationError extends Error {
  static readonly code = 'AUTHORIZATION'
  readonly status = 403

  constructor(message: string) {
    super(message)
  }
}

export class NotFoundError extends ElysiaNotFoundError {
  static readonly code = 'NOT_FOUND'

  constructor() {
    super('Page Not Found')
  }
}
