import {
  SpanKind,
  SpanStatusCode,
  trace,
  type Attributes,
  type Span,
} from '@opentelemetry/api'
import { ATTR_OTEL_SCOPE_VERSION } from '@opentelemetry/semantic-conventions'
import { ENV } from '~/config'

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

/**
 * @kind decorator
 */
export function recordableClass() {
  return (obj: Function) => {
    const className = obj.name
    const prototype = obj.prototype

    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      // Skip the constructor
      if (methodName === 'constructor') continue

      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName)

      // Check if it's actually a function/method
      if (typeof descriptor?.value !== 'function') continue

      const originalMethod = descriptor.value as Function

      // Overwrite the method on the prototype
      prototype[methodName] = function (...args: unknown[]) {
        const tracer = trace.getTracer(ENV.APP_NAME)

        const attributes: Attributes = {
          [ATTR_OTEL_SCOPE_VERSION]: ENV.APP_VERSION,
          'repository.name': className,
          'repository.operation': methodName,
        }

        const span = tracer.startSpan(`${className}.${methodName}`, {
          attributes,
          kind: SpanKind.CLIENT,
        })

        try {
          const result = originalMethod.apply(this, args)

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
      }
    }
  }
}
