export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatEntry extends ChatMessage {
  id: string
}

export type ChatStatus = 'idle' | 'loading' | 'error'

export const MAX_MESSAGE_LENGTH = 2000
