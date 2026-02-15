import { t } from 'elysia'

export const otelConfig = t.Object({
  OTEL_EXPORTER_OTLP_ENDPOINT: t.String({
    default: 'http://localhost:4318',
    format: 'uri',
  }),
})
