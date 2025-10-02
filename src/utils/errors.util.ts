export class AuthenticationError extends Error {
  static readonly code = 'AUTHENTICATION_ERROR'
  readonly status = 401

  constructor(message: string) {
    super(message)
  }
}

export class AuthorizationError extends Error {
  static readonly code = 'AUTHORIZATION_ERROR'
  readonly status = 403

  constructor(message: string) {
    super(message)
  }
}
