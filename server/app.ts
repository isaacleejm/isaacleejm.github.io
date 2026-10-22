import express from 'express'
import { ApiError, handleApiError } from './errors.ts'
import {
  generateDemoReply,
  parseChatRequest,
  type ReplyGenerator,
} from './chat.ts'
import type { ChatResponse } from '../shared/chat.ts'

// Creating the app does not open a port, so tests can manage their own server.
export function createApp(generateReply: ReplyGenerator = generateDemoReply) {
  const app = express()

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' })
  })

  app.post(
    '/api/chat',
    (request, _response, next) => {
      if (!request.is('application/json')) {
        next(
          new ApiError(
            415,
            'UNSUPPORTED_MEDIA_TYPE',
            'Use Content-Type: application/json.',
          ),
        )
        return
      }
      next()
    },
    express.json({ limit: '128kb' }),
    async (request, response) => {
      const { messages } = parseChatRequest(request.body)
      const content = await generateReply(messages)

      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('The reply generator returned no text.')
      }

      const body: ChatResponse = { reply: { role: 'assistant', content } }
      response.json(body)
    },
  )

  app.all('/api/chat', (_request, response, next) => {
    response.set('Allow', 'POST')
    next(new ApiError(405, 'METHOD_NOT_ALLOWED', 'Use POST for this endpoint.'))
  })

  app.use((_request, _response, next) => {
    next(new ApiError(404, 'NOT_FOUND', 'API route not found.'))
  })

  app.use(handleApiError)
  return app
}
