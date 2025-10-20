import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  spyOn,
  type Mock,
} from 'bun:test'
import { sql } from 'drizzle-orm'
import Elysia, { InternalServerError, t } from 'elysia'
import type { LogFn } from 'pino'
import { db } from '~/database'
import { errorHandlerPlugin } from '~/plugins/error-handler.plugin'
import { logger } from '~/plugins/logger.plugin'
import type { ValidationError } from '~/utils/response.util'

describe('Error Handler Plugin', () => {
  let logError: Mock<LogFn>
  let logFatal: Mock<LogFn>

  const errorHandlerApp = new Elysia()
    .use(errorHandlerPlugin)
    .get('/', () => {
      // Emulate error thrown from inside of request handler
      throw new Error('Test Error')
    })
    .post('/', () => ({}), {
      // Emulate error thrown from Elysia's built-in request validator
      body: t.Object({
        foo: t.Literal('bar'),
      }),
    })
    .patch('/', async () => {
      // Emulate error thrown from Drizzle ORM
      await db.execute(sql`SELECT * FROM not_exists`)
    })

  beforeEach(() => {
    logError = spyOn(logger, 'error').mockImplementation(() => {})
    logFatal = spyOn(logger, 'fatal').mockImplementation(() => {})
  })

  afterEach(() => {
    logError.mockRestore()
    logFatal.mockRestore()
  })

  it('should log error whenever an error thrown from handler', async () => {
    const response = await errorHandlerApp.handle(
      new Request('http://localhost'),
    )

    expect(logError).toHaveBeenCalled()
    expect(response.status).toBe(500)

    const body = (await response.json()) as InternalServerError
    const [obj, msg] = logError.mock.calls[0] || [{}]

    expect(msg).toBe(body.message)

    expect(obj).toContainKey('headers')
    expect(obj).toContainKey('error')
    expect(obj).toContainKey('endpoint')
  })

  it("should log error whenever there's a validation error thrown", async () => {
    const response = await errorHandlerApp.handle(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foo: ['baz'] }),
      }),
    )

    expect(logError).toHaveBeenCalled()
    expect(response.status).toBe(422)

    const body = (await response.json()) as ValidationError
    const [obj, msg] = logError.mock.calls[0] || [{}]

    expect(body.errors).toBeArrayOfSize(1)
    expect(msg).toBe(body.message)

    expect(obj).toContainKey('headers')
    expect(obj).toContainKey('error')
    expect(obj).toContainKey('endpoint')
  })

  it("should log fatal whenever there's a drizzle error thrown", async () => {
    const response = await errorHandlerApp.handle(
      new Request('http://localhost', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )

    expect(logFatal).toHaveBeenCalled()
    expect(response.status).toBe(500)

    const body = (await response.json()) as InternalServerError
    const [obj, msg] = logFatal.mock.calls[0] || [{}]

    expect(body.message).toBe('Something went wrong in our end')
    expect(msg).toContain('ERR_POSTGRES_SERVER_ERROR')

    expect(obj).not.toContainKey('headers')
    expect(obj).toContainKey('error')
    expect(obj).toContainKey('endpoint')
    expect(obj).toContainKey('query')
    expect(obj).toContainKey('params')
  })
})
