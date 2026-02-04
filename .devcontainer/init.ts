import { spawn, spawnSync } from 'bun'

console.info('🚀 Starting dev container services...')

const migration = spawnSync(['bun', 'run', 'src/server.ts', 'migrate'], {
  stdout: 'inherit',
  stderr: 'inherit',
})

if (migration.exitCode !== 0) {
  console.error('❌ migration failed with code', migration.exitCode)
  process.exit(1)
}

const processes: ReturnType<typeof spawn>[] = []

// We run this concurrently as requested, though typically migrations run before server.
// Since the server handles 'watch', it might restart if migration changes files,
// but migrations usually just touch DB.
const commands: Record<string, string[]> = {
  server: ['bun', 'run', '--watch', 'src/server.ts'],
  studio: ['bun', 'run', 'db:studio', '--host', process.env.HOST || '0.0.0.0'],
}

for (const [name, cmd] of Object.entries(commands)) {
  console.info(`🔥 starting ${name} process...`)

  const proc = spawn(cmd, {
    stdout: 'inherit',
    stderr: 'inherit',
    onExit(_, exitCode) {
      if (exitCode !== 0) {
        console.error(`❌ ${name} failed with code ${exitCode}`)
      } else {
        console.info(`✅ ${name} completed successfully.`)
      }
    },
  })

  processes.push(proc)
}

const cleanup = (signal: NodeJS.Signals) => {
  console.info(`\nReceived ${signal}. 🛑 Stopping services...`)

  for (const proc of processes) {
    try {
      proc.kill(signal)
    } catch (e) {
      // Ignore errors if process is already dead
    }
  }

  process.exit(0)
}

process.on('SIGINT', () => cleanup('SIGINT'))
process.on('SIGTERM', () => cleanup('SIGTERM'))

// Keep the main process alive
setInterval(() => {}, 10_000)
