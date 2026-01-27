import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '10s', target: 50 }, // Ramp up to 50 users
    { duration: '30s', target: 50 }, // Stay at 50 users (steady state)
    { duration: '10s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
}

export default function () {
  /**
   * @link https://grafana.com/docs/k6/latest/using-k6/environment-variables/
   */
  const res = http.get(__ENV.APP_URL || 'http://localhost:3010')

  check(res, {
    'status is 200': (r) => r.status === 200,
  })
}
