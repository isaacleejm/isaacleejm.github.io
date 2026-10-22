import {
  MAX_CHAT_MESSAGES,
  MAX_CONVERSATION_CHARACTERS,
  MAX_MESSAGE_LENGTH,
  type ChatMessage,
  type ChatRequest,
} from '../shared/chat.ts'
import { ApiError } from './errors.ts'

export type ReplyGenerator = (
  messages: readonly ChatMessage[],
) => Promise<string>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseChatRequest(value: unknown): ChatRequest {
  if (
    !isRecord(value) ||
    Object.keys(value).some((key) => key !== 'messages') ||
    !Array.isArray(value.messages) ||
    value.messages.length === 0
  ) {
    throw new ApiError(
      400,
      'INVALID_REQUEST',
      'Provide a nonempty messages array as the only request field.',
    )
  }

  if (value.messages.length > MAX_CHAT_MESSAGES) {
    throw new ApiError(
      413,
      'PAYLOAD_TOO_LARGE',
      `Provide at most ${MAX_CHAT_MESSAGES} messages.`,
    )
  }

  const messages: ChatMessage[] = []
  let totalCharacters = 0

  for (const [index, message] of value.messages.entries()) {
    if (
      !isRecord(message) ||
      Object.keys(message).some((key) => key !== 'role' && key !== 'content') ||
      (message.role !== 'user' && message.role !== 'assistant') ||
      typeof message.content !== 'string' ||
      message.content.trim().length === 0
    ) {
      throw new ApiError(
        400,
        'INVALID_REQUEST',
        `Message ${index + 1} must contain a user or assistant role and nonblank text content.`,
      )
    }

    const expectedRole = index % 2 === 0 ? 'user' : 'assistant'
    if (message.role !== expectedRole) {
      throw new ApiError(
        400,
        'INVALID_REQUEST',
        'Messages must alternate between user and assistant, beginning with user.',
      )
    }

    if (
      message.role === 'user' &&
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      throw new ApiError(
        413,
        'PAYLOAD_TOO_LARGE',
        `User messages must not exceed ${MAX_MESSAGE_LENGTH} characters.`,
      )
    }

    totalCharacters += message.content.length
    if (totalCharacters > MAX_CONVERSATION_CHARACTERS) {
      throw new ApiError(
        413,
        'PAYLOAD_TOO_LARGE',
        `Conversation content must not exceed ${MAX_CONVERSATION_CHARACTERS} characters.`,
      )
    }

    messages.push({ role: message.role, content: message.content })
  }

  if (messages.at(-1)?.role !== 'user') {
    throw new ApiError(
      400,
      'INVALID_REQUEST',
      'The last message must be from the user.',
    )
  }

  return { messages }
}
