import {
  MAX_CHAT_MESSAGES,
  MAX_CONVERSATION_CHARACTERS,
  type ChatMessage,
  type ChatRequest,
} from '../../../shared/chat.ts'

export class ChatRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChatRequestError'
  }
}

function recentMessages(history: readonly ChatMessage[]): ChatMessage[] {
  let start = 0
  let characters = history.reduce(
    (total, message) => total + message.content.length,
    0,
  )

  // The hook supplies complete turns followed by the newest user message.
  // Drop whole turns so the request still begins and ends with a user.
  while (
    start + 2 < history.length &&
    (history.length - start > MAX_CHAT_MESSAGES ||
      characters > MAX_CONVERSATION_CHARACTERS)
  ) {
    characters -=
      history[start].content.length + history[start + 1].content.length
    start += 2
  }

  return history.slice(start).map(({ role, content }) => ({ role, content }))
}

function httpError(status: number): ChatRequestError {
  if (status === 503) {
    return new ChatRequestError(
      'The assistant is not configured yet. Please try again later.',
    )
  }
  if (status === 429) {
    return new ChatRequestError(
      'The assistant has reached its request or quota limit. Please try again later.',
    )
  }
  if (status === 504) {
    return new ChatRequestError(
      'The assistant took too long to reply. Retry your message.',
    )
  }
  if (status === 502) {
    return new ChatRequestError(
      'The assistant could not generate a reply. Retry your message.',
    )
  }
  if (status === 413) {
    return new ChatRequestError(
      'This conversation is too large. Clear the chat and try again.',
    )
  }
  if (status === 400) {
    return new ChatRequestError(
      'The chat server could not accept this conversation. Clear the chat and try again.',
    )
  }
  return new ChatRequestError(
    'The chat server could not reply. Check that the API is running, then retry.',
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function requestChatReply(
  history: readonly ChatMessage[],
  signal: AbortSignal,
): Promise<ChatMessage> {
  if (signal.aborted) throw new DOMException('Request cancelled', 'AbortError')

  const controller = new AbortController()
  const cancel = () => controller.abort()
  signal.addEventListener('abort', cancel, { once: true })
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, 30_000)

  try {
    const body: ChatRequest = { messages: recentMessages(history) }
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) throw httpError(response.status)

    const invalidReply = () =>
      new ChatRequestError(
        'The chat server returned an invalid reply. Try again.',
      )
    let data: unknown
    try {
      data = await response.json()
    } catch (error) {
      if (controller.signal.aborted) throw error
      throw invalidReply()
    }

    if (
      !isRecord(data) ||
      !isRecord(data.reply) ||
      data.reply.role !== 'assistant' ||
      typeof data.reply.content !== 'string' ||
      !data.reply.content.trim()
    ) {
      throw invalidReply()
    }

    return { role: 'assistant', content: data.reply.content }
  } catch (error) {
    if (signal.aborted)
      throw new DOMException('Request cancelled', 'AbortError')
    if (timedOut) {
      throw new ChatRequestError(
        'The chat server took too long to reply. Retry your message.',
      )
    }
    if (error instanceof ChatRequestError) throw error
    throw new ChatRequestError(
      'Could not reach the chat server. Check that the API is running, then retry.',
    )
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', cancel)
  }
}
