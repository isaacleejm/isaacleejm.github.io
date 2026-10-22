export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatResponse {
  reply: {
    role: 'assistant'
    content: string
  }
}

export type ChatErrorCode =
  | 'INVALID_REQUEST'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'METHOD_NOT_ALLOWED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'CHAT_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_ERROR'
  | 'ORIGIN_NOT_ALLOWED'

export interface ChatErrorResponse {
  error: {
    code: ChatErrorCode
    message: string
  }
}

export const MAX_MESSAGE_LENGTH = 2000
export const MAX_CHAT_MESSAGES = 21
export const MAX_CONVERSATION_CHARACTERS = 20000
