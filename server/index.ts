import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.ts'
import { readGeminiConfig, readServerConfig } from './config.ts'
import { createGeminiReplyGenerator } from './gemini.ts'

// Production never reads local files for configuration.
try {
  if (process.env.NODE_ENV?.trim() !== 'production') {
    loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url)))
  }
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
    console.error(
      'Could not load API configuration. Check the environment file permissions and format.',
    )
    process.exit(1)
  }
}

let config: ReturnType<typeof readServerConfig>
try {
  config = readServerConfig(process.env)
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Invalid server configuration.',
  )
  process.exit(1)
}
const { host, port } = config
const generateReply = createGeminiReplyGenerator(readGeminiConfig(process.env))

const server = createApp(generateReply, config).listen(port, host, () => {
  console.log(`Portfolio API: http://${host}:${port}`)
  console.log('Press Ctrl+C to stop the API.')
})

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? `Cannot start the API: ${host}:${port} is already in use.`
      : `Cannot start the API (${error.code ?? 'unknown error'}).`,
  )
  process.exitCode = 1
})

function shutdown() {
  console.log('Stopping the portfolio API…')
  server.close((error) => {
    if (error) {
      console.error('The API could not shut down cleanly.')
      process.exitCode = 1
    }
  })
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
