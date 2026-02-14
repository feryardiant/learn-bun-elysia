import { getCurrentSpan, opentelemetry } from '@elysiajs/opentelemetry'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import {
  envDetector,
  hostDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources'
import { logs, tracing } from '@opentelemetry/sdk-node'
import { ENV } from '~/config'

const headers = {
  'content-type': 'application/json',
}

const traceExporter = new OTLPTraceExporter({
  url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  headers,
})

const logExporter = new OTLPLogExporter({
  url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
  headers,
})

const resource = resourceFromAttributes({
  'deployment.environment.name': ENV.NODE_ENV,
  'deployment.name': ENV.APP_NAME,
  'service.name': ENV.APP_NAME,
  'service.version': ENV.APP_VERSION,
})

const logProvider = new logs.LoggerProvider({
  resource,
  processors: [new logs.BatchLogRecordProcessor(logExporter)],
})

export const otelPlugin = opentelemetry({
  serviceName: ENV.APP_NAME,
  autoDetectResources: true,
  checkIfShouldTrace: (req) => {
    return true
  },
  resource,
  resourceDetectors: [envDetector, hostDetector, processDetector],
  spanProcessors: [new tracing.BatchSpanProcessor(traceExporter)],
}).derive({ as: 'global' }, function requestInfo({ path, request }) {
  const sessionId = request.headers.get('x-session-id') || crypto.randomUUID()
  const currentSpan = getCurrentSpan()

  if (currentSpan) {
    currentSpan.setAttribute('session.id', sessionId)
  }

  request.headers.set('x-session-id', sessionId)

  return { sessionId }
})
