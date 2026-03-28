import { Elysia } from 'elysia'

import { ENV } from './config'
import { errorHandlerPlugin } from './plugins/error-handler.plugin'
import { openapiPlugin } from './plugins/openapi.plugin'
import { otelPlugin } from './plugins/otel.plugin'
import { staticPlugin } from './plugins/static.plugin'
import { authRoute } from './routes/auth.route'
import { baseRoute } from './routes/base.route'
import { v1Route } from './routes/v1.route'

export const app = new Elysia({ prefix: ENV.BASE_PATH })
  .use(errorHandlerPlugin)
  .use(otelPlugin)
  .use(staticPlugin)
  .use(openapiPlugin)
  .use(authRoute)
  .use(baseRoute)
  .use(v1Route)
