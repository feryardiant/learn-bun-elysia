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
let handler: Mock<(ctx: { sessionId?: string }) => void>

const APP_URL = 'http://localhost'
const otelApp = new Elysia().use(otelPlugin)

beforeEach(async () => {
  logInfo = spyOn(logger, 'info').mockImplementation(() => {})
  logError = spyOn(logger, 'error').mockImplementation(() => {})

  handler = mock((ctx = {}) => {})
  currentSpan = mock(getCurrentSpan)

  otelApp.get('', handler).get('/health', handler)
})

afterEach(() => {
  logInfo.mockRestore()
  logError.mockRestore()

  handler.mockRestore()
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
