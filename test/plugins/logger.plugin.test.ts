import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  spyOn,
  type Mock,
} from 'bun:test'
import { logger, loggerPlugin } from '~/plugins/logger.plugin'

describe('Logger Plugin', () => {
  let logDebug: Mock<(typeof logger)['debug']>

  let loggerApp: typeof loggerPlugin

  beforeEach(() => {
    logDebug = spyOn(logger, 'debug').mockImplementation(() => {})

    loggerApp = loggerPlugin.get('/', () => 'Ok').post('/', () => 'Ok')
  })

  afterEach(() => {
    logDebug.mockRestore()
  })

  it('should log GET request', async () => {
    const response = await loggerApp.handle(
      new Request('http://localhost', { method: 'GET' }),
    )

    expect(logDebug).toHaveBeenCalled()

    const [obj, msg] = logDebug.mock.calls[0] || [{}, '']
    expect(obj).toContainKey('headers')
    expect(msg).toContain('Request received')
  })

  it('should log POST request with JSON payload', async () => {
    const response = await loggerApp.handle(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ foo: 'bar' }),
      }),
    )

    expect(logDebug).toHaveBeenCalled()

    const [obj, msg] = logDebug.mock.calls[0] || [{}, '']

    expect(obj).toContainKey('headers')
    expect(obj).toContainKey('payload')
    expect(msg).toContain('Request received')
  })

  it('should log POST request with File payload', async () => {
    const body = new FormData()
    const file = new File([''], 'test.txt', { type: 'plain/text' })

    body.append('file', file)

    const response = await loggerApp.handle(
      new Request('http://localhost', {
        method: 'POST',
        body,
      }),
    )

    expect(logDebug).toHaveBeenCalled()

    const [obj, msg] = logDebug.mock.calls[0] || [{}, '']

    expect(obj).toContainKey('headers')
    expect(obj).toContainKey('payload')
    expect(msg).toContain('Request received')
  })
})
