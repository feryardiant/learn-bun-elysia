import {
  context,
  SpanKind,
  SpanStatusCode,
  trace,
  type Attributes,
  type Span,
} from '@opentelemetry/api'
import { ATTR_OTEL_SCOPE_VERSION } from '@opentelemetry/semantic-conventions'
import { ENV } from '~/config'

const instrumented: Record<string, boolean> = {}

/**
 * Decorator to mark a class as recordable for OpenTelemetry tracing.
 */
export function recordableClass(): ClassDecorator {
  return (obj: Function) => {
    const { name: className, prototype } = obj

    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      const spanName = `${className}.${methodName}`

      // Skip the constructor or already instrumented methods
      if (methodName === 'constructor' || instrumented[spanName]) continue

      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName)

      // Check if it's actually a function/method
      if (typeof descriptor?.value !== 'function') continue

      const originalMethod = descriptor.value as Function
      const attributes: Attributes = {
        [ATTR_OTEL_SCOPE_VERSION]: ENV.APP_VERSION,
        'repository.name': className,
        'repository.operation': methodName,
      }

      // Overwrite the method on the prototype
      prototype[methodName] = function (...args: unknown[]) {
        return record(spanName, attributes, () =>
          originalMethod.apply(this, args),
        )
      }

      // Mark the method as instrumented
      instrumented[spanName] = true
    }
  }
}

/**
 * Records a span for the given function, automatically naming it based on the class and method.
 *
 * @param name Span name.
 * @param attrs Span attributes.
 * @param fn Callback.
 * @returns Callback return value.
 */
export function record<F extends () => unknown>(
  name: string,
  attrs: Attributes,
  fn: F,
): ReturnType<F> {
  const tracer = trace.getTracer(ENV.APP_NAME)
  const parentContext = context.active()
  const span = tracer.startSpan(
    name,
    {
      attributes: attrs,
      kind: SpanKind.CLIENT,
    },
    parentContext,
  )

  const activeContext = trace.setSpan(parentContext, span)

  // @ts-expect-error
  return context.with(activeContext, () => {
    try {
      const result = fn()

      if (result instanceof Promise) {
        return Promise.resolve(result).then(
          (value) => {
            finalizeSpan(span)
            return value
          },
          (error) => {
            finalizeSpan(span, error)
            throw error
          },
        )
      }

      finalizeSpan(span)

      return result
    } catch (error) {
      finalizeSpan(span, error)

      throw error
    }
  })
}

/**
 * Finalizes the span, setting the status and recording any error.
 *
 * Credit: https://github.com/kubiks-inc/otel/blob/595b6ee/packages/otel-drizzle/src/index.ts#L131-L143
 *
 * @param span The span to finalize.
 * @param error The error to record, if any.
 */
function finalizeSpan(span: Span, error?: Error | unknown) {
  if (error) {
    const err = error instanceof Error ? error : new Error(String(error))

    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
    span.recordException(err)
  } else {
    span.setStatus({ code: SpanStatusCode.OK })
  }

  span.end()
}
