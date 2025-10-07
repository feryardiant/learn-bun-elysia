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
import { errorHandlerPlugin } from '~/plugins/error-handler.plugin'
import { logger } from '~/plugins/logger.plugin'

describe('Error Handler Plugin', () => {
  let loggerSpy: Mock<typeof logger.error>
  let errorHandlerApp: typeof errorHandlerPlugin

  beforeEach(() => {
    loggerSpy = spyOn(logger, 'error')
    errorHandlerApp = errorHandlerPlugin.get('/', () => {
      throw new Error('Test Error')
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

  it('should log error', async () => {
    const respose = await errorHandlerApp.handle(
      new Request('http://localhost'),
    )

    expect(loggerSpy).toHaveBeenCalled()
    expect(respose.status).toBe(500)
  })
})
