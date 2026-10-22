import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import type { RequestHandler } from 'express'
import type { ServerConfig } from './config.ts'
import { ApiError } from './errors.ts'

export const DEFAULT_CHAT_RATE_LIMITS = {
  windowMs: 10 * 60 * 1000,
  perIp: 10,
  global: 60,
}

export type ChatAppOptions = Partial<
  Pick<ServerConfig, 'production' | 'allowedOrigins' | 'trustProxyHops'>
> & {
  // Injectable limits keep tests quick without disabling production middleware.
  rateLimits?: typeof DEFAULT_CHAT_RATE_LIMITS
}

export function createChatTraffic(options: ChatAppOptions): RequestHandler[] {
  const handlers: RequestHandler[] = []
  const allowedOrigins = new Set(options.allowedOrigins)
  if (options.production && allowedOrigins.size === 0) {
    throw new Error('CHAT_ALLOWED_ORIGINS is required in production.')
  }

  if (allowedOrigins.size > 0) {
    handlers.push(
      cors({
        origin(origin, callback) {
          if (!origin) return callback(null, false)
          if (!allowedOrigins.has(origin)) {
            return callback(
              new ApiError(
                403,
                'ORIGIN_NOT_ALLOWED',
                'Chat is not available from this origin.',
              ),
            )
          }
          callback(null, true)
        },
        methods: ['POST'],
        allowedHeaders: ['Content-Type'],
        exposedHeaders: ['Retry-After', 'RateLimit', 'RateLimit-Policy'],
        credentials: false,
        optionsSuccessStatus: 204,
      }),
    )
  }

  if (options.production) {
    const limits = options.rateLimits ?? DEFAULT_CHAT_RATE_LIMITS
    const common = {
      windowMs: limits.windowMs,
      standardHeaders: 'draft-8' as const,
      legacyHeaders: false,
      skip: (request: Parameters<RequestHandler>[0]) =>
        request.method !== 'POST',
      handler: ((_request, _response, next) => {
        next(
          new ApiError(
            429,
            'RATE_LIMITED',
            'The assistant has reached its request limit. Try again later.',
          ),
        )
      }) satisfies RequestHandler,
    }
    handlers.push(
      rateLimit({ ...common, limit: limits.perIp, identifier: 'chat-ip' }),
      rateLimit({
        ...common,
        limit: limits.global,
        identifier: 'chat-process',
        keyGenerator: () => 'all-chat-requests',
      }),
    )
  }
  return handlers
}
