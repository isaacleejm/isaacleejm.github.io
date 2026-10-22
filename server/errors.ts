import type { ErrorRequestHandler } from 'express'
import type { ChatErrorCode, ChatErrorResponse } from '../shared/chat.ts'

export class ApiError extends Error {
  readonly status: number
  readonly code: ChatErrorCode

  constructor(status: number, code: ChatErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  const type =
    typeof error === 'object' && error !== null && 'type' in error
      ? error.type
      : undefined

  switch (type) {
    case 'entity.parse.failed':
      return new ApiError(
        400,
        'INVALID_REQUEST',
        'The request body must be valid JSON.',
      )
    case 'entity.too.large':
      return new ApiError(
        413,
        'PAYLOAD_TOO_LARGE',
        'The JSON request body must not exceed 128 KiB.',
      )
    case 'charset.unsupported':
    case 'encoding.unsupported':
      return new ApiError(
        415,
        'UNSUPPORTED_MEDIA_TYPE',
        'Use UTF-8 JSON with a supported content encoding.',
      )
    default:
      return new ApiError(
        500,
        'INTERNAL_ERROR',
        'An unexpected server error occurred.',
      )
  }
}

export const handleApiError: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error)
    return
  }

  const failure = normalizeError(error)
  const body: ChatErrorResponse = {
    error: { code: failure.code, message: failure.message },
  }
  response.status(failure.status).json(body)
}
