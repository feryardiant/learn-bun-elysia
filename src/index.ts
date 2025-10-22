import { Elysia } from 'elysia'

import { ENV } from './config'
import { errorHandlerPlugin } from './plugins/error-handler.plugin'
import { loggerPlugin } from './plugins/logger.plugin'
import { openapiPlugin, SWAGGER_PATH } from './plugins/openapi.plugin'
import { staticPlugin } from './plugins/static.plugin'
import { authRoute } from './routes/auth.route'
import { baseRoute } from './routes/base.route'
import { v1Route } from './routes/v1.route'

const app = new Elysia({ prefix: ENV.BASE_PATH })
  .use(errorHandlerPlugin)
  .use(loggerPlugin)
  .use(staticPlugin)
  .use(openapiPlugin)
  .use(authRoute)
  .use(baseRoute)
  .use(v1Route)

app.listen({ port: ENV.PORT, hostname: ENV.HOST }, ({ url }) => {
  const ACCESS_URL = !url.href.includes(ENV.APP_URL)
    ? `${url.href} -> ${ENV.APP_URL}`
    : ENV.APP_URL

  console.info(
    ` 🦊 Elysia is running at ${ACCESS_URL}\n`,
    `Access Swagger UI at ${ENV.APP_URL}${SWAGGER_PATH}\n`,
  )
})
