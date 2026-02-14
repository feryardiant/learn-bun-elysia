import { getCurrentSpan, opentelemetry } from '@elysiajs/opentelemetry'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import {
  envDetector,
  hostDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { ENV } from '~/config'

const traceExporter = new OTLPTraceExporter({
  url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
})

const resource = resourceFromAttributes({
  'deployment.environment.name': ENV.NODE_ENV,
  [ATTR_SERVICE_NAME]: ENV.APP_NAME,
  [ATTR_SERVICE_VERSION]: ENV.APP_VERSION,
})

export const otelPlugin = opentelemetry({
  serviceName: ENV.APP_NAME,
  autoDetectResources: true,
  checkIfShouldTrace(req) {
    const url = new URL(req.url)
    const userAgent = req.headers.get('user-agent')

    if (userAgent) {
      // Don't trace request from health check
      return !(url.pathname === '/health' && userAgent.startsWith('Bun'))
    }

    return true
  },
  resource,
  resourceDetectors: [envDetector, hostDetector, processDetector],
  traceExporter,
}).derive({ as: 'global' }, function RequestInfo({ path, request }) {
  const sessionId = request.headers.get('x-session-id') || crypto.randomUUID()
  const currentSpan = getCurrentSpan()

  if (currentSpan) {
    currentSpan.setAttribute('session.id', sessionId)
  }

  request.headers.set('x-session-id', sessionId)

  return { sessionId }
})
