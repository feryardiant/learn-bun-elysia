import { existsSync } from 'node:fs'
import { spawn } from 'bun'

console.info('🚀 Starting dev container services...')

// The `onCreateCommand` hook installs dependencies and applies migrations before
// touching the ready file, so wait for it before spawning anything that needs them.
async function waitForDependencies(
  readyFile: string,
  timeout: number,
  poll: number = 250,
) {
  if (existsSync(readyFile)) {
    console.info('✅ Dependencies already installed, starting services...')
    return
  }

  console.info('⏳ Waiting for dependencies to be installed...')

  const startedAt = Date.now()

  while (!existsSync(readyFile)) {
    if (Date.now() - startedAt >= timeout) {
      console.error(
        `❌ Dependencies were not installed within ${timeout / 1000}s.`,
      )

      process.exit(1)
    }

    await Bun.sleep(poll)
  }

  console.info('✅ Dependencies installed, starting services...')
}

await waitForDependencies('/tmp/devcontainer-ready', 5 * 60 * 1000)

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
    } catch {
      // Ignore errors if process is already dead
    }
  }

  process.exit(0)
}

process.on('SIGINT', () => cleanup('SIGINT'))
process.on('SIGTERM', () => cleanup('SIGTERM'))

// Keep the main process alive
setInterval(() => {}, 10_000)
