import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
  type Mock,
} from 'bun:test'
import { t } from 'elysia'
import { errorHandlerPlugin } from '~/plugins/error-handler.plugin'
import { logger } from '~/plugins/logger.plugin'
import type { ValidationError } from '~/utils/api-response.util'

describe('Error Handler Plugin', () => {
  let loggerSpy: Mock<typeof logger.error>
  let errorHandlerApp: typeof errorHandlerPlugin

  beforeEach(() => {
    loggerSpy = spyOn(logger, 'error')
    errorHandlerApp = errorHandlerPlugin
      .get('/', () => {
        // Emulate error thrown from inside of request handler
        throw new Error('Test Error')
      })
      .post('/', () => ({}), {
        // Emulate error thrown from Elysia's built-in request validator
        body: t.Object({
          foo: t.Literal('bar')
        }),
      })

    mock.module('./logger.plugin', () => ({
      error: loggerSpy,
    }))
  })

  afterEach(() => {
    loggerSpy.mockReset()
  })

  afterAll(() => {
    mock.restore()
  })

  it('should log error whenever an error thrown from handler', async () => {
    const respose = await errorHandlerApp.handle(
      new Request('http://localhost'),
    )

    expect(respose.status).toBe(500)
    expect(loggerSpy).toHaveBeenCalled()

    const [obj, msg] = loggerSpy.mock.calls[0] || [{}]

    expect(msg).toBe('UNKNOWN')
    expect(obj).toContainKey('error')
    expect(obj).toContainKey('headers')
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

    expect(loggerSpy).toHaveBeenCalled()
    expect(response.status).toBe(422)

    const body = (await response.json()) as ValidationError

    expect(body.errors).toBeArrayOfSize(1)
    expect(body.message).toContain('Invalid request,')

    const [obj, msg] = loggerSpy.mock.calls[0] || [{}]

    expect(msg).toBe(body.code)
    expect(obj).toContainKey('error')
    expect(obj).toContainKey('headers')
    expect(obj).toContainKey('endpoint')
  })
})
