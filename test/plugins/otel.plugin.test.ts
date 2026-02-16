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

let logDebug: Mock<typeof logger.debug>

let handler: Mock<(ctx: { sessionId?: string }) => void>
let currentSpan: Mock<typeof elysiaOtel.getCurrentSpan>
let spanUpdateName: Mock<Span['updateName']>
let otelApp: typeof otelPlugin

const APP_URL = 'http://localhost'

type Obj = Record<string, unknown>

beforeEach(async () => {
  logDebug = spyOn(logger, 'debug').mockImplementation(() => {})

  const invalidSpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT)

  spanUpdateName = spyOn(invalidSpan, 'updateName')
  currentSpan = spyOn(elysiaOtel, 'getCurrentSpan').mockImplementation(
    () => invalidSpan,
  )

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

  handler.mockRestore()
  currentSpan.mockRestore()
  spanUpdateName.mockRestore()
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
