import { useEffect, useRef, useState } from 'react'
import { requestDemoReply } from './chatClient'
import {
  MAX_MESSAGE_LENGTH,
  type ChatEntry,
  type ChatMessage,
  type ChatStatus,
} from './types'

export function useChat() {
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const nextMessageId = useRef(0)

  function createEntry(message: ChatMessage): ChatEntry {
    // These IDs are local React keys; a counter also works over LAN HTTP.
    nextMessageId.current += 1
    return { ...message, id: `message-${nextMessageId.current}` }
  }

  useEffect(() => {
    return () => {
      activeRequest.current?.abort()
      activeRequest.current = null
    }
  }, [])

  function requestReply(history: ChatEntry[]) {
    const controller = new AbortController()
    activeRequest.current = controller
    setStatus('loading')
    setError(null)

    void requestDemoReply(
      history.map(({ role, content }) => ({ role, content })),
      controller.signal,
    )
      .then((reply) => {
        if (activeRequest.current !== controller) return

        setMessages([...history, createEntry(reply)])
        setStatus('idle')
      })
      .catch(() => {
        if (activeRequest.current !== controller) return

        setError(
          'The demo reply failed. Retry your message, or clear the chat to start again.',
        )
        setStatus('error')
      })
      .finally(() => {
        if (activeRequest.current === controller) activeRequest.current = null
      })
  }

  function sendMessage(content: string) {
    const trimmed = content.trim()
    if (
      status !== 'idle' ||
      activeRequest.current ||
      !trimmed ||
      trimmed.length > MAX_MESSAGE_LENGTH
    ) {
      return false
    }

    const history: ChatEntry[] = [
      ...messages,
      createEntry({ role: 'user', content: trimmed }),
    ]
    setMessages(history)
    requestReply(history)
    return true
  }

  function retry() {
    if (status === 'error' && !activeRequest.current) requestReply(messages)
  }

  function clearChat() {
    activeRequest.current?.abort()
    activeRequest.current = null
    setMessages([])
    setStatus('idle')
    setError(null)
  }

  return { messages, status, error, sendMessage, retry, clearChat }
}
