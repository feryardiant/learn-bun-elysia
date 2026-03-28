import pino from 'pino'
import pinoPretty from 'pino-pretty'
import { ENV } from '~/config'

const stream = pinoPretty({
  colorize: true,
  translateTime: 'HH:MM:ss Z',
  ignore: 'pid,hostname',
})

export const logger = pino(
  {
    name: ENV.APP_NAME,
    level: ENV.LOG_LEVEL,
  },
  stream,
)
