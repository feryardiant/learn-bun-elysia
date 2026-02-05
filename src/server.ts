import { Command } from 'commander'
import { description, version } from 'package.json'
import { ENV } from './config'
import { SWAGGER_PATH } from './plugins/openapi.plugin'
import { app } from './app'
import { migrate } from './plugins/database.plugin'

const program = new Command(ENV.APP_NAME)

program.version(ENV.APP_VERSION || version).description(description)

program
  .command('migrate')
  .description('Run database migration')
  .action(async () => {
    const migrated = await migrate()

    process.exit(migrated ? 0 : 1)
  })

program
  .command('health')
  .description('Health check')
  .action(async () => {
    try {
      const response = await fetch(
        `http://${ENV.APP_DOMAIN}:${ENV.PORT}/health`,
      )

      process.exit(response.ok ? 0 : 1)
    } catch {
      process.exit(1)
    }
  })

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

await program.parseAsync(process.argv)
