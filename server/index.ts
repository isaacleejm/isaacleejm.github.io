import { createApp } from './app.ts'

const host = '127.0.0.1'
const port = 3001

const server = createApp().listen(port, host, () => {
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
