import { getCurrentSpan, opentelemetry } from '@elysiajs/opentelemetry'
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
}).derive({ as: 'global' }, function SessionInfo({ body, request, set }) {
  const sessionId = request.headers.get('x-session-id') || crypto.randomUUID()
  const { pathname, search } = new URL(request.url)
  const span = getCurrentSpan()

  if (span) {
    span.setAttribute('session.id', sessionId)

    set.headers['x-trace-id'] = span.spanContext().traceId
  }

  request.headers.set('x-session-id', sessionId)

  if (!ignorePathnames.includes(pathname)) {
    logger.debug({ body }, `[${request.method}] ${pathname}${search}`)
  }

  return { sessionId }
})
