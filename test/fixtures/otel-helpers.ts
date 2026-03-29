import type { Attributes, SpanContext } from '@opentelemetry/api'
import { type Mock } from 'bun:test'
import { spanProcessor } from '~/plugins/otel.plugin'

export type SpanProcessStart = Mock<typeof spanProcessor.onStart>
export type SpanProcessEnd = Mock<typeof spanProcessor.onEnd>

export interface MarshaledSpanContext extends SpanContext {
  name: string
  traceId: string
  spanId: string
  parent?: SpanContext
  attributes: Attributes
}

export function marshalContext({ mock }: SpanProcessStart | SpanProcessEnd) {
  return mock.calls.reduce((out, [span]) => {
    const attributes = {
      ...span.attributes,
      ...span.resource.attributes,
    }

    out.push({
      name: span.name,
      ...span.spanContext(),
      parent: span.parentSpanContext,
      attributes: Object.keys(attributes)
        .sort()
        .reduce((obj, key) => {
          obj[key] = attributes[key]
          return obj
        }, {} as Attributes),
    })

    return out
  }, [] as MarshaledSpanContext[])
}
