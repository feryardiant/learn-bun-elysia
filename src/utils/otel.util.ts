import {
  context,
  SpanKind,
  SpanStatusCode,
  trace,
  type Attributes,
  type Span,
  type Tracer,
} from '@opentelemetry/api'
import type { PgBasePreparedQuery, PgSession } from 'drizzle-orm/pg-core'
import { ENV } from '~/config'
import type { AppDatabase } from '~/plugins/database.plugin'

/**
 * Decorator to mark a class as recordable for OpenTelemetry tracing.
 */
export function recordableClass(): ClassDecorator {
  return (obj: Function) => {
    const { name: className, prototype } = obj

    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      const spanName = `${className}.${methodName}`
      const instrumentFlag = `__otelPatched_${spanName}`

      // Skip the constructor or already instrumented methods
      if (methodName === 'constructor' || prototype[instrumentFlag]) continue

      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName)

      // Check if it's actually a function/method
      if (typeof descriptor?.value !== 'function') continue

      const originalMethod = descriptor.value as Function
      const attributes: Attributes = {
        'repository.name': className,
        'repository.operation': methodName,
      }

      // Mark the method as instrumented
      prototype[instrumentFlag] = true

      // Overwrite the method on the prototype
      prototype[methodName] = function (...args: unknown[]) {
        const tracer = trace.getTracer(ENV.APP_NAME)

        // Patch database instance when this decorator applied in repository class
        this.db && wrapDatabaseSession(this.db)

        return record(tracer, spanName, attributes, () =>
          originalMethod.apply(this, args),
        )
      }
    }
  }
}

function wrapDatabaseSession(db: AppDatabase) {
  // @ts-ignore private property
  const session = db.session as PgSession & {
    __otelPatched_session_prepareRelationalQuery?: boolean
  }

  if (!session.__otelPatched_session_prepareRelationalQuery) {
    const originalRelationalQuery = session.prepareRelationalQuery

    session.__otelPatched_session_prepareRelationalQuery = true
    session.prepareRelationalQuery = function (...args) {
      return wrapPreparedQuery(originalRelationalQuery.apply(this, args))
    }
  }
}

interface PatchedPrepareQuery extends PgBasePreparedQuery {
  __otelPatched_preparedQuery_execute?: boolean
}

function wrapPreparedQuery<T extends PatchedPrepareQuery>(prepared: T) {
  if (prepared.__otelPatched_preparedQuery_execute) return prepared

  const originalExecute = prepared.execute

  prepared.__otelPatched_preparedQuery_execute = true
  prepared.execute = function (...args) {
    const query = prepared.getQuery()
    const [operation] = query.sql.split(' ')

    const tracer = trace.getTracer(ENV.APP_NAME)
    const attributes: Attributes = {
      'db.operation': operation?.toUpperCase(),
      'db.statement': query.sql,
    }

    for (const p in query.params) {
      attributes[`db.params.$${Number(p) + 1}`] = query.params[p] as string
    }

    return record(tracer, `drizzle.${operation}`, attributes, () =>
      originalExecute.apply(this, args),
    )
  }

  return prepared
}

/**
 * Records a span for the given function, automatically naming it based on the class and method.
 *
 * @param tracer Tracer to use for recording the span.
 * @param name Span name.
 * @param attrs Span attributes.
 * @param fn Callback.
 * @returns Callback return value.
 */
export function record<F extends () => unknown>(
  tracer: Tracer,
  name: string,
  attrs: Attributes,
  fn: F,
): ReturnType<F> {
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
