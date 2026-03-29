import {
  afterEach,
  beforeEach,
  expect,
  it,
  mock,
  spyOn,
  type Mock,
} from 'bun:test'
import { INVALID_SPAN_CONTEXT, trace, type Tracer } from '@opentelemetry/api'
import { recordableClass } from '~/utils/otel.util'

@recordableClass()
class DummyRepository {
  foo() {
    return 'bar'
  }
}

let tracer: Mock<typeof trace.getTracer>
let startSpan: Mock<Tracer['startSpan']>

beforeEach(async () => {
  const dummySpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT)

  startSpan = mock(() => dummySpan)
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
})

it('should record method invocations', async () => {
  const dummy = new DummyRepository()

  dummy.foo()

  expect(tracer).toBeCalled()
  expect(startSpan).toBeCalled()

  const [name] = startSpan.mock.calls[0] || ['', () => {}]

  expect(name).toBe('DummyRepository.foo')
})
