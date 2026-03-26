import { getCurrentSpan, opentelemetry, record } from '@elysiajs/opentelemetry'
import type { SpanOptions } from '@opentelemetry/api'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'
import {
  envDetector,
  hostDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { ENV } from '~/config'
import { ignorePathnames } from '~/utils/request.util'
import { logger } from './logger.plugin'

const traceExporter = new OTLPTraceExporter({
  url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
})

const logExporter = new OTLPLogExporter({
  url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
})

const resource = resourceFromAttributes({
  'deployment.environment.name': ENV.NODE_ENV,
  [ATTR_SERVICE_NAME]: ENV.APP_NAME,
  [ATTR_SERVICE_VERSION]: ENV.APP_VERSION,
})

export const spanProcessor = new BatchSpanProcessor(traceExporter)

export const logRecordProcessor = new BatchLogRecordProcessor(logExporter)

export const otelPlugin = opentelemetry({
  serviceName: ENV.APP_NAME,
  autoDetectResources: true,
  logRecordProcessors: [logRecordProcessor],
  spanProcessors: [spanProcessor],
  resourceDetectors: [envDetector, hostDetector, processDetector],
  resource,
  instrumentations: [new PinoInstrumentation()],
}).derive({ as: 'global' }, ({ body, path, request }) => {
  const sessionId = request.headers.get('x-session-id') || crypto.randomUUID()
  const { pathname, search } = new URL(request.url)

  updateSpanName('RequestInfo', { 'session.id': sessionId })

  request.headers.set('x-session-id', sessionId)

  if (!ignorePathnames.includes(pathname)) {
    logger.debug({ body }, `[${request.method}] ${pathname}${search}`)
  }

  return { sessionId }
})

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
      if (typeof descriptor?.value === 'function') {
        const originalMethod = descriptor.value as Function

        // Overwrite the method on the prototype
        prototype[methodName] = function (...args: unknown[]) {
          const options: SpanOptions = {
            attributes: {
              className,
              methodName,
            },
          }

          return record(`${className}.${methodName}()`, options, () =>
            originalMethod.apply(this, args),
          )
        }
      }
    }
  }
}

export function updateSpanName(
  req: Request | string,
  attrs: Record<string, string> = {},
) {
  const span = getCurrentSpan()

  if (!span) return

  if (req instanceof Request) {
    const url = new URL(req.url, ENV.APP_URL)

    req = `${req.method} ${url.pathname}`
  }

  span.updateName(req)

  Object.entries(attrs).forEach(([key, value]) => {
    span.setAttribute(key, value)
  })
}
