import {
  afterEach,
  beforeEach,
  expect,
  it,
  mock,
  spyOn,
  type Mock,
} from 'bun:test'
import * as elysiaOtel from '@elysiajs/opentelemetry'
import { INVALID_SPAN_CONTEXT, trace, type Span } from '@opentelemetry/api'
import Elysia from 'elysia'
import { logger } from '~/plugins/logger.plugin'
import { otelPlugin, updateSpanName } from '~/plugins/otel.plugin'

let logInfo: Mock<typeof logger.info>
let logError: Mock<typeof logger.error>
let handler: Mock<(ctx: { sessionId?: string }) => void>
let currentSpan: Mock<typeof elysiaOtel.getCurrentSpan>
let spanUpdateName: Mock<Span['updateName']>
let otelApp: typeof otelPlugin

const APP_URL = 'http://localhost'

beforeEach(async () => {
  logInfo = spyOn(logger, 'info').mockImplementation(() => {})
  logError = spyOn(logger, 'error').mockImplementation(() => {})

  const invalidSpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT)

  spanUpdateName = spyOn(invalidSpan, 'updateName')
  currentSpan = spyOn(elysiaOtel, 'getCurrentSpan').mockImplementation(
    () => invalidSpan,
  )

  handler = mock((ctx = {}) => {})
  otelApp = new Elysia().use(otelPlugin)

  otelApp.get('', handler).get('/health', handler)
})

afterEach(() => {
  logInfo.mockRestore()
  logError.mockRestore()

  handler.mockRestore()
  currentSpan.mockRestore()
  spanUpdateName.mockRestore()
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

  expect(currentSpan).toBeCalled()
})

it('should update span name with request instance', async () => {
  updateSpanName(new Request(APP_URL))

  expect(spanUpdateName).toBeCalled()

  const [req] = spanUpdateName.mock.calls[0] || ''

  expect(req).toEqual('GET /')
})

it('should update span name with string', async () => {
  updateSpanName('New span name')

  expect(spanUpdateName).toBeCalled()

  const [req] = spanUpdateName.mock.calls[0] || ''

  expect(req).toEqual('New span name')
})
