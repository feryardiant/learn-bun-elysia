import { getCurrentSpan, opentelemetry } from '@elysiajs/opentelemetry'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'
import {
  envDetector,
  hostDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { ENV } from '~/config'
import { logger } from './logger.plugin'
import { ignorePathnames } from '~/utils/request.util'

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

export const otelPlugin = opentelemetry({
  serviceName: ENV.APP_NAME,
  autoDetectResources: true,
  instrumentations: [
    new PinoInstrumentation({
      logHook(span, record) {
        console.log('hook', record)
      },
    }),
  ],
  logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
  resource,
  resourceDetectors: [envDetector, hostDetector, processDetector],
  traceExporter,
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
