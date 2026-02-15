import {
  afterEach,
  beforeEach,
  expect,
  it,
  mock,
  spyOn,
  type Mock,
} from 'bun:test'
import { getCurrentSpan } from '@elysiajs/opentelemetry'
import Elysia from 'elysia'
import { logger } from '~/plugins/logger.plugin'
import { otelPlugin } from '~/plugins/otel.plugin'

let logInfo: Mock<typeof logger.info>
let logError: Mock<typeof logger.error>
let currentSpan: Mock<typeof getCurrentSpan>

const APP_URL = 'http://localhost'

const handler = mock((ctx = {}) => 'Auth')
const otelApp = new Elysia()
  .use(otelPlugin)
  .get('', handler)
  .get('/health', handler)

beforeEach(async () => {
  logInfo = spyOn(logger, 'info').mockImplementation(() => {})
  logError = spyOn(logger, 'error').mockImplementation(() => {})

  currentSpan = mock(getCurrentSpan)
})

afterEach(() => {
  logInfo.mockRestore()
  logError.mockRestore()

  currentSpan.mockRestore()
})

it('should generate sessionId on each request', async () => {
  await otelApp.handle(new Request(APP_URL))

  expect(handler).toBeCalled()

  const [ctx] = handler.mock.calls[0] || [{}]

  expect(ctx.sessionId).toBeDefined()
})

it('should not trace health endpoint', async () => {
  await otelApp.handle(
    new Request(`${APP_URL}/health`, {
      headers: { 'user-agent': 'Bun/v1.3.3' },
    }),
  )

  expect(handler).toBeCalled()

  const [ctx] = handler.mock.calls[0] || [{}]

  expect(ctx.sessionId).toBeDefined()
})
