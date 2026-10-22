import type { ChatMessage } from './types'

// Temporary, local-only responder for the first UI milestone.
// The next milestone will replace this boundary with the conversation API.
export function requestDemoReply(
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<ChatMessage> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Request cancelled', 'AbortError'))
      return
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)

      if (messages.at(-1)?.content === '/error') {
        reject(new Error('Simulated demo failure'))
        return
      }

      resolve({
        role: 'assistant',
        content:
          'This is a simulated reply to demonstrate the chat interface. Gemini isn’t connected yet, so I can’t answer questions about Isaac’s portfolio. You can send another message, close and reopen the panel, or clear the conversation to try the controls.',
      })
    }, 1000)

    function cancel() {
      window.clearTimeout(timer)
      signal.removeEventListener('abort', cancel)
      reject(new DOMException('Request cancelled', 'AbortError'))
    }

    signal.addEventListener('abort', cancel, { once: true })
  })
}
