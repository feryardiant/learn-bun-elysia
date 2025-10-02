import { Elysia } from 'elysia'

import { ENV } from './config'
import { SWAGGER_PATH, openapiPlugin } from './plugins/openapi.plugin'
import { errorHandlerPlugin } from './plugins/error-handler.plugin'
import { baseRoute } from './routes/base.route'
import { v1ApiRoute } from './routes/v1-api.route'

const app = new Elysia({ prefix: ENV.BASE_PATH })
  .use(errorHandlerPlugin)
  .use(openapiPlugin)
  .use(baseRoute)
  .use(v1ApiRoute)

app.listen({ port: ENV.PORT, hostname: ENV.HOST }, ({ url }) => {
  const ACCESS_URL = !url.href.includes(ENV.APP_URL)
    ? `${url.href} -> ${ENV.APP_URL}`
    : ENV.APP_URL

  console.log(`
    🦊 Elysia is running at ${ACCESS_URL}
    Access Swagger UI at ${ENV.APP_URL}${SWAGGER_PATH}
  `)
})
