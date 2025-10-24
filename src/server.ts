import { Command } from 'commander'
import { description, version } from 'package.json'
import { ENV } from './config'
import { SWAGGER_PATH } from './plugins/openapi.plugin'
import { app } from './app'

const program = new Command(ENV.APP_NAME)

program.version(ENV.APP_VERSION || version).description(description)

program.action(() => {
  app.listen({ port: ENV.PORT, hostname: ENV.HOST }, ({ url }) => {
    const ACCESS_URL = !url.href.includes(ENV.APP_URL)
      ? `${url.href} -> ${ENV.APP_URL}`
      : ENV.APP_URL

    console.info(
      ` 🦊 Elysia is running at ${ACCESS_URL}\n`,
      `Access Swagger UI at ${ENV.APP_URL}${SWAGGER_PATH}\n`,
    )
  })
})

program.parseAsync(process.argv)
