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
import { otelPlugin, spanProcessor } from '~/plugins/otel.plugin'
import {
  marshalContext,
  type MarshaledSpanContext,
  type SpanProcessEnd,
  type SpanProcessStart,
} from 'test/fixtures'

let logDebug: Mock<typeof logger.debug>

let otelRecord: Mock<typeof elysiaOtel.record>
let currentSpan: Mock<typeof elysiaOtel.getCurrentSpan>
let spanStart: SpanProcessStart
let spanEnd: SpanProcessEnd

let handler: Mock<(ctx: { sessionId?: string }) => void>
let otelApp: typeof otelPlugin

const APP_URL = 'http://localhost'

type Obj = Record<string, unknown>

beforeEach(async () => {
  logDebug = spyOn(logger, 'debug').mockImplementation(() => {})

  const invalidSpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT)

  otelRecord = spyOn(elysiaOtel, 'record').mockImplementation(() => {})
  spanStart = spyOn(spanProcessor, 'onStart')
  spanEnd = spyOn(spanProcessor, 'onEnd')
  currentSpan = spyOn(elysiaOtel, 'getCurrentSpan')

  handler = mock((ctx = {}) => {})
  otelApp = new Elysia().use(otelPlugin)

  otelApp
    .get('', handler)
    .get('/health', handler)
    .get('/other', handler)
    .post('/other', handler)
})

afterEach(() => {
  logDebug.mockRestore()

  otelRecord.mockRestore()
  spanStart.mockRestore()
  spanEnd.mockRestore()
  currentSpan.mockRestore()

  handler.mockRestore()
})

it('should be able to catch span start and end', async () => {
  const response = await otelApp.handle(new Request(APP_URL))

  expect(spanStart).toBeCalledTimes(4)
  expect(spanEnd).toBeCalledTimes(3)

  const ctxs = marshalContext(spanStart)
  const span = ctxs.at(0) as MarshaledSpanContext

  expect(response.headers.get('x-trace-id')).toEqual(span.traceId)
})

it('should generate sessionId without the request', async () => {
  await otelApp.handle(new Request(APP_URL))

  expect(handler).toBeCalled()
  expect(logDebug).not.toBeCalled()

  const [ctx] = handler.mock.calls[0] || [{}]

  expect(ctx.sessionId).toBeDefined()
})

it('should not trace and log health endpoint', async () => {
  await otelApp.handle(
    new Request(`${APP_URL}/health`, {
      headers: { 'user-agent': 'Bun/v1.3.3' },
    }),
  )

  expect(currentSpan).toBeCalled()
  expect(logDebug).not.toBeCalled()
})

it('should log other GET endpoint without body', async () => {
  await otelApp.handle(new Request(`${APP_URL}/other`))

  expect(logDebug).toBeCalled()

  const [obj, msg] = logDebug.mock.calls[0] as [Obj, string]

  expect(obj).toContainKey('body')
  expect(obj.body).toBeUndefined()
  expect(msg).toEqual('[GET] /other')
})

it('should log other POST endpoint with body', async () => {
  await otelApp.handle(
    new Request(`${APP_URL}/other`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    }),
  )

  expect(logDebug).toBeCalled()

  const [obj, msg] = logDebug.mock.calls[0] as [Obj, string]

  expect(obj).toContainKey('body')
  expect(obj.body).toBeDefined()
  expect(msg).toEqual('[POST] /other')
})
