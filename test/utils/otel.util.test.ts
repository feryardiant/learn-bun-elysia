import {
  afterEach,
  beforeEach,
  expect,
  it,
  mock,
  spyOn,
  type Mock,
} from 'bun:test'
import {
  INVALID_SPAN_CONTEXT,
  trace,
  type Span,
  type Tracer,
} from '@opentelemetry/api'
import { recordableClass } from '~/utils/otel.util'
import { ENV } from '~/config'

let tracer: Mock<typeof trace.getTracer>
let startSpan: Mock<Tracer['startSpan']>
let spanEnd: Mock<Span['end']>
let spanRecordException: Mock<Span['recordException']>

const dummyError = Error('Something when wrong')

@recordableClass()
class DummyRepository {
  foo() {
    return 'bar'
  }
  errorFoo() {
    throw dummyError
  }
  async bar() {
    return 'foo'
  }
  async errorBar() {
    throw dummyError
  }
}

const dummy = new DummyRepository()

function assertTraceName(name: string) {
  expect(tracer).toBeCalled()

  const [traceName] = tracer.mock.calls[0] || ['']
  expect(traceName).toEqual(name)
}

function assertSpanName(name: string) {
  expect(startSpan).toBeCalled()

  const [spanName] = startSpan.mock.calls[0] || ['']
  expect(spanName).toEqual(name)
}

beforeEach(async () => {
  const dummySpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT)

  startSpan = mock(() => {
    spanEnd = spyOn(dummySpan, 'end')
    spanRecordException = spyOn(dummySpan, 'recordException')

    return dummySpan
  })

  tracer = spyOn(trace, 'getTracer').mockImplementation(
    (name): Tracer => ({
      startActiveSpan() {},
      startSpan,
    }),
  )
})

afterEach(() => {
  tracer.mockRestore()
  startSpan.mockRestore()
  spanEnd.mockRestore()
  spanRecordException.mockRestore()
})

it('should record method invocations', async () => {
  expect(dummy.foo()).toEqual('bar')

  assertTraceName(ENV.APP_NAME)
  assertSpanName('DummyRepository.foo')

  expect(spanEnd).toBeCalled()
  expect(spanRecordException).not.toBeCalled()
})

it('should record thrown exception', async () => {
  expect(() => dummy.errorFoo()).toThrowError(dummyError)

  assertTraceName(ENV.APP_NAME)
  assertSpanName('DummyRepository.errorFoo')

  expect(spanEnd).toBeCalled()
  expect(spanRecordException).toBeCalled()
})

it('should record async method invocations', async () => {
  expect(await dummy.bar()).toEqual('foo')

  assertTraceName(ENV.APP_NAME)
  assertSpanName('DummyRepository.bar')

  expect(spanEnd).toBeCalled()
  expect(spanRecordException).not.toBeCalled()
})

it('should record async thrown exception', async () => {
  expect(() => dummy.errorBar()).toThrowError(dummyError)

  assertTraceName(ENV.APP_NAME)
  assertSpanName('DummyRepository.errorBar')

  expect(spanEnd).toBeCalled()
  expect(spanRecordException).toBeCalled()
})
