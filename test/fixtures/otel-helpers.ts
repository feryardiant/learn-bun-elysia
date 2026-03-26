import type { Attributes, SpanContext } from '@opentelemetry/api'
import { type Mock } from 'bun:test'
import { spanProcessor } from '~/plugins/otel.plugin'

export type SpanProcessStart = Mock<typeof spanProcessor.onStart>
export type SpanProcessEnd = Mock<typeof spanProcessor.onEnd>

export interface MarshaledSpanContext extends SpanContext {
  name: string
  parent?: SpanContext
  resource: Attributes
  attributes: Attributes
}

export function marshalContext({ mock }: SpanProcessStart | SpanProcessEnd) {
  return mock.calls.reduce((out, [span]) => {
    out.push({
      name: span.name,
      ...span.spanContext(),
      parent: span.parentSpanContext,
      resource: span.resource.attributes,
      attributes: span.attributes,
    })

    return out
  }, [] as MarshaledSpanContext[])
}
