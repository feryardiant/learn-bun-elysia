import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  spyOn,
  type Mock,
} from 'bun:test'
import Elysia, { t } from 'elysia'
import { logger, loggerPlugin } from '~/plugins/logger.plugin'

const app = new Elysia()
  .use(loggerPlugin)
  .get('/', () => 'Ok')
  .post('/', () => 'Ok')

describe('Logger Plugin', () => {
  let loggerSpy: Mock<(typeof logger)['debug']>

  beforeEach(() => {
    loggerSpy = spyOn(logger, 'debug')
  })

  afterEach(() => {
    loggerSpy.mockClear()
  })

  it('should log GET request', async () => {
    const response = await app.handle(
      new Request('http://localhost', { method: 'GET' }),
    )

    expect(loggerSpy).toHaveBeenCalled()

    const [obj, msg] = loggerSpy.mock.calls[0] || [{}, '']
    expect(obj).toContainKey('headers')
    expect(msg).toContain('Request received')
  })

  it('should log POST request with JSON payload', async () => {
    const response = await app.handle(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foo: 'bar' }),
      }),
    )

    expect(loggerSpy).toHaveBeenCalled()

    const [obj, msg] = loggerSpy.mock.calls[0] || [{}, '']

    expect(obj).toContainKey('headers')
    expect(obj).toContainKey('payload')
    expect(msg).toContain('Request received')
  })

  it('should log POST request with File payload', async () => {
    const body = new FormData()

    body.append('file', new File([''], 'test.txt'))

    const response = await app.handle(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body,
      }),
    )

    expect(loggerSpy).toHaveBeenCalled()

    const [obj, msg] = loggerSpy.mock.calls[0] || [{}, '']

    expect(obj).toContainKey('headers')
    expect(obj).not.toContainKey('payload')
    expect(msg).toContain('Request received')
  })
})
